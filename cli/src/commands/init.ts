import chalk from "chalk";
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isDockerRunning,
  isPortAvailable,
  getDelivrDir,
  isDelivrInitialized,
  execLive,
  generatePassword,
  exec,
} from "../utils.js";
import { askInitQuestions, type InitAnswers } from "../prompts.js";

function getTemplatesDir(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return resolve(__dirname, "..", "templates");
}

function renderTemplate(
  templatePath: string,
  vars: Record<string, string>
): string {
  let content = readFileSync(templatePath, "utf-8");
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

async function checkPrerequisites(apiPort: number): Promise<void> {
  if (!isDockerRunning()) {
    console.error(
      chalk.red(
        "Docker is not running. Install it from https://docs.docker.com/get-docker/"
      )
    );
    process.exit(1);
  }

  const portsToCheck = [apiPort, 5432, 6379];
  for (const port of portsToCheck) {
    if (!(await isPortAvailable(port))) {
      console.warn(
        chalk.yellow(`Warning: port ${port} is already in use.`)
      );
    }
  }
}

function generateFiles(dir: string, answers: InitAnswers): void {
  const templatesDir = getTemplatesDir();
  const composeTemplate =
    answers.mode === "local"
      ? "docker-compose.local.yml"
      : "docker-compose.prod.yml";
  const envTemplate =
    answers.mode === "local" ? "env.local.template" : "env.prod.template";

  mkdirSync(resolve(dir, "data"), { recursive: true });

  const vars: Record<string, string> = {
    apiPort: String(answers.apiPort),
  };

  if (answers.mode === "production") {
    vars.domain = answers.domain!;
    vars.smtpPort = String(answers.smtpPort!);
    vars.postgresPassword = generatePassword();
  }

  copyFileSync(
    resolve(templatesDir, composeTemplate),
    resolve(dir, "docker-compose.yml")
  );

  const envContent = renderTemplate(resolve(templatesDir, envTemplate), vars);
  writeFileSync(resolve(dir, ".env"), envContent);
}

function launchStack(dir: string): void {
  console.log(chalk.blue("\nStarting services..."));
  execLive("docker compose up -d", { cwd: dir });

  console.log(chalk.blue("\nWaiting for database to be ready..."));
  execLive(
    "docker compose exec migrate sh -c 'echo Database migrated'",
    { cwd: dir }
  );
}

function printLocalSummary(apiPort: number): void {
  console.log(
    chalk.green(`
Done! Delivr is running.

  API:      http://localhost:${apiPort}/api/emails
  Mailhog:  http://localhost:8025

  Try it:
  curl -X POST http://localhost:${apiPort}/api/emails \\
    -H "Content-Type: application/json" \\
    -d '{"from":"test@local.dev","to":["you@test.com"],"subject":"Hello","text":"It works!"}'
`)
  );
}

function printProdSummary(
  apiPort: number,
  domain: string
): void {
  let serverIp: string;
  try {
    serverIp = exec("curl -s ifconfig.me").trim();
  } catch {
    serverIp = "<SERVER_IP>";
  }

  console.log(
    chalk.green(`
Done! Delivr is running.

  API: http://${domain}:${apiPort}/api/emails
`)
  );

  console.log(
    chalk.yellow(`  Manual steps required:

  1. Configure DNS records:
     TXT  @                -> v=spf1 ip4:${serverIp} -all
     TXT  mail._domainkey  -> v=DKIM1; k=rsa; p=<DKIM_KEY>
     TXT  _dmarc           -> v=DMARC1; p=quarantine;
     A    mail             -> ${serverIp}
     PTR  ${serverIp}      -> ${domain} (set via hosting provider)

  2. Get your DKIM public key:
     docker compose -f delivr/docker-compose.yml exec postfix cat /etc/opendkim/keys/default.txt

  3. Test your setup:
     curl -X POST http://${domain}:${apiPort}/api/emails \\
       -H "Content-Type: application/json" \\
       -d '{"from":"test@${domain}","to":["you@test.com"],"subject":"Hello","text":"It works!"}'
`)
  );
}

export async function initCommand(): Promise<void> {
  console.log(chalk.bold("\n  Welcome to Delivr\n"));

  const dir = getDelivrDir();

  if (isDelivrInitialized()) {
    console.error(
      chalk.red(
        "Delivr is already initialized in this directory. Use 'delivr start' to start it."
      )
    );
    process.exit(1);
  }

  const answers = await askInitQuestions();

  await checkPrerequisites(answers.apiPort);

  console.log(chalk.blue("\nGenerating configuration..."));
  generateFiles(dir, answers);

  launchStack(dir);

  if (answers.mode === "local") {
    printLocalSummary(answers.apiPort);
  } else {
    printProdSummary(answers.apiPort, answers.domain!);
  }
}
