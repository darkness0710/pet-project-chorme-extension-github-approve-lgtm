chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "approvePullRequestId",
    title: "Approve pull request",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "approvePullRequestFromString",
    title: "Approve Pull Request From Url",
    parentId: "approvePullRequestId",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "approvePullRequestFromCurrentPage",
    title: "Approve Pull Request From Current Page",
    parentId: "approvePullRequestId",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (
    clickData.menuItemId == "approvePullRequestFromString" ||
    clickData.menuItemId == "approvePullRequestFromCurrentPage"
  ) {
    async function getDomain() {
      let url = "";
      if (clickData.menuItemId == "approvePullRequestFromString") {
        url = clickData.selectionText;
      } else {
        url = await getCurrentTabUrl();
      }
      const owner = url.match(/github\.com\/([^/]+)/);
      const repo = url.match(/github\.com\/[^/]+\/([^/]+)/);

      const ownerDetect = owner ? owner[1] : "";
      const repoDetect = repo ? repo[1] : "";

      return `${ownerDetect}/${repoDetect}`;
    }

    async function getKey() {
      return await chrome.storage.sync.get("key");
    }

    async function getContent() {
      return await chrome.storage.sync.get("content");
    }

    async function getCurrentTabUrl() {
      const tabs = await chrome.tabs.query({ active: true });
      return tabs[0].url;
    }

    async function getPullNumber() {
      let url = "";
      if (clickData.menuItemId == "approvePullRequestFromString") {
        url = clickData.selectionText;
      } else {
        url = await getCurrentTabUrl();
      }
      const match = url.match(/pull\/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }

    async function excuteRequest() {
      try {
        const keyResult = await getKey();
        const contentResult = await getContent();
        const number = await getPullNumber();
        const domain = await getDomain();
        const key = keyResult.key;
        const content = contentResult.content;
        const target_url = `https://api.github.com/repos/${domain}/pulls/${number}/reviews`;
        const opt = {
          type: "basic",
          title: `Approve to api ${target_url}`,
          iconUrl: chrome.runtime.getURL("images/icon-128.png"),
          message: "Success!",
        };
        fetch(target_url, {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${key}`,
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body: content || "LGTM!",
            event: "APPROVE",
          }),
        })
          .then((response) => {
            if (response.ok) {
              chrome.notifications.create("alertMessage1", opt);
            } else {
              opt.message = "Fail!";
              chrome.notifications.create("alertMessage2", opt);
            }

            if (clickData.menuItemId == "approvePullRequestFromCurrentPage") {
              chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                  chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
                }
              );
            }
          })
          .catch((error) => {
            opt.message = "Fail!";
            chrome.notifications.create("alertMessage3", opt);
          });
      } catch (error) {
        console.log(error);
      }
    }
    excuteRequest();
  }
});
