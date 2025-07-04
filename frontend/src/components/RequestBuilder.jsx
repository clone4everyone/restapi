import { useState, useEffect } from 'react'
import { Send, Plus, Trash2, Code, Eye, EyeOff, Copy, Download } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useNotification } from '../contexts/NotificationContext'
import ResponseViewer from './ResponseViewer'
import LoadingSpinner from './LoadingSpinner'

const RequestBuilder = ({ onRequestExecuted, currentRequest }) => {
  const { executeRequest } = useApi()
  const { showNotification } = useNotification()
  
  const [request, setRequest] = useState({
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    name: '',
    description: '',
    collection: 'Default',
    tags: []
  })
  
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showHeaders, setShowHeaders] = useState(false)
  const [showBody, setShowBody] = useState(false)
  const [headerInputs, setHeaderInputs] = useState([{ key: '', value: '' }])
  const [bodyType, setBodyType] = useState('json')
  const [activeTab, setActiveTab] = useState('request')

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

  useEffect(() => {
    if (currentRequest) {
      setRequest({
        method: currentRequest.method || 'GET',
        url: currentRequest.url || '',
        headers: currentRequest.headers || {},
        body: currentRequest.body || '',
        name: currentRequest.name || '',
        description: currentRequest.description || '',
        collection: currentRequest.collection || 'Default',
        tags: currentRequest.tags || []
      })
      
      // Convert headers object to array for display
      const headers = currentRequest.headers || {}
      const headerArray = Object.entries(headers).map(([key, value]) => ({ key, value }))
      if (headerArray.length === 0) {
        setHeaderInputs([{ key: '', value: '' }])
      } else {
        setHeaderInputs([...headerArray, { key: '', value: '' }])
      }
      
      setShowHeaders(Object.keys(headers).length > 0)
      setShowBody(['POST', 'PUT', 'PATCH'].includes(currentRequest.method))
    }
  }, [currentRequest])

  const handleExecute = async () => {
    if (!request.url) {
      showNotification('URL is required', 'error')
      return
    }
    if(request.name.trim().length === 0){
      showNotification('Name is required','error')
      return ;
    }
    if(request.description.trim().length === 0){
      showNotification('Description is required','error')
      return ;
    }
    if(request.collection.trim().length === 0){
      showNotification('Collection is required','error')
      return ;
    }
    setLoading(true)
    try {
      // Convert header inputs to object
      const headers = {}
      headerInputs.forEach(({ key, value }) => {
        if (key && value) {
          headers[key] = value
        }
      })

      const requestData = {
        ...request,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined
      }

      const result = await executeRequest(requestData)
      console.log(result)
      setResponse(result)
      onRequestExecuted(result)
      showNotification('Request executed successfully', 'success')
      setActiveTab('response')
    } catch (error) {
      showNotification(error.message || 'Failed to execute request', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => {
    setHeaderInputs([...headerInputs, { key: '', value: '' }])
  }

  const removeHeader = (index) => {
    setHeaderInputs(headerInputs.filter((_, i) => i !== index))
  }

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headerInputs]
    newHeaders[index] = { ...newHeaders[index], [field]: value }
    setHeaderInputs(newHeaders)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showNotification('Copied to clipboard', 'success')
  }

  const formatBody = () => {
    if (bodyType === 'json') {
      try {
        const parsed = JSON.parse(request.body)
        setRequest({ ...request, body: JSON.stringify(parsed, null, 2) })
      } catch (error) {
        showNotification('Invalid JSON format', 'error')
      }
    }
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'request'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'response'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500'
            }`}
          >
            Response
          </button>
        </div>
      </div>

      {/* Request Builder */}
      <div className={`lg:w-1/2 p-4 lg:p-6 border-r border-gray-200 overflow-y-auto ${
        activeTab === 'request' ? 'block' : 'hidden lg:block'
      }`}>
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Request Builder</h2>
            <button
              onClick={handleExecute}
              disabled={loading || !request.url}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {loading ? (
                <LoadingSpinner className="w-4 h-4 mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Method and URL */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={request.method}
              onChange={(e) => setRequest({ ...request, method: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:w-auto"
            >
              {methods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={request.url}
              onChange={(e) => setRequest({ ...request, url: e.target.value })}
              placeholder="Enter request URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={request.name}
              onChange={(e) => setRequest({ ...request, name: e.target.value })}
              placeholder="Request name (require)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="text"
              value={request.collection}
              onChange={(e) => setRequest({ ...request, collection: e.target.value })}
              placeholder="Collection"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <textarea
            value={request.description}
            onChange={(e) => setRequest({ ...request, description: e.target.value })}
            placeholder="Description (require)"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          {/* Headers Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Headers</span>
              {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {showHeaders && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                {headerInputs.map((header, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      placeholder="Header name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeHeader(index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:w-auto w-full"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className="flex items-center justify-center sm:justify-start text-primary-500 hover:text-primary-600 transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Header
                </button>
              </div>
            )}
          </div>

          {/* Body Section */}
          {['POST', 'PUT', 'PATCH'].includes(request.method) && (
            <div className="border border-gray-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-2">
                <span className="font-medium text-gray-900">Request Body</span>
                <div className="flex items-center space-x-2">
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="xml">XML</option>
                  </select>
                  {bodyType === 'json' && (
                    <button
                      onClick={formatBody}
                      className="px-3 py-1 text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={request.body}
                  onChange={(e) => setRequest({ ...request, body: e.target.value })}
                  placeholder={`Enter ${bodyType} body...`}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Viewer */}
      <div className={`lg:w-1/2 p-4 lg:p-6 overflow-y-auto ${
        activeTab === 'response' ? 'block' : 'hidden lg:block'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Response</h2>
          {response && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy response"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'response.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Download response"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        ) : response ? (
          <ResponseViewer response={response} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm sm:text-base">Send a request to see the response here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestBuilder