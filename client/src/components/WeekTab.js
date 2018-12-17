import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Box, Tiles, Tile, Paragraph, Header, Heading, Menu, Anchor } from 'grommet'
import { UserSettingsIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'
import { TaskList } from '../containers'

class WeekTab extends React.PureComponent {
  state = {
    taskForm: true,
    student: {}
  }
  showTasks = task => {
    const student = {
      id: task.student_id,
      name: task.name
    }
    this.setState({
      taskForm: false,
      student
    })
  }

  render() {
    const { t, tasks, handleChangeTask } = this.props
    let rvIndex = 0
    console.log(tasks)
    return (
      <Tiles fill flush selectable className="week-tab">
        {tasks.map(task => {
          if (task) {
            const className = task.task && task.task.split(' ').join('')
            return (
              <Tile
                key={task.id}
                separator="top"
                align="start"
                basis="1/4"
                style={{ position: 'relative' }}
                className={className}
              >
                <Header size="small" pad={{ horizontal: 'small' }}>
                  <Heading tag="h4" strong={true} margin="none">
                    {t(`common:${task.task}`)}
                  </Heading>
                </Header>
                <Box pad="small">
                  <Paragraph margin="none">
                    <span>
                      <b>{t('common:name')}: </b>
                      <a href="#tasks" onClick={() => this.showTasks(task)}>
                        {task.student_name}
                      </a>
                    </span>
                    <br />
                    <span style={{ display: task.helper_id ? '' : 'none' }}>
                      <b>{t('common:helper')}: </b>
                      <a href="#helpers" onClick={() => this.showTasks(task)}>
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
                  <Anchor href="#" onClick={() => handleChangeTask(task)}>
                    {t('change')}
                  </Anchor>
                  {task.helper_id && (
                    <Anchor href="#" onClick={() => handleChangeTask(task, true)}>
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
  tasks: PropTypes.array,
  handleChangeTask: PropTypes.func,
  handleChangePoint: PropTypes.func
}

export default translate(['schedules', 'common'])(WeekTab)
