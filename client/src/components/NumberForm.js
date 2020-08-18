import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Box, Layer, Form, FormField, Header, Heading, Footer, Button, TextInput, NumberInput, Select } from 'grommet'
import { StopFillIcon } from 'grommet/components/icons/base'
import { consts, functions } from '../utils'

const initState = {
  number: '',
  name: '',
  status: '',
  details: '',
  errors: {},
  loading: false,
}

class NumberForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.number) {
        this.loadForm()
      } else {
        this.setState({ ...initState })
      }
    }
  }

  validate = (cb) => {
    const { number } = this.state
    let errors = {}
    if (!number) errors.number = this.props.t('common:required')
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  loadForm = () => {
    const { t, number } = this.props
    const state = {
      number: number.number || '',
      name: number.name || '',
      territory: number.territory || '',
      status: number.status
        ? {
            value: number.status,
            label: t(`common:status${number.status}`),
          }
        : '',
      details: number.details || '',
      loading: false,
    }
    this.setState({ ...state, errors: {} })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      this.setState({ loading: true })
      const { number } = this.props
      const values = { ...this.state }
      const newValues = Object.assign({}, values)
      newValues.status = this.state.status.value
      newValues.territory = this.state.territory > 0 ? this.state.territory : null
      if (number && number.id) {
        this.props.handleSubmit(number && number.id, newValues)
      } else {
        this.props.handleSubmit(null, newValues)
      }
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { t, hidden, online } = this.props
    const { errors, number, name, territory, status, details, loading } = this.state
    const numberObj = this.props.number
    const statusOptions = consts.statusOptions
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium">
            <Header>
              {numberObj && <StopFillIcon size="small" colorIndex={functions.getNumberStatusColor(numberObj.status)} />}
              <Heading>{numberObj ? numberObj.number : t('new')}</Heading>
            </Header>
            <FormField label={t('number')} error={errors.number}>
              <NumberInput
                value={number}
                onChange={(e) => this.handleChange('number', e.target.value)}
                maxLength={20}
              />
            </FormField>
            <FormField label={t('name')}>
              <TextInput value={name} onDOMChange={(e) => this.handleChange('name', e.target.value)} maxLength={100} />
            </FormField>
            <FormField label={t('status')} error={errors.status}>
              <Select
                label={t('common:status')}
                options={statusOptions.map((value) => ({ value, label: t(`common:status${value}`) }))}
                value={status}
                onChange={({ value }) => this.handleChange('status', value)}
              />
            </FormField>
            <FormField label={t('territory')}>
              <NumberInput value={territory} onChange={(e) => this.handleChange('territory', e.target.value)} />
            </FormField>
            <FormField label={t('details')}>
              <textarea
                rows={3}
                type="text"
                placeholder={t('details')}
                value={details}
                onChange={(e) => this.handleChange('details', e.target.value)}
                maxLength={500}
              />
            </FormField>
            <Footer pad={{ vertical: 'medium' }}>
              <Box direction="row" align="center" pad={{ between: 'medium' }} responsive={false} wrap>
                <Button label={t('common:submit')} onClick={!loading && online ? this.handleSubmit : null} primary />
              </Box>
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

NumberForm.propTypes = {
  online: PropTypes.bool,
  hidden: PropTypes.bool,
  number: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
}

export default withTranslation(['numbers', 'common'])(NumberForm)
