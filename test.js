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
}, 2000);

let a = 1;
let b = 2;
