import { listBlockChildren } from "../notion";
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
    ScriptCache
} from "../cache";
import { sha256 } from "../utils/hash";

export * from "./types";

export async function fetchScript(scriptBlockId: string): Promise<void> {
    const sections = await listBlockChildren(scriptBlockId) as ToggleBlockObjectResponse[];

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        try {
            ScriptCache.upsertSubsection({
                blockId: section.id,
                parentBlockId: (section.parent as any).id,
                scriptBlockId,
                lastFetched: new Date().toISOString(),
                lastEdited: section.last_edited_time,
                index: i,
                type: ScriptCache.ScriptSubsectionType.Section
            })
        } catch (error) {
            throw Error(`Error caching section ${section.id}: ${error}`);
        }

        const paragraphs = await listBlockChildren(section.id) as ToggleBlockObjectResponse[];

        for (let j = 0; j < paragraphs.length; j++) {
            const paragraph = paragraphs[j];
            try {
                ScriptCache.upsertSubsection({
                    blockId: paragraph.id,
                    parentBlockId: (paragraph.parent as any).id,
                    scriptBlockId,
                    lastFetched: new Date().toISOString(),
                    lastEdited: paragraph.last_edited_time,
                    index: j,
                    type: ScriptCache.ScriptSubsectionType.Paragraph
                })
            } catch (error) {
                throw Error(`Error caching section ${paragraph.id}: ${error}`);
            }

            const beats = await listBlockChildren(paragraph.id) as BulletedListItemBlockObjectResponse[];

            for (let k = 0; k < beats.length; k++) {
                const beat = beats[k];
                const richText = beat.bulleted_list_item.rich_text;
                const beatText = richText.slice(1).map(rt => rt.plain_text).join("").trim();

                try {
                    ScriptCache.upsertBeat({
                        blockId: beat.id,
                        parentBlockId: (beat.parent as any).id,
                        scriptBlockId,
                        lastFetched: new Date().toISOString(),
                        lastEdited: beat.last_edited_time,
                        index: k,
                        text: beatText,
                        hash: sha256(beatText)
                    })
                } catch (error) {
                    throw Error(`Error caching section ${paragraph.id}: ${error}`);
                }
            }
        }
    }
}

export async function getScript(scriptBlockId: string): Promise<ScriptDocument> {
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