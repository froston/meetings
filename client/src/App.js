import React, { Component } from 'react';

class App extends Component {
  state = {
    students: []
  }
  componentDidMount() {
    fetch('/api/students')
      .then(res => res.json())
      .then(students => this.setState({ students }))
  }
  render() {
    return (
      <div>
        <h1>Students</h1>
        <ul>
          {this.state.students.map(student =>
            <li>{student.username}</li>
          )}
        </ul>
      </div>
    );
  }
}

export default App;
