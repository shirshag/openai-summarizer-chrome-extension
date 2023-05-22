document.getElementById('save').addEventListener('click', function() {
    const apiKey = document.getElementById('api-key-input').value;
    chrome.storage.sync.set({'apiKey': apiKey}, function() {
      alert('API Key saved!');
    });
  });
  
  // When the options page is loaded, set the input value to the stored API key
  chrome.storage.sync.get(['apiKey'], function(result) {
    document.getElementById('api-key-input').value = result.apiKey || '';
  });
  