const API_URL = "http://localhost:3000/summarize"; // 🔴 replace this

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SUMMARIZE") {
    handleSummarization(request)
      .then(sendResponse)
      .catch(err => {
        sendResponse({ error: err.message || "Something went wrong" });
      });

    return true; // required for asyonc
  }
});

// Main logic
async function handleSummarization({ content, url }) {
  if (!content || content.length < 50) {
    return { error: "Not enough content to summarize." };
  }

  // 1. Check cache first
  const cached = await getCachedSummary(url);
  if (cached) {
    return {
      summary: cached.summary,
      readingTime: cached.readingTime
    };
  }

  // 2. Call backend API
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content
    })
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

const text = await response.text();

let data;

try {
  data = JSON.parse(text);
} catch (e) {
  console.error("Non-JSON response:", text);
  throw new Error("Server returned invalid response");
}

  const summary = data.summary || "No summary returned.";

  // 3. Estimate reading time
  const readingTime = estimateReadingTime(summary);

  // 4. Cache result
  await cacheSummary(url, {
    summary,
    readingTime
  });

  return {
    summary,
    readingTime
  };
}

// 📦 STORAGE HELPERS

function cacheSummary(url, data) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [url]: data }, resolve);
  });
}

function getCachedSummary(url) {
  return new Promise(resolve => {
    chrome.storage.local.get([url], result => {
      resolve(result[url]);
    });
  });
}

// ⏱️ Reading time (simple but effective)
function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}