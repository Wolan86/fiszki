import type { APIRoute } from 'astro';
import { debugOpenRouterEnv } from '../../../lib/env-helper';
import { isOpenRouterAvailable } from '../../../lib/openrouter.factory';

// Set to false for production to disable this endpoint
const ENABLE_DEBUG_ENDPOINT = true;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Security check - disable in production
  if (!ENABLE_DEBUG_ENDPOINT) {
    return new Response(
      JSON.stringify({ error: 'Debug endpoint disabled in production' }),
      { status: 404 }
    );
  }
  
  try {
    // Get environment variable diagnostic info
    const envInfo = debugOpenRouterEnv();
    
    // Check if OpenRouter service can be initialized
    const serviceAvailable = isOpenRouterAvailable();
    
    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        openRouterAvailable: envInfo.available,
        serviceInitializable: serviceAvailable,
        environmentVariables: envInfo.envVars,
        runtimeInfo: {
          environment: import.meta.env.MODE || 'unknown',
          server: typeof process !== 'undefined'
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Error generating diagnostic info',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}; 