/**
 * @file apps/web/src/components/ui/__tests__/ErrorBoundary.test.ts
 * @description Unit tests for production React ErrorBoundary logic and state transitions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

describe("ErrorBoundary component logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should derive state with hasError true on error occurrence", () => {
    const error = new Error("Simulated circuit bus failure");
    const derivedState = ErrorBoundary.getDerivedStateFromError(error);

    expect(derivedState.hasError).toBe(true);
    expect(derivedState.error).toBe(error);
  });

  it("should log error telemetry and update state in componentDidCatch", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boundary = new ErrorBoundary({ children: null });
    const setStateSpy = vi.spyOn(boundary, "setState");

    const error = new Error("Virtual memory overflow");
    const errorInfo = { componentStack: "\n    in ProblematicComponent" };

    boundary.componentDidCatch(error, errorInfo);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Hardware Fault]"),
      error,
      errorInfo
    );
    expect(setStateSpy).toHaveBeenCalledWith({ errorInfo });
  });
});
