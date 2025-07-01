import { Args, Command } from "@oclif/core";
import { ProjectCache } from "@sprongus/core";

export default class ProjectRemove extends Command {
  static args = {
    alias: Args.string({ required: true, description: "Alias of the project to remove" })
  };
  static description = "Remove a project from the local cache";
  static examples = [
    `<%= config.bin %> <%= command.id %> myProject`
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(ProjectRemove);
    const removed = ProjectCache.removeProjectRecord(args.alias);

    if (!removed) {
      this.error(`No cached project found with alias "${args.alias}"`);
    }

    this.log(`Removed project "${args.alias}"`);
  }
}
