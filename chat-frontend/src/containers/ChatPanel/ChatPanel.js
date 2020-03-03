import React, { Component } from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';

import './ChatPanel.css';

class ChatPanel extends Component {
  state = {
    messages: [],
    message: '',
    loading: true,
    isAuth: false,
    userId: null,
    token: null
  };

  componentDidMount() {
    axios
    .post('http://localhost:7000/auth/login', {
      userId: 'javier',
      password: 'jobsity123'
    })
    .then(response => {
      if (response.status === 422) {
        throw new Error('Validation failed.');
      }
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Could not authenticate you!');
      }
      return { token: response.data.token, userId: response.data.userId };
    })
    .then(loginData => {
      this.setState({
        isAuth: true,
        token: loginData.token,
        userId: loginData.userId
      });
      localStorage.setItem('token', loginData.token);
      localStorage.setItem('userId', loginData.userId);
    })
    .catch(error => {
      console.log(error);
      this.setState({
        isAuth: false
      });
    });

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

  sendMessage = () => {
    axios
    .post('http://localhost:7000/messages', {
      client: this.state.userId,
      content: this.state.message.trim()
    },
    {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
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
    if (event.key === 'Enter' && this.state.message.trim() !== ''){
      this.sendMessage();
      this.setState({ message: '' });
    }
  }

  clickButtonHandler = () => {
    if (this.state.message.trim() !== ''){
      this.sendMessage();
      this.setState({ message: '' });
    }
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
        <input className="chat-input"
          type="text"
          placeholder="write message..."
          value={this.state.message}
          onChange={this.inputMessageHandler}
          onKeyPress={this.keyPressHandler} />
        <button className="chat-button" onClick={this.clickButtonHandler}>Send</button>
      </div>
    );
  }
}

export default ChatPanel;
