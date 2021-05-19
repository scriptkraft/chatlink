'use strict';

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.storage.local.get(['chatlinkShortcut'], function(result) {
		chrome.tabs.create({
			url: result.chatlinkShortcut || "https://mail.google.com"
		});
	  });
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
			let url = tabs[0].url;
			if (!!url && url.startsWith("https://mail.google.com")) {
				chrome.storage.local.set({"chatlinkShortcut": url});
			}
		});
	}
  })

chrome.webRequest.onCompleted.addListener(
	function (details) {
		const baseUrlRegex = /^https:\/\/mail\.google\.com\/(u\/\d+\/)?/;
		const requestSuffixRegex = /_\/DynamiteWebUi\/data/;
		const requestRegex = new RegExp(baseUrlRegex.source + requestSuffixRegex.source);
		if (!!details.url.match(requestRegex)) {
			let url = details.url.match(baseUrlRegex)[0] + "room/";
			url += '${superParent.getAttribute("data-p").match(/,"(.+)",/)[1]}' + '/' + '${superParent.getAttribute("data-topic-id")}';
			const tl = '`';
			let insertHtml = `${tl}<div style="text-align:center;margin-top:10px" class="get-link"><a href="${url}">&#128279;</a></div>${tl}`;
			chrome.tabs.executeScript(details.tabId, {
				code: `
				[...document.querySelectorAll("div[data-soft-view-id^='/room/'] div[aria-label='Follow']")]
				.filter(e => !e.getAttribute("get-link"))
				.forEach((e,i) => {
					const parent = e.parentNode;
					const superParent = parent.parentNode.parentNode.parentNode;
					e.setAttribute("get-link", "true");
					parent.innerHTML = parent.innerHTML + ${insertHtml};
				});
				`,
				runAt: 'document_idle'
			});
		}
	}, {
		urls: ["https://mail.google.com/*"]
	}
);