import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Zap, Activity, Globe } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useNotification } from '../contexts/NotificationContext'
import LoadingSpinner from './LoadingSpinner'

const Statistics = () => {
  const { getStats } = useApi()
  const { showNotification } = useNotification()
  
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await getStats()
      setStats(response.data)
    } catch (error) {
      showNotification('Failed to load statistics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getMethodColor = (method) => {
    const colors = {
      'GET': 'bg-green-500',
      'POST': 'bg-blue-500',
      'PUT': 'bg-yellow-500',
      'DELETE': 'bg-red-500',
      'PATCH': 'bg-purple-500',
    }
    return colors[method] || 'bg-gray-500'
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-500'
    if (status >= 400) return 'bg-red-500'
    return 'bg-yellow-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No statistics available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4 lg:p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-primary-500" />
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Statistics</h2>
            <p className="text-gray-500">Request analytics and insights</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Globe className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Favorites</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.favoriteRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {Math.round(stats.avgResponseTime)}ms
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.statusStats.length > 0 
                    ? Math.round(
                        (stats.statusStats
                          .filter(s => s.status >= 200 && s.status < 300)
                          .reduce((sum, s) => sum + parseInt(s.count), 0) / 
                         stats.totalRequests) * 100
                      )
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Activity className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Methods Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Requests by Method</h3>
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.methodStats.map((method) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getMethodColor(method.method)}`} />
                    <span className="font-medium text-gray-900">{method.method}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getMethodColor(method.method)}`}
                        style={{
                          width: `${(method.count / stats.totalRequests) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{method.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Response Status</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.statusStats.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
                    <span className="font-medium text-gray-900">{status.status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(status.status)}`}
                        style={{
                          width: `${(status.count / stats.totalRequests) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{status.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.statusStats
                  .filter(s => s.status >= 200 && s.status < 300)
                  .reduce((sum, s) => sum + parseInt(s.count), 0)}
              </div>
              <div className="text-sm text-gray-500">Successful Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.statusStats
                  .filter(s => s.status >= 400)
                  .reduce((sum, s) => sum + parseInt(s.count), 0)}
              </div>
              <div className="text-sm text-gray-500">Failed Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round((stats.favoriteRequests / stats.totalRequests) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Favorite Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics