import { useEffect, useState } from "react";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@modelcontextprotocol/sdk/client";
import { App, McpUiAppCapabilities, PostMessageTransport } from "../app";
export * from "../app";

export interface UseAppOptions {
  appInfo: Implementation;
  capabilities: McpUiAppCapabilities;
  /**
   * Called after client is created but before connection.
   * Use this to register handlers via app.ontoolinput, app.toolresult, etc.
   */
  onAppCreated?: (app: App) => void;
}

export interface AppState {
  app: App | null;
  isConnected: boolean;
  error: Error | null;
}

export function useApp({
  appInfo,
  capabilities,
  onAppCreated,
}: UseAppOptions): AppState {
  const [app, setApp] = useState<App | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        const transport = new PostMessageTransport(window.parent);
        const app = new App(appInfo, capabilities);

        // Register handlers BEFORE connecting
        onAppCreated?.(app);

        await app.connect(transport);

        if (mounted) {
          setApp(app);
          setIsConnected(true);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          setApp(null);
          setIsConnected(false);
          setError(
            error instanceof Error ? error : new Error("Failed to connect"),
          );
        }
      }
    }

    connect();

    return () => {
      mounted = false;
    };
  }, []); // Intentionally not including options to avoid reconnection

  return { app, isConnected, error };
}
