// Accessibility utilities for NASA Mission Control Dashboard

// Focus management
export const focusManagement = {
  // Trap focus within a container
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element
    if (firstElement) firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  },

  // Restore focus to previous element
  restoreFocus: (previousElement) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus()
    }
  },

  // Get next focusable element
  getNextFocusable: (currentElement, container = document) => {
    const focusableElements = Array.from(container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ))
    
    const currentIndex = focusableElements.indexOf(currentElement)
    return focusableElements[currentIndex + 1] || focusableElements[0]
  }
}

// Screen reader announcements
export const announcements = {
  // Announce to screen readers
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  // Announce loading states
  announceLoading: (isLoading, context = '') => {
    const message = isLoading 
      ? `Loading ${context}...` 
      : `${context} loaded successfully`
    announcements.announce(message)
  },

  // Announce errors
  announceError: (error, context = '') => {
    const message = `Error in ${context}: ${error}`
    announcements.announce(message, 'assertive')
  },

  // Announce navigation
  announceNavigation: (pageName) => {
    announcements.announce(`Navigated to ${pageName}`)
  }
}

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (e, items, currentIndex, onSelect) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        e.preventDefault()
        break
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        e.preventDefault()
        break
      case 'Home':
        newIndex = 0
        e.preventDefault()
        break
      case 'End':
        newIndex = items.length - 1
        e.preventDefault()
        break
      case 'Enter':
      case ' ':
        if (onSelect) onSelect(items[currentIndex])
        e.preventDefault()
        break
    }

    return newIndex
  },

  // Handle escape key
  handleEscape: (e, onEscape) => {
    if (e.key === 'Escape' && onEscape) {
      onEscape()
    }
  }
}

// ARIA helpers
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Create ARIA attributes for form controls
  createFormControlAria: (id, labelId, errorId, describedById) => {
    const attrs = {
      id,
      'aria-labelledby': labelId
    }

    if (errorId) {
      attrs['aria-describedby'] = describedById ? `${describedById} ${errorId}` : errorId
      attrs['aria-invalid'] = 'true'
    } else if (describedById) {
      attrs['aria-describedby'] = describedById
    }

    return attrs
  },

  // Create ARIA attributes for buttons
  createButtonAria: (label, expanded, controls, pressed) => {
    const attrs = {
      'aria-label': label
    }

    if (expanded !== undefined) attrs['aria-expanded'] = expanded.toString()
    if (controls) attrs['aria-controls'] = controls
    if (pressed !== undefined) attrs['aria-pressed'] = pressed.toString()

    return attrs
  },

  // Create ARIA attributes for dialogs
  createDialogAria: (labelId, describedById) => {
    return {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': labelId,
      'aria-describedby': describedById
    }
  }
}

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const l1 = colorContrast.getLuminance(...color1)
    const l2 = colorContrast.getLuminance(...color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  },

  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    const thresholds = {
      'AA': 4.5,
      'AAA': 7,
      'AA-large': 3,
      'AAA-large': 4.5
    }
    return ratio >= thresholds[level]
  }
}

// Reduced motion utilities
export const reducedMotion = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Apply animation only if motion is not reduced
  conditionalAnimation: (element, animation, options = {}) => {
    if (!reducedMotion.prefersReducedMotion()) {
      return element.animate(animation, options)
    }
    return null
  }
}

// High contrast mode detection
export const highContrast = {
  // Detect high contrast mode
  isHighContrastMode: () => {
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches
  },

  // Apply high contrast styles
  applyHighContrastStyles: (element) => {
    if (highContrast.isHighContrastMode()) {
      element.classList.add('high-contrast')
    }
  }
}

// Screen reader utilities
export const screenReader = {
  // Check if screen reader is likely active
  isScreenReaderActive: () => {
    // This is a heuristic and not 100% reliable
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           document.activeElement?.getAttribute('aria-live')
  },

  // Create screen reader only text
  createSROnlyText: (text) => {
    const span = document.createElement('span')
    span.className = 'sr-only'
    span.textContent = text
    return span
  }
}

// Export all utilities
export default {
  focusManagement,
  announcements,
  keyboardNavigation,
  aria,
  colorContrast,
  reducedMotion,
  highContrast,
  screenReader
}