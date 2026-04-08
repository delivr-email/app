import inquirer from "inquirer";
export async function askInitQuestions() {
    const { mode } = await inquirer.prompt([
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
    const { apiPort } = await inquirer.prompt([
        {
            type: "number",
            name: "apiPort",
            message: "Port for the API:",
            default: 3000,
        },
    ]);
    if (mode === "production") {
        const { domain, smtpPort } = await inquirer.prompt([
            {
                type: "input",
                name: "domain",
                message: "Domain name:",
                validate: (v) => v.includes(".") || "Enter a valid domain (e.g. mail.example.com)",
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
