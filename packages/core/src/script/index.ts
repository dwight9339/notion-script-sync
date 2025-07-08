export interface ScriptSubsection {
  blockId: string;               // From provider
  parentBlockId: string;
  scriptRootBlockId: string;
  projectId: string;
  title: string;
  index: number;
  lastFetched: string;
  lastEdited: string;
}

export interface ScriptBeat {
  blockId: string;
  parentBlockId: string;
  scriptRootBlockId: string;
  projectId: string;
  index: number;
  html: string;
  text: string;
  hash: string;
  lastFetched: string;
  lastUpdated: string;
} 

export type ScriptDocument = ScriptSubsection[] | ScriptBeat[];