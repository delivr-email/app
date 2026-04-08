import chalk from "chalk";
import { getDelivrDir, isDelivrInitialized, execLive } from "../utils.js";

export function updateCommand(): void {
  const dir = getDelivrDir();

  if (!isDelivrInitialized()) {
    console.error(
      chalk.red("Delivr is not initialized here. Run 'delivr init' first.")
    );
    process.exit(1);
  }

  console.log(chalk.blue("Pulling latest images..."));
  execLive("docker compose pull app", { cwd: dir });

  console.log(chalk.blue("Restarting with new image..."));
  execLive("docker compose up -d", { cwd: dir });

  console.log(chalk.green("Delivr updated."));
}
