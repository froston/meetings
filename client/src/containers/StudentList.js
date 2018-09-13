import React from 'react'
import { translate } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Search } from 'grommet'
import { AddIcon, CatalogIcon, FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import Spinning from 'grommet/components/icons/Spinning'
import { TaskList } from './'
import { StudentForm } from '../components'
import { api, consts } from '../utils'

class StudentList extends React.Component {
  state = {
    loading: false,
    students: [],
    studentForm: true,
    taskForm: true,
    student: {},
    searchTerm: ''
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = searchTerm => {
    this.setState({ loading: true })
    const filter = searchTerm ? `?name=${searchTerm}` : ''
    api.get(`/students${filter}`).then(students => {
      this.setState({ students: students || [], loading: false })
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
    if (window.confirm(this.props.t('confirmRemove'))) {
      api.remove('/students', id).then(() => {
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
        this.setState({ studentForm: true })
        this.loadData(this.state.searchTerm)
      })
    } else {
      api.post('/students', data).then(() => {
        this.setState({ studentForm: true })
        this.loadData(this.state.searchTerm)
      })
    }
  }

  render() {
    const { t } = this.props
    const { searchTerm, loading } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'medium' }}>
          <Button icon={<AddIcon />} label={t('add')} onClick={this.handleAdd} href="#" />
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <Search
            inline
            responsive={false}
            iconAlign="start"
            value={searchTerm}
            onDOMChange={this.handleSearch}
            placeHolder={t('search')}
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
                  a11yTitle={t('tasks')}
                />
                <Button
                  icon={<FormTrashIcon size="large" />}
                  onClick={e => this.handleRemove(e, student.id)}
                  a11yTitle={t('remove')}
                />
              </Box>
            </ListItem>
          ))}
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <Spinning />
            </div>
          )}
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
      </Section>
    )
  }
}

export default translate('students')(StudentList)
