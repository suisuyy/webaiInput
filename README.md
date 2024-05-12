# webaiInput
ai input tool for web, support speech to text for fast input and more, 90% code written by AI (gpt4 and mixtral large)

![image](https://github.com/suisuyy/webaiInput/assets/50224389/a5629cca-b146-4940-bfdb-5f88e52bfa5e)


# readme doc by gemini-1.5
# AI Input Tool

This project provides an AI-powered input tool that enhances user interactions with web pages. It offers features like speech-to-text, text generation, and context-aware actions, making it easier to navigate and manipulate web content.

## Features

* **Speech-to-text:** Convert your voice to text and input it into any text field or editable area on a web page.
* **Text Generation:** Utilize AI to generate text based on your prompts, assisting in writing, translation, and code generation.
* **Context-aware Actions:** Perform context-sensitive actions like asking questions about selected text, correcting mistakes, and translating languages.
* **Markdown Rendering:** Display AI responses and other content in a user-friendly markdown format.


## Usage
Floating Button: After installation as script, you will see a floating  button on web pages (usually a blue circle). This button is the primary interface for interacting with the tool.
Speech-to-text: Click and hold the button to record your voice. The transcribed text will be automatically inputted into the currently focused text field or editable area.
Contextual Menu: Click the floating button to open a menu with options like "Start," "Stop," "TTS," "Copy," "Cut," "Paste," "Enter," "Correct," and "Ask."
AI Interaction: Use the "Ask" button or Ctrl+Enter shortcut to ask questions about selected text or the current line. The AI will respond and display its answer in a markdown container.
Configuration
The tool's behavior can be customized by modifying the appModel object within index.js. You can change:
voice_button_id: The ID of the floating button element.
transcribeProvider: The speech-to-text engine used (currently supports "lepton_whisper" and "whisperjaxws").
language: The default language for speech recognition.
supportedInputTypeList: A list of input types that trigger the button's proximity movement.
buttonBackgroundColor: The background color of the floating button.
minimalRecordTime: The minimum recording duration (in milliseconds) for speech-to-text.
llm_model: The AI model used for text generation and other tasks (default is "mixtral8x22b").


## Installation


### Method 0: webapp
   open https://webaiinput.pages.dev, it's a simple notetaking app with the AI tools

### Method 1: Tampermonkey

1. **Install Tampermonkey:** If you haven't already, install the Tampermonkey extension for your browser (available for Chrome, Firefox, Opera, Safari, Edge).
2. **Create a New Script:** Open Tampermonkey's dashboard and click on the "Create a new script" button.
3. **Copy and Paste:** Copy the the following code  and paste it into the editor of the new Tampermonkey script:
```
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
    javascript:(function(){var scriptURL='  https://webaiinput.pages.dev/index.js  ';var d=document,s=d.createElement('script');s.setAttribute('src',scriptURL);d.body.appendChild(s)})();

}
)();
```
4. **Save:** Save the script. The AI Input Tool should now be active on all web pages.

### Method 2: Bookmarklet

1. **Create a New Bookmark:** Create a new bookmark in your browser.
2. **Edit the Bookmark:** Edit the bookmark's URL and replace it with the following JavaScript code:
   ```
   javascript:(function(){var scriptURL='  https://webaiinput.pages.dev/index.js  '; var d=document,s=d.createElement('script');s.setAttribute('src',scriptURL);d.body.appendChild(s)})();  
   ```
3. open the bookmark on anypage, you will see the magic blue round button


Contributing
Contributions to the project are welcome! If you find any issues or have ideas for improvements, feel free to create an issue or submit a pull request.
License
This project is licensed under the MIT License.
