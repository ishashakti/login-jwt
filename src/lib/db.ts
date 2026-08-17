import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL (por defecto es root en XAMPP/Laragon)
    password: '',      // Tu contraseña de MySQL (déjala vacía si no tienes)
    database: 'login', // Reemplaza esto con el nombre real de tu base de datos en phpMyAdmin
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});