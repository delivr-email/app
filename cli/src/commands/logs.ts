import chalk from "chalk";
import { getDelivrDir, isDelivrInitialized, execLive } from "../utils.js";

export function logsCommand(): void {
  const dir = getDelivrDir();

  if (!isDelivrInitialized()) {
    console.error(
      chalk.red("Delivr is not initialized here. Run 'delivr init' first.")
    );
    process.exit(1);
  }

  execLive("docker compose logs -f", { cwd: dir });
}
