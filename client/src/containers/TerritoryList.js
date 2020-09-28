import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, Label, List, ListItem, Button, Select, Search, CheckBox } from 'grommet'
import {
  AddIcon,
  UserExpertIcon,
  FormTrashIcon,
  StopFillIcon,
  SettingsOptionIcon,
  HistoryIcon,
} from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import Spinning from 'grommet/components/icons/Spinning'
import moment from 'moment'
import { Undo, TerritoryForm, AssignForm, TerritoryHistory, TerritoryView, Loader, Badge } from '../components'
import { api, consts, functions } from '../utils'
import { AppContext } from '../utils/context'

class TerritoryList extends React.Component {
  static contextType = AppContext

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
    noAssigned: false,
    territoryHist: true,
    territoryView: true,
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

    this.debounceSearch = functions.debounce(this.loadData, 300)
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
    const { searchTerm, orderBy, noAssigned } = this.state
    let filter = '?'
    filter += searchTerm ? `q=${searchTerm}&` : ''
    filter += orderBy ? `orderBy=${orderBy}&` : ''
    filter += noAssigned ? `noAssigned=${noAssigned}&` : ''
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
    const { territory } = this.state
    if (!territory.date_from && !territory.date_to) {
      api.patch(`/territories/${id}/history`, territory.history_id, data).then(() => {
        toast(t('territoryAssigned', { assigned: data.assigned }))
        this.setState({ assignForm: true }, this.loadData)
      })
    } else {
      api.post(`/territories/${id}/history`, data).then(() => {
        toast(t('territoryAssigned', { assigned: data.assigned }))
        this.setState({ assignForm: true }, this.loadData)
      })
    }
  }

  handleFilter = (name, val) => this.setState({ [name]: val }, this.loadData)

  handleSearch = (e) => {
    const searchTerm = e.target.value
    this.setState({ searchTerm }, this.debounceSearch)
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

  handleWork = (e, territory) => {
    e.preventDefault()
    e.stopPropagation()
    this.props.history.push(`/work/${territory.id}`)
  }

  handleHistory = (e, territory) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ territory, territoryHist: false })
  }

  handleAssignForm = (e, territory) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ assignForm: false, territory })
  }

  render() {
    const { t } = this.props
    const { settings } = this.context
    const { territories, online, loading, toRemove, searchTerm, orderBy, noAssigned } = this.state
    return (
      <Section>
        <Loader loading={loading} />
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
        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
          <Box justify="between" pad="small">
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
          <Box justify="between" pad="small">
            <Select
              label={t('orderBy')}
              options={consts.orderByOpt.map((o) => ({ value: o, label: t(`orderBy${o}`) }))}
              value={{ value: orderBy, label: orderBy && t(`orderBy${orderBy}`) }}
              onChange={({ value }) => this.handleFilter('orderBy', value.value)}
              placeHolder={t('orderBy')}
            />
          </Box>
          <Box justify="center" pad="small">
            <CheckBox
              label={t('noAssigned')}
              toggle
              checked={noAssigned}
              onChange={(e) => this.handleFilter('noAssigned', e.target.checked)}
            />
          </Box>
        </div>
        <br />
        <List selectable onSelect={this.handleSelect}>
          {territories
            .filter((t) => !toRemove.includes(t.id))
            .map((ter, index) => (
              <ListItem
                key={ter.id}
                justify="between"
                align="center"
                responsive={false}
                onClick={this.handleSelect}
                separator={index === 0 ? 'horizontal' : 'bottom'}
                style={{ paddingTop: 0, paddingBottom: 0 }}
              >
                <Box direction="row" align="start" justify="start">
                  <div>
                    <strong style={{ marginRight: 8 }}>
                      <StopFillIcon size="xsmall" colorIndex={functions.getTerritoryStatusColor(ter, settings)} />
                      {`  ${t('territory')} ${ter.number}`}
                    </strong>
                  </div>
                  <div style={{ marginRight: 8 }}>
                    {ter.last_worked && (
                      <Label size="small">{moment(ter.last_worked).format(consts.DATE_FORMAT)}</Label>
                    )}
                    {ter.isAssigned && <Label size="small"> | {ter.assigned}</Label>}
                  </div>
                  <div>{!!ter.isCompany && <Badge label={t('common:isCompany')} />}</div>
                </Box>
                <Box direction="row" responsive={false}>
                  {!ter.isAssigned && (
                    <Button
                      icon={<UserExpertIcon size="small" />}
                      onClick={online ? (e) => this.handleAssignForm(e, ter) : undefined}
                      a11yTitle={t('assign')}
                      title={t('assign')}
                      disabled={!online}
                    />
                  )}
                  <Button
                    icon={<SettingsOptionIcon size="small" />}
                    onClick={online ? (e) => this.handleWork(e, ter) : undefined}
                    a11yTitle={t('workTerritory')}
                    title={t('workTerritory')}
                    disabled={!online}
                  />
                  {ter.history_id > 0 && (
                    <Button
                      icon={<HistoryIcon size="small" />}
                      onClick={(e) => this.handleHistory(e, ter)}
                      a11yTitle={t('history')}
                      title={t('history')}
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
          handleView={() => this.handleForm('territoryView', false)}
        />
        <AssignForm
          hidden={this.state.assignForm}
          territory={this.state.territory}
          handleClose={() => this.handleForm('assignForm', true)}
          handleSubmit={this.handleAssignment}
          suggestions={this.context.suggestions}
        />
        <TerritoryHistory
          hidden={this.state.territoryHist}
          handleClose={() => this.handleForm('territoryHist', true)}
          territory={this.state.territory}
          reloadList={this.loadData}
        />
        <TerritoryView
          hidden={this.state.territoryView}
          handleClose={() => this.handleForm('territoryView', true)}
          territory={this.state.territory}
        />
      </Section>
    )
  }
}

TerritoryList.propTypes = {
  settings: PropTypes.object,
  history: PropTypes.object,
}

export default withRouter(withTranslation('territories')(TerritoryList))
