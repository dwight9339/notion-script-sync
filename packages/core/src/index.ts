import {
    syncStoryboard
} from "./sync";
import {
  writeFormattedScriptMarkdown,
} from "./formatting";
import {
  getScriptBlockId,
  getStoryboardDbId,
  getProjectPageTitle
} from "./helpers";
import { mergeCsvToStoryboard } from "./merge";

function printUsage() {
  console.log("Usage: node dist/index.js <projectPageId> [--sync|--format|--merge <csvPath>]");
  console.log("  --sync   : Sync storyboard with script");
  console.log("  --format : Output formatted script markdown");
  console.log("  --merge <csvPath> : Merge CSV into storyboard");
}

const args = process.argv.slice(2);
const projectPageId = args[0];
const flag = args[1];
const csvPath = args[2];

if (!projectPageId || !flag || (flag !== "--sync" && flag !== "--format" && flag !== "--merge")) {
  printUsage();
  process.exit(1);
}

(async () => {
  try {
    if (flag === "--sync") {
      const storyboardDbId = await getStoryboardDbId(projectPageId);
      const scriptBlockId = await getScriptBlockId(projectPageId);
      await syncStoryboard(scriptBlockId, storyboardDbId);
      console.log("Storyboard synced with script.");
    } else if (flag === "--format") {
      const projectTitle = await getProjectPageTitle(projectPageId);
      const storyboardDbId = await getStoryboardDbId(projectPageId);
      const outputPath = `./output/${projectTitle}_script.md`;
      await writeFormattedScriptMarkdown(storyboardDbId, outputPath);
      console.log(`Formatted script written to ${outputPath}`);
    } else if (flag === "--merge") {
      if (!csvPath) {
        printUsage();
        process.exit(1);
      }
      await mergeCsvToStoryboard(projectPageId, csvPath);
      console.log("Storyboard updated from CSV.");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})().catch(console.error);