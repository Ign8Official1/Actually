import { NextResponse } from "next/server";
import { fixtures } from "@/lib/fixtures";
export async function GET(_:Request,{params}:{params:{runId:string}}){const fixture=fixtures.find(f=>params.runId.includes(f.id))||fixtures[0];return NextResponse.json({brief:fixture.brief,claims:fixture.claims,evidenceMap:{nodes:fixture.claims.map(c=>({id:c.id,label:c.text})),edges:fixture.claims.flatMap(c=>c.sources.map(s=>({source:c.id,target:s})))},meta:{model:process.env.OPENAI_MODEL||"gpt-5.6",stages:5,timing:"replay"}})}
