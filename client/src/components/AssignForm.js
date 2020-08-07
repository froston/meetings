import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Layer, Form, FormField, DateTime, TextInput, Header, Heading, Footer, Button } from 'grommet'
import moment from 'moment'
import { api, consts, functions } from '../utils'

const initState = {
  assigned: '',
  date_from: '',
  date_to: '',
  mode: 'assign',
  errors: {},
}

class AssignForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  validate = (cb) => {
    const { t } = this.props
    const { mode, assigned, date_from, date_to } = this.state
    let errors = {}
    if (!assigned || assigned == '') errors.assigned = t('common:required')
    if (!date_from || date_from == '') errors.date_from = t('common:required')
    console.log(mode, date_to)
    if (mode == 'finish') {
      if (!date_to || date_to == '') errors.date_to = t('common:required')
    }
    if (Object.keys(errors).length) {
      this.setState({
        errors: Object.assign({}, this.state.errors, errors),
      })
    } else {
      cb()
    }
  }

  loadData = () => {
    const { territory } = this.props
    const hasDateFrom = moment(territory.date_from).isValid()
    const hasDateTo = moment(territory.date_to).isValid()
    // decide what to do with the territory assignment
    if (!hasDateFrom && !hasDateTo) {
      this.setState(initState)
    } else if (hasDateFrom && !hasDateTo) {
      this.setState({ mode: 'finish', ...territory })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { territory } = this.props
      this.props.handleSubmit(territory.id, { ...this.state })
      this.setState(initState)
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  render() {
    const { t, hidden, territory, handleClose } = this.props
    const { mode, errors, assigned, date_from, date_to } = this.state
    const dateFrom = functions.formatDateValue(date_from)
    const dateTo = functions.formatDateValue(date_to)
    return (
      <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
        <Header size="medium">
          <Heading tag="h2" margin="medium">
            {mode == 'assign' ? t('assign') : t('finish')} {territory && territory.number}
          </Heading>
        </Header>
        <Form pad="medium" onSubmit={this.handleSubmit}>
          {mode == 'assign' && (
            <>
              <FormField label={t('assigneTo')} error={errors.assigned}>
                <TextInput value={assigned} onDOMChange={(e) => this.handleChange('assigned', e.target.value)} />
              </FormField>
              <FormField label={t('date_from')} error={errors.date_from}>
                <DateTime
                  value={dateFrom}
                  onChange={(val) => this.handleChange('date_from', val)}
                  format={consts.DATE_FORMAT}
                />
              </FormField>
              <FormField label={t('date_to')} error={errors.date_to}>
                <DateTime
                  value={dateTo}
                  onChange={(val) => this.handleChange('date_to', val)}
                  format={consts.DATE_FORMAT}
                />
              </FormField>
            </>
          )}
          {mode == 'finish' && (
            <>
              <FormField label={t('assigned')} error={errors.assigned}>
                <TextInput value={assigned} onDOMChange={(e) => this.handleChange('assigned', e.target.value)} />
              </FormField>
              <FormField label={t('date_from')} error={errors.date_from}>
                <DateTime
                  value={dateFrom}
                  onChange={(val) => this.handleChange('date_from', val)}
                  format={consts.DATE_FORMAT}
                />
              </FormField>
              <FormField label={t('date_to')} error={errors.date_to}>
                <DateTime
                  value={dateTo}
                  onChange={(val) => this.handleChange('date_to', val)}
                  format={consts.DATE_FORMAT}
                />
              </FormField>
            </>
          )}
          <br />
          <Footer pad={{ vertical: 'medium' }}>
            <Button label={t('assign')} type="submit" primary />
          </Footer>
        </Form>
      </Layer>
    )
  }
}

AssignForm.propTypes = {
  hidden: PropTypes.bool,
  territory: PropTypes.object,
  handleClose: PropTypes.func,
  handleSubmit: PropTypes.func,
}

export default translate(['territories', 'common'])(AssignForm)
