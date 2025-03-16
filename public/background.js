// Background script for Chrome Extension


console.log("🔄 Background script loaded.");

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(handleExtensionInstall);

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(handleMessage);

/**
 * Initializes the extension when installed or updated.
 * Sets default storage values and creates the context menu.
 */
function handleExtensionInstall() {
  console.log("🛠️ Extension installed. Setting up context menu and default settings...");

  chrome.storage.sync.set({
    apiKey: ''  //Set API Key
  });

  createContextMenus();
}

/**
 * Creates context menu items for the extension's features.
 */
function createContextMenus() {
  // Context menu for word explanation
  chrome.contextMenus.create({
    id: "explain",
    title: "Explain this term",
    contexts: ["selection"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("❌ Error creating 'explain' context menu:", chrome.runtime.lastError);
    }
  });

  // Context menu for code review
  chrome.contextMenus.create({
    id: "reviewCode",
    title: "Review this code",
    contexts: ["selection"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("❌ Error creating 'reviewCode' context menu:", chrome.runtime.lastError);
    }
  });

  console.log("✅ Context menus created successfully.");
}

/**
 * Handles context menu clicks, executes the content script, and dispatches the appropriate action.
 * @param {Object} info - Information about the clicked context menu item.
 * @param {Object} tab - The tab where the selection was made.
 */
function handleContextMenuClick(info, tab) {
  console.log("🖱️ Context menu clicked:", info.menuItemId);

  if (!info.selectionText || !tab.id) {
    return;
  }

  ensureContentScript(tab.id, () => {
    if (info.menuItemId === "explain") {
      sendMessageToContentScript(tab.id, {
        action: "showExplanation",
        text: info.selectionText
      });
    } 
    else if (info.menuItemId === "reviewCode") {
      sendMessageToContentScript(tab.id, {
        action: "showCodeReview",
        code: info.selectionText
      });
    }
  });
}

/**
 * Ensures the content script is loaded before sending messages to it.
 * @param {number} tabId - The ID of the tab.
 * @param {Function} callback - The function to execute after injecting the script.
 */
function ensureContentScript(tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["contentScript.js"]
  }).then(() => {
    console.log("✅ Content script executed.");
    callback();
  }).catch(error => {
    console.error("❌ Error executing content script:", error);
  });
}

/**
 * Sends a message to the content script in a given tab.
 * @param {number} tabId - The ID of the tab.
 * @param {Object} message - The message to send.
 */
function sendMessageToContentScript(tabId, message) {
  console.log(`📤 Sending message to tab ${tabId}:`, message);
  
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    console.error("❌ Error sending message:", error);
  });
}


/**
 * Handles incoming messages from the content script.
 * @param {Object} message - The received message.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Function to send a response.
 * @returns {boolean} - Whether to keep the message channel open for async response.
 */
function handleMessage(message, sender, sendResponse) {
  console.log("📩 Message received in background.js:", message);

  // Handle fetch explanation request
  if (message.action === "fetchExplanation" && message.text) {
    fetchExplanation(message.text)
      .then(explanation => {
        if (sender.tab?.id) {
          sendMessageToContentScript(sender.tab.id, {
            action: "displayExplanation",
            originalText: message.text,
            explanation: explanation
          });
        }
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("❌ Explanation error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  // Handle fetch code review request
  if (message.action === "fetchCodeReview" && message.code) {
    fetchCodeReview(message.code)
      .then(review => {
        if (sender.tab?.id) {
          sendMessageToContentScript(sender.tab.id, {
            action: "displayCodeReview",
            originalCode: message.code,
            review: review
          });
        }
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("❌ Code review error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }

  return false;
}



/**
 * Fetches an explanation for a term using the Gemini API.
 * @param {string} text - The term to explain.
 * @returns {Promise<string>} - The explanation.
 */
async function fetchExplanation(text) {
  try {
    const { apiKey } = await chrome.storage.sync.get(['apiKey']);

    if (!apiKey) {
      throw new Error("❌ No API key found. Please set your Gemini API key in the extension settings.");
    }

    console.log(`🔗 Calling Gemini API for explanation: "${text}"`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Explain "${text}" in a simple and concise way with historical or contextual information if relevant.` }]
        }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`🚨 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const explanation = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!explanation) {
      throw new Error("❌ No explanation received from API.");
    }

    return explanation;
  } catch (error) {
    console.error("❌ Error fetching explanation:", error.message);
    return `Error: ${error.message}`;
  }
}


/**
 * Fetches a code review using the Gemini API.
 * @param {string} code - The code to review.
 * @returns {Promise<string>} - The code review.
 */
async function fetchCodeReview(code) {
  try {
    const result = await chrome.storage.sync.get(['apiKey']);
    const apiKey = result.apiKey;

    if (!apiKey) {
      throw new Error("No API key found. Please add your Gemini API key in the extension settings.");
    }

    console.log("🔗 Calling Gemini API for code review");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Review the following code. Provide feedback on:
                    1. Any potential bugs or issues
                    2. Ways to improve performance
                    3. Best practices that could be applied
                    Format your review with clear sections and code examples where helpful.
                    
                    Code to review:
                    \`\`\`
                    ${code}
                    \`\`\`` }]
        }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    const review = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!review) {
      throw new Error("No code review returned from API");
    }

    return review;
  } catch (error) {
    console.error("❌ Code review API error:", error);
    throw error;
  }
}