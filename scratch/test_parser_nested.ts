import { VirtualTV } from "./packages/sim-engine/src/runtime/tvContext";

// Test balanced braces extraction
function extractBalancedBraces(
  str: string,
  openBraceIdx: number
): { body: string; endIdx: number } | null {
  let depth = 0;
  for (let i = openBraceIdx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return {
          body: str.slice(openBraceIdx + 1, i),
          endIdx: i,
        };
      }
    }
  }
  return null;
}

const testNestedCode = `
if (!tv.IsOn) {
    tv.PowerOn();
    if (tv.Channel > 4) {
        tv.SetChannel(1);
    }
}
`;

const ifMatch = testNestedCode.trim().match(/^if\s*(?:\(([^)]+)\)|([^{\s]+(?:[^{]*?[^\s{])?))\s*\{/i);
console.log("ifMatch:", ifMatch?.[0]);
if (ifMatch) {
  const braces = extractBalancedBraces(testNestedCode.trim(), ifMatch[0].length - 1);
  console.log("Extracted body:", braces?.body);
  console.log("EndIdx:", braces?.endIdx);
  console.log("Remaining:", testNestedCode.trim().slice(braces!.endIdx + 1));
}
