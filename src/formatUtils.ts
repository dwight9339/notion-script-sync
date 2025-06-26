import {
  PageObjectResponse,
  QueryDatabaseResponse,
  RichTextItemResponse,
  SelectPropertyItemObjectResponse,
  BulletedListItemBlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Client } from "@notionhq/client";

interface StoryboardRow {
  section: string;
  paragraph: string;
  order: number;
  beatText: string;
  visualDescription: string;
}

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

function rowsToBlocks(rows: StoryboardRow[]) {
  const blocks: (
    | Heading2BlockObjectResponse
    | Heading3BlockObjectResponse
    | BulletedListItemBlockObjectResponse
  )[] = [] as any;

  let currentSection = "";
  let currentParagraph = "";

  const makeText = (content: string) => [{ type: "text", text: { content } }];

  for (const row of rows) {
    if (row.section !== currentSection) {
      currentSection = row.section;
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: makeText(currentSection), color: "default", is_toggleable: false }
      } as any);
      currentParagraph = "";
    }

    if (row.paragraph !== currentParagraph) {
      currentParagraph = row.paragraph;
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: makeText(currentParagraph), color: "default", is_toggleable: false }
      } as any);
    }

    const bulletText = `${row.beatText}\n${row.visualDescription ? "*" + row.visualDescription + "*" : "*TBD*"}`;
    blocks.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: makeText(bulletText), color: "default" }
    } as any);
  }

  return blocks;
}

export async function updateFormattedScriptToggle(
  notion: Client,
  storyboardDbId: string,
  formattedToggleId: string
) {
  // 1. fetch storyboard rows
  const resp = (await notion.databases.query({
    database_id: storyboardDbId,
    sorts: [{ property: "Order", direction: "ascending" }],
    page_size: 100
  })) as QueryDatabaseResponse;

  const rows: StoryboardRow[] = resp.results
    .filter((r): r is PageObjectResponse => r.object === "page")
    .map((page) => {
      const p = page.properties as any;
      return {
        section: getPlain(p["Section"]),
        paragraph: getPlain(p["Paragraph"]),
        order: p["Order"]?.number ?? 0,
        beatText: getPlain(p["Beat Text"]),
        visualDescription: getPlain(p["Visual Description"])
      };
    });

  const newBlocks = rowsToBlocks(rows);

  // 2. Remove existing children (archive) — optional; easiest: fetch + archive
  const existing = await notion.blocks.children.list({ block_id: formattedToggleId });
  for (const child of existing.results) {
    await notion.blocks.update({ block_id: child.id, archived: true });
  }

  // 3. Append fresh formatted blocks
  await notion.blocks.children.append({
    block_id: formattedToggleId,
    children: newBlocks as any
  });
}
