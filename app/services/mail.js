import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,  // Cambia al puerto seguro
    secure: true,  // Usa TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false, // Ignorar certificados no válidos (solo en entornos controlados)
    },
});

export async function verificationMail(adressee, token) {
    try {
        const info = await transporter.sendMail({
            from: "juamparai <juamparai@gmail.com>",
            to: adressee,
            subject: "Si esto te llega soy un capo",
            html: createEmailText(token),
        });
        console.log("Correo enviado con éxito:", info.response);
        return info;
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw new Error("Error al enviar el correo");
    }
}

function createEmailText(token){
    return `
    <!DOCTYPE html>
  <html lang="es">
    <style>
      html{
        background-color: white;
      }
      body{
        max-width: 600px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: auto;
        background-color: rgb(229, 255, 246);
        padding: 40px;
        border-radius: 4px;
        margin-top: 10px;
      }
    </style>
  <body>
    <h1>Verificación de correo electrónico - puntoJson.com</h1>
    <p>Se ha creado una cuenta en puntoJson.com con este correo electrónico.</p>
      <p>Si esta cuenta no fue creada por usted, desestime este correo.</p>
      <p></p>Si usted creó la cuenta, entonces verifique la cuenta <a href="http://localhost:4000/verificar/${token}" target="_blank" rel="noopener noreferrer">haciendo click aquí</a>.</p>
      <p><strong>Calo</strong></p>
      <p>CEO PuntoJson.</p>
  </body>
  </html>
    `
  }