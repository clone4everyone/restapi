export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

export const formatJSON = (obj) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return String(obj)
  }
}

export const parseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch (error) {
    return str
  }
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const getMethodColor = (method) => {
  const colors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'yellow',
    DELETE: 'red',
    PATCH: 'purple',
    HEAD: 'gray',
    OPTIONS: 'gray',
  }
  return colors[method?.toUpperCase()] || 'gray'
}

export const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return 'green'
  if (status >= 300 && status < 400) return 'yellow'
  if (status >= 400) return 'red'
  return 'gray'
}