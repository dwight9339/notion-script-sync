export interface AuxTableRecord<T extends Record<string, unknown> = any> {
  id: string;                      // aux entry id
  projectId: string;
  tableName: string;               // e.g. "assets"
  payload: T;                      // typed by caller
  lastUpdated: string;
}