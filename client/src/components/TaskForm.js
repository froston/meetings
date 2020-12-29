import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Form, FormField, Footer, Button, Select, DateTime, Paragraph } from 'grommet'
import moment from 'moment'
import { consts } from '../utils'

const initState = {
  task: '',
  hall: {},
  date: '',
  helper: '',
  errors: {},
  helpers: [],
}

class TaskForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.helpers.length !== this.props.helpers.length) {
      this.setState({ helpers: this.props.helpers })
    }
  }

  validate = (cb) => {
    const { t } = this.props
    const { task, hall, date, helper } = this.state
    const taskDate = moment(date, consts.DATE_FORMAT)
    const dateValid = taskDate.isValid()
    const dateIsMonday = taskDate.day() === 1
    let errors = {}
    if (!task.value) errors.task = t('common:required')
    if (!hall.value) errors.hall = t('common:required')
    if (!dateValid) errors.date = t('common:dateNotValid')
    if (!dateIsMonday) errors.date = t('common:dateNotMonday')
    if (!date) errors.date = t('common:required')
    if (this.hasHelper(task.value) && !helper) {
      errors.helper = t('common:required')
    }
    if (Object.keys(errors).length) {
      this.setState({
        errors: Object.assign({}, this.state.errors, errors),
      })
    } else {
      cb()
    }
  }

  getTaskDate = (date) => {
    const dateObj = moment(date, consts.DATE_FORMAT)
    return {
      week: String(Math.ceil(dateObj.date() / 7)),
      month: dateObj.format('M'),
      year: dateObj.format('Y'),
    }
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const student = this.props.student
      const newTask = {
        student_id: student.id,
        student_name: student.name,
        ...this.getTaskDate(this.state.date),
        task: this.state.task.value,
        hall: this.state.hall.value,
        helper_id: this.state.helper.value,
        helper_name: this.state.helper.label,
      }
      this.props.handleSubmit(newTask)
      this.setState({ ...initState, helpers: this.props.helpers })
    })
  }

  handleSearch = (e) => {
    const searchTerm = e.target.value
    const helpers = this.props.helpers.filter((s) => s && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    this.setState({ helpers })
  }

  hasHelper = (task) =>
    task === consts.AVAILABLE_INITIAL_CALL ||
    task === consts.AVAILABLE_RETURN_VISIT ||
    task === consts.AVAILABLE_RETURN_VISIT_1 ||
    task === consts.AVAILABLE_RETURN_VISIT_2 ||
    task === consts.AVAILABLE_RETURN_VISIT_3 ||
    task === consts.AVAILABLE_BIBLE_STUDY

  render() {
    const { t, student } = this.props
    const { task, hall, date, helper, errors, helpers } = this.state
    const helpersArr = student ? helpers.filter((h) => h.id !== student.id) : helpers
    const opts = student && student.gender === consts.GENDER_SISTER ? consts.sisScheduleOptions : consts.scheduleOptions
    return (
      <div>
        <Form pad="medium" onSubmit={this.handleSubmit}>
          <Paragraph margin="small">{t('taskDateInfo')}</Paragraph>
          <FormField label={t('common:date')} error={errors.date}>
            <DateTime format={consts.DATE_FORMAT} value={date} onChange={(value) => this.handleChange('date', value)} />
          </FormField>
          <FormField label={t('common:talk')} error={errors.task}>
            <Select
              placeHolder={t('common:talk')}
              options={opts.map((av) => ({ value: av, label: t(`common:${av}`) }))}
              value={task}
              onChange={({ value }) => this.handleChange('task', value)}
            />
          </FormField>
          <FormField label={t('common:hall')} error={errors.hall}>
            <Select
              placeHolder={t('common:hall')}
              options={[consts.HALLS_A, consts.HALLS_B, consts.HALLS_C].map((hl) => ({
                value: hl,
                label: t(`common:hall${hl}`),
              }))}
              value={hall}
              onChange={({ value }) => this.handleChange('hall', value)}
            />
          </FormField>
          {this.hasHelper(task.value) && (
            <FormField label={t('common:helper')} error={errors.helper}>
              <Select
                placeHolder={t('common:helper')}
                options={helpersArr.map((h) => ({ value: h.id, label: h.name }))}
                value={helper}
                onChange={({ value }) => this.handleChange('helper', value)}
                onSearch={this.handleSearch}
              />
            </FormField>
          )}
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
  handleSubmit: PropTypes.func,
  helpers: PropTypes.array,
}

export default withTranslation(['tasks', 'common'])(TaskForm)
