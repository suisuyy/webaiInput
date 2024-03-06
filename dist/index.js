(() => {
const devilentLIBS = {
  config: {
    corsproxy_url: ["https://corsp.suisuy.eu.org?"],
    lepton_api: {
      completion_url: {
        mixtral: "https://mixtral-8x7b.lepton.run/api/v1/chat/completions",
      },
      api_token: ["jl9xg3km3plgxmtk835jvjmzra3x2qzf"],
    },
  },
  Recorder: class Recorder {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.isRecording = false;
      this.mediaRecorder;
      this.encodeType = "audio/mpeg";
      this.language = "en";
      this.recordingColor = "lightblue";
    }

    // The startRecording method remains mostly unchanged until the getUserMedia.then() block
    async startRecording(
      targetElement,
      silenceHandler = () => {
        console.log("silence detect");
      }
    ) {
      if (this.isRecording) {
        console.log("already recording");
        return;
      }
      console.log("start recording");
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);

          let silenceStart = Date.now();
          let silenceDuration = 0;

          let mediaRecorder = this.mediaRecorder;
          let audioChunks = [];
          mediaRecorder.start();
          this.isRecording = true;
          targetElement.style.backgroundColor = "rgba(173, 216, 230, 0.3)";

          // // Audio context for volume analysis
          let volumeInterval;
          let audioContext;
          audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(
            mediaRecorder.stream
          );
          microphone.connect(analyser);
          analyser.fftSize = 512;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          // Function that updates the button's font size
          const updateButtonFontSize = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;
            if (averageVolume < 10) {
              silenceDuration = Date.now() - silenceStart;
              if (silenceDuration > 1000) {
                silenceHandler();
              }
            }
            else{
              silenceStart=Date.now();
            }

            let scale = 3 + averageVolume / 15;
            targetElement.style.transform = `scale(${scale})`; // Next
          };
          // Call the updateButtonFontSize function periodically
          volumeInterval = setInterval(updateButtonFontSize, 100);

          mediaRecorder.addEventListener("dataavailable", (event) => {
            console.log("dataavailable");
            audioChunks.push(event.data);
          });

          return new Promise((resolve, reject) => {
            mediaRecorder.addEventListener("stop", async () => {
              this.isRecording = false;
              console.log("stop");
              clearInterval(volumeInterval);
              const audioBlob = new Blob(audioChunks, {
                type: this.encodeType,
              });
              targetElement.style.transform = `scale(1)`; // Next
              targetElement.style.background = "transparent";

              audioContext?.close(); // Close the audio context when done
              mediaRecorder.stream.getTracks().forEach((track) => track.stop());
              console.log("resolved ");
              resolve(audioBlob);
            });
          });
        })
        .catch((error) => {
          // Handle error, user denied permission or an error occurred
          if (
            error.name === "PermissionDeniedError" ||
            error.name === "NotAllowedError"
          ) {
            console.error("User denied permission to access audio");
            // Display a notification or perform some other action
            showNotification("Audio permission denied");
          } else {
            console.error(
              "An error occurred while accessing the audio device",
              error
            );
            // Display a notification or perform some other action
            showNotification("Error accessing audio device");
          }
        });
    }

    async startRecordingWithSilenceDetection(
      targetElement,
      silenceHandler = () => {
        console.log("silence detect");
      }
    ) {
      if (this.isRecording) {
        console.log("already recording");
        return;
      }
      console.log("start recording");
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);

          let isSilent=false;
          let isLongSilent=false;
          let silenceStart = Date.now();
          let silenceDuration = 0;

          let mediaRecorder = this.mediaRecorder;
          let audioChunks = [];
          mediaRecorder.start();
          this.isRecording = true;
          targetElement.style.backgroundColor = "rgba(173, 216, 230, 0.3)";

          // // Audio context for volume analysis
          let volumeInterval;
          let audioContext;
          audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(
            mediaRecorder.stream
          );
          microphone.connect(analyser);
          analyser.fftSize = 512;
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          // Function that updates the button's font size
          const handleAudioData = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            let averageVolume = sum / bufferLength;
