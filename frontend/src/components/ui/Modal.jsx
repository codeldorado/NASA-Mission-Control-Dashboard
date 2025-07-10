import React, { useEffect } from 'react'
import { clsx } from 'clsx'
import Button from './Button'

function Modal({ 
  isOpen = false, 
  onClose, 
  title = null,
  children, 
  size = 'md',
  className = '',
  showCloseButton = true,
  closeOnOverlayClick = true,
  ...props 
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={clsx(
            'relative w-full card-mission-glow transform transition-all',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              {title && (
                <h2 className="text-xl font-bold text-white">{title}</h2>
              )}
              
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalHeader({ children, className = '', ...props }) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function ModalTitle({ children, className = '', ...props }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

function ModalContent({ children, className = '', ...props }) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

function ModalFooter({ children, className = '', ...props }) {
  return (
    <div className={clsx('flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700', className)} {...props}>
      {children}
    </div>
  )
}

Modal.Header = ModalHeader
Modal.Title = ModalTitle
Modal.Content = ModalContent
Modal.Footer = ModalFooter

export default Modal