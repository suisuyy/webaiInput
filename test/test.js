let startButton = document.querySelector("#start");
let stopButton = document.querySelector("#stop");
let textarea = document.querySelector("textarea");

function simulateKeyPress(character) {
  // Get the element where you want to simulate the keypress event
  var element = document.activeElement;

  // Create a new event for keydown
  var keydownEvent = new KeyboardEvent("keydown", {
    key: character,
    keyCode: character.charCodeAt(0), // Deprecated, but may be needed for older browsers
    code: "Key" + character.toUpperCase(), // Like 'KeyA' for 'a', 'KeyB' for 'b', etc.
    which: character.charCodeAt(0), // Deprecated, but may be needed for older browsers
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
  });

  // Dispatch the keydown event
  element.dispatchEvent(keydownEvent);

  // Create a new event for keyup
  var keyupEvent = new KeyboardEvent("keyup", {
    key: character,
    keyCode: character.charCodeAt(0), // Deprecated, but may be needed for older browsers
    code: "Key" + character.toUpperCase(), // Like 'KeyA' for 'a', 'KeyB' for 'b', etc.
    which: character.charCodeAt(0), // Deprecated, but may be needed for older browsers
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
  });

  // Dispatch the keyup event
  element.dispatchEvent(keyupEvent);
}

setInterval(() => {
  //console.log(document.activeElement)
  //simulateKeyPress('a');
  // let res = document.execCommand("insertText", false, `test insert`);
  // console.log(res);
}, 2000);

function disableSelect(element) {
  element.style.userSelect = "none";
  // element.style.webkitUserSelect = "none";
  // element.style.MozUserSelect = "none";
  // element.style.msUserSelect = "none";
  // element.style.oUserSelect = "none";

  // element.addEventListener("selectstart", (e) => {
  //   e.preventDefault();
  // });

  element.addEventListener("pointerdown", (e) => {
    e.preventDefault();
  });
  // element.addEventListener("pointerup", (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // });
  // element.addEventListener("click", (e) => {
  //   e.stopImmediatePropagation();
  //   e.preventDefault();
  //   e.stopPropagation();
  // });
}

disableSelect(startButton);
disableSelect(stopButton);
let rec = new Recorder();

document.querySelector("#start").addEventListener("click", async () => {
  console.log("start");
  textarea.value = "";
  let blob = await rec.startRecording(stopButton);

  //        rec.startRecording(document.body,playAudioBlob)
  //      rec.startRecording(document.body,blobToBase64)

  console.log("got blob", blob);
  playAudioBlob(blob);
  // console.log(await blobToBase64(blob) );
  // sendAudioToLeptonWhisperApi(blob);
  //let transcribe=await whisperjaxws(blob);
  setTimeout(async () => {
    let response = await sendAudioToHFWhisperApi(blob);
    textarea.value = "   \n" + textarea.value + "hg: " + response.text;
  }, 100);
  setTimeout(async () => {
    let response = await sendAudioToCFWhisperApi(blob);
    textarea.value = "   \n" + textarea.value + "CF: " + response.text;
  }, 110);
});

document.querySelector("#stop").addEventListener("click", () => {
  rec.stopRecording();
});
