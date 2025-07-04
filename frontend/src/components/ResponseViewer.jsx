import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ResponseViewer = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body')
  const [expandedSections, setExpandedSections] = useState({
    headers: false,
    body: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'status-success'
    if (status >= 400) return 'status-error'
    return 'status-warning'
  }

  const formatJSON = (data) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  const formatHeaders = (headers) => {
    if (!headers) return {}
    return Object.entries(headers).reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  }

  if (!response) return null

  return (
    <div className="space-y-6">
      {/* Response Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`text-lg font-bold ${getStatusColor(response.response?.status)}`}>
                {response.response?.status || 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                {response.response?.statusText || ''}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{response.responseTime || 0}ms</span>
            </div>
            {response.timestamp && (
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(response.timestamp), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4" aria-label="Tabs">
            {['body', 'headers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'body' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleSection('body')}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {expandedSections.body ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Response Body</span>
                </button>
              </div>
              
              {expandedSections.body && (
                <div className="border border-gray-200 rounded-lg">
                  <pre className="response-viewer p-4 bg-gray-50 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm">
                    {formatJSON(response.response?.data)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'headers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleSection('headers')}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {expandedSections.headers ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Response Headers</span>
                </button>
              </div>
              
              {expandedSections.headers && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      {Object.entries(formatHeaders(response.response?.headers) || {}).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                          <span className="text-gray-600 w-2/3 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResponseViewer