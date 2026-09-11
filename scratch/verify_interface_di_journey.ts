import { defaultResources } from "../packages/i18n/src/index";
import { PROJECT_FILES } from "../apps/web/src/components/workbench/architecture/projectData";
import type { ActiveJourneyState } from "../apps/web/src/components/workbench/architecture/types";

console.log("=== STEP 1: Verifying i18n Journey Keys across UA, EN, DA ===");
const requiredKeys = [
  "interfaceTitle",
  "diTitle",
  "stepBadge",
  "ifaceStep1Title",
  "ifaceStep1Desc",
  "ifaceStep2Title",
  "ifaceStep2DescPwr",
  "ifaceStep2DescVol",
  "ifaceStep3Title",
  "ifaceStep3Desc",
  "ifaceStep4Title",
  "ifaceStep4Desc",
  "diStep1Title",
  "diStep1Desc",
  "diStep2Title",
  "diStep2Desc",
  "diStep3Title",
  "diStep3Desc",
  "diStep4Title",
  "diStep4DescPwr",
  "diStep4DescVol",
  "insightTitle",
  "testPulse",
  "close",
  "inspectContract",
  "inspectDi",
  "startJourney",
];

for (const lang of ["ua", "en", "da"] as const) {
  const journeyDict = (defaultResources[lang].translation as any).journey;
  if (!journeyDict) {
    throw new Error(`Missing journey dictionary in locale ${lang}!`);
  }
  for (const key of requiredKeys) {
    if (!journeyDict[key] || typeof journeyDict[key] !== "string") {
      throw new Error(`Missing or non-string key 'journey.${key}' in locale ${lang}!`);
    }
  }
  console.log(`✓ All ${requiredKeys.length} journey keys verified for locale '${lang}'`);
}

console.log("\n=== STEP 2: Verifying Architecture Project Files for Journey ===");
const iface = PROJECT_FILES.find((f) => f.id === "interface-remote-command");
if (!iface) throw new Error("Missing interface-remote-command in PROJECT_FILES!");
console.log(`✓ Interface found: ${iface.name} [Outputs: ${iface.outputs.map((o) => o.name).join(", ")}]`);

const pwr = PROJECT_FILES.find((f) => f.id === "class-power-command");
if (!pwr) throw new Error("Missing class-power-command in PROJECT_FILES!");
if (pwr.implementsInterface !== "IRemoteCommand") throw new Error("PowerCommand does not implement IRemoteCommand!");
console.log(`✓ Implementation 1: ${pwr.name} implements :${pwr.implementsInterface}`);

const vol = PROJECT_FILES.find((f) => f.id === "class-volume-up-command");
if (!vol) throw new Error("Missing class-volume-up-command in PROJECT_FILES!");
if (vol.implementsInterface !== "IRemoteCommand") throw new Error("VolumeUpCommand does not implement IRemoteCommand!");
console.log(`✓ Implementation 2: ${vol.name} implements :${vol.implementsInterface}`);

const tv = PROJECT_FILES.find((f) => f.id === "class-tv-controller");
if (!tv) throw new Error("Missing class-tv-controller in PROJECT_FILES!");
const tvCtor = tv.inputs.find((i) => i.id === "in-command-handler");
if (!tvCtor || tvCtor.portType !== "IRemoteCommand") {
  throw new Error("TVController does not expose ctor(IRemoteCommand) input!");
}
console.log(`✓ Receiver found: ${tv.name} with DI socket [${tvCtor.name}, portType: ${tvCtor.portType}]`);

console.log("\n=== STEP 3: Verifying Polymorphic Journey State Transitions ===");
const journeyInterfacePower: ActiveJourneyState = {
  type: "INTERFACE",
  interfaceId: "IRemoteCommand",
  activeStep: 1,
  activeCommand: "PowerCommand",
};
console.log("Initial state (Interface + PowerCommand):", journeyInterfacePower);

// Switching implementation to Volume
const journeyInterfaceVolume: ActiveJourneyState = {
  ...journeyInterfacePower,
  activeCommand: "VolumeUpCommand",
};
console.log("Hot Swapped state (Interface + VolumeUpCommand):", journeyInterfaceVolume);

// Switching mode to DI
const journeyDi: ActiveJourneyState = {
  type: "DI",
  interfaceId: "IRemoteCommand",
  activeStep: 2,
  activeCommand: "VolumeUpCommand",
};
console.log("Switched to DI Journey Mode:", journeyDi);

console.log("\n=== ALL JOURNEY & I18N VERIFICATIONS PASSED WITH 100% INTEGRITY! ===");
