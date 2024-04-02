class GithubSupportInject {
  async getAllStorageData() {
    return await chrome.storage.sync.get(null);
  }

  async setStorageData(key, username) {
    return await chrome.storage.sync.set({ 'key': key, 'username': username });
  }

  async getDomainFromString(info) {
    const match = info.linkUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      return `${owner}/${repo}`;
    }
  }

  async getDomainFromCurrentPage(info) {
    const url = await getCurrentTabUrl();
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      return `${owner}/${repo}`;
    }
  }

  async getPullNumberFromString(info) {
    const match = info.linkUrl.match(/pull\/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getPullNumberFromCurrentPage(info) {
    const url = await getCurrentTabUrl();
    const match = url.match(/pull\/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async getCurrentTabUrl() {
    const tabs = await chrome.tabs.query({ active: true });
    return tabs[0].url;
  }

  getState(r) {
    return r.draft ? 'draft' : (r.merged_at ? 'merged' : r.state);
  }

  async fetchApi(url) {
    const headers = {
      'Authorization': `token ${this.storage.key}`,
      'Accept': 'application/vnd.github.v3+json'
    };
    const response = await fetch(url, { headers });
    return await response.json();
  }

  async detectPullRequest(info) {
    this.storage = await this.getAllStorageData();
    const pullNumber = await this.getPullNumberFromString(info);
    const domain = await this.getDomainFromString(info);
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const r = await this.fetchApi(`https://api.github.com/repos/${domain}/pulls/${pullNumber}`);
    const rReview = await this.fetchApi(`https://api.github.com/repos/${domain}/pulls/${pullNumber}/reviews`);
    const approved = rReview.some(review => review.user.login === this.storage.username && review.state === 'APPROVED');
    return `
      <div id="githubSupportInject">
      <p><b>title</b>: ${r.title}</p>
      <p> <b>created_by</b>: ${r.user.login}</p>
      <p><b>state</b>: <strong style="color: red;">${this.getState(r)}</strong><p>
      <p><b>merged_at</b>: ${r.merged_at}</p>
      <p><b>u approved?</b>: <strong style="color: red;">${approved}</strong><p>
      <p><b>query_time:</b> ${time}</p>
      </div>
    `;
  }
}

export default GithubSupportInject;
