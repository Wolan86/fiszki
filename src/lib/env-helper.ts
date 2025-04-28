/**
 * Helper utility for environment variables
 * Used to debug environment variable issues
 */

/**
 * Check if an environment variable is set
 * @param name The name of the environment variable
 */
export function isEnvSet(name: string): boolean {
  // Check browser-side environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[name] || import.meta.env[`VITE_${name}`]) {
      return true;
    }
  }
  
  // Check server-side environment variables
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name] || process.env[`VITE_${name}`]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all available environment variables for debugging
 * Only shows variable names, not values, for security
 */
export function getAvailableEnvVars(): string[] {
  const envVars: string[] = [];
  
  // Browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    Object.keys(import.meta.env).forEach(key => {
      envVars.push(`import.meta.env.${key}`);
    });
  }
  
  // Server environment
  if (typeof process !== 'undefined' && process.env) {
    Object.keys(process.env).forEach(key => {
      envVars.push(`process.env.${key}`);
    });
  }
  
  return envVars;
}

/**
 * Debug environment variable loading for the OpenRouter service
 */
export function debugOpenRouterEnv(): { available: boolean, envVars: string[] } {
  const openrouterKeyAvailable = isEnvSet('OPENROUTER_API_KEY');
  const viteOpenrouterKeyAvailable = isEnvSet('VITE_OPENROUTER_API_KEY');
  
  // Get all environment variables for debugging
  const allEnvVars = getAvailableEnvVars();
  
  // Filter for API keys
  const apiKeyVars = allEnvVars.filter(name => 
    name.includes('API_KEY') || 
    name.includes('OPENROUTER')
  );
  
  return {
    available: openrouterKeyAvailable || viteOpenrouterKeyAvailable,
    envVars: apiKeyVars
  };
} 