import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Search, MoreVertical, ArrowLeft } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useNotification } from '../contexts/NotificationContext'
import LoadingSpinner from './LoadingSpinner'

const Collections = () => {
  const { getCollections, getRequestsByCollection } = useApi()
  const { showNotification } = useNotification()
  
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [showCollections, setShowCollections] = useState(true)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    setLoading(true)
    try {
      const response = await getCollections()
      setCollections(response.data)
    } catch (error) {
      showNotification('Failed to load collections', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadCollectionRequests = async (collection) => {
    setLoadingRequests(true)
    setSelectedCollection(collection)
    setShowCollections(false)
    try {
      const response = await getRequestsByCollection(collection.collection)
      setRequests(response.data)
    } catch (error) {
      showNotification('Failed to load collection requests', 'error')
    } finally {
      setLoadingRequests(false)
    }
  }

  const goBackToCollections = () => {
    setShowCollections(true)
    setSelectedCollection(null)
    setRequests([])
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
    <div className="h-full flex flex-col lg:flex-row">
      {/* Collections Sidebar - Mobile: Full screen, Desktop: 1/3 width */}
      <div className={`${
        showCollections ? 'block' : 'hidden lg:block'
      } lg:w-1/3 border-r border-gray-200 p-4 lg:p-6 overflow-y-auto`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Collections</h2>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner className="w-8 h-8" />
            </div>
          ) : (
            <div className="space-y-2">
              {collections.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No collections found</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.collection}
                    onClick={() => loadCollectionRequests(collection)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedCollection?.collection === collection.collection
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <FolderOpen className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{collection.collection}</h3>
                          <p className="text-sm text-gray-500">{collection.count} requests</p>
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collection Requests */}
      <div className={`${
        !showCollections ? 'block' : 'hidden lg:block'
      } flex-1 p-4 lg:p-6 overflow-y-auto`}>
        {!selectedCollection ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Collection</h3>
              <p className="text-gray-500">Choose a collection from the sidebar to view its requests</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={goBackToCollections}
                  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedCollection.collection}</h3>
                  <p className="text-gray-500">{selectedCollection.count} requests</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search in collection..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner className="w-8 h-8" />
              </div>
            ) : (
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No requests in this collection</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <span className={`px-2 py-1 rounded text-xs font-medium border flex-shrink-0 ${getMethodClass(request.method)}`}>
                            {request.method}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {request.name || `${request.method} ${request.url}`}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">{request.url}</p>
                            {request.description && (
                              <p className="text-xs text-gray-400 truncate">{request.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right">
                            <span className={`text-sm font-medium ${getStatusClass(request.status)}`}>
                              {request.status || 'N/A'}
                            </span>
                            <p className="text-xs text-gray-500">{request.responseTime}ms</p>
                          </div>
                          <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors">
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collections