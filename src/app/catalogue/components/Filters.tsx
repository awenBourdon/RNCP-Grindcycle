'use client'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type React from 'react'

type FiltersProps = {
  filters: {
    types: string[]
  }
  handleTypeChange: (type: string) => void
  handlePriceChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void
  resetFilters: () => void
  priceRangeValues: [number, number]
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  handleTypeChange,
  handlePriceChange,
  resetFilters,
  priceRangeValues,
}) => {
  const [openMenu, setOpenMenu] = useState<'type' | 'price' | 'size' | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = (key: 'type' | 'price') => {
    setOpenMenu((prev) => (prev === key ? null : key))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (!containerRef.current?.contains(target)) {
        setOpenMenu(null)
        return
      }

      const clickedInteractive = (target as HTMLElement).closest(
        'button, .dropdown'
      )
      if (!clickedInteractive) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="py-8 border-b border-gray-200">
      <div className="flex flex-wrap justify-center md:justify-between gap-4 relative">
        <div className="flex flex-wrap gap-3 md:flex-nowrap">
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => toggleDropdown('type')}
              className="flex items-center justify-between w-full md:w-48 px-4 py-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <span>Type de planche</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openMenu === 'type' ? 'rotate-180' : ''}`}
              />
            </button>
            {openMenu === 'type' && (
              <div className="dropdown absolute left-0 top-full mt-2 w-full md:w-48 bg-white border border-gray-200 rounded-md z-50 shadow-sm">
                {['skate', 'cruiser', 'long'].map((type) => (
                  <label
                    key={type}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type)}
                      onChange={() => handleTypeChange(type)}
                      className="mr-3 h-4 w-4 accent-[#0a3d3f]"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full md:w-auto">
            <button
              onClick={() => toggleDropdown('price')}
              className="flex items-center justify-between w-full md:w-48 px-4 py-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <span>Prix (€)</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openMenu === 'price' ? 'rotate-180' : ''}`}
              />
            </button>
            {openMenu === 'price' && (
              <div className="dropdown absolute left-0 top-full mt-2 w-full md:w-48 bg-white border border-gray-200 rounded-md z-50 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={priceRangeValues[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-[35%] p-2 border border-gray-200 rounded text-center"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={priceRangeValues[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-[35%] p-2 border border-gray-200 rounded text-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="px-4 py-3 cursor-pointer mt-4 md:mt-0 md:ml-4 text-[#0a3d3f] border border-[#0a3d3f] rounded-md hover:bg-[#0a3d3f] hover:text-white transition-colors"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

export default Filters
