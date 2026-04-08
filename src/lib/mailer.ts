import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

export interface SendMailOptions {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
}

export async function sendMail(options: SendMailOptions): Promise<string> {
  const info = await transporter.sendMail({
    from: options.from,
    to: options.to.join(", "),
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
    cc: options.cc?.join(", "),
    bcc: options.bcc?.join(", "),
    headers: options.headers,
  });

  return info.messageId;
}
