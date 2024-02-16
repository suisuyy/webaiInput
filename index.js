
const libs = {
    Recorder: class Recorder {
        constructor(apiKey) {
            this.apiKey = apiKey;
            this.isRecording = false;
            this.mediaRecorder;
            this.encodeType = 'audio/mpeg'
            this.language = 'en',
            this.recordingColor = 'antiquewhite'
        }

        // The startRecording method remains mostly unchanged until the getUserMedia.then() block
        async startRecording(targetElement, onstop) {
            if (this.isRecording) {
                console.log('already recording')
                return;
            }
            console.log('start recording');
            return navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    this.mediaRecorder = new MediaRecorder(stream);

                    let mediaRecorder = this.mediaRecorder;
                    let audioChunks = [];
                    mediaRecorder.start();
                    this.isRecording = true;
                    targetElement.style.backgroundColor = this.recordingColor;


                    // // Audio context for volume analysis
                    let volumeInterval;
                    let audioContext;
                    audioContext = new AudioContext();
                    const analyser = audioContext.createAnalyser();
                    const microphone = audioContext.createMediaStreamSource(mediaRecorder.stream);
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
                        let scale = 3 + (averageVolume / 15); // Scale factor between 1 and 2
                        targetElement.style.transform = `scale(${scale})`; // Next
                    };
                    // Call the updateButtonFontSize function periodically
                    volumeInterval = setInterval(updateButtonFontSize, 100);

                    mediaRecorder.addEventListener('dataavailable', (event) => {
                        console.log('dataavailable');
                        audioChunks.push(event.data);
                    });



                    return new Promise((resolve, reject) => {

                        mediaRecorder.addEventListener('stop', async () => {

                            this.isRecording = false;
                            console.log('stop');
                            clearInterval(volumeInterval);
                            const audioBlob = new Blob(audioChunks, { type: this.encodeType });
                            targetElement.style.transform = `scale(1)`; // Next
                            targetElement.style.background = 'transparent';
                            console.log('color', targetElement.style.background);

                            audioContext?.close(); // Close the audio context when done
                            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                            console.log('resolved ')
                            resolve(audioBlob)

                        });

                    })

                });
        }
        stopRecording() {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    },
    showToast: function showToast(text, x = 0, y = 0, w = 200, h = 100, duration = 2000, zIndex = 99999) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.width = w + 'px';
        textArea.style.height = h + 'px'
        textArea.style.borderWidth = '0'
        textArea.style.outline = 'none'
        textArea.style.position = 'fixed';
        textArea.style.left = x + 'px';
        textArea.style.bottom = y + 'px';
        textArea.style.zIndex = zIndex;
        textArea.disabled=true;
        document.body.appendChild(textArea);
        setTimeout(() => {
            document.body.removeChild(textArea);
        }, duration);
    },
    copyToClipboard: function copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.width = '50%';
        textArea.style.height = '100px'
        textArea.style.borderWidth = '0'
        textArea.style.outline = 'none'
        textArea.style.position = 'fixed';
        textArea.style.left = '0';
        textArea.style.bottom = '0';
        textArea.style.zIndex = '9999999'
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.disabled=true;
        //textArea.disabled=true;
        textArea.value = 'copyed to clipboard \n' + textArea.value;
        textArea.scrollTo(10000, 100000)
        setTimeout(() => {
            document.body.removeChild(textArea);
        }, 4000);
    },
    dragElement: function dragElement(elmnt, movableElmnt = elmnt.parentElement, speed = 3) {
        elmnt.style.touchAction = 'none'; //need on touch devices
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;

        let shadeDiv;
        let rmShadeTimeout;

        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onpointerdown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onpointerup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onpointermove = elementDrag;

            //create a shade to cover full body to stop iframe catch mouse move
            shadeDiv = document.createElement('div');
            shadeDiv.style.width = '300vw';
            shadeDiv.style.height = '300vh';
            shadeDiv.style.position = 'fixed';
            shadeDiv.style.top = '0';
            shadeDiv.style.left = '0';
            shadeDiv.style.backgroundColor = 'rgb(230,230,230,0.2)';
            shadeDiv.style.zIndex = 100000;
            document.body.appendChild(shadeDiv);
            rmShadeTimeout = setTimeout(() => {
                document.body.removeChild(shadeDiv);
            }, 10000);

            // console.log(pos1,pos2,pos3,pos4)
            // set the element's new position:

            // movableElmnt.style.bottom = undefined;
            // movableElmnt.style.right = undefined;
            // movableElmnt.style.position = 'fixed';

            console.log(e.clientX, e.clientY);
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;

            // console.log(pos1,pos2,pos3,pos4)
            // set the element's new position:
            movableElmnt.style.position = 'fixed';
            movableElmnt.style.top = e.clientY - movableElmnt.clientHeight / 2 + 'px';
            movableElmnt.style.left = e.clientX - movableElmnt.clientWidth / 2 + 'px';
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            console.log('pointerup');
            document.onpointerup = null;
            document.onpointermove = null;

            document.body.removeChild(shadeDiv);
            clearTimeout(rmShadeTimeout);
        }
    },
    writeText: function writeText(targetElement, text,prefix=' ',endfix=' ') {
        if (targetElement.tagName === 'BODY') {
            copyToClipboard(text);

        }
        else {
            document.execCommand('insertText', false, `${prefix}${text}${endfix}`);
            targetElement.scrollTo(100000, 1000000)

            // targetElement.value += ' ' + text;


        }
    },
    moveToElement: (mElem, targetElement,alwayInWindow=true) => {
        const rect = targetElement.getBoundingClientRect();
        // The rect object contains the position information
        let  x = rect.left + rect.width * 0.85; // X position relative to the window
        let  y = rect.top;
        if(alwayInWindow){
            x=Math.abs(x);
            y=Math.abs(y);
            x=Math.min(x,window.innerWidth-mElem.clientWidth)
            y=Math.min(y,window.innerHeight-mElem.clientHeight)

        }
        mElem.style.left = x + 'px';
        mElem.style.top = y + 'px';
    },
    addEventListenerForActualClick(element, handler) {

        let initialX, initialY;

        element.addEventListener('pointerdown', (event) => {
            initialX = event.clientX;
            initialY = event.clientY;


        });
        element.addEventListener('pointerup', (event) => {
            const deltaX = Math.abs(event.clientX - initialX);
            const deltaY = Math.abs(event.clientY - initialY);

            if (deltaX <= 10 && deltaY <= 10) {
                console.log('Minimal mouse movement (< 10px in either direction) detected.');
                handler(event);
            }

        });
    },
    blobToBase64: function blobToBase64(blob) {
        if (!(blob instanceof Blob)) {
            throw new TypeError('Parameter must be a Blob object.');
        }

        if (!blob.size) {
            throw new Error('Empty Blob provided.');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
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
        audio.play()
            .then(() => {
                // Audio played successfully
                console.log("Audio played successfully!");
            })
            .catch(error => {
                // Handle errors
                console.error("Error playing audio:", error);
            });

    }



}


