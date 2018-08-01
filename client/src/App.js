import React, { Component } from 'react';

class App extends Component {
  state = {
    users: []
  }
  componentDidMount() {
    fetch('/api/users')
    .then(res => res.json())
    .then(users => this.setState({users}))
  }
  render() {
    return (
      <div>
        <h1>Users</h1>
      <ul>
        {this.state.users.map(user => 
          <li>{user.username}</li>
        )}
      </ul>
      </div>
    );
  }
}

export default App;
