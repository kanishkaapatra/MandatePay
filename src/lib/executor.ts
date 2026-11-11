import type {Invoice} from "./policy";
import {createPayout} from "./paypal";
import {approvedPayments,log,paymentBatches} from "./store";

export async function executeAuthorizedPayment(invoice:Invoice,actor="PAYMENT_EXECUTOR"){
 if(invoice.decision!=="AUTO_APPROVED"&&invoice.status!=="PAYMENT_AUTHORIZED")throw new Error("Invoice has no authorized payment state.");
 if(!invoice.paypalEmail)throw new Error("Vendor PayPal recipient is missing.");
 if(approvedPayments.has(invoice.id))throw new Error("Payment already initiated; reconcile existing status before retrying.");
 approvedPayments.add(invoice.id);invoice.status="PAYMENT_PENDING";
 log("PAYMENT_INITIATED",actor,invoice.invoiceNumber,"Payout request submitted; awaiting verified status.");
 try{const p=await createPayout({invoiceId:invoice.id,email:invoice.paypalEmail,amount:invoice.amount,currency:invoice.currency,reference:invoice.invoiceNumber});paymentBatches.set(p.batchId,invoice.id);if(p.status==="SUCCESS"){invoice.status="PAID";log("PAYMENT_COMPLETED","PAYPAL_SANDBOX",invoice.invoiceNumber,`${p.mode} · batch ${p.batchId}`)}else log("PAYMENT_STATUS","PAYPAL_SANDBOX",invoice.invoiceNumber,`${p.mode} · ${p.status}`);return p}
 catch(e){log("PAYMENT_RECONCILIATION_REQUIRED","PAYMENT_EXECUTOR",invoice.invoiceNumber,"Payout result uncertain; query PayPal before any retry.");throw e}
}
