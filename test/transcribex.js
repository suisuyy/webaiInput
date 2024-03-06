console.log('start transcribex.js')
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

testButton.addEventListener("pointerdown", () => {
  deletePreviousWord(document.activeElement);
  //
});

function playandTranscribe(blob) {
  devilentLIBS.playAudioBlob(blob);

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

let rec = new devilentLIBS.Recorder();

document.querySelector("#start").addEventListener("click", async () => {
  console.log("start");
  textarea.value = "";
  let blob = await rec.startRecordingWithSilenceDetection(stopButton,(audioBlob)=>{
  playandTranscribe(audioBlob);

  });

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


