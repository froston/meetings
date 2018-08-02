import React from 'react';
import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import { StudentForm } from '../components'
import Toast from 'grommet/components/Toast';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import { announce, announcePageLoaded } from 'grommet/utils/Announcer';

class Students extends React.Component {
  state = {
    students: [],
    hideForm: true,
    student: {},
    showToast: false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(students => this.setState({ students }))

    announcePageLoaded('Dashboard was loaded');
  }

  handleSelect = (index) => {
    this.setState({ hideForm: false, student: this.state.students[index] })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    fetch(`/api/students/${id}`, { method: 'DELETE', })
      .then(() => {
        this.setState({ showToast: true })
        this.loadData()
      })
  }

  handleForm = (hideForm) => {
    this.setState({ hideForm })
  }

  handleSubmit = (id, data) => {
    fetch(`/api/students/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify({ ...data })
    }).then(() => {
      this.setState({ hideForm: true, showToast: true })
      this.loadData()
    })
  }

  render() {
    return (
      <div>
        <h1>Students</h1>
        <Box pad={{ vertical: 'small' }}>
          <p>Update or add new ministry school student here.</p>
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <Button
            icon={<AddIcon />}
            label='Add New Student'
            onClick={this.addStudent}
            href='#'
          />
        </Box>
        <List selectable={true} onSelect={this.handleSelect}>
          {this.state.students.map((student, index) =>
            <ListItem
              key={student._id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={this.handleSelect}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box >
                <strong>{student.username}</strong>
              </Box>
              <Button
                icon={<FormTrashIcon size="medium" type="logo" />}
                onClick={e => this.handleRemove(e, student._id)}
                a11yTitle='Remove Student'
              />
            </ListItem>
          )}
        </List>
        <StudentForm
          hidden={this.state.hideForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm(true)}
          student={this.state.student}
        />
        {
          this.state.showToast &&
          <Toast
            status='ok'
            onClose={() => this.setState({ showToast: false })}
          >
            Student information has been succesfully saved.
          </Toast>
        }
      </div>
    );
  }
}

export default Students;
