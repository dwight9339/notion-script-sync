import { Command } from "@oclif/core";

export default class Config extends Command {
  static description = "Manage your Sprongus configuration settings";
  static examples = [
    `<%= config.bin %> <%= command.id %> init (./src/commands/config/index.ts)`,
    `<%= config.bin %> <%= command.id %> set notionApiKey sk-abc123 (./src/commands/config/index.ts)`,
    `<%= config.bin %> <%= command.id %> get notionApiKey (./src/commands/config/index.ts)`,
    `<%= config.bin %> <%= command.id %> list (./src/commands/config/index.ts)`,
    `<%= config.bin %> <%= command.id %> unset notionApiKey (./src/commands/config/index.ts)`
  ];

  async run(): Promise<void> {
    this.log("Use a subcommand: set, get, unset, list");
    this.log("Run with --help to see all options.");
  }
}
