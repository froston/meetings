import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Header, Heading, Table, TableRow } from 'grommet'
import { StopFillIcon } from 'grommet/components/icons/base'
import { api, functions } from '../utils'

class TerritoryView extends React.PureComponent {
  state = {
    nums: [],
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    api.get(`/territories/${this.props.territory.number}/view`).then((nums) => {
      this.setState({ nums })
    })
  }
  render() {
    const { t, hidden, territory, handleClose } = this.props
    const { nums } = this.state
    return (
      <div>
        <Layer closer overlayClose onClose={handleClose} hidden={hidden}>
          <Header size="medium">
            <Heading tag="h2" margin="medium">
              {t('territory')} {territory && territory.number}
            </Heading>
          </Header>
          <div style={{ overflowX: 'auto', width: '60vw' }}>
            <Table responsive={false} scrollable>
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('number2')}</th>
                  <th>{t('status')}</th>
                  <th>{t('details')}</th>
                </tr>
              </thead>
              <tbody>
                {nums &&
                  nums.map((num, index) => {
                    return (
                      <TableRow key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
                        <td style={{ padding: 5 }}>
                          <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(num.status)} />
                          <span style={{ paddingLeft: 5 }}>{num.name}</span>
                        </td>
                        <td width="120" style={{ padding: 5 }}>
                          {num.number}
                        </td>
                        <td style={{ padding: 5 }}>{t(`common:status${num.status}`)}</td>
                        <td style={{ padding: 5 }}>{num.details}</td>
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

TerritoryView.propTypes = {
  hidden: PropTypes.bool,
  territory: PropTypes.object,
  handleClose: PropTypes.func,
}

export default withTranslation(['numbers', 'common'])(TerritoryView)