'use strict';

chrome.webRequest.onCompleted.addListener(
	function (details) {
		if (details.url.startsWith("https://chat.google.com/_/DynamiteWebUi/data")) {
			let url = 'https://chat.google.com/room/';
			url += '${e.getAttribute("data-p").match(/,"(.+)",/)[1]}' + '/' + '${e.getAttribute("data-topic-id")}';
			let tl = '`';
			let insertHtml = `${tl}<div style="margin: 10px;" class="get-link"><a href="${url}">Link</a></div>${tl}`;
			chrome.tabs.executeScript(details.tabId, {
				code: `
				[...document.querySelectorAll("div[data-soft-view-id^='/room/'] c-wiz[data-is-user-topic='true']")]
				.filter(e => e.querySelector("div").className != "get-link")
				.forEach((e,i) => e.innerHTML = ${insertHtml} + e.innerHTML);
				`,
				runAt: 'document_idle'
			});
		}
	}, {
		urls: ["https://chat.google.com/*"]
	}
);