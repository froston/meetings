import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { translate, Trans } from 'react-i18next'
import { Section, Box, Heading, Paragraph, Distribution, Notification } from 'grommet'
import moment from 'moment'
import { api, consts } from '../utils'

class Dashboard extends Component {
  state = {
    brothers: 0,
    sisters: 0,
    scheduleExists: false
  }
  day = moment().date()
  month = moment().month() + 1
  year = moment().year()

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
    api.get(`/schedules`).then(schedules => {
      const scheduleExists = schedules.find(
        schedule => schedule.month === this.month + 1 && schedule.year === this.year
      )
      this.setState({ scheduleExists })
    })
  }

  getMessage = () => {
    const { t } = this.props
    const { scheduleExists } = this.state
    if (this.day > 1 && this.day < 15) {
      if (scheduleExists) {
        return (
          <Box pad={{ vertical: 'small' }} onClick={() => this.navigate('/schedules')}>
            <Notification
              message={t('messageOkTitle')}
              state={t('messageOkDesc', { month: moment(this.month + 1, 'MM').format('MMMM') })}
              size="medium"
              status="ok"
            />
          </Box>
        )
      } else {
        return (
          <Box pad={{ vertical: 'small' }} onClick={() => this.navigate('/schedules')}>
            <Notification
              message={t('messageWarnTitle', { left: 15 - this.day })}
              state={t('messageWarnDesc', {
                until: `15/${this.month}/${this.year}`,
                interpolation: { escapeValue: false }
              })}
              size="medium"
              status="warning"
            />
          </Box>
        )
      }
    }
    return null
  }

  navigate = to => {
    this.props.history.push(to)
  }

  render() {
    const { t } = this.props
    const { brothers, sisters } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">
          <Trans i18nKey="desc">
            <br />
          </Trans>
        </Paragraph>
        {this.getMessage()}
        <Box pad={{ vertical: 'small' }}>
          <Heading tag="h2" margin="small">
            {t('dist')}
          </Heading>
          <Distribution
            series={[
              {
                label: t('brothers'),
                value: brothers,
                colorIndex: 'graph-1',
                onClick: () => this.navigate('/students')
              },
              { label: t('sisters'), value: sisters, colorIndex: 'graph-2', onClick: () => this.navigate('/students') }
            ]}
          />
        </Box>
      </Section>
    )
  }
}

export default withRouter(translate('dashboard')(Dashboard))
