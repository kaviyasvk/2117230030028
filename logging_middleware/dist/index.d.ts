type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
export declare function Log(stack: Stack, level: Level, package_name: string, message: string): Promise<void>;
export {};
