import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "./db";
import { sendMail } from "./mailer";
import { EmailJobData } from "./queue";

const BACKOFF_DELAYS = [30_000, 120_000, 600_000]; // 30s, 2min, 10min

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { emailId, from, to, subject, html, text, replyTo, cc, bcc, headers } =
    job.data;

  await prisma.email.update({
    where: { id: emailId },
    data: { status: "sending" },
  });

  try {
    await sendMail({ from, to, subject, html, text, replyTo, cc, bcc, headers });

    await prisma.email.update({
      where: { id: emailId },
      data: { status: "sent", sentAt: new Date() },
    });
  } catch (error) {
    const attemptsLeft = (job.opts.attempts ?? 3) - job.attemptsMade - 1;

    if (attemptsLeft <= 0) {
      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          failedAt: new Date(),
        },
      });
    } else {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "queued" },
      });
    }

    throw error;
  }
}

export function startWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>("email-sending", processEmailJob, {
    connection,
    concurrency: 5,
    settings: {
      backoffStrategy: (attemptsMade: number) => {
        return BACKOFF_DELAYS[attemptsMade - 1] || 600_000;
      },
    },
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed: ${err.message}`);
  });

  worker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed (email: ${job.data.emailId})`);
  });

  return worker;
}
