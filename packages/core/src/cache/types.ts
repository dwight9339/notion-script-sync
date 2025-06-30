export interface ProjectCacheRecord {
  alias: string;
  projectPageId: string;
  projectTitle?: string;
  scriptPageId?: string;
  scriptBlockId?: string;
  storyboardDbId?: string;
  assetsDbId?: string;
  citationsDbId?: string;
  lastUpdated?: string;
}

export interface CoreConfig {
  notionApiKey?: string;
  openAiApiKey?: string;
  [key: string]: unknown;
}