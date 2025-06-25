// src/notion.ts
import { Client } from "@notionhq/client";
import {
    PageObjectResponse,
    BlockObjectResponse,
    ToggleBlockObjectResponse,
    BulletedListItemBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";

// import { ScriptBeat } from "./scriptParser";
import { config } from "dotenv"

config()

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getProjectPageId(rowId: string) {
    const row = await notion.pages.retrieve({ page_id: rowId })  as PageObjectResponse;
    if (!(row.properties["Run Sync"] as any).checkbox) {
        throw new Error("'Run Sync' not checked. Aborting.");
    }
    const scriptPageId = (row.properties["Script Page"] as any).title[0].href.split("/").pop();
    if (!scriptPageId) {
        throw new Error("Project Page ID Not Found");
    }
    return scriptPageId;
}

export async function getPageBlockChildren(pageId: string) {
    try {
        const response = await notion.blocks.children.list({ block_id: pageId });
        return response.results;
    } catch (error) {
        console.error("Error retrieving page block children:", error);
        throw error;
    }
}

export async function getCrucialIds(projectPageId: string) {
    try {
        // Get the script and storyboard child page IDs from the project page
        const children = await getPageBlockChildren(projectPageId) as BlockObjectResponse[];
        const scriptPage = children.find((block) => {
        return block.type === "child_page" && (block as any).child_page.title === "Script";
        });
        if (!scriptPage) {  
            throw Error("Script page not found in project page.");
        }
        const storyboardPage = children.find((block) => {
            return block.type === "child_page" && (block as any).child_page.title === "Storyboard";
        });
        if (!storyboardPage) {
            throw Error("Storyboard page not found in project page.");
        }

        // Get the script block ID
        const scriptPageBlocks = await getPageBlockChildren((scriptPage as any).id) as BlockObjectResponse[];
        const scriptBlock = scriptPageBlocks.find((block) => {
        return block.type === "toggle" && (block as any).toggle.rich_text[0].text.content === "Script";
        });
        if (!scriptBlock) {
        throw Error("Script block not found in script page.");
        }

        const scriptBlockId = (scriptBlock as ToggleBlockObjectResponse).id;

        // Get the storyboard database ID
        const storyboardPageBlocks = await getPageBlockChildren((storyboardPage as any).id) as BlockObjectResponse[];
        const storyboardDbBlock = storyboardPageBlocks.find((block) => {
        return block.type === "child_database" && (block as any).child_database.title === "Storyboard";
        });
        if (!storyboardDbBlock) {
        throw Error("Storyboard database block not found in storyboard page.");
        }

        const storyboardDbId = (storyboardDbBlock as any).id;
        
        return {
            scriptBlockId: scriptBlockId,
            storyboardDbId: storyboardDbId,
        };
    } catch (error) {
        console.error("Error retrieving crucial IDs:", error);
        throw error;
    }
}

export interface ScriptBeat {
  notionId: string;          // Notion ID of the beat block
  storyboardRowId?: string;  // ID of the corresponding storyboard row, if it exists
  id: string;                // e.g., "01.02.03"
  content: string;           // The actual line of script
  oldId?: string;            // ID of the previous version of the beat
}

export interface ScriptParagraph {
  title: string;           // e.g., "Scraping for Popularity Data"
  beats: ScriptBeat[];     // Ordered list of beats
}

export interface ScriptSection {
  title: string;           // e.g., "Data Exploration"
  paragraphs: ScriptParagraph[];
}

export type ScriptDocument = ScriptSection[];

export async function getScript(scriptBlockId: string): Promise<ScriptDocument> {
  const script: ScriptDocument = [];

  const sections = await getPageBlockChildren(scriptBlockId) as ToggleBlockObjectResponse[];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionObj: ScriptSection = {
      title: section.toggle.rich_text[0].plain_text,
      paragraphs: []
    };

    const paragraphs = await getPageBlockChildren(section.id) as ToggleBlockObjectResponse[];

    for (let j = 0; j < paragraphs.length; j++) {
      const paragraph = paragraphs[j];
      const paragraphObj: ScriptParagraph = {
        title: paragraph.toggle.rich_text[0].plain_text,
        beats: []
      };

      const beats = await getPageBlockChildren(paragraph.id) as BulletedListItemBlockObjectResponse[];

      for (let k = 0; k < beats.length; k++) {
        const beat = beats[k];
        const richText = beat.bulleted_list_item.rich_text;

        let oldId = "";
        let content = "";
        let storyboardRowId: string | undefined;

        if (richText.length > 0) {
            const firstPart = richText[0];
            const restText = richText.slice(1).map(rt => rt.plain_text).join("").trim();

            // If the first rich text part is a link and looks like [beatId]
            if (
            firstPart.type === "text" &&
            firstPart.text.link?.url &&
            firstPart.plain_text.startsWith("[") &&
            firstPart.plain_text.endsWith("]")
            ) {
            oldId = firstPart.plain_text.replace(/^\[|\]$/g, "").trim();

            const url = firstPart.text.link.url;
            const match = url.match(/\/([a-f0-9]{32})$/); // extract page ID from link
            if (match) {
                storyboardRowId = match[1].replace(
                /([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})/,
                "$1-$2-$3-$4-$5"
                );
            }

            content = restText.replace(/^:\s*/, "");
            } else {
                // No link or not formatted properly
                content = richText.map(rt => rt.plain_text).join("").trim();
            }
        }

        const formatNum = (num: number) => num.toString().padStart(2, "0");
        const beatObj: ScriptBeat = {
            notionId: beat.id,
            id: `${formatNum(i + 1)}.${formatNum(j + 1)}.${formatNum(k + 1)}`,
            content,
            oldId,
            storyboardRowId
        };

        paragraphObj.beats.push(beatObj);
        }


      sectionObj.paragraphs.push(paragraphObj);
    }

    script.push(sectionObj);
  }

  return script;
}

