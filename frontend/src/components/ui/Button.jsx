import React, { forwardRef } from 'react'
import { clsx } from 'clsx'
import { aria } from '../../utils/accessibility'

const buttonVariants = {
  primary: 'btn-mission',
  secondary: 'btn-mission-secondary',
  danger: 'btn-mission-danger',
  ghost: 'px-4 py-2 rounded-md font-medium transition-all duration-300 hover:bg-gray-800/50 border border-transparent hover:border-gray-600',
  outline: 'px-4 py-2 rounded-md font-medium transition-all duration-300 border border-gray-600 hover:border-space-500 hover:bg-space-500/10'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-space-500/50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-space-500'

  const variantClasses = buttonVariants[variant] || buttonVariants.primary
  const sizeClasses = buttonSizes[size] || buttonSizes.md

  // Create ARIA attributes
  const ariaAttributes = aria.createButtonAria(
    ariaLabel,
    ariaExpanded,
    ariaControls,
    ariaPressed
  )

  // Add describedby if provided
  if (ariaDescribedBy) {
    ariaAttributes['aria-describedby'] = ariaDescribedBy
  }

  // Add loading state to aria-label
  const finalAriaLabel = loading
    ? `${ariaLabel || 'Button'} - Loading`
    : ariaLabel

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        baseClasses,
        variantClasses,
        sizeClasses,
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      aria-label={finalAriaLabel}
      {...ariaAttributes}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button