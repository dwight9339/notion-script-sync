export interface StoryboardRow {
  rowId: string;
  projectId: string;
  beatId?: string;
  idx: number;
  beat_text?: string;
  visual_description?: string;

  /** Project-specific or user-specific extra fields */
  extras?: Record<string, unknown>;
}