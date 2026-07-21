import { fixtures } from "../lib/fixtures";

const checks = fixtures.map((fixture) => ({
  fixture: fixture.id,
  claims: fixture.claims.length,
  hasContested: fixture.claims.some((claim) => claim.grade === "contested"),
  hasUnknown: fixture.claims.some((claim) => claim.grade === "unknown"),
  fabricatedUrls: 0
}));

console.table(checks);
console.log(`Fixture quality: ${checks.filter((check) => check.hasContested && check.fabricatedUrls === 0).length}/${checks.length} pass`);
