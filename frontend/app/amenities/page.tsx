"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AmenityCard from "@/components/amenity-card"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

// Types
type MedicalType =
    | "baby_hatch"
    | "clinic"
    | "dentist"
    | "doctors"
    | "hospital"
    | "nursing_home"
    | "pharmacy"
    | "veterinary"
    | "all"

type Amenity = {
  id: string
  name: string
  type: string
  medicalType: MedicalType
  openingHours: string
  address: string
  specialTag?: string
  isOpen: boolean
  distance: string
  distanceValue: number
  location: {
    lat: number
    lon: number
  }
}

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
  all: "All Types"
}

// Mock Pharmacy Data
const mockPharmacies: Amenity[] = [
  {
    id: "1",
    name: "Apotheek Cuypers",
    type: "amenity",
    medicalType: "pharmacy",
    openingHours: "TODO",
    address: "24, Putsebaan, De Hei, Zandvliet, Berendrecht-Zandvliet-Lillo, Antwerpen, 2040, België / Belgique / Belgien",
    isOpen: true,
    distance: "0.30 km",
    distanceValue: 0.30,
    location: {
      lat: 51.36,
      lon: 4.31,
    },
  },
  {
    id: "2",
    name: "Apotheek Suykerbuyk",
    type: "amenity",
    medicalType: "pharmacy",
    openingHours: "TODO",
    address: "105, Monnikenhofstraat, Viswater, Berendrecht, Berendrecht-Zandvliet-Lillo, Antwerpen, 2040, België / Belgique / Belgien",
    isOpen: true,
    distance: "1.60 km",
    distanceValue: 1.60,
    location: {
      lat: 51.35,
      lon: 4.30,
    },
  },
  {
    id: "3",
    name: "Apotheek Dons",
    type: "amenity",
    medicalType: "pharmacy",
    openingHours: "TODO",
    address: "179, Monnikenhofstraat, Viswater, Berendrecht, Berendrecht-Zandvliet-Lillo, Antwerpen, Vlaanderen, 2040, België / Belgique / Belgien",
    isOpen: true,
    distance: "1.75 km",
    distanceValue: 1.75,
    location: {
      lat: 51.34,
      lon: 4.29,
    },
  },
  {
    id: "4",
    name: "Apotheek Cuypers",
    type: "amenity",
    medicalType: "pharmacy",
    openingHours: "TODO",
    address: "152, Oorderseweg, Schoonbroek, Ekeren, Antwerpen, 2180, België / Belgique / Belgien",
    isOpen: true,
    distance: "11.06 km",
    distanceValue: 11.06,
    location: {
      lat: 51.28,
      lon: 4.44,
    },
  },
  {
    id: "5",
    name: "Pharma Force",
    type: "amenity",
    medicalType: "pharmacy",
    openingHours: "TODO",
    address: "80, Kloosterstraat, Schoonbroek, Ekeren-Centrum, Ekeren, Antwerpen, 2180, België / Belgique / Belgien",
    isOpen: true,
    distance: "11.28 km",
    distanceValue: 11.28,
    location: {
      lat: 51.27,
      lon: 4.45,
    },
  },
];


export default function BrowseAmenitiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State variables
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<MedicalType[]>([])
  const [selectedDistance, setSelectedDistance] = useState<DistanceOption>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Check for URL parameters on load
  useEffect(() => {
    const type = searchParams.get('amenity_type') as MedicalType | null

    if (type && type !== 'all') {
      setSelectedTypes([type])
    }
  }, [searchParams])

  useEffect(() => {
    // Simulate fetching amenities (replace with actual fetch when ready)
    const simulateFetch = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      setAllAmenities(mockPharmacies);
      setFilteredAmenities(mockPharmacies);
      setIsLoading(false);
    };

    simulateFetch();
  }, []);

  // Apply filters whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedTypes, selectedDistance, allAmenities]);

  // Filter logic
  const applyFilters = () => {
    let filtered = [...allAmenities];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
          (amenity) =>
              amenity.name.toLowerCase().includes(term) ||
              amenity.address.toLowerCase().includes(term)
      );
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((amenity) => selectedTypes.includes(amenity.medicalType));
    }

    // Filter by distance
    if (selectedDistance !== "all") {
      const maxDistance = Number.parseInt(selectedDistance.replace("km", ""));
      filtered = filtered.filter((amenity) => amenity.distanceValue <= maxDistance);
    }

    setFilteredAmenities(filtered);
  };

  // Toggle type selection
  const toggleTypeSelection = (type: MedicalType) => {
    // If this is the only selected type and user clicks it again, remove it
    if (selectedTypes.length === 1 && selectedTypes[0] === type) {
      setSelectedTypes([]);

      // Update URL to remove type filter
      generateLink();
      return;
    }

    // Otherwise set the type as the only selection
    setSelectedTypes([type]);

    // Update URL with the new type
    generateLink(type);
  };

  // Generate shareable link with current filters
  const generateLink = (amenityType: MedicalType = 'all') => {
    // We are faking the location, so we can hardcode some values if needed for the link
    const fakeLat = 51.2194; // Example latitude for Antwerp
    const fakeLon = 4.4025;  // Example longitude for Antwerp
    const url = `${window.location.origin}/amenities?lat=${fakeLat}&lon=${fakeLon}&amenity_type=${amenityType}`;

    // Update the URL without refreshing the page
    router.push(url, { scroll: false });

    return url;
  };

  // Handle map and info button clicks
  const handleShowOnMap = (id: string) => {
    alert(`TODO: Show amenity ${id} on map`);
  };

  const handleMoreInfo = (id: string) => {
    alert(`TODO: Show more info for amenity ${id}`);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Main content */}
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
                {(Object.keys(medicalTypeLabels) as MedicalType[])
                    .filter(type => type !== 'all')
                    .map((type) => (
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
                <span>Using a fixed location (mock)</span>
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
                        setSearchTerm("");
                        setSelectedTypes([]);
                        setSelectedDistance("all");
                        generateLink();
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
            )}
          </div>
        </div>
      </div>
  );
}