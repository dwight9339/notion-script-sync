import fs from "fs";
import path from "path";
import envPaths from "env-paths";

export interface CoreConfig {
  notionApiKey?: string;
  openAiApiKey?: string;
  [key: string]: unknown;
}

const configPath = path.join(envPaths("sprongus").config, "config.json");

function ensureConfigFile(): void {
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }
}

function readConfig(): CoreConfig {
  ensureConfigFile();
  const raw = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(raw);
}

function writeConfig(updated: CoreConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
}

// Public API

export function setConfigValue(key: string, value: unknown): void {
  const config = readConfig();
  config[key] = value;
  writeConfig(config);
}

export function getConfigValue<T = unknown>(key: string): T | undefined {
  const config = readConfig();
  return config[key] as T | undefined;
}

export function unsetConfigValue(key: string): void {
  const config = readConfig();
  delete config[key];
  writeConfig(config);
}

export function listConfig(): CoreConfig {
  return readConfig();
}

export function getConfigFilePath(): string {
  return configPath;
}
