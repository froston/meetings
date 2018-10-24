import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Box, Tiles, Tile, Paragraph, Header, Heading, Menu, Anchor, TextInput, Button } from 'grommet'
import { UserSettingsIcon, SaveIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'
import { TaskList } from '../containers'

class WeekTab extends React.PureComponent {
  state = {
    updatting: {},
    task: {},
    newPoint: null,
    taskForm: true,
    student: {}
  }
  handleEdit = task => {
    this.setState({
      task: task,
      newPoint: String(task.point),
      updatting: Object.assign({}, this.state.updatting, { [task.id]: true })
    })
  }
  handleChangePoint = () => {
    const { newPoint, task } = this.state
    this.setState({ updatting: {}, task: {}, newPoint: null })
    if (newPoint > 0) {
      this.props.handleChangePoint(newPoint, task)
    }
  }
  showTasks = task => {
    const student = {
      id: task.student_id,
      name: task.name
    }
    this.setState({
      taskForm: false,
      student
    })
  }
  handleKeyDown = e => {
    if (e.keyCode === 27) {
      this.setState({ updatting: {}, task: {}, newPoint: null })
    }
    if (e.keyCode === 13) {
      this.handleChangePoint()
    }
  }

  renderPointWarning = (task, point) => {
    if (task === 'Reading' && point > 17) {
      return <span style={{ color: 'red' }}>{`${point} (lower then 17)`}</span>
    }
    if (task === 'Talk' && (point === 7 || point === 18 || point === 30)) {
      return <span style={{ color: 'red' }}>{`${point} (not 7, 18 or 30)`}</span>
    }
    if (task !== 'Reading' && task !== 'Talk' && (point === 7 || point > 51)) {
      return <span style={{ color: 'red' }}>{`${point} (not 7 or higher then 51)`}</span>
    }
    return point
  }

  render() {
    const { t, tasks, handleChangeTask } = this.props
    const { updatting, newPoint } = this.state
    let rvIndex = 0
    return (
      <Tiles fill flush selectable className="week-tab">
        {consts.scheduleOptions.map(taskFullName => {
          const taskName = taskFullName.includes('Return Visit') ? taskFullName.substring(3) : taskFullName
          let mainTask
          let helperTask
          if (taskName === consts.AVAILABLE_RETURN_VISIT) {
            mainTask = tasks.filter(t => t.task === taskName && !t.helper)[rvIndex]
            helperTask = tasks.filter(t => t.task === taskName && t.helper)[rvIndex]
            rvIndex++
          } else {
            mainTask = tasks.find(t => t.task === taskName && !t.helper)
            helperTask = tasks.find(t => t.task === taskName && t.helper)
          }
          if (mainTask) {
            const className = mainTask.task && mainTask.task.split(' ').join('')
            return (
              <Tile
                key={mainTask.id}
                separator="top"
                align="start"
                basis="1/4"
                style={{ position: 'relative' }}
                className={className}
              >
                <Header size="small" pad={{ horizontal: 'small' }}>
                  <Heading tag="h4" strong={true} margin="none">
                    {t(`common:${mainTask.task}`)}
                  </Heading>
                </Header>
                <Box pad="small">
                  <Paragraph margin="none">
                    <span>
                      <b>{t('common:name')}: </b>
                      <a href="#tasks" onClick={() => this.showTasks(mainTask)}>
                        {mainTask.name}
                      </a>
                    </span>
                    <br />
                    <span style={{ display: helperTask ? '' : 'none' }}>
                      <b>{t('common:helper')}: </b>
                      <a href="#helpers" onClick={() => this.showTasks(helperTask)}>
                        {helperTask && helperTask.name}
                        <br />
                      </a>
                    </span>
                    <span>
                      <b>{t('common:point')}: </b>

                      {updatting[mainTask.id] ? (
                        <div>
                          <TextInput
                            value={newPoint}
                            onDOMChange={e => this.setState({ newPoint: e.target.value })}
                            onKeyDown={this.handleKeyDown}
                          />
                          <Button icon={<SaveIcon />} onClick={this.handleChangePoint} />
                        </div>
                      ) : (
                        <a href="#point" onClick={() => this.handleEdit(mainTask)}>
                          {this.renderPointWarning(mainTask.task, mainTask.point)}
                        </a>
                      )}
                    </span>
                  </Paragraph>
                </Box>
                <Menu
                  responsive={true}
                  icon={<UserSettingsIcon />}
                  closeOnClick
                  direction="row"
                  size="small"
                  style={{ padding: '10px 10px 0', position: 'absolute', right: 0, top: 0 }}
                >
                  <Anchor href="#" onClick={() => handleChangeTask(mainTask)}>
                    {t('change')}
                  </Anchor>
                  {helperTask && (
                    <Anchor href="#" onClick={() => handleChangeTask(helperTask, true)}>
                      {t('changeHelper')}
                    </Anchor>
                  )}
                </Menu>
              </Tile>
            )
          } else {
            return null
          }
        })}
        <TaskList
          hidden={this.state.taskForm}
          student={this.state.student}
          handleClose={() => this.setState({ taskForm: true })}
          showForm={false}
        />
      </Tiles>
    )
  }
}

WeekTab.propTypes = {
  tasks: PropTypes.array,
  handleChangeTask: PropTypes.func,
  handleChangePoint: PropTypes.func
}

export default translate(['schedules', 'common'])(WeekTab)
