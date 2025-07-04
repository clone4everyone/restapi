import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { 
  Send, 
  History, 
  FolderOpen, 
  Star, 
  BarChart3,
  Zap,
  Menu,
  X
} from 'lucide-react'

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Request Builder', href: '/', icon: Send },
    { name: 'History', href: '/history', icon: History },
    { name: 'Collections', href: '/collections', icon: FolderOpen },
    { name: 'Favorites', href: '/favorites', icon: Star },
    { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  ]

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">REST Client</h1>
              <p className="text-sm text-gray-500">API Testing Tool</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}

export default Sidebar