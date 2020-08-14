import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation, Trans } from 'react-i18next'
import { Section, Box, Heading, Paragraph, Distribution, Notification, Columns } from 'grommet'
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter'
import moment from 'moment'
import { api, consts, functions } from '../utils'

class Dashboard extends Component {
  state = {
    brothers: 0,
    sisters: 0,
    noParticipate: 0,
    scheduleExists: false,
    numbers: [],
    territories: [],
  }
  day = moment().date()
  month = moment().month() + 1
  year = moment().year()

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    api.get(`/students`).then((res) => {
      const students = res || []
      const brothers = students.filter((s) => s.gender === consts.GENDER_BROTHER && s.participate)
      const sisters = students.filter((s) => s.gender === consts.GENDER_SISTER && s.participate)
      const noParticipate = students.filter((s) => !s.participate)
      this.setState({
        brothers: brothers.length,
        sisters: sisters.length,
        noParticipate: noParticipate.length,
      })
    })
    api.get(`/schedules`).then((schedules) => {
      const scheduleExists = schedules.find(
        (schedule) => schedule.month === this.month + 1 && schedule.year === this.year
      )
      this.setState({ scheduleExists })
    })
    api.get(`/numbers`).then((numbers) => {
      this.setState({ numbers })
    })
    api.get(`/territories`).then((territories) => {
      this.setState({ territories })
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
                interpolation: { escapeValue: false },
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

  navigate = (to, state) => {
    this.props.history.push(to, { ...state })
  }

  render() {
    const { t } = this.props
    const { brothers, sisters, noParticipate, numbers, territories } = this.state
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
                onClick: () => this.navigate('/students', { gender: 'B' }),
              },
              {
                label: t('sisters'),
                value: sisters,
                colorIndex: 'graph-2',
                onClick: () => this.navigate('/students', { gender: 'S' }),
              },
              {
                label: t('no-participate'),
                value: noParticipate,
                colorIndex: 'graph-4',
                onClick: () => this.navigate('/students', { noParticipate: true }),
              },
            ]}
          />
        </Box>
        <Columns masonry maxCount={2}>
          <Box margin={{ vertical: 'small' }}>
            <Heading tag="h2" margin="small">
              {t('numbers')}
            </Heading>
            <AnnotatedMeter
              size="medium"
              type="circle"
              max={70}
              series={['', ...consts.statusOptions].map((s) => ({
                label: s ? t(`common:status${s}`) : '?',
                value: numbers.filter((n) => (s ? n.status == s : !n.status)).length,
                colorIndex: functions.getNumberStatusColor(s),
              }))}
              legend={true}
            />
          </Box>
          <Box margin={{ vertical: 'small' }}>
            <Heading tag="h2" margin="small">
              {t('territories')}
            </Heading>
            <AnnotatedMeter
              size="medium"
              type="circle"
              max={70}
              series={['unknown', 'ok', 'warning', 'critical', 'graph-1'].map((c) => ({
                label: t(`common:color${c}`),
                value: territories.filter((s) => functions.getTerritoryStatusColor(s) === c).length,
                colorIndex: c,
              }))}
              legend={true}
            />
          </Box>
        </Columns>
      </Section>
    )
  }
}

export default withRouter(withTranslation('dashboard')(Dashboard))
