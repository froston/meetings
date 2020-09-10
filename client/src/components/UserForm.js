import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Form, FormField, Header, Heading, Footer, Button, TextInput, CheckBox, Select } from 'grommet'
import { consts } from '../utils'

const initState = {
  email: '',
  uid: '',
  admin: false,
  meta: [],
  errors: {},
  loading: false,
}

class UserForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.user) {
        this.loadForm()
      } else {
        this.setState({ ...initState })
      }
    }
  }

  validate = (cb) => {
    const { email, uid } = this.state
    let errors = {}
    if (!email) errors.email = this.props.t('common:required')
    if (!uid) errors.uid = this.props.t('common:required')
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  loadForm = () => {
    const { t, user } = this.props
    let metaArr = []
    for (let meta in user.meta) {
      if (meta != 'admin' && user.meta[meta] == 1) {
        metaArr.push({ value: meta })
      }
    }
    const state = {
      email: user.email,
      uid: user.uid,
      meta: metaArr,
      admin: user.meta.admin == 1,
      loading: false,
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      this.setState({ loading: true })
      const { user } = this.props
      const { meta } = this.state
      // transform array to object
      const newValues = Object.assign({}, this.state, {
        meta: {
          admin: this.state.admin ? 1 : 0,
          lifeministry: meta.find((m) => m.value == 'lifeministry') ? 1 : 0,
          territories: meta.find((m) => m.value == 'territories') ? 1 : 0,
          numbers: meta.find((m) => m.value == 'numbers') ? 1 : 0,
        },
      })
      this.props.handleSubmit(user && user.id, newValues)
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { t, hidden, user } = this.props
    const { email, uid, admin, loading, errors, meta } = this.state
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium">
            <Header>
              <Heading tag="h2">{user ? user.email : t('new')}</Heading>
            </Header>
            <FormField label={t('email')} error={errors.email}>
              <TextInput value={email} onDOMChange={(e) => this.handleChange('email', e.target.value)} />
            </FormField>
            <FormField label={t('uid')} error={errors.uid}>
              <TextInput value={uid} onDOMChange={(e) => this.handleChange('uid', e.target.value)} />
            </FormField>
            <FormField label={t('admin')}>
              <CheckBox onChange={(e) => this.handleChange('admin', e.target.checked)} checked={admin} toggle />
            </FormField>
            {admin == 0 && (
              <FormField label={t('meta')}>
                <Select
                  label={t('meta')}
                  inline
                  multiple
                  options={consts.permissions.map((p) => ({ value: p, label: t(`${p}`) }))}
                  value={meta}
                  onChange={({ value }) => this.handleChange('meta', value)}
                />
              </FormField>
            )}
            <Footer pad={{ vertical: 'medium' }}>
              <Button label={t('common:submit')} onClick={!loading ? this.handleSubmit : null} primary />
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

UserForm.propTypes = {
  hidden: PropTypes.bool,
  user: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
}

export default withTranslation(['users', 'common'])(UserForm)
