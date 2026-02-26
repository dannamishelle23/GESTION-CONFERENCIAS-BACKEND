import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.HOST_MAILTRAP,
    port: process.env.PORT_MAILTRAP,
    auth: {
    user: process.env.USER_MAILTRAP,
    pass: process.env.PASS_MAILTRAP,
    },
})

/**
 * Función genérica para enviar correos
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML del correo
 */
const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"GESTION CONFERENCIAS" <admin-user@noreply.com.ec>',
            to,
            subject,
            html,
        })
        console.log("Email enviado con éxito a:", info.messageId)
        return info

    } catch (error) {
        console.error("Error enviando email:", error.message)
        throw error
    }
}

export default sendMail
