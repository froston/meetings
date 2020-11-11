import React from 'react'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Search } from 'grommet'
import { AddIcon, CatalogIcon, FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import Spinning from 'grommet/components/icons/Spinning'
import { toast } from 'react-toastify'
import { TaskList } from './'
import { StudentForm, StudentFilters, Undo, Loader } from '../components'
import { api, consts, functions } from '../utils'
import Empty from '../images/Empty'

class StudentList extends React.Component {
  state = {
    online: navigator.onLine,
    loading: false,
    students: [],
    toRemove: [],
    studentForm: true,
    taskForm: true,
    student: {},
    searchTerm: '',
    noParticipate: false,
    gender: null,
  }

  componentDidMount() {
    const { state } = this.props.history.location
    if (state) {
      this.setState({ ...state }, this.loadData)
    } else {
      this.loadData()
    }
    window.addEventListener('online', this.handleConnection)
    window.addEventListener('offline', this.handleConnection)

    this.debounceSearch = functions.debounce(this.loadData, 500)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleConnection)
    window.removeEventListener('offline', this.handleConnection)
  }

  handleConnection = (e) => {
    if (e.type === 'offline') {
      toast('You are offline.')
      this.setState({ online: false })
    }
    if (e.type === 'online') {
      toast('You are now back online.')
      this.setState({ online: true })
    }
  }

  loadData = (showLoading = true, cb) => {
    showLoading && this.setState({ loading: true })
    const { searchTerm, noParticipate, gender } = this.state
    let filter = '?'
    filter += searchTerm ? `name=${searchTerm}&` : ''
    filter += noParticipate ? `noParticipate=${noParticipate}&` : ''
    filter += gender ? `gender=${gender}&` : ''
    api.get(`/students${filter}`).then((students) => {
      this.setState({ students: students || [], loading: false })
      cb && cb()
    })
  }

  handleSearch = (e) => {
    const searchTerm = e.target.value
    this.setState({ searchTerm }, this.debounceSearch)
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
    this.setState({ taskForm: false, studentForm: true, student })
  }

  handleUndo = (id) => {
    const { toRemove } = this.state
    this.setState({ toRemove: toRemove.filter((s) => s !== id) })
  }

  cleanSchedules = () => {
    const { toRemove } = this.state
    let requests = toRemove.map(
      (id) =>
        new Promise((resolve) => {
          api.remove('/students', id).then(resolve)
        })
    )
    Promise.all(requests).then(() => {
      this.loadData(false, () => {
        this.setState({ toRemove: [] })
      })
    })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { t } = this.props
    if (window.confirm(t('confirmRemove'))) {
      this.setState({ toRemove: [...this.state.toRemove, id] })
      toast(<Undo data={id} text={t('studentRemoved')} undo={this.handleUndo} />, {
        onClose: this.cleanSchedules,
      })
    }
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleSubmit = (id, data) => {
    const { t } = this.props
    if (id) {
      api.patch('/students', id, data).then(() => {
        toast(t('studentUpdated', { name: data.name }))
        this.setState({ studentForm: true }, this.loadData)
      })
    } else {
      api.post('/students', data).then(() => {
        toast(t('studentCreated', { name: data.name }))
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
    const { online, students, toRemove, searchTerm, loading, noParticipate, gender } = this.state
    const studentsArr = students.filter((s) => !toRemove.includes(s.id))
    return (
      <Section>
        <Loader loading={loading} />
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'small' }}>
          <Button
            icon={<AddIcon />}
            label={t('add')}
            a11yTitle={t('add')}
            onClick={online ? this.handleAdd : undefined}
            href={online ? '#' : undefined}
            disabled={!online}
          />
        </Box>
        <Box direction="row" justify="between" align="stretch" pad={{ vertical: 'small' }} responsive={false}>
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

        <List selectable onSelect={!!studentsArr.length && this.handleSelect}>
          {studentsArr.map((student, index) => (
            <ListItem
              key={student.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={this.handleSelect}
              separator={index === 0 ? 'horizontal' : 'bottom'}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <Box>
                <div>
                  <StopFillIcon
                    size="xsmall"
                    colorIndex={student.gender === consts.GENDER_BROTHER ? 'graph-1' : 'graph-2'}
                  />
                  <strong> {student.name}</strong>
                  <Paragraph size="small" style={{ display: 'inline', marginLeft: 10 }}>
                    {student.notes && student.notes.substring(0, 150)}
                  </Paragraph>
                </div>
              </Box>
              <Box direction="row" responsive={false}>
                <Button
                  icon={<CatalogIcon size="medium" />}
                  onClick={(e) => this.handleTasks(e, student)}
                  a11yTitle={t('tasks')}
                  title={t('tasks')}
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={online ? (e) => this.handleRemove(e, student.id) : undefined}
                  a11yTitle={t('remove')}
                  title={t('remove')}
                  disabled={!online}
                />
              </Box>
            </ListItem>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Spinning size="xlarge" />
            </div>
          )}
          <Empty show={!studentsArr.length && !loading} text={t('common:emptyResult')} />
        </List>
        <StudentForm
          online={online}
          hidden={this.state.studentForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('studentForm', true)}
          handleTasks={(e) => this.handleTasks(e, this.state.student)}
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

export default withTranslation('students')(StudentList)
