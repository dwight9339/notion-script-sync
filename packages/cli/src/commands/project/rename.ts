import { Args, Command } from "@oclif/core";
import { ProjectCache } from "@sprongus/core";

export default class ProjectRename extends Command {
  static args = {
    oldAlias: Args.string({ required: true }),
    newAlias: Args.string({ required: true })
  };
  static description = "Change the alias for a cached project";
  static examples = [
    `<%= config.bin %> <%= command.id %> oldAlias newAlias`
  ];

  async run(): Promise<void> {
    const { args } = await this.parse(ProjectRename);
    const project = ProjectCache.getProjectByAlias(args.oldAlias);
    
    try {
      ProjectCache.upsertProjectRecord({
        ...project,
        alias: args.newAlias,
        lastUpdated: new Date().toISOString()
      } as ProjectCache.ProjectCacheRecord);
    } catch (error) {
      this.error(`Something went wrong: ${error}`);
    }

    const updatedProject = ProjectCache.getProjectByAlias(args.newAlias);
    this.log(`Realiased "${args.oldAlias}" → "${args.newAlias}"`);
    this.log(JSON.stringify(updatedProject, null, 2));
  }
}
