import { describe, expect, it } from "vitest";
import { _filterByPeriod, _calcPeriodReturn } from "@/composables/fund/useFundDetail";
import type { ACWorthPoint } from "@/types/fund";

// Helper: generate points from a base date going back N days
const makePoints = (count: number, baseTs: number, startNav = 1.0): ACWorthPoint[] => {
  const DAY = 86400000;
  return Array.from({ length: count }, (_, i) => [
    baseTs - (count - 1 - i) * DAY,
    startNav + i * 0.01,
  ] as ACWorthPoint);
};

// 2025-12-31 00:00 UTC
const BASE = new Date("2025-12-31T00:00:00Z").getTime();

describe("filterByPeriod", () => {
  const points = makePoints(400, BASE); // ~400 days of data

  it("returns empty for empty input", () => {
    expect(_filterByPeriod([], "6m")).toEqual([]);
  });

  it("filters to roughly 30 days for '1m'", () => {
    const result = _filterByPeriod(points, "1m");
    expect(result.length).toBeGreaterThan(25);
    expect(result.length).toBeLessThanOrEqual(35);
  });

  it("filters to roughly 1 week for '1w'", () => {
    const result = _filterByPeriod(points, "1w");
    expect(result.length).toBeGreaterThanOrEqual(7);
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it("filters to roughly 180 days for '6m'", () => {
    const result = _filterByPeriod(points, "6m");
    expect(result.length).toBeGreaterThan(170);
    expect(result.length).toBeLessThanOrEqual(190);
  });

  it("filters to roughly 365 days for '1y'", () => {
    const result = _filterByPeriod(points, "1y");
    expect(result.length).toBeGreaterThan(355);
    expect(result.length).toBeLessThanOrEqual(400);
  });

  it("filters 'ytd' from Jan 1st of the latest point's year", () => {
    const result = _filterByPeriod(points, "ytd");
    const jan1 = new Date(2025, 0, 1).getTime();
    expect(result[0]![0]).toBeGreaterThanOrEqual(jan1);
  });

  it("clamps long periods like '10y' to the fund inception date", () => {
    const shortHistory = makePoints(120, BASE);
    const result = _filterByPeriod(shortHistory, "10y");
    expect(result).toHaveLength(120);
    expect(result[0]).toEqual(shortHistory[0]);
  });
});

describe("calcPeriodReturn", () => {
  it("calculates positive return correctly", () => {
    const pts: ACWorthPoint[] = [[1, 1.0], [2, 1.1]];
    const ret = _calcPeriodReturn(pts);
    expect(ret).toBeCloseTo(10.0);
  });

  it("calculates negative return correctly", () => {
    const pts: ACWorthPoint[] = [[1, 2.0], [2, 1.8]];
    const ret = _calcPeriodReturn(pts);
    expect(ret).toBeCloseTo(-10.0);
  });

  it("returns null for insufficient points", () => {
    expect(_calcPeriodReturn([])).toBeNull();
    expect(_calcPeriodReturn([[1, 1.0]])).toBeNull();
  });

  it("returns null when start value is 0", () => {
    expect(_calcPeriodReturn([[1, 0], [2, 1.0]])).toBeNull();
  });
});
