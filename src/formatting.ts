import {
    PageObjectResponse,
    QueryDatabaseResponse,
    RichTextItemResponse,
    SelectPropertyItemObjectResponse,
    BlockObjectResponse,
    ToggleBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import {
  listBlockChildren,
  queryDatabase
} from "./notion";
import { normalize } from "./helpers";
import * as fs from "fs";

interface StoryboardRow {
  section: string;
  paragraph: string;
  beatText: string;
  visualDescription: string;
}

/** Utility to squeeze plain‑text from a Notion property */
function getPlain(prop: any): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
    case "rich_text":
      return prop[prop.type]
        .map((t: RichTextItemResponse) => t.plain_text)
        .join("");
    case "select":
      return (prop as SelectPropertyItemObjectResponse).select?.name ?? "";
    default:
      return "";
  }
}

/**
 * Convert storyboard rows to Markdown.
 */
function rowsToMarkdown(rows: StoryboardRow[]): string {
  let md = "";
  let currentSection = "";
  let currentParagraph = "";

  for (const row of rows) {
    if (row.section !== currentSection) {
      currentSection = row.section;
      md += `\n\n## ${currentSection}\n`;
      currentParagraph = "";
    }
    if (row.paragraph !== currentParagraph) {
      currentParagraph = row.paragraph;
      md += `\n### ${currentParagraph}\n`;
    }
    const bulletText = `${row.beatText || ""}\n${row.visualDescription ? "[*" + row.visualDescription + "*]" : "[*TBD*]"}`;
    md += `\n- ${bulletText}`;
  }
  return md.trim();
}

/**
 * Query storyboard DB → build formatted Markdown → write to file
 */
export async function writeFormattedScriptMarkdown(
  storyboardDbId: string,
  outputPath: string
) {
  // 1. fetch storyboard rows
  const resp = (await queryDatabase(storyboardDbId, [
    { property: "Beat ID", direction: "ascending" }
  ], 100)) as QueryDatabaseResponse;

  const rows: StoryboardRow[] = resp.results
    .filter((r): r is PageObjectResponse => r.object === "page")
    .map((page) => {
      const p = page.properties as any;
      return {
        section: getPlain(p["Section"]),
        paragraph: getPlain(p["Paragraph"]),
        beatText: getPlain(p["Beat Text"]),
        visualDescription: getPlain(p["Visual Description"])
      };
    });

  const markdown = rowsToMarkdown(rows);
  fs.writeFileSync(outputPath, markdown, "utf-8");
}