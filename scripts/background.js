import Common from './helper.js';

class ContextMenu {
  constructor(common) {
    this.preload();
    this.common = common;
  }

  preload() {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "detectPullRequest",
        title: "Detect Pull Request",
        contexts: ["all"],
      });

      chrome.contextMenus.onClicked.addListener((info, tab) => {
        this.setUpEvent(info, tab);
      });
    });
  }

  async setUpEvent(info, tab) {
    if (info.menuItemId == 'detectPullRequest') {
      const payload = await this.common.detectPullRequest(info);
      chrome.tabs.sendMessage(tab.id, { action: "getActiveElement", payload: payload }, response => {
        console.log('U can show popup?');
      });

      return true;
    }

    if (this.getActions().includes(info.menuItemId)) {
      // return this.common.approvePullRequest(clickData);
    }
  }

  getActions() {
    return ['approvePullRequestFromString', 'approvePullRequestFromCurrentPage'];
  }
}

const app = new ContextMenu(new Common());
