import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";
export function exec(command, options) {
    return execSync(command, {
        encoding: "utf-8",
        stdio: "pipe",
        ...options,
    }).trim();
}
export function execLive(command, options) {
    execSync(command, {
        stdio: "inherit",
        ...options,
    });
}
export function isDockerRunning() {
    try {
        exec("docker info");
        return true;
    }
    catch {
        return false;
    }
}
export function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once("error", () => resolve(false));
        server.once("listening", () => {
            server.close();
            resolve(true);
        });
        server.listen(port, "127.0.0.1");
    });
}
export function getDelivrDir(cwd = process.cwd()) {
    return resolve(cwd, "delivr");
}
export function isDelivrInitialized(cwd) {
    const dir = getDelivrDir(cwd);
    return (existsSync(resolve(dir, "docker-compose.yml")) &&
        existsSync(resolve(dir, ".env")));
}
export function generatePassword(length = 32) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
