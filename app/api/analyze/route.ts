import { NextResponse } from "next/server";
import { fixtures } from "@/lib/fixtures";
export async function POST(request:Request){const body=await request.json();const fixture=body.useFixtures||body.text?.includes("Stripe")?fixtures[0]:fixtures[1];return NextResponse.json({runId:`replay-${fixture.id}`,fixtureId:fixture.id,model:process.env.OPENAI_MODEL||"gpt-5.6",stages:["claim_extracted","research_started","evidence_reduced","graded","brief_ready"]})}
