import {
    PageObjectResponse,
    QueryDatabaseResponse,
    RichTextItemResponse,
    SelectPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import {
  queryDatabase
} from "../notion";
import { StoryboardRow } from "../storyboard";
import * as fs from "fs";
import { get } from "http";

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

async function getAllStoryboardRows(storyboardDbId: string): Promise<StoryboardRow[]> {
  let results: StoryboardRow[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const resp = await queryDatabase(
      storyboardDbId,
      [{ property: "Beat ID", direction: "ascending" }],
      100,
      startCursor
    ) as QueryDatabaseResponse;

    results = results.concat(
      resp.results
        .filter((r): r is PageObjectResponse => r.object === "page")
        .map((page) => {
          const p = page.properties as any;
          return {
            beatId: getPlain(p["Beat ID"]),
            section: getPlain(p["Section"]),
            paragraph: getPlain(p["Paragraph"]),
            beatText: getPlain(p["Beat Text"]),
            visualDescription: getPlain(p["Visual Description"])
          };
        })
    );
    hasMore = resp.has_more;
    startCursor = resp.next_cursor ?? undefined;
  }
  return results;
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
  const rows = await getAllStoryboardRows(storyboardDbId);
  const markdown = rowsToMarkdown(rows);
  fs.writeFileSync(outputPath, markdown, "utf-8");
}