export async function syncStoryboard(script: ScriptDocument, storyboardDbId: string) {
    // Iterate over each beat from the script
    for (const section of script) {
        for (const paragraph of section.paragraphs) {
            for (const beat of paragraph.beats) {
                console.log(`Processing beat: ${JSON.stringify(beat)}`);
                let isNewBeat = beat.storyboardRowId === undefined;

                if (!isNewBeat && beat.storyboardRowId) {
                    try {
                        await notion.pages.update({
                            page_id: beat.storyboardRowId!,
                            properties: {
                                "Beat ID": {
                                    title: [
                                        {
                                            text: {
                                                content: beat.id
                                            }
                                        }
                                    ]
                                },
                                "Beat Snippet": {
                                    rich_text: [
                                        {
                                            text: {
                                                content: beat.content.slice(0, 20).trimEnd() + (beat.content.length > 20 ? "…" : "")
                                            }
                                        }
                                    ]
                                }
                            }
                        });
                    } catch (error) {
                        console.log(`Beat ${beat.id} not found in storyboard, creating new entry.`);
                        isNewBeat = true;  // If update fails, treat it as a new beat
                    }
                }
                
                if (isNewBeat) {  // If no entry exists, create a new one
                    const newRow = await notion.pages.create({
                        parent: { database_id: storyboardDbId },
                        properties: {
                            "Beat ID": {
                                title: [
                                    {
                                        text: {
                                            content: beat.id
                                        }
                                    }
                                ]
                            },
                            "Beat Snippet": {
                                rich_text: [
                                    {
                                        text: {
                                            content: beat.content.slice(0, 20).trimEnd() + (beat.content.length > 20 ? "…" : "")
                                        }
                                    }
                                ]
                            },
                            "Visual Description": {
                                rich_text: [
                                    {
                                        text: {
                                            content: "TBD"
                                        }
                                    }
                                ]
                            }
                        }
                    });

                    beat.storyboardRowId = newRow.id;
                }

                // Update the beat content with a link to the storyboard entry
                try {
                    const rowLink = `https://www.notion.so/${beat.storyboardRowId?.replace(/-/g, "")}`;
                    await notion.blocks.update({
                        block_id: beat.notionId,
                        bulleted_list_item: {
                            rich_text: [
                            {
                                type: "text",
                                text: {
                                content: `[${beat.id}]`,
                                link: {
                                    url: rowLink
                                }
                                }
                            },
                            {
                                type: "text",
                                text: {
                                content: `: ${beat.content}`
                                }
                            }
                            ]
                        }
                    });
                } catch (error) {
                    console.error(`Error updating beat block with ID ${beat.id}:`, error);
                }
            }
        }
    }
}