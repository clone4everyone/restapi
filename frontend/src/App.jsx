import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import RequestBuilder from './components/RequestBuilder'
import History from './components/History'
import Collections from './components/Collections'
import Favorites from './components/Favorites'
import Statistics from './components/Statistics'
import { ApiProvider } from './contexts/ApiContext'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationContainer from './components/NotificationContainer'

function App() {
  const [currentRequest, setCurrentRequest] = useState(null)
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handleRequestExecuted = (request) => {
    setCurrentRequest(request)
    setRefreshHistory(prev => prev + 1)
  }

  return (
    <ApiProvider>
      <NotificationProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-hidden lg:ml-0">
            <div className="h-full pt-16 lg:pt-0">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <RequestBuilder 
                      onRequestExecuted={handleRequestExecuted}
                      currentRequest={currentRequest}
                    />
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <History 
                      refreshTrigger={refreshHistory}
                      onRequestLoad={setCurrentRequest}
                    />
                  } 
                />
                <Route path="/collections" element={<Collections />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/statistics" element={<Statistics />} />
              </Routes>
            </div>
          </main>
        </div>
        <NotificationContainer />
      </NotificationProvider>
    </ApiProvider>
  )
}

export default App