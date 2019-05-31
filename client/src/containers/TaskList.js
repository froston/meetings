import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Layer, Box, Header, Heading, Table, TableRow, Button } from 'grommet'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import { api } from '../utils'
import { TaskForm } from '../components'

class TaskList extends React.PureComponent {
  state = {
    tasks: []
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    api.get(`/tasks/${this.props.student.id}`).then(tasks => {
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

  render() {
    const { t, hidden, student, handleClose, showForm } = this.props
    const { tasks } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('title')} {student && student.name}
            </Heading>
          </Header>
          {showForm && <TaskForm student={student} handleSubmit={this.handleSubmit} />}
          <div style={{ overflowX: 'auto' }}>
            <Table responsive={false} scrollable>
              <thead>
                <tr>
                  <th>{t('common:task')}</th>
                  <th>{t('common:date')}</th>
                  <th>{t('common:hall')}</th>
                  <th>{t('common:helper')}</th>
                  {showForm && <th />}
                </tr>
              </thead>
              <tbody>
                {tasks &&
                  tasks.map((task, index) => {
                    const isHelper = task.helper_id === student.id
                    const taskName = task.rv ? t(`common:${task.rv}. ${task.task}`) : t(`common:${task.task}`)
                    return (
                      <TableRow key={index}>
                        <td>{isHelper ? t('common:helper') : <b>{taskName}</b>}</td>
                        <td>{`(${task.week}) ${task.month}/${task.year}`}</td>
                        <td>{t(`common:hall${task.hall}`)}</td>
                        <td>{isHelper ? null : task.helper_name}</td>
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
                    )
                  })}
              </tbody>
            </Table>
          </div>
        </Layer>
      </div>
    )
  }
}

TaskList.propTypes = {
  hidden: PropTypes.bool,
  student: PropTypes.object,
  handleClose: PropTypes.func,
  showForm: PropTypes.bool
}

TaskList.defaultProps = {
  showForm: true
}

export default translate(['tasks', 'common'])(TaskList)
