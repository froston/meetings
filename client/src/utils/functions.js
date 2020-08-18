import moment from 'moment'
import { consts } from './'

export const formatDateValue = (date) => {
  return date ? moment(date).format(consts.DATETIME_FORMAT) : ''
}

export const getNumberStatusColor = (status, css = false) => {
  switch (status) {
    case 'NC':
      return css ? '#865cd6' : 'brand'
    case 'NI':
      return css ? '#ffd602' : 'warning'
    case 'O':
      return css ? '#ff7d28' : 'accent-2'
    case 'C':
      return css ? '#501eb4' : 'neutral-3'
    case 'A':
      return css ? '#0a64a0' : 'neutral-1'
    case 'RV':
      return css ? '#8cc800' : 'ok'
    case 'X':
      return css ? '#ff324d' : 'critical'
    case 'FS':
      return css ? '#000001' : 'grey-1'
    default:
      return css ? '#a8a8a8' : 'unknown'
  }
}

export const getTerritoryStatusColor = (ter) => {
  let color = 'unknown'

  const assigned = ter.assigned && ter.assigned !== ''
  const dateFrom = moment(ter.date_from)
  const dateTo = moment(ter.date_to)

  var fromDif = moment().diff(dateFrom, 'days') + 1
  var toDif = moment().diff(dateTo, 'days') + 1

  // territory is free to assign
  if (dateFrom.isValid() && dateTo.isValid()) {
    // has been free up to 1 month
    if (toDif <= 30) {
      color = 'ok'
      // has been free up to 4 months
    } else if (toDif > 30 && toDif < 120) {
      color = 'warning'
      // has been free more than 4 months
    } else {
      color = 'critical'
    }
    // territory is currently assigned
  } else if (assigned && dateFrom.isValid() && !dateTo.isValid()) {
    // has been assigned up to 1 month
    if (fromDif <= 120) {
      color = 'graph-1'
      // has been assigned for more than 1 month
    } else if (fromDif > 120) {
      color = 'critical'
    }
    // any of above
  } else {
    color = 'unknown'
  }

  return color
}

export const hasAccess = (meta, access) => {
  switch (access) {
    case 'admin':
      return meta.admin === 1
    case 'lifeministry':
      return meta.admin === 1 || meta.lifeministry === 1
    case 'territories':
      return meta.admin === 1 || meta.territories === 1
    default:
      return false
  }
}

export const debounce = (callback, wait, immediate = false) => {
  let timeout = null
  return function () {
    const callNow = immediate && !timeout
    const next = () => callback.apply(this, arguments)
    clearTimeout(timeout)
    timeout = setTimeout(next, wait)
    if (callNow) {
      next()
    }
  }
}
