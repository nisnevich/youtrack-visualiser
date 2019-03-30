// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.browserAction.onClicked.addListener(function (tab) {

  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    let url = tabs[0].url;

    let matches = url.match("youtrack.*/issue/([a-zA-Z0-9-]+)");
    if (!matches || matches.length < 2) {
      alert("Unable to fetch issue ID.");
      return;
    }
    Settings.setRootIssueId(matches[1]);
    window.open("application/index.html");
  });
});
