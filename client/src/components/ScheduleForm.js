import React from 'react'
import PropTypes from 'prop-types'
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
  hall: consts.HALLS_ALL,
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
    const { weeks, month, year, hall } = this.state
    let errors = {}
    this.props.checkScheduleExists(month.value, year, exists => {
      !weeks ? (errors.weeks = 'Required') : undefined
      !month.value ? (errors.month = 'Required') : undefined
      !year ? (errors.year = 'Required') : undefined
      !hall ? (errors.hall = 'Required') : undefined
      if (exists) {
        errors.month = 'Schedule already exists'
        errors.year = 'Schedule already exists'
      }
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
        task.map(taskName => (taskName.includes('Return Visit') ? taskName.substring(3) : taskName))
      )
      const values = { ...this.state, tasks, month: this.state.month.value }
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
        <AccordionPanel key={weekNum} heading={`Week ${weekNum}`}>
          <Select
            id="Tasks"
            label="Tasks"
            inline
            multiple
            options={consts.scheduleOptions}
            value={this.state.tasks[weekNum]}
            onChange={({ value }) => this.handleWeekChange(weekNum, value)}
          />
        </AccordionPanel>
      )
    }
    return weeks
  }
  render() {
    const { hidden, handleClose } = this.props
    const { month, year, weeks, hall, errors, submitting } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              New Schedule
            </Heading>
          </Header>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <FormField label="Month" error={errors.month}>
              <Select
                id="Month"
                label="Month"
                options={consts.monthsOptions}
                value={month}
                onChange={({ value }) => this.handleChange('month', value)}
              />
            </FormField>
            <FormField label="Year" error={errors.year}>
              <TextInput
                value={year}
                onDOMChange={e => this.handleChange('year', e.target.value)}
              />
            </FormField>
            <FormField label="Halls" error={errors.hall}>
              <Select
                placeHolder="Halls"
                options={consts.hallsOptions}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label="Week Number" error={errors.weeks}>
              <NumberInput
                value={weeks}
                onChange={e => this.handleChange('weeks', e.target.value)}
              />
            </FormField>
            <Accordion active={0}>{this.renderWeeks()}</Accordion>
            <Footer pad={{ vertical: 'medium' }}>
              {submitting ? <Spinning /> : <Button label="Generate" type="submit" primary />}
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

export default ScheduleForm
