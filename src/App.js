import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client/dist/socket.io";
import Button from 'react-bootstrap/Button';
import { ButtonToolbar } from 'react-bootstrap';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
var getCaretCoordinates = require('textarea-caret-position');


/* eslint-disable */
class App extends Component {
  constructor() {
    super();
    this.state = {
      response: [],
      // endpoint: "http://localhost:3000",
      editorData: "",
      currentEditorFileName: "",
      allFiles: [],
      dropDownActive: false,
      dropDownWord: ""
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
      ),      // body: JSON.stringify(postObject), // string or object

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
    // let postObject = { "file": file };
    const response = await fetch('http://ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000/loadfiles', {
      method: 'GET',
      // body: JSON.stringify(postObject), // string or object
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

  componentDidMount() {
    // document.querySelector('textarea').addEventListener('input', function () {
    document.getElementById('editor').addEventListener('input', function () {

      var coordinates = getCaretCoordinates(this, this.selectionEnd);
      console.log(coordinates)
      // console.log(coordinates.top);
      // console.log(coordinates.left);
    })

    // const socket = socketIOClient("http://127.0.0.1:3000");
    const socket = socketIOClient('ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000')


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
    let wordArray = event.target.value.split("");
    console.log(wordArray[wordArray.length - 1]);
    let currentWord = wordArray[wordArray.length - 1];
    // let word = "";
    let updatingdiv = new Promise((resolve, reject) => {
      if (wordArray[wordArray.length - 1] == '@') {
        console.log("@ detected");
        this.setState({ dropDownActive: true })
        document.getElementById('dropdown').style.display = "block";
        resolve();
      }
      else if (wordArray[wordArray.length - 1] === " ") {
        this.setState({ dropDownWord: "", dropDownActive: false })
        document.getElementById('dropdown').style.display = "none";
        resolve();
      } else {
        resolve();
      }
    })
    updatingdiv.then(() => {
      if (this.state.dropDownActive && currentWord !== '@') {
        this.setState({ dropDownWord: this.state.dropDownWord + wordArray[wordArray.length - 1] })
      }
    })
    this.setState({ editorData: event.target.value });
  }

  displayDropDown = () => {
    // let liArray
    if (this.state.dropDownActive) {
      return (
        this.state.allFiles.map(file => {
          if (file.value.includes(this.state.dropDownWord)) {
            return (<li>{file.id}</li>);
          }
        })
      )
    } else {
      return null;
    }
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
      // position: "absolute",
      position: 'relative',
      right: '10px',
      // top: '70px',
      color: 'white',
      // zIndex: 1
    }

    let dropDownContainer = {
      position: "absolute",
      zIndex: 1,
      top: '200px',
      display: 'none',
      maxHeight: "200px",
      color: "white"
    }

    return (
      <div>
        <div style={flexStyle} className="flex-container">
          {this.showTabs()}
          {/* {this.extractFiles(this.state.allFiles)} */}
        </div>
        <div id="dropdown" style={dropDownContainer}>
          {/* This is dummy div */}
          <ul>
            {this.displayDropDown()}
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
        <textarea style={textAreaStyle} name="body" id="editor"
          onChange={this.handleChange}
          value={this.state.editorData} />
      </div>
    )
  }
}

export default App;












{/* <div className="controls">
            <button onClick={this.resetCaretPosition}>Reset caret position</button>
            <button onClick={this.printCurrentCaretPosition}>Print current caret position to the console</button>
        </div> */}
{/* <ReactTextareaAutocomplete
          className="my-textarea"
          loadingComponent={() => <span>Loading</span>}
          trigger = {{
            ":": {
              dataProvider: token => {
                return [
                  { name: "smile", char: "🙂" },
                  { name: "heart", char: "❤️" }
                ];
              },
              component: Item,
              output: (item, trigger) => item.char
            }
          }}          
          ref={(rta) => { this.rta = rta; } }
          onCaretPositionChange={this.onCaretPositionChange}
        /> */}