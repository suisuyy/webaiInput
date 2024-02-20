let startButton = document.querySelector("#start");
let stopButton = document.querySelector("#stop");

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

stopButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
});
stopButton.addEventListener("pointerup", (e) => {
  e.preventDefault();
});
stopButton.addEventListener("click", (e) => {
  e.preventDefault();
});
