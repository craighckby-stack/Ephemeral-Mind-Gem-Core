export interface Perspective {
  persona: string;
  text: string;
}

export interface Synthesis {
  synthesis_analysis: string;
  hypothetical_assumptions: string[];
}

export interface MemoryRecord {
  topic: string;
  perspectives: Perspective[];
  synthesis: Synthesis;
  mermaidCode: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
