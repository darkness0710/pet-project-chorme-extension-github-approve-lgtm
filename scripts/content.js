// options page
// document.addEventListener('DOMContentLoaded', async () => {
//   const helper = new GithubSupportInject();
//   console.log('loaded');
//   const data = await helper.getAllStorageData();
//   document.getElementById('key').value = data.key;
//   document.getElementById('content').value = data.content;
//   document.getElementById('save').onclick = async function () {
//     await base.setStorageData(
//       document.getElementById('key').value,
//       document.getElementById('content').value
//     )
//     alert('Update success!');
//   }
// });

// client Page
document.addEventListener("contextmenu", function(event) {
  window.clickedEl = event.target;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getActiveElement") {
    const newParagraph = document.createElement('p');
    const debugParagraph = document.getElementById('githubSupportInject');
    if (debugParagraph) {
      debugParagraph.parentNode.removeChild(debugParagraph);
    }
    window.clickedEl.insertAdjacentHTML('afterend', request.payload);
  }
  return sendResponse({value: 'ok'});
});
