import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"MandatePay · Your money. Your rules.",description:"Autonomous bill payments governed by enforceable spending mandates."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
