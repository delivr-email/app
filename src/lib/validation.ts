import { z } from "zod";

export const sendEmailSchema = z
  .object({
    from: z.string().min(1, "from is required"),
    to: z.array(z.string().email()).min(1, "at least one recipient required"),
    subject: z.string().min(1, "subject is required"),
    html: z.string().optional(),
    text: z.string().optional(),
    replyTo: z.string().email().optional(),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.html || data.text, {
    message: "at least one of html or text is required",
  });

export type SendEmailPayload = z.infer<typeof sendEmailSchema>;
