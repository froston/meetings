import React from 'react'

export const AppContext = React.createContext({
  settings: {},
  changeSetting: () => {},
  suggestions: [],
  suggestionsRv: [],
})
