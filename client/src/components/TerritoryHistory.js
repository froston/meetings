import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Header, Heading, Table, TableRow, Button } from 'grommet'
import { FormTrashIcon } from 'grommet/components/icons/base'
import moment from 'moment'
import { api, consts } from '../utils'

class TerritoryHistory extends React.PureComponent {
  state = {
    hist: [],
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    api.get(`/territories/${this.props.territory.id}/history`).then((hist) => {
      this.setState({ hist })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleRemove = (e, terHist) => {
    const { t } = this.props
    if (window.confirm(t('confirmRemoveHist'))) {
      e.preventDefault()
      api.remove(`/territories/${this.props.territory.id}/history`, terHist.id).then(() => {
        this.loadData()
        this.props.reloadList()
      })
    }
  }

  render() {
    const { t, hidden, territory, handleClose } = this.props
    const { hist } = this.state
    return (
      <div>
        <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('history')} - {t('territory')} {territory && territory.number}
            </Heading>
          </Header>
          <div style={{ overflowX: 'auto' }}>
            <Table responsive={false} scrollable>
              <thead>
                <tr>
                  <th width="200">{t('assigned')}</th>
                  <th width="200">{t('date_from')}</th>
                  <th width="200">{t('date_to')}</th>
                  {hist.length > 1 && <th></th>}
                </tr>
              </thead>
              <tbody>
                {hist &&
                  hist.map((terHist, index) => {
                    return (
                      <TableRow key={index}>
                        <td>{terHist.assigned}</td>
                        <td>{terHist.date_from && moment(terHist.date_from).format(consts.DATETIME_FORMAT)}</td>
                        <td>{terHist.date_to && moment(terHist.date_to).format(consts.DATETIME_FORMAT)}</td>
                        {hist.length > 1 && (
                          <td>
                            <Button
                              icon={<FormTrashIcon size="small" />}
                              onClick={(e) => this.handleRemove(e, terHist)}
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

TerritoryHistory.propTypes = {
  hidden: PropTypes.bool,
  territory: PropTypes.object,
  handleClose: PropTypes.func,
  reloadList: PropTypes.func,
}

export default withTranslation(['territories', 'common'])(TerritoryHistory)
