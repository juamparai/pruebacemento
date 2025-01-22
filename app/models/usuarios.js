import pool from "../config/database.js"

export const addUsuario = async (username, email, password) => {
    const [result] = await pool.query("INSERT INTO usuarios (username, email, password) VALUES (?, ?,?)", [username, email, password]);
    return result.insertId; // Devuelve el ID del nuevo usuario
  }

export const checkUserExists = async (email) => {
    const [result] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return result.length > 0
}

export const getUserPassword = async (email) => {
  const [result] = await pool.query("SELECT password FROM usuarios WHERE email = ?", [email]);
  
  // Verifica si se encontró un usuario
  if (result.length === 0) {
    return null; // Devuelve null si no hay resultados
  }
  
  return result[0].password; // Devuelve solo la contraseña
};