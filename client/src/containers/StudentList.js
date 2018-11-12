import React from 'react'
import { translate } from 'react-i18next'
import { Switch, Route, withRouter } from 'react-router-dom'
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

  handleSelect = id => {
    const { history, match } = this.props
    history.push(`${match.url}/${id}`)
  }

  handleAdd = () => {
    const { history } = this.props
    history.push(`/students/new`)
  }

  handleTasks = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { history, match } = this.props
    history.push(`${match.url}/${id}/tasks`)
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

  render() {
    const { t, match } = this.props
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
        <List selectable>
          {this.state.students.map((student, index) => (
            <ListItem
              key={student.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={() => this.handleSelect(student.id)}
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
                  onClick={e => this.handleTasks(e, student.id)}
                  a11yTitle={t('tasks')}
                  title={t('tasks')}
                />
                <Button
                  icon={<FormTrashIcon size="large" />}
                  onClick={e => this.handleRemove(e, student.id)}
                  a11yTitle={t('remove')}
                  title={t('remove')}
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
        <Switch>
          <Route
            exact
            path={`${match.url}/:id`}
            render={props => <StudentForm {...props} handleClose={this.loadData} />}
          />
          <Route exact path={`${match.url}/:id/tasks`} component={TaskList} />
        </Switch>
      </Section>
    )
  }
}

export default translate('students')(withRouter(StudentList))
