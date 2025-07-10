import React from 'react'
import { clsx } from 'clsx'

const cardVariants = {
  default: 'card-mission',
  glow: 'card-mission-glow',
  elevated: 'card-mission hover:shadow-2xl hover:scale-[1.02]',
  flat: 'bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700',
  transparent: 'bg-transparent border border-gray-700/50 rounded-lg'
}

function Card({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = 'p-6',
  ...props 
}) {
  const variantClasses = cardVariants[variant] || cardVariants.default
  
  return (
    <div
      className={clsx(variantClasses, padding, className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={clsx('text-xl font-bold text-white', className)} {...props}>
      {children}
    </h3>
  )
}

function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={clsx('text-gray-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
}

function CardContent({ children, className = '', ...props }) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-gray-700', className)} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card