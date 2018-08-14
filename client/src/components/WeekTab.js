import React from 'react'
import { Box, Card, Button, TextInput } from 'grommet'
import { consts } from '../utils'

class WeekTab extends React.PureComponent {
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
    }
    return image
  }
  render() {
    const { tasks, handleChangeTask, handleChangeHelper, handleChangePoint } = this.props
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
                      {helperTask && (
                        <span>
                          <b>Helper:</b>{' '}
                          <a onClick={() => handleChangeHelper(helperTask)}>{helperTask.name}</a>
                          <br />
                        </span>
                      )}
                      <span>
                        <b>Point: </b>
                        <TextInput
                          value={mainTask.point}
                          onDOMChange={e => handleChangePoint(e.target.value, mainTask)}
                        />{' '}
                      </span>
                    </div>
                  }
                />
              </Box>
            )
          }
        })}
      </Box>
    )
  }
}

export default WeekTab
