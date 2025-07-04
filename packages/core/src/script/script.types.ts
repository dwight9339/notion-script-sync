export enum ScriptSubsectionType {
  Section = "Section",
  Paragraph = "Paragraph"
}

export interface ScriptSubsection {
  blockId: string;
  parentBlockId: string;
  scriptBlockId: string;
  lastFetched: string;
  lastEdited: string;
  title: string;
  index: number;
  type: ScriptSubsectionType;
}

export interface ScriptBeat {
  blockId: string;
  parentBlockId: string;
  scriptBlockId: string;
  storyboardRowId: string;
  index: number;
  text: string;
  lastFetched: string;
  lastEdited: string;
  hash: string;
}