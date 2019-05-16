import React from 'react'
import { translate } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Search } from 'grommet'
import { AddIcon, CatalogIcon, FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import Spinning from 'grommet/components/icons/Spinning'
import { TaskList } from './'
import { StudentForm, StudentFilters } from '../components'
import { api, consts } from '../utils'

class StudentList extends React.Component {
  state = {
    loading: false,
    students: [],
    studentForm: true,
    taskForm: true,
    student: {},
    searchTerm: '',
    noParticipate: false,
    gender: null
  }

  componentDidMount() {
    const { state } = this.props.history.location
    if (state) {
      this.setState({ ...state }, this.loadData)
    } else {
      this.loadData()
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    const { searchTerm, noParticipate, gender } = this.state
    let filter = '?'
    filter += searchTerm ? `name=${searchTerm}&` : ''
    filter += noParticipate ? `noParticipate=${noParticipate}&` : ''
    filter += gender ? `gender=${gender}&` : ''
    api.get(`/students${filter}`).then(students => {
      this.setState({ students: students || [], loading: false })
    })
  }

  handleSearch = e => {
    const searchTerm = e.target.value
    this.setState({ searchTerm }, this.loadData)
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
        this.setState({ studentForm: true }, this.loadData)
      })
    } else {
      api.post('/students', data).then(() => {
        this.setState({ studentForm: true }, this.loadData)
      })
    }
  }

  handleFilter = (name, val) => {
    // allow null option
    if (name === 'gender' && this.state.gender === val) {
      val = null
    }
    this.setState({ [name]: val }, this.loadData)
  }

  resetFilters = () => {
    this.setState({ gender: null, noParticipate: false }, this.loadData)
  }

  render() {
    const { t } = this.props
    const { searchTerm, loading, noParticipate, gender } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'medium' }}>
          <Button icon={<AddIcon />} label={t('add')} onClick={this.handleAdd} href="#" />
        </Box>
        <Box direction="row" justify="between" align="stretch" pad={{ vertical: 'medium' }} responsive={false}>
          <Search
            fill
            inline
            responsive={false}
            iconAlign="start"
            value={searchTerm}
            onDOMChange={this.handleSearch}
            placeHolder={t('search')}
          />
          <StudentFilters
            searchTerm={searchTerm}
            noParticipate={noParticipate}
            gender={gender}
            handleFilter={this.handleFilter}
            resetFilters={this.resetFilters}
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
              <Box direction="row" responsive={false}>
                <Button
                  icon={<CatalogIcon size="medium" />}
                  onClick={e => this.handleTasks(e, student)}
                  a11yTitle={t('tasks')}
                  title={t('tasks')}
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, student.id)}
                  a11yTitle={t('remove')}
                  title={t('remove')}
                />
              </Box>
            </ListItem>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Spinning size="xlarge" />
            </div>
          )}
        </List>
        <StudentForm
          hidden={this.state.studentForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('studentForm', true)}
          handleTasks={e => this.handleTasks(e, this.state.student)}
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
