import React from 'react'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Image } from 'grommet'
import { FormTrashIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import { UserForm, Loader } from '../components'
import { api, withAuth } from '../utils'

class UsersList extends React.Component {
  state = {
    loading: false,
    users: [],
    user: null,
    userForm: true,
  }

  componentDidMount() {
    const { state } = this.props.history.location
    if (state) {
      this.setState({ ...state }, this.loadData)
    } else {
      this.loadData()
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get(`/users`).then((users) => {
      this.setState({ users, loading: false })
    })
  }

  handleSelect = (index) => {
    this.setState({ userForm: false, user: this.state.users[index] })
  }

  handleAdd = () => {
    this.setState({ userForm: false, user: null })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { t } = this.props
    if (window.confirm(t('confirmRemove'))) {
      api.remove('/users', id).then(() => {
        toast(t('userRemoved'))
        this.loadData()
      })
    }
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleRegister = (data) => {
    const { t } = this.props
    if (window.confirm(t('confirmRegister'))) {
      data.meta = {}
      api.post('/users', data).then(() => {
        toast(t('userRegistred', { name: data.displayName }))
        this.setState({ userForm: true }, this.loadData)
      })
    }
  }

  handleSubmit = (id, data) => {
    const { t } = this.props
    api.patch('/users', id, data).then(() => {
      toast(t('userUpdated', { name: data.displayName }))
      this.setState({ userForm: true }, this.loadData)
    })
  }

  render() {
    const { t, auth } = this.props
    const { loading, users } = this.state
    return (
      <Section>
        <Loader loading={loading} />
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <br />
        <List>
          {users.map((user, index) => (
            <ListItem
              key={user.uid}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={user.id > 0 ? () => this.handleSelect(index) : null}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box direction="row">
                <div>
                  <Image
                    style={{ width: '40px', borderRadius: 20 }}
                    src={user.photoURL}
                    size="small"
                    title={user.displayName}
                  />
                  <strong style={{ margin: 10 }}>{user.displayName}</strong>
                </div>
              </Box>
              <Box direction="row" responsive={false}>
                {!user.id && (
                  <Button
                    accent
                    onClick={(e) => this.handleRegister(user)}
                    a11yTitle={t('register')}
                    title={t('register')}
                    label={t('register')}
                  />
                )}
                {user.id > 0 && auth.user.uid !== user.uid && (
                  <Button
                    icon={<FormTrashIcon size="medium" />}
                    onClick={(e) => this.handleRemove(e, user.id)}
                    a11yTitle={t('remove')}
                    title={t('remove')}
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
        <UserForm
          hidden={this.state.userForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('userForm', true)}
          user={this.state.user}
        />
      </Section>
    )
  }
}

export default withTranslation('users')(withAuth(UsersList))
