import { ExecSyncOptions } from "node:child_process";
export declare function exec(command: string, options?: ExecSyncOptions): string;
export declare function execLive(command: string, options?: ExecSyncOptions): void;
export declare function isDockerRunning(): boolean;
export declare function isPortAvailable(port: number): Promise<boolean>;
export declare function getDelivrDir(cwd?: string): string;
export declare function isDelivrInitialized(cwd?: string): boolean;
export declare function generatePassword(length?: number): string;
