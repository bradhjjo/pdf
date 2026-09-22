import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSiteUrl() {
  vi.resetModules();
  return (await import("../lib/site")).SITE_URL;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SITE_URL", () => {
  it("prefers an explicit origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pdftools.example/");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "ignored.vercel.app");
    expect(await loadSiteUrl()).toBe("https://pdftools.example");
  });

  it("falls back to the Vercel production URL, which has no scheme", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "local-pdf-tools.vercel.app");
    expect(await loadSiteUrl()).toBe("https://local-pdf-tools.vercel.app");
  });

  it("falls back to localhost when nothing is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(await loadSiteUrl()).toBe("http://localhost:3000");
  });
});
