import {NextResponse} from "next/server";
import {verifyPayPalWebhook} from "@/lib/paypal";
import {invoices,log,paymentBatches,webhookEventIds} from "@/lib/store";

export async function POST(req:Request){
 const event=await req.json();const headers:Record<string,string>={};
 for(const key of ["paypal-auth-algo","paypal-cert-url","paypal-transmission-id","paypal-transmission-sig","paypal-transmission-time"])headers[key]=req.headers.get(key)||"";
 let verified=false;try{verified=await verifyPayPalWebhook(headers,event)}catch{}
 if(!verified)return NextResponse.json({error:"Webhook signature verification failed."},{status:401});
 const eventId=String(event.id||"");if(eventId&&webhookEventIds.has(eventId))return NextResponse.json({received:true,duplicate:true});if(eventId)webhookEventIds.add(eventId);
 const kind=String(event.event_type||""),resource=event.resource||{},batch=String(resource.payout_batch_id||""),senderItem=String(resource.sender_item_id||"");
 log("WEBHOOK_RECEIVED","PAYPAL",senderItem||"-",kind);
 const status=kind.includes("SUCCEEDED")||kind.endsWith("BATCH.SUCCESS")?"PAID":kind.includes("FAILED")||kind.includes("DENIED")||kind.includes("BLOCKED")||kind.includes("RETURNED")?"FAILED":"PAYMENT_PENDING";
 const invoiceId=paymentBatches.get(batch);const invoice=invoices.find(x=>x.id===invoiceId||x.id===senderItem||senderItem.startsWith(`${x.id}-`)||x.invoiceNumber===senderItem);
 if(invoice){invoice.status=status;log(status==="PAID"?"PAYMENT_COMPLETED":"PAYMENT_STATUS","PAYPAL_WEBHOOK",invoice.invoiceNumber,`Verified event ${kind} · batch ${batch||"unknown"}`)}
 return NextResponse.json({received:true});
}
