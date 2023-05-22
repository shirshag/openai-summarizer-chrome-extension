console.log('content.js loaded');


document.addEventListener('mouseup', function () {
  var selectedText = window.getSelection().toString().trim();
  console.log('selectedText', selectedText);
  chrome.storage.local.set({ selectedText: selectedText });
  if (selectedText.length > 0) {
    chrome.runtime.sendMessage({ type: "textSelection", data: selectedText });
  }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "openaiResponse") {
    // Create div
    var newDiv = document.createElement("div");
    newDiv.style.position = "fixed";
    newDiv.style.bottom = "10px";
    newDiv.style.right = "10px";
    newDiv.style.padding = "10px";
    newDiv.style.backgroundColor = "#343541";
    newDiv.style.color = "#ffffff";
    newDiv.style.border = "1px solid #000000";
    newDiv.style.zIndex = 9999;

    // Create text node with OpenAI response
    var responseText = document.createTextNode(request.data);
    newDiv.appendChild(responseText);

    // Create close button
    var closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.margin = "5px";
    closeButton.style.padding = "5px";
    closeButton.style.backgroundColor = "#343541";
    closeButton.style.color = "#ffffff";
    closeButton.onclick = function () {
      document.body.removeChild(newDiv);
    };

    // Add close button to div
    newDiv.appendChild(closeButton);

    // Add div to body
    document.body.appendChild(newDiv);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "callOpenAI") {
    chrome.storage.sync.get(['apiKey'], function (result) {
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
            var newDiv = document.createElement("div");
            newDiv.style.position = "fixed";
            newDiv.style.bottom = "10px";
            newDiv.style.right = "10px";
            newDiv.style.padding = "10px";
            newDiv.style.backgroundColor = "#343541";
            newDiv.style.color = "#ffffff";
            newDiv.style.border = "1px solid #000000";
            newDiv.style.zIndex = 9999;

            // Create text node with OpenAI response
            var responseText = document.createTextNode(data.choices[0].text.trim());
            newDiv.appendChild(responseText);

            // Create close button
            var closeButton = document.createElement("button");
            closeButton.textContent = "Close";
            closeButton.style.position = "absolute";
            closeButton.style.top = "0";
            closeButton.style.right = "0";
            closeButton.style.margin = "5px";
            closeButton.style.padding = "5px";
            closeButton.style.backgroundColor = "#343541";
            closeButton.style.color = "#ffffff";
            closeButton.onclick = function () {
              document.body.removeChild(newDiv);
            };

            // Add close button to div
            newDiv.appendChild(closeButton);

            // Add div to body
            document.body.appendChild(newDiv);
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
