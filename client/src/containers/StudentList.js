import React from 'react'
import { Section, Box, Heading, Paragraph, List, ListItem, Toast, Button, Search } from 'grommet'
import { AddIcon, CatalogIcon, FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import { TaskList } from './'
import { StudentForm } from '../components'
import { api, consts } from '../utils'

class StudentList extends React.Component {
  state = {
    students: [],
    studentForm: true,
    taskForm: true,
    student: {},
    showToast: false,
    searchTerm: ''
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = searchTerm => {
    const filter = searchTerm ? `?name=${searchTerm}` : ''
    api.get(`/students${filter}`).then(students => {
      this.setState({ students: students || [] })
    })
  }

  handleSearch = e => {
    const searchTerm = e.target.value
    this.setState({ searchTerm })
    this.loadData(searchTerm)
  }

  handleSelect = index => {
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
    if (window.confirm('Sure to remove the student?')) {
      api.remove('/students', id).then(() => {
        this.setState({ showToast: true })
        this.loadData()
      })
    }
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
    const { searchTerm } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          Students
        </Heading>
        <Paragraph margin="small">
          Create, update or remove ministry school students here. <br />
          You can create, remove and see the history of tasks.
        </Paragraph>
        <Box pad={{ vertical: 'medium' }}>
          <Button icon={<AddIcon />} label="Add New Student" onClick={this.handleAdd} href="#" />
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <Search
            placeHolder="Search Student"
            inline={true}
            iconAlign="start"
            value={searchTerm}
            onDOMChange={this.handleSearch}
          />
        </Box>
        <List selectable onSelect={this.handleSelect}>
          {this.state.students.map((student, index) => (
            <ListItem
              key={student.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={this.handleSelect}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <div>
                  <StopFillIcon
                    size="xsmall"
                    colorIndex={student.gender === consts.GENDER_BROTHER ? 'graph-1' : 'graph-2'}
                  />
                  <strong> {student.name}</strong>
                </div>
              </Box>
              <Box direction="row">
                <Button
                  icon={<CatalogIcon size="medium" />}
                  onClick={e => this.handleTasks(e, student)}
                  a11yTitle="See Tasks"
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, student.id)}
                  a11yTitle="Remove Student"
                />
              </Box>
            </ListItem>
          ))}
        </List>
        <StudentForm
          hidden={this.state.studentForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('studentForm', true)}
          student={this.state.student}
        />
        <TaskList
          hidden={this.state.taskForm}
          student={this.state.student}
          handleClose={() => this.handleForm('taskForm', true)}
        />
        {this.state.showToast && (
          <Toast status="ok" onClose={() => this.setState({ showToast: false })}>
            Student information has been succesfully saved.
          </Toast>
        )}
      </Section>
    )
  }
}

export default StudentList
