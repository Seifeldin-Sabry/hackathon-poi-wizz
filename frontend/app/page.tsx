"use client"

import type React from "react"

import { useState } from "react"
import AmenityCard from "@/components/amenity-card"
import { Search, Loader2, MapPin } from "lucide-react"
import { useUserLocation } from "@/hooks/use-user-location"
import LocationPermissionAlert from "@/components/location-permission-alert"

// Types for our amenity data
type Amenity = {
  id: string
  name: string
  type: string
  distance: string
  openingHours: string
  address?: string
  specialTag?: string
  isOpen?: boolean
}

export default function ChatPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  // Get user location from custom hook
  const {
    location: userLocation,
    isLoading: isLocationLoading,
    error: locationError,
    permissionState,
    requestLocation,
  } = useUserLocation()

  // Simulated search function
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm.trim()) return

    setIsLoading(true)

    // Simulate API call with setTimeout
    // In a real implementation, we would send userLocation to the backend
    setTimeout(() => {
      console.log("Searching with location:", userLocation)

      // Mock data for amenities
      const mockAmenities: Amenity[] = [
        {
          id: "1",
          name: "Universitair Ziekenhuis Antwerpen",
          type: "medical",
          distance: `${calculateDistance(userLocation.lat, userLocation.lon, 51.1561, 4.4297)} km`,
          openingHours: "Nu Open (24/7)",
          address: "Wilrijkstraat 10, 2650 Edegem",
          specialTag: "Rolstoeltoegankelijk: Ja",
          isOpen: true,
        },
        {
          id: "2",
          name: "Apotheek Centrum",
          type: "medical",
          distance: `${calculateDistance(userLocation.lat, userLocation.lon, 51.2204, 4.4051)} km`,
          openingHours: "Open tot 18:00",
          address: "Meir 12, 2000 Antwerpen",
          isOpen: true,
        },
        {
          id: "3",
          name: "Huisarts Dr. Janssens",
          type: "medical",
          distance: `${calculateDistance(userLocation.lat, userLocation.lon, 51.2154, 4.3995)} km`,
          openingHours: "Gesloten, opent morgen om 09:00",
          address: "Nationalestraat 55, 2000 Antwerpen",
          specialTag: "Huisbezoeken: Ja",
          isOpen: false,
        },
        {
          id: "4",
          name: "Tandartspraktijk Smile",
          type: "medical",
          distance: `${calculateDistance(userLocation.lat, userLocation.lon, 51.2184, 4.3995)} km`,
          openingHours: "Open tot 17:30",
          address: "Groenplaats 33, 2000 Antwerpen",
          isOpen: true,
        },
        {
          id: "5",
          name: "Medisch Centrum Noord",
          type: "medical",
          distance: `${calculateDistance(userLocation.lat, userLocation.lon, 51.2394, 4.4225)} km`,
          openingHours: "Open tot 20:00",
          address: "Noorderlaan 120, 2030 Antwerpen",
          specialTag: "Afspraken zonder verwijzing: Ja",
          isOpen: true,
        },
      ]

      // Sort by distance (convert string "X.X km" to number for sorting)
      const sortedAmenities = [...mockAmenities].sort((a, b) => {
        const distA = Number.parseFloat(a.distance.split(" ")[0])
        const distB = Number.parseFloat(b.distance.split(" ")[0])
        return distA - distB
      })

      setAmenities(sortedAmenities.slice(0, 5))
      setTotalResults(8) // Pretend there are 8 total results
      setIsLoading(false)
      setHasSearched(true)
    }, 1500)
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

  const handleShowOnMap = (id: string) => {
    alert(`TODO: Show amenity ${id} on map`)
  }

  const handleMoreInfo = (id: string) => {
    alert(`TODO: Show more info for amenity ${id}`)
  }

  const handleShowAllResults = () => {
    alert(`TODO: Navigate to full results page with ${totalResults} results`)
  }

  // Check if we should disable the UI due to denied permission
  // We'll allow the app to function with default location
  const isSearchDisabled = isLocationLoading

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Location Permission Alert */}
      <div className="p-4">
        <LocationPermissionAlert permissionState={permissionState} error={locationError} onRetry={requestLocation} />
      </div>

      {!hasSearched ? (
        // Initial centered layout
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Welkom bij de Medische Voorzieningen Zoeker</h1>
            <p className="text-lg text-gray-600 mb-2">Waarmee kan ik je helpen in Antwerpen?</p>
            <p className="text-md text-gray-500">
              Zoek een dokter, apotheek, ziekenhuis, of andere medische voorziening.
            </p>
            {isLocationLoading ? (
              <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Uw locatie bepalen...</span>
              </div>
            ) : permissionState === "denied" ? (
              <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Standaard locatie: Centrum Antwerpen</span>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Typ je vraag hier... (bijv. 'ziekenhuis in centrum')"
                className="flex-grow p-3 border border-gray-400 rounded-l-lg focus:ring-2 focus:ring-[#CF0039] focus:border-transparent outline-none"
                disabled={isSearchDisabled}
              />
              <button
                type="submit"
                className={`bg-[#CF0039] text-white px-4 py-3 rounded-r-lg transition-colors flex items-center ${
                  isSearchDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#B8003A]"
                }`}
                disabled={isSearchDisabled}
              >
                {isLocationLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                    <span>Laden...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-1" />
                    <span>Zoek</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Layout after search
        <>
          {/* Results area */}
          <div className="flex-grow overflow-y-auto p-4 pb-24">
            {isLoading ? (
              <p className="text-center text-gray-600 mt-8">Aan het zoeken naar medische voorzieningen...</p>
            ) : amenities.length === 0 ? (
              <p className="text-center text-gray-600 mt-8">
                Geen resultaten gevonden voor '{searchTerm}'. Probeer iets anders?
              </p>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Gevonden voor jou (top 5):</h2>
                <div className="space-y-4">
                  {amenities.map((amenity) => (
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

                {totalResults > amenities.length && (
                  <button onClick={handleShowAllResults} className="mt-4 text-[#CF0039] hover:underline font-medium">
                    Toon alle {totalResults} resultaten...
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fixed chat input at bottom */}
          <div className="p-4 bg-gray-100 border-t border-gray-300 fixed bottom-0 left-0 right-0">
            <form onSubmit={handleSearch} className="flex space-x-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Typ je vraag hier... (bijv. 'ziekenhuis in centrum')"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF0039] focus:border-transparent outline-none"
                disabled={isLoading || isSearchDisabled}
              />
              <button
                type="submit"
                className="bg-[#CF0039] text-white px-4 py-3 rounded-lg hover:bg-[#B8003A] transition-colors flex items-center"
                disabled={isLoading || isSearchDisabled}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                    Zoeken...
                  </span>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-1" />
                    <span>Zoek</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
