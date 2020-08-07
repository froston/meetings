import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Box, Layer, Form, FormField, Header, Heading, Footer, Button, TextInput, NumberInput, Select } from 'grommet'
import { consts } from '../utils'

const initState = {
  number: '',
  errors: {},
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
      number: number.number,
      name: number.name,
      territory: number.territory,
      status: number.status,
      details: number.details,
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { number } = this.props
      const values = { ...this.state }
      const newValues = Object.assign({}, values)
      newValues.number = this.state.number.value
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
    const { errors, number, name, territory, status, details } = this.state
    const numberObj = this.props.number
    const statusOptions = consts.statusOptions
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <Header>
              <Heading>{numberObj ? numberObj.number : t('new')}</Heading>
            </Header>
            <FormField label={t('number')} error={errors.number}>
              <NumberInput
                value={number}
                onChange={(e) => this.handleChange('number', e.target.value)}
                maxLength={20}
              />
            </FormField>
            <FormField label={t('name')} error={errors.name}>
              <TextInput value={name} onDOMChange={(e) => this.handleChange('name', e.target.value)} maxLength={100} />
            </FormField>
            <FormField label={t('status')} error={errors.status}>
              <Select
                id="status"
                label={t('common:status')}
                options={statusOptions.map((s) => ({ value: s, label: t(`common:status${s}`) }))}
                value={status}
                disabled
              />
            </FormField>
            <FormField label={t('territory')} error={errors.teritorry}>
              <TextInput
                value={territory}
                onDOMChange={(e) => this.handleChange('territory', e.target.value)}
                disabled
              />
            </FormField>
            <FormField label={t('details')}>
              <textarea
                rows={3}
                type="text"
                placeHolder={t('details')}
                value={details}
                onChange={(e) => this.handleChange('details', e.target.value)}
                maxLength={500}
                disabled
              />
            </FormField>
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

NumberForm.propTypes = {
  online: PropTypes.bool,
  hidden: PropTypes.bool,
  number: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
}

export default translate(['numbers', 'common'])(NumberForm)