//            console.log(averageVolume);

            if (averageVolume < 15) {
              if(isSilent){
                silenceDuration = Date.now() - silenceStart;
                if(silenceDuration>3000){
                  isLongSilent=true;
                  mediaRecorder.requestData();
                  silenceStart=Date.now();
                }
              }
              else{
                silenceDuration = Date.now() - silenceStart;
                if (silenceDuration > 600) {
                  isSilent=true;
                  console.log('change isSilent to true');

                  mediaRecorder.requestData();
                }
              }
              
            }
            else{
              isSilent=false;
              isLongSilent=false;
              silenceStart=Date.now();
            }

            let scale = 3 + averageVolume / 15;
            targetElement.style.transform = `scale(${scale})`; // Next
          };
          volumeInterval = setInterval(handleAudioData, 100);

          //when silence, it will trigger dataavailable event, for normal case , dataavalable only occure on stop recording
          let counter=0;
          let firstdata;
          setTimeout(() => {
            mediaRecorder.requestData();

          }, 200);
          mediaRecorder.addEventListener("dataavailable", (event) => {
            counter++;
            if(counter<=1){
              firstdata=event.data;
              if (event.data.size > 0 ) {
                audioChunks.push(event.data);
              }
              return;
            }
            console.log("dataavailable",event.data);
            if(isLongSilent){
            console.log("dataavailable,Long silent will do noting",event.data);
              return;
            }

            silenceHandler(new Blob([firstdata,event.data],{ type: mediaRecorder.mimeType }) );
            
          });

          return new Promise((resolve, reject) => {
            mediaRecorder.addEventListener("stop", async () => {
              this.isRecording = false;
              console.log("stop");
              clearInterval(volumeInterval);
              const audioBlob = new Blob(audioChunks, {
                type: this.encodeType,
              });
              targetElement.style.transform = `scale(1)`; // Next
              targetElement.style.background = "transparent";

              audioContext?.close(); // Close the audio context when done
              mediaRecorder.stream.getTracks().forEach((track) => track.stop());
              console.log("resolved ");
              resolve(audioBlob);
            });
          });
        })
        .catch((error) => {
          // Handle error, user denied permission or an error occurred
          if (
            error.name === "PermissionDeniedError" ||
            error.name === "NotAllowedError"
          ) {
            console.error("User denied permission to access audio");
            // Display a notification or perform some other action
            showNotification("Audio permission denied");
          } else {
            console.error(
              "An error occurred while accessing the audio device",
              error
            );
            // Display a notification or perform some other action
            showNotification("Error accessing audio device");
          }
        });
    }

    stopRecording() {
      this.isRecording = false;

      this.mediaRecorder?.stop();
    }
  },
  tts: function synthesizeSpeech(text, voice) {
    if (text && voice) {
      fetch(
        "https://devilent-azuretts.hf.space/synthesize/" +
          encodeURIComponent(text) +
          "?voicename=" +
          encodeURIComponent(voice)
      )
        .then((response) => response.blob())
        .then((blob) => {
          let url = URL.createObjectURL(blob);

          // Check if a div container with id 'devlent_tts_container' already exists
          let container = document.getElementById("devlent_tts_container");
          if (!container) {
            // Create a new div container if it doesn't exist
            container = document.createElement("div");
            container.id = "devlent_tts_container";
            document.body.appendChild(container);
          }

          // Check if an audio element with id 'tts_audio' already exists
          let audio = document.getElementById("tts_audio");
          if (!audio) {
            // Create a new audio element if it doesn't exist
            audio = document.createElement("audio");
            audio.id = "tts_audio";
            container.appendChild(audio);

            // Create a button to hide the audio
            let button = document.createElement("button");
            button.innerHTML = "Hide Audio";
            button.onclick = function () {
              container.style.display = "none";
            };
            container.appendChild(button);
          }
          container.style.display = "block";
          container.style.position = "fixed";
          container.style.top = "0";
          container.style.right = "0";

          // Update the source of the audio element
          audio.src = url;
          audio.controls = true;
          audio.autoplay = true;

          // Auto hide the audio after it finishes playing
          audio.onended = function () {
            setTimeout(function () {
              container.style.display = "none";
            }, 3000);
          };
        })
        .catch(console.error);
    }
  },

  checkValidString(str) {
    if (str === undefined || str === null || str.trim() === "") {
      return false;
    }
    if (str === "undefined" || str === "null") {
      return false;
    }
    return true;
  },
  isEditableElement: function isEditableElement(element) {
    while (element) {
      if (element.contentEditable === "true") {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  },
  disableSelect: function disableSelect(element) {
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
  },
  getSelectionText: function getSelectionText() {
    let activeElement = document.activeElement;
    if (activeElement && activeElement.value) {
      return activeElement.value.substring(
        activeElement.selectionStart,
        activeElement.selectionEnd
      );
    } else {
      return window.getSelection().toString();
    }
  },
  makeButtonFeedback: function makeButtonFeedback(button) {
    let originalColor = button.style.backgroundColor || "white";

    button.addEventListener("pointerdown", function () {
      button.style.backgroundColor = "lightblue";
    });
    document.body.addEventListener("pointerup", () => {
      button.style.backgroundColor = originalColor;
    });
  },
  showToast: function showToast(
    text,
    x = 0,
    y = 0,
    w = 200,
    h = 0,
    duration = 1000,
    zIndex = 9999
  ) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.width = w + "px";
    textArea.style.height = h === 0 ? "auto" : h + "px";
    textArea.style.borderWidth = "0";
    textArea.style.outline = "none";
    textArea.style.position = "fixed";
    textArea.style.left = x + "px";
    textArea.style.top = y + "px";
    textArea.style.zIndex = zIndex;
    textArea.disabled = true;
    document.body.appendChild(textArea);
    setTimeout(() => {
      document.body.removeChild(textArea);
    }, duration);
  },
  copyToClipboard: function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.width = "50%";
    textArea.style.height = "100px";
    textArea.style.borderWidth = "0";
    textArea.style.outline = "none";
    textArea.style.position = "fixed";
    textArea.style.left = "0";
    textArea.style.top = "0";
    textArea.style.zIndex = "9999999";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.disabled = true;
    //textArea.disabled=true;
    textArea.value = "copyed to clipboard \n" + textArea.value;
    textArea.scrollTo(10000, 100000);
    setTimeout(() => {
      document.body.removeChild(textArea);
    }, 4000);
  },

  writeText: function writeText(
    targetElement,
    text,
    prefix = " ",
    endfix = " "
  ) {
    console.log("writeText(): ", targetElement);
    if (
      targetElement.tagName === "INPUT" ||
      targetElement.tagName === "TEXTAREA" ||
      devilentLIBS.isEditableElement(targetElement) === true
    ) {
      document.execCommand("insertText", false, `${prefix}${text}${endfix}`);
      targetElement.scrollTo(100000, 1000000);
    } else {
      document.execCommand("insertText", false, `${prefix}${text}${endfix}`);
      devilentLIBS.copyToClipboard(text);

      // targetElement.value += ' ' + text;
    }
  },
  dragElement: function dragElement(
    elmnt,
    movableElmnt = elmnt.parentElement,
    speed = 3
  ) {
    elmnt.style.touchAction = "none"; //need on touch devices
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    let rmShadeTimeout;
    let shadeDiv;

    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.addEventListener("pointerdown", (e) => {
      dragMouseDown(e);
    });

    function dragMouseDown(e) {
      e = e || window.event;
      //for touch device to move
      e.preventDefault();

      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.body.addEventListener("pointermove", elementDrag);
      document.body.addEventListener("pointerup", closeDragElement);

      // call a function whenever the cursor moves:

      //create a shade to cover full body to stop iframe catch mouse move

      shadeDiv =
        document.querySelector("#shadeDivForDragElement") ||
        document.createElement("div");
      shadeDiv.id = "shadeDivForDragElement";
      shadeDiv.style.width = "300vw";
      shadeDiv.style.height = "300vh";
      shadeDiv.style.position = "fixed";
      shadeDiv.style.top = "0";
      shadeDiv.style.left = "0";
      shadeDiv.style.backgroundColor = "rgb(230,230,230,0.2)";
      shadeDiv.style.zIndex = 100000;
      document.body.appendChild(shadeDiv);
      rmShadeTimeout = setTimeout(() => {
        document.body.removeChild(
          document.querySelector("#shadeDivForDragElement")
        );
      }, 10000);
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;

      // console.log(pos1,pos2,pos3,pos4)
      // set the element's new position:
      movableElmnt.style.position = "fixed";
      movableElmnt.style.top = e.clientY - elmnt.clientHeight / 2 + "px";
      movableElmnt.style.left = e.clientX - elmnt.clientWidth / 2 + "px";
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      console.log("closeDragElement(): pointerup");
      // document.onpointerup = null;
      // document.onpointermove = null;
      document.body.removeEventListener("pointermove", elementDrag);
      document.body.removeEventListener("pointerup", closeDragElement);

      document.body.removeChild(
        document.querySelector("#shadeDivForDragElement")
      );
      //clearTimeout(rmShadeTimeout);
    }
  },

  renderMarkdown(mdString, targetElement) {
    // Extend regex patterns to include inline code and code blocks
    let headerPattern = /^(#{1,6})\s*(.*)$/gm;
    const boldPattern = /\*\*(.*?)\*\*/g;
    const linkPattern = /\[(.*?)\]\((.*?)\)/g;
    const newlinePattern = /(?:\n)/g;
    const inlineCodePattern = /`(.*?)`/g;
    const codeBlockPattern = /```(\w+)?\n(.*?)```/gs;

    let html = mdString;

    // Split the string by ``` ``` blocks
    let parts = html.split("```");
    // Process each part separately
    for (let i = 0; i < parts.length; i++) {
      // If it's not a ``` block
      if (i % 2 === 0) {
        // Replace headers with <h1> to <h6> tags
        parts[i] = parts[i].replace(headerPattern, (match, hash, content) => {
          const level = hash.length;
          return `<h${level}>${content}</h${level}>`;
        });

        // Replace newlines with <br> tags
        parts[i] = parts[i].replace(newlinePattern, (match, hash, content) => {
          const level = hash.length;
          return `<br>`;
        });
      }
    }
    // Join the parts back together
    html = parts.join("```");

    // Replace bold text with <strong> tags
    html = html.replace(boldPattern, "<strong>$1</strong>");

    // Replace links with <a> tags
    html = html.replace(linkPattern, '<a href="$2">$1</a>');

    html = html.replace(codeBlockPattern, (match, language, code) => {
      return `
          <div class="code-block">
              <button class="copy-code-btn">Copy</button>
              <button class="insert-code-btn">Insert</button>
              <pre>

${code}
</pre>
          </div>
      `;
    });

    // Replace inline code with <code> tags
    html = html.replace(inlineCodePattern, "<code>$1</code>");

    targetElement.innerHTML = html;

    // Function to copy the code to clipboard

    // Attach event listeners to copy and insert buttons
    const buttons = targetElement.querySelectorAll(".code-block button");
    buttons.forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        const code = btn.parentElement.querySelector("pre").innerText;
        if (btn.classList.contains("copy-code-btn")) {
          devilentLIBS.copyToClipboard(code);
        } else if (btn.classList.contains("insert-code-btn")) {
          console.log("insert button down");
          devilentLIBS.writeText(document.activeElement, code, "", "");
        }
      });
    });

    // Add a copy-to-clipboard button
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copy";
    copyButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      devilentLIBS.copyToClipboard(mdString);
    });
    // Add an insert-to-webpage button
    const insertButton = document.createElement("button");
    insertButton.innerText = "Insert";
    insertButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      devilentLIBS.writeText(document.activeElement, mdString, "", "");
    });
    copyButton.classList.add("copy-btn");
    insertButton.classList.add("insert-btn");

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      targetElement.remove();
    });
    closeButton.classList.add("copy-btn");

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Add the buttons to the container
    buttonContainer.appendChild(copyButton); // Assuming copyButton and insertButton are already created
    buttonContainer.appendChild(insertButton);
    buttonContainer.appendChild(closeButton);

    // Get the parent element (replace with the actual parent element's selector)
    const parentElement = targetElement;

    // Make the container width same as parent
    buttonContainer.style.width = "100%";

    // Make the container color darker than parent
    buttonContainer.style.backgroundColor = parentElement.style.backgroundColor;
    buttonContainer.style.color =
      "lighten(" + buttonContainer.style.backgroundColor + ", 20%)"; // Adjust lighten() value as needed

    // Append the container to the parent

    targetElement.prepend(buttonContainer);
    devilentLIBS.dragElement(buttonContainer, targetElement);

    targetElement.classList.add("markdown-container");
    // Get all elements with the markdown-container class
    let markdownContainers =
      document.getElementsByClassName("markdown-container");

    // Loop through the markdownContainers and set their styles
    for (let i = 0; i < markdownContainers.length; i++) {
      markdownContainers[i].style.fontFamily = "Arial, sans-serif";
      markdownContainers[i].style.lineHeight = "1.6";
      markdownContainers[i].style.maxWidth = "800px";
      markdownContainers[i].style.margin = "0 auto";
      markdownContainers[i].style.padding = "0px";
      markdownContainers[i].style.backgroundColor = "azure";
      markdownContainers[i].style.overflow = "auto";
      markdownContainers[i].style.boxShadow = "0px 0px 50px rgba(0, 0, 0, 0.4)";
    }

    // Get all elements with the code-block class
    let codeBlocks = document.getElementsByClassName("code-block");

    // Loop through the codeBlocks and set their styles
    for (let i = 0; i < codeBlocks.length; i++) {
      codeBlocks[i].style.position = "relative";
    }

    // Get all elements with the copy-code-btn and insert-code-btn classes
    let insertCodeBtns = document.getElementsByClassName("insert-code-btn");
    let codecopyBtns = document.getElementsByClassName("copy-code-btn");

    // Loop through the codeBtns and insertCodeBtns and set their styles
    for (let i = 0; i < codecopyBtns.length; i++) {
      codecopyBtns[i].style.top = "0";
      codecopyBtns[i].style.position = "absolute";
      codecopyBtns[i].style.right = "0";
      codecopyBtns[i].style.margin = "5px";
      codecopyBtns[i].style.padding = "2px 5px";
      codecopyBtns[i].style.fontSize = "12px";
      codecopyBtns[i].style.border = "none";
      codecopyBtns[i].style.borderRadius = "3px";
      codecopyBtns[i].style.backgroundColor = "#007bff";
      codecopyBtns[i].style.color = "white";
      codecopyBtns[i].style.cursor = "pointer";
    }

    for (let i = 0; i < insertCodeBtns.length; i++) {
      insertCodeBtns[i].style.position = "absolute";
      insertCodeBtns[i].style.top = "0";
      insertCodeBtns[i].style.right = "50px";
      insertCodeBtns[i].style.margin = "5px";
      insertCodeBtns[i].style.padding = "2px 5px";
      insertCodeBtns[i].style.fontSize = "12px";
      insertCodeBtns[i].style.border = "none";
      insertCodeBtns[i].style.borderRadius = "3px";
      insertCodeBtns[i].style.backgroundColor = "#007bff";
      insertCodeBtns[i].style.color = "white";
      insertCodeBtns[i].style.cursor = "pointer";
    }

    // Get all elements with the copy-btn and insert-btn classes
    let copyBtns = document.getElementsByClassName("copy-btn");
    let insertBtns = document.getElementsByClassName("insert-btn");

    // Loop through the copyBtns and insertBtns and set their styles
    for (let i = 0; i < copyBtns.length; i++) {
      copyBtns[i].style.margin = "5px";
      copyBtns[i].style.padding = "2px 5px";
      copyBtns[i].style.fontSize = "12px";
      copyBtns[i].style.border = "none";
      copyBtns[i].style.borderRadius = "3px";
      copyBtns[i].style.backgroundColor = "#007bff";
      copyBtns[i].style.color = "white";
      copyBtns[i].style.cursor = "pointer";
    }

    for (let i = 0; i < insertBtns.length; i++) {
      insertBtns[i].style.margin = "5px";
      insertBtns[i].style.padding = "2px 5px";
      insertBtns[i].style.fontSize = "12px";
      insertBtns[i].style.border = "none";
      insertBtns[i].style.borderRadius = "3px";
      insertBtns[i].style.backgroundColor = "#007bff";
      insertBtns[i].style.color = "white";
      insertBtns[i].style.cursor = "pointer";
    }

    // Get all elements with the pre class
    let pres = targetElement.getElementsByTagName("pre");

    // Loop through the pres and set their styles
    for (let i = 0; i < pres.length; i++) {
      pres[i].style.backgroundColor = "#f7f7f7";
      pres[i].style.borderRadius = "5px";
      pres[i].style.padding = "10px";
      pres[i].style.whiteSpace = "pre-wrap";
      pres[i].style.wordBreak = "break-all";
    }

    // Get all elements with the code class
    let codes = targetElement.getElementsByTagName("code");

    // Loop through the codes and set their styles
    for (let i = 0; i < codes.length; i++) {
      codes[i].style.backgroundColor = "#f1f1f1";
      codes[i].style.borderRadius = "3px";
      codes[i].style.padding = "2px 5px";
      codes[i].style.fontFamily = "'Courier New', Courier, monospace";
    }
  },
  displayMarkdown(mdString) {
    let containerID = "ai_input_md_dispalyer";

    let container = document.getElementById(containerID);
    if (container === null) {
      container =
        document.getElementById(containerID) || document.createElement("div");
      container.id = containerID;
      document.body.appendChild(container);

      container.style.zIndex = "100000";
      container.style.position = "fixed";
      container.style.bottom = "0";
      container.style.left = "0";
      container.style.height = "40vh";
      container.style.width = "80vw";
      container.style.backgroundColor = "rgba{20,20,50,1}";
    }

    devilentLIBS.renderMarkdown(mdString, container);
  },
  moveToElement: (mElem, targetElement, alwayInWindow = true) => {
    const rect = targetElement.getBoundingClientRect();
    // The rect object contains the position information
    let x = rect.left + rect.width * 0.85; // X position relative to the window
    let y = rect.top;
    x = Math.max(x, 300);
    if (alwayInWindow) {
      x = Math.abs(x);
      y = Math.abs(y);
      x = Math.min(x, window.innerWidth - mElem.clientWidth);
      y = Math.min(y, window.innerHeight - 10 - mElem.clientHeight);
    }
    mElem.style.left = x + "px";
    mElem.style.top = y + "px";
  },
  addEventListenerForActualClick(element, handler) {
    let initialX, initialY;
    let startTime;

    element.addEventListener("pointerdown", (event) => {
      initialX = event.clientX;
      initialY = event.clientY;
      startTime = Date.now();
    });
    element.addEventListener("pointerup", (event) => {
      const deltaX = Math.abs(event.clientX - initialX);
      const deltaY = Math.abs(event.clientY - initialY);

      if (deltaX <= 10 && deltaY <= 10 && Date.now() - startTime < 1000) {
        console.log(
          "Minimal mouse movement (< 10px in either direction) and short duration click detected."
        );
        handler(event);
      }
    });
  },
  sendKeyEvent(element, key, modifiers) {
    const eventDown = new KeyboardEvent("keydown", {
      key: key,
      code: key.toUpperCase(), // Might need adjustment based on browser support
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    const eventUp = new KeyboardEvent("keyup", {
      key: key,
      code: key.toUpperCase(), // Might need adjustment based on browser support
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });

    element.dispatchEvent(eventDown);
    element.dispatchEvent(eventUp);
  },
  blobToBase64: function blobToBase64(blob) {
    if (!(blob instanceof Blob)) {
      throw new TypeError("Parameter must be a Blob object.");
    }

    if (!blob.size) {
      throw new Error("Empty Blob provided.");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  playAudioBlob: function playAudioBlob(blob) {
    // Create an audio element
    const audio = new Audio();

    // Set the source of the audio element to the blob
    audio.src = URL.createObjectURL(blob);

    // Add controls to the audio element (optional)
    audio.controls = true;

    // Append the audio element to the document (optional)
    document.body.prepend(audio); // Uncomment if you want to display the audio player

    // Play the audio
    audio
      .play()
      .then(() => {
        // Audio played successfully
        console.log("Audio played successfully!");
      })
      .catch((error) => {
        // Handle errors
        console.error("Error playing audio:", error);
      });
  },
  async leptonSimpleComplete(userText) {
    console.log("leptonSimpleComlete(): ", userText);
    if (devilentLIBS.checkValidString(userText) === false) {
      return;
    }
    let response = await fetch(
      devilentLIBS.config.corsproxy_url +
        devilentLIBS.config.lepton_api.completion_url.mixtral,
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          Authorization: `Bearer ${devilentLIBS.config.lepton_api.api_token[0]}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }],
          model: "mixtral-8x7b",
          tools: [],
          temperature: 0.7,
          top_p: 0.8,
          max_tokens: 100000,
        }),
        method: "POST",
      }
    );
    response = await response.json();
    let responseMessage = response?.choices[0]?.message?.content;
    console.log("[leptonComplete(text)]", responseMessage);
    let mdContainer = document.createElement("div");
    document.body.appendChild(mdContainer);
    devilentLIBS.displayMarkdown(userText + "\n\n" + responseMessage);
    return response;
  },
};

let model = {
  api_url: "",
  api_key: "",
  voice_button_id: "whisper_voice_button",
  transcribeProvider: "lepton_whisper",
  language: "",
  supportedInputTypeList: ["text", "number", "tel", "search", "url", "email"],
  buttonBackgroundColor: "lightblue",
  minimalRecordTime: 2000,
  keepButtonAliveInterval: 0,
};

let view = {
  elem: {
    currentInputElem: null,
    voiceButton: null,
  },
  init() {
    this.recorder = new devilentLIBS.Recorder();
    this.createButton();

    model.keepButtonAliveInterval = setInterval(() => {
      const whisperButton = document.getElementById("whisper_voice_button");

      if (whisperButton) {
        // Button exists, return now do nothing
        return;
      }
      this.createButton();
    }, 2000);
    //this.monitorFocus();
  },
  createButton() {
    // Check if the button element exists
    const whisperButton = document.getElementById("whisper_voice_button");

    if (whisperButton) {
      // Button exists, return now do nothing
      return;
    }

    console.log("create button");

    let button = document.createElement("button");
    this.elem.voiceButton = button;

    button.id = model.voice_button_id;
    button.innerText = "◯";
    button.type = "button"; // Ensure the button does not submit forms
    button.classList.add("speech-to-text-button");
    button.style.top = window.innerHeight - 100 + "px";
    button.style.left = "0";
    button.style.width = "40px";
    button.style.height = button.style.width;
    button.style.fontSize = "30px";
    button.style.padding = "0";
    button.style.border = "0px";
    button.style.color = "blue";
    button.style.background = "transparent";
    button.style.zIndex = 1000000;
    button.style.position = "fixed";
    button.style.borderRadius = "50%";
    button.style.userSelect = "none";
    button.style.touchAction = "none";
    document.body.appendChild(button);

    devilentLIBS.dragElement(button, button);
    button.addEventListener("click", () => {
      // this.controller.handleRecording(targetElement);
      console.log("createButton():clicked");
    });
    button.addEventListener("pointerdown", async (event) => {
      event.preventDefault();
      view.handler.startRecording(event);
    });
    // button.addEventListener('touchdown', async (event) => {

    // });
    button.addEventListener("pointerup", () => {
      console.log("createButton pointerup");
      view.handler.stopRecording();
    });

    devilentLIBS.addEventListenerForActualClick(button, (event) => {
      let clientX = event?.clientX;
      let clientY = event?.clientY;
      view.createMenu(clientX + 50, clientY + 50);
      //this.createMenuByGPT4(clientX+50,clientY+50);
    });

    devilentLIBS.addEventListenerForActualClick(document.body, (event) => {
      if (event.target.tagName === "INPUT") {
        if (model.supportedInputTypeList.includes(event.target.type)) {
          devilentLIBS.moveToElement(button, event.target);
        }
      } else if (
        event.target.tagName === "TEXTAREA" ||
        devilentLIBS.isEditableElement(event.target) === true
      ) {
        devilentLIBS.moveToElement(button, event.target);
      }
      console.log(
        event.target,
        devilentLIBS.isEditableElement(event.target)
          ? "editable"
          : "noneditable"
      );
    });

    window.addEventListener("resize", () => {
      let buttonPos = button.getBoundingClientRect();
      if (buttonPos.top > window.innerHeight - buttonPos.height) {
        button.style.top = window.innerHeight - buttonPos.height + "px";
      }
      console.log("resize", buttonPos.top, window.innerHeight);
    });

    return button;
  },
  monitorFocus() {
    let focusHandler = (element) => {
      devilentLIBS.moveToElement(this.elem.voiceButton, element);
    };

    setInterval(() => {
      if (document.querySelector("#whisper_voice_button") === null) {
        console.log("no voicebutton, create it now");
        this.createButton();
      }
    }, 3000);

    // setInterval(() => {
    //     if(this.voiceButton===null){
    //         this.createButton();

    //     }
    //     console.log(document.activeElement.tagName);
    //     if(document.activeElement.tagName==='INPUT' || document.activeElement.tagName==="TEXTAREA"){
    //         focusHandler(document.activeElement)
    //     }
    // }, 2000);

    // Select all input and textarea elements
    const inputElements = document.querySelectorAll("input, textarea");

    // Add event listener for each element
    inputElements.forEach((element) => {
      element.addEventListener("focus", () => {
        focusHandler(element);
      });
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const addedNode of mutation.addedNodes) {
            if (
              addedNode.tagName === "TEXTAREA" ||
              addedNode.tagName === "INPUT"
            ) {
              // New textarea detected!
              console.log("New textarea added:", addedNode);
              // Add your event listener as needed
              addedNode.addEventListener("focus", (event) => {
                focusHandler(addedNode);
                console.log(
                  "New ",
                  addedNode.id || addedNode.name,
                  "gained focus"
                );
              });
            }
          }
        }
      }
    });
    // Observe the document body or specific container
    observer.observe(document.body, { childList: true, subtree: true });
  },

  createMenu(x, y, id = "webai_input_menu") {
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // check if menu already exists
    let menuContainer = document.getElementById(id);
    if (menuContainer) {
      // menu already exists, update its position
      // Adjust position to keep the menu inside the window
      menuContainer.style.left =
        Math.min(x, windowWidth - menuContainer.offsetWidth * 0.5) + "px";
      menuContainer.style.top =
        Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
      menuContainer.style.zIndex = "99999";

      return;
    }

    // create menu container
    menuContainer = document.createElement("div");
    // Append the menu to the body to calculate its dimensions
    document.body.appendChild(menuContainer);

    menuContainer.id = id; // add an id to the menu
    menuContainer.style.zIndex = "99999";
    menuContainer.style.position = "fixed";
    menuContainer.style.backgroundColor = "white";
    menuContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    menuContainer.style.borderRadius = "4px";
    menuContainer.style.display = "flex";
    menuContainer.style.flexDirection = "column";
    menuContainer.style.alignItems = "flex-start";
    menuContainer.style.padding = "10px";
    // Now adjust position to keep the menu inside the window
    menuContainer.style.left =
      Math.min(x, windowWidth - menuContainer.offsetWidth) + "px";
    menuContainer.style.top =
      Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
    menuContainer.style.backgroundColor = "white";
    menuContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    menuContainer.style.borderRadius = "4px";
    menuContainer.style.display = "flex";
    menuContainer.style.flexDirection = "column";
    menuContainer.style.alignItems = "flex-start";
    menuContainer.style.padding = "10px";
    devilentLIBS.disableSelect(menuContainer);

    menuContainer.style.maxHeight = "60vh"; // Set max-height to 60vh
    menuContainer.style.overflowY = "auto"; // Enable vertical scrollbar

    // Customize the scrollbar
    menuContainer.style.cssText += `
      scrollbar-width: thin; /* For Firefox */
      scrollbar-color: rgba(0, 0, 0, 0.3) transparent; /* For Chrome, Edge, and Safari */
    `;
    menuContainer.style.msOverflowStyle = "none"; // Remove scrollbar for IE and Edge (if needed)

    // Function to create a menu item
    function createMenuItem(textContent, handler) {
      const menuItem = document.createElement("button");
      devilentLIBS.makeButtonFeedback(menuItem);
      menuContainer.appendChild(menuItem);
      // Set inline styles
      menuItem.style.cssText = `
        background-color: white;
        border: none;
        font-size: 14px;
        width: 80px;
        text-align: left;
        cursor: pointer;
        margin-bottom: 0;
        margin-top: 0;
        padding: 5px 10px;
        color: #333;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-radius: 4px;
      `;

      menuItem.textContent = textContent;
      menuItem.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (handler) {
          handler();
        }
      });

      return menuItem;
    }

    // create remove menu item
    const removeMenuItem = createMenuItem("Remove Menu");
    removeMenuItem.addEventListener("pointerdown", () =>
      menuContainer.remove()
    );
    menuContainer.appendChild(removeMenuItem);

    const closeButton = createMenuItem("Close");
    closeButton.addEventListener("pointerdown", () => {
      if (confirm("remove the AI tool now?")) {
        clearInterval(model.keepButtonAliveInterval);
        view.elem.voiceButton.remove();
        menuContainer.remove();
      }
    });
    menuContainer.appendChild(closeButton);

    createMenuItem("TTS", () => {
      devilentLIBS.tts(
        devilentLIBS.getSelectionText(),
        "de-DE-SeraphinaMultilingualNeural"
      );
    });
    // create start menu item
    const startMenuItem = createMenuItem("Start");
    menuContainer.appendChild(startMenuItem);
    startMenuItem.addEventListener("pointerdown", () => {
      view.handler.startRecordingWithSilenceDetection();
    });

    let copyButton = createMenuItem("Copy");
    menuContainer.appendChild(copyButton);
    copyButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      document.execCommand("copy");
      devilentLIBS.showToast("Copied to clipboard");
    });

    createMenuItem("Cut", () => {
      document.execCommand("copy");
      document.execCommand("delete");
      devilentLIBS.showToast("Cut to clipboard");
    });

    let pasteButton = createMenuItem("Paste");
    menuContainer.appendChild(pasteButton);
    pasteButton.addEventListener("pointerdown", async (e) => {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        devilentLIBS.writeText(document.activeElement, text);
        console.log("Clipboard text:", text);
        // Your logic to process the clipboard text
      } catch (err) {
        console.error("Clipboard access denied:", err);
      }
    });

    let enterButton = createMenuItem("Enter");
    menuContainer.appendChild(enterButton);
    enterButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      document.execCommand("insertText", false, "\n");
    });

    createMenuItem("Correct", () => {
      let correctPrompt =
        'just give answer,put answer in ``` ``` like code , neednt double quotas " " or number  ,fix mistakes of the text, make it better, you can give 2 answer for me to choose if necessary, give me one by one: ';
      view.handler.chat(correctPrompt);
    });

    let askButton = createMenuItem("Ask");
    menuContainer.appendChild(askButton);
    askButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      document.body.addEventListener("pointerup", () => {
        view.handler.stopRecording();
      },{once:true});

      view.handler.ask();
      
    
    });

    
    // add menu to the body

    menuContainer.style.left =
      Math.min(x, windowWidth - menuContainer.offsetWidth * 0.5) + "px";
    menuContainer.style.top =
      Math.min(y, windowHeight - menuContainer.offsetHeight) - 100 + "px";
    document.body.appendChild(menuContainer);
  },

  createMenuByGPT4(x, y) {
    // Check if the menu already exists
    let existingMenu = document.getElementById("customMenu");

    if (existingMenu) {
      // Move the existing menu to the new position
      existingMenu.style.left = x + "px";
      existingMenu.style.top = y + "px";
      return; // Exit the function since the menu already exists
    }

    // Create the menu container
    let menu = document.createElement("div");
    menu.id = "customMenu";
    menu.style.position = "fixed";
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.style.backgroundColor = "#f0f0f0";
    menu.style.border = "1px solid #ddd";
    menu.style.padding = "10px";
    menu.style.borderRadius = "5px";
    menu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    menu.style.zIndex = "1000";

    // Add menu items
    let itemList = ["Remove", "Start", "Stop"];

    itemList.forEach(function (item) {
      let button = document.createElement("button");
      button.textContent = item;
      button.style.marginRight = "5px";
      button.style.padding = "5px 10px";
      button.style.border = "none";
      button.style.borderRadius = "3px";
      button.style.cursor = "pointer";

      // Align Start and Stop buttons to the left
      if (item === "Start" || item === "Stop") {
        button.style.float = "left";
      }

      // Add click event for Remove
      if (item === "Remove") {
        button.onclick = function () {
          menu.parentNode.removeChild(menu);
        };
      }

      // Add click event for Start (functionality not defined)
      if (item === "Start") {
        button.onclick = function () {
          console.log("Start clicked");
          // Define what should happen when the Start button is clicked
        };
      }

      // Add click event for Stop (functionality not defined)
      if (item === "Stop") {
        button.onclick = function () {
          console.log("Stop clicked");
          // Define what should happen when the Stop button is clicked
        };
      }

      menu.appendChild(button);
    });

    // Append the menu to the body
    document.body.appendChild(menu);
  },

  handler: {
    async chat(message) {
      let selectionString = devilentLIBS.getSelectionText();
      let userText = message + selectionString;

      if (devilentLIBS.checkValidString(userText) === false) {
        console.log("chat(): invalid userText:", userText);
        return;
      }

      devilentLIBS.displayMarkdown(userText + " please wait");
      devilentLIBS.leptonSimpleComplete(userText);
    },
    async ask() {
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      //console.log(await blobToBase64(audioblob))

      if (Date.now() - startTime < model.minimalRecordTime) {
        devilentLIBS.showToast("time too short, this will not transcribe");
        console.log("ask():", devilentLIBS.getSelectionText());
        devilentLIBS.leptonSimpleComplete(devilentLIBS.getSelectionText());
        return;
      }

      let transcribe = await sendAudioToLeptonWhisperApi(audioblob);
      if (!transcribe) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(audioblob);
      }
      let selectionString = window.getSelection().toString();
      let userText = devilentLIBS.checkValidString(selectionString)
        ? `"${selectionString}" ${transcribe}`
        : transcribe;
      if (devilentLIBS.checkValidString(userText) === false) {
        console.log("ask(): invalid userText:", userText);
        return;
      }
      userText = userText;
      devilentLIBS.displayMarkdown(userText + " please wait");
      devilentLIBS.leptonSimpleComplete(userText);
    },
    async startRecording(event) {
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      //console.log(await blobToBase64(audioblob))

      if (Date.now() - startTime < model.minimalRecordTime) {
        devilentLIBS.showToast("time too short, this will not transcribe");
        return;
      }

      let transcribe = await sendAudioToLeptonWhisperApi(audioblob);
      if (transcribe === false) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(audioblob);
      }
      devilentLIBS.writeText(document.activeElement, transcribe);
    },
    async startRecordingWithSilenceDetection(event) {
      //todo
      let startTime = Date.now();
      let finalAudioblob = await view.recorder.startRecordingWithSilenceDetection(view.elem.voiceButton,
          (audoBlob=>{
              sendAudioToLeptonWhisperApi(audoBlob).then(transcribe=>{
              if (transcribe === false) {
                  console.log("transcribe failed, try alternative way");
                  whisperjaxws(audoBlob).then(transcribe=>{
                  devilentLIBS.writeText(document.activeElement, transcribe);
                  });
                  
              }
              else{
              devilentLIBS.writeText(document.activeElement, transcribe);

              }
      });

      
      }));
      //console.log(await blobToBase64(audioblob))

      if (Date.now() - startTime < model.minimalRecordTime) {
        devilentLIBS.showToast("time too short, this will not transcribe");
        return;
      }

      let transcribe = await sendAudioToLeptonWhisperApi(finalAudioblob);
      if (transcribe === false) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(finalAudioblob);
      }
      devilentLIBS.writeText(document.activeElement, transcribe);
    },

    stopRecording(safeStop = true) {
      model.isRecording = false;
      if (safeStop) {
        setTimeout(() => {
          console.log("safeStop");
          view.recorder.stopRecording();
        }, 500);
      } else {
        view.recorder.stopRecording();
      }
    },
  },
};

view.init();

async function sendAudioToApi(blob, targetElement) {
  try {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("model", "whisper-1");

    // You need to replace the URL and headers with the ones provided by your online API
    const response = await fetch(`${API_URL}/v1/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        // Add other headers required by the API
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error from API: ${response.statusText}`);
    }

    const data = await response.json();
    // You'll need to access the correct property from the response JSON based on the API's response format
    //targetElement.value = data.results.channels[0].alternatives[0].transcript;
    targetElement.value += " " + data.text;
    targetElement.focus();
    // Use document.execCommand to insert text
    document.execCommand("insertText", false, "\n");
  } catch (error) {
    console.error("Error sending audio to the API:", error);
  }
}
async function sendAudioToLeptonWhisperApi(blob, language, base64prifix) {
  try {
    let showToast = devilentLIBS.showToast;
    showToast("transcribing");

    base64prifix = base64prifix || "data:audio/mpeg;base64,";
    // You need to replace the URL and headers with the ones provided by your online API
    const response = await fetch(
      `https://corsp.suisuy.eu.org/?https://whisperx.lepton.run/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer jl9xg3km3plgxmtk835jvjmzra3x2qzf`,
          // Add other headers required by the API
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: base64prifix + (await devilentLIBS.blobToBase64(blob)),
          language: language || "",
        }),
      }
    );

    if (!response.ok) {
      console.log(response);
      showToast("transcribe error: " + response.statusText);
      return false;
    }

    const data = await response.json();
    console.log(data);
    if (!data[0]?.text) {
      showToast("transcribe error: " + JSON.stringify(data));
      return false;
    }
    // You'll need to access the correct property from the response JSON based on the API's response format
    //targetElement.value = data.results.channels[0].alternatives[0].transcript;
    return data[0].text;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function whisperjaxws(blob) {
  // Create a new WebSocket connection to the specified URL
  const socket = new WebSocket(
    "wss://sanchit-gandhi-whisper-jax.hf.space/queue/join"
  );

  // Connection opened event handler
  socket.addEventListener("open", function (event) {
    console.log("Connected to the server.");
  });

  // Connection closed event handler
  socket.addEventListener("close", function (event) {
    console.log("Disconnected from the server.");
  });

  // Error event handler
  socket.addEventListener("error", function (event) {
    console.error("WebSocket error:", event);
  });

  // Message received event handler
  return new Promise(async (resolve, reject) => {
    socket.addEventListener("message", async function (event) {
      console.log("Message from server:", event.data);

      function generateRandomNumber(min, max) {
        // Validate input values
        if (isNaN(min) || isNaN(max) || min >= max) {
          throw new Error(
            "Invalid min or max values. min must be less than max."
          );
        }

        // Generate a random number in the desired range
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        return randomNumber;
      }

      const data = JSON.parse(event.data);
      let session_hash = "aaeegg" + generateRandomNumber(900, 1000);

      if (data.msg === "send_hash") {
        // The server is expecting a session hash
        socket.send(
          JSON.stringify({ fn_index: 0, session_hash: session_hash })
        );
      } else if (data.msg === "send_data") {
        // The server is ready to receive data
        // Prepare your audio/wav data in base64 format
        const base64Audio =
          "data:audio/wav;base64," + (await devilentLIBS.blobToBase64(blob)); // Replace with actual base64 audio data
        socket.send(
          JSON.stringify({
            data: [
              { data: base64Audio, name: "audio.wav" },
              "transcribe",
              false,
            ],
            event_data: null,
            fn_index: 0,
            session_hash: session_hash,
          })
        );
      } else if (data.msg === "estimation") {
        // Handle queue estimation message
        console.log(`Estimated processing time: ${data.rank_eta} seconds`);
      } else if (data.msg === "process_completed") {
        let result = data.output.data[0];
        console.log(result);
        resolve(result);
      }
      // Add additional handling for other message types as needed
      console.log(data);
    });
  });

  // Usage example of sendMessage function
  // sendMessage({ msg: 'your_message_here' });
}

async function sendAudioToCFWhisperApi(blob) {
  API_TOKEN = "8jqpB8mkkVGSbTeZl4wGnsx12xZefAB_y9iaORm3";
  ACCOUNT_ID = "9a90f9962da40fb826ad9666e4ed8ef0";

  try {
    const audioData = await blob.arrayBuffer();

    // const formData = new FormData();
    // formData.append("file", audioData);
    //formData.append('model', 'whisper-1');

    // You need to replace the URL and headers with the ones provided by your online API
    const response = await fetch(
      `https://corsp.suisuy.eu.org/?https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/openai/whisper`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          // Add other headers required by the API
        },
        body: audioData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error from API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    console.log(data.result.text);
    // You'll need to access the correct property from the response JSON based on the API's response format
    //targetElement.value = data.results.channels[0].alternatives[0].transcript;
    if (data?.result?.text) {
      return { text: data.result.text };
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error sending audio to the API:", error);
  }
  return false;
}

async function sendAudioToHFWhisperApi(blob) {
  API_TOKEN = "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";
  ACCOUNT_ID = "9a90f9962da40fb826ad9666e4ed8ef0";

  try {
    const audioData = await blob.arrayBuffer();

    // const formData = new FormData();
    // formData.append("file", audioData);
    //formData.append('model', 'whisper-1');

    // You need to replace the URL and headers with the ones provided by your online API
    const response = await fetch(
      `https://corsp.suisuy.eu.org/?https://api-inference.huggingface.co/models/openai/whisper-large-v3`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          // Add other headers required by the API
        },
        body: audioData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error from API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    // You'll need to access the correct property from the response JSON based on the API's response format
    //targetElement.value = data.results.channels[0].alternatives[0].transcript;
    if (data?.text) {
      return { text: data.text };
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error sending audio to the API:", error);
  }
  return false;
}

console.log("end script");
})();
