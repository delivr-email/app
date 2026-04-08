import inquirer from "inquirer";

export type Mode = "local" | "production";

export interface InitAnswers {
  mode: Mode;
  apiPort: number;
  domain?: string;
  smtpPort?: number;
}

export async function askInitQuestions(): Promise<InitAnswers> {
  const { mode } = await inquirer.prompt<{ mode: Mode }>([
    {
      type: "list",
      name: "mode",
      message: "Mode:",
      choices: [
        { name: "Local (development with Mailhog)", value: "local" },
        { name: "Production (Postfix + OpenDKIM)", value: "production" },
      ],
    },
  ]);

  const { apiPort } = await inquirer.prompt<{ apiPort: number }>([
    {
      type: "number",
      name: "apiPort",
      message: "Port for the API:",
      default: 3000,
    },
  ]);

  if (mode === "production") {
    const { domain, smtpPort } = await inquirer.prompt<{
      domain: string;
      smtpPort: number;
    }>([
      {
        type: "input",
        name: "domain",
        message: "Domain name:",
        validate: (v: string) =>
          v.includes(".") || "Enter a valid domain (e.g. mail.example.com)",
      },
      {
        type: "number",
        name: "smtpPort",
        message: "SMTP port:",
        default: 25,
      },
    ]);

    return { mode, apiPort, domain, smtpPort };
  }

  return { mode, apiPort };
}
