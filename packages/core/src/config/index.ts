import fs from "fs/promises";
import path from "path";
import envPaths from "env-paths";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import deepmerge from "deepmerge";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* 1.  Types & Schema                                                 */
/* ------------------------------------------------------------------ */

export interface ProviderProfile<T extends Record<string, unknown> = any> {
  id: string;               // "notion", "obsidian", etc.
  type: string;             // e.g. "notion"
  config: T;                // provider-specific stuff
}

export type NonEmptyArray<T> = [T, ...T[]];

export interface ScriptStructureLevel {
  id: string;
  label: string;
  data?: unknown;
}

export interface ScriptStructurePreset {
  id: string;
  label: string;
  levels: NonEmptyArray<ScriptStructureLevel>;
}

const ProviderProfileSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.unknown()),
});

const ScriptStructurePresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  levels: z
    .array(z.object({ label: z.string(), data: z.unknown().optional() }))
    .nonempty(),
});

const CoreConfigSchema = z
  .object({
    version: z.literal(1).default(1),
    providers: z.record(ProviderProfileSchema).default({}),
    scriptStructurePresets: z.array(ScriptStructurePresetSchema).default([]),
    schemaPresetsPath: z.string().optional(),
  })
  .strict();

export type CoreConfig = z.infer<typeof CoreConfigSchema>;

/* ------------------------------------------------------------------ */
/* 2.  File location helpers                                          */
/* ------------------------------------------------------------------ */

function getConfigDir(): string {
  return process.env.SPRONGUS_CONFIG_DIR ??
    envPaths("sprongus", { suffix: "" }).config;
}

function getConfigPath(): string {
  return path.join(getConfigDir(), "config.json");
}

// update all call-sites ↓↓↓
async function ensureConfigFile(): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });
  try {
    await fs.access(getConfigPath());
  } catch {
    const initial: CoreConfig = CoreConfigSchema.parse({});
    await atomicWriteFile(getConfigPath(), JSON.stringify(initial, null, 2));
  }
}

async function readConfig(): Promise<CoreConfig> {
  await ensureConfigFile();
  const raw = await fs.readFile(getConfigPath(), "utf-8");
  return CoreConfigSchema.parse(JSON.parse(raw));
}

async function writeConfig(data: CoreConfig): Promise<void> {
  const validated = CoreConfigSchema.parse(data);
  await atomicWriteFile(getConfigPath(), JSON.stringify(validated, null, 2));
}

/* ------------------------------------------------------------------ */
/* 4.  Public API                                                     */
/* ------------------------------------------------------------------ */

export async function getConfig(): Promise<CoreConfig> {
  return readConfig();
}

export async function setConfigValue(
  pathSegments: string | string[],
  value: unknown,
): Promise<void> {
  const keyPath = Array.isArray(pathSegments) ? pathSegments : pathSegments.split(".");
  const cfg = await readConfig();

  const updated = deepmerge(cfg, buildNestedObject(keyPath, value));
  await writeConfig(updated);
}

export async function unsetConfigValue(
  pathSegments: string | string[],
): Promise<void> {
  const keyPath = Array.isArray(pathSegments) ? pathSegments : pathSegments.split(".");
  const cfg = await readConfig();
  removeNestedKey(cfg as any, keyPath);
  await writeConfig(cfg);
}

export async function addProvider(profile: ProviderProfile): Promise<void> {
  const cfg = await readConfig();
  cfg.providers[profile.id] = profile;
  await writeConfig(cfg);
}

export async function addScriptPreset(
  preset: ScriptStructurePreset,
): Promise<void> {
  const cfg = await readConfig();

  if (cfg.scriptStructurePresets.some(p => p.id === preset.id)) {
    throw new Error(`Duplicate scriptStructurePreset id "${preset.id}"`);
  }

  cfg.scriptStructurePresets.push(preset);
  await writeConfig(cfg);
}

export function getConfigFilePath(): string {
  return getConfigPath();
}

/* ------------------------------------------------------------------ */
/* 5.  Helpers                                                        */
/* ------------------------------------------------------------------ */

function buildNestedObject(pathArr: string[], value: unknown): any {
  return pathArr.reduceRight((acc, cur) => ({ [cur]: acc }), value);
}

function removeNestedKey(obj: any, pathArr: string[]): void {
  const [head, ...rest] = pathArr;
  if (!rest.length) {
    delete obj[head];
    return;
  }
  if (obj[head]) removeNestedKey(obj[head], rest);
}

async function atomicWriteFile(filePath: string, data: string): Promise<void> {
  const tmpPath = path.join(tmpdir(), `${randomUUID()}.tmp`);
  await fs.writeFile(tmpPath, data);
  await fs.rename(tmpPath, filePath);
}

/* ------------------------------------------------------------------ */
/* 6.  Version-upgrade hook (stub for v2 later)                       */
/* ------------------------------------------------------------------ */

export async function ensureLatestVersion(): Promise<void> {
  let cfg = await readConfig();
  // future: if cfg.version === 1 && needsUpgrade, mutate & write
}
