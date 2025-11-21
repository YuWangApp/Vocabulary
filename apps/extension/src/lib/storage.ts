/**
 * Utility functions for Chrome extension storage
 */

export const storage = {
  /**
   * Get a value from Chrome storage
   */
  async get<T>(key: string): Promise<T | undefined> {
    const result = await chrome.storage.local.get(key)
    return result[key] as T | undefined
  },

  /**
   * Set a value in Chrome storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },

  /**
   * Get multiple values from Chrome storage
   */
  async getMultiple<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    const result = await chrome.storage.local.get(keys)
    return result as Partial<T>
  },

  /**
   * Remove a value from Chrome storage
   */
  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },

  /**
   * Clear all Chrome storage
   */
  async clear(): Promise<void> {
    await chrome.storage.local.clear()
  },
}
