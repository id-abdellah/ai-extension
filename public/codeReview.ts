// Code Review Feature


// Define interfaces for type safety
interface CodeReviewMessage {
  action: string;
  code?: string;
  originalCode?: string;
  review?: string;
}

// UI elements
let codeReviewPopup: HTMLDivElement | null = null;
let codeReviewOverlay: HTMLDivElement | null = null;

/**
 * Initialize the code review feature
 */
export function initCodeReview(): void {
  console.log("💻 Code review feature initialized");
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message: CodeReviewMessage) => {
    if (message.action === "showCodeReview") {
      console.log("🔍 Selected code received:", message.code);
      requestCodeReview(message.code as string);
    }
    else if (message.action === "displayCodeReview") {
      console.log("📝 Code review received:", message.review);
      showCodeReviewPopup(message.originalCode as string, message.review as string);
    }
  });
  
  // Setup context menu selection handler
  setupSelectionHandler();
}

/**
 * Setup handler for code selection
 */
function setupSelectionHandler(): void {
  document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection()?.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      // Check if the selection might be code
      if (isLikelyCode(selectedText)) {
        console.log("✓ Code selection detected (use context menu to get review)");
      }
    }
  });
}

/**
 * Simple heuristic to check if text is likely code
 * @param text - The text to check
 */
function isLikelyCode(text: string): boolean {
  // Simple check for common code patterns
  return (
    text.includes('{') && text.includes('}') ||
    text.includes('function') ||
    text.includes('class') ||
    text.includes('def ') ||
    text.includes('import ') ||
    text.includes('var ') ||
    text.includes('const ') ||
    text.includes('let ')
  );
}

/**
 * Request a code review from the background script
 * @param code - The code to review
 */
function requestCodeReview(code: string): void {
  chrome.runtime.sendMessage({
    action: "fetchCodeReview",
    code: code
  }).catch(error => {
    console.error("❌ Error sending message to background script:", error);
    showCodeReviewPopup(code, "Error: Could not connect to code review service. Please try again.");
  });
}

/**
 * Show the code review popup
 * @param originalCode - The original code
 * @param review - The code review
 */
function showCodeReviewPopup(originalCode: string, review: string): void {
  // Remove any existing popups first
  removeCodeReviewPopup();
  
  // Create overlay
  codeReviewOverlay = document.createElement('div');
  codeReviewOverlay.id = 'code-review-overlay';
  codeReviewOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
  `;
  
  // Create popup
  codeReviewPopup = document.createElement('div');
  codeReviewPopup.id = 'code-review-popup';
  
  // Position in the center of the screen
  codeReviewPopup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 20px;
    max-width: 700px;
    width: 80%;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 2147483647;
    font-family: Arial, sans-serif;
    text-align: left;
  `;
  
  // Check if it's an error message
  const isError = review.startsWith('Error:');
  
  // Create content
  codeReviewPopup.innerHTML = `
    <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
      <div style="font-weight: bold; margin-bottom: 5px; font-size: 18px;">Code Review</div>
    </div>
    <div style="margin-bottom: 15px;">
      <div style="font-weight: bold; margin-bottom: 5px;">Original Code:</div>
      <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;"><code>${escapeHtml(originalCode)}</code></pre>
    </div>
    <div>
      <div style="font-weight: bold; margin-bottom: 5px;">Review:</div>
      <div style="background-color: ${isError ? '#fff0f0' : '#f5f5f5'}; padding: 10px; border-radius: 4px; ${isError ? 'color: #d32f2f;' : ''}">
        ${isError ? review : formatReview(review)}
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px;">
      <button id="close-code-review-popup" style="background: #4285f4; color: white; border: none; 
          padding: 8px 20px; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(codeReviewOverlay);
  document.body.appendChild(codeReviewPopup);
  
  // Add event listeners
  document.getElementById('close-code-review-popup')?.addEventListener('click', removeCodeReviewPopup);
  codeReviewOverlay.addEventListener('click', removeCodeReviewPopup);
  
  console.log("🖼️ Code review popup displayed");
}

/**
 * Format the review text with paragraphs and highlighting
 * @param text - The review text
 */
function formatReview(text: string): string {
  // Split by paragraphs and wrap in paragraph tags
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  // Format code blocks
  const formattedText = text
    .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  
  if (paragraphs.length <= 1) {
    return formattedText;
  }
  
  return paragraphs.map(p => `<p>${p}</p>`).join('');
}

/**
 * Escape HTML special characters
 * @param text - The text to escape
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Remove the code review popup
 */
function removeCodeReviewPopup(): void {
  if (codeReviewPopup) {
    document.body.removeChild(codeReviewPopup);
    codeReviewPopup = null;
  }
  
  if (codeReviewOverlay) {
    document.body.removeChild(codeReviewOverlay);
    codeReviewOverlay = null;
  }
}