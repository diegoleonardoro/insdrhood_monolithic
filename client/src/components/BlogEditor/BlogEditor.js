import React, { useState, useRef, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import "./blogeditor.css";
import { useUserContext } from "../../contexts/UserContext"; 

let savedRange = null;

const BlogEditor = () => {

  const [title, setTitle] = useState('');
  const editorRef = useRef(null);
  const uploadButtonRef = useRef(null);
  const titleRef = useRef(null);


  const [content, setContent] = useState([]);
  const [text, setText] = useState('');
  const [uploads, setUploads] = useState([]);
  
  const { currentuser_ } = useUserContext();

  console.log("current userrr", currentuser_);


  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };

  const handleEditorInput = (e) => {

    const editor = editorRef.current;

    if (!editor) return;

    if (e.key === 'Enter') {
      // e.preventDefault(); // Prevent the default behavior of adding a new line

      // Access the last child of the editor to check if it's an image container
      const lastChild = editor.lastChild;

      if (lastChild && lastChild instanceof HTMLElement && lastChild.className.indexOf("imageContainer") > -1) {
        // If the lastChild is an image container, then proceed to add your customized div
        // Create a customized div element
        const customDiv = document.createElement('div');
        customDiv.contentEditable = true; // Make it editable if needed
        customDiv.className = 'customClass'; // Add any custom class for styling or identification
        customDiv.innerHTML = '<br>'; // Add a line break inside it, or any other content you wish

        // Append the customized div to the editor
        editor.appendChild(customDiv);

        // Optionally, set the cursor inside the newly added div
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(customDiv, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        customDiv.focus(); // Focus on the new div to continue typing in it
      }
    }

  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;


    // check if currentuser_ is defined and if so use the id of that user to save the images

    uploadFile(file).then((url) => {
      // restoreSelection();
      insertImageAtCaret(url);
    });
  };

  const insertImageAtCaret = (imgUrls) => {

    // Create an image element
    const editor = editorRef.current;
    if (!editor) return;

    // Create a div element to hold all images
    const divContainer = document.createElement('div');
    divContainer.style.display = 'block';
    divContainer.style.marginBottom = '1em';
    divContainer.style.display = 'flex';
  
    divContainer.className = "imageContainer"

    imgUrls.forEach((imgUrl) => {
      // Create an image element for each URL
      const img = document.createElement('img');
      img.src = imgUrl;
      img.style.maxWidth = '100px';
      img.alt = 'Uploaded image';
      img.style.display = 'block';
      img.style.marginBottom = '1em';
      img.style.marginLeft = '20px';

      // Append each image to the div container
      divContainer.appendChild(img);
    });

    editor.appendChild(divContainer);

    // Create a line break element
    // const lineBreak = document.createElement('br');
    // Append the line break after the div container
    // editor.appendChild(lineBreak);
    // setText(editor.innerHTML);

  };


  // Submit the data:
  const handleSubmit = () => {
    const editorRefInnerHtml = editorRef.current.innerHTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(editorRefInnerHtml, 'text/html');

    console.log("doccc", doc)

    // // Array to hold the organized content
    // let contentArray = [];

    // const handleNode = (node) => {
    //   // Check if the node is a text node and not just whitespace
    //   if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
    //     contentArray.push({ type: 'text', content: node.textContent.trim() });
    //   }
    //   // Check if the node is a div
    //   else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV') {
    //     // Check if it's an image container
    //     if (node.classList.contains('imageContainer')) {
    //       contentArray.push({ type: 'imageContainer', content: node.innerHTML.trim() });
    //     } else { // Other divs
    //       contentArray.push({ type: 'divText', content: node.innerHTML.trim() });
    //     }
    //   }
    // };

    // Array.from(doc.body.childNodes).forEach(handleNode);
    // setContent(contentArray);
    // setText('')

  };

  return (

    <div className="blog-editor-container" >

      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Blog Title"
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />

      <div
        ref={editorRef}
        contentEditable
        style={{ minHeight: '200px', border: '1px solid black', padding: '10px', whiteSpace: 'pre-line' }}
      />

      <div
        ref={uploadButtonRef}
        className="upload-button"
      >

        <label className='labelUploadImage'>
          Upload Image(s)
          <input type="file" onChange={handleFileUpload} multiple />
        </label>
      </div>

      <Button onClick={handleSubmit} style={{ marginTop: '10px', width: "100%", borderRadius: "0" }} variant="success">Submit Post</Button>

    </div>
  );

};

function uploadFile(file) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        'https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/Untitled%20design%20brooklyn%20roof.jpg',
        'https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/Untitled%20design%20brooklyn%20roof.jpg',
        'https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/Untitled%20design%20brooklyn%20roof.jpg',
        'https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/Untitled%20design%20brooklyn%20roof.jpg',

      ]);
    }, 1000);
  });
}

export default BlogEditor



// const updateUploadButtonPosition = () => {
//   const selection = document.getSelection();
//   // if (!selection.rangeCount) return; // Early return if there's no selection

//   const range = selection.getRangeAt(0);
//   const rect = range.getBoundingClientRect();
//   if (uploadButtonRef.current && editorRef.current) {
//     const editorRect = editorRef.current.getBoundingClientRect();
//     // Adjust the top position to move the button below the typed characters.
//     // You may need to adjust the '20' value depending on your font size and line height.
//     const additionalOffset = 20; // This value might need adjustment based on your styling.
//     uploadButtonRef.current.style.left = `${rect.left - editorRect.left}px`;
//     uploadButtonRef.current.style.top = `${rect.bottom - editorRect.top + window.scrollY + additionalOffset}px`; // Adjust this line
//   }
// };