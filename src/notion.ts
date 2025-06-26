import { Client } from "@notionhq/client";
import {
    PageObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { config } from "dotenv"

config()

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// --- Notion API helpers ---
export async function retrievePage(pageId: string) {
    return notion.pages.retrieve({ page_id: pageId }) as Promise<PageObjectResponse>;
}

export async function listBlockChildren(blockId: string) {
    const response = await notion.blocks.children.list({ block_id: blockId });
    return response.results;
}

export async function updatePage(pageId: string, properties: any) {
    return notion.pages.update({ page_id: pageId, properties });
}

export async function createPageInDatabase(databaseId: string, properties: any) {
    return notion.pages.create({ parent: { database_id: databaseId }, properties });
}

export async function updateBlock(blockId: string, bulletedListItem: any) {
    return notion.blocks.update({ block_id: blockId, bulleted_list_item: bulletedListItem });
}

export async function queryDatabase(databaseId: string, sorts: any[] = [], pageSize: number = 100) {
    return await notion.databases.query({
        database_id: databaseId,
        sorts,
        page_size: pageSize
    });
}

export async function appendBlockChildren(blockId: string, children: any[]) {
    return await notion.blocks.children.append({
        block_id: blockId,
        children
    });
}