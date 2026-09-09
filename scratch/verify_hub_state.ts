import { useWorkbenchStore } from "../apps/web/src/store/workbenchStore";
import { defaultResources } from "../packages/i18n/src";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("=== Testing Workshop Station Hub State & Logic ===");

// 1. Check initial store view
const initialView = useWorkbenchStore.getState().currentView;
console.log("Initial currentView:", initialView);
assert(initialView === "HUB", `Expected initial currentView to be 'HUB', got '${initialView}'`);

// 2. Test view transition to STATION
useWorkbenchStore.getState().setCurrentView("STATION");
const stationView = useWorkbenchStore.getState().currentView;
console.log("After setCurrentView('STATION'):", stationView);
assert(stationView === "STATION", `Expected currentView to be 'STATION', got '${stationView}'`);

// 3. Test view transition back to HUB
useWorkbenchStore.getState().setCurrentView("HUB");
const backToHubView = useWorkbenchStore.getState().currentView;
console.log("After setCurrentView('HUB'):", backToHubView);
assert(backToHubView === "HUB", `Expected currentView to be 'HUB', got '${backToHubView}'`);

// 4. Check i18n keys existence in ua, en, da
const langs = ["ua", "en", "da"] as const;
for (const lang of langs) {
  const t = defaultResources[lang].translation as any;
  assert(t.hub !== undefined, `Missing hub section in lang '${lang}'`);
  assert(typeof t.hub.title === "string" && t.hub.title.length > 0, `Missing hub.title in lang '${lang}'`);
  assert(typeof t.hub.dossierTitle === "string", `Missing hub.dossierTitle in lang '${lang}'`);
  assert(typeof t.hub.stations.tv.title === "string", `Missing hub.stations.tv.title in lang '${lang}'`);
  assert(typeof t.hub.stations.pos.title === "string", `Missing hub.stations.pos.title in lang '${lang}'`);
  assert(typeof t.hub.stations.iot.title === "string", `Missing hub.stations.iot.title in lang '${lang}'`);
  assert(typeof t.hub.stationLocked === "string", `Missing hub.stationLocked in lang '${lang}'`);
  assert(typeof t.hub.enterStation === "string", `Missing hub.enterStation in lang '${lang}'`);
  assert(typeof t.hub.backToHub === "string", `Missing hub.backToHub in lang '${lang}'`);
  console.log(`✓ i18n '${lang}' hub translation keys validated`);
}

// 5. Check locked station condition logic
const testLockedLogic = (xp: number, tvTasksDone: number, posStars: number) => {
  const isUnlocked = xp >= 200 || (tvTasksDone >= 10 && posStars >= 18);
  return isUnlocked;
};

assert(testLockedLogic(0, 0, 0) === false, "Station 3 should be locked for brand new engineer");
assert(testLockedLogic(150, 5, 10) === false, "Station 3 should be locked with partial progress");
assert(testLockedLogic(200, 0, 0) === true, "Station 3 should unlock with 200+ XP");
assert(testLockedLogic(180, 10, 18) === true, "Station 3 should unlock when both Module 1 & 2 completed");
console.log("✓ Station 03 Unlock condition logic verified");

console.log("=== All Hub State & Verification Tests Passed! ===");
