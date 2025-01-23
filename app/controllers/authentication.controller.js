import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken"
import pool from "../config/database.js"
import { verificationMail } from "../services/mail.js";
import { methods as query } from "../models/usuarios.js";

async function login(req, res) {
    console.log(req.body);
    
    const { email, password } = req.body;

    // Verificar que los campos no estén vacíos
    if (!email || !password) {
        return res.status(400).send({ status: "Error", message: "Los campos están incompletos" });
    }

    // Verificar si el email existe
    const usuarioAResvisar = await query.checkEmailExists(email);
    if (!usuarioAResvisar) {
        return res.status(400).send({ status: "Error", message: "Email no registrado" });
    }

    // Comparar la contraseña proporcionada con la almacenada
    const userData = await query.getUserData(email);
    const loginCorrecto = await bcryptjs.compare(password, userData.password)
    if (!userData.verificado){
      return res.status(400).send({ status: "Error", message: "Debe verificar la cuenta" });
    }
    if (!loginCorrecto ) {
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
    const usuarioExistente = await query.checkEmailExists(email);
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
        // Primero, intentamos enviar el correo de verificación
        const verificationToken = jsonwebtoken.sign(
            { email: nuevoUsuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );
    
        const sendVerificationMail = await verificationMail(nuevoUsuario.email, verificationToken); // Envía el correo
        console.log("Correo enviado con éxito:", sendVerificationMail);
    
        // Si el correo se envió correctamente, agregamos el usuario a la base de datos
        await query.addUsuario(nuevoUsuario.user, nuevoUsuario.email, nuevoUsuario.password);
        
        return res.status(201).send({ status: "Success", message: "Usuario registrado correctamente" });
    } catch (error) {
        // Si ocurrió un error, mostramos el mensaje correspondiente
        console.error("Error:", error.message);
        return res.status(500).send({ status: "Error", message: error.message });
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

async function verifyAccount(req, res) {
    try {
      // Verifica si el token está presente
      if (!req.params.token) {
        console.log("no hay token")
        return res.redirect("/"); // Redirige si no hay token
      }
  
      let decodedToken;
      try {
        decodedToken = jsonwebtoken.verify(req.params.token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(400).send({ status: "error", message: "Token no válido o expirado" });
      }
  
      // Verifica si la decodificación fue exitosa y si el email está presente
      if (!decodedToken || !decodedToken.email) {
        console.log("no tiene email")
        return res.status(400).send({ status: "error", message: "Error en el token" });
      }
  
      // Verifica si el usuario con el email existe en la base de datos
      const user = await query.checkEmailExists(decodedToken.email);
      if (!user) {
        console.log("no encontre usuario")
        return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
      }
  
      // Llama a la función para verificar el email y actualizar el estado de verificación
      await query.verifyEmailDB(decodedToken.email);
  
      // Crea un nuevo token para el usuario
      const token = jsonwebtoken.sign(
        { email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
  
      // Opciones para la cookie
      const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        path: "/",
        secure: process.env.NODE_ENV === 'production', // Solo en producción
      };
  
      // Configura la cookie JWT
      res.cookie("jwt", token, cookieOptions);
  
      // Redirige al admin tras verificar
      return res.redirect("/admin");
  
    } catch (error) {
      // Maneja cualquier error durante la verificación
      console.error("Error al verificar cuenta:", error);
      return res.status(500).send({ status: "error", message: "Hubo un problema al verificar la cuenta" });
    }
  } 
export const methods = {
    login,
    register,
    logout,
    verifyAccount,
}