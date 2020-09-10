import React from 'react'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button } from 'grommet'
import { AddIcon, FormTrashIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import { UserForm, Loader } from '../components'
import { api, consts, functions } from '../utils'

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

  handleSubmit = (id, data) => {
    const { t } = this.props
    if (id) {
      api.patch('/users', id, data).then(() => {
        toast(t('userUpdated', { name: data.email }))
        this.setState({ userForm: true }, this.loadData)
      })
    } else {
      api.post('/users', data).then(() => {
        toast(t('userCreated', { name: data.email }))
        this.setState({ userForm: true }, this.loadData)
      })
    }
  }

  render() {
    const { t } = this.props
    const { loading, users } = this.state
    return (
      <Section>
        <Loader loading={loading} />
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'small' }}>
          <Button icon={<AddIcon />} label={t('add')} a11yTitle={t('add')} href={'#'} onClick={this.handleAdd} />
        </Box>
        <br />
        <List selectable onSelect={this.handleSelect}>
          {users.map((user, index) => (
            <ListItem
              key={user.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={this.handleSelect}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <strong>{user.email}</strong>
              </Box>
              <Box direction="row" responsive={false}>
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={(e) => this.handleRemove(e, user.id)}
                  a11yTitle={t('remove')}
                  title={t('remove')}
                />
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

export default withTranslation('users')(UsersList)
