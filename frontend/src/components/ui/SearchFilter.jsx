import React, { useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import Input from './Input'
import Button from './Button'
import Badge from './Badge'

function SearchFilter({
  onSearch,
  onFilter,
  placeholder = 'Search...',
  filters = [],
  searchValue = '',
  activeFilters = [],
  className = '',
  showClearAll = true,
  debounceMs = 300,
  ...props
}) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        setIsSearching(true)
        onSearch?.(localSearchValue)
        setTimeout(() => setIsSearching(false), 500)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localSearchValue, searchValue, onSearch, debounceMs])

  const handleFilterToggle = useCallback((filterId) => {
    const newActiveFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(id => id !== filterId)
      : [...activeFilters, filterId]
    
    onFilter?.(newActiveFilters)
  }, [activeFilters, onFilter])

  const handleClearAll = useCallback(() => {
    setLocalSearchValue('')
    onSearch?.('')
    onFilter?.([])
  }, [onSearch, onFilter])

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault()
    onSearch?.(localSearchValue)
  }, [localSearchValue, onSearch])

  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="text"
            value={localSearchValue}
            onChange={(e) => setLocalSearchValue(e.target.value)}
            placeholder={placeholder}
            icon={isSearching ? (
              <div className="animate-spin w-4 h-4 border-2 border-space-500 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          />
        </div>
        
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
        
        {showClearAll && (searchValue || activeFilters.length > 0) && (
          <Button 
            type="button" 
            variant="secondary" 
            size="md"
            onClick={handleClearAll}
          >
            Clear
          </Button>
        )}
      </form>

      {/* Filter Tags */}
      {filters.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilters.includes(filter.id)
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterToggle(filter.id)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
                    'border border-gray-600 hover:border-gray-500',
                    isActive 
                      ? 'bg-space-600 text-white border-space-500' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  )}
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <span className="ml-1 opacity-75">({filter.count})</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Active:</span>
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filterId) => {
              const filter = filters.find(f => f.id === filterId)
              if (!filter) return null
              
              return (
                <Badge
                  key={filterId}
                  variant="info"
                  size="sm"
                  className="cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  onClick={() => handleFilterToggle(filterId)}
                >
                  {filter.label} ×
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized search components for different data types
function APODSearch({ onSearch, onDateRange, className = '' }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleDateRangeSearch = useCallback(() => {
    if (startDate && endDate) {
      onDateRange?.(startDate, endDate)
    }
  }, [startDate, endDate, onDateRange])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={clsx('space-y-4', className)}>
      <SearchFilter
        onSearch={onSearch}
        placeholder="Search APOD titles and descriptions..."
        filters={[
          { id: 'image', label: 'Images Only' },
          { id: 'video', label: 'Videos Only' },
          { id: 'recent', label: 'Last 30 Days' }
        ]}
      />
      
      <div className="flex items-center space-x-2">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={today}
          label="Start Date"
          containerClassName="flex-1"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          max={today}
          min={startDate}
          label="End Date"
          containerClassName="flex-1"
        />
        <Button
          onClick={handleDateRangeSearch}
          disabled={!startDate || !endDate}
          className="mt-6"
        >
          Search Range
        </Button>
      </div>
    </div>
  )
}

function MarsRoverSearch({ onSearch, onFilter, rovers = [], cameras = [], className = '' }) {
  const roverFilters = rovers.map(rover => ({
    id: `rover_${rover}`,
    label: rover.charAt(0).toUpperCase() + rover.slice(1),
    count: undefined
  }))

  const cameraFilters = cameras.map(camera => ({
    id: `camera_${camera}`,
    label: camera,
    count: undefined
  }))

  const allFilters = [
    ...roverFilters,
    ...cameraFilters,
    { id: 'recent', label: 'Recent Photos' },
    { id: 'color', label: 'Color Images' }
  ]

  return (
    <SearchFilter
      onSearch={onSearch}
      onFilter={onFilter}
      placeholder="Search Mars rover photos..."
      filters={allFilters}
      className={className}
    />
  )
}

function AsteroidSearch({ onSearch, onFilter, className = '' }) {
  const filters = [
    { id: 'hazardous', label: 'Potentially Hazardous' },
    { id: 'large', label: 'Large Objects (>1km)' },
    { id: 'close', label: 'Close Approaches' },
    { id: 'fast', label: 'High Velocity' },
    { id: 'today', label: 'Today Only' }
  ]

  return (
    <SearchFilter
      onSearch={onSearch}
      onFilter={onFilter}
      placeholder="Search asteroids by name or designation..."
      filters={filters}
      className={className}
    />
  )
}

SearchFilter.APOD = APODSearch
SearchFilter.MarsRover = MarsRoverSearch
SearchFilter.Asteroid = AsteroidSearch

export default SearchFilter