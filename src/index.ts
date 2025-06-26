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

function printUsage() {
  console.log("Usage: node dist/index.js <projectPageId> [--sync|--format]");
  console.log("  --sync   : Sync storyboard with script");
  console.log("  --format : Update formatted script toggle");
}

const args = process.argv.slice(2);
const projectPageId = args[0];
const flag = args[1];

if (!projectPageId || (!flag || (flag !== "--sync" && flag !== "--format"))) {
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
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})().catch(console.error);