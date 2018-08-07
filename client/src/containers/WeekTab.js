import React from 'react';
import { Section, Tabs, Tab, Columns, Box, Heading, Card, Button } from 'grommet'
import { consts } from '../utils'
import { constants } from 'fs';

class WeekTab extends React.Component {
  getImage = (task) => {
    let image
    switch (task) {
      case consts.AVAILABLE_READING:
        image = "https://assetsnffrgf-a.akamaihd.net/assets/m/1011208/univ/art/1011208_univ_pns_lg.jpg"
        break
      case consts.AVAILABLE_INITIAL_CALL:
        image = 'https://assetsnffrgf-a.akamaihd.net/assets/m/502015167/univ/art/502015167_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_RETURN_VISIT:
        image = 'https://assetsnffrgf-a.akamaihd.net/assets/m/502013362/univ/art/502013362_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_BIBLE_STUDY:
        image = 'https://assetsnffrgf-a.akamaihd.net/assets/m/502012131/univ/art/502012131_univ_sqr_lg.jpg'
        break
      case consts.AVAILABLE_TALK:
        image = 'https://assetsnffrgf-a.akamaihd.net/assets/m/502012476/univ/art/502012476_univ_sqr_lg.jpg'
        break
    }
    return image
  }
  render() {
    const { tasks } = this.props
    return (
      <Box
        margin="medium"
        direction='row'
        wrap
      >
        {tasks && tasks.map((task, index) => {
          return (
            <Box key={index} margin="medium">
              <Card
                thumbnail={this.getImage(task.task)}
                label={task.task}
                heading={task.name}
                description={`Point - ${task.point}`}
              />
            </Box>
          )
        })}
      </Box>
    );
  }
}

export default WeekTab;
