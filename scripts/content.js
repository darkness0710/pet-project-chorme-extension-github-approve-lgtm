document.addEventListener('DOMContentLoaded', () => {
    async function getKey() {
        return await chrome.storage.sync.get("key");
    }

    async function getContent() {
        return await chrome.storage.sync.get("content");
    }

    getKey().then(data => {
        document.getElementById('key').value = data.key;
    });

    getContent().then(data => {
        document.getElementById('content').value = data.content;
    });

    document.getElementById('save').onclick = function(){
        const key = document.getElementById('key').value;
        const content = document.getElementById('content').value;
        chrome.storage.sync.set({'key':  key});
        chrome.storage.sync.set({'content':  content});
    }
});
