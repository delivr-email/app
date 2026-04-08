import { execSync, type ExecSyncOptions } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";

export function exec(
  command: string,
  options?: ExecSyncOptions
): string {
  return execSync(command, {
    encoding: "utf-8",
    stdio: "pipe",
    ...options,
  }) as string;
}

export function execLive(
  command: string,
  options?: ExecSyncOptions
): void {
  execSync(command, {
    stdio: "inherit",
    ...options,
  });
}

export function isDockerRunning(): boolean {
  try {
    exec("docker info");
    return true;
  } catch {
    return false;
  }
}

export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const server = net.createServer();
    server.once("error", () => resolvePromise(false));
    server.once("listening", () => {
      server.close();
      resolvePromise(true);
    });
    server.listen(port, "127.0.0.1");
  });
}

export function getDelivrDir(cwd: string = process.cwd()): string {
  return resolve(cwd, "delivr");
}

export function isDelivrInitialized(cwd?: string): boolean {
  const dir = getDelivrDir(cwd);
  return (
    existsSync(resolve(dir, "docker-compose.yml")) &&
    existsSync(resolve(dir, ".env"))
  );
}

export function generatePassword(length: number = 32): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
