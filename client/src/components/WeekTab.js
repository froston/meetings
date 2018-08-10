import React from 'react'
import { Box, Card, Button } from 'grommet'
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
    const { tasks, handleChangeTask } = this.props
    return (
      <Box margin="small" direction="row" wrap>
        {consts.availableOptions.map(taskName => {
          const mainTask = tasks.find(
            task => task.task === taskName && task.helper === false
          )
          const helperTask = tasks.find(
            task => task.task === taskName && task.helper === true
          )
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
                  <div>
                    <span>Helper: {helperTask.name}</span>
                    <span>Point: {mainTask.point}</span>
                  </div>
                }
              />
            </Box>
          )
        })}
      </Box>
    )
  }
}

export default WeekTab
