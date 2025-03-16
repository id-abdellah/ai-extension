// Main content script for Chrome extension
// This script imports and initializes various features

import { initWordExplanation } from "./wordExplanation";
import { initCodeReview } from "./codeReview";
// Import other features as needed

// Log that content script has loaded
console.log("Content script loaded.");

// Initialize all features
function initializeFeatures(): void {
    // Initialize word explanation feature
    initWordExplanation();

    // Initialize code review feature
    initCodeReview();

    // Initialize other features as needed
}

// Initialize all features when content script is loaded
initializeFeatures();

// Let background script know content script is ready
chrome.runtime.sendMessage({ action: "contentScriptReady" });
