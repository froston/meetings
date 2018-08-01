import React, { Component } from 'react';
import Section from 'grommet/components/Section';
import AnnotatedMeter from 'grommet-addons/components/AnnotatedMeter';

class Dashboard extends Component {
  render() {
    return (
      <Section>
        <AnnotatedMeter legend={true}
          type='circle'
          units='TB'
          size='medium'
          max={70}
          series={[{ "label": "First", "value": 20, "colorIndex": "graph-1" }, { "label": "Second", "value": 50, "colorIndex": "graph-2" }]} />
      </Section>
    );
  }
}

export default Dashboard;
