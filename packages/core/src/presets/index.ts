// TODO: Implement preset loader class
export interface ScriptStructurePreset {
	label: string;     // Pretty, formatted label for use in CLI
	id: string;        // More machine-friendly reference string
	levels: ScriptStructureLevel[]
}

export interface ScriptStructureLevel {
	label: string;   
	data?: unknown;  // Optional extra data
}