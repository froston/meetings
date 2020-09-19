import React from 'react'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { Section, Form, FormField, Header, Heading, Footer, Button, NumberInput } from 'grommet'
import { toast } from 'react-toastify'
import { api } from '../utils'
import { Loader } from '../components'

const initState = {
  loading: false,
  settings: {},
}
class Settings extends React.Component {
  state = initState

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get(`/settings`).then((settings) => {
      this.setState({ settings, loading: false })
    })
  }

  handleSubmit = () => {
    this.setState({ loading: true })
    api.post(`/settings`, this.state.settings).then(() => {
      toast('settingsSaved')
      this.loadData()
    })
  }

  handleChange = (name, value) => {
    const settings = {
      ...this.state.settings,
      [name]: value,
    }
    this.setState({ settings })
  }

  render() {
    const { t } = this.props
    const { loading, settings } = this.state
    return (
      <Section>
        <Loader loading={loading} />
        <Header>
          <Heading>{t('settings')}</Heading>
        </Header>
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
