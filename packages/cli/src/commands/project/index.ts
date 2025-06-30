import { Command } from "@oclif/core";

export default class Project extends Command {
  static description = "Manage cached Notion projects";
  static examples = [
    `<%= config.bin %> <%= command.id %> get myProject --page-id abc123 (./src/commands/project/index.ts)`,
    `<%= config.bin %> <%= command.id %> update myProject (./src/commands/project/index.ts)`,
    `<%= config.bin %> <%= command.id %> list (./src/commands/project/index.ts)`,
    `<%= config.bin %> <%= command.id %> show myProject (./src/commands/project/index.ts)`
  ];

  async run(): Promise<void> {
    this.log("Use a subcommand: get, list, show");
    this.log("Run with --help to see all options.");
  }
}
