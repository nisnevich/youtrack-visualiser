// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let form = document.getElementById('form');
let keyInput = document.getElementById('authKey');

form.addEventListener('submit', function() {
  chrome.storage.sync.set({authToken: keyInput.value}, function() {
    console.log('key was set');
  })
});

chrome.storage.sync.get('authToken', function (data) {
  keyInput.value = data.authToken ? data.authToken : "";
});
