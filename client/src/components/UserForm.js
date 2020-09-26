import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Form, FormField, Header, Heading, Footer, Button, TextInput, CheckBox, Select, Image } from 'grommet'
import { consts, functions, withAuth } from '../utils'

const initState = {
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

  loadForm = () => {
    const { user } = this.props
    let metaArr = []
    for (let meta in user.meta) {
      if (meta !== 'admin' && user.meta[meta] === 1) {
        metaArr.push({ value: meta })
      }
    }
    const state = {
      meta: metaArr,
      admin: user.meta.admin === 1,
      loading: false,
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ loading: true })
    const { user } = this.props
    const { meta } = this.state
    // transform array to object
    const newValues = Object.assign({}, this.state, {
      ...user,
      meta: {
        admin: this.state.admin ? 1 : 0,
        lifeministry: meta.find((m) => m.value === 'lifeministry') ? 1 : 0,
        territories: meta.find((m) => m.value === 'territories') ? 1 : 0,
        numbers: meta.find((m) => m.value === 'numbers') ? 1 : 0,
        work: meta.find((m) => m.value === 'work') ? 1 : 0,
      },
    })
    this.props.handleSubmit(user && user.id, newValues)
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { t, hidden, user, auth } = this.props
    const { admin, loading, errors, meta } = this.state
    const isCurrentUser = user && user.uid === auth.user.uid
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium">
            {user && (
              <>
                <Header>
                  <Image
                    style={{ width: '40px', borderRadius: 20 }}
                    src={user.photoURL}
                    size="small"
                    title={user.displayName}
                  />
                  <Heading tag="h2" style={{ margin: 8 }}>
                    {user.displayName}
                  </Heading>
                </Header>
                <FormField label={t('email')} error={errors.email}>
                  <TextInput value={user.email} disabled />
                </FormField>
                <FormField label={t('uid')} error={errors.uid}>
                  <TextInput value={user.uid} disabled />
                </FormField>
                <FormField label={t('creationTime')} error={errors.uid}>
                  <TextInput value={functions.formatDateValue(user.metadata.creationTime)} disabled />
                </FormField>
                <FormField label={t('lastSignInTime')} error={errors.uid}>
                  <TextInput value={functions.formatDateValue(user.metadata.lastSignInTime)} disabled />
                </FormField>
                <FormField label={t('admin')}>
                  <CheckBox
                    onChange={(e) => this.handleChange('admin', e.target.checked)}
                    checked={admin}
                    toggle
                    disabled={isCurrentUser}
                  />
                </FormField>
              </>
            )}
            {admin === 0 && (
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

export default withTranslation(['users', 'common'])(withAuth(UserForm))
