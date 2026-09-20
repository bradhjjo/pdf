import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Split & Rename PDF — in your browser",
    template: "%s | Local PDF Tools",
  },
  description:
    "Split a large PDF into separate documents and name them automatically. Runs entirely in your browser — files are never uploaded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Local PDF Tools
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm text-ink-soft">
              <Link href="/split-pdf" className="hover:text-ink">Split</Link>
              <Link href="/merge-pdf" className="hover:text-ink">Merge</Link>
              <Link href="/extract-pages" className="hover:text-ink">Extract</Link>
              <Link href="/delete-pages" className="hover:text-ink">Delete</Link>
              <Link href="/reorder-pdf" className="hover:text-ink">Reorder</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-soft">
            Every file stays on your device. Nothing is uploaded to a server.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
