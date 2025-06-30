import {
    ToggleBlockObjectResponse,
    BulletedListItemBlockObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import {
    ScriptDocument,
    ScriptSection,
    ScriptParagraph,
    ScriptBeat
} from "../types";
import {
    retrievePage,
    listBlockChildren,
    updatePage,
    createPageInDatabase,
    updateBlock
} from "../notion";

export async function getProjectPageId(rowId: string) {
    const row = await retrievePage(rowId);
    if (!(row.properties["Run Sync"] as any).checkbox) {
        throw new Error("'Run Sync' not checked. Aborting.");
    }
    const scriptPageId = (row.properties["Script Page"] as any).title[0].href.split("/").pop();
    if (!scriptPageId) {
        throw new Error("Project Page ID Not Found");
    }
    return scriptPageId;
}



async function getScript(scriptBlockId: string): Promise<ScriptDocument> {
    const script: ScriptDocument = [];

    const sections = await listBlockChildren(scriptBlockId) as ToggleBlockObjectResponse[];

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionObj: ScriptSection = {
            title: section.toggle.rich_text[0].plain_text,
            paragraphs: []
        };

        const paragraphs = await listBlockChildren(section.id) as ToggleBlockObjectResponse[];

        for (let j = 0; j < paragraphs.length; j++) {
            const paragraph = paragraphs[j];
            const paragraphObj: ScriptParagraph = {
                title: paragraph.toggle.rich_text[0].plain_text,
                beats: []
            };

            const beats = await listBlockChildren(paragraph.id) as BulletedListItemBlockObjectResponse[];

            for (let k = 0; k < beats.length; k++) {
                const beat = beats[k];
                console.log(`Processing beat ${i + 1}.${j + 1}.${k + 1}:`, beat);
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

export async function syncStoryboard(scriptBlockId: string, storyboardDbId: string) {
    const script = await getScript(scriptBlockId);

    // Iterate over each beat from the script
    for (const section of script) {
        for (const paragraph of section.paragraphs) {
            for (const beat of paragraph.beats) {
                console.log(`Processing beat: ${JSON.stringify(beat)}`);
                let isNewBeat = beat.storyboardRowId === undefined;

                if (!isNewBeat && beat.storyboardRowId) {
                    try {
                        await updatePage(beat.storyboardRowId!, {
                            "Beat ID": {
                                title: [
                                    {
                                        text: {
                                            content: beat.id
                                        }
                                    }
                                ]
                            },
                            "Section": {
                                rich_text: [
                                    {
                                        text: {
                                            content: section.title
                                        }
                                    }
                                ]
                            },
                            "Paragraph": {
                                rich_text: [
                                    {
                                        text: {
                                            content: paragraph.title
                                        }
                                    }
                                ]
                            },
                            "Beat Text": {
                                rich_text: [
                                    {
                                        text: {
                                            content: beat.content
                                        }
                                    }
                                ]
                            }
                        });
                    } catch (error) {
                        console.warn(`Beat ${beat.id} not found in storyboard, creating new entry.`);
                        isNewBeat = true;  // If update fails, treat it as a new beat
                    }
                }
                
                if (isNewBeat) {  // If no entry exists, create a new one
                    const newRow = await createPageInDatabase(storyboardDbId, {
                        "Beat ID": {
                            title: [
                                {
                                    text: {
                                        content: beat.id
                                    }
                                }
                            ]
                        },
                        "Beat Text": {
                            rich_text: [
                                {
                                    text: {
                                        content: beat.content
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
                    });

                    beat.storyboardRowId = newRow.id;
                }

                // Update the beat content with a link to the storyboard entry
                try {
                    const rowLink = `https://www.notion.so/${beat.storyboardRowId?.replace(/-/g, "")}`;
                    await updateBlock(beat.notionId, {
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
                    });
                } catch (error) {
                    console.error(`Error updating beat block with ID ${beat.id}:`, error);
                }
            }
        }
    }
}