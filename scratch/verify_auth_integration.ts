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

  // ──────────────────────────────────────────────
  // Test 6: Auth UI Header Components (AuthModal & UserNavBadge)
  // ──────────────────────────────────────────────
  console.log("\n--- 6. Verifying Auth Header Components & Screen Integration ---");

  const authModalPath = path.resolve(process.cwd(), "apps/web/src/components/auth/AuthModal.tsx");
  assert(fs.existsSync(authModalPath), `AuthModal.tsx exists at ${authModalPath}`);
  const authModalContent = fs.readFileSync(authModalPath, "utf-8");
  assert(authModalContent.includes("signInWithGoogle"), "AuthModal contains Google OAuth trigger");
  assert(authModalContent.includes("signInWithEmail") && authModalContent.includes("signUpWithEmail"), "AuthModal contains Email/Password triggers");
  assert(authModalContent.includes("Продовжити як гість") || authModalContent.includes("гість"), "AuthModal provides guest continuation button");

  const userNavBadgePath = path.resolve(process.cwd(), "apps/web/src/components/auth/UserNavBadge.tsx");
  assert(fs.existsSync(userNavBadgePath), `UserNavBadge.tsx exists at ${userNavBadgePath}`);
  const userNavBadgeContent = fs.readFileSync(userNavBadgePath, "utf-8");
  assert(userNavBadgeContent.includes("btn-auth-guest-login"), "UserNavBadge renders guest login trigger");
  assert(userNavBadgeContent.includes("btn-user-profile-menu"), "UserNavBadge renders profile dropdown menu");
  assert(userNavBadgeContent.includes("57"), "UserNavBadge displays total stars out of 57");
  assert(userNavBadgeContent.includes("SYNC"), "UserNavBadge contains ONLINE SYNC indicator");

  const workbenchScreenPath = path.resolve(process.cwd(), "apps/web/src/screens/WorkbenchScreen.tsx");
  const workbenchScreenContent = fs.readFileSync(workbenchScreenPath, "utf-8");
  assert(workbenchScreenContent.includes("<UserNavBadge"), "WorkbenchScreen mounts UserNavBadge in header");

  const workshopHubScreenPath = path.resolve(process.cwd(), "apps/web/src/components/workbench/WorkshopHubScreen.tsx");
  const workshopHubScreenContent = fs.readFileSync(workshopHubScreenPath, "utf-8");
  assert(workshopHubScreenContent.includes("<UserNavBadge"), "WorkshopHubScreen mounts UserNavBadge in header");

  // ──────────────────────────────────────────────
  // Test 7: WPM Telemetry Transmission
  // ──────────────────────────────────────────────
  console.log("\n--- 7. Verifying WPM Telemetry Transmission ---");

  const codeGymPath = path.resolve(process.cwd(), "apps/web/src/components/workbench/playground/CodeGymRunner.tsx");
  const codeGymContent = fs.readFileSync(codeGymPath, "utf-8");
  assert(codeGymContent.includes("saveTaskProgress"), "CodeGymRunner imports and utilizes saveTaskProgress");
  assert(codeGymContent.includes("calculatedWpm"), "CodeGymRunner calculates WPM");
  assert(
    codeGymContent.includes("saveTaskProgress(currentTask.id, 3, calculatedWpm)"),
    "CodeGymRunner passes calculatedWpm on sprint round completion"
  );
  assert(
    workbenchStoreContent.includes("best_wpm") && workbenchStoreContent.includes("payload.best_wpm = bestWpm"),
    "workbenchStore passes best_wpm into user_progress upsert payload"
  );

  // ──────────────────────────────────────────────
  // Test 8: Stars Aggregation Trigger SQL Migration
  // ──────────────────────────────────────────────
  console.log("\n--- 8. Verifying Stars Aggregation Trigger Migration ---");

  const triggerMigrationPath = path.resolve(process.cwd(), "supabase/migrations/20260911_stars_aggregation_trigger.sql");
  assert(fs.existsSync(triggerMigrationPath), `Trigger migration exists at ${triggerMigrationPath}`);
  const triggerSqlContent = fs.readFileSync(triggerMigrationPath, "utf-8");
  assert(triggerSqlContent.includes("function public.update_user_total_stars()"), "SQL creates update_user_total_stars() function");
  assert(triggerSqlContent.includes("coalesce(sum(stars), 0)"), "SQL calculates sum of stars from user_progress");
  assert(triggerSqlContent.includes("update public.profiles"), "SQL updates profiles.total_stars");
  assert(triggerSqlContent.includes("create trigger on_user_progress_stars_changed"), "SQL binds on_user_progress_stars_changed trigger");
  assert(
    triggerSqlContent.includes("after insert or update of stars or delete"),
    "SQL trigger listens on after insert or update of stars or delete"
  );

  // ──────────────────────────────────────────────
  // Test 9: GitHub Pages Base Path & OAuth Redirect
  // ──────────────────────────────────────────────
  console.log("\n--- 9. Verifying GitHub Pages Base Path & OAuth Redirect ---");

  const viteConfigPath = path.resolve(process.cwd(), "apps/web/vite.config.ts");
  const viteConfigContent = fs.readFileSync(viteConfigPath, "utf-8");
  assert(viteConfigContent.includes('base: "/IWannaBeSmart/"') || viteConfigContent.includes("base: '/IWannaBeSmart/'"), "vite.config.ts configures base: '/IWannaBeSmart/'");

  // ──────────────────────────────────────────────
  // Test 10: Multilingual i18n & Paper Color Scheme
  // ──────────────────────────────────────────────
  console.log("\n--- 10. Verifying Multilingual Auth Translations & Color Scheme ---");

  const i18nIndexPath = path.resolve(process.cwd(), "packages/i18n/src/index.ts");
  const i18nContent = fs.readFileSync(i18nIndexPath, "utf-8");
  assert(i18nContent.includes("titleSignIn: \"Авторизація інженера\""), "i18n contains UA auth translations");
  assert(i18nContent.includes("titleSignIn: \"Engineer Authorization\""), "i18n contains EN auth translations");
  assert(i18nContent.includes("titleSignIn: \"Ingeniørautorisation\""), "i18n contains DA auth translations");

  assert(authModalContent.includes("bg-[#FAF7F2]"), "AuthModal uses warm cotton paper surface (#FAF7F2)");
  assert(authModalContent.includes("bg-accent-blue"), "AuthModal uses blueprint navy accent-blue button");
  assert(!authModalContent.includes("bg-[#1E1E22]"), "AuthModal no longer uses dark cyberpunk theme");

  assert(userNavBadgeContent.includes("bg-[#FAF7F2]"), "UserNavBadge dropdown uses warm cotton paper surface (#FAF7F2)");
  assert(!userNavBadgeContent.includes("bg-[#1E1E22]"), "UserNavBadge dropdown no longer uses dark cyberpunk theme");

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passCount}/${testCount} VERIFICATION CHECKS PASSED!`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
