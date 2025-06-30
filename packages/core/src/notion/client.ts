import { Client } from "@notionhq/client";
import { config } from "dotenv"

config()

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not set in environment variables.");
  }
  return new Client({ auth: process.env.NOTION_API_KEY });
}