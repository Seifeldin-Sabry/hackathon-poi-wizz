"use client"

import { MapPin, Clock, Star, MapIcon, Info, Building } from "lucide-react"

type AmenityCardProps = {
  name: string
  type: string
  distance: string
  openingHours: string
  address?: string
  specialTag?: string
  isOpen?: boolean
  onShowOnMapClick: () => void
  onMoreInfoClick?: () => void
}

export default function AmenityCard({
                                      name,
                                      type,
                                      distance,
                                      openingHours,
                                      address,
                                      specialTag,
                                      isOpen,
                                      onShowOnMapClick,
                                      onMoreInfoClick,
                                    }: AmenityCardProps) {
  return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="flex items-start mb-3">
          <Building className="h-6 w-6 mr-3 text-[#CF0039] flex-shrink-0" />
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
        </div>

        <div className="space-y-2 mb-4 pl-9">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{distance}</span>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className={`${isOpen ? "text-green-600" : "text-red-600"}`}>{openingHours}</span>
          </div>

          {address && (
              <div className="flex items-start text-sm text-gray-500">
                <MapIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
          )}

          {specialTag && (
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <Star className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{specialTag}</span>
              </div>
          )}
        </div>

        <div className="flex space-x-2 mt-3">
          <button
              onClick={onShowOnMapClick}
              className="bg-[#CF0039] text-white px-3 py-2 rounded-md text-sm hover:bg-[#B8003A] transition-colors flex items-center"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Show on Map
          </button>

          {onMoreInfoClick && (
              <button
                  onClick={onMoreInfoClick}
                  className="text-[#CF0039] border border-[#CF0039] px-3 py-2 rounded-md text-sm hover:bg-[#CF0039] hover:text-white transition-colors flex items-center"
              >
                <Info className="h-4 w-4 mr-1" />
                More Info
              </button>
          )}
        </div>
      </div>
  )
}
