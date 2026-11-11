declare module "pdf-parse" {
  type PdfData = { text: string };
  export default function parsePdf(data: Buffer): Promise<PdfData>;
}
