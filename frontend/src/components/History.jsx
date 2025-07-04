import { useState, useEffect } from 'react'
import { Search, Filter, Star, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useNotification } from '../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'

const History = ({ refreshTrigger, onRequestLoad }) => {
  const { getHistory, searchRequests, deleteRequest, updateRequest } = useApi()
  const { showNotification } = useNotification()
  
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRequests, setSelectedRequests] = useState([])
  const [sortBy, setSortBy] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadRequests()
  }, [refreshTrigger, currentPage, sortBy, sortOrder])

  useEffect(() => {
    if (searchTerm) {
      handleSearch()
    } else {
      loadRequests()
    }
  }, [searchTerm])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const response = await getHistory({
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder
      })
      setRequests(response.data)
      setTotalPages(response.pagination.pages)
    } catch (error) {
      showNotification('Failed to load history', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadRequests()
      return
    }

    setLoading(true)
    try {
      const response = await searchRequests({
        q: searchTerm,
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder
      })
      setRequests(response.data)
      setTotalPages(response.pagination.pages)
    } catch (error) {
      showNotification('Search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequest(id)
        showNotification('Request deleted successfully', 'success')
        loadRequests()
      } catch (error) {
        showNotification('Failed to delete request', 'error')
      }
    }
  }

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await updateRequest(id, { isFavorite: !currentStatus })
      showNotification(`Request ${!currentStatus ? 'added to' : 'removed from'} favorites`, 'success')
      loadRequests()
    } catch (error) {
      showNotification('Failed to update favorite status', 'error')
    }
  }

  const handleLoadRequest = (request) => {
    onRequestLoad(request)
    showNotification('Request loaded in builder', 'success')
  }

  const getMethodClass = (method) => {
    const classes = {
      'GET': 'method-get',
      'POST': 'method-post',
      'PUT': 'method-put',
      'DELETE': 'method-delete',
      'PATCH': 'method-patch',
    }
    return classes[method] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getStatusClass = (status) => {
    if (status >= 200 && status < 300) return 'status-success'
    if (status >= 400) return 'status-error'
    return 'status-warning'
  }

  return (
    <div className="h-full p-4 lg:p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Request History</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="timestamp-desc">Newest first</option>
              <option value="timestamp-asc">Oldest first</option>
              <option value="method-asc">Method A-Z</option>
              <option value="status-asc">Status (low to high)</option>
              <option value="responseTime-desc">Response time (slow to fast)</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {/* Request List */}
        {!loading && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No requests found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {requests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getMethodClass(request.method)}`}>
                          {request.method}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {request.name || `${request.method} ${request.url}`}
                            </h3>
                            {request.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{request.url}</p>
                          {request.description && (
                            <p className="text-xs text-gray-400 truncate">{request.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getStatusClass(request.status)}`}>
                              {request.status || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {request.responseTime}ms
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleFavorite(request.id, request.isFavorite)}
                            className={`p-2 rounded-lg transition-colors ${
                              request.isFavorite
                                ? 'text-yellow-500 hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLoadRequest(request)}
                            className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDelete(request.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default History