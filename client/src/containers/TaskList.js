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
    api.remove(`/tasks`, id).then(() => {
      this.loadData()
    })
  }

  render() {
    const { hidden } = this.props
    const { tasks } = this.state
    return (
      <div>
        <Layer
          closer={true}
          flush={false}
          align="center"
          overlayClose={true}
          onClose={this.props.handleClose}
          hidden={hidden}
        >
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              Tasks
            </Heading>
          </Header>
          <TaskForm
            student={this.props.student}
            handleSubmit={this.handleSubmit}
          />
          <Table style={{ minWidth: 750 }}>
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
                    <td>{task.task}</td>
                    <td>{`${task.month}/${task.year}`}</td>
                    <td>{task.hall}</td>
                    <td>{task.point}</td>
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
