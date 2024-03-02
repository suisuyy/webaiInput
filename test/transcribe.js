let startButton = document.querySelector("#start");
let stopButton = document.querySelector("#stop");
let testButton = document.querySelector("#testButton");

let textarea = document.querySelector("textarea");
const fileInput = document.getElementById("fileinput");
let editableDiv = document.querySelector("#editableDiv");
editableDiv.isContentEditable;

devilentLIBS.disableSelect(startButton);
devilentLIBS.disableSelect(stopButton);
devilentLIBS.disableSelect(testButton);

function deletePreviousWord(inputElement) {
  const cursorPosition = inputElement.selectionStart;
  const selectionLength = inputElement.selectionEnd - cursorPosition;
  const inputValue = inputElement.value;

  if (selectionLength > 0) {
    // Delete the selected text
    const newValue =
      inputValue.slice(0, cursorPosition) +
      inputValue.slice(inputElement.selectionEnd);
    inputElement.value = newValue;
    inputElement.setSelectionRange(cursorPosition, cursorPosition); // Set cursor after deletion
  } else {
    // Find the start and end indices of the previous word
    let start = cursorPosition - 1;
    while (start >= 0 && /\s/.test(inputValue[start])) {
      start--;
    }
    while (start >= 0 && !/\s/.test(inputValue[start])) {
      start--;
    }
    start++; // Adjust for the last space

    // Delete the previous word
    const wordToDelete = inputValue.slice(start, cursorPosition);
    const newValue =
      inputValue.slice(0, start) + inputValue.slice(cursorPosition);
    inputElement.value = newValue;
    inputElement.setSelectionRange(start, start); // Set cursor after deletion
  }

  // Optional: Trigger an input event to notify other listeners
  const inputEvent = new Event("input", { bubbles: true, cancelable: true });
  inputElement.dispatchEvent(inputEvent);
}

testButton.addEventListener("pointerdown", () => {
  deletePreviousWord(document.activeElement);
  //
});

function playandTranscribe(blob) {
  playAudioBlob(blob);

  function dipslayResult(text, name) {
    textarea.value = name + ": " + text + "\n\n" + textarea.value;
  }

  setTimeout(async () => {
    let response = await whisperjaxws(blob);
    dipslayResult(response, "whisperjaxws");
  }, 85);

  setTimeout(async () => {
    let response = await sendAudioToLeptonWhisperApi(blob);
    dipslayResult(response, "leptonwhisperapi");
  }, 90);
  setTimeout(async () => {
    let response = await sendAudioToHFWhisperApi(blob);
    dipslayResult(response.text, "hfwhisperapi");
  }, 100);
  setTimeout(async () => {
    let response = await sendAudioToCFWhisperApi(blob);
    dipslayResult(response.text, "cfwhisperapi");
  }, 110);
}

let rec = new Recorder();

document.querySelector("#start").addEventListener("click", async () => {
  console.log("start");
  textarea.value = "";
  let blob = await rec.startRecording(stopButton);

  //        rec.startRecording(document.body,playAudioBlob)
  //      rec.startRecording(document.body,blobToBase64)

  playandTranscribe(blob);
});

document.querySelector("#stop").addEventListener("click", () => {
  rec.stopRecording();
});

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    console.log("File name:", file.name);
    console.log("File size:", file.size, "bytes");
    console.log("File type:", file.type);
    playandTranscribe(file);
    // You can add further logic to process the file here, e.g., upload it to a server
  }
});


