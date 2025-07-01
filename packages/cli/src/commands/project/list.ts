import { Command } from "@oclif/core";
import { ProjectCache } from "@sprongus/core";

export default class ProjectList extends Command {
  static description = "List all cached Notion projects";
  static examples = [
    `<%= config.bin %> <%= command.id %>`
  ];

  async run(): Promise<void> {
    const records = ProjectCache.listAllProjects();

    if (records.length === 0) {
      this.log("No projects cached.");
      return;
    }

    for (const record of records) {
      this.log(`- ${record.alias ?? "(no alias)"}: ${record.projectTitle ?? "Untitled"} (${record.projectPageId})`);
    }
  }
}
