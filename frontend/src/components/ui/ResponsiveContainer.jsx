import React from 'react'
import { clsx } from 'clsx'
import { useViewport } from '../../hooks/usePerformance'

function ResponsiveContainer({ 
  children, 
  className = '',
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'grid',
  spacing = 'normal',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getLayoutClasses = () => {
    const spacingClasses = {
      tight: 'gap-2',
      normal: 'gap-4',
      loose: 'gap-6',
      spacious: 'gap-8'
    }

    const baseClasses = spacingClasses[spacing] || spacingClasses.normal

    if (isMobile) {
      switch (mobileLayout) {
        case 'stack':
          return `flex flex-col ${baseClasses}`
        case 'grid':
          return `grid grid-cols-1 ${baseClasses}`
        case 'horizontal':
          return `flex flex-row overflow-x-auto ${baseClasses}`
        default:
          return `flex flex-col ${baseClasses}`
      }
    }

    if (isTablet) {
      switch (tabletLayout) {
        case 'stack':
          return `flex flex-col ${baseClasses}`
        case 'grid':
          return `grid grid-cols-2 ${baseClasses}`
        case 'grid-3':
          return `grid grid-cols-3 ${baseClasses}`
        case 'horizontal':
          return `flex flex-row ${baseClasses}`
        default:
          return `grid grid-cols-2 ${baseClasses}`
      }
    }

    if (isDesktop) {
      switch (desktopLayout) {
        case 'stack':
          return `flex flex-col ${baseClasses}`
        case 'grid':
          return `grid grid-cols-3 ${baseClasses}`
        case 'grid-4':
          return `grid grid-cols-4 ${baseClasses}`
        case 'grid-5':
          return `grid grid-cols-5 ${baseClasses}`
        case 'horizontal':
          return `flex flex-row ${baseClasses}`
        default:
          return `grid grid-cols-3 ${baseClasses}`
      }
    }

    return baseClasses
  }

  return (
    <div 
      className={clsx(getLayoutClasses(), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Responsive grid component
function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getGridClasses = () => {
    const gapClass = `gap-${gap}`
    
    if (isMobile) {
      return `grid grid-cols-${cols.mobile} ${gapClass}`
    }
    if (isTablet) {
      return `grid grid-cols-${cols.tablet} ${gapClass}`
    }
    if (isDesktop) {
      return `grid grid-cols-${cols.desktop} ${gapClass}`
    }
    
    return `grid grid-cols-1 ${gapClass}`
  }

  return (
    <div 
      className={clsx(getGridClasses(), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Responsive flex component
function ResponsiveFlex({ 
  children, 
  direction = { mobile: 'col', tablet: 'row', desktop: 'row' },
  align = 'start',
  justify = 'start',
  wrap = true,
  gap = 4,
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getFlexClasses = () => {
    const baseClasses = 'flex'
    const gapClass = `gap-${gap}`
    const alignClass = `items-${align}`
    const justifyClass = `justify-${justify}`
    const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap'
    
    let directionClass = 'flex-col'
    
    if (isMobile) {
      directionClass = `flex-${direction.mobile}`
    } else if (isTablet) {
      directionClass = `flex-${direction.tablet}`
    } else if (isDesktop) {
      directionClass = `flex-${direction.desktop}`
    }

    return `${baseClasses} ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${gapClass}`
  }

  return (
    <div 
      className={clsx(getFlexClasses(), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Responsive text component
function ResponsiveText({ 
  children, 
  size = { mobile: 'base', tablet: 'lg', desktop: 'xl' },
  weight = 'normal',
  className = '',
  as = 'p',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()
  const Component = as

  const getTextClasses = () => {
    const weightClass = `font-${weight}`
    
    let sizeClass = 'text-base'
    
    if (isMobile) {
      sizeClass = `text-${size.mobile}`
    } else if (isTablet) {
      sizeClass = `text-${size.tablet}`
    } else if (isDesktop) {
      sizeClass = `text-${size.desktop}`
    }

    return `${sizeClass} ${weightClass}`
  }

  return (
    <Component 
      className={clsx(getTextClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// Responsive spacing component
function ResponsiveSpacing({ 
  children, 
  padding = { mobile: 4, tablet: 6, desktop: 8 },
  margin = { mobile: 2, tablet: 4, desktop: 6 },
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getSpacingClasses = () => {
    let paddingClass = 'p-4'
    let marginClass = 'm-2'
    
    if (isMobile) {
      paddingClass = `p-${padding.mobile}`
      marginClass = `m-${margin.mobile}`
    } else if (isTablet) {
      paddingClass = `p-${padding.tablet}`
      marginClass = `m-${margin.tablet}`
    } else if (isDesktop) {
      paddingClass = `p-${padding.desktop}`
      marginClass = `m-${margin.desktop}`
    }

    return `${paddingClass} ${marginClass}`
  }

  return (
    <div 
      className={clsx(getSpacingClasses(), className)}
      {...props}
    >
      {children}
    </div>
  )
}

// Responsive image component
function ResponsiveImage({ 
  src, 
  alt, 
  sizes = { mobile: 'w-full', tablet: 'w-1/2', desktop: 'w-1/3' },
  className = '',
  ...props 
}) {
  const { isMobile, isTablet, isDesktop } = useViewport()

  const getSizeClasses = () => {
    if (isMobile) return sizes.mobile
    if (isTablet) return sizes.tablet
    if (isDesktop) return sizes.desktop
    return 'w-full'
  }

  return (
    <img 
      src={src}
      alt={alt}
      className={clsx(getSizeClasses(), 'h-auto object-cover', className)}
      {...props}
    />
  )
}

// Export all components
ResponsiveContainer.Grid = ResponsiveGrid
ResponsiveContainer.Flex = ResponsiveFlex
ResponsiveContainer.Text = ResponsiveText
ResponsiveContainer.Spacing = ResponsiveSpacing
ResponsiveContainer.Image = ResponsiveImage

export default ResponsiveContainer