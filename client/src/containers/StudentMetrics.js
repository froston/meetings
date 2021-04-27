import React from 'react'
import { withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Section, Heading, Paragraph, Box, Select, Button } from 'grommet'
import { FormTrashIcon } from 'grommet/components/icons/base'
import moment from 'moment'

import Empty from '../images/Empty'
import { Loader } from '../components'
import { api } from '../utils'

const colors = ['#0a64a0', '#ff7d28', '#dc2878', '#000001', '#501eb4', '#49516f', '#00cceb']

class StudentMetrics extends React.PureComponent {
  getState = () => ({
    data: {},
    students: [],
    selected: [],
    loading: false,
    timeFilter: {
      value: 'lastYears',
      label: this.props.t('common:filterTimeLastYears'),
    },
  })

  state = this.getState()

  componentDidMount() {
    this.setState({ loading: true })

    const { location } = this.props.history
    let student = location?.state?.student
    let selected = []
    if (student?.id > 0) {
      selected.push(student)
    }

    api.get('/students').then((students) => {
      this.loadData(selected).then((data) => {
        this.setState({ data, selected, students, loading: false })
      })
    })
  }

  loadData = (selected = []) => {
    return Promise.all(selected.map(({ id }) => api.get(`/tasks/${id}`))).then((res) => {
      let data = {}
      res.forEach((tasks, i) => {
        let id = selected[i]?.id
        let studentTask = tasks.find((t) => t.student_id === id)
        if (id && studentTask) {
          data[id] = tasks
        }
      })
      return data
    })
  }

  getFilteredTasks = (tasks) => {
    const { timeFilter } = this.state
    const currentYear = moment().year()

    switch (timeFilter.value) {
      case 'always':
        return tasks
      case 'lastYear':
        return tasks.filter((t) => t.year >= currentYear - 1)
      case 'lastYears':
        return tasks.filter((t) => t.year >= currentYear - 3)
      default:
        return tasks
    }
  }

  getFilteredYears = () => {
    const { data, timeFilter } = this.state
    const currentYear = moment().year()
    const minYear = Math.min(
      ...Object.entries(data)
        .map(([_, tasks]) => tasks.map((t) => t.year))
        .flat()
    )

    let latestYear
    switch (timeFilter.value) {
      case 'always':
        latestYear = minYear - 1
        break
      case 'lastYear':
        latestYear = currentYear - 1
        break
      case 'lastYears':
        latestYear = currentYear - 3
        break
      default:
        latestYear = currentYear
    }

    let result = []
    for (let year = latestYear; year <= currentYear; year++) {
      result.push(year)
    }

    return result
  }

  getTasks(tasks) {
    let filteredTasks = this.getFilteredTasks(tasks)

    const reading = filteredTasks.filter((t) => t.task === 'Reading')
    const initalCall = filteredTasks.filter((t) => t.task === 'Initial Call')
    const returnVisit = filteredTasks.filter((t) => t.task === 'Return Visit')
    const bibleStudy = filteredTasks.filter((t) => t.task === 'Bible Study')
    const talk = filteredTasks.filter((t) => t.task === 'Talk')

    return {
      reading,
      initalCall,
      returnVisit,
      bibleStudy,
      talk,
    }
  }

