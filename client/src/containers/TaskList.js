import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Layer, Box, Header, Heading, Table, TableRow, Button } from 'grommet'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import { api } from '../utils'
import { TaskForm } from '../components'

class TaskList extends React.PureComponent {
  state = {
    name: null,
    tasks: []
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { match } = this.props
    const { id } = match.params
    api.get(`/students/${id}`).then(student => {
      this.setState({ name: student.name })
    })
    api.get(`/tasks/${id}`).then(tasks => {
      this.setState({ tasks })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = newTask => {
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

  handleClose = () => {
    this.props.history.goBack()
  }

  render() {
    const { t, showForm, match } = this.props
    const { tasks, name } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={this.handleClose}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('title')} - {name}:
            </Heading>
          </Header>
          {showForm && <TaskForm studentId={match.params.id} handleSubmit={this.handleSubmit} />}
          <Table responsive={false} scrollable>
            <thead>
              <tr>
                <th>{t('common:task')}</th>
                <th>{t('common:date')}</th>
                <th>{t('common:hall')}</th>
                <th>{t('common:point')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tasks &&
                tasks.map((task, index) => (
                  <TableRow key={index}>
                    <td>{task.helper ? t('common:helper') : <b>{t(`common:${task.task}`)}</b>}</td>
                    <td>{`${task.month}/${task.year}`}</td>
                    <td>{t(`common:hall${task.hall}`)}</td>
                    <td>{task.helper ? null : task.point}</td>
                    {showForm && (
                      <td>
                        <Box direction="row">
                          <Button
                            icon={<FormTrashIcon size="medium" />}
                            onClick={e => this.handleRemove(e, task.id)}
                            a11yTitle={t('remove')}
                          />
                        </Box>
                      </td>
                    )}
                  </TableRow>
                ))}
            </tbody>
          </Table>
        </Layer>
      </div>
    )
  }
}

TaskList.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object
}

export default translate(['tasks', 'common'])(withRouter(TaskList))
