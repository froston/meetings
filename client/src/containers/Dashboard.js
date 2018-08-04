import React, { Component } from 'react';
import { Section, Box, Distribution, Notification } from 'grommet'
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter';
import { api, consts } from '../utils';

class Dashboard extends Component {
  state = {
    brothers: 0,
    sisters: 0
  }

  componentDidMount() {
    this.loadData()
  }
  loadData = () => {
    api.get(`/students?gender=${consts.GENDER_MALE}`).then(brothers => {
      this.setState({ brothers: brothers.length })
    })
    api.get(`/students?gender=${consts.GENDER_FEMALE}`).then(sisters => {
      this.setState({ sisters: sisters.length })
    })
  }
  getWarning = () => {
    const date = new Date();
    const day = date.getDate()
    if (day > 1 && day < 15) {
      return (
        <Box pad={{ vertical: 'small' }}>
          <Notification
            message={`Schedule Time Warning - ${15 - day} days left`}
            state={`You have time to create next schedule until 15/${date.getMonth() + 1}/${date.getFullYear()}`}
            size='medium'
            status='warning'
          />
        </Box>
      )
    }
    return null
  }
  render() {
    const { brothers, sisters } = this.state
    return (
      <Section>
        <h1>Dashboard</h1>
        <Box pad={{ vertical: 'small' }}>
          <p>Welcome to ministry school dashboard. Here you can manage your students and monthly schedules.</p>
        </Box>
        {this.getWarning()}
        <Box pad={{ vertical: 'medium' }}>
          <h2>Distribution</h2>
          <Distribution
            series={[
              { "label": "Brothers", "value": brothers, "colorIndex": "graph-1" },
              { "label": "Sisters", "value": sisters, "colorIndex": "graph-2" }
            ]}
          />
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <h2>Analysis</h2>
          <AnnotatedMeter legend={true}
            type='circle'
            units='TB'
            size='medium'
            max={70}
            series={[{ "label": "First", "value": 20, "colorIndex": "graph-1" }, { "label": "Second", "value": 50, "colorIndex": "graph-2" }]}
          />
        </Box>
      </Section >
    );
  }
}

export default Dashboard;
