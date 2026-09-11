/**
 * @file scratch/verify_profile_analytics.ts
 * @description Verification script for Engineer Profile, Avatar/Callsign customization, and Learning Diagnostics.
 */

import fs from "node:fs";
import path from "node:path";
import { useAuthStore } from "../apps/web/src/store/authStore";

async function main() {
  console.log("=================================================");
  console.log("🛠️  Interactive Workbench: Profile & Analytics Verification");
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

  // 1. SQL Migration Check
  console.log("--- 1. Verifying Google OAuth SQL Trigger Migration ---");
  const sqlPath = path.resolve(process.cwd(), "supabase/migrations/20260911_google_oauth_profile_sync.sql");
  assert(fs.existsSync(sqlPath), "Migration 20260911_google_oauth_profile_sync.sql exists");
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  assert(sqlContent.includes("new.raw_user_meta_data->>'picture'"), "SQL extracts Google picture");
  assert(sqlContent.includes("new.raw_user_meta_data->>'full_name'"), "SQL extracts Google full_name");
  assert(sqlContent.includes("on conflict (id) do update"), "SQL handles conflict on user id");

  // 2. Multilingual Translations Check
  console.log("\n--- 2. Verifying Multilingual Profile Translations (UA, EN, DA) ---");
  const i18nPath = path.resolve(process.cwd(), "packages/i18n/src/index.ts");
  const i18nContent = fs.readFileSync(i18nPath, "utf-8");
  assert(i18nContent.includes("modalTitle: \"Профіль та аналітика інженера\""), "UA profile translations present");
  assert(i18nContent.includes("modalTitle: \"Engineer Profile & Analytics\""), "EN profile translations present");
  assert(i18nContent.includes("modalTitle: \"Ingeniørprofil og analyse\""), "DA profile translations present");
  assert(i18nContent.includes("strengthsTitle:"), "strengthsTitle key present");
  assert(i18nContent.includes("growthAreasTitle:"), "growthAreasTitle key present");

  // 3. UserProfileModal Component Check
  console.log("\n--- 3. Verifying UserProfileModal Component ---");
  const profileModalPath = path.resolve(process.cwd(), "apps/web/src/components/profile/UserProfileModal.tsx");
  assert(fs.existsSync(profileModalPath), "UserProfileModal.tsx exists");
  const modalContent = fs.readFileSync(profileModalPath, "utf-8");
  assert(modalContent.includes("PRESET_AVATARS"), "Modal defines preset engineer avatars");
  assert(modalContent.includes("handleSaveProfile"), "Modal implements handleSaveProfile");
  assert(modalContent.includes("strengths"), "Modal computes learning strengths");
  assert(modalContent.includes("growthAreas"), "Modal computes growth areas");
  assert(modalContent.includes("practiceTaskBtn"), "Modal includes practice action buttons");

  // 4. UserNavBadge Integration Check
  console.log("\n--- 4. Verifying UserNavBadge Profile Trigger ---");
  const badgePath = path.resolve(process.cwd(), "apps/web/src/components/auth/UserNavBadge.tsx");
  const badgeContent = fs.readFileSync(badgePath, "utf-8");
  assert(badgeContent.includes("UserProfileModal"), "UserNavBadge imports UserProfileModal");
  assert(badgeContent.includes("btn-open-user-profile"), "UserNavBadge includes profile open button");
  assert(badgeContent.includes("isProfileModalOpen"), "UserNavBadge manages isProfileModalOpen state");

  // 5. Store UpdateProfile Check
  console.log("\n--- 5. Verifying authStore updateProfile ---");
  const initialProfile = useAuthStore.getState().profile;
  const updateRes = await useAuthStore.getState().updateProfile({
    callsign: "Cyber-Ghost",
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=cyber",
  });
  assert(updateRes.error === null, "updateProfile executed without error");
  const updated = useAuthStore.getState().profile;
  assert(updated?.callsign === "Cyber-Ghost", "Store updated callsign to Cyber-Ghost");
  assert(updated?.avatar_url === "https://api.dicebear.com/7.x/bottts/svg?seed=cyber", "Store updated avatar_url");

  console.log("\n=================================================");
  console.log(`🎉 ALL ${passCount}/${testCount} VERIFICATION CHECKS PASSED!`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
