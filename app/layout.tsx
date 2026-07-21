import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Actually... — receipts, not vibes",
  description: "An evidence-native research agent for claims that matter."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
