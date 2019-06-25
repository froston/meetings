import React from 'react'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Section, Box, Heading, List, ListItem, Button, Paragraph, Search } from 'grommet'
import Spinning from 'grommet/components/icons/Spinning'
import { FormTrashIcon, ScheduleIcon, DocumentExcelIcon, DocumentTextIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import { saveAs } from 'file-saver'
import moment from 'moment'
import { ScheduleForm, Undo } from '../components'
import { api } from '../utils'

class ScheduleList extends React.Component {
  state = {
    loading: false,
    schedules: [],
    toRemove: [],
    scheduleForm: true,
    year: String(moment().year())
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = (showLoading = true, cb) => {
    showLoading && this.setState({ loading: true })
    api.get(`/schedules?year=${this.state.year}`).then(schedules => {
      this.setState({
        schedules: schedules || [],
        loading: false
      })
      cb && cb()
    })
  }

  handleAdd = () => {
    this.handleForm()
  }

  handleSelect = (e, id) => {
    e.preventDefault()
    this.props.history.push(`/schedules/${id}`)
  }

  handleUndo = id => {
    const { toRemove } = this.state
    this.setState({ toRemove: toRemove.filter(s => s !== id) })
  }

  cleanSchedules = () => {
    const { toRemove } = this.state
    let requests = toRemove.map(
      id =>
        new Promise(resolve => {
          api.remove('/schedules', id).then(resolve)
        })
    )
    Promise.all(requests).then(() => {
      this.loadData(false, () => {
        this.setState({ toRemove: [] })
      })
    })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { t } = this.props
    if (window.confirm(t('confirmRemove'))) {
      this.setState({ toRemove: [...this.state.toRemove, id] })
      toast(<Undo data={id} text={t('scheduleRemoved')} undo={this.handleUndo} />, {
        onClose: this.cleanSchedules
      })
    }
  }

  downloadXls = (e, schedule) => {
    e.preventDefault()
    e.stopPropagation()
    const lang = this.props.i18n.language
    const { t } = this.props
    toast(t('xlsMessage'))
    api.downloadFile(`/schedules/${schedule.id}/downloadXls?lang=${lang}`).then(blob => {
      const monthName = moment(schedule.month, 'MM')
        .locale(lang)
        .format('MMMM')
      const fileName = `${t('schedules:name')}_${monthName}_${schedule.year}`
      saveAs(blob, `${fileName}.xlsx`)
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
      const { t } = this.props
      const lang = this.props.i18n.language
      toast(t('pdfMessage'))
      api
        .downloadFile(`/schedules/${schedule.id}/downloadPdfs?beginsWith=${beginsWith}&lang=${lang}`)
        .then(blob => {
          const monthName = moment(schedule.month, 'MM')
            .locale(lang)
            .format('MMMM')
          const fileName = `${t('common:tasks')}_${monthName}_${schedule.year}`
          saveAs(blob, `${fileName}.zip`)
        })
        .catch(alert)
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
      toast(this.props.t('newMessage'))
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
    const { schedules, toRemove, scheduleForm, loading, year } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'medium' }} direction="row" justify="between" align="center" wrap>
          <Button
            icon={<ScheduleIcon />}
            label={t('generate')}
            onClick={this.handleAdd}
            href="#"
            style={{ width: '100%' }}
          />
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
          {schedules
            .filter(s => !toRemove.includes(s.id))
            .map((schedule, index) => (
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
                    icon={<DocumentTextIcon size="medium" />}
                    onClick={e => this.downloadPdfs(e, schedule)}
                    a11yTitle={t('reportPdf')}
                    title={t('reportPdf')}
                  />
                  <Button
                    icon={<DocumentExcelIcon size="medium" />}
                    onClick={e => this.downloadXls(e, schedule)}
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
