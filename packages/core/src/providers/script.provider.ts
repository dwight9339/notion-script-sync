import {
  ScriptSubsection,
  ScriptBeat
} from "../script";

export interface ScriptProvider {
  /** Return the root script block ID for a project */
  getScriptRootId(projectPageId: string): Promise<string>;

  /** List direct *child* blocks (id, type, lastEdited, text) */
  listChildren(blockId: string): Promise<ScriptSubsection[]|ScriptBeat[]>;

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