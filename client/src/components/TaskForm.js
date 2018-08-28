import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Form, FormField, Footer, Button, Select, NumberInput, DateTime, CheckBox } from 'grommet'
import moment from 'moment'
import { consts } from '../utils'

const initState = {
  task: '',
  hall: '',
  date: '',
  point: 1,
  helper: false,
  errors: {}
}

class TaskForm extends React.PureComponent {
  state = initState

  validate = cb => {
    const { t } = this.props
    const { task, hall, date } = this.state
    let errors = {}
    !task ? (errors.task = t('common:required')) : undefined
    !hall ? (errors.hall = t('common:required')) : undefined
    !date ? (errors.date = t('common:required')) : undefined
    if (Object.keys(errors).length) {
      this.setState({
        errors: Object.assign({}, this.state.errors, errors)
      })
    } else {
      cb()
    }
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
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.validate(() => {
      const id = this.props.student.id
      const newTask = {
        student_id: id,
        ...this.getTaskDate(this.state.date),
        task: this.state.task,
        hall: this.state.hall,
        point: this.state.point,
        helper: this.state.helper,
        completed: true
      }
      this.props.handleSubmit(newTask)
      this.setState({ ...initState })
    })
  }

  render() {
    const { t } = this.props
    const { task, hall, point, helper, date, errors } = this.state
    return (
      <div>
        <Form pad="medium" onSubmit={this.handleSubmit}>
          <FormField label={t('common:date')} error={errors.date}>
            <DateTime format="M/D/YYYY" value={date} onChange={value => this.handleChange('date', value)} />
          </FormField>
          <FormField label={t('common:talk')} error={errors.task}>
            <Select
              options={consts.availableOptions}
              value={task}
              onChange={({ value }) => this.handleChange('task', value)}
            />
          </FormField>
          <FormField label={t('common:hall')} error={errors.hall}>
            <Select
              placeHolder={t('common:hall')}
              options={[consts.HALLS_A, consts.HALLS_B]}
              value={hall}
              onChange={({ value }) => this.handleChange('hall', value)}
            />
          </FormField>
          <FormField label={t('common:point')}>
            <NumberInput value={point} onChange={e => this.handleChange('point', e.target.value)} />
          </FormField>
          <FormField label={t('common:helper')}>
            <CheckBox checked={helper} onChange={e => this.handleChange('helper', !helper)} />
          </FormField>
          <Footer pad={{ vertical: 'medium' }}>
            <Button label={t('add')} type="submit" primary />
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

export default translate(['tasks', 'common'])(TaskForm)
