import { NextResponse } from "next/server";
import type { Fixture, Grade, Mode, SourceLink } from "@/lib/types";

const grades:Grade[] = ["solid", "shaky", "contested", "unknown"];
const modes:Mode[] = ["vendor", "strategy", "factcheck"];
const schema = {
 type:"object",
 additionalProperties:false,
 required:["title","description","mode","text","claims","brief"],
 properties:{
  title:{type:"string"},
  description:{type:"string"},
  mode:{type:"string",enum:modes},
  text:{type:"string"},
  claims:{type:"array",minItems:1,maxItems:8,items:{type:"object",additionalProperties:false,required:["text","type","importance","grade","confidence","rationale","sources"],properties:{text:{type:"string"},type:{type:"string"},importance:{type:"string"},grade:{type:"string",enum:grades},confidence:{type:"number",minimum:0,maximum:1},rationale:{type:"string"},sources:{type:"array",minItems:1,maxItems:5,items:{type:"object",additionalProperties:false,required:["name","url"],properties:{name:{type:"string"},url:{type:"string"}}}}}}},
  brief:{type:"object",additionalProperties:false,required:["bottomLine","trust","contested","risks","next"],properties:{bottomLine:{type:"string"},trust:{type:"string"},contested:{type:"string"},risks:{type:"string"},next:{type:"string"}}}
 }
};

function clamp(value:number){return Math.max(0,Math.min(1,Number.isFinite(value)?value:.5))}
function normalizeSource(source:{name?:string;url?:string}):SourceLink{return {name:source.name?.trim()||"Source review",url:source.url?.trim()||""}}
function normalizeResult(value:Omit<Fixture,"id">):Fixture{return {...value,id:`live-${Date.now()}`,claims:value.claims.map((claim,index)=>({...claim,id:`claim-${index+1}`,confidence:clamp(claim.confidence),sources:claim.sourceLinks?.map(source=>source.name)||claim.sources}))}}

export async function POST(request:Request){
 try{
  const body=await request.json() as {text?:string;mode?:Mode};
  const text=body.text?.trim();
  if(!text)return NextResponse.json({error:"Paste a claim, memo, Slack thread, or AI answer first."},{status:400});
  const apiKey=process.env.OPENAI_API_KEY?.trim();
  if(!apiKey)return NextResponse.json({error:"Add OPENAI_API_KEY to .env.local before running a live investigation."},{status:503});
  const model=process.env.OPENAI_MODEL?.trim()||"gpt-5.6-sol";
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model,tools:[{type:"web_search_preview"}],input:[{role:"system",content:[{type:"input_text",text:"You are Actually..., an evidence-first research analyst. Investigate the user's text using web search. Extract material claims, challenge absolute language, compare primary sources with credible secondary sources, and never present an unsupported guess as fact. Only cite sources you actually used. If evidence is insufficient or conflicting, grade the claim unknown or contested and explain why. Return only the requested JSON."}]},{role:"user",content:[{type:"input_text",text:`Research lens: ${body.mode||"vendor"}\n\nUser material:\n${text}`}]}],text:{format:{type:"json_schema",name:"actually_investigation",strict:true,schema}},include:["web_search_call.action.sources"]})});
  const payload=await response.json() as {output_text?:string;error?:{message?:string}};
  if(!response.ok)throw new Error(payload.error?.message||"The analysis service returned an error.");
  if(!payload.output_text)throw new Error("The analysis service returned no structured result.");
  const parsed=JSON.parse(payload.output_text) as Omit<Fixture,"id">;
  const claims=parsed.claims.map(claim=>{const sourceLinks=(claim as typeof claim & {sources:Array<string|{name:string;url:string}>}).sources.map(source=>typeof source==="string"?normalizeSource({name:source}):normalizeSource(source));return {...claim,sourceLinks,sources:sourceLinks.map(source=>source.name)}});
  const result=normalizeResult({...parsed,claims});
  return NextResponse.json({runId:result.id,model,fixture:result,stages:["claim_extracted","research_started","evidence_reduced","graded","brief_ready"]});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to complete the investigation."},{status:502})}
}
