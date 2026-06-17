import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

let transporter;

const configureTransporter = async () => {
    if (
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    ) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        logger.info("Email service: Transporter configured with SMTP credentials.");
    } else {
        logger.warn(
            "Email service: SMTP environment variables are missing. Emails will be logged to the console/files."
        );
    }
};

configureTransporter().catch(err => {
    logger.error("Email service configuration error: " + err.message);
});

async function sendMail({ to, subject, text, html }) {
    const from = process.env.SMTP_FROM || "noreply@rhythmcloud.com";

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from,
                to,
                subject,
                text,
                html,
            });
            logger.info(`Email sent successfully to ${to}. ID: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Error sending email to ${to}: ${error.message}`);
            throw error;
        }
    } else {
        logger.info(`
============================================================
[MOCK EMAIL SENT]
To: ${to}
Subject: ${subject}
------------------------------------------------------------
Text Content:
${text}
============================================================
        `);
        return { messageId: "mock-id-console-logged" };
    }
}

export { sendMail };
