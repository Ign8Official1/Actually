export type Grade = "solid" | "shaky" | "contested" | "unknown";
export type Mode = "vendor" | "strategy" | "factcheck";
export type Claim = { id:string; text:string; type:string; importance:string; grade:Grade; confidence:number; rationale:string; sources:string[]; };
export type Fixture = { id:string; title:string; description:string; mode:Mode; text:string; claims:Claim[]; brief:{bottomLine:string; trust:string; contested:string; risks:string; next:string}; };
