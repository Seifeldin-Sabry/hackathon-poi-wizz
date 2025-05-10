"use client"

import { MapPin, Clock, MapIcon, Info, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

type AmenityCardProps = {
    name: string
    type: string
    distance: string
    openingHours: string
    address: string
    specialTag?: string
    isOpen: boolean
    onShowOnMapClick: () => void
    onMoreInfoClick: () => void
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
                                        onMoreInfoClick
                                    }: AmenityCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div className="flex items-start mb-3">
                <Building className="h-6 w-6 mr-3 text-[#CF0039] flex-shrink-0" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg text-gray-900">{name}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{distance}</span>
                    </div>

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                        <MapPin size={16} className="mr-1 flex-shrink-0" />
                        <span>{address}</span>
                    </div>

                    <div className="mt-2 flex items-center">
                        <Clock size={16} className="mr-1 flex-shrink-0" />
                        <span className={`text-sm ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
              {openingHours}
            </span>
                    </div>

                    {specialTag && (
                        <div className="mt-2">
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                {specialTag}
              </span>
                        </div>
                    )}

                    <div className="mt-3 flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-gray-700"
                            onClick={onShowOnMapClick}
                        >
                            <MapIcon size={16} className="mr-1" />
                            Map
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-gray-700"
                            onClick={onMoreInfoClick}
                        >
                            <Info size={16} className="mr-1" />
                            More Info
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}