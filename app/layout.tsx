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
  applicationName: "Local PDF Tools",
  // Links get shared into Reddit and Hacker News threads, so the card matters.
  openGraph: {
    type: "website",
    siteName: "Local PDF Tools",
    url: SITE_URL,
    title: "Split & Rename PDF — in your browser",
    description:
      "Split a large PDF into separate documents and name them automatically. Nothing is uploaded.",
  },
  twitter: {
    card: "summary",
    title: "Split & Rename PDF — in your browser",
    description:
      "Split a large PDF into separate documents and name them automatically. Nothing is uploaded.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link href="/" className="shrink-0 font-semibold tracking-tight">
              Local PDF Tools
            </Link>
            {/* Scrolls sideways on a phone rather than wrapping to two lines. */}
            <nav className="flex min-w-0 flex-1 justify-end gap-4 overflow-x-auto text-sm whitespace-nowrap text-ink-soft [scrollbar-width:none]">
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
