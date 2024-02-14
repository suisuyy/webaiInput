// ==UserScript==
// @name         whisperinput
// @namespace    http://tampermonkey.net/
// @version      2024-01-04
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flowgpt.com
// @grant        none
// ==/UserScript==

(function () {

    let scriptURL = '  https://webaiinput.pages.dev/index.js  ';
   // window.hypothesisConfig = function () { return { showHighlights: true, appType: 'bookmarklet' }; };
    let d = document, s = d.createElement('script');
    s.setAttribute('src', scriptURL);
    d.body.appendChild(s)




})();



