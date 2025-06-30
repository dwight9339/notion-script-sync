import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export * from "./client"

let notion: Client;

export function configureNotion(client: Client) {
  notion = client;
}

export async function retrievePage(pageId: string) {
  if (!notion) throw new Error("Notion client not configured");
  return notion.pages.retrieve({ page_id: pageId }) as Promise<PageObjectResponse>;
}

export async function listBlockChildren(blockId: string) {
  if (!notion) throw new Error("Notion client not configured");
  const response = await notion.blocks.children.list({ block_id: blockId });
  return response.results;
}

export async function updatePage(pageId: string, properties: any) {
  if (!notion) throw new Error("Notion client not configured");
  return notion.pages.update({ page_id: pageId, properties });
}

export async function createPageInDatabase(databaseId: string, properties: any) {
  if (!notion) throw new Error("Notion client not configured");
  return notion.pages.create({ parent: { database_id: databaseId }, properties });
}

export async function updateBlock(blockId: string, bulletedListItem: any) {
  if (!notion) throw new Error("Notion client not configured");
  return notion.blocks.update({ block_id: blockId, bulleted_list_item: bulletedListItem });
}

export async function queryDatabase(
    databaseId: string,
    sorts: any[] = [],
    pageSize: number = 100,
    startCursor?: string
) { 
  if (!notion) throw new Error("Notion client not configured");
  const params: any = {
      database_id: databaseId,
      sorts,
      page_size: pageSize
  };
  if (startCursor) {
      params.start_cursor = startCursor;
  }
  return await notion.databases.query(params);
}

export async function appendBlockChildren(blockId: string, children: any[]) {
    return await notion.blocks.children.append({
        block_id: blockId,
        children
    });
}