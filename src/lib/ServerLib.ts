import ConvertTOMK_Object from "./BaseLibConverter";
import { requireString } from "./RequireFunctions";
import { toNative } from "./Utils";

class ServerLib {
    private currentServer: import("bun").Server<any> | null = null;

    /**
     * Starts an HTTP server.
     * @param options Object containing port and other server options.
     * @param handler A generic handler callback function (Request, Server) => Response.
     */
    public start(options: any, handler: Function) {
        if (this.currentServer) {
            throw "A server is already running. Call stop() first.";
        }

        const nativeOptions = toNative(options) || {};
        const port = nativeOptions.port || 3000;

        this.currentServer = Bun.serve({
            port: port,
            fetch: async (req, server) => {
                try {
                    // Convert native Request to a dictionary for CursorScript
                    const url = new URL(req.url);

                    // Build headers object
                    const headers: Record<string, string> = {};
                    req.headers.forEach((value, key) => {
                        headers[key] = value;
                    });

                    // Try to parse body if present
                    let bodyText = null;
                    let bodyJson = null;
                    if (req.method !== "GET" && req.method !== "HEAD") {
                        try {
                            bodyText = await req.clone().text();
                            try {
                                bodyJson = JSON.parse(bodyText);
                            } catch (e) {
                                // Not JSON
                            }
                        } catch (e) {
                            // Failed to read body
                        }
                    }

                    const cursorReq = {
                        method: req.method,
                        url: req.url,
                        pathname: url.pathname,
                        search: url.search,
                        headers: headers,
                        bodyText: bodyText,
                        bodyJson: bodyJson
                    };

                    // Call the user's handler
                    const result = await handler(cursorReq, server);

                    // Handle the result from CursorScript
                    if (!result) {
                        return new Response("OK");
                    }

                    if (typeof result === "string") {
                        return new Response(result);
                    }

                    // If it's a native object returned from CursorScript
                    const nativeResult = toNative(result);

                    if (typeof nativeResult === "object" && nativeResult !== null) {
                        const status = nativeResult.status || 200;
                        const resHeaders = nativeResult.headers || {};

                        let bodyContent = nativeResult.body;
                        if (typeof bodyContent === "object" && bodyContent !== null) {
                            bodyContent = JSON.stringify(bodyContent);
                            if (!resHeaders["Content-Type"]) {
                                resHeaders["Content-Type"] = "application/json";
                            }
                        }

                        return new Response(bodyContent || "", {
                            status: status,
                            headers: resHeaders
                        });
                    }

                    return new Response(String(result));

                } catch (e: any) {
                    // In CursorScript, 'return' inside a callback throws a ReturnSignal.
                    // We need to catch it and extract the value.
                    if (e && e.value && typeof e.value === "object" && e.value.type) {
                        const result = e.value;

                        // Replicate the response parsing logic
                        if (typeof result === "string" || result.type === "string") {
                            return new Response(result.value || result);
                        }

                        const nativeResult = toNative(result);
                        if (typeof nativeResult === "object" && nativeResult !== null) {
                            const status = nativeResult.status || 200;
                            const resHeaders = nativeResult.headers || {};

                            let bodyContent = nativeResult.body;
                            if (typeof bodyContent === "object" && bodyContent !== null) {
                                bodyContent = JSON.stringify(bodyContent);
                                if (!resHeaders["Content-Type"]) {
                                    resHeaders["Content-Type"] = "application/json";
                                }
                            }

                            return new Response(bodyContent || "", {
                                status: status,
                                headers: resHeaders
                            });
                        }

                        return new Response(String(nativeResult));
                    }

                    console.error("Server Error:", e);
                    return new Response(`Internal Server Error: ${e.message || e}`, { status: 500 });
                }
            },
            websocket: {
                message(ws, message) {
                    const handler = (ws.data as any)?.messageHandler;
                    if (handler) {
                        handler(ws, typeof message === "string" ? message : new TextDecoder().decode(message as Uint8Array));
                    }
                },
                open(ws) {
                    const handler = (ws.data as any)?.openHandler;
                    if (handler) {
                        handler(ws);
                    }
                },
                close(ws, code, message) {
                    const handler = (ws.data as any)?.closeHandler;
                    if (handler) {
                        handler(ws, code, message);
                    }
                },
                drain(ws) {
                    const handler = (ws.data as any)?.drainHandler;
                    if (handler) {
                        handler(ws);
                    }
                }
            }
        });

        return `Server started on http://${this.currentServer.hostname}:${this.currentServer.port}`;
    }

    /**
     * Upgrades a request to a WebSocket connection.
     * @param req The original request object from the handler.
     * @param handlers Object containing open, message, close callbacks.
     */
    public upgrade(req: any, handlers: any) {
        if (!this.currentServer) {
            throw "Server is not running.";
        }

        const nativeHandlers = toNative(handlers) || {};

        // We expect the original native Bun request object, but since we map it, 
        // it's tricky to pass the raw request through CursorScript bindings cleanly without a symbol or wrapping.
        // For simplicity in this implementation, upgrade should be called inside fetch if needed, 
        // but the actual Bun `req` isn't exposed directly to Cursor. 
        // We need to pass the raw request via a hidden symbol or similar if we want to fully support .upgrade().
        throw "WebSocket upgrade is not yet fully implemented for CursorScript.";
    }

    /**
     * Stops the server.
     */
    public stop() {
        if (this.currentServer) {
            this.currentServer.stop(true);
            this.currentServer = null;
            return "Server stopped.";
        }
        return "No server is running.";
    }
}

export const ServerL = ConvertTOMK_Object(new ServerLib());
