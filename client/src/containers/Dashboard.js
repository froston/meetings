import React, { Component } from 'react'
import { Section, Box, Heading, Distribution, Notification } from 'grommet'
import { api, consts } from '../utils'

class Dashboard extends Component {
  state = {
    brothers: 0,
    sisters: 0
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    api.get(`/students`).then(students => {
      const brothers = students.filter(
        student => student.gender === consts.GENDER_MALE
      )
      const sisters = students.filter(
        student => student.gender === consts.GENDER_FEMALE
      )
      this.setState({ brothers: brothers.length, sisters: sisters.length })
    })
  }

  getWarning = () => {
    const date = new Date()
    const day = date.getDate()
    if (day > 1 && day < 15) {
      return (
        <Box pad={{ vertical: 'small' }}>
          <Notification
            message={`Schedule Time Warning - ${15 - day} days left`}
            state={`You have time to create next schedule until 15/${date.getMonth() +
              1}/${date.getFullYear()}`}
            size="medium"
            status="warning"
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
        <Heading tag="h1" margin="small">
          Dashboard
        </Heading>
        <Box pad={{ vertical: 'small' }}>
          <p>
            Welcome to ministry school dashboard. Here you can manage your
            students and monthly schedules.
          </p>
        </Box>
        {this.getWarning()}
        <Box pad={{ vertical: 'small' }}>
          <h2>Distribution</h2>
          <Distribution
            series={[
              { label: 'Brothers', value: brothers, colorIndex: 'graph-1' },
              { label: 'Sisters', value: sisters, colorIndex: 'graph-2' }
            ]}
          />
        </Box>
      </Section>
    )
  }
}

export default Dashboard
