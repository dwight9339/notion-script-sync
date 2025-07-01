import {
    BlockObjectResponse,
    ToggleBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { listBlockChildren, retrievePage } from "../notion";
import { normalize } from "../utils/string";
import { ProjectDetails } from "./types";
import console from "console";

export * from "./types";

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

export async function getScriptBlockId(scriptPageId: string): Promise<string> {
  const scriptBlocks = await listBlockChildren(scriptPageId) as BlockObjectResponse[];
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

export async function getProjectDetails(projectPageId: string): Promise<any> {
  const projectTitle = await getProjectPageTitle(projectPageId);
  if (!projectTitle) throw new Error("Project page has no title.");
  const children = (await listBlockChildren(projectPageId)) as BlockObjectResponse[];
  // console.log("Project children:", JSON.stringify(children, null, 2));

  const scriptPage = children.find(
    (b) => b.type === "child_page" && normalize((b as any).child_page.title) === "script"
  );
  if (!scriptPage) throw new Error("Script page not found in project page.");

  const scriptBlockId = await getScriptBlockId(scriptPage.id);

  const storyboardDb = children.find(
    (b) => b.type === "child_database" && normalize((b as any).child_database.title) === "storyboard"
  );
  if (!storyboardDb) throw new Error("Storyboard page not found in project page.");

  const assetsDb = children.find(
    (b) => b.type === "child_database" && normalize((b as any).child_database.title) === "assets"
  );
  if (!assetsDb) throw new Error("Assets page not found in project page.");

  const citationsDb = children.find(
    (b) => b.type === "child_database" && normalize((b as any).child_database.title) === "citations"
  );
  if (!citationsDb) throw new Error("Citations page not found in project page.");

  return {
    projectTitle,
    scriptPageId: scriptPage.id,
    scriptBlockId,
    storyboardDbId: storyboardDb.id,
    assetsDbId: assetsDb.id,
    citationsDbId: citationsDb.id,
  } as ProjectDetails;
}