"use client"

import { MapPin, Clock, Star, MapIcon, Info, Building } from "lucide-react"

type AmenityCardProps = {
  metadata
}

export default function AmenityCard({
                                     metadata
                                    }: AmenityCardProps) {
  return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="flex items-start mb-3">
          <Building className="h-6 w-6 mr-3 text-[#CF0039] flex-shrink-0" />
          {metadata}
        </div>
      </div>
  )
}