  getDataTypePie() {
    const { t } = this.props
    let datasets = []

    Object.entries(this.state.data).forEach(([id, values]) => {
      const tasks = values.filter((v) => v.student_id === Number(id))
      let { reading, initalCall, returnVisit, bibleStudy, talk } = this.getTasks(tasks)

      datasets.push({
        label: tasks[0]?.student_name,
        data: [reading.length, initalCall.length, returnVisit.length, bibleStudy.length, talk.length],
        backgroundColor: ['#ff7d28', '#00cceb', '#dc2878', '#0a64a0', '#49516f'],
      })
    })

    return {
      labels: [
        t('common:Reading'),
        t('common:Initial Call'),
        t('common:Return Visit'),
        t('common:Bible Study'),
        t('common:Talk'),
      ],
      datasets,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${context.dataset.label} - ${t(`common:${context.label}`)}: ${context.formattedValue}`,
            },
          },
        },
      },
    }
  }

  getDataAmountLine() {
    const { t } = this.props
    let datasets = []
    let years = this.getFilteredYears()

    Object.entries(this.state.data).forEach(([id, values], i) => {
      let filteredTasks = this.getFilteredTasks(values)

      const tasks = filteredTasks.filter((v) => v.student_id === Number(id))
      const helpTasks = filteredTasks.filter((v) => v.helper_id === Number(id))

      datasets.push({
        label: tasks[0]?.student_name,
        data: years.map((year) => tasks.filter((t) => t.year === year).length),
        borderColor: colors[i],
        backgroundColor: colors[i],
      })
      datasets.push({
        label: `${t('common:helper')}: ${tasks[0]?.student_name}`,
        data: years.map((year) => helpTasks.filter((t) => t.year === year).length),
        borderColor: colors[i],
        borderDash: [5, 5],
        backgroundColor: 'transparent',
      })
    })

    return {
      labels: years,
      datasets,
      options: {
        responsive: true,
      },
    }
  }

  getDataAmountTypeBar() {
    const { t } = this.props
    let datasets = []
    let years = this.getFilteredYears()

    Object.entries(this.state.data).forEach(([id, values]) => {
      const tasks = values.filter((v) => v.student_id === Number(id))
      let { reading, initalCall, returnVisit, bibleStudy, talk } = this.getTasks(tasks)

      const taskTypes = [
        { name: 'Reading', color: '#ff7d28', data: reading },
        { name: 'Initial Call', color: '#00cceb', data: initalCall },
        { name: 'Return Visit', color: '#dc2878', data: returnVisit },
        { name: 'Bible Study', color: '#0a64a0', data: bibleStudy },
        { name: 'Talk', color: '#49516f', data: talk },
      ]

      taskTypes.forEach((type, i) => {
        datasets.push({
          label: `${t(`common:${type.name}`)}: ${tasks[0]?.student_name}`,
          data: years.map((year) => type.data.filter((t) => t.year === year && t.task === type.name).length),
          borderColor: type.color,
          backgroundColor: type.color,
          stack: tasks[0]?.student_name,
          order: i,
        })
      })
    })

    return {
      labels: years,
      datasets,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => context.raw > 0 && ` ${context.dataset.label} (${context.formattedValue})`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    }
  }

  handleTimeFilterChange = ({ value }) => {
    this.setState({ timeFilter: value })
  }

  handleStudentChange = ({ value }) => {
    const { selected } = this.state
    let student = { name: value.label, id: value.value }
    let newSelected = [...selected, student]

    this.loadData(newSelected).then((data) => {
      this.setState({ data, selected: newSelected })
    })
  }

  handleStudentRemove = (id) => {
    const { selected } = this.state
    let newSelected = selected.filter((s) => s.id !== id)

    this.loadData(newSelected).then((data) => {
      let newData = { ...data }
      delete newData[id]

      this.setState({ data: newData, selected: newSelected })
    })
  }

  render() {
    const { t } = this.props
    const { selected, loading, timeFilter, students } = this.state

    let dataTypePie = this.getDataTypePie()
    let dataAmountLine = this.getDataAmountLine()
    let dataAmountTypeBar = this.getDataAmountTypeBar()

    let noData = !dataTypePie.datasets.length && !dataAmountLine.datasets.length && !dataAmountTypeBar.datasets.length

    const timeFilterOpts = [
      { value: 'always', label: t('common:filterTimeAlways') },
      { value: 'lastYear', label: t('common:filterTimeLastYear') },
      { value: 'lastYears', label: t('common:filterTimeLastYears') },
    ]

    return (
      <Section>
        <Loader loading={loading} />
        <Heading tag="h1" margin="small">
          {t('metrics')}
        </Heading>
        <Paragraph margin="small">{t('metricsDesc')}</Paragraph>
        <Box colorIndex="light-2" pad="medium">
          <Heading tag="h5">
            <strong>{t('metricFilters')}</strong>
          </Heading>
          <Box direction="row" wrap>
            <Box pad="small">
              <Select
                placeHolder={t('timeFilter')}
                options={timeFilterOpts}
                value={timeFilter}
                onChange={this.handleTimeFilterChange}
              />
            </Box>
            <Box pad="small">
              <Select
                placeHolder={t('selectStudents')}
                options={students.map((s) => ({ value: s.id, label: s.name }))}
                onChange={this.handleStudentChange}
              />
            </Box>
          </Box>
          {!!selected.length && (
            <>
              <Heading tag="h4">
                <strong>{t('selectedStudents')}</strong>
              </Heading>
              <Box direction="row" responsive={false} wrap>
                {selected.map(({ id, name }) => (
                  <Box
                    direction="row"
                    align="center"
                    justify="center"
                    margin="small"
                    responsive={false}
                    pad={{ horizontal: 'small', vertical: 'none' }}
                    colorIndex="grey-1"
                  >
                    <span style={{ color: '#fff' }}>{name}</span>
                    <Button
                      icon={<FormTrashIcon colorIndex="light-1" />}
                      onClick={() => this.handleStudentRemove(id)}
                      style={{ border: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
        {!!selected.length && !noData && (
          <Box direction="row" justify="around" align="around" wrap>
            <Box pad="small" margin="small" size="medium">
              <Heading tag="h2">{t('assignationTypeMetrics')}</Heading>
              <Doughnut data={dataTypePie} options={dataTypePie.options} />
            </Box>
            <Box pad="small" margin="small" size="xlarge">
              <Heading tag="h2">{t('assignationAmountMetrics')}</Heading>
              <Line data={dataAmountLine} options={dataAmountLine.options} />
            </Box>
            <Box pad="small" margin="small" size="xlarge">
              <Heading tag="h2">{t('assignationAmountTypeMetrics')}</Heading>
              <Bar data={dataAmountTypeBar} options={dataAmountTypeBar.options} />
            </Box>
          </Box>
        )}
        <Empty show={!selected.length || noData} text={t('noData')} />
      </Section>
    )
  }
}

export default withTranslation('schedules')(withRouter(StudentMetrics))
