import GithubSupportInject from './helper.js';

// options page
document.addEventListener('DOMContentLoaded', async () => {
  const helper = new GithubSupportInject();
  console.log('loaded');
  const data = await helper.getAllStorageData();
  document.getElementById('key').value = data.key;
  document.getElementById('username').value = data.username;
  document.getElementById('save').onclick = async function () {
    await helper.setStorageData(
      document.getElementById('key').value,
      document.getElementById('username').value
    )
    alert('Update success!');
  }
});