/**
 * @file scratch/test_bridge_parser.ts
 * @description Unit tests for Bridge Tasks A, B, C execution in parser.ts
 */

import { VirtualTV } from "../packages/sim-engine/src/runtime/tvContext";
import { interpretScript } from "../packages/sim-engine/src/runtime/parser";

console.log("=== 1. Testing Bridge Task A: Class & Instance ===");
{
  const tv = new VirtualTV({ isOn: false, channel: 1, volume: 50 });
  const csCode = `
    TV myTv = new TV();
    myTv.PowerOn();
  `;
  const res = interpretScript(csCode, tv);
  if (!res.success) throw new Error(`CS instantiation failed: ${res.error}`);
  if (!tv.IsOn) throw new Error("myTv.PowerOn() did not turn on TV!");
  console.log("✓ C# TV myTv = new TV(); myTv.PowerOn(); passed!");
}

{
  const tv = new VirtualTV({ isOn: false, channel: 1, volume: 50 });
  const goCode = `
    myTv := TV{}
    myTv.PowerOn()
  `;
  const res = interpretScript(goCode, tv);
  if (!res.success) throw new Error(`Go instantiation failed: ${res.error}`);
  if (!tv.IsOn) throw new Error("myTv.PowerOn() (Go) did not turn on TV!");
  console.log("✓ Go myTv := TV{}; myTv.PowerOn() passed!");
}

console.log("\n=== 2. Testing Bridge Task B: Query Method & Arithmetic ===");
{
  const tv = new VirtualTV({ isOn: true, channel: 1, volume: 50 });
  const csCode = `
    int vol = tv.GetVolume();
    tv.SetVolume(vol + 10);
  `;
  const res = interpretScript(csCode, tv);
  if (!res.success) throw new Error(`Query method failed: ${res.error}`);
  if (tv.Volume !== 60) throw new Error(`Expected volume 60, got ${tv.Volume}`);
  console.log("✓ C# int vol = tv.GetVolume(); tv.SetVolume(vol + 10); passed! Volume = 60");
}

{
  const tv = new VirtualTV({ isOn: true, channel: 1, volume: 50 });
  const goCode = `
    vol := tv.GetVolume()
    tv.SetVolume(vol - 15)
  `;
  const res = interpretScript(goCode, tv);
  if (!res.success) throw new Error(`Query method (Go) failed: ${res.error}`);
  if (tv.Volume !== 35) throw new Error(`Expected volume 35, got ${tv.Volume}`);
  console.log("✓ Go vol := tv.GetVolume(); tv.SetVolume(vol - 15); passed! Volume = 35");
}

console.log("\n=== 3. Testing Bridge Task C: NullReferenceException & Safe Guard ===");
{
  const tv = new VirtualTV({ isOn: false, channel: 1, volume: 50 });
  const brokenCode = `
    TV broken = null;
    broken.PowerOn();
  `;
  const res = interpretScript(brokenCode, tv);
  if (res.success) throw new Error("Expected NullReferenceException, but script succeeded!");
  if (!res.error?.includes("NullReferenceException")) {
    throw new Error(`Expected NullReferenceException error message, got: ${res.error}`);
  }
  console.log(`✓ Broken code caught correctly: ${res.error}`);
}

{
  const tv = new VirtualTV({ isOn: false, channel: 1, volume: 50 });
  const safeGuardCode = `
    TV broken = null;
    if (broken != null) {
      broken.PowerOn();
    }
  `;
  const res = interpretScript(safeGuardCode, tv);
  if (!res.success) throw new Error(`Safe guard failed: ${res.error}`);
  if (tv.IsOn) throw new Error("Safe guard should have prevented broken.PowerOn() from running!");
  if (!tv.isSafeGuardActive()) throw new Error("Safe guard flag was not triggered!");
  console.log("✓ Safe guard if (broken != null) { broken.PowerOn(); } correctly prevented crash and set safeGuard!");
}

{
  const tv = new VirtualTV({ isOn: false, channel: 1, volume: 50 });
  const safeCallCode = `
    TV broken = null;
    broken?.PowerOn();
  `;
  const res = interpretScript(safeCallCode, tv);
  if (!res.success) throw new Error(`Elvis safe call failed: ${res.error}`);
  if (tv.IsOn) throw new Error("Safe call should have prevented PowerOn!");
  if (!tv.isSafeGuardActive()) throw new Error("Safe guard flag was not triggered for Elvis operator!");
  console.log("✓ Safe call broken?.PowerOn(); correctly prevented crash and set safeGuard!");
}

console.log("\n=== ALL BRIDGE PARSER TESTS PASSED! ===");
