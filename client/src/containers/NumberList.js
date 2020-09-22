import React from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Search, TextInput, Select } from 'grommet'
import { FormTrashIcon, StopFillIcon, AddIcon, HistoryIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import Spinning from 'grommet/components/icons/Spinning'
import { Undo, NumberForm, NumberHistory, Loader } from '../components'
import { api, functions, consts } from '../utils'

class NumberList extends React.Component {
  state = {
    online: navigator.onLine,
    loading: false,
    numbers: [],
    toRemove: [],
    numberForm: true,
    numberHist: true,
    number: {},
    searchTerm: '',
    status: null,
    territory: null,
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

  handleSearch = (e) => {
    const searchTerm = e.target.value
    this.setState({ searchTerm }, this.debounceSearch)
  }

  loadData = (showLoading = true, cb, more = false) => {
    showLoading && this.setState({ loading: true })
    const { searchTerm, status, numbers, territory } = this.state
    let filter = `?offset=${more ? numbers.length : 0}&limit=20`
    filter += searchTerm ? `&q=${searchTerm}` : ''
    filter += status ? `&status=${status}` : ''
    filter += territory ? `&territory=${territory}` : ''
    api.get(`/numbers${filter}`).then((data) => {
      this.setState({
        numbers: more ? [...numbers, ...data] : data,
        loading: false,
      })
      cb && cb()
    })
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleSelect = (index) => {
    this.setState({ numberForm: false, number: this.state.numbers[index] })
  }

  handleAdd = () => {
    this.setState({ numberForm: false, number: null })
  }

  handleHistory = (e, number) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ number, numberHist: false })
  }

  handleUndo = (id) => {
    const { toRemove } = this.state
    this.setState({ toRemove: toRemove.filter((t) => t !== id) })
  }

  handleSubmit = (id, values, cbError) => {
    const { t } = this.props
    const data = {
      ...this.state.number,
      ...values,
    }
    if (id) {
      api.patch('/numbers', id, data).then(() => {
        toast(t('numberUpdated', { number: data.number }))
        this.setState({ numberForm: true }, this.loadData)
      })
    } else {
      api
        .post('/numbers', data)
        .then(() => {
          toast(t('numberCreated', { number: data.number }))
          this.setState({ numberForm: true }, this.loadData)
        })
        .catch(cbError)
    }
  }

  handleMore = () => {
    this.loadData(false, null, true)
  }

  cleanTerritories = () => {
    const { toRemove } = this.state
    let requests = toRemove.map(
      (id) =>
        new Promise((resolve) => {
          api.remove('/numbers', id).then(resolve)
        })
    )
    Promise.all(requests).then(() => {
      this.loadData(false, () => {
        this.setState({ toRemove: [] })
      })
    })
  }

  handleFilter = (name, val) => this.setState({ [name]: val }, this.loadData)

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    const { t } = this.props
    if (window.confirm(t('confirmRemove'))) {
      this.setState({ toRemove: [...this.state.toRemove, id] })
      toast(<Undo data={id} text={t('numberRemoved')} undo={this.handleUndo} />, {
        onClose: this.cleanTerritories,
      })
    }
  }

  render() {
    const { t } = this.props
    const { numbers, online, loading, toRemove, searchTerm, status, territory } = this.state
    const statusOptions = ['', ...consts.statusOptions]
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

        <Box direction="row" wrap={true}>
          <Box pad="small">
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
          <Box pad="small">
            <Select
              label={t('status')}
              options={statusOptions.map((value) => ({ value, label: t(`common:status${value}`) }))}
              value={{ value: status, label: status && t(`common:status${status}`) }}
              onChange={({ value }) => this.handleFilter('status', value.value)}
              placeHolder={t('status')}
            />
          </Box>
          <Box pad="small">
            <TextInput
              value={territory}
              onDOMChange={(e) => this.handleFilter('territory', e.target.value)}
              placeHolder={t('territory')}
            />
          </Box>
        </Box>

        <List selectable onSelect={this.handleSelect} onMore={numbers.length >= 20 ? this.handleMore : null}>
          {numbers
            .filter((t) => !toRemove.includes(t.id))
            .map((num, index) => (
              <ListItem
                key={num.id}
                justify="between"
                align="center"
                responsive={false}
                onClick={this.handleSelect}
                separator={index === 0 ? 'horizontal' : 'bottom'}
                style={{ paddingTop: 0, paddingBottom: 0 }}
              >
                <Box>
                  <div title={num.status}>
                    <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(num.status)} />
                    <strong> {num.number}</strong>
                  </div>
                </Box>
                <Box direction="row" responsive={false}>
                  {num.history_id > 0 && (
                    <Button
                      icon={<HistoryIcon size="small" />}
                      onClick={(e) => this.handleHistory(e, num)}
                      a11yTitle={t('history')}
                      title={t('history')}
                    />
                  )}
                  <Button
                    icon={<FormTrashIcon size="medium" />}
                    onClick={online ? (e) => this.handleRemove(e, num.id) : undefined}
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
        <NumberForm
          online={online}
          hidden={this.state.numberForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('numberForm', true)}
          number={this.state.number}
        />
        <NumberHistory
          hidden={this.state.numberHist}
          handleClose={() => this.handleForm('numberHist', true)}
          number={this.state.number}
          reloadList={this.loadData}
        />
      </Section>
    )
  }
}

export default withRouter(withTranslation('numbers')(NumberList))
