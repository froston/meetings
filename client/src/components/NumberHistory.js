import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Header, Heading, Table, TableRow } from 'grommet'
import moment from 'moment'
import { api, consts } from '../utils'

class NumberHistory extends React.PureComponent {
  state = {
    hist: [],
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadData()
    }
  }

  loadData = () => {
    console.log(this.props)
    api.get(`/numbers/${this.props.number.id}/history`).then((hist) => {
      this.setState({ hist })
    })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }
  render() {
    const { t, hidden, number, handleClose } = this.props
    const { hist } = this.state
    return (
      <div>
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
                  <th>{t('changedDate')}</th>
                  <th>{t('status')}</th>
                  <th>{t('details')}</th>
                </tr>
              </thead>
              <tbody>
                {hist &&
                  hist.map((numHist, index) => {
                    return (
                      <TableRow key={index}>
                        <td>{moment(numHist.changed_date).format(consts.DATE_FORMAT)}</td>
                        <td>{t(`common:status${numHist.status}`)}</td>
                        <td>{numHist.details}</td>
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
}

export default withTranslation(['numbers', 'common'])(NumberHistory)
