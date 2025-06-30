// import { Command, Flags } from "@oclif/core";
// import {
//     getProjectPageTitle,
//     getProjectPageId,
//     getScriptBlockId,
//     getStoryboardDbId
// } from "@sprongus/core";

// export default class ProjectGet extends Command {
//   static description = "Register and cache metadata for a Notion project";

//   static flags = {
//     alias: Flags.string({ required: true, description: "Alias to assign to this project" }),
//     "page-id": Flags.string({ required: true, description: "Notion parent page ID" })
//   };

//   async run(): Promise<void> {
//     const { flags } = await this.parse(ProjectGet);

//     await upsertProjectRecord({
//       alias: flags.alias,
//       pageId: flags["page-id"]
//     });

//     this.log(`Project '${flags.alias}' cached successfully.`);
//   }
// }
