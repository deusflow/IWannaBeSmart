import React, { useEffect } from "react";
import { WorkbenchScreen } from "./screens/WorkbenchScreen";
import { useAuthStore } from "./store/authStore";
import { useWorkbenchStore } from "./store/workbenchStore";

export const App: React.FC = () => {
  useEffect(() => {
    // 1. Initialize Supabase Auth session & listeners
    useAuthStore.getState().initAuth();

    // 2. Synchronize cloud progress whenever user logs in or changes
    let lastUserId: string | null = null;
    const unsub = useAuthStore.subscribe((state) => {
      const currentUserId = state.user?.id ?? null;
      if (currentUserId && currentUserId !== lastUserId) {
        lastUserId = currentUserId;
        useWorkbenchStore.getState().syncCloudProgress(currentUserId);
      } else if (!currentUserId) {
        lastUserId = null;
      }
    });

    return () => {
      unsub();
      useAuthStore.getState().cleanupAuth();
    };
  }, []);

  return <WorkbenchScreen />;
};
