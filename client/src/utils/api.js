const getHeaders = () => {
  let headers = new Headers()
  headers.set('Authorization', 'Basic ' + localStorage.getItem('auth'))
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')
  return headers
}

export const get = url => {
  return fetch(`/api${url}`, {
    headers: getHeaders(),
    method: 'GET'
  })
    .then(res => res.json())
    .catch(console.error)
}

export const post = (url, data) => {
  return fetch(`/api${url}`, {
    headers: getHeaders(),
    method: 'POST',
    body: JSON.stringify({ ...data })
  }).catch(console.error)
}

export const patch = (url, id, data) => {
  return fetch(`/api${url}/${id}`, {
    headers: getHeaders(),
    method: 'PATCH',
    body: JSON.stringify({ ...data })
  }).catch(console.error)
}

export const remove = (url, id) => {
  return fetch(`/api${url}/${id}`, {
    headers: getHeaders(),
    method: 'DELETE'
  }).catch(console.error)
}

export const downloadFile = url => {
  let headers = new Headers()
  headers.set('Authorization', 'Basic ' + localStorage.getItem('auth'))
  return fetch(`/api${url}`, {
    headers: headers,
    method: 'GET'
  })
    .then(res => res.blob())
    .catch(console.error)
}

export const authenticate = (username, password, cb) => {
  if (username && password) {
    const auth = btoa(`${username}:${password}`)
    let headers = new Headers()
    headers.set('Authorization', `Basic ${auth}`)
    return fetch(`/api`, {
      headers,
      method: 'GET'
    }).then(res => {
      if (res.status === 401 || res.status === 500) {
        cb('Wrong username or password')
      } else {
        cb(null, auth)
      }
    })
  } else {
    cb('Input your username and password')
  }
}
