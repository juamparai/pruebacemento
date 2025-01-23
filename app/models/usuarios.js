import pool from "../config/database.js"

const addUsuario = async (username, email, password) => {
    const [result] = await pool.query("INSERT INTO usuarios (username, email, password) VALUES (?, ?,?)", [username, email, password]);
    return result.insertId; // Devuelve el ID del nuevo usuario
  }

const checkEmailExists = async (email) => {
    const [result] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return result.length > 0
}

const getUserData = async (email) => {
  const [rows] = await pool.query("SELECT password, verificado FROM usuarios WHERE email = ?", [email]);

  // Verifica si se encontró un usuario
  if (rows.length === 0) {
    return null; // Devuelve null si no hay resultados
  }
  
  return {
    password: rows[0].password,
    verificado: rows[0].verificado
  };  
};

const verifyEmailDB = async (email) => {
  const [result] = await pool.query(
    "UPDATE usuarios SET verificado = true WHERE email = ?", [email]);
  return result; 
}

export const methods = {
  addUsuario,
  checkEmailExists,
  getUserData,
  verifyEmailDB
}