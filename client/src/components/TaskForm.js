import React from 'react';
import { Layer, Header, Heading, Table, TableRow } from 'grommet'
import CheckmarkIcon from 'grommet/components/icons/base/Checkmark'
import CloseIcon from 'grommet/components/icons/base/Close'

class TaskForm extends React.PureComponent {
  state = {
    tasks: []
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.student) {
        this.setState({ tasks: this.props.student.tasks })
      } else {
        this.setState({ tasks: [] })
      }
    }
  }

  render() {
    const { hidden, student } = this.props
    const { tasks } = this.state;
    return (
      <div>
        <Layer
          closer={true}
          flush={false}
          align='center'
          overlayClose={true}
          onClose={this.props.handleClose}
          hidden={hidden}
        >
          <Header size="medium">
            <Heading tag="h2" margin="medium">Tasks</Heading>
          </Header>
          <Table style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Date</th>
                <th>Point</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.map((task, index) =>
                <TableRow key={index}>
                  <td>{task.task}</td>
                  <td>{`${task.month}/${task.year}`}</td>
                  <td>{task.point}</td>
                  <td className='secondary'>{task.completed ? <CheckmarkIcon /> : <CloseIcon />}</td>
                </TableRow>
              )}
            </tbody>
          </Table>
        </Layer>
      </div>
    );
  }
}

export default TaskForm;
