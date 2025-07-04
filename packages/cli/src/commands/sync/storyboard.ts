import { Args, Command, Flags, ux } from "@oclif/core";
import {  } from "@sprongus/core";

export default class SyncStoryboard extends Command {
  static args = {
    project: Args.string({
      required: true,
      description: "Project alias —or project_page_id— to sync"
    })
  };
  static description =
    "Synchronise a project’s script block with its storyboard database";
  static examples = [
    // happy-path: look up everything from cache
    `<%= config.bin %> <%= command.id %> io-story`,

    // override cache with explicit IDs
    `<%= config.bin %> <%= command.id %> io-story \
--script-block 1e2f3… --storyboard-db 4a5b6…`,

    // force a full refresh even if beat IDs look unchanged
    `<%= config.bin %> <%= command.id %> io-story --refetch`
  ];
  static flags = {
    "script-block": Flags.string({
      description: "Notion block-ID that contains the script (overrides cache)"
    }),
    "storyboard-db": Flags.string({
      description: "Notion database-ID of the storyboard (overrides cache)"
    }),
    refetch: Flags.boolean({
      description: "Ignore cached storyboardRowIds and always push fresh data",
      default: false
    })
  };

  /* ──────────────────────────────────────────── main handler ── */
  async run(): Promise<void> {
    const { args, flags } = await this.parse(SyncStoryboard);

    /* 1️⃣ Resolve project record from cache */
    const record = getProjectByAlias(args.project) ??
      getProjectByAlias(flags["project-page-id"] ?? ""); // fallback if user passed raw ID

    if (!record) {
      this.error(
        `No cached project found for “${args.project}”. ` +
          "Run: sprongus project fetch <pageId> --alias <alias>"
      );
      return;
    }

    /* 2️⃣ Determine the IDs we’ll sync */
    const scriptBlockId   = flags["script-block"]   ?? record.scriptBlockId;
    const storyboardDbId  = flags["storyboard-db"]  ?? record.storyboardDbId;

    if (!scriptBlockId || !storyboardDbId) {
      this.error(
        "Missing scriptBlockId or storyboardDbId. " +
          "Supply them with --script-block / --storyboard-db or update the cache."
      );
      return;
    }

    /* 3️⃣ Kick off the sync */
    this.log("Syncing storyboard …");
    const spinner = ux.ora().start();

    try {
      await syncStoryboard(scriptBlockId, storyboardDbId, { refetch: flags.refetch });
      spinner.succeed("Storyboard sync complete ✔︎");
    } catch (err) {
      spinner.fail("Sync failed");
      this.error((err as Error).message);
    }
  }
}
