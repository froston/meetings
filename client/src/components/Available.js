import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Layer, Heading, List, ListItem, Paragraph } from 'grommet'

class Available extends React.PureComponent {
  componentDidUpdate(prevProps) {
    if (prevProps.hidden && !this.props.hidden) {
      this.list.listRef.scrollTo(0, 0)
    }
  }
  render() {
    const { t, availables, noParticipate, hidden, handleSelect, handleClose, helpers } = this.props
    return (
      <Layer closer overlayClose align="right" onClose={handleClose} hidden={hidden}>
        <Heading tag="h2" margin="medium">
          {helpers ? t('availableHelpers') : t('available')}
        </Heading>
        <Paragraph>{t('students:sort')}</Paragraph>
        <List
          selectable
          style={{ minWidth: 550 }}
          ref={ref => {
            this.list = ref
          }}
        >
          {availables.map((student, index) => {
            const lastTask = helpers ? student.helpTasks[0] : student.tasks[0]
            return (
              <ListItem
                key={student.id}
                pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
                justify="between"
                responsive
                onClick={() => handleSelect(student)}
                separator={index === 0 ? 'horizontal' : 'bottom'}
              >
                <span>
                  <strong>{student.name} </strong>
                </span>
                {lastTask && (
                  <span style={{ color: '#ccc' }} className="secondary">
                    {helpers ? t('lastHelper') : t('lastTask')}: {t(`common:${lastTask.task}`)} ({lastTask.week}){' '}
                    {lastTask.month}/{lastTask.year}
                  </span>
                )}
              </ListItem>
            )
          })}
          <Heading tag="h3" margin="medium">
            {t('non-participate')}
          </Heading>
          <hr />
          {noParticipate.map(student => (
            <ListItem
              key={student.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              responsive
              onClick={() => handleSelect(student)}
              separator={'bottom'}
            >
              <span style={{ color: '#ab4343' }}>
                <strong>{student.name} </strong>
              </span>
            </ListItem>
          ))}
        </List>
      </Layer>
    )
  }
}

Available.propTypes = {
  availables: PropTypes.array,
  noParticipate: PropTypes.array,
  hidden: PropTypes.bool,
  handleSelect: PropTypes.func,
  handleClose: PropTypes.func,
  helpers: PropTypes.bool
}

export default translate('students')(Available)
