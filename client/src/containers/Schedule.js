import React from 'react'
import { translate } from 'react-i18next'
import { Section, Tabs, Tab, Heading, Accordion, AccordionPanel, Notification } from 'grommet'
import { toast } from 'react-toastify'
import moment from 'moment'
import { WeekTab, Available, Undo } from '../components'
import { api, consts } from '../utils'

class Schedule extends React.Component {
  state = {
    schedule: {},
    availables: [],
    taskToChange: {},
    availableList: true,
    helpers: false,
    warnings: [],
    oldTask: {}
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const id = this.props.match.params.id
    api.get(`/schedules/${id}`).then(schedule => {
      this.setState({ schedule })
      this.getWarnings(schedule.tasks)
    })
  }

  handleChangeTask = (taskToChange, helper = false) => {
    const { student_id, task, hall, month, year } = taskToChange
    api
      .get(
        `/students/${student_id}/available?taskName=${task}&month=${month}&year=${year}&hall=${hall}&helper=${helper}`
      )
      .then(availables => {
        this.setState({
          availables,
          taskToChange,
          availableList: false,
          helpers: helper
        })
      })
  }

  handleUndo = () => {
    const { oldTask } = this.state
    const task = { helper_id: oldTask.helper_id, student_id: oldTask.student_id }
    api.patch(`/tasks`, oldTask.id, task).then(this.loadData)
  }

  handleSelectNew = student => {
    const { taskToChange, helpers } = this.state
    this.setState({ oldTask: taskToChange })
    const task = helpers ? { helper_id: student.id } : { student_id: student.id }
    api.patch(`/tasks`, taskToChange.id, task).then(() => {
      toast(<Undo text={`${this.props.t('reassigned')} ${student.name}.`} undo={this.handleUndo} />, {
        onClose: () => this.setState({ oldTask: {} })
      })
      this.setState({ availableList: true })
      this.loadData()
    })
  }

  handleCloseAvailable = () => {
    this.setState({ availableList: true })
  }

  getWarnings = tasks => {
    let warnings = [],
      names = []
    const { t } = this.props
    tasks.forEach(task => {
      if (tasks.filter(t => task.student_name === t.student_name).length > 1 && !names.includes(task.student_name)) {
        warnings.push(t('scheduleWarn', { name: task.student_name }))
        names.push(task.student_name)
      }
      if (task.dup && !names.includes(`${task.student_name}-${task.helper_name}`)) {
        warnings.push(t('scheduleDup', { student_name: task.student_name, helper_name: task.helper_name }))
        names.push(`${task.student_name}-${task.helper_name}`)
      }
    })
    this.setState({ warnings })
  }

  renderWeeks = () => {
    const { t } = this.props
    const { schedule } = this.state
    let weeks = []
    for (let week = 1; week <= schedule.weeks; week++) {
      const tasksA = schedule.tasks.filter(a => a.week === week && a.hall === consts.HALLS_A)
      const tasksB = schedule.tasks.filter(a => a.week === week && a.hall === consts.HALLS_B)
      weeks.push(
        <Tab key={week} title={`${t('common:week')} ${week}`}>
          <Accordion openMulti={true} active={[0, 1]}>
            {tasksA.length && (
              <AccordionPanel heading={`${t(`common:hall`)}  ${t(`common:hall${consts.HALLS_A}`)}`}>
                <WeekTab
                  tasks={tasksA}
                  handleChangeTask={this.handleChangeTask}
                  handleChangeHelper={this.handleChangeHelper}
                />
              </AccordionPanel>
            )}
            {tasksB.length && (
              <AccordionPanel heading={`${t(`common:hall`)}  ${t(`common:hall${consts.HALLS_B}`)}`}>
                <WeekTab
                  tasks={tasksB}
                  handleChangeTask={this.handleChangeTask}
                  handleChangeHelper={this.handleChangeHelper}
                />
              </AccordionPanel>
            )}
          </Accordion>
        </Tab>
      )
    }
    return weeks
  }

  render() {
    const { t } = this.props
    const { schedule, availables, helpers, availableList, warnings } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('name')}
          {schedule.month && schedule.year && ` - ${moment(schedule.month, 'MM').format('MMMM')} ${schedule.year}`}
        </Heading>
        {warnings.length > 0 && (
          <Notification
            message={t('warnings')}
            state={warnings.map((warn, i) => (
              <span key={i}>
                {warn}
                <br />
              </span>
            ))}
            size="medium"
            status="warning"
          />
        )}
        <Tabs justify="start">{this.renderWeeks()}</Tabs>
        <Available
          hidden={availableList}
          availables={availables}
          handleSelect={this.handleSelectNew}
          handleClose={this.handleCloseAvailable}
          helpers={helpers}
        />
      </Section>
    )
  }
}

export default translate(['schedules', 'common'])(Schedule)
