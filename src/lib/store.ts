import type {Invoice,Mandate} from "./policy";
export const mandate:Mandate={currency:"USD",perTransactionLimit:200,monthlyLimit:1000,approvedVendors:["Acme Cloud Services","Northstar Hosting","Figma"],requireApprovedVendor:true,duplicateDetection:true,autoPayEnabled:true};
export const invoices:Invoice[]=[
 {id:"inv-1024",vendor:"Acme Cloud Services",invoiceNumber:"AC-1024",amount:149,currency:"USD",description:"Cloud infrastructure — October",status:"PAID",decision:"AUTO_APPROVED",date:new Date().toISOString(),paypalEmail:"billing@acmecloud.example"},
 {id:"inv-unknown",vendor:"Unknown Solutions",invoiceNumber:"US-2026-01",amount:175,currency:"USD",description:"Consulting services",status:"BLOCKED",decision:"BLOCKED",date:new Date().toISOString()},
 {id:"inv-1025",vendor:"Acme Cloud Services",invoiceNumber:"AC-1025",amount:450,currency:"USD",description:"Annual platform expansion",status:"REVIEW",decision:"PENDING_APPROVAL",date:new Date().toISOString(),paypalEmail:"billing@acmecloud.example"},
];
export type Audit={id:string,event:string,actor:string,invoice:string,details:string,time:string};
export const audit:Audit[]=[
 {id:"a1",event:"PAYMENT_COMPLETED",actor:"PayPal Sandbox",invoice:"AC-1024",details:"Payout completed · batch POUT-8F2A19C4",time:new Date(Date.now()-3600000).toISOString()},
 {id:"a2",event:"POLICY_EVALUATED",actor:"Policy Engine",invoice:"AC-1025",details:"Pending approval · amount exceeds $200 auto-pay threshold",time:new Date(Date.now()-7200000).toISOString()},
 {id:"a3",event:"INVOICE_BLOCKED",actor:"Policy Engine",invoice:"US-2026-01",details:"Vendor is not on the approved vendor list",time:new Date(Date.now()-10800000).toISOString()},
 {id:"a4",event:"INVOICE_UPLOADED",actor:"Demo User",invoice:"AC-1024",details:"PDF extraction completed · confidence 98%",time:new Date(Date.now()-14400000).toISOString()}
];
export const approvedPayments=new Set<string>(["inv-1024","inv-1026"]);
export const webhookEventIds=new Set<string>();
export const paymentBatches=new Map<string,string>();
export function log(event:string,actor:string,invoice:string,details:string){audit.unshift({id:crypto.randomUUID(),event,actor,invoice,details,time:new Date().toISOString()})}
