import React from 'react';
import { Section, Box, Heading, List, ListItem, Toast, Button } from 'grommet'
import AddIcon from 'grommet/components/icons/base/Add'
import CatalogIcon from 'grommet/components/icons/base/Catalog'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import { StudentForm, TaskForm } from '../components'
import { api } from '../utils';

class Students extends React.Component {
  state = {
    students: [],
    studentForm: true,
    taskForm: true,
    student: {},
    showToast: false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    api.get('/students').then(students =>
      this.setState({ students })
    )
  }

  handleSelect = (index) => {
    this.setState({ studentForm: false, student: this.state.students[index] })
  }

  handleAdd = () => {
    this.setState({ studentForm: false, student: null })
  }

  handleTasks = (e, student) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ taskForm: false, student })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    api.remove('/students', id)
      .then(() => {
        this.setState({ showToast: true })
        this.loadData()
      })
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleSubmit = (id, data) => {
    if (id) {
      api.patch('/students', id, data).then(() => {
        this.setState({ studentForm: true, showToast: true })
        this.loadData()
      })
    } else {
      api.post('/students', data).then(() => {
        this.setState({ studentForm: true, showToast: true })
        this.loadData()
      })
    }
  }

  render() {
    return (
      <Section>
        <Heading tag="h1" margin="medium">Students</Heading>
        <Box pad={{ vertical: 'small' }}>
          <p>Update, add or remove ministry school students here. You can see the history of tasks too.</p>
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <Button
            icon={<AddIcon />}
            label='Add New Student'
            onClick={this.handleAdd}
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
              <Box>
                <strong>{student.name}</strong>
              </Box>
              <Box direction="row">
                <Button
                  icon={<CatalogIcon size="medium" />}
                  onClick={e => this.handleTasks(e, student)}
                  a11yTitle='See Tasks'
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, student._id)}
                  a11yTitle='Remove Student'
                />
              </Box>
            </ListItem>
          )}
        </List>
        <StudentForm
          hidden={this.state.studentForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('studentForm', true)}
          student={this.state.student}
        />
        <TaskForm
          hidden={this.state.taskForm}
          student={this.state.student}
          handleClose={() => this.handleForm('taskForm', true)}
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
      </Section>
    );
  }
}

export default Students;
