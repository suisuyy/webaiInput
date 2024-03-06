let startButton = document.querySelector("#start");
let stopButton = document.querySelector("#stop");
let testButton = document.querySelector("#testButton");

let textarea = document.querySelector("textarea");
const fileInput = document.getElementById("fileinput");
let editableDiv = document.querySelector("#editableDiv");
editableDiv.isContentEditable;

let mdcontainer=document.querySelector('#mdcontainer');

devilentLIBS.disableSelect(startButton);
devilentLIBS.disableSelect(stopButton);
devilentLIBS.disableSelect(testButton);


devilentLIBS.renderMarkdown('# Sure, \n\n #here a simple Python code to add two numbers with detailed comments:```python\n# This program adds two numbers\n# Get the first number from user input\n num1 = float(input("Enter the first number: "))\n# Get the second number from user input\n <div>this div</div>```', mdcontainer);


