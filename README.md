# webaiInput
ai input tool for web, support speech to text and more

# readme doc by gemini-1.5
# AI Input Tool

This project provides an AI-powered input tool that enhances user interactions with web pages. It offers features like speech-to-text, text generation, and context-aware actions, making it easier to navigate and manipulate web content.

## Features

* **Speech-to-text:** Convert your voice to text and input it into any text field or editable area on a web page.
* **Text Generation:** Utilize AI to generate text based on your prompts, assisting in writing, translation, and code generation.
* **Context-aware Actions:** Perform context-sensitive actions like asking questions about selected text, correcting mistakes, and translating languages.
* **Markdown Rendering:** Display AI responses and other content in a user-friendly markdown format.

## Installation

### Method 1: Tampermonkey

1. **Install Tampermonkey:** If you haven't already, install the Tampermonkey extension for your browser (available for Chrome, Firefox, Opera, Safari, Edge).
2. **Create a New Script:** Open Tampermonkey's dashboard and click on the "Create a new script" button.
3. **Copy and Paste:** Copy the contents of `index.js` and paste it into the editor of the new Tampermonkey script.
4. **Save:** Save the script. The AI Input Tool should now be active on all web pages.

### Method 2: Bookmarklet

1. **Create a New Bookmark:** Create a new bookmark in your browser.
2. **Edit the Bookmark:** Edit the bookmark's URL and replace it with the following JavaScript code:

```javascript
javascript:(function(){
  // Paste the full contents of index.js here, replacing this line.
})();
Use code with caution.
Markdown
Save: Save the bookmark. You can now click this bookmark to run the AI Input Tool on your current web page.
Usage
Floating Button: After installation, you will see a floating button on web pages (usually a blue circle). This button is the primary interface for interacting with the tool.
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
Contributing
Contributions to the project are welcome! If you find any issues or have ideas for improvements, feel free to create an issue or submit a pull request.
License
This project is licensed under the MIT License.
