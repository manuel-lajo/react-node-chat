import React, { Component } from 'react';

import './ChatPanel.css';
import axios from 'axios';

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
  }

  sampleMessageHandler = () => {
    this.setState(prevState => {
      let messages = [...prevState.messages];
      messages = messages.map(el => ({ ...el }));
      const timeStamp = `${new Date().toDateString()} - ${new Date().toTimeString()}`;
      messages.unshift({
        client: 'Manuel',
        content: 'hi everyone!',
        timeStamp
      });
      return { messages };
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
        <button className="button" onClick={this.sampleMessageHandler}>Add Sample Message</button>
      </div>
    );
  }
}

export default ChatPanel;
