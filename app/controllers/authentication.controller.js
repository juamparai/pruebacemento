import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken"
import { addUsuario } from "../models/usuarios.js";
import pool from "../config/database.js"
import { verificationMail } from "../services/mail.js";
import { getUserPassword } from "../models/usuarios.js";

async function login(req, res) {
    console.log(req.body);
    
    const { email, password } = req.body;

    // Verificar que los campos no estén vacíos
    if (!email || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    // Verificar si el email existe
    const usuarioAResvisar = await checkIfEmailExists(email);
    if (!usuarioAResvisar) {
        return res.status(400).send({ status: "Error", message: "Email no registrado" });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const hashedPassword = await getUserPassword(email);
    const loginCorrecto = await bcryptjs.compare(password, hashedPassword);
    if (!loginCorrecto) {
        return res.status(400).send({ status: "Error", message: "Contraseña incorrecta" });
    }

    // Generar el token JWT
    const token = jsonwebtoken.sign(
        { user: usuarioAResvisar.user },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Configurar la cookie del token
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true, // Recomendado para seguridad
        path: "/"
    };

    // Enviar la cookie con el token
    res.cookie("jwt", token, cookieOption);
    res.send({ status: "ok", message: "Usuario loggeado", redirect: "/admin" });
}




// Registro de usuario
export async function register(req, res) {
    const { user, password, email } = req.body;

    if (!user || !password || !email) {
        return res.status(400).send({ status: "Error", message: "Completar los campos" });
    }

    // Verificación de email duplicado (esto también puede estar en el modelo)
    const usuarioExistente = await checkIfEmailExists(email);
    if (usuarioExistente) {
        return res.status(400).send({ status: "Error", message: "El email ya está registrado" });
    }

    // Encriptación de la contraseña
    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const nuevoUsuario = {
        user,
        email,
        password: hashPassword
    };

    try {
        // Intentamos agregar al usuario en la base de datos
        await addUsuario(nuevoUsuario.user, nuevoUsuario.email, nuevoUsuario.password);
        
        try {
            const sendVerificationMail = await verificationMail(email); // Ahora te devolverá la respuesta de sendMail
            console.log("Correo enviado con éxito:", sendVerificationMail);
        } catch (error) {
            console.error("Hubo un error al enviar el correo:", error);
        }
        return res.status(201).send({ status: "Success", message: "Usuario registrado correctamente" });
    } catch (error) {
        // En caso de error en la base de datos
        console.error('Error al agregar el usuario:', error.message);
        return res.status(500).send({ status: "Error", message: "Error al registrar el usuario" });
    }
}

// Función que verifica si el email ya existe
async function checkIfEmailExists(email) {
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows.length > 0;
    } catch (error) {
        console.error('Error al verificar email:', error.message);
        return false;
    }
}

async function logout(req, res) {
    console.log('Iniciando proceso de logout...');
    
    // Elimina la cookie JWT
    res.cookie("jwt", "", {
        expires: new Date(0), // Establece la cookie con una fecha de expiración en el pasado
        httpOnly: true,       // Hace que no sea accesible desde JavaScript
        path: "/"             // Asegura que la cookie se elimine en el mismo path donde fue configurada
    });

    // Envia la respuesta al cliente
    res.send({ status: "ok", message: "Usuario desloggeado" });
}

export const methods = {
    login,
    register,
    logout,
}