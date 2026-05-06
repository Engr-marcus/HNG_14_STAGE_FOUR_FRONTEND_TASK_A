const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const loading = document.getElementById("loading");
const summaryContainer = document.getElementById("summaryContainer");
const readingTime = document.getElementById("readingTime");
const pageTitle = document.getElementById("pageTitle");

let currentSummary = "";

summarizeBtn.addEventListener("click", async () => {
  loading.classList.remove("hidden");

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  pageTitle.textContent = tab.title;

  chrome.tabs.sendMessage(
    tab.id,
    { type: "GET_CONTENT" },
    (response) => {
      chrome.runtime.sendMessage(
        {
          type: "SUMMARIZE",
          content: response.content,
          url: tab.url
        },
        (result) => {
          loading.classList.add("hidden");

          if (result.error) {
            summaryContainer.innerHTML = `<p>${result.error}</p>`;
            return;
          }

          currentSummary = result.summary;

          summaryContainer.innerHTML = `
            <div>${result.summary.replace(/\n/g, "<br>")}</div>
          `;

          readingTime.textContent = `Reading time: ${result.readingTime || "2 min"}`;
        }
      );
    }
  );
});

clearBtn.addEventListener("click", () => {
  currentSummary = "";
  summaryContainer.innerHTML =
    '<p class="placeholder">Your summary will appear here.</p>';
});

copyBtn.addEventListener("click", async () => {
  if (!currentSummary) return;
  await navigator.clipboard.writeText(currentSummary);
  copyBtn.textContent = "Copied!";
  setTimeout(() => {
    copyBtn.textContent = "Copy Summary";
  }, 1500);
});