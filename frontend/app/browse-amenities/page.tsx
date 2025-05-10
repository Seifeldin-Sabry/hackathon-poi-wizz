"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AmenityCard from "@/components/amenity-card"
import { Search, MapPin, Loader2 } from "lucide-react"

// Types
type Amenity = {
  id: string
  name: string
  type: string
  medicalType: MedicalType
  distance: string
  distanceValue: number // in kilometers
  openingHours: string
  address: string
  specialTag?: string
  isOpen?: boolean
  location: {
    lat: number
    lon: number
  }
}

type MedicalType =
  | "baby_hatch"
  | "clinic"
  | "dentist"
  | "doctors"
  | "hospital"
  | "nursing_home"
  | "pharmacy"
  | "veterinary"

type UserLocation = {
  lat: number
  lon: number
}

type DistanceOption = "1km" | "3km" | "5km" | "all"

// Medical type display names
const medicalTypeLabels: Record<MedicalType, string> = {
  baby_hatch: "Vondelingenschuif",
  clinic: "Kliniek",
  dentist: "Tandarts",
  doctors: "Huisarts",
  hospital: "Ziekenhuis",
  nursing_home: "Woonzorgcentrum",
  pharmacy: "Apotheek",
  veterinary: "Dierenarts",
}

export default function BrowseAmenitiesPage() {
  // State variables
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<MedicalType[]>([])
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>("all")
  const [userLocation, setUserLocation] = useState<UserLocation>({ lat: 51.2194, lon: 4.4025 }) // Antwerp center
  const [isLoading, setIsLoading] = useState(true)

  // Fetch amenities on page load
  useEffect(() => {
    // Simulate API call to fetch amenities
    const fetchAmenities = async () => {
      setIsLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock data for amenities
      const mockAmenities: Amenity[] = [
        {
          id: "1",
          name: "Universitair Ziekenhuis Antwerpen",
          type: "medical",
          medicalType: "hospital",
          distance: "1.2 km",
          distanceValue: 1.2,
          openingHours: "Nu Open (24/7)",
          address: "Wilrijkstraat 10, 2650 Edegem",
          specialTag: "Rolstoeltoegankelijk: Ja",
          isOpen: true,
          location: { lat: 51.1561, lon: 4.4297 },
        },
        {
          id: "2",
          name: "Apotheek Centrum",
          type: "medical",
          medicalType: "pharmacy",
          distance: "0.5 km",
          distanceValue: 0.5,
          openingHours: "Open tot 18:00",
          address: "Meir 12, 2000 Antwerpen",
          isOpen: true,
          location: { lat: 51.2204, lon: 4.4051 },
        },
        {
          id: "3",
          name: "Huisarts Dr. Janssens",
          type: "medical",
          medicalType: "doctors",
          distance: "0.8 km",
          distanceValue: 0.8,
          openingHours: "Gesloten, opent morgen om 09:00",
          address: "Nationalestraat 55, 2000 Antwerpen",
          specialTag: "Huisbezoeken: Ja",
          isOpen: false,
          location: { lat: 51.2154, lon: 4.3995 },
        },
        {
          id: "4",
          name: "Tandartspraktijk Smile",
          type: "medical",
          medicalType: "dentist",
          distance: "1.5 km",
          distanceValue: 1.5,
          openingHours: "Open tot 17:30",
          address: "Groenplaats 33, 2000 Antwerpen",
          isOpen: true,
          location: { lat: 51.2184, lon: 4.3995 },
        },
        {
          id: "5",
          name: "Medisch Centrum Noord",
          type: "medical",
          medicalType: "clinic",
          distance: "2.3 km",
          distanceValue: 2.3,
          openingHours: "Open tot 20:00",
          address: "Noorderlaan 120, 2030 Antwerpen",
          specialTag: "Afspraken zonder verwijzing: Ja",
          isOpen: true,
          location: { lat: 51.2394, lon: 4.4225 },
        },
        {
          id: "6",
          name: "Woonzorgcentrum De Haven",
          type: "medical",
          medicalType: "nursing_home",
          distance: "3.2 km",
          distanceValue: 3.2,
          openingHours: "Open (24/7)",
          address: "Havenstraat 45, 2000 Antwerpen",
          specialTag: "Palliatieve zorg: Ja",
          isOpen: true,
          location: { lat: 51.2394, lon: 4.3825 },
        },
        {
          id: "7",
          name: "Dierenarts Pootjes",
          type: "medical",
          medicalType: "veterinary",
          distance: "4.1 km",
          distanceValue: 4.1,
          openingHours: "Open tot 19:00",
          address: "Dierenstraat 12, 2060 Antwerpen",
          isOpen: true,
          location: { lat: 51.2294, lon: 4.4325 },
        },
        {
          id: "8",
          name: "Vondelingenschuif Antwerpen",
          type: "medical",
          medicalType: "baby_hatch",
          distance: "2.8 km",
          distanceValue: 2.8,
          openingHours: "Open (24/7)",
          address: "Zorgstraat 10, 2000 Antwerpen",
          specialTag: "Anoniem: Ja",
          isOpen: true,
          location: { lat: 51.2094, lon: 4.4125 },
        },
        {
          id: "9",
          name: "Huisarts Dr. Peeters",
          type: "medical",
          medicalType: "doctors",
          distance: "1.9 km",
          distanceValue: 1.9,
          openingHours: "Open tot 16:30",
          address: "Kerkstraat 78, 2060 Antwerpen",
          isOpen: true,
          location: { lat: 51.2294, lon: 4.4025 },
        },
        {
          id: "10",
          name: "Apotheek Zuid",
          type: "medical",
          medicalType: "pharmacy",
          distance: "2.5 km",
          distanceValue: 2.5,
          openingHours: "Open tot 18:30",
          address: "Zuidstraat 22, 2000 Antwerpen",
          isOpen: true,
          location: { lat: 51.1994, lon: 4.3925 },
        },
      ]

      setAllAmenities(mockAmenities)
      setFilteredAmenities(mockAmenities)
      setIsLoading(false)
    }

    fetchAmenities()
  }, [])

  // Apply filters whenever filter values change
  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedTypes, selectedDistance])

  // Filter logic
  const applyFilters = () => {
    let filtered = [...allAmenities]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (amenity) => amenity.name.toLowerCase().includes(term) || amenity.address.toLowerCase().includes(term),
      )
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((amenity) => selectedTypes.includes(amenity.medicalType))
    }

    // Filter by distance
    if (selectedDistance !== "all") {
      const maxDistance = Number.parseInt(selectedDistance.replace("km", ""))
      filtered = filtered.filter((amenity) => amenity.distanceValue <= maxDistance)
    }

    setFilteredAmenities(filtered)
  }

  // Toggle type selection
  const toggleTypeSelection = (type: MedicalType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  // Handle map and info button clicks
  const handleShowOnMap = (id: string) => {
    alert(`TODO: Show amenity ${id} on map`)
  }

  const handleMoreInfo = (id: string) => {
    alert(`TODO: Show more info for amenity ${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Vind Medische Voorzieningen in Antwerpen</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Zoek op naam, adres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Type voorziening</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(medicalTypeLabels) as MedicalType[]).map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                className={
                  selectedTypes.includes(type)
                    ? "bg-[#CF0039] hover:bg-[#B8003A] text-white border-[#CF0039]"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }
                onClick={() => toggleTypeSelection(type)}
              >
                {medicalTypeLabels[type]}
              </Button>
            ))}
          </div>
        </div>

        {/* Distance Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Afstand</h3>
          <div className="w-full max-w-xs">
            <Select value={selectedDistance} onValueChange={(value) => setSelectedDistance(value as DistanceOption)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecteer afstand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1km">Binnen 1 km</SelectItem>
                <SelectItem value="3km">Binnen 3 km</SelectItem>
                <SelectItem value="5km">Binnen 5 km</SelectItem>
                <SelectItem value="all">Alle afstanden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPin size={16} className="mr-1" />
            <span>Uw locatie: Centrum Antwerpen</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Resultaten</h2>
          {!isLoading && (
            <span className="text-sm text-gray-500">{filteredAmenities.length} voorzieningen gevonden</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-[#CF0039] animate-spin mb-2" />
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : filteredAmenities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Geen voorzieningen gevonden die aan uw criteria voldoen.</p>
            <Button
              variant="outline"
              className="mt-4 border-[#CF0039] text-[#CF0039] hover:bg-[#CF0039] hover:text-white"
              onClick={() => {
                setSearchTerm("")
                setSelectedTypes([])
                setSelectedDistance("all")
              }}
            >
              Filters wissen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {filteredAmenities.map((amenity) => (
              <AmenityCard
                key={amenity.id}
                name={amenity.name}
                type={amenity.type}
                distance={amenity.distance}
                openingHours={amenity.openingHours}
                address={amenity.address}
                specialTag={amenity.specialTag}
                isOpen={amenity.isOpen}
                onShowOnMapClick={() => handleShowOnMap(amenity.id)}
                onMoreInfoClick={() => handleMoreInfo(amenity.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