let dragElement = libs.dragElement;
let Recorder = libs.Recorder;
let writeText = libs.writeText;
let copyToClipboard = libs.copyToClipboard;
let showToast=libs.showToast;

let moveToElement = libs.moveToElement;
let addEventListenerForActualClick = libs.addEventListenerForActualClick;

let blobToBase64 = libs.blobToBase64;
let playAudioBlob = libs.playAudioBlob;


let model = {
    api_url: '',
    api_key: '',
    voice_button_id: 'whisper_voice_button',
    transcribeProvider: 'lepton_whisper',
    language: '',
    supportedInputTypeList:['text','number','tel','search','url','email',],

}

let view = {
    elem: {
        currentInputElem: null,
        voiceButton: null,
    },
    init() {

        this.recorder = new Recorder();
        this.createButton();

        setInterval(() => {
            const whisperButton = document.getElementById('whisper_voice_button');

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
        const whisperButton = document.getElementById('whisper_voice_button');

        if (whisperButton) {
            // Button exists, return now do nothing
            return;
        }

        console.log('create button');

        let button = document.createElement('button');
        this.elem.voiceButton = button;

        button.id = model.voice_button_id;
        button.innerText = '◯';
        button.type = 'button'; // Ensure the button does not submit forms
        button.classList.add('speech-to-text-button');

        button.style.top = '0';
        button.style.left = '0';

        button.style.width = '40px';
        button.style.height = button.style.width;
        button.style.fontSize = '30px';

        button.style.border = '0px';
        button.style.color = 'blue';
        button.style.background = 'transparent';
        button.style.zIndex = 1000000;
        button.style.position = 'fixed';

        button.style.borderRadius = '50%';
        button.style.userSelect = 'none';
        button.style.touchAction = 'none';
        document.body.appendChild(button);

        dragElement(button, button);
        button.addEventListener('click', () => {
            // this.controller.handleRecording(targetElement);
            console.log('clicked');
        });
        button.addEventListener('pointerdown', async (event) => {
            event.preventDefault();
            let startTime=Date.now();
            let audioblob = await this.recorder.startRecording(this.elem.voiceButton);
            //console.log(await blobToBase64(audioblob))

            if(Date.now()-startTime<1500){
                showToast("time too short, this will not transcribe")
                return;
            }

            let transcribe = await sendAudioToLeptonWhisperApi(audioblob)
            if (transcribe === false) {
                console.log('transcribe failed, try alternative way')
                transcribe = await whisperjaxws(audioblob);
            }
            writeText(document.activeElement, transcribe);

        });
        // button.addEventListener('touchdown', async (event) => {

        // });
        button.addEventListener('pointerup', () => {
            console.log('up, stop rec');
            this.recorder.stopRecording();

        });

        addEventListenerForActualClick(document.body, (event) => {
            if (event.target.tagName === 'INPUT') {
                if(model.supportedInputTypeList.includes(event.target.type))
                {
                    moveToElement(button, event.target);

                }

            }
            else if( event.target.tagName === 'TEXTAREA' || event.target.isContentEditable===true) {
                moveToElement(button, event.target);

            }
            console.log(event.target,event.target.isContentEditable);
        })

        window.addEventListener('resize',()=>{
            let buttonPos=button.getBoundingClientRect();
            if(buttonPos.top>window.innerHeight-buttonPos.height){
                button.style.top=(window.innerHeight-buttonPos.height)+'px'
            }
            console.log('resize',buttonPos.top,window.innerHeight);
            
        })

        return button;
    },
    monitorFocus() {
        let focusHandler = element => {
            moveToElement(this.elem.voiceButton, element);
        }

        setInterval(() => {
            if (document.querySelector('#whisper_voice_button') === null) {
                console.log('no voicebutton, create it now')
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
        const inputElements = document.querySelectorAll('input, textarea');

        // Add event listener for each element
        inputElements.forEach(element => {
            element.addEventListener('focus', () => {
                focusHandler(element)
            });
        });

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.tagName === 'TEXTAREA' || addedNode.tagName === 'INPUT') {
                            // New textarea detected!
                            console.log('New textarea added:', addedNode);
                            // Add your event listener as needed
                            addedNode.addEventListener('focus', (event) => {
                                focusHandler(addedNode);
                                console.log('New ', addedNode.id || addedNode.name, 'gained focus');

                            });
                        }
                    }
                }
            }
        });
        // Observe the document body or specific container
        observer.observe(document.body, { childList: true, subtree: true });


    }
}


