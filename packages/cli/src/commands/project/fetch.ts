import { Args, Command, Flags, ux } from "@oclif/core";
import { Notion, Project, ProjectCache } from "@sprongus/core";
import { ProjectCacheRecord } from "@sprongus/core/dist/cache/types";

export default class ProjectFetch extends Command {
  static args = {
    pageId: Args.string({ description: "The ID of the Notion script project page", required: true })
  };
  static description = "Fetch details about an existing script project in Notion";
  static examples = [
    `<%= config.bin %> <%= command.id %> myAlias --page-id abc123`,
    `<%= config.bin %> <%= command.id %> myAlias`
  ];
  static flags = {
    alias: Flags.string({ char: "a", description: "Optional alias for use in CLI" }),
    refetch: Flags.boolean({ char: "r", description: "Refetch project details even if it exists in cache" })
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectFetch);
    const { pageId } = args;
    const { alias: inputAlias, refetch } = flags;

    if (!pageId) {
      this.error("You must provide a project page ID.");
    }

    const existing = ProjectCache.getProjectByPageId(pageId);
    if (existing && !refetch) {
      this.log(`Project exists for page "${pageId}". Use --refetch to force update.`);
      this.log(JSON.stringify(existing, null, 2));
      return;
    }

    ux.action.start(`Fetching project details`);
    Notion.configureNotion(await Notion.getNotionClient());
    const projectDetails = await Project.getProjectDetails(pageId);
    const alias = inputAlias ?? existing?.alias ?? projectDetails.projectTitle.toLowerCase().replaceAll(" ", "_");
    ux.action.stop("done");

    const newRecord = {
      alias,
      lastUpdated: new Date().toISOString(),
      projectPageId: pageId,
     ...projectDetails
    } as ProjectCacheRecord;

    ProjectCache.upsertProjectRecord(newRecord);

    this.log(`Project ${alias} added:`);
    this.log(JSON.stringify(newRecord, null, 2));
  }
}
