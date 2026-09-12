/**
 * @file apps/web/src/store/slices/apiForgeSlice.ts
 * @description Station 04: API Forge simulation slice (Client, HTTP Bus, Server)
 */

import type { StateCreator } from "zustand";
import {
  type VirtualApiState,
  type HttpMethod,
  type HttpResponse,
  INITIAL_API_STATE,
  VirtualApiServer,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, ApiForgeSlice } from "../types";

export const createApiForgeSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  ApiForgeSlice
> = (set, get) => ({
  clientDraftMethod: "GET",
  clientDraftPath: "/health",
  clientDraftHeaders: {
    "Accept": "application/json",
  },
  clientDraftBody: "",
  isPacketInFlight: false,
  packetProgress: 0,
  packetDirection: "CLIENT_TO_SERVER",
  apiState: JSON.parse(JSON.stringify(INITIAL_API_STATE)),
  lastApiResponse: null,
  isApiVictoryModalOpen: false,

  setClientDraftMethod: (m: HttpMethod) => {
    set({ clientDraftMethod: m });
  },

  setClientDraftPath: (p: string) => {
    set({ clientDraftPath: p });
  },

  setClientDraftHeaders: (h: Record<string, string>) => {
    set({ clientDraftHeaders: h });
  },

  setClientDraftBody: (b: string) => {
    set({ clientDraftBody: b });
  },

  toggleNetworkCable: () => {
    audioFx.playRelayClick();
    set((s) => ({
      apiState: {
        ...s.apiState,
        isCableBroken: !s.apiState.isCableBroken,
      },
    }));
  },

  sendClientRequest: async (): Promise<HttpResponse> => {
    const s = get();
    audioFx.playKeyClick();

    // Trigger packet animation client -> server
    set({
      isPacketInFlight: true,
      packetProgress: 10,
      packetDirection: "CLIENT_TO_SERVER",
    });

    // Simulate wire transit
    await new Promise((resolve) => setTimeout(resolve, 200));
    set({ packetProgress: 60 });

    const server = new VirtualApiServer(get().apiState);
    const response = server.handleRequest({
      method: s.clientDraftMethod,
      path: s.clientDraftPath,
      headers: s.clientDraftHeaders,
      body: s.clientDraftBody,
    });

    const updatedState = server.getSnapshot();

    // Response transit back to client
    set({
      packetDirection: "SERVER_TO_CLIENT",
      packetProgress: 90,
    });
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      audioFx.playRemoteBeep();
    } else if (response.statusCode >= 400) {
      audioFx.playErrorBuzz();
    }

    set({
      isPacketInFlight: false,
      packetProgress: 100,
      lastApiResponse: response,
      apiState: updatedState,
    });

    return response;
  },

  applyApiExecution: (updates: Partial<VirtualApiState>) => {
    set((s) => ({
      apiState: {
        ...s.apiState,
        ...updates,
      },
    }));
  },

  resetApiState: (custom?: Partial<VirtualApiState>) => {
    set({
      clientDraftMethod: "GET",
      clientDraftPath: "/health",
      clientDraftHeaders: { "Accept": "application/json" },
      clientDraftBody: "",
      isPacketInFlight: false,
      packetProgress: 0,
      lastApiResponse: null,
      apiState: {
        ...JSON.parse(JSON.stringify(INITIAL_API_STATE)),
        ...custom,
      },
    });
  },

  setApiVictoryModalOpen: (open: boolean) => {
    set({ isApiVictoryModalOpen: open });
  },
});
