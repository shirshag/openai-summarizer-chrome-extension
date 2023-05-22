function updateSelectedText() {
    chrome.storage.local.get('selectedText', function(data) {
      document.getElementById('selected-text').innerHTML = `You have selected: <i>${data.selectedText}</i>`;
    });
  }
  
  document.getElementById('summarize').addEventListener('click', function() {
    chrome.storage.local.get('selectedText', function(data) {
      chrome.runtime.sendMessage({type: "processText", action: "summarize", data: data.selectedText});
    });
  });
  
  document.getElementById('rewrite').addEventListener('click', function() {
    chrome.storage.local.get('selectedText', function(data) {
      chrome.runtime.sendMessage({type: "processText", action: "rewrite", data: data.selectedText});
    });
  });
  
  updateSelectedText();
  