import { useState, useEffect } from 'react'
import { Star, Search, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useNotification } from '../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'

const Favorites = () => {
  const { getFavorites, updateRequest } = useApi()
  const { showNotification } = useNotification()
  
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadFavorites()
  }, [currentPage])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const response = await getFavorites({
        page: currentPage,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      })
      setFavorites(response.data)
      setTotalPages(response.pagination.pages)
    } catch (error) {
      showNotification('Failed to load favorites', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (id) => {
    try {
      await updateRequest(id, { isFavorite: false })
      showNotification('Removed from favorites', 'success')
      loadFavorites()
    } catch (error) {
      showNotification('Failed to remove from favorites', 'error')
    }
  }

  const filteredFavorites = favorites.filter(favorite =>
    favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    favorite.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    <div className="h-full p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Favorite Requests</h2>
              <p className="text-gray-500">Quick access to your starred requests</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        )}

        {/* Favorites List */}
        {!loading && (
          <div className="space-y-4">
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No favorite requests yet</p>
                  <p className="text-sm">Star requests in your history to see them here</p>
                </div>
              </div>
            ) : (
              <>
                {filteredFavorites.map((favorite) => (
                  <div key={favorite.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getMethodClass(favorite.method)}`}>
                          {favorite.method}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {favorite.name || `${favorite.method} ${favorite.url}`}
                            </h3>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                          <p className="text-sm text-gray-500 truncate">{favorite.url}</p>
                          {favorite.description && (
                            <p className="text-xs text-gray-400 truncate">{favorite.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Collection: {favorite.collection}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(favorite.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getStatusClass(favorite.status)}`}>
                              {favorite.status || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {favorite.responseTime}ms
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Remove from favorites"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors">
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
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

export default Favorites