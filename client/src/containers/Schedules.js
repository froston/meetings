import React from 'react';
import Button from 'grommet/components/Button';

class Schedules extends React.Component {
  state = {
    schedules: []
  }
  componentDidMount() {
    fetch('/api/schedules')
      .then(res => res.json())
      .then(schedules => this.setState({ schedules }))
  }
  render() {
    return (
      <div>
        <h1>Schedules</h1>
        <ul>
          {this.state.schedules.map(schedule =>
            <li key={schedule._id}>{schedule.name}</li>
          )}
        </ul>
        <Button
          label='Label'
          onClick={() => { }}
        />
      </div>
    );
  }
}

export default Schedules;
