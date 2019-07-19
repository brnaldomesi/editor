import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client/dist/socket.io";

/* eslint-disable */


class App extends Component {
  constructor() {
    super();
    this.state = {
      response: [],
      endpoint: "http://localhost:3000",
      editorData: "",
      currentEditorFileName: ""
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

  componentDidMount() {
    // const { endpoint } = this.state;
    // const socket = socketIOClient("http://127.0.0.1:3000");
    const socket = socketIOClient('ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000')


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
        // this.setState({currentEditorFileName : message})
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
  handleChange = (event) => {
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
      top: "50px",
      bottom: "0px",
      left: "0px",
      right: "0px",
      width: "100%",
      backgroundColor: "#000000",
      color: 'white'
    }
    let value = "File data comes here";
    return (
      <div>
        <div style={flexStyle} className="flex-container">
          {this.showTabs()}

        </div>
        <textarea style={textAreaStyle} name="body"
          onChange={this.handleChange}
          value={this.state.editorData} />
      </div>
    )
  }
}

export default App;
