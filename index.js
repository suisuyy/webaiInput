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
    async startRecording(targetElement) {
      if (this.isRecording) {
        console.log("already recording");
        return;
      }
      console.log("start recording");
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          this.mediaRecorder = new MediaRecorder(stream);

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
            mediaRecorder.stream,
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
            let scale = 3 + averageVolume / 15; // Scale factor between 1 and 2
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
        });
    }
    stopRecording() {
      this.isRecording = false;

      this.mediaRecorder?.stop();
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
  showToast: function showToast(
    text,
    x = 0,
    y = 0,
    w = 200,
    h = 0,
    duration = 2000,
    zIndex = 9999,
  ) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.width = w + "px";
    textArea.style.height = h === 0 ? "auto" : h + "px";
    textArea.style.borderWidth = "0";
    textArea.style.outline = "none";
    textArea.style.position = "fixed";
    textArea.style.left = x + "px";
    textArea.style.bottom = y + "px";
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
    textArea.style.bottom = "0";
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
    endfix = " ",
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
      copyToClipboard(text);

      // targetElement.value += ' ' + text;
    }
  },
  dragElement: function dragElement(
    elmnt,
    movableElmnt = elmnt.parentElement,
    speed = 3,
  ) {
    elmnt.style.touchAction = "none"; //need on touch devices
    var pos1 = 0,
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
          document.querySelector("#shadeDivForDragElement"),
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
        document.querySelector("#shadeDivForDragElement"),
      );
      //clearTimeout(rmShadeTimeout);
    }
  },

  renderMarkdown(mdString, targetElement) {
    // Extend regex patterns to include inline code and code blocks
    const headerPattern = /^#+\s*(.+)$/gm;
    const boldPattern = /\*\*(.*?)\*\*/g;
    const linkPattern = /\[(.*?)\]\((.*?)\)/g;
    const newlinePattern = /(?:\n\n)/g;
    const inlineCodePattern = /`(.*?)`/g;
    const codeBlockPattern = /```(\w+)?\n(.*?)```/gs;

    let html = mdString;
    html = "\n\n" + html;

    html = html.replace(codeBlockPattern, (match, language, code) => {
      return `
          <div class="code-block">
              <button class="copy-code-btn">Copy Code</button>
              <button class="insert-code-btn">Insert Code</button>
              <pre><code${
                language ? ` class="language-${language}"` : ""
              }>${code}</code></pre>
          </div>
      `;
    });

    // Replace inline code with <code> tags
    html = html.replace(inlineCodePattern, "<code>$1</code>");

    // Replace headers with <h1> to <h6> tags
    html = html.replace(headerPattern, (match, content) => {
      const level = match.slice(0, match.indexOf(" ")).length;
      return `<h${level}>${content}</h${level}>`;
    });

    // Replace bold text with <strong> tags
    html = html.replace(boldPattern, "<strong>$1</strong>");

    // Replace links with <a> tags
    html = html.replace(linkPattern, '<a href="$2">$1</a>');

    // Replace newlines with <br> tags
    html = html.replace(newlinePattern, "<br>");

    targetElement.innerHTML = html;

    // Function to copy the code to clipboard

    // Attach event listeners to copy and insert buttons
    const buttons = targetElement.querySelectorAll(".code-block button");
    buttons.forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        const code = btn.parentElement.querySelector("code").innerText;
        if (btn.classList.contains("copy-code-btn")) {
          copyToClipboard(code);
        } else if (btn.classList.contains("insert-code-btn")) {
          console.log("insert button down");
          writeText(document.activeElement, code, "", "");
        }
      });
    });

    // Add some basic styles
    targetElement.classList.add("markdown-container");
    const style = `
      <style>
        .markdown-container {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 0px;
          background-color: azure;
          overflow:auto;
          box-shadow: 0px 0px 50px rgba(0, 0, 0, 0.4);
          
        }
        .code-block {
          position: relative;
        }
        .copy-code-btn, .insert-code-btn {
          position: absolute;
          top: 0;
          right: 0;
          margin: 5px;
          padding: 2px 5px;
          font-size: 12px;
          border: none;
          border-radius: 3px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
        }
        .copy-btn, .insert-btn {
          
          margin: 5px;
          padding: 2px 5px;
          font-size: 12px;
          border: none;
          border-radius: 3px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
        }
        pre {
          background-color: #f7f7f7;
          border-radius: 5px;
          padding: 10px;
          white-space: pre
  
  -wrap;
  word-break: break-all;
  }
  code {
  background-color: #f1f1f1;
  border-radius: 3px;
  padding: 2px 5px;
  font-family: 'Courier New', Courier, monospace;
  }
  a {
  color: #0645ad;
  text-decoration: none;
  }
  a:hover {
  text-decoration: underline;
  }
  button:hover {
  background-color: #0056b3;
  }
  
  `;

    document.head.insertAdjacentHTML("beforeend", style);

    // Add a copy-to-clipboard button
    const copyButton = document.createElement("button");
    copyButton.innerText = "Copy";
    copyButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      copyToClipboard(mdString);
    });
    // Add an insert-to-webpage button
    const insertButton = document.createElement("button");
    insertButton.innerText = "Insert";
    insertButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      writeText(document.activeElement, mdString, "", "");
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
    dragElement(buttonContainer, targetElement);
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
          "Minimal mouse movement (< 10px in either direction) and short duration click detected.",
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
    document.body.appendChild(audio); // Uncomment if you want to display the audio player

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
      },
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

