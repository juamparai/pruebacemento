import nodemailer from "nodemailer"
import dotenv from "dotenv"


const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port: 587,
    secure:false,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false, // Ignorar certificados no válidos
    },
})

export async function verificationMail(adressee){
    transporter.sendMail({
        from: "juamparai <juamparai@gmail.com>",
        to: adressee,
        subject: "Si esto te llega soy un capo",
        text: "puto el que lee"
    })
}