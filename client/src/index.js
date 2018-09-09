import React from 'react'
import ReactDOM from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import App from './containers/App'
import 'moment/locale/es'
import 'moment/locale/cs'
import '../node_modules/grommet-css'
import 'react-toastify/dist/ReactToastify.min.css'
import './index.css'

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById('root')
)
