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
  hall: consts.HALLS_ALL
}

class ScheduleForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.setState({ ...initState })
    }
  }
  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = e => {
    e.preventDefault()
    // convert return visits
    const tasks = this.state.tasks.map(task =>
      task.map(taskName => (taskName.includes('Return Visit') ? taskName.substring(3) : taskName))
    )
    const values = { ...this.state, tasks, month: this.state.month.value }
    this.props.handleSubmit(values)
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
    const { month, year, weeks, hall } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              New Schedule
            </Heading>
          </Header>
          <Form pad="medium" onSubmit={this.handleSubmit} style={{ minWidth: 1200 }}>
            <FormField label="Month">
              <Select
                id="Month"
                label="Month"
                options={consts.monthsOptions}
                value={month}
                onChange={({ value }) => this.handleChange('month', value)}
              />
            </FormField>
            <FormField label="Year">
              <TextInput
                value={year}
                onDOMChange={e => this.handleChange('year', e.target.value)}
              />
            </FormField>
            <FormField label="Halls">
              <Select
                placeHolder="Halls"
                options={consts.hallsOptions}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label="Week Number">
              <NumberInput
                value={weeks}
                onChange={e => this.handleChange('weeks', e.target.value)}
              />
            </FormField>
            <Accordion active={0}>{this.renderWeeks()}</Accordion>
            <Footer pad={{ vertical: 'medium' }}>
              <Button label="Submit" type="submit" primary={true} />
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
