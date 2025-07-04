
import {
    updatePage,
    createPageInDatabase,
    updateBlock
} from "../notion";
import { getScript } from "../script";

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