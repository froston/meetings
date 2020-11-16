import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Box, Header, Heading, Table, TableRow, Button } from 'grommet'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import moment from 'moment'
import { api } from '../utils'
import { TaskForm, Loader } from '../components'

class TaskList extends React.PureComponent {
  state = {
    allTasks: [],
    tasks: [],
    helpers: [],
    loading: false,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get(`/tasks/${this.props.student.id}`).then((tasks) => {
      const latestTasks = tasks.filter((t) => t.year >= moment().year())
      this.setState({ allTasks: tasks, tasks: latestTasks, loading: false })
    })
    api.get(`/students`).then((helpers) => {
      this.setState({ helpers: helpers || [] })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = (newTask) => {
    api.post(`/tasks`, newTask).then(() => {
      this.loadData()
    })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    if (window.confirm(this.props.t('confirmRemove'))) {
      api.remove(`/tasks`, id).then(() => {
        this.loadData()
      })
    }
  }

  seeAll = () => {
    this.setState({ tasks: this.state.allTasks })
  }

  render() {
    const { t, hidden, student, handleClose, showForm } = this.props
    const { tasks, loading, helpers } = this.state
    return (
      <div>
        <Loader loading={loading} />
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('title')} {student && student.name}
            </Heading>
          </Header>
          {showForm && <TaskForm student={student} handleSubmit={this.handleSubmit} helpers={helpers} />}
          <div style={{ overflowX: 'auto' }} className="tasks-list">
            <Table responsive={false} scrollable>
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>{t('common:task')}</th>
                  <th style={{ minWidth: 120 }}>{t('common:date')}</th>
                  <th>{t('common:hall')}</th>
                  <th style={{ minWidth: 120 }}>{t('common:helper')}</th>
                  {showForm && <th />}
                </tr>
              </thead>
              <tbody>
                {tasks &&
                  student &&
                  tasks.map((task, index) => {
                    const isHelper = task.helper_id === student.id
                    const taskName = task.rv ? t(`common:${task.rv}. ${task.task}`) : t(`common:${task.task}`)
                    return (
                      <TableRow key={index}>
                        <td>{isHelper ? t('common:helper') : <b>{taskName}</b>}</td>
                        <td>
                          <span style={{ color: '#a8a8a8' }}>({task.week})</span>
                          {` ${task.month}/${task.year}`}
                        </td>
                        <td>{t(`common:hall${task.hall}`)}</td>
                        <td>{isHelper ? null : task.helper_name}</td>
                        {showForm && (
                          <td>
                            <Box direction="row">
                              <Button
                                icon={<FormTrashIcon size="small" />}
                                onClick={(e) => this.handleRemove(e, task.id)}
                                a11yTitle={t('remove')}
                              />
                            </Box>
                          </td>
                        )}
                      </TableRow>
                    )
                  })}
              </tbody>
            </Table>
          </div>
          {tasks.length < this.state.allTasks.length && (
            <Box align="center" pad="medium" style={{ paddingTop: 0 }}>
              <a href="#all" onClick={this.seeAll}>
                Ver todo
              </a>
            </Box>
          )}
        </Layer>
      </div>
    )
  }
}

TaskList.propTypes = {
  hidden: PropTypes.bool,
  student: PropTypes.object,
  handleClose: PropTypes.func,
  showForm: PropTypes.bool,
}

TaskList.defaultProps = {
  showForm: true,
}

export default withTranslation(['tasks', 'common'])(TaskList)
