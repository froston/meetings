import React from 'react'
import PropTypes from 'prop-types'
import { Box, Card, Button, TextInput } from 'grommet'
import { EditIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'

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
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/1011208/univ/art/1011208_univ_pns_lg.jpg'
        break
      case consts.AVAILABLE_INITIAL_CALL:
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/502015167/univ/art/502015167_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_RETURN_VISIT:
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/502013362/univ/art/502013362_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_BIBLE_STUDY:
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/502012131/univ/art/502012131_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_TALK:
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/502012476/univ/art/502012476_univ_sqr_lg.jpg'
        break
      default:
        image =
          'https://assetsnffrgf-a.akamaihd.net/assets/m/1011208/univ/art/1011208_univ_pns_lg.jpg'
    }
    return image
  }
  render() {
    const { tasks, handleChangeTask, handleChangeHelper } = this.props
    const { updatting, newPoint } = this.state
    let rvIndex = 0
    return (
      <Box margin="small" direction="row" wrap>
        {consts.scheduleOptions.map(taskFullName => {
          const taskName = taskFullName.includes('Return Visit')
            ? taskFullName.substring(3)
            : taskFullName
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
                  link={
                    <Button
                      label="Change Task"
                      primary
                      onClick={() => handleChangeTask(mainTask)}
                    />
                  }
                  description={
                    <div style={{ margin: '10px 0' }}>
                      <span style={{ visibility: helperTask ? '' : 'hidden' }}>
                        <a onClick={() => handleChangeHelper(helperTask)}>
                          <b>Helper:</b> {helperTask && helperTask.name}
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
                            <Button icon={<EditIcon />} onClick={this.handleChangePoint} />
                          </div>
                        ) : (
                          <a onClick={() => this.handleEdit(mainTask)}>
                            <b>Point: </b> {mainTask.point}
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
  handleChangeHelper: PropTypes.func,
  handleChangePoint: PropTypes.func
}

export default WeekTab
