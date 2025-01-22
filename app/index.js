import express  from "express";
import cookieParser from "cookie-parser";
import path from 'path';
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { methods as authentication} from "./controllers/authentication.controller.js"
import {methods as authorization } from "./middlewares/authorization.js"

//Server
const app = express();
app.set("port",4000);
app.listen(app.get("port"), () => {
    console.log(`Server running on http://localhost:${app.get("port")}`);
  });

//Configuracion
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cookieParser())
dotenv.config();

//Rutas
app.get("/", (req, res)=> res.sendFile(__dirname + "/pages/home.html"));
app.get("/login", authorization.soloPublico, (req, res)=> res.sendFile(__dirname + "/pages/login.html"));
app.get("/register",authorization.soloPublico, (req, res)=> res.sendFile(__dirname + "/pages/register.html"));
app.get("/admin",authorization.soloAdmin, (req, res)=> res.sendFile(__dirname + "/pages/admin.html"));

app.post("/api/register", authentication.register);
app.post("/api/login",authentication.login);
app.post("/api/logout",authentication.logout);
