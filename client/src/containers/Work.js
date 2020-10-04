import React from 'react'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router-dom'
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
  Anchor,
  Paragraph,
} from 'grommet'
import { SettingsOptionIcon, ViewIcon, StopFillIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import moment from 'moment'
import { consts, api, functions, withAuth } from '../utils'
import { TerritoryView, Loader, ColorOption, Badge } from '../components'
import { AppContext } from '../utils/context'

const initState = {
  territory: {},
  assigned: '',
  date_from: '',
  date_to: '',
  numbers: {},
  errors: {},
  loading: false,
  territoryView: true,
  submitted: false,
}

class Work extends React.Component {
  static contextType = AppContext

  state = {
    ...initState,
    suggestions: [],
  }

  componentDidMount() {
    const { match } = this.props
    if (match && match.params && match.params.id > 0) {
      this.loadData()
    } else {
      this.handleReturn()
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    const { id } = this.props.match.params
    api.get(`/territories/number/${id}`).then((territory) => {
      const assigned = new URLSearchParams(this.props.location.search).get('assigned')
      if (assigned && (!territory || assigned !== territory.assigned || !territory.isAssigned)) {
        return this.setState({ submitted: true }, () => {
          toast(this.props.t('territoryNotAssigned', { assigned }))
          this.props.history.push('/territories')
        })
      }
      let numbers = {}
      if (territory && territory.numbers && !!territory.numbers.length) {
        territory.numbers.forEach((n) => {
          const number = { ...n, status: null, details: null }
          numbers[n.number] = number
        })
      }
      // set territory to state
      let terState = { territory, numbers, history_id: null, loading: false }
      if (territory.isAssigned) {
        terState.history_id = territory.history_id
        terState.assigned = territory.assigned
        terState.date_from = moment(territory.date_from).format(consts.DATETIME_FORMAT)
      }
      this.setState(terState)
    })
  }

  validate = (cb) => {
    const { t } = this.props
    const { territory, assigned, date_from, date_to, numbers } = this.state
    let errors = {}
    if (!territory.isAssigned) {
      const fromValid = moment(date_from, consts.DATETIME_FORMAT).isValid()
      if (!fromValid) errors.date_from = t('common:dateNotValid')
      if (!assigned) errors.assigned = t('common:required')
      if (!date_from) errors.date_from = t('common:required')
    }
    const toValid = moment(date_to, consts.DATETIME_FORMAT).isValid()
    if (!toValid) errors.date_to = t('common:dateNotValid')
    if (!date_to) errors.date_to = t('common:required')

    Object.entries(numbers).forEach(([key, value]) => {
      if (!value.status && !value.details) {
        return
      } else {
        if (value.status === 'RV' && (!value.details || value.details.trim() === '')) {
          errors[key] = {}
          errors[key].details = t('common:requiredRV')
          errors.numbers = `${t('numbers:number')} ${value.number} - ${t('common:requiredRV')}`
        }
        if (value.status === 'X' && (!value.details || value.details.trim() === '')) {
          errors[key] = {}
          errors[key].details = t('common:requiredX')
          errors.numbers = `${t('numbers:number')} ${value.number} - ${t('common:requiredX')}`
        }
        if (!value.status && !!value.details) {
          errors[key] = {}
          errors[key].status = t('common:requiredStatus')
          errors.numbers = `${t('numbers:number')} ${value.number} - ${t('common:requiredStatus')}`
        }
      }
    })

    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  handleView = (e) => {
    e && e.preventDefault()
    this.setState({ territoryView: !this.state.territoryView })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleNumChange = (name, value, number) => {
    const numbers = { ...this.state.numbers }
    numbers[number][name] = value
    this.setState({ numbers, errors: {} })
  }

  handleAssignedChange = (val) => {
    var suggestions = this.context.suggestions.filter((s) => s.toLowerCase().includes(val.toLowerCase()))
    this.setState({ suggestions })
    this.handleChange('assigned', val)
  }

  handleReturn = () => {
    const { history, meta } = this.props
    if (!functions.hasAccess(meta, 'territories')) {
      history.push('/worked')
    } else {
      history.push('/territories')
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { t } = this.props
      this.setState({ loading: true })
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
        this.setState({ submitted: true }, () => {
          this.handleReturn()
        })
      })
    })
  }

  render() {
    const { t } = this.props
    const { territory, assigned, date_from, date_to, errors, loading, suggestions } = this.state
    return (
      <Section>
        <Loader loading={loading} />
        <Header>
          <Heading>
            <span style={{ marginRight: 16 }}>
              {t('workTerritory')} {territory.number}
            </span>
            {!!territory.isCompany && <Badge label={t('common:isCompany')} />}
          </Heading>
        </Header>
        <Form pad="medium">
          <FormField label={t('number')}>
            <NumberInput value={territory.number} disabled />
          </FormField>
          {territory.isAssigned ? (
            <>
              <FormField label={t('assigned')}>
                <TextInput value={territory.assigned} disabled />
              </FormField>
              <FormField label={t('date_from')}>
                <TextInput value={date_from} disabled />
              </FormField>
            </>
          ) : (
            <>
              <FormField label={t('assigned')} error={errors.assigned}>
                <TextInput
                  value={assigned}
                  placeHolder={t('nameAssigned')}
                  suggestions={assigned ? suggestions : []}
                  onDOMChange={(e) => this.handleAssignedChange(e.target.value)}
                  onSelect={(obj) => this.handleAssignedChange(obj.suggestion)}
                />
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
          {errors.numbers && (
            <Box>
              <Paragraph margin="small" style={{ color: '#ff324d' }}>
                <strong>{errors.numbers}</strong>
              </Paragraph>
            </Box>
          )}
          <Footer pad={{ vertical: 'medium' }}>
            <Box>
              <Button
                onClick={!loading ? this.handleSubmit : null}
                icon={<SettingsOptionIcon />}
                label={t('workTerritory')}
                primary
              />
              <br />
              {territory && (
                <Anchor icon={<ViewIcon />} label={t('territoryView')} href="#" onClick={this.handleView} />
              )}
            </Box>
          </Footer>
        </Form>
        <hr style={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', height: 1, border: 'none' }} />
        {territory.numbers && (
          <Columns masonry maxCount={2}>
            {territory.numbers.map((num, i) => {
              const { status, details } = this.state.numbers[num.number]
              const numError = errors[num.number] || {}
              const borderTop = status
                ? `3px solid ${functions.getNumberStatusColor(status, true)}`
                : `3px solid #f5f5f5`
              return (
                <Box key={i} align="center" pad="medium" margin="small" style={{ borderTop }} colorIndex="light-2">
                  <Form>
                    <Header>
                      <Heading tag="h3">
                        {t('numbers:number')} <strong>{num.number}</strong>
                        <div style={{ fontSize: 13 }}>
                          <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(num.status)} />
                          <span>
                            {' '}
                            {t(`common:status${num.status}`)} {num.details && `(${num.details})`}
                          </span>
                        </div>
                      </Heading>
                    </Header>
                    <FormField label={t('numbers:status')} error={numError.status}>
                      <Select
                        label={t('common:status')}
                        options={consts.statusOptions.map((value) => ({
                          value,
                          label: <ColorOption status={value} text={t(`common:status${value}`)} option />,
                        }))}
                        value={{
                          value: status,
                          label: status && <ColorOption status={status} text={t(`common:status${status}`)} />,
                        }}
                        onChange={({ value }) => this.handleNumChange('status', value.value, num.number)}
                        placeHolder={t('numbers:status')}
                      />
                    </FormField>
                    <FormField label={t('numbers:details')} error={numError.details}>
                      <textarea
                        rows={3}
                        type="text"
                        placeholder={t('numbers:details')}
                        value={details || ''}
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
          </Columns>
        )}
        <TerritoryView hidden={this.state.territoryView} handleClose={this.handleView} territory={territory} />
        <Prompt when={!this.state.submitted} message={t('common:beforeLeaving')} />
      </Section>
    )
  }
}

Work.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
}

export default withTranslation(['territories', 'numbers', 'common'])(withAuth(Work))
