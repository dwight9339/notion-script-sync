export interface ScriptBeat {
  notionId: string;          // Notion ID of the beat block
  storyboardRowId?: string;  // ID of the corresponding storyboard row, if it exists
  id: string;                // e.g., "01.02.03"
  content: string;           // The actual line of script
  oldId?: string;            // ID of the previous version of the beat
}

export interface ScriptParagraph {
  title: string;           // e.g., "Scraping for Popularity Data"
  beats: ScriptBeat[];     // Ordered list of beats
}

export interface ScriptSection {
  title: string;           // e.g., "Data Exploration"
  paragraphs: ScriptParagraph[];
}

export type ScriptDocument = ScriptSection[];