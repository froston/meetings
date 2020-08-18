import React from 'react'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import {
  Box,
  Section,
  Form,
  FormField,
  Header,
  Heading,
  Footer,
  Button,
  TextInput,
  NumberInput,
  Select,
  Columns,
  DateTime,
} from 'grommet'
import { SettingsOptionIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import moment from 'moment'
import { consts, api, functions } from '../utils'

const initState = {
  territory: {},
  assigned: '',
  date_from: '',
  date_to: '',
  numbers: {},
  errors: {},
}

class Work extends React.Component {
  state = initState

  componentDidMount() {
    const { location, history } = this.props
    if (location.state) {
      this.loadData(location.state)
    } else {
      history.push('territories')
    }
  }

  loadData = (data) => {
    const { territory } = data
    let numbers = {}
    if (territory && territory.numbers && !!territory.numbers.length) {
      territory.numbers.forEach((n) => {
        numbers[n.number] = n
      })
    }
    // set territory to state
    let terState = { territory, numbers, history_id: null }
    if (territory.isAssigned || (!territory.date_from && !territory.date_to)) {
      terState.history_id = territory.history_id
      terState.assigned = territory.assigned
      terState.date_from = territory.date_from
    }
    this.setState(terState)
  }

  validate = (cb) => {
    const { territory, assigned, date_from, date_to } = this.state
    let errors = {}
    if (!territory.isAssigned) {
      const fromValid = moment(date_from, consts.DATETIME_FORMAT).isValid()
      if (!fromValid) errors.date_from = this.props.t('common:dateNotValid')
      if (!assigned) errors.assigned = this.props.t('common:required')
      if (!date_from) errors.date_from = this.props.t('common:required')
    }
    const toValid = moment(date_to, consts.DATETIME_FORMAT).isValid()
    if (!toValid) errors.date_to = this.props.t('common:dateNotValid')
    if (!date_to) errors.date_to = this.props.t('common:required')
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleNumChange = (name, value, number) => {
    const numbers = { ...this.state.numbers }
    numbers[number][name] = value
    this.setState({ numbers })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { t, history } = this.props
      const data = {
        ...this.state.territory,
        ...this.state,
      }
      data.numbers = []
      Object.entries(this.state.numbers).forEach(([key, value]) => {
        if (value.status) {
          data.numbers.push(value)
        }
      })
      api.post(`/territories/${data.id}/work`, data).then(() => {
        toast(t('territoryWorked', { number: data.number }))
        history.push('territories')
      })
    })
  }

  render() {
    const { t } = this.props
    const { territory, assigned, date_from, date_to, errors } = this.state
    return (
      <Section>
        <Header>
          <Heading>
            {t('workTerritory')} {territory.number}
          </Heading>
        </Header>
        <Columns masonry maxCount={2}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <FormField label={t('number')}>
              <NumberInput value={territory.number} disabled />
            </FormField>
            {territory.isAssigned ? (
              <>
                <FormField label={t('assigned')}>
                  <TextInput value={territory.assigned} disabled />
                </FormField>
                <FormField label={t('date_from')}>
                  <TextInput value={moment(territory.date_from).format(consts.DATETIME_FORMAT)} disabled />
                </FormField>
              </>
            ) : (
              <>
                <FormField label={t('assigned')} error={errors.assigned}>
                  <TextInput value={assigned} onDOMChange={(e) => this.handleChange('assigned', e.target.value)} />
                </FormField>
                <FormField label={t('date_from')} error={errors.date_from}>
                  <DateTime
                    value={date_from}
                    onChange={(val) => this.handleChange('date_from', val)}
                    format={consts.DATETIME_FORMAT}
                  />
                </FormField>
              </>
            )}
            <FormField label={t('date_to')} error={errors.date_to}>
              <DateTime
                value={date_to}
                onChange={(val) => this.handleChange('date_to', val)}
                format={consts.DATETIME_FORMAT}
              />
            </FormField>
            <Footer pad={{ vertical: 'medium' }}>
              <Box direction="row" align="center" pad={{ between: 'medium' }} responsive={false} wrap>
                <Button icon={<SettingsOptionIcon />} label={t('workTerritory')} type="submit" primary />
              </Box>
            </Footer>
          </Form>
          <div>
            {territory.numbers &&
              territory.numbers.map((num, i) => {
                const { status, details } = this.state.numbers[num.number]
                const borderTop = num.status
                  ? `3px solid ${functions.getNumberStatusColor(num.status, true)}`
                  : `3px solid #f5f5f5`
                return (
                  <Box key={i} align="center" pad="medium" margin="medium" style={{ borderTop }} colorIndex="light-2">
                    <Form>
                      <Header>
                        <Heading tag="h3">
                          {t('numbers:number')} <strong>{num.number}</strong>
                        </Heading>
                      </Header>
                      <FormField label={t('numbers:name')} error={errors.name}>
                        <TextInput value={num.name} disabled />
                      </FormField>
                      <FormField label={t('numbers:status')} error={errors.status}>
                        <Select
                          label={t('common:status')}
                          options={consts.statusOptions.map((value) => ({ value, label: t(`common:status${value}`) }))}
                          value={{ value: status, label: status && t(`common:status${status}`) }}
                          onChange={({ value }) => this.handleNumChange('status', value.value, num.number)}
                          placeHolder={t('numbers:status')}
                        />
                      </FormField>
                      <FormField label={t('numbers:details')}>
                        <textarea
                          rows={3}
                          type="text"
                          placeholder={t('numbers:details')}
                          value={details}
                          onChange={(e) => this.handleNumChange('details', e.target.value, num.number)}
                          maxLength={500}
                        />
                      </FormField>
                    </Form>
                  </Box>
                )
              })}
            {territory.numbers && territory.numbers.length === 0 && (
              <Box align="center" pad="medium" margin="medium" colorIndex="light-2">
                <Heading tag="h3">{t('noNumbers')}</Heading>
              </Box>
            )}
          </div>
        </Columns>
      </Section>
    )
  }
}

Work.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
}

export default withTranslation(['territories', 'numbers'])(Work)
