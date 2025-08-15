/**
 * Dynamic Function Router for Deno Deploy
 * Auto-discovers and routes requests to functions in the functions/ directory
 */

import { join, dirname, fromFileUrl } from "https://deno.land/std@0.208.0/path/mod.ts";

export interface FunctionInfo {
  name: string;
  path: string;
  handler: (req: Request) => Response | Promise<Response>;
}

export interface RouterResponse {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp: string;
}

class FunctionRouter {
  private functions = new Map<string, FunctionInfo>();
  private functionsDir: string;

  constructor() {
    // Get the directory where this router file is located
    const currentFile = fromFileUrl(import.meta.url);
    this.functionsDir = dirname(currentFile);
  }

  /**
   * Auto-discover and register all function files
   */
  async discoverFunctions(): Promise<void> {
    console.log("🔍 Discovering functions in:", this.functionsDir);
    
    try {
      for await (const entry of Deno.readDir(this.functionsDir)) {
        if (entry.isFile && entry.name.endsWith('.ts')) {
          // Skip router.ts and any utility files
          if (entry.name === 'router.ts') continue;
          
          const functionName = entry.name.replace('.ts', '');
          const functionPath = join(this.functionsDir, entry.name);
          
          try {
            // Dynamic import of the function
            const module = await import(`file://${functionPath}`);
            
            if (module.default && typeof module.default === 'function') {
              this.functions.set(functionName, {
                name: functionName,
                path: functionPath,
                handler: module.default,
              });
              
              console.log(`✅ Registered function: ${functionName} -> /${functionName}`);
            } else {
              console.warn(`⚠️  Skipped ${entry.name}: No default export function found`);
            }
          } catch (error) {
            console.error(`❌ Failed to load ${entry.name}:`, error.message);
          }
        }
      }
      
      console.log(`🎉 Discovered ${this.functions.size} functions\n`);
    } catch (error) {
      console.error("❌ Error discovering functions:", error);
    }
  }

  /**
   * Handle incoming requests and route to appropriate function
   */
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Root path - show available functions
    if (pathname === "/" || pathname === "") {
      return this.createIndexResponse(corsHeaders);
    }

    // Extract function name from path (e.g., /hello -> hello)
    const functionName = pathname.slice(1).split('/')[0];
    
    if (this.functions.has(functionName)) {
      try {
        const functionInfo = this.functions.get(functionName)!;
        console.log(`📡 Routing ${method} ${pathname} -> ${functionInfo.name}`);
        
        // Call the function handler
        const response = await functionInfo.handler(req);
        
        // Add CORS headers to the response
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        console.error(`❌ Error in function ${functionName}:`, error);
        return this.createErrorResponse(
          `Error executing function: ${error.message}`,
          corsHeaders,
          500
        );
      }
    }

    // Function not found
    return this.createErrorResponse(
      `Function '${functionName}' not found`,
      corsHeaders,
      404
    );
  }

  /**
   * Create index response showing available functions
   */
  private createIndexResponse(corsHeaders: Record<string, string>): Response {
    const functionList = Array.from(this.functions.values()).map(func => ({
      name: func.name,
      endpoint: `/${func.name}`,
      description: `Function handler for ${func.name}`,
    }));

    const responseData = {
      success: true,
      message: "Hola",
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    message: string,
    corsHeaders: Record<string, string>,
    status = 400
  ): Response {
    const responseData: RouterResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }

  /**
   * Get list of registered functions
   */
  getRegisteredFunctions(): string[] {
    return Array.from(this.functions.keys());
  }
}

// Create router instance
const router = new FunctionRouter();

/**
 * Main handler function for the router
 */
export default async function handler(req: Request): Promise<Response> {
  // Discover functions on first request (lazy loading)
  if (router.getRegisteredFunctions().length === 0) {
    await router.discoverFunctions();
  }
  
  return await router.handleRequest(req);
}

// For local development with Deno serve
if (import.meta.main) {
  console.log("🚀 Dynamic Function Router starting on port 8000");
  console.log("🔗 Visit: http://localhost:8000");
  console.log("📋 Functions will be auto-discovered and registered\n");
  
  // Discover functions at startup
  await router.discoverFunctions();
  
  Deno.serve({ port: 8000 }, handler);
}
