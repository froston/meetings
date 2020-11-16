import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import {
  Header,
  Heading,
  Form,
  FormField,
  Select,
  TextInput,
  NumberInput,
  Footer,
  Button,
  Accordion,
  AccordionPanel,
  List,
  ListItem,
  CheckBox,
  Columns,
  Box,
  Anchor,
  Paragraph,
} from 'grommet'
import { toast } from 'react-toastify'
import { FormTrashIcon } from 'grommet/components/icons/base'
import moment from 'moment'
import { Loader } from '../components'
import { api, consts } from '../utils'

const availableHalls = [consts.HALLS_ALL, consts.HALLS_A]

class ScheduleForm extends React.PureComponent {
  getState = () => ({
    month: {
      value: Number(moment().add(1, 'M').format('M')),
      label: moment().add(1, 'M').format('MMMM'),
    },
    year: String(moment().year()),
    weeks: 1,
    tasks: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    hall: {
      value: consts.HALLS_ALL,
      label: this.props.t(`common:hall${consts.HALLS_ALL}`),
    },
    readingMain: false,
    submitting: false,
    errors: {},
  })

  state = this.getState()

  validate = (cb) => {
    const { t } = this.props
    const { weeks, month, year, hall } = this.state
    let errors = {}
    this.checkScheduleExists(month.value, year, (exists) => {
      if (exists) {
        errors.month = t('exists')
        errors.year = t('exists')
      }
      if (!weeks) errors.weeks = t('common:required')
      if (!month.value) errors.month = t('common:required')
      if (!year) errors.year = t('common:required')
      if (!hall.value) errors.hall = t('common:required')
      if (Object.keys(errors).length || exists) {
        this.setState({
          errors: Object.assign({}, this.state.errors, errors),
          submitting: false,
        })
      } else {
        cb()
      }
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ submitting: true })
    this.validate(() => {
      const values = {
        ...this.state,
        month: this.state.month.value,
        hall: this.state.hall.value,
      }

      api.post('/schedules', values).then(() => {
        toast(this.props.t('newMessage'))
        this.handleClose()
      })
    })
  }

  handleClose = () => {
    this.props.history.push('/schedules')
  }

  handleWeekChange = (weekNum, obj) => {
    const tasks = Object.assign({}, this.state.tasks)
    tasks[weekNum].push(obj.value)
    this.setState({ tasks })
  }

  handleRemoveTask = (e, weekNum, index) => {
    e.preventDefault()
    const tasks = Object.assign({}, this.state.tasks)
    tasks[weekNum].splice(index, 1)
    this.setState({ tasks })
  }

  checkScheduleExists = (month, year, cb) => {
    api.get(`/schedules?month=${month}&year=${year}`).then((res) => {
      cb(res.length > 0)
    })
  }

  renderWeeks = () => {
    const { tasks } = this.state
    const weeks = []
    for (let weekNum = 1; weekNum <= this.state.weeks; weekNum++) {
      weeks.push(
        <AccordionPanel key={weekNum} heading={`${this.props.t('common:week')} ${weekNum}`}>
          <List selectable={false} style={{ marginLeft: 30 }}>
            {tasks[weekNum] &&
              tasks[weekNum].map((taskName, index) => (
                <ListItem key={index} justify="between" margin="none" pad="none" responsive={false}>
                  <span>{this.props.t(`common:${taskName}`)}</span>
                  <span className="secondary">
                    <Button
                      icon={<FormTrashIcon size="small" />}
                      onClick={(e) => this.handleRemoveTask(e, weekNum, index)}
                      title={this.props.t(`tasks:remove`)}
                    />
                  </span>
                </ListItem>
              ))}
          </List>
          <br />
          <Select
            placeHolder={this.props.t(`common:tasks`)}
            options={consts.scheduleOptions.map((value) => ({
              value,
              label: this.props.t(`common:${value}`),
            }))}
            onChange={({ value }) => this.handleWeekChange(weekNum, value)}
          />
        </AccordionPanel>
      )
    }
    return weeks
  }

  render() {
    const { t } = this.props
    const { month, year, weeks, hall, errors, submitting, readingMain } = this.state
    return (
      <div>
        <Loader loading={submitting} />
        <Header size="medium">
          <Heading tag="h2" margin="medium">
            {t('new')}
          </Heading>
        </Header>
        <Columns size="medium" maxCount={2}>
          <Box>
            <Form pad="medium">
              <FormField label={t('common:month')} error={errors.month}>
                <Select
                  id="Month"
                  label={t('common:month')}
                  options={consts.monthsOptions.map((value) => ({
                    value,
                    label: t(`common:month${value}`),
                  }))}
                  value={month}
                  onChange={({ value }) => this.handleChange('month', value)}
                />
              </FormField>
              <FormField label={t('common:year')} error={errors.year}>
                <TextInput value={year} onDOMChange={(e) => this.handleChange('year', e.target.value)} />
              </FormField>
              <FormField label={t('common:halls')} error={errors.hall}>
                <Select
                  placeHolder={t('common:halls')}
                  options={availableHalls.map((value) => ({
                    value,
                    label: t(`common:hall${value}`),
                  }))}
                  value={hall}
                  onChange={({ value }) => this.handleChange('hall', value)}
                />
              </FormField>
              {hall.value === consts.HALLS_ALL && (
                <FormField label={t('common:Reading')} error={errors.hall}>
                  <CheckBox
                    label={t('common:readingMain')}
                    checked={!!readingMain}
                    onChange={({ target }) => this.handleChange('readingMain', target.checked)}
                  />
                </FormField>
              )}
              <FormField label={t('common:weekNum')} error={errors.weeks}>
                <NumberInput value={weeks} onChange={(e) => this.handleChange('weeks', e.target.value)} />
              </FormField>
              <Paragraph margin="small">{t('scheduleWeekInfo', { month: month.label, year })}</Paragraph>
              <Footer pad={{ vertical: 'medium' }}>
                <Button label={t('common:generate')} onClick={!submitting ? this.handleSubmit : null} primary />
                <Anchor href="#" onClick={this.handleClose} style={{ marginLeft: 20 }}>
                  {t('common:return')}
                </Anchor>
              </Footer>
            </Form>
          </Box>
          <Box style={{ marginBottom: 350 }}>
            <Accordion active={0}>{this.renderWeeks()}</Accordion>
          </Box>
        </Columns>
      </div>
    )
  }
}

ScheduleForm.propTypes = {
  history: PropTypes.object,
}

export default withRouter(withTranslation(['schedules', 'tasks', 'common'])(ScheduleForm))
