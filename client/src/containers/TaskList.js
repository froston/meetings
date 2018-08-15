import React from 'react'
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
    if (window.confirm('Sure to remove the task?')) {
      api.remove(`/tasks`, id).then(() => {
        this.loadData()
      })
    }
  }

  render() {
    const { hidden, student, handleClose } = this.props
    const { tasks } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              Tasks: {student && student.name}
            </Heading>
          </Header>
          <TaskForm student={student} handleSubmit={this.handleSubmit} />
          <Table responsive={false} scrollable>
            <thead>
              <tr>
                <th>Task</th>
                <th>Date</th>
                <th>Hall</th>
                <th>Point</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tasks &&
                tasks.map((task, index) => (
                  <TableRow key={index}>
                    <td>{task.helper ? 'Helper' : <b>{task.task}</b>}</td>
                    <td>{`${task.month}/${task.year}`}</td>
                    <td>{task.hall}</td>
                    <td>{task.helper ? null : task.point}</td>
                    <td>
                      <Box direction="row">
                        <Button
                          icon={<FormTrashIcon size="medium" />}
                          onClick={e => this.handleRemove(e, task.id)}
                          a11yTitle="Remove Schedule"
                        />
                      </Box>
                    </td>
                  </TableRow>
                ))}
            </tbody>
          </Table>
        </Layer>
      </div>
    )
  }
}

export default TaskList
