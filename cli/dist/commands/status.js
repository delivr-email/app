import chalk from "chalk";
import { getDelivrDir, isDelivrInitialized, exec } from "../utils.js";
function getServiceStatuses(dir) {
    const output = exec('docker compose ps --format json', { cwd: dir });
    if (!output)
        return [];
    return output
        .split("\n")
        .filter(Boolean)
        .map((line) => {
        const svc = JSON.parse(line);
        return {
            name: svc.Service,
            state: svc.State,
            health: svc.Health || "-",
        };
    });
}
export function statusCommand() {
    const dir = getDelivrDir();
    if (!isDelivrInitialized()) {
        console.error(chalk.red("Delivr is not initialized here. Run 'delivr init' first."));
        process.exit(1);
    }
    const services = getServiceStatuses(dir);
    if (services.length === 0) {
        console.log(chalk.yellow("No services running. Run 'delivr start'."));
        return;
    }
    console.log(chalk.bold("\n  Delivr Status\n"));
    for (const svc of services) {
        const icon = svc.state === "running" ? chalk.green("●") : chalk.red("●");
        console.log(`  ${icon} ${svc.name.padEnd(12)} ${svc.state} (${svc.health})`);
    }
    console.log();
}
