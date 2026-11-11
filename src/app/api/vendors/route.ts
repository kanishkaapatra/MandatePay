import {NextResponse} from "next/server";import {mandate} from "@/lib/store";
export async function GET(){return NextResponse.json({vendors:mandate.approvedVendors})}
export async function POST(req:Request){const b=await req.json();const name=String(b.name||"").trim();if(!name)return NextResponse.json({error:"Vendor name is required."},{status:400});if(!mandate.approvedVendors.some(v=>v.toLowerCase()===name.toLowerCase()))mandate.approvedVendors.push(name);return NextResponse.json({vendors:mandate.approvedVendors}, {status:201})}
export async function DELETE(req:Request){const b=await req.json();const name=String(b.name||"");mandate.approvedVendors=mandate.approvedVendors.filter(v=>v.toLowerCase()!==name.toLowerCase());return NextResponse.json({vendors:mandate.approvedVendors})}
