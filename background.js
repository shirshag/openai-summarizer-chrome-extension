chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "processText") {
    chrome.storage.sync.get(['apiKey'], function(result) {
      const apiKey = result.apiKey;
      fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: `${request.data}\n\n${request.action === "summarize" ? "Summarize:" : "Rewrite:"}`,
          max_tokens: 1024
        })
      })
      .then(response => response.json())
      .then(data => {

        if (data.choices && data.choices[0] && data.choices[0].text) {
          // Send message to content script with the response data
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "openaiResponse", data: data.choices[0].text.trim()});
          });
        } else {
          console.error('Unexpected API response:', data);
        }
      })
      .catch(error => {
        alert('Error summarizing text. Please try again.');
        console.error('Error:', error);
      });
    });
    // Must return true to indicate that the response is sent asynchronously
    return true;
  }
});


chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "rewrite",
    title: "Rewrite",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize") {
    processText("summarize", info.selectionText);
  } else if (info.menuItemId === "rewrite") {
    processText("rewrite", info.selectionText);
  }
});

function processText(action, selectedText) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    chrome.tabs.sendMessage(activeTab.id, { type: "callOpenAI", action, data: selectedText });
  });
}
