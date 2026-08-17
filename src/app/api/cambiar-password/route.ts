import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal';

export async function POST(req: Request) {
    try {
        const { currentPassword, newPassword } = await req.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
        }

        // 1. Decodificar el usuario del token
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // 2. Generar el hash MD5 de la contraseña actual para compararla
        const hashedCurrentPassword = crypto.createHash('md5').update(currentPassword).digest('hex');

        // 3. Verificar la contraseña actual en la base de datos usando tu pool
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT password FROM usuarios WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
        }

        const storedHash = rows[0].password;
        if (storedHash !== hashedCurrentPassword) {
            return NextResponse.json({ success: false, message: 'Contraseña actual incorrecta' }, { status: 400 });
        }

        // 4. Generar el hash de la nueva contraseña y actualizarla
        const hashedNewPassword = crypto.createHash('md5').update(newPassword).digest('hex');

        await pool.execute(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        return NextResponse.json({ success: true, message: 'Contraseña actualizada con éxito' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
    }
}