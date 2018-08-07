import React from 'react';
import { Section, Tabs, Tab, Columns, Box, Heading, Card, Button } from 'grommet'
import { WeekTab } from './'
import { api, consts } from '../utils'

import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';

class Schedule extends React.Component {
  state = {
    schedule: {}
  }

  componentDidMount() {
    this.loadData()
  }

  groupBy = (xs, key) => {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

  loadData = () => {
    const id = this.props.match.params.id
    api.get(`/schedules/${id}`)
      .then(schedule => {
        schedule.tasks = this.groupBy(schedule.tasks, 'week')
        this.setState({ schedule })
      })
  }

  render() {
    const { schedule } = this.state
    console.log(schedule)
    return (
      <Section>
        <Heading tag="h1">Schedule - {schedule.month} / {schedule.year}</Heading>
        <Tabs justify="start">
          {schedule.tasks && Object.keys(schedule.tasks).map((key) => {
            const tasksA = schedule.tasks[key].filter(task => task.hall === consts.HALLS_A)
            const tasksB = schedule.tasks[key].filter(task => task.hall === consts.HALLS_B)
            const week = key
            return (
              <Tab key={week} title={`Week ${week}`}>
                <Accordion openMulti={true}>
                  <AccordionPanel heading={`Hall ${consts.HALLS_A}`}>
                    <WeekTab tasks={tasksA} />
                  </AccordionPanel>
                  {tasksB && tasksB.length > 0 &&
                    <AccordionPanel heading={`Hall ${consts.HALLS_B}`} >
                      <WeekTab tasks={tasksB} />
                    </AccordionPanel>
                  }
                </Accordion>
              </Tab>
            )
          })}
        </Tabs>
      </Section>
    );
  }
}

export default Schedule;
