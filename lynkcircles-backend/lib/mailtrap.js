import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN; // Your Mailtrap API token

const mailtrapClient = new MailtrapClient({
    token: TOKEN,
    });

const sender = { 
    email: process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME,
};

export { mailtrapClient, sender };
