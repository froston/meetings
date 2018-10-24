import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Layer, Box, Heading, List, ListItem, Paragraph } from 'grommet'

class Available extends React.PureComponent {
  render() {
    const { t, availables, hidden, handleSelect, handleClose, helpers } = this.props
    return (
      <Layer closer overlayClose align="right" onClose={handleClose} hidden={hidden}>
        <Heading tag="h2" margin="medium">
          {helpers ? t('availableHelpers') : t('available')}
        </Heading>
        <Paragraph>{t('students:sort')}</Paragraph>
        <List selectable style={{ minWidth: 550 }}>
          {availables.map((student, index) => {
            const lastTask = helpers ? student.tasks[0] : student.helpTasks[0]
            return (
              <ListItem
                key={student.id}
                pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
                justify="between"
                responsive={false}
                onClick={() => handleSelect(student)}
                separator={index === 0 ? 'horizontal' : 'bottom'}
              >
                <span>
                  <strong>{student.name} </strong>
                </span>
                {lastTask && (
                  <span style={{ color: '#ccc' }} className="secondary">
                    {helpers ? t('lastHelper') : t('lastTask')}: ({lastTask.week}) {lastTask.month}/{lastTask.year}
                  </span>
                )}
              </ListItem>
            )
          })}
        </List>
      </Layer>
    )
  }
}

Available.propTypes = {
  availables: PropTypes.array,
  hidden: PropTypes.bool,
  handleSelect: PropTypes.func,
  handleClose: PropTypes.func,
  helpers: PropTypes.bool
}

export default translate('students')(Available)
