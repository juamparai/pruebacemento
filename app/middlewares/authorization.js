import JsonWebToken from "jsonwebtoken";
import dotenv from "dotenv"
import { methods as query } from "../models/usuarios.js";


function soloPublico(req,res,next){
    const islogged = checkCookie(req);
    if (!islogged) return next();
    return res.redirect("/")
}

function soloAdmin(req,res,next){
    const islogged = checkCookie(req);
    if (islogged) return next();
    return res.redirect("/")
}


function checkCookie(req){
    try {
        const cookies = req.headers.cookie ? req.headers.cookie.split("; ") : [];
        const cookieJWT = cookies.find(cookie => cookie.startsWith("jwt="));
        
        if (!cookieJWT) {
            console.log("No se encontró la cookie JWT.");
            return false;
        }

        const token = cookieJWT.slice(4); // Extrae el token JWT
        const decodified = JsonWebToken.verify(token, process.env.JWT_SECRET);

        if (!query.checkEmailExists(decodified.email)) {
            console.log("El usuario no existe.");
            return false;
        }

        return true;
    } catch (error) {
        console.log("Error en la validación del token:", error);
        return false;
    }
}

export const methods = {
    soloAdmin,
    soloPublico
}