import React, { Component } from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';

import './ChatPanel.css';

class ChatPanel extends Component {
  state = {
    messages: [],
    loading: true
  };

  componentDidMount() {
    axios
    .get('http://localhost:7000/messages')
    .then(response => {
      this.setState({ messages: response.data, loading: false });
      const element = document.getElementById("id-chat-container")
      element.scrollTop = element.scrollHeight;
    })
    .catch(error => {
      console.log(error);
    });
    const socket = openSocket('http://localhost:7000');
    socket.on('messages', data => {
      if (data.action === 'new') {
        this.addMessage(data.newMessage);
      }
    });
  }

  addMessage = newMessage => {
    this.setState(prevState => {
      let messages = [...prevState.messages];
      messages = messages.map(el => ({ ...el }));
      messages.unshift(newMessage);
      return { messages };
    });
  };

  showSampleMessageHandler = () => {
    this.setState(prevState => {
      let messages = [...prevState.messages];
      messages = messages.map(el => ({ ...el }));
      const timeStamp = `${new Date().toDateString()} - ${new Date().toTimeString()}`;
      messages.unshift({
        client: 'Manuel',
        content: 'hi everyone! (local frontend message)',
        timeStamp
      });
      return { messages };
    });
  }

  storeSampleMessageHandler = () => {
    axios
    .post('http://localhost:7000/messages', {
      client: 'Manuel',
      content: 'hi everyone! (send to backend and retrieved for all clients with socket.io)'
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
  }

  render() {
    let messages = <div>loading...</div>;
    if (!this.state.loading) {
      messages = (
        <div className="chat-container" id="id-chat-container">
          {this.state.messages.map((message, index) => (
            <div className="message" key={index}>
              <div className="message-info">
                <div className="message-info__client">{message.client}</div>
                <div className="message-info__time-stamp">{message.timeStamp}</div>
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        {messages}
        <button className="button" onClick={this.showSampleMessageHandler}>Show Sample Message</button>
        <button className="button" onClick={this.storeSampleMessageHandler}>Store Sample Message</button>
      </div>
    );
  }
}

export default ChatPanel;
