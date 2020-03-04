import React, { Component } from 'react';

import './Login.css';

class Login extends Component {
  state = {
    userId: '',
    password: ''
  }

  inputUserIdHandler = event => {
    this.setState({ userId: event.target.value });
  }

  inputPasswordHandler = event => {
    this.setState({ password: event.target.value });
  }

  keyPressHandler = event => {
    if (event.key === 'Enter'){
      this.loginHandler();
    }
  }

  loginHandler = () => {
    this.props.onLogin(this.state.userId, this.state.password);
  }

  render() {
    return (
      <div className="login-container">
        <h3 className="login__title">Login to Your Account</h3>
        <div className="login__element">
          <span>User ID</span>
        </div>
        <div className="login__element">
          <input className="chat-input"
            type="text"
            placeholder="Enter User ID"
            value={this.state.userId}
            onChange={this.inputUserIdHandler} />
        </div>
        <div className="login__element">
          <span>Password</span>
        </div>
        <div className="login__element">
          <input className="chat-input"
            type="password"
            placeholder="Enter Password"
            value={this.state.password}
            onChange={this.inputPasswordHandler}
            onKeyPress={this.keyPressHandler} />
        </div>
        <div className="login__element">
          <button className="chat-button" onClick={this.loginHandler}>Login</button>
        </div>
        {this.props.error && (
          <div className="login__element">
            <span className="login__error">error display</span>
          </div>
        )}
      </div>
    )
  }
}

export default Login;
