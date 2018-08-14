import React from 'react'
import PropTypes from 'prop-types'
import { Form, FormField, Footer, Button, Select, NumberInput, DateTime } from 'grommet'
import moment from 'moment'
import { consts } from '../utils'

class TaskForm extends React.PureComponent {
  state = {
    task: '',
    hall: '',
    date: '',
    point: 1
  }

  getTaskDate = date => {
    const dateObj = moment(date)
    return {
      week: String(Math.ceil(dateObj.date() / 7)),
      month: dateObj.format('M'),
      year: dateObj.format('Y')
    }
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const id = this.props.student.id
    const newTask = {
      studentId: id,
      ...this.getTaskDate(this.state.date),
      task: this.state.task,
      hall: this.state.hall,
      point: this.state.point
    }
    this.props.handleSubmit(newTask)
  }

  render() {
    const { task, hall, point, date } = this.state
    return (
      <div>
        <Form pad="medium" onSubmit={this.handleSubmit}>
          <FormField label="Date">
            <DateTime
              format="M/D/YYYY"
              value={date}
              onChange={value => this.handleChange('date', value)}
            />
          </FormField>
          <FormField label="Talk">
            <Select
              options={consts.availableOptions}
              value={task}
              onChange={({ value }) => this.handleChange('task', value)}
            />
          </FormField>
          <FormField label="Halls">
            <Select
              placeHolder="Halls"
              options={[consts.HALLS_A, consts.HALLS_B]}
              value={hall}
              onChange={({ value }) => this.handleChange('hall', value)}
            />
          </FormField>
          <FormField label="Point">
            <NumberInput value={point} onChange={e => this.handleChange('point', e.target.value)} />
          </FormField>
          <Footer pad={{ vertical: 'medium' }}>
            <Button label="Add Task" type="submit" primary />
          </Footer>
        </Form>
      </div>
    )
  }
}

TaskForm.propTypes = {
  student: PropTypes.object,
  handleSubmit: PropTypes.func
}

export default TaskForm
