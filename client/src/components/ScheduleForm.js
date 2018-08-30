import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import {
  Layer,
  Header,
  Heading,
  Form,
  FormField,
  Select,
  TextInput,
  NumberInput,
  Footer,
  Button,
  Accordion,
  AccordionPanel
} from 'grommet'
import Spinning from 'grommet/components/icons/Spinning'
import moment from 'moment'
import { consts } from '../utils'

const initState = {
  month: {
    value: moment()
      .add(1, 'M')
      .format('M'),
    label: moment()
      .add(1, 'M')
      .format('MMMM')
  },
  year: String(moment().year()),
  weeks: 1,
  tasks: [],
  hall: {},
  submitting: false,
  errors: {}
}

class ScheduleForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.setState({ ...initState })
    }
  }

  validate = cb => {
    const { t } = this.props
    const { weeks, month, year, hall } = this.state
    let errors = {}
    this.props.checkScheduleExists(month.value, year, exists => {
      if (exists) {
        errors.month = t('exists')
        errors.year = t('exists')
      }
      !weeks ? (errors.weeks = t('common:required')) : undefined
      !month.value ? (errors.month = t('common:required')) : undefined
      !year ? (errors.year = t('common:required')) : undefined
      !hall.value ? (errors.hall = t('common:required')) : undefined
      if (Object.keys(errors).length || exists) {
        this.setState({
          errors: Object.assign({}, this.state.errors, errors),
          submitting: false
        })
      } else {
        cb()
      }
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({ submitting: true })
    this.validate(() => {
      // convert return visits
      const tasks = this.state.tasks.map(task =>
        task.map(taskName => (taskName.value.includes('Return Visit') ? taskName.value.substring(3) : taskName.value))
      )
      const values = { ...this.state, tasks, month: this.state.month.value, hall: this.state.hall.value }
      this.props.handleSubmit(values, () => {
        this.setState({ ...initState })
      })
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  handleWeekChange = (weekNum, val) => {
    const tasks = Object.assign([], this.state.tasks)
    tasks[weekNum] = val
    this.setState({ tasks })
  }

  renderWeeks = () => {
    const weeks = []
    for (let weekNum = 1; weekNum <= this.state.weeks; weekNum++) {
      weeks.push(
        <AccordionPanel key={weekNum} heading={`${this.props.t('common:week')} ${weekNum}`}>
          <Select
            id="Tasks"
            label={this.props.t('common:tasks')}
            inline
            multiple
            options={consts.scheduleOptions.map(value => ({ value, label: this.props.t(`common:${value}`) }))}
            value={this.state.tasks[weekNum]}
            onChange={({ value }) => this.handleWeekChange(weekNum, value)}
          />
        </AccordionPanel>
      )
    }
    return weeks
  }
  render() {
    const { t, hidden, handleClose } = this.props
    const { month, year, weeks, hall, errors, submitting } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('new')}
            </Heading>
          </Header>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <FormField label={t('common:month')} error={errors.month}>
              <Select
                id="Month"
                label={t('common:month')}
                options={consts.monthsOptions.map(value => ({ value, label: t(`common:month${value}`) }))}
                value={month}
                onChange={({ value }) => this.handleChange('month', value)}
              />
            </FormField>
            <FormField label={t('common:year')} error={errors.year}>
              <TextInput value={year} onDOMChange={e => this.handleChange('year', e.target.value)} />
            </FormField>
            <FormField label={t('common:halls')} error={errors.hall}>
              <Select
                placeHolder={t('common:halls')}
                options={consts.hallsOptions.map(value => ({ value, label: t(`common:hall${value}`) }))}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label={t('common:weekNum')} error={errors.weeks}>
              <NumberInput value={weeks} onChange={e => this.handleChange('weeks', e.target.value)} />
            </FormField>
            <Accordion active={0}>{this.renderWeeks()}</Accordion>
            <Footer pad={{ vertical: 'medium' }}>
              {submitting ? <Spinning /> : <Button label={t('common:generate')} type="submit" primary />}
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

ScheduleForm.propTypes = {
  hidden: PropTypes.bool,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func
}

export default translate(['schedules', 'common'])(ScheduleForm)
