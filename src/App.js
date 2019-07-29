import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client/dist/socket.io";
import Button from 'react-bootstrap/Button';
import { ButtonToolbar } from 'react-bootstrap';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
var getCaretCoordinates = require('textarea-caret-position');
import { position, offset } from 'caret-pos';
import ContentEditable from 'react-contenteditable'



/* eslint-disable */
class App extends Component {
  constructor() {
    super();
    this.contentEditable = React.createRef();

    this.state = {
      response: [],
      // endpoint: "http://localhost:3000",
      // editorData: "<a href='https://www.w3schools.com'> Visit w3 schools </a>",
      editorData : "",
      currentEditorFileName: "",
      allFiles: [],
      dropDownActive: false,
      dropDownWord: "",
      backspace: false,
      startIndex: -1,
      endIndex: 0,
      dropDownContainer: {
        position: "absolute",
        zIndex: 1,
        top: '200px',
        display: 'none',
        maxHeight: "200px",
        maxWidth: "400px",
        // height: 'fit-content',
        // width : '400px',
        width: 'fit-content',
        color: "black",
        left: '0',
        backgroundColor: 'white',
        overflow: 'auto'
      }
    };
    this.showTabs = this.showTabs.bind(this);

  }

  postApiCall = async (endpoint, postObject) => {
    // return new Promise((resolve, reject) => {
    // let postObject = { "file": file };
    let url = "http://ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000" + endpoint;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(postObject), // string or object
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      }
    });
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson)
    return myJson;
    // resolve(myJson);
    // })
  }

  updateEditorData(newFilePath) {
    console.log(newFilePath);
    this.setState(prevState => ({
      response: prevState.response.map(
        el => el.filepath === this.state.currentEditorFileName ? { ...el, filedata: this.state.editorData } : el
      ),

      currentEditorFileName: newFilePath,
      editorData: (prevState.response.filter(el => {
        if (el.filepath === newFilePath) {
          return el;
        }
      }))[0].filedata
    }))
  }
  showTabs() {
    var divStyle = {
      "backgroundColor": "#f1f1f1",
      // width: "100px",
      width: "fit-content",
      margin: "10px",
      "textAlign": "center",
      // "lineHeight": "75px",
      "fontSize": "12px",
      "padding": "10px"
    }
    let divsArray = [];
    this.state.response.map(file => {
      divsArray.push(<div style={divStyle} onClick={() => this.updateEditorData(file.filepath)}>{file.filepath.split('/')[file.filepath.split('/').length - 1]}</div>);
    })
    return divsArray;
  }

  getFileFromApi = async (file) => {
    let postObject = { "file": file };
    const response = await fetch('http://ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000/getFile', {
      method: 'POST',
      body: JSON.stringify(postObject), // string or object
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      }
    });
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson)
    return myJson;
  }

  getAllFiles = async (file) => {
    const response = await fetch('http://ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000/loadfiles', {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': '*',
      }
    });
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson);
    this.extractFiles(myJson);
  }
  // escFunction = (event) => {
  //   // if(event.keycode === 27) {
  //   //   return true;
  //   // }
  //   if(event.key == "Backspace"){
  //     this.setState({backspace : true});
  //   }
  // }

  componentDidMount() {


    const socket = socketIOClient('ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000');

    socket.on('connect', () => {
      console.log("Connected");
    })

    socket.on("OpenedFiles", (from, message) => {
      console.log(from, message);

      // Tells if file is already displaying in editor
      if (this.state.response.map(function (e) { return e.filepath; }).indexOf(message) < 0) {
        let file = {
          "filepath": message
        }
        var joined = this.state.response.concat(file);
        this.setState({ response: joined });
        if (this.state.currentEditorFileName !== "") {
          this.setState(prevState => ({
            response: prevState.response.map(
              el => {
                console.log("In changing the first file block")
                return el.filepath === this.state.currentEditorFileName ? { ...el, filedata: this.state.editorData } : el
              }
            )
          }))
        }
        this.setState({ currentEditorFileName: message })
        this.getFileFromApi(message).then(data => {
          console.log(data);
          this.setState({ editorData: data.response });
          this.setState(prevState => ({
            response: prevState.response.map(
              el => el.filepath === message ? { ...el, filedata: data.response } : el
            )
          }))
        });
      }
    });
  }

  componentWillMount() {
    this.getAllFiles();
  }

  extractFiles = (files) => {
    console.log(files)
    var onlyfiles = [];
    this.setState({ allFiles: this.getFiles(files, onlyfiles) });
  }

  getFiles = (files, onlyfiles) => {
    files.forEach((file) => {
      if (file.data == undefined) {
        onlyfiles.push({
          value: file.value,
          id: file.id
        });
      } else {
        this.getFiles(file.data, onlyfiles);
      }
    });
    console.log(onlyfiles)
    return onlyfiles;
  }

  handleChange = (event) => {
    console.log(window.innerWidth)
    console.log(event.target)
    // console.log(event.target.selectionEnd);
    console.log(event)
    let value = event.target.value;
    // let currentIndex = event.target.selectionEnd;
    // console.log(currentIndex)
    // let wordArray = event.target.value.split("");
    // console.log(wordArray[wordArray.length - 1]);
    // let currentWord = wordArray[wordArray.length - 1];
    let word = "";
    // let startIndex = event.target.selectionEnd;

    // const input = document.querySelector('textarea');
    const input = document.getElementById('editor');
    const pos = position(input); // { left: 15, top: 30, height: 20, pos: 15 }
    console.log(pos);
    let currentIndex = pos.pos;
    let startIndex = currentIndex;

    // if not at right corner and bottom most
    if (window.innerWidth > pos.left - 20 + 500 && window.innerHeight > pos.top + 30 + 200) {
      this.setState({ dropDownContainer: { ...this.state.dropDownContainer, top: 120 + pos.top + 30, left: pos.left - 20 } })
    } else if (window.innerWidth > pos.left - 20 + 500 && window.innerHeight < pos.top + 30 + 200) { // if not at right side but at bottom 
      this.setState({ dropDownContainer: { ...this.state.dropDownContainer, top: window.innerHeight - 220, left: pos.left - 20 } })
    } else if (window.innerWidth < pos.left - 20 + 500 && window.innerHeight < pos.top + 30 + 200) { // if at both right and bottom 
      this.setState({ dropDownContainer: { ...this.state.dropDownContainer, top: window.innerHeight - 220, left: window.innerWidth - 420 } })
    } else { // if at right side and not at the bottom
      this.setState({ dropDownContainer: { ...this.state.dropDownContainer, top: 120 + pos.top + 30, left: window.innerWidth - 420 } })
    }

    let updatingState = new Promise((resolve, reject) => {
      this.setState({ editorData: event.target.value, endIndex: currentIndex });
      resolve({ value, currentIndex, startIndex });
    });

    updatingState.then(({ value, currentIndex, startIndex }) => {
      let updatingdiv = new Promise((resolve, reject) => {
        console.log(currentIndex);
        console.log(this.state.editorData)
        console.log(this.state.editorData.charAt(currentIndex - 1))
        if (this.state.editorData.charAt(currentIndex - 1) == '@') {
          console.log("@ detected");
          this.setState({ dropDownActive: true, startIndex: startIndex });
          document.getElementById('dropdown').style.display = "block";
          resolve({ value, currentIndex });

        } else if (this.state.editorData.charAt(currentIndex - 1) == " ") {
          this.setState({ dropDownWord: "", dropDownActive: false })
          document.getElementById('dropdown').style.display = "none";
          resolve({ value, currentIndex });
        }
        resolve({ value, currentIndex })
      })
      updatingdiv.then(({ value, currentIndex }) => {
        console.log("In last block")
        // if (this.state.dropDownActive) {
        // if (currentWord !== '@') {
        console.log(value.slice(this.state.startIndex, currentIndex))
        // this.setState({ dropDownWord: this.state.dropDownWord + wordArray[wordArray.length - 1] })
        // this.setState({ dropDownWord: (value.split(' ')[value.split(' ').length - 1].split('@')[1] || "").toLowerCase() })
        this.setState({ dropDownWord: value.slice(this.state.startIndex, currentIndex).toLowerCase() })
      })
    })

  }

  appendFileName = (filename) => {
    let first = this.state.editorData.slice(0, this.state.startIndex - 1);
    let middle = filename;
    let last = this.state.editorData.slice(this.state.endIndex);
    console.log(first + middle + last)
    this.setState({ editorData: first + middle + last, dropDownWord: "", dropDownActive: false });
    document.getElementById('dropdown').style.display = "none";
  }

  displayDropDown = () => {
    // let li Array
    if (this.state.dropDownActive) {
      return (
        this.state.allFiles.map(file => {
          if (file.value.toLowerCase().includes(this.state.dropDownWord)) {
            this.count++;
            return (<p onClick={() => { this.appendFileName(file.value) }}>{file.id} <hr /></p>);
          }
        })
      )
    } else {
      return null;
    }
  }

  onKeyDown = (e) => {
    if (e.keyCode == 8) {
      console.log('delete');
      this.setState({ backspace: true });
    }
    console.log(e.keyCode)
  }

  render() {
    console.log(this.state);
    var flexStyle = {
      display: "flex",
      "justifyContent": "flex-start",
      "backgroundColor": "DodgerBlue",
    };

    let textAreaStyle = {
      margin: "0px",
      position: "absolute",
      top: "120px",
      bottom: "0px",
      left: "0px",
      right: "0px",
      width: "100%",
      backgroundColor: "#000000",
      color: 'white'
    }
    let commitButtonContainer = {
      position: 'relative',
      color: 'white',
      float: 'right',
      marginRight: '40px'
      // zIndex: 1
    }

    return (
      <div>
        <div style={flexStyle} className="flex-container">
          {this.showTabs()}
          {/* {this.extractFiles(this.state.allFiles)} */}
        </div>
        <div id="dropdown" style={this.state.dropDownContainer}>
          {/* This is dummy div */}
          <ul>
            {(this.state.dropDownActive ? this.displayDropDown() : null)}
          </ul>
        </div>
        <div style={commitButtonContainer}>
          <ButtonToolbar>
            <Button variant="success" onClick={() => {
              this.postApiCall('/updateFile', { file: this.state.currentEditorFileName, data: this.state.editorData }).then(() => {
                this.postApiCall('/commitFile', { filepath: this.state.currentEditorFileName, commitMessage: "New commit message" })
              })
            }}>Commit</Button>
            <Button variant="info" onClick={() => { this.postApiCall('/updateFile', { file: this.state.currentEditorFileName, data: this.state.editorData }) }}>Save</Button>
          </ButtonToolbar>
        </div>
        {/* <textarea  style={textAreaStyle} name="body" id="editor"
          onKeyDown={this.onKeyDown}
          onChange={this.handleChange}
          value={this.state.editorData}
        /> */}
        <ContentEditable
          id='editor'
          style={textAreaStyle}
          innerRef={this.contentEditable}
          html={this.state.editorData} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          tagName='div' // Use a custom HTML tag (uses a div by default)
          onKeyDown={this.onKeyDown}
        />
      </div>
    )
  }
}

export default App;