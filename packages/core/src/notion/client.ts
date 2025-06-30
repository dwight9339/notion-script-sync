import { Client } from "@notionhq/client";
import { Config } from "../cache"

export async function getNotionClient() {
  const notionKey = Config.getConfigValue<string>("notionApiKey");

  if (!notionKey) {
      throw new Error("Notion API key not configured");
  }
  return new Client({ auth: notionKey });
}