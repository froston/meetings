import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import {
  Box,
  Layer,
  Form,
  FormField,
  Header,
  Heading,
  Footer,
  Button,
  TextInput,
  NumberInput,
  DateTime,
  Anchor,
  CheckBox,
} from 'grommet'
import { StopFillIcon, ViewIcon } from 'grommet/components/icons/base'
import moment from 'moment'
import { consts, functions } from '../utils'
import { AppContext } from '../utils/context'

const initState = {
  number: '',
  assigned: '',
  date_from: '',
  date_to: '',
  isCompany: false,
  errors: {},
  loading: false,
}

class TerritoryForm extends React.PureComponent {
  static contextType = AppContext

  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.territory) {
        this.loadForm()
      } else {
        this.setState({ ...initState })
      }
    }
  }

  validate = (cb) => {
    const { number, assigned, date_from } = this.state
    let errors = {}
    if (!number) errors.number = this.props.t('common:required')
    if (assigned || date_from) {
      const fromValid = moment(date_from, consts.DATETIME_FORMAT).isValid()
      if (!fromValid) errors.date_from = this.props.t('common:dateNotValid')
      if (!date_from) errors.date_from = this.props.t('common:required')
      if (!assigned) errors.assigned = this.props.t('common:required')
    }
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  loadForm = () => {
    const { territory } = this.props

    const dateFrom = functions.formatDateValue(territory.date_from)
    const dateTo = functions.formatDateValue(territory.date_to)

    const state = {
      number: territory.number,
      assigned: territory.assigned || '',
      isCompany: territory.isCompany,
      date_from: dateFrom,
      date_to: dateTo,
      loading: false,
    }
    this.setState({ ...state, errors: {} })
  }

  handleError = (err) => {
    if (err && err.response && err.response.data) {
      let errors = {
        ...this.state.errors,
        number: err.response.data.message,
      }
      this.setState({ errors, loading: false })
    }
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      this.setState({ loading: true })
      const { territory } = this.props
      const values = { ...this.state }
      const newValues = Object.assign({}, values)
      newValues.date_from = moment(newValues.date_from, consts.DATETIME_FORMAT).isValid() ? newValues.date_from : null
      newValues.date_to = moment(newValues.date_to, consts.DATETIME_FORMAT).isValid() ? newValues.date_to : null
      if (territory && territory.id) {
        this.props.handleSubmit(territory && territory.id, newValues, this.handleError)
      } else {
        this.props.handleSubmit(null, newValues, this.handleError)
      }
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  handleView = () => {
    this.handleClose()
    this.props.handleView()
  }

  render() {
    const { t, hidden, territory, online } = this.props
    const { number, assigned, isCompany, date_from, errors, loading } = this.state
    const { settings } = this.context
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium">
            <Header>
              {territory && (
                <StopFillIcon size="small" colorIndex={functions.getTerritoryStatusColor(territory, settings)} />
              )}
              <Heading>{territory ? `${t('territory')} ${territory.number}` : t('new')}</Heading>
            </Header>
            <FormField label={t('number')} error={errors.number}>
              <NumberInput value={number} onChange={(e) => this.handleChange('number', e.target.value)} />
            </FormField>
            <FormField label={t('common:isCompany')}>
              <CheckBox
                checked={!!isCompany}
                onChange={({ target }) => this.handleChange('isCompany', target.checked)}
                toggle
              />
            </FormField>
            {(!territory || (territory && territory.isAssigned)) && (
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
                {territory && territory.isAssigned && (
                  <FormField label={t('share')}>
                    <TextInput
                      value={encodeURI(`${window.origin}/work/${territory.number}?assigned=${territory.assigned}`)}
                    />
                  </FormField>
                )}
              </>
            )}
            {territory && territory.last_worked && (
              <>
                <br />
                <FormField label={t('last_worked')}>
                  <TextInput value={functions.formatDateValue(territory.last_worked)} disabled />
                </FormField>
              </>
            )}
            {territory && (
              <Box margin={{ vertical: 'medium' }}>
                <Anchor icon={<ViewIcon />} label={t('territoryView')} href="#" onClick={this.handleView} />
              </Box>
            )}
            <Footer pad={{ vertical: 'medium' }}>
              <Box direction="row" align="center" pad={{ between: 'medium' }} responsive={false} wrap>
                <Button onClick={!loading && online ? this.handleSubmit : null} label={t('common:submit')} primary />
              </Box>
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

TerritoryForm.propTypes = {
  online: PropTypes.bool,
  hidden: PropTypes.bool,
  territory: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
  handleView: PropTypes.func,
}

export default withTranslation(['territories', 'common'])(TerritoryForm)
