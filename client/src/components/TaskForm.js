import React from 'react';
import { Layer, Header, Heading, Table, TableRow } from 'grommet'
import { Form, FormField, Footer, Button, Select, NumberInput, DateTime } from 'grommet';
import CheckmarkIcon from 'grommet/components/icons/base/Checkmark'
import CloseIcon from 'grommet/components/icons/base/Close'
import moment from 'moment'
import { api, consts } from '../utils'

class TaskForm extends React.PureComponent {
  state = {
    tasks: [],
    task: "",
    hall: "",
    date: "",
    point: 1
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

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  getTaskDate = (date) => {
    const dateObj = moment(date)
    return {
      week: String(Math.ceil(dateObj.date() / 7)),
      month: dateObj.format('M'),
      year: dateObj.format('Y')
    }
  }


  handleSubmit = e => {
    e.preventDefault()
    const id = this.props.student._id
    const newTask = {
      ...this.getTaskDate(this.state.date),
      task: this.state.task,
      hall: this.state.hall,
      point: this.state.point,
    }
    this.props.handleNewTask(id, newTask)
    this.props.handleClose()
  }

  render() {
    const { hidden } = this.props
    const { tasks, task, hall, point, date } = this.state;
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
          <Form pad='medium' onSubmit={this.handleSubmit}>
            <FormField label="Date">
              <DateTime
                format='M/D/YYYY'
                value={date}
                onChange={value => this.handleChange('date', value)}
              />
            </FormField>
            <FormField label='Talk'>
              <Select
                options={consts.availableOptions}
                value={task}
                onChange={({ value }) => this.handleChange('task', value)}
              />
            </FormField>
            <FormField label='Halls'>
              <Select
                placeHolder='Halls'
                options={[consts.HALLS_A, consts.HALLS_B]}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)} />
            </FormField>
            <FormField label='Point'>
              <NumberInput
                value={point}
                onChange={e => this.handleChange('point', e.target.value)}
              />
            </FormField>
            <Footer pad={{ "vertical": "medium" }}>
              <Button
                label='Add Task'
                type='submit'
                primary={true}
              />
            </Footer>
          </Form>
          <Table style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Date</th>
                <th>Hall</th>
                <th>Point</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.map((task, index) =>
                <TableRow key={index}>
                  <td>{task.task}</td>
                  <td>{`${task.month}/${task.year}`}</td>
                  <td>{task.hall}</td>
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
