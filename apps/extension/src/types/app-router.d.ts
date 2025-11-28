/**
 * Type declaration for the AppRouter from the web app
 * This avoids TypeScript trying to compile the web app's source files
 * when building the extension.
 *
 * For now, we use 'any' to avoid type-checking issues. Once you start
 * implementing the extension, you can:
 *
 * Option 1: Generate types from the running web app
 * Option 2: Use type inference from actual API calls
 * Option 3: Manually define the router structure here
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouter = any
