export type Mandate={currency:string;perTransactionLimit:number;monthlyLimit:number;approvedVendors:string[];requireApprovedVendor:boolean;duplicateDetection:boolean;autoPayEnabled:boolean};
export type Invoice={id:string;vendor:string;invoiceNumber:string;amount:number;currency:string;description:string;status:string;decision:string;date:string;paypalEmail?:string};
export type Evaluation={decision:"AUTO_APPROVED"|"BLOCKED"|"PENDING_APPROVAL";reasons:string[];checks:{vendorApproved:boolean;transactionLimit:boolean;monthlyLimit:boolean;duplicateCheck:boolean;currency:boolean;paymentRecipient:boolean}};
export function normalizeVendor(v:string){return v.normalize("NFKD").replace(/[^\p{L}\p{N}]/gu," ").toLowerCase().trim().replace(/\s+/g," ")}
export function evaluateInvoice(invoice:Invoice,mandate:Mandate,history:Invoice[]):Evaluation{
 const vendor=normalizeVendor(invoice.vendor), approved=mandate.approvedVendors.map(normalizeVendor).includes(vendor);
 const duplicate=history.some(x=>x.id!==invoice.id&&normalizeVendor(x.vendor)===vendor&&x.invoiceNumber.toLowerCase()===invoice.invoiceNumber.toLowerCase()&&x.amount===invoice.amount);
 const monthly=history.filter(x=>x.id!==invoice.id&&["PAID","PAYMENT_PENDING","IN_FLIGHT"].includes(x.status)&&new Date(x.date).getMonth()===new Date().getMonth()&&new Date(x.date).getFullYear()===new Date().getFullYear()).reduce((n,x)=>n+x.amount,0);
 const c={vendorApproved:!mandate.requireApprovedVendor||approved,transactionLimit:invoice.amount<=mandate.perTransactionLimit,monthlyLimit:monthly+invoice.amount<=mandate.monthlyLimit,duplicateCheck:!mandate.duplicateDetection||!duplicate,currency:invoice.currency===mandate.currency,paymentRecipient:Boolean(invoice.paypalEmail)};
 const reasons:string[]=[]; if(!c.duplicateCheck) reasons.push("Possible duplicate invoice: matching vendor, invoice number, and amount.");if(!c.vendorApproved) reasons.push("Vendor is not on the approved vendor list.");if(!c.currency) reasons.push(`Currency ${invoice.currency} does not match mandate currency ${mandate.currency}.`);if(!c.monthlyLimit) reasons.push("Monthly spending limit would be exceeded.");if(!c.transactionLimit) reasons.push("Invoice exceeds the per-transaction auto-pay limit.");
 if(!c.duplicateCheck||!c.vendorApproved||!c.currency||!c.monthlyLimit) return {decision:"BLOCKED",reasons,checks:c};
 if(!c.transactionLimit||!c.paymentRecipient||!mandate.autoPayEnabled) return {decision:"PENDING_APPROVAL",reasons:!c.paymentRecipient?["Vendor PayPal recipient is missing; correct the invoice details before payment."]:reasons.length?reasons:["Manual authorization is required by the active mandate."],checks:c};
 return {decision:"AUTO_APPROVED",reasons:["All deterministic mandate checks passed."],checks:c};
}
