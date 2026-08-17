'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CambiarPasswordForm from "@/app/components/CambiarPasswordForm";

export default function DashboardPage() {
    const [user, setUser] = useState<{ id: string | number; username: string; name: string } | null>(null);    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Le preguntamos al backend si la cookie del token es válida
        async function verificarSesion() {
            try {
                const res = await fetch('/api/verificar');
                const data = await res.json();

                if (data.success) {
                    setUser(data.user); // Guardamos los datos del usuario decodificados del JWT
                } else {
                    router.push('/login');
                }
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }

        verificarSesion();
    }, [router]);

    if (loading) {
        return <p className="p-8 text-white">Validando sesión...</p>;
    }

    if (!user) return null;

    return (
        <main className="p-8 text-white">
            <h1 className="text-2xl font-bold">Bienvenido al Panel (Seguro con JWT)</h1>
            <p>Hola, {user.username}. Has entrado correctamente mediante tu Cookie HTTP-only.</p>
            <CambiarPasswordForm/>
            <button
                onClick={async () => {
                    // Llamamos a la API de logout para borrar la cookie
                    await fetch('/api/logout', { method: 'POST' });
                    router.push('/login');
                }}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
                Cerrar Sesión
            </button>
        </main>
    );
}