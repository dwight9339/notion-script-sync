export interface ScriptBlockMeta {
  id: string;
  type: "Section" | "Paragraph" | "Beat";
  lastEdited: string;
  textPreview?: string;
  hasChildren: boolean;
}

export interface ScriptProvider {
  /** Return the root script-block ID for a project */
  getScriptBlockId(projectPageId: string): Promise<string>;

  /** List direct *child* blocks (id, type, lastEdited, text) */
  listChildren(blockId: string): Promise<ScriptBlockMeta[]>;

  /** Fetch full rich-text for a beat block */
  fetchBeatContent(blockId: string): Promise<{ html: string; plainText: string }>;

  /** Replace the plain-text (and optionally rich text) of a beat block. */
  updateBeat(
    blockId: string,
    newText: { html?: string; plainText: string }
  ): Promise<void>;

  /** Rename a section / paragraph heading. */
  updateSubsectionTitle(
    blockId: string,
    newTitle: string
  ): Promise<void>;

  /** Delete a beat or subsection (optional). */
  deleteBlock(blockId: string): Promise<void>;
}