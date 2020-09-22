import React from 'react'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { Section, Form, FormField, Header, Heading, Footer, Button, NumberInput } from 'grommet'
import { toast } from 'react-toastify'
import { api } from '../utils'
import { AppContext } from '../utils/context'
import { Loader } from '../components'

class Settings extends React.Component {
  static contextType = AppContext
  state = {
    loading: false,
  }

  handleSubmit = () => {
    this.setState({ loading: true })
    api.post(`/settings`, this.context.settings).then(() => {
      toast(this.props.t('settingsSaved'))
      this.setState({ loading: false })
    })
  }

  handleChange = (name, value) => {
    this.context.changeSetting(name, value)
  }

  render() {
    const { t } = this.props
    const { loading } = this.state
    const { settings } = this.context
    return (
      <Section>
        <Loader loading={loading} />
        <Header>
          <Heading>{t('settings')}</Heading>
        </Header>
        <br />
        <Form>
          <FormField label={t('terWarning')}>
            <NumberInput
              value={settings.terWarning}
              onChange={(e) => this.handleChange('terWarning', e.target.value)}
            />
          </FormField>
          <FormField label={t('terDanger')}>
            <NumberInput value={settings.terDanger} onChange={(e) => this.handleChange('terDanger', e.target.value)} />
          </FormField>
          <FormField label={t('flhsIndex')}>
            <NumberInput value={settings.flhsIndex} onChange={(e) => this.handleChange('flhsIndex', e.target.value)} />
          </FormField>
          <Footer pad={{ vertical: 'medium' }}>
            <Button label={t('submit')} onClick={!loading ? this.handleSubmit : null} primary />
          </Footer>
        </Form>
      </Section>
    )
  }
}

Settings.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
}

export default withTranslation(['common'])(Settings)
