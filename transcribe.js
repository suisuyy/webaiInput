class Recorder {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.isRecording = false;
        this.mediaRecorder;
        this.encodeType = 'audio/ogg'
        this.language='en'
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

                // Audio context for volume analysis
                const audioContext = new AudioContext();
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
                    let scale = Math.min(Math.max(averageVolume / 15, 1.2), 2.5); // Scale factor between 1 and 2
                    targetElement.style.transform = `scale(${scale})`; // Next
                };

                // Call the updateButtonFontSize function periodically
                const volumeInterval = setInterval(updateButtonFontSize, 100);

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    console.log('dataavailable');
                    audioChunks.push(event.data);
                });

                mediaRecorder.start();
                this.isRecording = true;
                targetElement.style.backgroundColor = 'lightblue';

                return new Promise((resolve, reject) => {

                    mediaRecorder.addEventListener('stop', async () => {
                        this.isRecording = false;
                        console.log('stop');
                        clearInterval(volumeInterval);
                        audioContext.close(); // Close the audio context when done
                        const audioBlob = new Blob(audioChunks, { type: this.encodeType });
                        targetElement.style.transform = `scale(1)`; // Next
                        targetElement.style.background = 'transparent';
                        console.log('color', targetElement.style.background);
                        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
                        console.log('resolved ')
                        resolve(audioBlob)

                    });

                })

            });
    }
    stopRecording() {
        this.mediaRecorder.stop();
        this.isRecording=false;
    }
}

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
async function sendAudioToLeptonWhisperApi(blob) {
    try {
        // You need to replace the URL and headers with the ones provided by your online API
        const response = await fetch(`https://corsp.suisuy.eu.org/?https://whisperx.lepton.run/run`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer jl9xg3km3plgxmtk835jvjmzra3x2qzf`,
                // Add other headers required by the API
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({
                input: await blobToBase64(blob),
                language: this.language
            })
        });

        if (!response.ok) {
            throw new Error(`Error from API: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        // You'll need to access the correct property from the response JSON based on the API's response format
        //targetElement.value = data.results.channels[0].alternatives[0].transcript;
        return data[0].text;
    } catch (error) {
        console.error('Error sending audio to the API:', error);
    }
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
    return new Promise(async (resolve,reject)=>{
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
            let session_hash='aaeegg'+generateRandomNumber(900,1000)

    
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
                let result=data.output.data[0];
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

function blobToBase64(blob) {
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
}

function playAudioBlob(blob) {
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
