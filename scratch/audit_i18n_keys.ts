import { defaultResources } from "../packages/i18n/src/index";

function getDeepKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const newPrefix = prefix ? `${prefix}.${k}` : k;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getDeepKeys(val, newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

const uaKeys = new Set(getDeepKeys(defaultResources.ua.translation));
const enKeys = new Set(getDeepKeys(defaultResources.en.translation));
const daKeys = new Set(getDeepKeys(defaultResources.da.translation));

console.log("Total UA keys:", uaKeys.size);
console.log("Total EN keys:", enKeys.size);
console.log("Total DA keys:", daKeys.size);

const missingInEn = [...uaKeys].filter((k) => !enKeys.has(k));
const missingInDa = [...uaKeys].filter((k) => !daKeys.has(k));

console.log("\nKeys present in UA but MISSING in EN (", missingInEn.length, "):");
missingInEn.forEach((k) => console.log("  -", k));

console.log("\nKeys present in UA but MISSING in DA (", missingInDa.length, "):");
missingInDa.forEach((k) => console.log("  -", k));

// Also check if any key in EN or DA is identical to UA (meaning untranslated copy-paste of Ukrainian text!)
const untranslatedInEn: string[] = [];
const untranslatedInDa: string[] = [];

function getValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

for (const k of uaKeys) {
  const uaVal = getValue(defaultResources.ua.translation, k);
  if (typeof uaVal === "string" && uaVal.length > 3 && /[а-яА-ЯіїєґІЇЄҐ]/.test(uaVal)) {
    const enVal = getValue(defaultResources.en.translation, k);
    if (enVal && /[а-яА-ЯіїєґІЇЄҐ]/.test(enVal)) {
      untranslatedInEn.push(`${k}: "${enVal}"`);
    }
    const daVal = getValue(defaultResources.da.translation, k);
    if (daVal && /[а-яА-ЯіїєґІЇЄҐ]/.test(daVal)) {
      untranslatedInDa.push(`${k}: "${daVal}"`);
    }
  }
}

console.log("\nKeys in EN containing Cyrillic (untranslated copies) (", untranslatedInEn.length, "):");
untranslatedInEn.slice(0, 30).forEach((k) => console.log("  -", k));

console.log("\nKeys in DA containing Cyrillic (untranslated copies) (", untranslatedInDa.length, "):");
untranslatedInDa.slice(0, 30).forEach((k) => console.log("  -", k));
