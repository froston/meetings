export const get = (url) => {
  return fetch(`api${url}`)
    .then(res => res.json())
}

export const post = (url, data) => {
  return fetch(`/api${url}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ ...data })
  })
}

export const patch = (url, id, data) => {
  return fetch(`/api${url}/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'PATCH',
    body: JSON.stringify({ ...data })
  })
}

export const remove = (url, id) => {
  return fetch(`/api${url}/${id}`, { method: 'DELETE' })
}