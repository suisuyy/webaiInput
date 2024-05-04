let textarea_1=document.getElementById('textarea_1');
textarea_1.value='\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'



// Create toolbar element
const toolbar = document.createElement("div");
toolbar.id = "esl-toolbar";
toolbar.style.position = "fixed"; // Make it stick to the top
toolbar.style.top = "0"; // Position at the very top
toolbar.style.left = "0"; // Position at the leftmost side
toolbar.style.width = "100%"; // Make it span the entire width
toolbar.style.backgroundColor = "lightgray"; // Example background color
toolbar.style.padding = "10px"; // Add some padding

// Create buttons

const askButton = document.createElement("button");
askButton.id = "ask-btn";
askButton.textContent = "Ask";



const correctBtn = document.createElement("button");
correctBtn.id = "correct-btn";
correctBtn.textContent = "Correct";

const translateBtn = document.createElement("button");
translateBtn.id = "translate-btn";
translateBtn.textContent = "Translate";

const explainBtn = document.createElement("button");
explainBtn.id = "explain-btn";
explainBtn.textContent = "Explain";

const defineBtn = document.createElement("button");
defineBtn.id = "define-btn";
defineBtn.textContent = "Define";

// Append buttons to toolbar
toolbar.appendChild(askButton);
toolbar.appendChild(correctBtn);
toolbar.appendChild(translateBtn);
toolbar.appendChild(explainBtn);
toolbar.appendChild(defineBtn);


// Create content area
const contentArea = document.createElement("div");
contentArea.id = "content";
contentArea.contentEditable = true; // Allow user to select text

// Append toolbar and content area to the body
document.body.appendChild(toolbar);
document.body.appendChild(contentArea);

// Function to get selected text
function getSelectedText() {
    return window.getSelection().toString();
}

// Implement functionalities for each button (same as before)

askButton.addEventListener("click", () => {
    const selectedText = getSelectedText();
    // ... (Use grammar correction library/API)
    let correctPrompt =
    ' ';
    devilentLIBS.leptonSimpleComplete(correctPrompt+window.getSelection().toString());
});


// Correct Button:
correctBtn.addEventListener("click", () => {
    const selectedText = getSelectedText();
    // ... (Use grammar correction library/API)
    let correctPrompt =
    'fix mistakes of the text, make it better,put anwser in codeblock:\n ';
    devilentLIBS.leptonSimpleComplete(correctPrompt+window.getSelection().toString());
});

// Translate Button:
translateBtn.addEventListener("click", () => {
    const selectedText = getSelectedText();
    // ... (Use translation API)
    let correctPrompt =
    'translate to english,japanese,chinese:\n ';
    devilentLIBS.leptonSimpleComplete(correctPrompt+window.getSelection().toString());
});

// Explain Button:
explainBtn.addEventListener("click", () => {
    const selectedText = getSelectedText();
    let correctPrompt =
    'explain this for seconds language learner in simple english and japanese:\n ';
    devilentLIBS.leptonSimpleComplete(correctPrompt+window.getSelection().toString());
    // ... (Use simplification API/NLP techniques)
});

// Define Button:
defineBtn.addEventListener("click", () => {
    const selectedText = getSelectedText();
    let correctPrompt =
    'define the word , first in simple english , and give some usage example:\n ';
    devilentLIBS.leptonSimpleComplete(correctPrompt+window.getSelection().toString());
    // ... (Use dictionary API)
});

// Style the toolbar
toolbar.style.position = "fixed";
toolbar.style.top = "0%";
toolbar.style.left = "0";
toolbar.style.width = "100%";
toolbar.style.backgroundColor = "#f0f0f0"; // Light gray background
toolbar.style.padding = "10px";
toolbar.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Add a subtle shadow

// Style the buttons
const buttonStyles = {
    backgroundColor: "#4CAF50", // Green background
    border: "none",
    color: "white",
    padding: "10px 20px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "5px", // Rounded corners
};

// Apply styles to each button
for (const button of [askButton,correctBtn, translateBtn, explainBtn, defineBtn]) {
    Object.assign(button.style, buttonStyles);
}
