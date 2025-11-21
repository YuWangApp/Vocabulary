// Background service worker for the extension
// This runs in the background and can handle events

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Vocabulary extension installed!')

    // Initialize default settings
    chrome.storage.local.set({
      defaultList: 'My Vocabulary',
      sourceLanguage: 'auto',
      targetLanguage: 'en',
    })
  }
})

// Listen for toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

// Handle messages from the sidepanel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message:', message)

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get(null, (settings) => {
      sendResponse(settings)
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === 'SAVE_SETTINGS') {
    chrome.storage.local.set(message.settings, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

export {} // Make this a module
