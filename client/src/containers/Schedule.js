import React from 'react'
import { Section, Tabs, Tab, Heading, Accordion, AccordionPanel } from 'grommet'
import { WeekTab, Available } from '../components'
import { api, consts } from '../utils'

class Schedule extends React.Component {
  state = {
    schedule: {},
    availables: [],
    taskToChange: {},
    availableList: true
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const id = this.props.match.params.id
    api.get(`/schedules/${id}`).then(schedule => {
      this.setState({ schedule })
    })
  }

  handleChangeTask = taskToChange => {
    api
      .get(
        `/students/${taskToChange.student_id}/available?taskName=${taskToChange.task}&hall=${
          taskToChange.hall
        }`
      )
      .then(availables => {
        this.setState({ availables, taskToChange, availableList: false })
      })
  }

  handleChangeHelper = taskToChange => {
    api.get(`/students`).then(availables => {
      this.setState({ availables, taskToChange, availableList: false })
    })
  }

  handleSelectNew = student => {
    const { taskToChange } = this.state
    const task = {
      student_id: student.id,
      point: taskToChange.helper ? null : student.nextPoint
    }
    api.patch(`/tasks`, taskToChange.id, task).then(() => {
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

  renderWeeks = () => {
    const { schedule } = this.state
    let weeks = []
    for (let week = 1; week <= schedule.weeks; week++) {
      const tasksA = schedule.tasks.filter(a => a.week === week && a.hall === consts.HALLS_A)
      const tasksB = schedule.tasks.filter(a => a.week === week && a.hall === consts.HALLS_B)
      weeks.push(
        <Tab key={week} title={`Week ${week}`}>
          <Accordion openMulti={true} active={0}>
            {tasksA.length && (
              <AccordionPanel heading={`Hall ${consts.HALLS_A}`}>
                <WeekTab
                  tasks={tasksA}
                  handleChangeTask={this.handleChangeTask}
                  handleChangeHelper={this.handleChangeHelper}
                  handleChangePoint={this.handleChangePoint}
                />
              </AccordionPanel>
            )}
            {tasksB.length && (
              <AccordionPanel heading={`Hall ${consts.HALLS_B}`}>
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
    const { schedule, availables, availableList } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          Schedule - {schedule.month} / {schedule.year}
        </Heading>
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

export default Schedule
