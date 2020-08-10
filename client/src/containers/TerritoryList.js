import React from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, Label, List, ListItem, Button, Select, Columns, Search } from 'grommet'
import { AddIcon, UserIcon, FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import Spinning from 'grommet/components/icons/Spinning'
import moment from 'moment'
import { Undo, TerritoryForm, AssignForm } from '../components'
import { api, consts } from '../utils'

class TerritoryList extends React.Component {
  state = {
    online: navigator.onLine,
    loading: false,
    territories: [],
    toRemove: [],
    territoryForm: true,
    assignForm: true,
    territory: {},
    searchTerm: '',
    orderBy: null,
  }

  componentDidMount() {
    const { state } = this.props.history.location
    if (state) {
      this.setState({ ...state }, this.loadData)
    } else {
      this.loadData()
    }
    window.addEventListener('online', this.handleConnection)
    window.addEventListener('offline', this.handleConnection)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleConnection)
    window.removeEventListener('offline', this.handleConnection)
  }

  handleConnection = (e) => {
    if (e.type === 'offline') {
      toast('You are offline.')
      this.setState({ online: false })
    }
    if (e.type === 'online') {
      toast('You are now back online.')
      this.setState({ online: true })
    }
  }

  loadData = (showLoading = true, cb) => {
    showLoading && this.setState({ loading: true })
    const { searchTerm, orderBy } = this.state
    let filter = '?'
    filter += searchTerm ? `q=${searchTerm}&` : ''
    filter += orderBy ? `orderBy=${orderBy}&` : ''
    api.get(`/territories${filter}`).then((data) => {
      this.setState({ territories: data || [], loading: false })
      cb && cb()
    })
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleSelect = (index) => {
    this.setState({ territoryForm: false, territory: this.state.territories[index] })
  }

  handleAdd = () => {
    this.setState({ territoryForm: false, territory: null })
  }

  handleUndo = (id) => {
    const { toRemove } = this.state
    this.setState({ toRemove: toRemove.filter((t) => t !== id) })
  }

  cleanTerritories = () => {
    const { toRemove } = this.state
    let requests = toRemove.map(
      (id) =>
        new Promise((resolve) => {
          api.remove('/territories', id).then(resolve)
        })
    )
    Promise.all(requests).then(() => {
      this.loadData(false, () => {
        this.setState({ toRemove: [] })
      })
    })
  }

  handleSubmit = (id, values) => {
    const { t } = this.props
    const data = {
      ...this.state.territory,
      ...values,
    }
    if (id) {
      api.patch('/territories', id, data).then(() => {
        toast(t('territoryUpdated', { number: data.number }))
        this.setState({ territoryForm: true }, this.loadData)
      })
    } else {
      api.post('/territories', data).then(() => {
        toast(t('territoryCreated', { number: data.number }))
        this.setState({ territoryForm: true }, this.loadData)
      })
    }
  }

  handleAssignment = (id, data) => {
    const { t } = this.props
    if (data.mode === 'assign') {
      api.post(`/territories/${id}/history`, id, data).then(() => {
        toast(t('territoryAssigned', { assigned: data.assigned }))
        this.setState({ assignForm: true }, this.loadData)
      })
    } else {
      api.patch(`/territories/${id}/history`, id, data).then(() => {
        toast(t('territoryAssigned', { assigned: data.assigned }))
        this.setState({ assignForm: true }, this.loadData)
      })
    }
  }

  handleFilter = (name, val) => this.setState({ [name]: val }, this.loadData)

  handleSearch = (e) => {
    const searchTerm = e.target.value
    this.setState({ searchTerm }, this.loadData)
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { t } = this.props
    if (window.confirm(t('confirmRemove'))) {
      this.setState({ toRemove: [...this.state.toRemove, id] })
      toast(<Undo data={id} text={t('territoryRemoved')} undo={this.handleUndo} />, {
        onClose: this.cleanTerritories,
      })
    }
  }

  handleAssign = (e, territory) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ assignForm: false, territory })
  }

  render() {
    const { t } = this.props
    const { territories, online, loading, toRemove, searchTerm, orderBy } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <Box pad={{ vertical: 'small' }}>
          <Button
            icon={<AddIcon />}
            label={t('add')}
            a11yTitle={t('add')}
            onClick={online ? this.handleAdd : undefined}
            href={online ? '#' : undefined}
            disabled={!online}
          />
        </Box>
        <Columns size="large">
          <Box justify="between" align="stretch" margin="small">
            <Search
              fill
              inline
              responsive={false}
              iconAlign="start"
              value={searchTerm}
              onDOMChange={this.handleSearch}
              placeHolder={t('search')}
            />
          </Box>
          <Box justify="between" align="stretch" margin="small">
            <Select
              label={t('common:orderBy')}
              options={[
                { value: 'DESC', label: 'Ultimo' },
                { value: 'ASC', label: 'Primero' },
              ]}
              value={orderBy}
              onChange={({ value }) => this.handleFilter('orderBy', value.value)}
              placeHolder={t('common:orderBy')}
            />
          </Box>
        </Columns>
        <List selectable onSelect={this.handleSelect}>
          {territories
            .filter((t) => !toRemove.includes(t.id))
            .map((ter, index) => (
              <ListItem
                key={ter.id}
                pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
                justify="between"
                align="center"
                responsive={false}
                onClick={this.handleSelect}
                separator={index === 0 ? 'horizontal' : 'bottom'}
              >
                <Box>
                  <div>
                    <StopFillIcon
                      size="xsmall"
                      colorIndex={ter.status === consts.GENDER_BROTHER ? 'graph-1' : 'graph-2'}
                    />
                    <strong>{`  ${t('territory')} ${ter.number}`}</strong>
                    {ter.assigned && <Label size="small"> | {ter.assigned}</Label>}
                    {ter.date_to && <Label size="small"> | {moment(ter.date_to).format(consts.DATE_FORMAT)}</Label>}
                  </div>
                </Box>
                <Box direction="row" responsive={false}>
                  {ter.date_to && (
                    <Button
                      icon={<UserIcon size="small" />}
                      onClick={(e) => this.handleAssign(e, ter)}
                      a11yTitle={t('assign')}
                      title={t('assign')}
                    />
                  )}
                  <Button
                    icon={<FormTrashIcon size="medium" />}
                    onClick={online ? (e) => this.handleRemove(e, ter.id) : undefined}
                    a11yTitle={t('remove')}
                    title={t('remove')}
                    disabled={!online}
                  />
                </Box>
              </ListItem>
            ))}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Spinning size="xlarge" />
            </div>
          )}
        </List>
        <TerritoryForm
          online={online}
          hidden={this.state.territoryForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('territoryForm', true)}
          territory={this.state.territory}
        />
        <AssignForm
          hidden={this.state.assignForm}
          territory={this.state.territory}
          handleClose={() => this.handleForm('assignForm', true)}
          handleSubmit={this.handleAssignment}
        />
      </Section>
    )
  }
}

export default withRouter(withTranslation('territories')(TerritoryList))
