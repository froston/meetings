import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Box, Card, Button, TextInput } from 'grommet'
import { SaveIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'
import { reading, initialCall, returnVisit, bibleStudy, talk } from '../images'

class WeekTab extends React.PureComponent {
  state = {
    updatting: {},
    task: {},
    newPoint: null
  }
  handleEdit = task => {
    this.setState({
      task: task,
      newPoint: task.point,
      updatting: Object.assign({}, this.state.updatting, { [task.id]: true })
    })
  }
  handleChangePoint = () => {
    const { newPoint, task } = this.state
    this.setState({ updatting: {}, task: {}, newPoint: null })
    this.props.handleChangePoint(newPoint, task)
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
      <Box margin="small" direction="row" wrap>
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
            return (
              <Box key={mainTask.id} margin="small">
                <Card
                  thumbnail={this.getImage(mainTask.task)}
                  label={mainTask.task}
                  heading={mainTask.name}
                  textSize="small"
                  link={<Button label={t('change')} primary onClick={() => handleChangeTask(mainTask)} />}
                  description={
                    <div style={{ margin: '10px 0' }}>
                      <span style={{ visibility: helperTask ? '' : 'hidden' }}>
                        <a onClick={() => handleChangeTask(helperTask, true)}>
                          <b>{t('common:helper')}: </b> {helperTask && helperTask.name}
                        </a>
                        <br />
                      </span>
                      <span>
                        {updatting[mainTask.id] ? (
                          <div>
                            <TextInput
                              value={newPoint}
                              onDOMChange={e => this.setState({ newPoint: e.target.value })}
                            />
                            <Button icon={<SaveIcon />} onClick={this.handleChangePoint} />
                          </div>
                        ) : (
                          <a onClick={() => this.handleEdit(mainTask)}>
                            <b>{t('common:point')}</b> {mainTask.point}
                          </a>
                        )}
                      </span>
                    </div>
                  }
                />
              </Box>
            )
          } else {
            return null
          }
        })}
      </Box>
    )
  }
}

WeekTab.propTypes = {
  tasks: PropTypes.array,
  handleChangeTask: PropTypes.func,
  handleChangePoint: PropTypes.func
}

export default translate(['schedules', 'common'])(WeekTab)
