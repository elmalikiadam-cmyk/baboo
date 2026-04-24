import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("features", () => {
  const ORIGINAL = { ...process.env };

  beforeEach(() => {
    delete process.env.FEATURE_MANAGED_VISITS;
    delete process.env.FEATURE_PROMOTER_PACKS;
    delete process.env.FEATURE_PARTNER_ROUTING;
    delete process.env.FEATURE_OWNER_SERVICES;
    delete process.env.FEATURE_VERIFIED_BADGE;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("defaults all flags to ON when env is absent", async () => {
    const mod = await import("../features");
    expect(mod.FEATURES.managedVisits).toBe(true);
    expect(mod.FEATURES.promoterPacks).toBe(true);
    expect(mod.FEATURES.partnerRouting).toBe(true);
    expect(mod.FEATURES.ownerServices).toBe(true);
    expect(mod.FEATURES.verifiedBadge).toBe(true);
  });

  it("turns OFF when env is '0'", async () => {
    process.env.FEATURE_MANAGED_VISITS = "0";
    const mod = await import("../features");
    expect(mod.FEATURES.managedVisits).toBe(false);
  });

  it("turns OFF when env is 'false'", async () => {
    process.env.FEATURE_PROMOTER_PACKS = "false";
    const mod = await import("../features");
    expect(mod.FEATURES.promoterPacks).toBe(false);
  });

  it("accepts 'true' / '1' / 'on' as truthy", async () => {
    process.env.FEATURE_MANAGED_VISITS = "true";
    process.env.FEATURE_PROMOTER_PACKS = "1";
    process.env.FEATURE_PARTNER_ROUTING = "on";
    const mod = await import("../features");
    expect(mod.FEATURES.managedVisits).toBe(true);
    expect(mod.FEATURES.promoterPacks).toBe(true);
    expect(mod.FEATURES.partnerRouting).toBe(true);
  });

  it("falls back to default when value is unintelligible", async () => {
    process.env.FEATURE_OWNER_SERVICES = "maybe";
    const mod = await import("../features");
    expect(mod.FEATURES.ownerServices).toBe(true);
  });

  it("isFeatureEnabled wraps the flag map", async () => {
    process.env.FEATURE_VERIFIED_BADGE = "0";
    const mod = await import("../features");
    expect(mod.isFeatureEnabled("verifiedBadge")).toBe(false);
    expect(mod.isFeatureEnabled("managedVisits")).toBe(true);
  });
});
