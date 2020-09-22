import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, Distribution, Notification } from 'grommet'
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter'
import moment from 'moment'
import { Loader } from '../components'
import { api, consts, functions, withAuth } from '../utils'
import { AppContext } from '../utils/context'

class Dashboard extends Component {
  static contextType = AppContext

  state = {
    brothers: 0,
    sisters: 0,
    noParticipate: 0,
    scheduleExists: false,
    numbers: [],
    territories: [],
    loading: false,
  }
  day = moment().date()
  month = moment().month() + 1
  year = moment().year()

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    this.setState({ loading: true })

    Promise.all([api.get(`/students`), api.get(`/schedules`), api.get(`/territories`), api.get(`/numbers`)])
      .then((res) => {
        const students = res[0] || []
        const schedules = res[1] || []
        const territories = res[2] || []
        const numbers = res[3] || []

        const brothers = students.filter((s) => s.gender === consts.GENDER_BROTHER && s.participate)
        const sisters = students.filter((s) => s.gender === consts.GENDER_SISTER && s.participate)
        const noParticipate = students.filter((s) => !s.participate)
        const scheduleExists = schedules.find(
          (schedule) => schedule.month === this.month + 1 && schedule.year === this.year
        )

        this.setState({
          brothers: brothers.length,
          sisters: sisters.length,
          noParticipate: noParticipate.length,
          scheduleExists,
          territories,
          numbers,
          loading: false,
        })
      })
      .catch(({ message, response }) => {
        if (response && response.data && response.data.message) {
          message = response.data.message
        }
        this.props.auth.logout().then(() => {
          this.props.history.push({
            pathname: '/',
            state: { message },
          })
        })
      })
  }

  getMessages = () => {
    const { t, meta } = this.props
    const { scheduleExists, territories } = this.state
    const { settings } = this.context
    const dismissed = sessionStorage.getItem(`dismissMessageSchedules`) === 'true'
    let messages = []
    if (functions.hasAccess(meta, 'lifeministry') && !dismissed) {
      if (this.day > 1 && this.day < 15) {
        if (scheduleExists) {
          messages.push(
            <Box key={1} pad={{ vertical: 'small' }} onClick={() => this.navigate('/schedules')}>
              <Notification
                message={t('messageOkTitle')}
                state={t('messageOkDesc', { month: moment(this.month + 1, 'MM').format('MMMM') })}
                size="medium"
                status="ok"
                onClose={(e) => this.handleCloseMessage(e, 'Schedules')}
                closer
              />
            </Box>
          )
        } else {
          messages.push(
            <Box key={1} pad={{ vertical: 'small' }} onClick={() => this.navigate('/schedules')}>
              <Notification
                message={t('messageWarnTitle', { left: 15 - this.day })}
                state={t('messageWarnDesc', {
                  until: `15/${this.month}/${this.year}`,
                  interpolation: { escapeValue: false },
                })}
                size="medium"
                status="warning"
                onClose={(e) => this.handleCloseMessage(e, 'Schedules')}
                closer
              />
            </Box>
          )
        }
      }
    }
    if (functions.hasAccess(meta, 'territories')) {
      const criticals = territories.filter((t) => functions.getTerritoryStatusColor(t, settings) === 'critical')
      const dismissed = sessionStorage.getItem(`dismissMessageTerritories`) === 'true'
      if (criticals.length && !dismissed) {
        messages.push(
          <Box key={2} pad={{ vertical: 'small' }} onClick={() => this.navigate('/territories')}>
            <Notification
              message={t('messageTerWarning')}
              state={t('messageTerDesc', {
                territories: criticals.map((c) => c.number).join(', '),
              })}
              size="medium"
              status="critical"
              onClose={(e) => this.handleCloseMessage(e, 'Territories')}
              closer
            />
          </Box>
        )
      }
    }

    return messages
  }

  navigate = (to, state) => {
    this.props.history.push(to, { ...state })
  }

  handleCloseMessage = (e, message) => {
    e.preventDefault()
    e.stopPropagation()
    sessionStorage.setItem(`dismissMessage${message}`, true)
    this.forceUpdate()
  }

  render() {
    const { t, auth, meta } = this.props
    const { brothers, sisters, noParticipate, numbers, territories, loading } = this.state
    const { settings } = this.context
    return (
      <Section>
        <Loader loading={loading} />
        <Heading tag="h1" margin="small">
          {t('title')}
          <b> {auth.user.displayName}!</b>
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        {this.getMessages()}
        {functions.hasAccess(meta, 'lifeministry') && (
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
        )}

        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {functions.hasAccess(meta, 'numbers') && (
            <Box margin={{ vertical: 'small' }}>
              <Heading tag="h2" margin="small">
                {t('numbers')}
              </Heading>
              <AnnotatedMeter
                size="medium"
                type="circle"
                max={numbers.length}
                series={['', ...consts.statusOptions].map((s) => ({
                  label: s ? t(`common:status${s}`) : '?',
                  value: numbers.filter((n) => (s ? n.status === s : !n.status)).length,
                  colorIndex: functions.getNumberStatusColor(s),
                }))}
                legend={true}
              />
            </Box>
          )}
          {functions.hasAccess(meta, 'territories') && (
            <Box margin={{ vertical: 'small' }}>
              <Heading tag="h2" margin="small">
                {t('territories')}
              </Heading>
              <AnnotatedMeter
                size="medium"
                type="circle"
                max={territories.length}
                series={['unknown', 'ok', 'warning', 'critical', 'graph-1'].map((c) => ({
                  label: t(`common:color${c}`, settings),
                  value: territories.filter((s) => functions.getTerritoryStatusColor(s, settings) === c).length,
                  colorIndex: c,
                }))}
                legend={true}
              />
            </Box>
          )}
        </div>
      </Section>
    )
  }
}

export default withRouter(withTranslation('dashboard')(withAuth(Dashboard)))
