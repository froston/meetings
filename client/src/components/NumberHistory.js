import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Header, Heading, Table, TableRow, Button } from 'grommet'
import { FormTrashIcon, StopFillIcon } from 'grommet/components/icons/base'
import moment from 'moment'
import { Loader } from '../components'
import { api, consts, functions } from '../utils'

class NumberHistory extends React.PureComponent {
  state = {
    hist: [],
    loading: false,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    this.setState({ loading: true })
    api.get(`/numbers/${this.props.number.id}/history`).then((hist) => {
      this.setState({ hist, loading: false })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleRemove = (e, numHist) => {
    const { t } = this.props
    if (window.confirm(t('confirmRemoveHist'))) {
      e.preventDefault()
      api.remove(`/numbers/${this.props.number.id}/history`, numHist.id).then(() => {
        this.loadData()
        this.props.reloadList()
      })
    }
  }

  render() {
    const { t, hidden, number, handleClose } = this.props
    const { hist, loading } = this.state
    return (
      <div>
        <Loader loading={loading} />
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('history')} - {number && number.number}
            </Heading>
          </Header>
          <div style={{ overflowX: 'auto' }}>
            <Table responsive={false} scrollable>
              <thead>
                <tr>
                  <th width="130">{t('changedDate')}</th>
                  <th width="180">{t('status')}</th>
                  <th width="300">{t('details')}</th>
                  {hist.length > 1 && <th></th>}
                </tr>
              </thead>
              <tbody>
                {hist &&
                  hist.map((numHist, index) => {
                    return (
                      <TableRow key={index}>
                        <td>{moment(numHist.changed_date).format(consts.DATE_FORMAT)}</td>
                        <td>
                          <span>
                            <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(numHist.status)} />
                            {` ${t(`common:status${numHist.status}`)}`}
                          </span>
                        </td>
                        <td>{numHist.details}</td>
                        {hist.length > 1 && (
                          <td>
                            <Button
                              icon={<FormTrashIcon size="small" />}
                              onClick={(e) => this.handleRemove(e, numHist)}
                              a11yTitle={t('removeHist')}
                              title={t('removeHist')}
                            />
                          </td>
                        )}
                      </TableRow>
                    )
                  })}
              </tbody>
            </Table>
          </div>
        </Layer>
      </div>
    )
  }
}

NumberHistory.propTypes = {
  hidden: PropTypes.bool,
  number: PropTypes.object,
  handleClose: PropTypes.func,
  reloadHist: PropTypes.func,
}

export default withTranslation(['numbers', 'common'])(NumberHistory)
