// TODO: Fix Notion script provider class
import { Client } from "@notionhq/client";
import { ScriptProvider, ScriptBlockMeta } from "..";
import { sha256 } from "../../utils/hash";

export class NotionScriptProvider implements ScriptProvider {
  private notion: Client;

  constructor(token = process.env.NOTION_TOKEN) {
    this.notion = new Client({ auth: token });
  }

  /* Root script block for a project page */
  async getScriptBlockId(pageId: string): Promise<string> {
    // search children for a toggle called "SCRIPT", etc.
  }

  /* Cheap listing: id, type, lastEdited, preview */
  async listChildren(parentId: string): Promise<BlockMeta[]> {
    const { results } = await this.notion.blocks.children.list({
      block_id: parentId
    });

    return results.map((b) => ({
      id: b.id,
      type: mapBlockType(b),
      lastEdited: b.last_edited_time,
      textPreview: extractPreview(b),
      hasChildren: !!b.has_children
    }));
  }

  /* Full content pull only for beats that changed */
  async fetchBeatContent(blockId: string) {
    const block = await this.notion.blocks.retrieve({ block_id: blockId });
    const rich = (block as any).bulleted_list_item.rich_text;
    const plain = rich.map((r: any) => r.plain_text).join("");
    const html  = renderRichTextToHtml(rich);  // your existing renderer
    return { html, plainText: plain };
  }

  /* — write-side methods for round-trip edits — */
  async updateBeat(blockId: string, data: { plainText: string }) {
    await this.notion.blocks.update({
      block_id: blockId,
      bulleted_list_item: { rich_text: [{ type: "text", text: { content: data.plainText } }] }
    });
  }

  async updateSubsectionTitle(blockId: string, title: string) {
    await this.notion.blocks.update({
      block_id: blockId,
      toggle: { rich_text: [{ type: "text", text: { content: title } }] }
    });
  }
}

/* — private helpers — */
function mapBlockType(b: any): BlockMeta["type"] {
  if (b.type === "bulleted_list_item") return "Beat";
  if (b.type === "toggle")            return "Paragraph";
  if (b.type === "heading_2")         return "Section";
  return "Paragraph"; // fallback
}

function extractPreview(b: any): string | undefined {
  const text = (b[b.type]?.rich_text ?? [])[0]?.plain_text;
  return text?.slice(0, 60);
}
