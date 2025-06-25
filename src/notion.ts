// src/notion.ts
import { Client } from "@notionhq/client";
import {
    PageObjectResponse,
    BlockObjectResponse,
    ToggleBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

// import { ScriptBeat } from "./scriptParser";
import { config } from "dotenv"

config()

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getProjectPageId(rowId: string) {
    try {
        const row = await notion.pages.retrieve({ page_id: rowId })  as PageObjectResponse;
        const scriptPageId = (row.properties["Script Page"] as any).title[0].href.split("/").pop();
        if (!scriptPageId) {
            throw new Error("Project Page ID Not Found");
        }
        return scriptPageId;
    } catch (error) {
        console.error("Error retrieving database row:", error);
        throw error;
    }
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

export async function getStoryboardRows(databaseId: string) {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

// Add more functions for searching, creating, and updating rows as needed!
