import React from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Search, TextInput, Select } from 'grommet'
import { FormTrashIcon, StopFillIcon, AddIcon, HistoryIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import Spinning from 'grommet/components/icons/Spinning'
import { Undo, NumberForm, NumberHistory, Loader } from '../components'
import { api, functions, consts, withConnection } from '../utils'
import { AppContext } from '../utils/context'
import Empty from '../images/Empty'

class NumberList extends React.Component {
  static contextType = AppContext

  state = {
    loading: false,
    suggestions: [],
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
    this.debounceSearch = functions.debounce(this.loadData, 500)
  }

  handleSearch = (searchTerm) => {
    let suggestions = []
    if (searchTerm) {
      suggestions = this.context.suggestionsRv.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    this.setState({ searchTerm, suggestions }, this.debounceSearch)
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
      api
        .patch('/numbers', id, data)
        .then(() => {
          toast(t('numberUpdated', { number: data.number }))
          this.setState({ numberForm: true }, this.loadData)
        })
        .catch(cbError)
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

  showSuggestions = () => {
    const val = this.state.searchTerm
    return val && !!val.length && isNaN(parseFloat(val)) && !isFinite(val)
  }

  render() {
    const { t, online } = this.props
    const { numbers, loading, toRemove, searchTerm, status, territory, suggestions } = this.state
    const statusOptions = ['', ...consts.statusOptions]
    const numbersArr = numbers.filter((t) => !toRemove.includes(t.id))
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
              placeHolder={t('search')}
              value={searchTerm}
              onDOMChange={(e) => this.handleSearch(e.target.value)}
              onSelect={(obj) => this.handleSearch(obj.suggestion)}
              suggestions={this.showSuggestions() ? suggestions : []}
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

        <List
          selectable
          onSelect={numbersArr.length && this.handleSelect}
          onMore={numbersArr.length >= 20 ? this.handleMore : null}
        >
          {numbersArr.map((num, index) => (
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
          <Empty show={!numbersArr.length && !loading} text={t('common:emptyResult')} />
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

export default withRouter(withTranslation('numbers')(withConnection(NumberList)))
