// Word Explanation Feature
import { marked } from "marked";
interface ExplanationMessage {
  action: string;
  text?: string;
  originalText?: string;
  explanation?: string;
}


export function initWordExplanation(): void {
  console.log("📚 Word explanation feature initialized");
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message: ExplanationMessage) => {
    if (message.action === "showExplanation") {
      console.log("🔍 Selected text received:", message.text);
      requestExplanation(message.text as string);
    }
    else if (message.action === "displayExplanation") {
      console.log("📖 Explanation received:", message.explanation);
      showExplanationPopup(message.originalText as string, message.explanation as string);
    }
  });
  
  // Setup context menu selection handler
  setupSelectionHandler();
}

function setupSelectionHandler(): void {
  document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection()?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      console.log("✓ Selection detected (use context menu to get explanation)");
    }
  });
}

function requestExplanation(text: string): void {
  chrome.runtime.sendMessage({
    action: "fetchExplanation",
    text: text
  }).catch(error => {
    console.error("❌ Error sending message to background script:", error);
    showExplanationPopup(text, "Error: Could not connect to explanation service. Please try again.");
  });
}



// UI elements
let explanationPopup: HTMLDivElement | null = null;
let explanationOverlay: HTMLDivElement | null = null;

async function showExplanationPopup(originalText: string, explanation: string): Promise<void> {
  removeExplanationPopup();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  explanationPopup = document.createElement('div');
  explanationPopup.id = 'explanation-popup';
  explanationPopup.style.cssText = `
    position: absolute;
    top: ${window.scrollY + rect.top - 60}px;
    left: ${window.scrollX + rect.left}px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 10px;
    max-width: 300px;
    z-index: 2147483647;
    font-family: Arial, sans-serif;
    text-align: left;
  `;

  // Wait for Markdown to be converted
  const formattedExplanation = await formatExplanation(explanation);

  explanationPopup.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${originalText}</div>
    <div>${formattedExplanation}</div>
    <button id="close-explanation-popup" style="margin-top:10px;">Close</button>
  `;

  document.body.appendChild(explanationPopup);
  document.getElementById('close-explanation-popup')?.addEventListener('click', removeExplanationPopup);
}


/**
 * Format the explanation text with paragraphs and highlighting
 * @param text - The explanation text
 */
async function formatExplanation(text: string): Promise<string> {
  return await marked(text);
}


function removeExplanationPopup(): void {
  if (explanationPopup) {
    document.body.removeChild(explanationPopup);
    explanationPopup = null;
  }
  
  if (explanationOverlay) {
    document.body.removeChild(explanationOverlay);
    explanationOverlay = null;
  }
}