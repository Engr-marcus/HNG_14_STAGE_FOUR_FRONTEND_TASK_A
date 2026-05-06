function getCleanText() {
  // Prefer article content
  const article = document.querySelector("article");

  let text = "";

  if (article) {
    text = article.innerText;
  } else {
    // Fallback: collect meaningful paragraphs
    const paragraphs = Array.from(document.querySelectorAll("p"))
      .map(p => p.innerText.trim())
      .filter(p => p.length > 40); // remove tiny junk

    text = paragraphs.join("\n\n");
  }

  // Limit size (important for API)
  const MAX_LENGTH = 8000;
  return text.slice(0, MAX_LENGTH);
}

// Optional: highlight long paragraphs (bonus feature)
function highlightImportantText() {
  document.querySelectorAll("p").forEach(p => {
    if (p.innerText.length > 200) {
      p.style.backgroundColor = "rgba(255,255,0,0.2)";
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_CONTENT") {
    try {
      const content = getCleanText();

      sendResponse({
        content,
        length: content.length
      });
    } catch (err) {
      sendResponse({ error: "Failed to extract content" });
    }
  }

  if (request.type === "HIGHLIGHT") {
    highlightImportantText();
  }
});