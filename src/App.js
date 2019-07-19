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
      fileData: ""
    };
    this.showTabs = this.showTabs.bind(this);
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
      "padding" : "10px"
    }
    let divsArray = [];
    this.state.response.map(message => {
      divsArray.push(<div style={divStyle} onClick={() => { console.log(message); this.getFileFromApi(message).then(data=>this.setState({fileData: data.response}))}}>{message.split('/')[message.split('/').length - 1]}</div>);
    })
    return divsArray;
  }

  getFileFromApi = async (file) => {
    let postObject = { "file": file };
    const response = await fetch('http://ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000/getFile', {
      method: 'POST',
      //      mode: 'no-cors',
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
    const socket = socketIOClient("http://127.0.0.1:3000");


    socket.on('connect', () => {
      console.log("Connected");
    })

    socket.on("OpenedFiles", (from, message) => {
      console.log(from, message);
      // Element not in the array
      if (this.state.response.indexOf(message) < 0) {
        var joined = this.state.response.concat(message);
        this.setState({ response: joined });

        // this.setState({ response: message })
      }
      this.getFileFromApi(message).then(data => {
        console.log(data);
        // editor.setValue(data.response)
        this.setState({fileData: data.response});
      });


    });

  }
  handleChange = (event) => {
    this.setState({ fileData: event.target.value });
  }
  render() {
    console.log(this.state.response);
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
          value={this.state.fileData} />
      </div>
    )
  }
}

export default App;
