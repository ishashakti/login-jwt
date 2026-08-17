import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_temporal';

export async function GET() {
    try {
        // Obtenemos la cookie 'token' de forma segura en el servidor
        const cookieStore =await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'No hay token' }, { status: 401 });
        }

        // Verificamos si el token es válido y no ha expirado
        const decoded = jwt.verify(token, JWT_SECRET);

        return NextResponse.json({ success: true, user: decoded });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Token inválido o expirado' }, { status: 401 });
    }
}