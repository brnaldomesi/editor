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
      endpoint: "http://localhost:3000",
      editorData: "",
      currentEditorFileName: "",
      allFiles: []
    };
    this.showTabs = this.showTabs.bind(this);

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

    // this.setState({currentEditorFileName : newFilePath})
    // this.getFileFromApi(file.filepath)
    //   .then(data=>this.setState({editorData: data.response}));

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
    // this.setState({ allFiles: myJson })
    this.extractFiles(myJson);
    // return myJson;
  }

  componentDidMount() {
        // document.querySelector('textarea').addEventListener('input', function () {
          document.getElementById('editor').addEventListener('input', function () {

            var coordinates = getCaretCoordinates(this, this.selectionEnd);
            console.log(coordinates)
            // console.log(coordinates.top);
            // console.log(coordinates.left);
          })
    // const { endpoint } = this.state;
    const socket = socketIOClient("http://127.0.0.1:3000");
    // const socket = socketIOClient('ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000')


    socket.on('connect', () => {
      console.log("Connected");
    })

    socket.on("OpenedFiles", (from, message) => {
      console.log(from, message);

      // Tells is file is already displaying in editor
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
          // let position = this.state.response.map(function(e) { return e.filepath; }).indexOf(filepath);
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
    this.setState({ allFiles: this.getFiles(files, onlyfiles)});
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
    let word = "";
    if (wordArray[wordArray.length - 1] == '@') {
      console.log("@ detected");
    }
    this.setState({ editorData: event.target.value });
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
      top: "200px",
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

    return (
      <div>
        <div style={flexStyle} className="flex-container">
          {this.showTabs()}
          {/* {this.extractFiles(this.state.allFiles)} */}
        </div>
        <div style={commitButtonContainer}>
          <ButtonToolbar>
            <Button variant="success" onClick={() => { console.log("Commit Button Clicked") }}>Commit</Button>
            <Button variant="info" onClick={() => { console.log("Save button clicked") }}>Save</Button>
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