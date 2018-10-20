import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Box, Tiles, Tile, Paragraph, Header, Heading, Menu, Anchor, TextInput, Button } from 'grommet'
import { UserSettingsIcon, SaveIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'
import { reading, initialCall, returnVisit, bibleStudy, talk } from '../images'
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
  getImage = task => {
    let image
    switch (task) {
      case consts.AVAILABLE_READING:
        image = reading
        break
      case consts.AVAILABLE_INITIAL_CALL:
        image = initialCall
        break
      case consts.AVAILABLE_RETURN_VISIT:
        image = returnVisit
        break
      case consts.AVAILABLE_BIBLE_STUDY:
        image = bibleStudy
        break
      case consts.AVAILABLE_TALK:
        image = talk
        break
      default:
        image = reading
    }
    return image
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
                      <a onClick={() => this.showTasks(mainTask)}>{mainTask.name}</a>
                    </span>
                    <br />
                    <span style={{ display: helperTask ? '' : 'none' }}>
                      <b>{t('common:helper')}: </b>
                      <a onClick={() => this.showTasks(helperTask)}>
                        {helperTask && helperTask.name}
                        <br />
                      </a>
                    </span>
                    <span>
                      <b>{t('common:point')}: </b>
                      {updatting[mainTask.id] ? (
                        <div>
                          <TextInput value={newPoint} onDOMChange={e => this.setState({ newPoint: e.target.value })} />
                          <Button icon={<SaveIcon />} onClick={this.handleChangePoint} />
                        </div>
                      ) : (
                        <a onClick={() => this.handleEdit(mainTask)}>{mainTask.point}</a>
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
                  <Anchor href="#" onClick={() => handleChangeTask(helperTask, true)}>
                    {t('changeHelper')}
                  </Anchor>
                </Menu>
                <TaskList
                  hidden={this.state.taskForm}
                  student={this.state.student}
                  handleClose={() => this.setState({ taskForm: true })}
                  showForm={false}
                />
              </Tile>
            )
          } else {
            return null
          }
        })}
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
