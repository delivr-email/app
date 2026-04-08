import chalk from "chalk";
import { getDelivrDir, isDelivrInitialized, execLive } from "../utils.js";
export function startCommand() {
    const dir = getDelivrDir();
    if (!isDelivrInitialized()) {
        console.error(chalk.red("Delivr is not initialized here. Run 'delivr init' first."));
        process.exit(1);
    }
    console.log(chalk.blue("Starting Delivr..."));
    execLive("docker compose up -d", { cwd: dir });
    console.log(chalk.green("Delivr is running."));
}
