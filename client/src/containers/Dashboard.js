import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Section, Box, Heading, Paragraph, Distribution, Notification } from 'grommet'
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
    api.get(`/students`).then(res => {
      const students = res || []
      const brothers = students.filter(s => s.gender === consts.GENDER_BROTHER)
      const sisters = students.filter(s => s.gender === consts.GENDER_SISTER)
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

  navigate = () => {
    this.props.history.push('/students')
  }

  render() {
    const { brothers, sisters } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          Dashboard
        </Heading>
        <Paragraph margin="small">
          Welcome to ministry school dashboard.
          <br />
          Here you can manage the students and monthly schedules.
        </Paragraph>
        {this.getWarning()}
        <Box pad={{ vertical: 'small' }}>
          <Heading tag="h2" margin="small">
            Students Distribution
          </Heading>
          <Distribution
            series={[
              { label: 'Brothers', value: brothers, colorIndex: 'graph-1', onClick: this.navigate },
              { label: 'Sisters', value: sisters, colorIndex: 'graph-2', onClick: this.navigate }
            ]}
          />
        </Box>
      </Section>
    )
  }
}

export default withRouter(Dashboard)
