#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { logsCommand } from "./commands/logs.js";
import { stopCommand } from "./commands/stop.js";
import { startCommand } from "./commands/start.js";
import { updateCommand } from "./commands/update.js";
const program = new Command();
program
    .name("delivr")
    .description("Install and manage a Delivr email instance")
    .version("0.1.0");
program
    .command("init")
    .description("Initialize a new Delivr instance")
    .action(initCommand);
program
    .command("status")
    .description("Show status of Delivr services")
    .action(statusCommand);
program
    .command("logs")
    .description("Tail logs from all services")
    .action(logsCommand);
program
    .command("stop")
    .description("Stop all services")
    .action(stopCommand);
program
    .command("start")
    .description("Start all services")
    .action(startCommand);
program
    .command("update")
    .description("Pull latest app image and restart")
    .action(updateCommand);
program.parse();
