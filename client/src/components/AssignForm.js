import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Form, FormField, DateTime, TextInput, Header, Heading, Footer, Button } from 'grommet'
import moment from 'moment'
import { consts } from '../utils'

const initState = {
  assigned: '',
  date_from: moment().format(consts.DATETIME_FORMAT),
  errors: {},
}

class AssignForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.setState(initState)
    }
  }

  validate = (cb) => {
    const { t } = this.props
    const { assigned, date_from } = this.state
    let errors = {}
    const fromValid = moment(date_from, consts.DATETIME_FORMAT).isValid()
    if (!assigned) errors.assigned = t('common:required')
    if (!fromValid) errors.date_from = t('common:dateNotValid')
    if (!date_from) errors.date_from = t('common:required')
    if (Object.keys(errors).length) {
      this.setState({
        errors: Object.assign({}, this.state.errors, errors),
      })
    } else {
      cb()
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      const { territory } = this.props
      this.props.handleSubmit(territory.id, { ...this.state })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  render() {
    const { t, hidden, territory, handleClose } = this.props
    const { errors, assigned, date_from } = this.state
    return (
      <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
        <Header size="medium">
          <Heading tag="h2" margin="medium">
            {t('assign')} {territory && territory.number}
          </Heading>
        </Header>
        <Form pad="medium" onSubmit={this.handleSubmit}>
          <>
            <FormField label={t('assigneTo')} error={errors.assigned}>
              <TextInput
                value={assigned}
                onDOMChange={(e) => this.handleChange('assigned', e.target.value)}
                placeHolder="Nombre del hermano"
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

export default withTranslation(['territories', 'common'])(AssignForm)
