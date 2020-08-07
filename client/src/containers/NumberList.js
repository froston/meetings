import React from 'react'
import { withRouter } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Section, Box, Heading, Paragraph, List, ListItem, Button, Label } from 'grommet'
import { FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import { toast } from 'react-toastify'
import Spinning from 'grommet/components/icons/Spinning'
import { Undo, NumberForm } from '../components'
import { api, consts } from '../utils'

class NumberList extends React.Component {
  state = {
    online: navigator.onLine,
    loading: false,
    numbers: [],
    toRemove: [],
    numberForm: true,
    number: {},
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
    const { searchTerm, noParticipate, gender } = this.state
    api.get(`/numbers`).then((data) => {
      this.setState({ numbers: data || [], loading: false })
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

  handleUndo = (id) => {
    const { toRemove } = this.state
    this.setState({ toRemove: toRemove.filter((t) => t !== id) })
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

  getColorIndex = (status) => {
    console.log(status)
    switch (status) {
      case 'NC':
        return 'brand'
      case 'NI':
        return 'warning'
      case 'O':
        return 'accent-2'
      case 'C':
        return 'neutral-3'
      case 'A':
        return 'neutral-1'
      case 'RV':
        return 'ok'
      case 'X':
        return 'critical'
      case 'FS':
        return 'grey-1'
      default:
        return 'unknown'
    }
  }

  render() {
    const { t } = this.props
    const { numbers, online, loading, toRemove } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          {t('title')}
        </Heading>
        <Paragraph margin="small">{t('desc')}</Paragraph>
        <List selectable onSelect={this.handleSelect}>
          {numbers
            .filter((t) => !toRemove.includes(t.id))
            .map((num, index) => (
              <ListItem
                key={num.id}
                pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
                justify="between"
                align="center"
                responsive={false}
                onClick={this.handleSelect}
                separator={index === 0 ? 'horizontal' : 'bottom'}
              >
                <Box>
                  <div title={num.status}>
                    <StopFillIcon size="xsmall" colorIndex={this.getColorIndex(num.status)} />
                    <strong> {num.number}</strong>
                    <Label size="small"> | {num.name}</Label>
                  </div>
                </Box>
                <Box direction="row" responsive={false}>
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
      </Section>
    )
  }
}

export default withRouter(translate('numbers')(NumberList))
