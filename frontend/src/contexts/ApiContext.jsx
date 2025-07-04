import { createContext, useContext } from 'react'
import axios from 'axios'

const ApiContext = createContext()

// Configure axios defaults
const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error || 'Server error')
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check if the server is running')
    } else {
      // Something else happened
      throw new Error(error.message)
    }
  }
)

export const ApiProvider = ({ children }) => {
  // Execute HTTP request
  const executeRequest = async (requestData) => {
    return await api.post('/requests/execute', requestData)
  }

  // Get request history
  const getHistory = async (params = {}) => {
    return await api.get('/requests/history', { params })
  }

  // Get specific request by ID
  const getRequestById = async (id) => {
    return await api.get(`/requests/history/${id}`)
  }

  // Delete request
  const deleteRequest = async (id) => {
    return await api.delete(`/requests/history/${id}`)
  }

  // Update request
  const updateRequest = async (id, data) => {
    return await api.patch(`/requests/history/${id}`, data)
  }

  // Get collections
  const getCollections = async () => {
    return await api.get('/requests/collections')
  }

  // Get requests by collection
  const getRequestsByCollection = async (collection, params = {}) => {
    return await api.get(`/requests/collections/${collection}`, { params })
  }

  // Get favorites
  const getFavorites = async (params = {}) => {
    return await api.get('/requests/favorites', { params })
  }

  // Search requests
  const searchRequests = async (params = {}) => {
    return await api.get('/requests/search', { params })
  }

  // Get statistics
  const getStats = async () => {
    return await api.get('/requests/stats')
  }

  // Export requests
  const exportRequests = async (params = {}) => {
    return await api.get('/requests/export', { params })
  }

  // Bulk delete
  const bulkDelete = async (ids) => {
    return await api.post('/requests/bulk/delete', { ids })
  }

  // Bulk favorite
  const bulkFavorite = async (ids, favorite) => {
    return await api.post('/requests/bulk/favorite', { ids, favorite })
  }

  const value = {
    executeRequest,
    getHistory,
    getRequestById,
    deleteRequest,
    updateRequest,
    getCollections,
    getRequestsByCollection,
    getFavorites,
    searchRequests,
    getStats,
    exportRequests,
    bulkDelete,
    bulkFavorite,
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}