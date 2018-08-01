import React, { Component } from 'react';
import Button from 'grommet/components/Button';

class Students extends Component {
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
            <li key={student._id}>{student.username}</li>
          )}
        </ul>
        <Button
          label='Label'
          onClick={() => { }}
        />
      </div>
    );
  }
}

export default Students;
