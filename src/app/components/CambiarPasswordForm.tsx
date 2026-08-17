'use client';

import { useState } from 'react';

export default function CambiarPasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [mensaje, setMensaje] = useState({ text: '', success: false });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ text: '', success: false });

        try {
            const res = await fetch('/api/cambiar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMensaje({ text: data.message, success: true });
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setMensaje({ text: data.message || 'Error al cambiar la contraseña', success: false });
            }
        } catch (error) {
            setMensaje({ text: 'Error de conexión con el servidor', success: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Cambiar Contraseña</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Actual
                    </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
            </form>

            {mensaje.text && (
                <div
                    className={`mt-4 p-3 text-sm rounded-md ${
                        mensaje.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                    {mensaje.text}
                </div>
            )}
        </div>
    );
}