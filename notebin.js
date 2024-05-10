function getCurrentLineString(element) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const offset = range.startOffset;

  // If the selection is inside a text node
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    const lineStart = text.lastIndexOf('\n', offset) + 1;
    const lineEnd = text.indexOf('\n', offset);
    const line = lineEnd === -1 ? text.slice(lineStart) : text.slice(lineStart, lineEnd);
    return line;
  }

  // If the selection is inside an element node
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let currentNode, currentLine = '';

  while (currentNode = walker.nextNode()) {
    const text = currentNode.textContent;
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (range.intersectsNode(currentNode)) {
        currentLine = lines[i];
        break;
      }
    }

    if (currentLine !== '') {
      break;
    }
  }

  return currentLine;
}





function createLastButton(cmd, name = cmd) {
  const button = document.createElement('button');

  button.className = 'toastui-editor-toolbar-icons last';
  button.style.backgroundImage = 'none';
  button.style.margin = '0';
  button.innerHTML = `<b>${name}</b>`;
  button.addEventListener('click', () => {
    editor.exec(cmd);
  });

  return button;
}

let editorContainer=document.querySelector('#notebin_editor');
window.tuieditor = window.editor = new toastui.Editor({
  el: document.querySelector('#notebin_editor'),
  previewStyle: 'tab',
  height: window.innerHeight * 0.8 + 'px',
  initialValue: '\n\n\n\n\n\n',
  toolbarItems: [
    [{
      el: createLastButton('undo', '↶'),
      command: 'undo',
      tooltip: 'Undo'
    },
    {
      el: createLastButton('redo', '↷'),
      command: 'redo',
      tooltip: 'Redo'
    }
    ],
    ['heading'],
    //[ 'bold', 'italic', 'strike'],
    //   ['hr', 'quote'],
    //   ['ul', 'ol', 'task', 'indent', 'outdent'],
    //    ['table', 'image', 'link'],
    ['image'],
    ['code', 'codeblock'],

  ]
});


//   editor.insertToolbarItem({ groupIndex: 0, itemIndex: 0 }, {
//     name: 'myItem',
//     tooltip: 'Custom Button',
//     command: 'bold',
//     text: '@',
//     className: 'toastui-editor-toolbar-icons first',
//     style: { backgroundImage: 'none' }
//   });


let editorModel = {
  value: null,
  lastChangeTime: 0,
  noteid: ''
}


// Create a new custom event
const editorchange = new CustomEvent('editorchange', {
  detail: {
    // Include any data you want to pass with the event
    message: 'Editor content has changed'
  },
  bubbles: true,
  cancelable: true
});

document.addEventListener('editorchange', ()=>{
  console.log('editorchange');
  editorModel.lastChangeTime=Date.now();
  syncNote();
  
})

let setChangeTimeoutid=0;
document.addEventListener('keydown', ()=>{
  console.log('keydown');
  clearTimeout(setChangeTimeoutid);
  setChangeTimeoutid=setTimeout(() => {
  document.body.dispatchEvent(editorchange)

  }, 5000);
  
})

document.body.addEventListener('paste', (event) => {
  // Log the event and the pasted data
  console.log('Paste event triggered:', event);
  console.log('Pasted data:', event.clipboardData.getData('text'));
  document.body.dispatchEvent(editorchange)

});

document.body.addEventListener('pointerdown', (event) => {
  // Log the event and the pasted data
  console.log('pointerdown event triggered:', event);
  syncNote();
});


document.body.addEventListener('focus', (event) => {
  // Log the event and the pasted data
  console.log('focus event triggered:', event);
  syncNote();
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && event.ctrlKey) {
    // Your code here
    let currentLineString=getCurrentLineString(editorContainer);
    console.log('Ctrl + Enter was pressed:',currentLineString);
    let prompt = ' ';
    let selectText = window.getSelection().toString();
    devilentLIBS.displayMarkdown(`${prompt} **${selectText.length >= 1 ? selectText : currentLineString}** ...`);
    devilentLIBS.leptonSimpleComplete(`${prompt} **${selectText.length >= 1 ? selectText : currentLineString}** `);
  }
});

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function setUrlParameter(paramName, paramValue) {
  const url = new URL(window.location.href);
  url.searchParams.set(paramName, paramValue);
  history.pushState({}, "", url);
}

let noteid = getUrlParameter('noteid');
console.log(noteid);



async function initEditorModel() {
  editorModel.noteid= getUrlParameter('noteid') || Date.now();
  setUrlParameter('noteid', editorModel.noteid);
  console.log('initEditorModel',editorModel);
  getNote();

}


initEditorModel();


setInterval(async () => {
  // saveNote();
}, 3000)


async function getNote(){
  let res = await fetch(`https://apikey.suisuy.eu.org/get?key=${editorModel.noteid}`);
  res = await res.json();
  console.log('getNote:', res);
  if (res) {

    editorModel.value = res.value;
    editorModel.lastChangeTime=res.lastChangeTime || 0;
    tuieditor.setMarkdown(res.value)
  }
}

async function saveNote() {
  let form = new FormData();
  form.append('key', noteid);
  form.append('value', JSON.stringify({
    value: tuieditor.getMarkdown(),
    lastChangeTime: editorModel.lastChangeTime
  }))

  await fetch('https://apikey.suisuy.eu.org/set',
    {
      method: 'post',
      body: form
    }
  )
  console.log('note saved')

}


async function syncNote(){
  try {
    let res = await fetch(`https://apikey.suisuy.eu.org/get?key=${editorModel.noteid}`);
  res = await res.json();
  console.log('getNote in syncNote:', res);
  if (res) {
    if(res.lastChangeTime>editorModel.lastChangeTime){
    console.log(res.lastChangeTime,editorModel.lastChangeTime);
    editorModel.value = res.value;
    editorModel.lastChangeTime=res.lastChangeTime || 0;
    tuieditor.setMarkdown(res.value)

    }
    else{
      saveNote();
    }
  }
  
  } catch (error) {
    console.log('syncNote eroor:',error);
    saveNote();    
  }
  
}




















