import React, { Component } from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';

import './ChatPanel.css';

class ChatPanel extends Component {
  state = {
    messages: [],
    inputText: '',
    loading: true,
    stockCommand: '/stock='
  };

  componentDidMount() {
    const chatRoom = +sessionStorage.getItem('defaultChatRoom');
    axios.get('http://localhost:7000/messages?chatRoom=' + chatRoom,
      {
        headers: { Authorization: 'Bearer ' + this.props.token }
      })
      .then(response => {
        this.setState({ messages: response.data, loading: false });
        const element = document.getElementById('id-chat-container');
        element.scrollTop = element.scrollHeight;

        const currentButton = document.getElementById('id-chat-button-' + chatRoom);
        currentButton.classList.add('chat-button--active');
      })
      .catch(error => {
        console.log(error);
      });

      const socket = openSocket('http://localhost:7000');
      socket.on('messages', data => {
        if (data.action === 'new' && data.newMessage.chatRoom === +sessionStorage.getItem('defaultChatRoom')) {
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

  sendMessage = (userId, content) => {
    const chatRoom = +sessionStorage.getItem('defaultChatRoom');
    axios.post('http://localhost:7000/messages', { userId, content, chatRoom },
      {
        headers: { Authorization: 'Bearer ' + this.props.token }
      })
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.log(error);
      });
  }

  processInputTextHandler = () => {
    const trimedText = this.state.inputText.trim();
    if (trimedText !== '') {
      // verify if inputText is a command
      const stockCommand = this.state.stockCommand;
      const commandIndex = trimedText.indexOf(stockCommand);
      if (commandIndex === 0) {
        const stockCode = trimedText.replace(stockCommand, '');
        this.requestStock(stockCode);
      } else {
        this.sendMessage(this.props.userId, trimedText);
      }

      this.setState({ inputText: '' });
    }
  }

  requestStock = stockCode => {
    axios.get(`http://localhost:8000/stock?stockCode=${stockCode}`)
      .then(response => {
        if (response.data.botResponse.indexOf('Error') !== -1) {
          console.log(`Bot Error: ${response.data.botResponse}`);
        } else {
          this.sendMessage('bot', response.data.botResponse);
        }
      })
      .catch(error => {
        console.log(`Bot Error: ${error}`);
      });
  }

  changeChatRoomHandler = (chatRoom, buttonId) => {
    sessionStorage.setItem('defaultChatRoom', chatRoom);
    axios.get('http://localhost:7000/messages?chatRoom=' + chatRoom,
      {
        headers: { Authorization: 'Bearer ' + this.props.token }
      })
      .then(response => {
        this.setState({ messages: response.data, loading: false, chatRoom });
        const element = document.getElementById('id-chat-container');
        element.scrollTop = element.scrollHeight;

        const button1 = document.getElementById('id-chat-button-1');
        const button2 = document.getElementById('id-chat-button-2');
        const button3 = document.getElementById('id-chat-button-3');
        const currentButton = document.getElementById(buttonId);
        button1.classList.remove('chat-button--active');
        button2.classList.remove('chat-button--active');
        button3.classList.remove('chat-button--active');
        currentButton.classList.add('chat-button--active');
      })
      .catch(error => {
        console.log(error);
      });
  }

  inputTextHandler = event => {
    this.setState({ inputText: event.target.value });
  }

  keyPressHandler = event => {
    if (event.key === 'Enter'){
      this.processInputTextHandler();
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
          <button id="id-chat-button-1"
            className="chat-button"
            onClick={() => this.changeChatRoomHandler(1, 'id-chat-button-1')}>
              Chatroom 1
          </button>
          <button id="id-chat-button-2"
            className="chat-button"
            onClick={() => this.changeChatRoomHandler(2, 'id-chat-button-2')}>
              Chatroom 2
          </button>
          <button id="id-chat-button-3"
            className="chat-button"
            onClick={() => this.changeChatRoomHandler(3, 'id-chat-button-3')}>
              Chatroom 3
          </button>
          <button className="chat-button chat-button--logout" onClick={this.props.onLogout}>Logout</button>
        </div>
        {chatContainer}
        <input className="chat-input"
          type="text"
          placeholder="write message..."
          value={this.state.inputText}
          onChange={this.inputTextHandler}
          onKeyPress={this.keyPressHandler} />
          <button className="chat-button" onClick={this.processInputTextHandler}>Send</button>
      </div>
    );
  }
}

export default ChatPanel;
