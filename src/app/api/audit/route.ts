import {NextResponse} from "next/server";import {audit} from "@/lib/store";
export async function GET(){return NextResponse.json({events:audit})}
