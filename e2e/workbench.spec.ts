import { test, expect } from "@playwright/test";

const POS_COMPLETED_TASKS = {
  "task-pos-guard-clause": true,
  "task-pos-fee-calculation": true,
  "task-pos-pin-lockout": true,
  "task-pos-batch-settlement": true,
  "task-pos-interface-polymorphism": true,
  "task-pos-dependency-injection": true,
  "task-pos-double-deduction-bug": true,
};

test.describe("Interactive Workbench E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-set onboarding seen so tests start cleanly at the Workshop Hub
    await page.addInitScript(() => {
      localStorage.setItem("iw_onboarding_seen", "true");
      localStorage.setItem("iw_user_track", "fintech");
    });
  });

  test("Flow 1: Workshop Hub loads with all 10 stations and allows station entry", async ({ page }) => {
    await page.goto("./");

    // Workshop Hub should display Station 01 and Station 02
    await expect(page.locator('[data-testid="station-card-tv"]')).toBeVisible();
    await expect(page.locator('[data-testid="station-card-pos"]')).toBeVisible();

    // Enter Station 02 (POS)
    const enterPosBtn = page.locator('[data-testid="enter-station-pos"]');
    await expect(enterPosBtn).toBeVisible();
    await enterPosBtn.click();

    // Inside Workbench, back to hub button should be visible
    const backBtn = page.locator("#btn-back-to-hub");
    await expect(backBtn).toBeVisible();

    // Click back to hub
    await backBtn.click();
    await expect(page.locator('[data-testid="station-card-pos"]')).toBeVisible();
  });

  test("Flow 2: Predict-Observe-Explain ('Що вибухне?') Micro-Lab Modal", async ({ page }) => {
    await page.goto("./");

    // Enter POS Station
    await page.locator('[data-testid="enter-station-pos"]').click();

    // Click POE button
    const poeBtn = page.locator('[data-testid="lab-poe-btn"]');
    await expect(poeBtn).toBeVisible();
    await poeBtn.click();

    // POE modal should open
    const modal = page.locator('[data-testid="poe-modal"]');
    await expect(modal).toBeVisible();

    // First option should be clickable
    const firstOption = page.locator('[data-testid^="poe-option-"]').first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // Run simulation
    const simulateBtn = page.locator('[data-testid="poe-simulate-btn"]');
    await expect(simulateBtn).toBeEnabled();
    await simulateBtn.click();

    // Feedback should be visible
    await expect(page.locator('[data-testid="poe-feedback"]')).toBeVisible();

    // Close modal via close button
    const closeBtn = page.locator('[data-testid="poe-close-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test("Flow 3: Station Crash Test Gate full drill", async ({ page }) => {
    // Inject completed tasks into localStorage so crash-test button is unlocked
    await page.addInitScript((tasks) => {
      localStorage.setItem("iw_completed_tasks", JSON.stringify(tasks));
      localStorage.setItem("iw_mastery_stars", JSON.stringify({
        "task-pos-guard-clause": 4,
        "task-pos-fee-calculation": 4,
        "task-pos-pin-lockout": 4,
        "task-pos-batch-settlement": 4,
        "task-pos-interface-polymorphism": 4,
        "task-pos-dependency-injection": 4,
        "task-pos-double-deduction-bug": 4,
      }));
    }, POS_COMPLETED_TASKS);

    await page.goto("./");
    await page.locator('[data-testid="enter-station-pos"]').click();

    // Crash test button should be unlocked
    const crashBtn = page.locator('[data-testid="lab-crash-btn"]');
    await expect(crashBtn).toBeVisible();
    await expect(crashBtn).toBeEnabled();
    await crashBtn.click();

    // Crash modal should be open with drill intro
    const modal = page.locator('[data-testid="crash-modal"]');
    await expect(modal).toBeVisible();

    // Start drill
    const startBtn = page.locator('[data-testid="crash-start-btn"]');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // First incident action
    const act1 = page.locator('[data-testid^="crash-action-"]').first();
    await expect(act1).toBeVisible();
    await act1.click();

    // Second incident action
    const act2 = page.locator('[data-testid^="crash-action-"]').first();
    await expect(act2).toBeVisible();
    await act2.click();

    // Success view should appear
    await expect(page.locator('[data-testid="crash-success-view"]')).toBeVisible();

    // Claim / close crash gate modal
    const claimBtn = page.locator('[data-testid="crash-claim-btn"]');
    await expect(claimBtn).toBeVisible();
    await claimBtn.click();
    await expect(modal).not.toBeVisible();

    // Passing the crash gate automatically unlocks the station victory certificate
    const victoryModal = page.locator('[data-testid="pos-cert-modal"]');
    await expect(victoryModal).toBeVisible();
    await page.locator('[data-testid="pos-cert-close-btn"]').click();
    await expect(victoryModal).not.toBeVisible();
  });

  test("Flow 4: Station Certificate Modal view & close", async ({ page }) => {
    // Inject completed tasks
    await page.addInitScript((tasks) => {
      localStorage.setItem("iw_completed_tasks", JSON.stringify(tasks));
      localStorage.setItem("iw_mastery_stars", JSON.stringify({
        "task-pos-guard-clause": 4,
        "task-pos-fee-calculation": 4,
        "task-pos-pin-lockout": 4,
        "task-pos-batch-settlement": 4,
        "task-pos-interface-polymorphism": 4,
        "task-pos-dependency-injection": 4,
        "task-pos-double-deduction-bug": 4,
      }));
    }, POS_COMPLETED_TASKS);

    await page.goto("./");
    await page.locator('[data-testid="enter-station-pos"]').click();

    // Certificate button should be visible in header
    const certBtn = page.locator('[data-testid="station-cert-btn"]');
    await expect(certBtn).toBeVisible();
    await certBtn.click();

    // Certificate modal should open
    const certModal = page.locator('[data-testid="pos-cert-modal"]');
    await expect(certModal).toBeVisible();

    // Close certificate modal
    const closeBtn = page.locator('[data-testid="pos-cert-close-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(certModal).not.toBeVisible();
  });
});

test.describe("First-Time User Onboarding E2E", () => {
  test("Flow 5: First-time user onboarding tour & starter grant", async ({ page }) => {
    // Navigate with fresh storage
    await page.goto("./");

    // Onboarding modal should be visible for first-time user
    const modal = page.locator('[data-testid="onboarding-modal"]');
    await expect(modal).toBeVisible();

    // Step through the tour slides
    const nextBtn = page.locator('[data-testid="onboarding-next-btn"]');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();

    // Finish tour and claim starter grant
    const finishBtn = page.locator('[data-testid="onboarding-finish-btn"]');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Modal closes and Starter Grant (+25 XP) is reflected
    await expect(modal).not.toBeVisible();
    await expect(page.locator("text=XP: 25").first()).toBeVisible();

    // Click to expand stations catalog for freshman view
    const expandBtn = page.getByRole("button", { name: /Переглянути всі 10 станцій/i });
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
    }
    await expect(page.locator('[data-testid="station-card-tv"]')).toBeVisible();
  });
});
