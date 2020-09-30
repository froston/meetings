import React from 'react'
import ReactDOM from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import 'moment/locale/cs'
import 'moment/locale/es'
import App from './containers/App'
import '../node_modules/grommet-css'
import 'react-toastify/dist/ReactToastify.min.css'
import './index.css'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById('root')
)

//serviceWorker.register({}, i18n.language)
serviceWorker.unregister()
