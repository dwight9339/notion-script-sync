import { Args, Command } from "@oclif/core";
import { ProjectCache } from "@sprongus/core";

export default class ProjectShow extends Command {
  static args = {
    alias: Args.string({ description: "Alias of the project to show", required: true })
  };
  static description = "Show detailed info for a cached project";
  static examples = [
    `<%= config.bin %> <%= command.id %> myProject`
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(ProjectShow);
    const record = ProjectCache.getProjectByAlias(args.alias);

    if (!record) {
      this.error(`No project found with alias "${args.alias}"`);
    }

    this.log(JSON.stringify(record, null, 2));
  }
}
