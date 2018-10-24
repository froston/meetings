import React from 'react'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Section, Box, Heading, List, ListItem, Button, Paragraph } from 'grommet'
import Spinning from 'grommet/components/icons/Spinning'
import { FormTrashIcon, ScheduleIcon, DocumentExcelIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import { saveAs } from 'file-saver/FileSaver'
import moment from 'moment'
import { ScheduleForm } from '../components'
import { api } from '../utils'

class ScheduleList extends React.Component {
  state = {
    loading: false,
    schedules: [],
    scheduleForm: true
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get('/schedules').then(schedules => {
      this.setState({
        schedules: schedules || [],
        loading: false
      })
    })
  }

  handleAdd = () => {
    this.handleForm()
  }

  handleSelect = (e, id) => {
    e.preventDefault()
    this.props.history.push(`/schedules/${id}`)
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(this.props.t('confirmRemove'))) {
      api.remove('/schedules', id).then(() => {
        this.loadData()
      })
    }
  }

  handleReport = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    api.downloadReport(`/schedules/${id}/generate`).then(blob => {
      saveAs(blob, 'report.xlsx')
    })
  }

  handleForm = () => {
    this.setState({ scheduleForm: !this.state.scheduleForm })
  }

  handleSubmit = (data, cb) => {
    api.post('/schedules', data).then(() => {
      this.setState({ scheduleForm: true })
      toast.success(this.props.t('newMessage'))
      this.loadData()
      cb()
    })
  }

  checkScheduleExists = (month, year, cb) => {
    api.get(`/schedules?month=${month}&year=${year}`).then(res => {
      cb(res.length > 0)
    })
  }

  render() {
    const { t } = this.props
    const { schedules, scheduleForm, loading } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'medium' }}>
          <Button icon={<ScheduleIcon />} label={t('generate')} onClick={this.handleAdd} href="#" />
        </Box>
        <List selectable>
          {schedules.map((schedule, index) => (
            <ListItem
              key={schedule.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={e => this.handleSelect(e, schedule.id)}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <strong>{`${moment(schedule.month, 'MM').format('MMMM')} ${schedule.year}`}</strong>
              </Box>
              <Box direction="row">
                <Button
                  icon={<DocumentExcelIcon size="medium" />}
                  onClick={e => this.handleReport(e, schedule.id)}
                  a11yTitle={t('report')}
                  title={t('report')}
                />
                <Button
                  icon={<FormTrashIcon size="large" />}
                  onClick={e => this.handleRemove(e, schedule.id)}
                  a11yTitle={t('remove')}
                  title={t('remove')}
                />
              </Box>
            </ListItem>
          ))}
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <Spinning />
            </div>
          )}
        </List>
        <ScheduleForm
          hidden={scheduleForm}
          checkScheduleExists={this.checkScheduleExists}
          handleSubmit={this.handleSubmit}
          handleClose={this.handleForm}
        />
      </Section>
    )
  }
}

export default withRouter(translate('schedules')(ScheduleList))
