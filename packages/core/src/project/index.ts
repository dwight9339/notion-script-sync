import {
    BlockObjectResponse,
    ToggleBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { listBlockChildren, retrievePage } from "../notion";
import { normalize } from "../utils/string";

export async function getScriptBlockId(projectPageId: string): Promise<string> {
  // 1 · find the “Script” child page
  const children = (await listBlockChildren(projectPageId)) as BlockObjectResponse[];
  const scriptPage = children.find(
    (b) => b.type === "child_page" && normalize((b as any).child_page.title) === "script"
  );
  if (!scriptPage) throw new Error("Script page not found in project page.");

  // 2 · inside the Script page: locate the main toggle block titled “Script”
  const scriptBlocks = (await listBlockChildren((scriptPage as any).id)) as BlockObjectResponse[];
  const scriptBlock = scriptBlocks.find(
    (b) =>
      b.type === "toggle" &&
      normalize(
        (b as any).toggle.rich_text?.[0]?.plain_text ??
        (b as any).toggle.rich_text?.[0]?.text?.content
      ) === "script"
  ) as ToggleBlockObjectResponse | undefined;
  if (!scriptBlock) throw new Error("Script block not found in script page.");
  return scriptBlock.id;
}

export async function getStoryboardDbId(projectPageId: string): Promise<string> {
  // 1 · find the “Storyboard” child page
  const children = (await listBlockChildren(projectPageId)) as BlockObjectResponse[];
  const storyboardPage = children.find(
    (b) => b.type === "child_page" && normalize((b as any).child_page.title) === "storyboard"
  );
  if (!storyboardPage) throw new Error("Storyboard page not found in project page.");

  // 2 · inside the Storyboard page: locate the storyboard database
  const storyboardBlocks = (await listBlockChildren((storyboardPage as any).id)) as BlockObjectResponse[];
  const storyboardDbBlock = storyboardBlocks.find(
    (b) =>
      b.type === "child_database" &&
      normalize((b as any).child_database.title) === "storyboard"
  );
  if (!storyboardDbBlock)
    throw new Error("Storyboard database block not found in storyboard page.");
  return storyboardDbBlock.id;
}

export async function getProjectPageTitle(projectPageId: string): Promise<string> {
    const page = await retrievePage(projectPageId);
    const titleProp = Object.values(page.properties).find(
        (prop) => prop.type === "title"
    );

    if (!titleProp || titleProp.title.length === 0) {
        throw new Error("Title property not found or empty.");
    }

    // Concatenate all rich-text segments (usually there’s just one)
    return titleProp.title.map((t) => t.plain_text).join("");
}