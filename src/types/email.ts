export type EmailStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed";

export interface SendEmailInput {
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

export interface EmailResponse {
  id: string;
  status: EmailStatus;
}
