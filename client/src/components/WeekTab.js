import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Box, Tiles, Tile, Paragraph, Header, Heading, Menu, Anchor } from 'grommet'
import { UserSettingsIcon } from 'grommet/components/icons/base'
import { TaskList } from '../containers'

class WeekTab extends React.PureComponent {
  state = {
    taskForm: true,
    student: {},
  }
  showTasks = (id, name) => {
    const student = { id, name }
    this.setState({
      taskForm: false,
      student,
    })
  }

  render() {
    const { t, tasks, handleChangeTask, online } = this.props
    return (
      <Tiles fill flush selectable className="week-tab">
        {tasks.map((task) => {
          if (task) {
            const className = task.task && task.task.split(' ').join('')
            return (
              <Tile
                key={task.id}
                separator="top"
                align="start"
                basis="1/4"
                className={className}
                style={{ backgroundColor: task.dup ? '#ffeaec' : null, marginBottom: 12 }}
              >
                <Header size="small" pad={{ horizontal: 'small' }}>
                  <Heading tag="h4" strong={true} margin="none">
                    {task.rv ? t(`common:${task.rv}. ${task.task}`) : t(`common:${task.task}`)}
                  </Heading>
                </Header>
                <Box pad="small">
                  <Paragraph margin="none">
                    <span>
                      <b>{t('common:name')}: </b>
                      <a href="#tasks" onClick={() => this.showTasks(task.student_id, task.student_name)}>
                        {task.student_name}
                      </a>
                    </span>
                    <br />
                    <span style={{ display: task.helper_id ? '' : 'none' }}>
                      <b>{t('common:helper')}: </b>
                      <a href="#helpers" onClick={() => this.showTasks(task.helper_id, task.helper_name)}>
                        {task.helper_name}
                        <br />
                      </a>
                    </span>
                  </Paragraph>
                </Box>
                <Menu
                  responsive={true}
                  icon={<UserSettingsIcon />}
                  closeOnClick
                  direction="row"
                  size="small"
                  style={{ padding: '10px 10px 0', position: 'absolute', right: 0, top: 0 }}
                >
                  <Anchor href="#" onClick={() => handleChangeTask(task)} disabled={!online}>
                    {t('change')}
                  </Anchor>
                  {task.task !== 'Reading' && task.task !== 'Talk' && (
                    <Anchor href="#" onClick={() => handleChangeTask(task, true)} disabled={!online}>
                      {t('changeHelper')}
                    </Anchor>
                  )}
                </Menu>
              </Tile>
            )
          } else {
            return null
          }
        })}
        <TaskList
          hidden={this.state.taskForm}
          student={this.state.student}
          handleClose={() => this.setState({ taskForm: true })}
          showForm={false}
        />
      </Tiles>
    )
  }
}

WeekTab.propTypes = {
  online: PropTypes.bool,
  tasks: PropTypes.array,
  handleChangeTask: PropTypes.func,
  handleChangeHelper: PropTypes.func,
}

export default withTranslation(['schedules', 'common'])(WeekTab)
