import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM usuarios WHERE username = ? AND password = ?',
            [username, hashedPassword]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Usuario o contraseña incorrectos' },
                { status: 401 }
            );
        }

        const user = rows[0];

        // 1. CREAR EL TOKEN JWT (expira en 1 hora por ejemplo)
        const token = jwt.sign(
            { id: user.id, username: user.username, name: user.name },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 2. PREPARAR LA RESPUESTA CON UNA COOKIE SEGURA
        const response = NextResponse.json({
            success: true,
            message: '¡Login exitoso!',
            user: { id: user.id, username: user.username, name: user.name }
        });

        // Guardamos el token en una Cookie que el navegador maneja automáticamente
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true, // No accesible desde JavaScript (protege contra ataques XSS)
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            path: '/',
            maxAge: 60 * 60, // 1 hora en segundos
        });

        return response;

    } catch (error) {
        console.error('Error en el login:', error);
        return NextResponse.json(
            { success: false, message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}