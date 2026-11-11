import {NextResponse} from "next/server";
import {z} from "zod";
import {mandate,log} from "@/lib/store";

const Policy=z.object({currency:z.string().length(3),perTransactionLimit:z.number().positive(),monthlyLimit:z.number().positive(),approvedVendors:z.array(z.string()),requireApprovedVendor:z.boolean(),duplicateDetection:z.boolean(),autoPayEnabled:z.boolean()});
export async function GET(){return NextResponse.json({mandate})}
export async function POST(req:Request){
 try {
  const body=await req.json();let proposed:unknown;
  if(body.policy){proposed=Policy.parse(body.policy)}
  else {
   const text=String(body.text||"");const key=process.env.AI_API_KEY;
   if(key){
    const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.AI_MODEL||"gpt-4o-mini",temperature:0,response_format:{type:"json_object"},messages:[{role:"system",content:"Convert financial spending permission to strict JSON fields: currency, perTransactionLimit, monthlyLimit, approvedVendors, requireApprovedVendor, duplicateDetection, autoPayEnabled. Do not invent vendors or relax constraints. Use safe conservative values when details are missing."},{role:"user",content:text}]})});
    if(!response.ok)throw new Error("Policy interpretation failed");proposed=JSON.parse((await response.json()).choices[0].message.content);
   }else{
    const per=text.match(/(?:under|below|less than|up to)\s*\$?([\d,.]+)/i),month=text.match(/(?:monthly|per month)[^\d$]*\$?([\d,.]+)/i);
    proposed={currency:"USD",perTransactionLimit:Number(per?.[1]?.replaceAll(",",""))||200,monthlyLimit:Number(month?.[1]?.replaceAll(",",""))||1000,approvedVendors:mandate.approvedVendors,requireApprovedVendor:/approved vendor/i.test(text),duplicateDetection:/duplicate/i.test(text),autoPayEnabled:/automatically pay|auto.pay/i.test(text)};
   }
  }
  const policy=Policy.parse(proposed);if(body.activate!==true)return NextResponse.json({proposed:policy,requiresConfirmation:true});
  Object.assign(mandate,policy);log("MANDATE_ACTIVATED",String(body.actor||"USER"),"-",JSON.stringify(policy));return NextResponse.json({mandate,activated:true});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid mandate policy."},{status:400})}
}
