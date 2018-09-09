import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { App as GrommetApp } from 'grommet'
import { Layout, Login, PrivateRoute } from './'

const App = () => {
  return (
    <GrommetApp centered={false}>
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <PrivateRoute path="/" component={Layout} />
        </Switch>
      </BrowserRouter>
    </GrommetApp>
  )
}

export default App
