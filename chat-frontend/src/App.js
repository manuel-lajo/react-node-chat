import React, { Component } from 'react';
import axios from 'axios';

import './App.css';
import Login from './containers/Login/Login';
import ChatPanel from './containers/ChatPanel/ChatPanel';

class App extends Component {
  state = {
    isAuth: false,
    token: null,
    userId: null
  };

  componentDidMount() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return;
    }
    const userId = sessionStorage.getItem('userId');
    this.setState({ isAuth: true, token, userId });
  }

  loginHandler = (userId, password) => {
    axios
    .post('http://localhost:7000/auth/login', {
      userId,
      password
    })
    .then(response => {
      if (response.status === 422) {
        throw new Error('Validation failed.');
      }
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Could not authenticate you.');
      }
      return { token: response.data.token, userId: response.data.userId };
    })
    .then(loginData => {
      this.setState({
        isAuth: true,
        token: loginData.token,
        userId: loginData.userId
      });
      sessionStorage.setItem('token', loginData.token);
      sessionStorage.setItem('userId', loginData.userId);
    })
    .catch(error => {
      console.log(error);
      this.setState({
        isAuth: false
      });
    });
  }

  logoutHandler = () => {
    this.setState({ isAuth: false, token: null, userId: null });
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
  };

  render() {
    let page = <Login onLogin={this.loginHandler} />    
    if (this.state.isAuth) {
      page = <ChatPanel userId={this.state.userId} token={this.state.token} onLogout={this.logoutHandler} />;
    }

    return (
      <div className="app-main">
        {page}
      </div>
    );
  }
}

export default App;
