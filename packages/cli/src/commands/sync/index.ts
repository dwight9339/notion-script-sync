import { Command } from "@oclif/core";

export default class Sync extends Command {
  static description = "Sync production materials";
  static examples = [
    `<%= config.bin %> <%= command.id %> storyboard myProject (./src/commands/sync/index.ts)`,
  ];

  async run(): Promise<void> {
    this.log("Use a subcommand: storyboard");
    this.log("Run with --help to see all options.");
  }
}
