/**
 * @file packages/ui/src/index.ts
 * @description Base export for the UI module stub (Interactive Workbench, Block A, Item 5)
 */

export const UI_PACKAGE_NAME = "@iw/ui";
export const UI_PACKAGE_VERSION = "0.0.1";

export interface UIComponentStubMeta {
  name: string;
  ready: boolean;
}

export const uiStubStatus: UIComponentStubMeta = {
  name: UI_PACKAGE_NAME,
  ready: true,
};
