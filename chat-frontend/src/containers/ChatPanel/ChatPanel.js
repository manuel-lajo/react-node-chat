import React, { Component } from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';

import './ChatPanel.css';

class ChatPanel extends Component {
  state = {
    messages: [],
    message: '',
    loading: true
  };

  componentDidMount() {
    axios
    .get('http://localhost:7000/messages',
    {
      headers: { Authorization: 'Bearer ' + this.props.token }
    })
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
      if (messages.length > 50) {
        messages.pop();
      }
      return { messages };
    });
  };

  sendMessage = () => {
    axios
    .post('http://localhost:7000/messages', {
      userId: this.props.userId,
      content: this.state.message.trim()
    },
    {
      headers: { Authorization: 'Bearer ' + this.props.token }
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
  }

  inputMessageHandler = event => {
    this.setState({ message: event.target.value });
  }

  keyPressHandler = event => {
    if (event.key === 'Enter'){
      this.sendMessageHandler();
    }
  }

  sendMessageHandler = () => {
    if (this.state.message.trim() !== ''){
      this.sendMessage();
      this.setState({ message: '' });
    }
  }

  render() {
    let chatContainer = <div>loading...</div>;
    if (!this.state.loading) {
      chatContainer = (
        <div className="chat-container" id="id-chat-container">
          {this.state.messages.map((message, index) => (
            <div className="message" key={index}>
              <div className="message-info">
                <div className="message-info__user">{message.userId}</div>
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
        <div className="header-container">
          <div className="user-title">{this.props.userId}</div>
          <button className="chat-button" onClick={this.props.onLogout}>Logout</button>
        </div>
        {chatContainer}
        <input className="chat-input"
          type="text"
          placeholder="write message..."
          value={this.state.message}
          onChange={this.inputMessageHandler}
          onKeyPress={this.keyPressHandler} />
        <button className="chat-button" onClick={this.sendMessageHandler}>Send</button>
      </div>
    );
  }
}

export default ChatPanel;