view.init();












async function sendAudioToApi(blob, targetElement) {
    try {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('model', 'whisper-1');

        // You need to replace the URL and headers with the ones provided by your online API
        const response = await fetch(`${API_URL}/v1/audio/transcriptions`, {
            method: 'POST',
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
        targetElement.value += ' ' + data.text;
        targetElement.focus();
        // Use document.execCommand to insert text
        document.execCommand('insertText', false, '\n');
    } catch (error) {
        console.error('Error sending audio to the API:', error);
    }
}
async function sendAudioToLeptonWhisperApi(blob, language, base64prifix) {
    let showToast = libs.showToast;
    showToast('transcribing');

    base64prifix = base64prifix || 'data:audio/mpeg;base64,'
    // You need to replace the URL and headers with the ones provided by your online API
    const response = await fetch(`https://corsp.suisuy.eu.org/?https://whisperx.lepton.run/run`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer jl9xg3km3plgxmtk835jvjmzra3x2qzf`,
            // Add other headers required by the API
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            input: base64prifix + await blobToBase64(blob),
            language: language || ''
        })
    });

    if (!response.ok) {
        console.log(response)
        showToast('transcribe error: ' + response.statusText)
        return false;
    }

    const data = await response.json();
    console.log(data);
    if (!data[0]?.text) {
        showToast('transcribe error: ' + JSON.stringify(data))
        return false;
    }
    // You'll need to access the correct property from the response JSON based on the API's response format
    //targetElement.value = data.results.channels[0].alternatives[0].transcript;
    return data[0].text;

}

async function whisperjaxws(blob) {
    // Create a new WebSocket connection to the specified URL
    const socket = new WebSocket('wss://sanchit-gandhi-whisper-jax.hf.space/queue/join');

    // Connection opened event handler
    socket.addEventListener('open', function (event) {
        console.log('Connected to the server.');

    });

    // Connection closed event handler
    socket.addEventListener('close', function (event) {
        console.log('Disconnected from the server.');
    });

    // Error event handler
    socket.addEventListener('error', function (event) {
        console.error('WebSocket error:', event);
    });

    // Message received event handler
    return new Promise(async (resolve, reject) => {
        socket.addEventListener('message', async function (event) {
            console.log('Message from server:', event.data);

            function generateRandomNumber(min, max) {
                // Validate input values
                if (isNaN(min) || isNaN(max) || min >= max) {
                    throw new Error('Invalid min or max values. min must be less than max.');
                }

                // Generate a random number in the desired range
                const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

                return randomNumber;
            }

            const data = JSON.parse(event.data);
            let session_hash = 'aaeegg' + generateRandomNumber(900, 1000)


            if (data.msg === 'send_hash') {
                // The server is expecting a session hash
                socket.send(JSON.stringify({ fn_index: 0, session_hash: session_hash }));
            } else if (data.msg === 'send_data') {
                // The server is ready to receive data
                // Prepare your audio/wav data in base64 format
                const base64Audio = 'data:audio/wav;base64,' + await blobToBase64(blob); // Replace with actual base64 audio data
                socket.send(JSON.stringify(
                    {
                        data: [{ data: base64Audio, "name": "audio.wav" },
                            "transcribe", false],
                        "event_data": null, "fn_index": 0,
                        "session_hash": session_hash
                    }));
            } else if (data.msg === 'estimation') {
                // Handle queue estimation message
                console.log(`Estimated processing time: ${data.rank_eta} seconds`);
            } else if (data.msg === 'process_completed') {
                let result = data.output.data[0];
                console.log(result);
                resolve(result);

            }
            // Add additional handling for other message types as needed
            console.log(data)
        });

    })

    // Usage example of sendMessage function
    // sendMessage({ msg: 'your_message_here' });
}

async function sendAudioToCFWhisperApi(blob) {
    try {
        const formData = new FormData();
        formData.append('file', blob);
        //formData.append('model', 'whisper-1');

        // You need to replace the URL and headers with the ones provided by your online API
        const response = await fetch(`${API_URL}/v1/audio/transcriptions`, {
            method: 'POST',
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
        console.log(data);
        // You'll need to access the correct property from the response JSON based on the API's response format
        //targetElement.value = data.results.channels[0].alternatives[0].transcript;
        return data;
    } catch (error) {
        console.error('Error sending audio to the API:', error);
    }
}







