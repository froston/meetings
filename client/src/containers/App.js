import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Layout } from './'

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Layout} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
