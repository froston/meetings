import React from 'react'
import { translate } from 'react-i18next'
import { Section, Tabs, Tab, Heading, Accordion, AccordionPanel, Notification } from 'grommet'
import { toast } from 'react-toastify'
import { WeekTab, Available } from '../components'
import { api, consts } from '../utils'

class Schedule extends React.Component {
  state = {
    schedule: {},
    availables: [],
    taskToChange: {},
    availableList: true,
    warnings: []
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
          availableList: false
        })
      })
  }

  handleSelectNew = student => {
    const { taskToChange } = this.state
    const task = {
      student_id: student.id,
      point: taskToChange.helper ? null : student.nextPoint
    }
    api.patch(`/tasks`, taskToChange.id, task).then(() => {
      toast.success(`${this.props.t('reassigned')} ${student.name}.`)
      this.setState({ availableList: true })
      this.loadData()
    })
  }

  handleChangePoint = (point, taskToChange) => {
    const task = { point: point || 0 }
    api.patch(`/tasks`, taskToChange.id, task).then(() => {
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
      if (tasks.filter(t => task.name === t.name).length > 1 && !names.includes(task.name)) {
        warnings.push(t('scheduleWarn', { name: task.name }))
        names.push(task.name)
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
                  handleChangePoint={this.handleChangePoint}
                />
              </AccordionPanel>
            )}
            {tasksB.length && (
              <AccordionPanel heading={`${t(`common:hall`)}  ${t(`common:hall${consts.HALLS_B}`)}`}>
                <WeekTab
                  tasks={tasksB}
                  handleChangeTask={this.handleChangeTask}
                  handleChangeHelper={this.handleChangeHelper}
                  handleChangePoint={this.handleChangePoint}
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
    const { schedule, availables, availableList, warnings } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('name')} - {schedule.month} / {schedule.year}
        </Heading>
        {warnings.length && (
          <Notification
            message="Schedule warnings"
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
        />
      </Section>
    )
  }
}

export default translate(['schedules', 'common'])(Schedule)
