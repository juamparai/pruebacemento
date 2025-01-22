import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Usar variables de entorno para contraseñas
  database: "cemento",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;