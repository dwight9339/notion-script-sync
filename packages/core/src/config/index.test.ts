import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import {
  getConfig,
  setConfigValue,
  addProvider,
  getConfigFilePath,
  unsetConfigValue,
  addScriptPreset,
  ScriptStructurePreset,
  ensureLatestVersion
} from "./index";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(tmpdir(), "sprongus-test-"));
  process.env.SPRONGUS_CONFIG_DIR = tmpDir;
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
  delete process.env.SPRONGUS_CONFIG_DIR;
});

describe("config module", () => {
  it("should write a default config if none exists", async () => {
    const cfg = await getConfig();
    expect(cfg.version).toBe(1);
    expect(cfg.providers).toEqual({});
  });

  it("should deep-merge new config values", async () => {
    await setConfigValue("providers.notion", {
      id: "notion",
      type: "notion",
      config: { token: "abc" },
    });
    await setConfigValue("providers.notion.config.token", "xyz");
    const cfg = await getConfig();
    expect(cfg.providers.notion?.config.token).toBe("xyz");
  });

  it("throws when provider.profile is malformed", async () => {
    // config must be an object, not a number
    await expect(
      addProvider({ id: "bad", type: "bad", config: 123 as any }),
    ).rejects.toThrow(/Expected object/);
  });

  it("can unset a deeply nested value", async () => {
    await setConfigValue("providers.notion", {
      id: "notion",
      type: "notion",
      config: { token: "abc", region: "us" },
    });
    await unsetConfigValue("providers.notion.config.token");
    const cfg = await getConfig();
    expect(cfg.providers.notion?.config).toEqual({ region: "us" });
  });

  it("honors SPRONGUS_CONFIG_DIR env override", async () => {
    const cfgPath = path.join(tmpDir, "config.json");
    await setConfigValue("version", 1);
    expect(getConfigFilePath()).toBe(cfgPath);
  });

  it("writes atomically (tmp → rename)", async () => {
    await setConfigValue('version', 1);
    const renameSpy = vi
      .spyOn(fs, "rename" as any)
      .mockRejectedValueOnce(new Error("rename fail"));

    await expect(setConfigValue("version", 1)).rejects.toThrow("rename fail");

    // File should still be valid JSON (either old or new), not partial.
    const raw = await fs.readFile(getConfigFilePath(), "utf-8");
    expect(() => JSON.parse(raw)).not.toThrow();

    renameSpy.mockRestore();
  });

  it("rejects duplicate script preset ids", async () => {
    const preset = {
      id: "simple-sections",
      label: "Simple Sections",
      levels: [
        {
          id: "section",
          label: "Section"
        },
        {
          id: "beat",
          label: "Beat"
        }
      ],
    } satisfies ScriptStructurePreset;

    await addScriptPreset(preset);
    // Adding the same id again should fail
    await expect(addScriptPreset(preset)).rejects.toThrow();
  });

  it('ensureLatestVersion is idempotent on latest schema', async () => {
    await setConfigValue('version', 1);
    await ensureLatestVersion();          // should not throw or mutate
    expect((await getConfig()).version).toBe(1);
  });
});
