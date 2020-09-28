import axios from 'axios'
import firebase from 'firebase'

const instance = axios.create({
  baseURL: '/api',
})

instance.interceptors.request.use(
  async (options) => {
    options.headers['Authorization'] = `Bearer ${await firebase.auth().currentUser.getIdToken()}`
    return options
  },
  function (error) {
    return Promise.reject(error)
  }
)

export const get = (url) => {
  return instance.get(url).then((res) => res.data)
}

export const post = (url, data) => {
  return instance.post(url, data)
}

export const patch = (url, id, data) => {
  return instance.patch(`${url}/${id}`, data)
}

export const remove = (url, id) => {
  return instance.delete(`${url}/${id}`)
}

export const downloadFile = (url) => {
  return instance
    .get(url, {
      responseType: 'blob',
    })
    .then((res) => res.data)
}
