"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AmenityCard from "@/components/amenity-card"
import LocationPermissionAlert from "@/components/location-permission-alert"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useUserLocation } from "@/hooks/use-user-location"

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

type DistanceOption = "1km" | "3km" | "5km" | "all"

// Medical type display names
const medicalTypeLabels: Record<MedicalType, string> = {
  baby_hatch: "Baby Hatch",
  clinic: "Clinic",
  dentist: "Dentist",
  doctors: "Doctor",
  hospital: "Hospital",
  nursing_home: "Nursing Home",
  pharmacy: "Pharmacy",
  veterinary: "Veterinary",
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export default function BrowseAmenitiesPage() {
  // Get user location from custom hook
  const {
    location: userLocation,
    isLoading: isLocationLoading,
    error: locationError,
    permissionState,
    requestLocation,
  } = useUserLocation()

  // State variables
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<MedicalType[]>([])
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch amenities when we have location data
  useEffect(() => {
    // Only fetch amenities if we have a valid location
    if (userLocation && permissionState === "granted" && !isLocationLoading) {
      fetchAmenities()
    }
  }, [userLocation, isLocationLoading, permissionState])

  // Simulate API call to fetch amenities
  const fetchAmenities = async () => {
    if (!userLocation) return // Safety check

    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock data for amenities (without distance - we'll calculate it based on user location)
    const mockAmenitiesData = [
      {
        id: "1",
        name: "University Hospital Antwerp",
        type: "medical",
        medicalType: "hospital" as MedicalType,
        openingHours: "Now Open (24/7)",
        address: "Wilrijkstraat 10, 2650 Edegem",
        specialTag: "Wheelchair Accessible: Yes",
        isOpen: true,
        location: { lat: 51.1561, lon: 4.4297 },
      },
      {
        id: "2",
        name: "Central Pharmacy",
        type: "medical",
        medicalType: "pharmacy" as MedicalType,
        openingHours: "Open until 18:00",
        address: "Meir 12, 2000 Antwerp",
        isOpen: true,
        location: { lat: 51.2204, lon: 4.4051 },
      },
      {
        id: "3",
        name: "Dr. Janssens Family Practice",
        type: "medical",
        medicalType: "doctors" as MedicalType,
        openingHours: "Closed, opens tomorrow at 09:00",
        address: "Nationalestraat 55, 2000 Antwerp",
        specialTag: "House Calls: Yes",
        isOpen: false,
        location: { lat: 51.2154, lon: 4.3995 },
      },
      {
        id: "4",
        name: "Smile Dental Practice",
        type: "medical",
        medicalType: "dentist" as MedicalType,
        openingHours: "Open until 17:30",
        address: "Groenplaats 33, 2000 Antwerp",
        isOpen: true,
        location: { lat: 51.2184, lon: 4.3995 },
      },
      {
        id: "5",
        name: "North Medical Center",
        type: "medical",
        medicalType: "clinic" as MedicalType,
        openingHours: "Open until 20:00",
        address: "Noorderlaan 120, 2030 Antwerp",
        specialTag: "Walk-in Appointments: Yes",
        isOpen: true,
        location: { lat: 51.2394, lon: 4.4225 },
      },
      {
        id: "6",
        name: "The Haven Care Home",
        type: "medical",
        medicalType: "nursing_home" as MedicalType,
        openingHours: "Open (24/7)",
        address: "Havenstraat 45, 2000 Antwerp",
        specialTag: "Palliative Care: Yes",
        isOpen: true,
        location: { lat: 51.2394, lon: 4.3825 },
      },
      {
        id: "7",
        name: "Paws Veterinary Clinic",
        type: "medical",
        medicalType: "veterinary" as MedicalType,
        openingHours: "Open until 19:00",
        address: "Dierenstraat 12, 2060 Antwerp",
        isOpen: true,
        location: { lat: 51.2294, lon: 4.4325 },
      },
      {
        id: "8",
        name: "Antwerp Baby Hatch",
        type: "medical",
        medicalType: "baby_hatch" as MedicalType,
        openingHours: "Open (24/7)",
        address: "Zorgstraat 10, 2000 Antwerp",
        specialTag: "Anonymous: Yes",
        isOpen: true,
        location: { lat: 51.2094, lon: 4.4125 },
      },
      {
        id: "9",
        name: "Dr. Peeters Family Practice",
        type: "medical",
        medicalType: "doctors" as MedicalType,
        openingHours: "Open until 16:30",
        address: "Kerkstraat 78, 2060 Antwerp",
        isOpen: true,
        location: { lat: 51.2294, lon: 4.4025 },
      },
      {
        id: "10",
        name: "South Pharmacy",
        type: "medical",
        medicalType: "pharmacy" as MedicalType,
        openingHours: "Open until 18:30",
        address: "Zuidstraat 22, 2000 Antwerp",
        isOpen: true,
        location: { lat: 51.1994, lon: 4.3925 },
      },
    ]

    // Calculate distances based on user location
    const amenitiesWithDistance = mockAmenitiesData.map((amenity) => {
      const distanceValue = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          amenity.location.lat,
          amenity.location.lon,
      )
      return {
        ...amenity,
        distance: `${distanceValue} km`,
        distanceValue,
      }
    })

    // Sort by distance
    const sortedAmenities = amenitiesWithDistance.sort((a, b) => a.distanceValue - b.distanceValue)

    setAllAmenities(sortedAmenities)
    setFilteredAmenities(sortedAmenities)
    setIsLoading(false)
  }

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

  // Check if location permission is granted
  const isLocationGranted = permissionState === "granted" && userLocation !== null

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Full-page blocking message when location permission is not granted */}
        {!isLocationGranted ? (
            <div className="min-h-screen flex items-center justify-center p-4">
              {isLocationLoading ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-[#CF0039] animate-spin mb-4" />
                    <p className="text-lg text-gray-600">Determining location...</p>
                  </div>
              ) : (
                  <LocationPermissionAlert
                      permissionState={permissionState}
                      error={locationError}
                      onRetry={requestLocation}
                      isFullPage={true}
                  />
              )}
            </div>
        ) : (
            // Main content - only shown when location permission is granted
            <div className="container mx-auto px-4 py-6 max-w-5xl">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Find Medical Facilities in Antwerp
              </h1>

              {/* Filter Section */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Search by name, address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Facility type</h3>
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

                  {/* Distance Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Distance</h3>
                    <div className="w-full max-w-xs">
                      <Select
                          value={selectedDistance}
                          onValueChange={(value) => setSelectedDistance(value as DistanceOption)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1km">Within 1 km</SelectItem>
                          <SelectItem value="3km">Within 3 km</SelectItem>
                          <SelectItem value="5km">Within 5 km</SelectItem>
                          <SelectItem value="all">All distances</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin size={16} className="mr-1" />
                      <span>Using your current location</span>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Results</h2>
                    {!isLoading && (
                        <span className="text-sm text-gray-500">{filteredAmenities.length} facilities found</span>
                    )}
                  </div>

                  {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-[#CF0039] animate-spin mb-2" />
                        <p className="text-gray-600">Loading facilities...</p>
                      </div>
                  ) : filteredAmenities.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No facilities found matching your criteria.</p>
                        <Button
                            variant="outline"
                            className="mt-4 border-[#CF0039] text-[#CF0039] hover:bg-[#CF0039] hover:text-white"
                            onClick={() => {
                              setSearchTerm("")
                              setSelectedTypes([])
                              setSelectedDistance("all")
                            }}
                        >
                          Clear Filters
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
                  ) }
                </div>
              </div>
              )
            </div>
        )}
        </div>
    )
}
