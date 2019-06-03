import React from 'react'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Section, Box, Heading, List, ListItem, Button, Paragraph, Search } from 'grommet'
import Spinning from 'grommet/components/icons/Spinning'
import { FormTrashIcon, ScheduleIcon, DocumentExcelIcon, DocumentPdfIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { ScheduleForm } from '../components'
import { api } from '../utils'

class ScheduleList extends React.Component {
  state = {
    loading: false,
    schedules: [],
    scheduleForm: true,
    year: moment().year()
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get(`/schedules?year=${this.state.year}`).then(schedules => {
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

  downloadXls = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const lang = this.props.i18n.language
    api.downloadFile(`/schedules/${id}/downloadXls?lang=${lang}`).then(blob => {
      saveAs(blob, 'report.xlsx')
    })
  }

  downloadPdfs = (e, schedule) => {
    e.preventDefault()
    e.stopPropagation()
    const beginsWith = prompt(
      this.props.t('pdfReportPrompt', { date: `${moment(schedule.month, 'M').format('MMMM')} ${schedule.year}` }),
      1
    )
    if (beginsWith) {
      const lang = this.props.i18n.language
      api.downloadFile(`/schedules/${schedule.id}/downloadPdfs?beginsWith=${beginsWith}&lang=${lang}`).then(blob => {
        saveAs(blob, 'appointments.zip')
      })
    }
  }

  handleForm = () => {
    this.setState({ scheduleForm: !this.state.scheduleForm })
  }

  handleYearChange = e => {
    this.setState({ year: e.target.value })
  }

  handleFilter = e => {
    if (e.key === 'Enter' && this.state.year > 0) {
      this.loadData()
    }
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
    const { schedules, scheduleForm, loading, year } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'medium' }} direction="row" justify="between" align="center">
          <Box>
            <Button
              icon={<ScheduleIcon />}
              label={t('generate')}
              onClick={this.handleAdd}
              href="#"
              style={{ minWidth: 400 }}
            />
          </Box>
          <br />
          <Box direction="row" responsive={false}>
            <Search
              fill
              inline
              responsive={false}
              iconAlign="end"
              value={year}
              onDOMChange={this.handleYearChange}
              onKeyDown={this.handleFilter}
              placeHolder={t('common:year')}
            />
          </Box>
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
              <Box direction="row" responsive={false}>
                <Button
                  icon={<DocumentPdfIcon size="medium" />}
                  onClick={e => this.downloadPdfs(e, schedule)}
                  a11yTitle={t('reportPdf')}
                  title={t('reportPdf')}
                />
                <Button
                  icon={<DocumentExcelIcon size="medium" />}
                  onClick={e => this.downloadXls(e, schedule.id)}
                  a11yTitle={t('report')}
                  title={t('report')}
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, schedule.id)}
                  a11yTitle={t('remove')}
                  title={t('remove')}
                />
              </Box>
            </ListItem>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Spinning size="xlarge" />
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
