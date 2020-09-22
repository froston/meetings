import React from 'react'
import { withTranslation } from 'react-i18next'
import { Section, Tabs, Tab, Heading, Accordion, AccordionPanel, Notification } from 'grommet'
import { toast } from 'react-toastify'
import moment from 'moment'
import { WeekTab, Available, Undo, Loader } from '../components'
import { api, consts } from '../utils'

class Schedule extends React.Component {
  state = {
    online: navigator.onLine,
    schedule: {},
    availables: [],
    noParticipate: [],
    taskToChange: {},
    availableList: true,
    helpers: false,
    warnings: [],
    oldTask: {},
    loading: false,
  }

  componentDidMount() {
    this.loadData()
    window.addEventListener('online', this.handleConnection)
    window.addEventListener('offline', this.handleConnection)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleConnection)
    window.removeEventListener('offline', this.handleConnection)
  }

  handleConnection = (e) => {
    if (e.type === 'offline') {
      toast('You are offline.')
      this.setState({ online: false })
    }
    if (e.type === 'online') {
      toast('You are now back online.')
      this.setState({ online: true })
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    const id = this.props.match.params.id
    api.get(`/schedules/${id}`).then((schedule) => {
      this.setState({ schedule, loading: false })
      this.getWarnings(schedule.tasks)
    })
  }

  handleChangeTask = (taskToChange, helper = false) => {
    this.setState({ loading: true })
    const { student_id, task, hall, month, year } = taskToChange
    api
      .get(
        `/students/${student_id}/available?taskName=${task}&month=${month}&year=${year}&hall=${hall}&helper=${helper}`
      )
      .then((availables) => {
        this.setState({
          availables,
          taskToChange,
          availableList: false,
          helpers: helper,
        })
        api.get(`/students?noParticipate=true`).then((noParticipate) => {
          this.setState({ noParticipate, loading: false })
        })
      })
  }

  handleUndo = () => {
    const { oldTask } = this.state
    const task = { helper_id: oldTask.helper_id, student_id: oldTask.student_id }
    api.patch(`/tasks`, oldTask.id, task).then(this.loadData)
  }

  handleSelectNew = (student) => {
    const { taskToChange, helpers } = this.state
    this.setState({ oldTask: taskToChange, loading: true })
    const task = helpers ? { helper_id: student.id } : { student_id: student.id }
    api.patch(`/tasks`, taskToChange.id, task).then(() => {
      toast(<Undo text={`${this.props.t('reassigned')} ${student.name}.`} undo={this.handleUndo} />, {
        onClose: () => this.setState({ oldTask: {} }),
      })
      this.setState({ availableList: true, loading: false })
      this.loadData()
    })
  }

  handleCloseAvailable = () => {
    this.setState({ availableList: true })
  }

  getWarnings = (tasks) => {
    let warnings = [],
      names = []
    const { t } = this.props
    tasks.forEach((task) => {
      if (tasks.filter((t) => task.student_name === t.student_name).length > 1 && !names.includes(task.student_name)) {
        warnings.push(t('scheduleWarn', { name: task.student_name }))
        names.push(task.student_name)
      }
      if (task.dup && !names.includes(`${task.student_name}-${task.helper_name}`)) {
        warnings.push(t('scheduleDup', { student_name: task.student_name, helper_name: task.helper_name }))
        names.push(`${task.student_name}-${task.helper_name}`)
      }
      if (task.helper_gender && task.student_gender !== task.helper_gender) {
        if (task.task !== consts.AVAILABLE_INITIAL_CALL) {
          warnings.push(t('scheduleGender', { task: t(`common:${task.task}`) }))
        }
      }
    })
    this.setState({ warnings })
  }

  renderWeeks = () => {
    const { t } = this.props
    const { schedule, online } = this.state
    let weeks = []
    for (let week = 1; week <= schedule.weeks; week++) {
      const tasksA = schedule.tasks.filter((a) => a.week === week && a.hall === consts.HALLS_A)
      const tasksB = schedule.tasks.filter((a) => a.week === week && a.hall === consts.HALLS_B)
      weeks.push(
        <Tab key={week} title={`${t('common:week')} ${week}`}>
          <Accordion openMulti={true} active={[0, 1]}>
            {tasksA.length && (
              <AccordionPanel heading={`${t(`common:hall`)}  ${t(`common:hall${consts.HALLS_A}`)}`}>
                <WeekTab
                  online={online}
                  tasks={tasksA}
                  handleChangeTask={this.handleChangeTask}
                  handleChangeHelper={this.handleChangeHelper}
                />
              </AccordionPanel>
            )}
            {tasksB.length && (
              <AccordionPanel heading={`${t(`common:hall`)}  ${t(`common:hall${consts.HALLS_B}`)}`}>
                <WeekTab
                  online={online}
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
    const { schedule, availables, noParticipate, helpers, availableList, warnings, loading } = this.state
    return (
      <Section>
        <Loader loading={loading} />
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
          noParticipate={noParticipate}
          handleSelect={this.handleSelectNew}
          handleClose={this.handleCloseAvailable}
          helpers={helpers}
        />
      </Section>
    )
  }
}

export default withTranslation(['schedules', 'common'])(Schedule)
