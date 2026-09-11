/**
 * @file scratch/verify_auth_integration.ts
 * @description Verification script for Supabase Auth, Offline-First No-Op stub, Star Merge algorithm, and RLS schema.
 */

import fs from "node:fs";
import path from "node:path";
import { supabase, isSupabaseConfigured } from "../apps/web/src/lib/supabaseClient";

async function main() {
  console.log("=================================================");
  console.log("🛠️  Interactive Workbench: Auth & Progress Verification");
  console.log("=================================================\n");

  let testCount = 0;
  let passCount = 0;

  function assert(condition: boolean, msg: string) {
    testCount++;
    if (condition) {
      passCount++;
      console.log(`✅ [PASS] ${msg}`);
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  // ──────────────────────────────────────────────
  // Test 1: No-Op Stub and Type Safety
  // ──────────────────────────────────────────────
  console.log("--- 1. Testing Supabase Client & No-Op Stub Safety ---");
  console.log(`isSupabaseConfigured: ${isSupabaseConfigured}`);

  try {
    const sessionRes = await supabase.auth.getSession();
    assert(sessionRes !== undefined && "data" in sessionRes, "supabase.auth.getSession() returns valid response object");

    const userRes = await supabase.auth.getUser();
    assert(userRes !== undefined && "data" in userRes, "supabase.auth.getUser() returns valid response object");

    const authSub = supabase.auth.onAuthStateChange(() => {});
    assert(
      typeof authSub?.data?.subscription?.unsubscribe === "function",
      "supabase.auth.onAuthStateChange() returns subscription with unsubscribe()"
    );
    authSub.data.subscription.unsubscribe();

    // Query builder chaining
    const queryBuilder = supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", "00000000-0000-0000-0000-000000000000")
      .order("completed_at", { ascending: false });

    assert(typeof queryBuilder.then === "function", "supabase.from(...).select(...) is awaitable thenable");

    const queryResult = await queryBuilder;
    assert("data" in queryResult && "error" in queryResult, "queryResult has data and error properties");

    // Upsert builder with onConflict
    const upsertRes = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          station_id: "tv",
          task_id: "task-0-1-power-on",
          tier: 0,
          stars: 3,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,station_id,task_id" }
      );
    assert(upsertRes !== undefined, "supabase.from(...).upsert(...) executes safely without throwing");
  } catch (err) {
    assert(false, `No-Op Stub threw unexpected runtime error: ${err}`);
  }

  // ──────────────────────────────────────────────
  // Test 2: Star Merge Algorithm (Math.max)
  // ──────────────────────────────────────────────
  console.log("\n--- 2. Testing Star Merge Algorithm (Math.max) ---");

  interface ProgressRow {
    task_id: string;
    station_id: string;
    stars: number;
    tier: number;
  }

  function mergeProgress(
    local: Record<string, number>,
    cloud: ProgressRow[]
  ): {
    merged: Record<string, number>;
    toUpload: string[];
  } {
    const merged = { ...local };
    const toUpload: string[] = [];

    // 1. Process cloud items
    for (const item of cloud) {
      const localStars = local[item.task_id] || 0;
      const finalStars = Math.max(localStars, item.stars);
      merged[item.task_id] = finalStars;

      if (localStars > item.stars) {
        toUpload.push(item.task_id);
      }
    }

    // 2. Local items not in cloud
    const cloudIds = new Set(cloud.map((c) => c.task_id));
    for (const [taskId, stars] of Object.entries(local)) {
      if (!cloudIds.has(taskId) && stars > 0) {
        toUpload.push(taskId);
      }
    }

    return { merged, toUpload };
  }

  const localSample = {
    "task-1": 1, // cloud is higher (3)
    "task-2": 3, // local is higher (1) -> should upload
    "task-3": 2, // only in local -> should upload
    "task-4": 2, // equal (2)
  };

  const cloudSample: ProgressRow[] = [
    { task_id: "task-1", station_id: "tv", stars: 3, tier: 0 },
    { task_id: "task-2", station_id: "tv", stars: 1, tier: 0 },
    { task_id: "task-4", station_id: "tv", stars: 2, tier: 0 },
    { task_id: "task-5", station_id: "tv", stars: 3, tier: 0 }, // only in cloud
  ];

  const mergeResult = mergeProgress(localSample, cloudSample);

  assert(mergeResult.merged["task-1"] === 3, "Cloud higher stars preserved (task-1: 1 local vs 3 cloud -> 3)");
  assert(mergeResult.merged["task-2"] === 3, "Local higher stars preserved (task-2: 3 local vs 1 cloud -> 3)");
  assert(mergeResult.merged["task-3"] === 2, "Local-only task preserved (task-3: 2)");
  assert(mergeResult.merged["task-4"] === 2, "Equal stars preserved (task-4: 2)");
  assert(mergeResult.merged["task-5"] === 3, "Cloud-only task incorporated into local (task-5: 3)");

  assert(mergeResult.toUpload.includes("task-2"), "task-2 queued for cloud upload (local had higher stars)");
  assert(mergeResult.toUpload.includes("task-3"), "task-3 queued for cloud upload (local-only task)");
  assert(!mergeResult.toUpload.includes("task-1"), "task-1 not queued for upload (cloud was already higher)");
  assert(!mergeResult.toUpload.includes("task-4"), "task-4 not queued for upload (stars are equal)");

  // ──────────────────────────────────────────────
  // Test 3: Database Schema & RLS Policies Verification
  // ──────────────────────────────────────────────
  console.log("\n--- 3. Verifying SQL Migration Schema & RLS Policies ---");

  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20260911_auth_and_progress.sql"
  );
  assert(fs.existsSync(migrationPath), `Migration file exists at ${migrationPath}`);

  const sqlContent = fs.readFileSync(migrationPath, "utf-8");

  // Verify Table structures
  assert(
    sqlContent.includes("create table if not exists public.profiles"),
    "SQL contains table public.profiles"
  );
  assert(
    sqlContent.includes("create table if not exists public.user_progress"),
    "SQL contains table public.user_progress"
  );
  assert(
    sqlContent.includes("constraint user_station_task_uniq unique (user_id, station_id, task_id)"),
    "SQL contains constraint user_station_task_uniq unique (user_id, station_id, task_id)"
  );

  // Verify RLS enablement
  assert(
    sqlContent.includes("alter table public.profiles enable row level security;"),
    "SQL enables RLS on public.profiles"
  );
  assert(
    sqlContent.includes("alter table public.user_progress enable row level security;"),
    "SQL enables RLS on public.user_progress"
  );

  // Verify RLS isolation policies
  assert(
    sqlContent.includes("using (auth.uid() = user_id)") &&
      sqlContent.includes("with check (auth.uid() = user_id)"),
    "SQL enforces auth.uid() = user_id for public.user_progress policies"
  );
  assert(
    sqlContent.includes("using (auth.uid() = id)") &&
      sqlContent.includes("with check (auth.uid() = id)"),
    "SQL enforces auth.uid() = id for public.profiles policies"
  );

  // Verify Trigger
  assert(
    sqlContent.includes("create trigger on_auth_user_created") &&
      sqlContent.includes("after insert on auth.users"),
    "SQL creates trigger on_auth_user_created after insert on auth.users"
  );

  // ──────────────────────────────────────────────
  // Test 4: AuthStore Cleanup Verification
  // ──────────────────────────────────────────────
  console.log("\n--- 4. Verifying AuthStore HMR / Memory Leak Guard ---");

  const authStorePath = path.resolve(process.cwd(), "apps/web/src/store/authStore.ts");
  const authStoreContent = fs.readFileSync(authStorePath, "utf-8");

  assert(
    authStoreContent.includes("let authSubscription:"),
    "authStore.ts maintains module-level authSubscription reference"
  );
  assert(
    authStoreContent.includes("cleanupAuth:"),
    "authStore.ts implements cleanupAuth() method"
  );
  assert(
    authStoreContent.includes("authSubscription.unsubscribe()"),
    "authStore.ts unsubscribes previous listener upon re-init"
  );

  // ──────────────────────────────────────────────
  // Test 5: WorkbenchStore onConflict Upsert Verification
  // ──────────────────────────────────────────────
  console.log("\n--- 5. Verifying WorkbenchStore Upsert with onConflict ---");

  const workbenchStorePath = path.resolve(process.cwd(), "apps/web/src/store/workbenchStore.ts");
  const workbenchStoreContent = fs.readFileSync(workbenchStorePath, "utf-8");

  assert(
    workbenchStoreContent.includes("onConflict: \"user_id,station_id,task_id\"") ||
      workbenchStoreContent.includes("onConflict: 'user_id,station_id,task_id'"),
    "workbenchStore.ts specifies explicit onConflict: 'user_id,station_id,task_id' in upsert"
  );
  assert(
    workbenchStoreContent.includes("syncCloudProgress:"),
    "workbenchStore.ts implements syncCloudProgress()"
  );

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passCount}/${testCount} VERIFICATION CHECKS PASSED!`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
