import moment from 'moment'
import { consts } from './'

export const formatDateValue = (date) => {
  return date ? moment(date).format(consts.DATE_FORMAT) : ''
}

export const getNumberStatusColor = (status) => {
  switch (status) {
    case 'NC':
      return 'brand'
    case 'NI':
      return 'warning'
    case 'O':
      return 'accent-2'
    case 'C':
      return 'neutral-3'
    case 'A':
      return 'neutral-1'
    case 'RV':
      return 'ok'
    case 'X':
      return 'critical'
    case 'FS':
      return 'grey-1'
    default:
      return 'unknown'
  }
}
