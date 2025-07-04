import { clsx } from 'clsx'

const LoadingSpinner = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={clsx(
      'animate-spin rounded-full border-2 border-gray-300 border-t-primary-500',
      sizeClasses[size],
      className
    )} />
  )
}

export default LoadingSpinner