let dragElement = devilentLIBS.dragElement;
let Recorder = devilentLIBS.Recorder;
let writeText = devilentLIBS.writeText;
let copyToClipboard = devilentLIBS.copyToClipboard;
let showToast = devilentLIBS.showToast;

let moveToElement = devilentLIBS.moveToElement;
let addEventListenerForActualClick =
  devilentLIBS.addEventListenerForActualClick;

let blobToBase64 = devilentLIBS.blobToBase64;
let playAudioBlob = devilentLIBS.playAudioBlob;

let model = {
  api_url: "",
  api_key: "",
  voice_button_id: "whisper_voice_button",
  transcribeProvider: "lepton_whisper",
  language: "",
  supportedInputTypeList: ["text", "number", "tel", "search", "url", "email"],
  buttonBackgroundColor: "lightblue",
  minimalRecordTime: 2000,
};

let view = {
  elem: {
    currentInputElem: null,
    voiceButton: null,
  },
  init() {
    this.recorder = new Recorder();
    this.createButton();

    setInterval(() => {
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

    dragElement(button, button);
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

    addEventListenerForActualClick(button, (event) => {
      let clientX = event?.clientX;
      let clientY = event?.clientY;
      view.createMenu(clientX, clientY + 50);
      //this.createMenuByGPT4(clientX+50,clientY+50);
    });

    addEventListenerForActualClick(document.body, (event) => {
      if (event.target.tagName === "INPUT") {
        if (model.supportedInputTypeList.includes(event.target.type)) {
          moveToElement(button, event.target);
        }
      } else if (
        event.target.tagName === "TEXTAREA" ||
        devilentLIBS.isEditableElement(event.target) === true
      ) {
        moveToElement(button, event.target);
      }
      console.log(
        event.target,
        devilentLIBS.isEditableElement(event.target)
          ? "editable"
          : "noneditable",
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
      moveToElement(this.elem.voiceButton, element);
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
                  "gained focus",
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

  createMenu(x, y) {
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // check if menu already exists
    let menuContainer = document.getElementById("my-menu");
    if (menuContainer) {
      // menu already exists, update its position
      // Adjust position to keep the menu inside the window
      menuContainer.style.left =
        Math.min(x, windowWidth - menuContainer.offsetWidth) + "px";
      menuContainer.style.top =
        Math.min(y, windowHeight - menuContainer.offsetHeight) + "px";
      menuContainer.style.zIndex = "99999999";

      return;
    }

    // create menu container
    menuContainer = document.createElement("div");
    menuContainer.id = "my-menu"; // add an id to the menu
    menuContainer.style.zIndex = "99999";

    menuContainer.style.position = "fixed";
    menuContainer.style.backgroundColor = "white";
    menuContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    menuContainer.style.borderRadius = "4px";
    menuContainer.style.display = "flex";
    menuContainer.style.flexDirection = "column";
    menuContainer.style.alignItems = "flex-start";
    menuContainer.style.padding = "10px";
    // Append the menu to the body to calculate its dimensions
    document.body.appendChild(menuContainer);

    // Now adjust position to keep the menu inside the window
    menuContainer.style.left =
      Math.min(x, windowWidth - menuContainer.offsetWidth) + "px";
    menuContainer.style.top =
      Math.min(y, windowHeight - menuContainer.offsetHeight) + "px";

    menuContainer.style.backgroundColor = "white";
    menuContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    menuContainer.style.borderRadius = "4px";
    menuContainer.style.display = "flex";
    menuContainer.style.flexDirection = "column";
    menuContainer.style.alignItems = "flex-start";
    menuContainer.style.padding = "10px";
    devilentLIBS.disableSelect(menuContainer);

    // Function to create a menu item
    function createMenuItem(textContent, handler) {
      const menuItem = document.createElement("button");
      menuItem.style.backgroundColor = "transparent";
      menuItem.style.border = "none";
      menuItem.style.fontSize = "14px";
      menuItem.style.cursor = "pointer";
      menuItem.style.marginBottom = "10px"; // Set the margin-bottom here
      menuItem.style.touchAction = "none";
      menuItem.textContent = textContent;
      menuItem.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        handler();
      });

      menuContainer.appendChild(menuItem);
      return menuItem;
    }

    // create remove menu item
    const removeMenuItem = createMenuItem("Remove Menu");
    removeMenuItem.addEventListener("pointerdown", () =>
      menuContainer.remove(),
    );
    menuContainer.appendChild(removeMenuItem);

    let currentButton;

    const closeButton = createMenuItem("Close");
    closeButton.addEventListener("pointerdown", () => {
      if (confirm("remove the AI tool now?")) {
        view.elem.voiceButton.remove();
        menuContainer.remove();
      }
    });
    menuContainer.appendChild(closeButton);

    // create start menu item
    const startMenuItem = createMenuItem("Start");
    menuContainer.appendChild(startMenuItem);
    startMenuItem.addEventListener("pointerdown", () => {
      view.handler.startRecording();
    });

    // create stop menu item
    const stopMenuItem = createMenuItem("Stop");
    menuContainer.appendChild(stopMenuItem);
    stopMenuItem.addEventListener("pointerdown", () => {
      view.handler.stopRecording();
    });

    let copyButton = createMenuItem("Copy");
    menuContainer.appendChild(copyButton);
    copyButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      document.execCommand("copy");
      showToast("Copied to clipboard");
    });

    createMenuItem("Cut", () => {
      document.execCommand("copy");
      document.execCommand("delete");
      showToast("Cut to clipboard");
    });

    let pasteButton = createMenuItem("Paste");
    menuContainer.appendChild(pasteButton);
    pasteButton.addEventListener("pointerdown", async (e) => {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        writeText(document.activeElement, text);
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

    let askButton = createMenuItem("Ask");
    menuContainer.appendChild(askButton);
    askButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      view.handler.ask();
    });

    askButton.addEventListener("pointerup", () => {
      view.handler.stopRecording();
    });
    // add menu to the body

    menuContainer.style.left =
      Math.min(x, windowWidth - menuContainer.offsetWidth) + "px";
    menuContainer.style.top =
      Math.min(y, windowHeight - menuContainer.offsetHeight) + "px";
    document.body.appendChild(menuContainer);
  },

  createMenuByGPT4(x, y) {
    // Check if the menu already exists
    var existingMenu = document.getElementById("customMenu");

    if (existingMenu) {
      // Move the existing menu to the new position
      existingMenu.style.left = x + "px";
      existingMenu.style.top = y + "px";
      return; // Exit the function since the menu already exists
    }

    // Create the menu container
    var menu = document.createElement("div");
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
    var itemList = ["Remove", "Start", "Stop"];

    itemList.forEach(function (item) {
      var button = document.createElement("button");
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
    async ask() {
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      //console.log(await blobToBase64(audioblob))

      if (Date.now() - startTime < model.minimalRecordTime) {
        showToast("time too short, this will not transcribe");
        devilentLIBS.leptonSimpleComplete(window.getSelection().toString());
        return;
      }

      let transcribe = await sendAudioToLeptonWhisperApi(audioblob);
      if (transcribe === false) {
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
      devilentLIBS.displayMarkdown(userText + "\n\n please wait");
      devilentLIBS.leptonSimpleComplete(userText);
    },
    async startRecording(event) {
      let startTime = Date.now();
      let audioblob = await view.recorder.startRecording(view.elem.voiceButton);
      //console.log(await blobToBase64(audioblob))

      if (Date.now() - startTime < model.minimalRecordTime) {
        showToast("time too short, this will not transcribe");
        return;
      }

      let transcribe = await sendAudioToLeptonWhisperApi(audioblob);
      if (transcribe === false) {
        console.log("transcribe failed, try alternative way");
        transcribe = await whisperjaxws(audioblob);
      }
      writeText(document.activeElement, transcribe);
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
          input: base64prifix + (await blobToBase64(blob)),
          language: language || "",
        }),
      },
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
    "wss://sanchit-gandhi-whisper-jax.hf.space/queue/join",
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
            "Invalid min or max values. min must be less than max.",
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
          JSON.stringify({ fn_index: 0, session_hash: session_hash }),
        );
      } else if (data.msg === "send_data") {
        // The server is ready to receive data
        // Prepare your audio/wav data in base64 format
        const base64Audio =
          "data:audio/wav;base64," + (await blobToBase64(blob)); // Replace with actual base64 audio data
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
          }),
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
      },
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
      },
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
