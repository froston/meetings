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
  List,
  ListItem,
  NumberInput,
  DateTime,
  Anchor,
} from 'grommet'
import { StopFillIcon, ViewIcon } from 'grommet/components/icons/base'
import moment from 'moment'
import { consts, functions } from '../utils'

const initState = {
  number: '',
  assigned: '',
  date_from: '',
  date_to: '',
  errors: {},
}

class TerritoryForm extends React.PureComponent {
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
      date_from: dateFrom,
      date_to: dateTo,
    }
    this.setState({ ...state, errors: {} })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { territory } = this.props
      const values = { ...this.state }
      const newValues = Object.assign({}, values)
      newValues.date_from = moment(newValues.date_from, consts.DATETIME_FORMAT).isValid() ? newValues.date_from : null
      newValues.date_to = moment(newValues.date_to, consts.DATETIME_FORMAT).isValid() ? newValues.date_to : null
      if (territory && territory.id) {
        this.props.handleSubmit(territory && territory.id, newValues)
      } else {
        this.props.handleSubmit(null, newValues)
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
    const { number, assigned, date_from, date_to, errors } = this.state
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <Header>
              {territory && <StopFillIcon size="small" colorIndex={functions.getTerritoryStatusColor(territory)} />}
              <Heading>{territory ? `${t('territory')} ${territory.number}` : t('new')}</Heading>
            </Header>
            <FormField label={t('number')} error={errors.number}>
              <NumberInput value={number} onChange={(e) => this.handleChange('number', e.target.value)} />
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
              </>
            )}
            {territory && territory.last_worked && (
              <FormField label={t('last_worked')}>
                <TextInput value={functions.formatDateValue(territory.last_worked)} disabled />
              </FormField>
            )}
            <Box margin={{ vertical: 'medium' }}>
              <Anchor icon={<ViewIcon />} label={t('territoryView')} href="#" onClick={this.handleView} />
            </Box>
            {territory && territory.numbers && !!territory.numbers.length && (
              <>
                <br />
                <Heading tag="h3">{t('numbers')}</Heading>
                <List>
                  {territory.numbers.map((n, i) => (
                    <ListItem key={i} justify="between" separator={i === 0 ? 'horizontal' : 'bottom'}>
                      <span>{n.number}</span>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            <Footer pad={{ vertical: 'medium' }}>
              <Box direction="row" align="center" pad={{ between: 'medium' }} responsive={false} wrap>
                <Button label={t('common:submit')} type={online ? 'submit' : undefined} primary disabled={!online} />
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
