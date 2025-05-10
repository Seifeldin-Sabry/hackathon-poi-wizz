import { NextResponse } from 'next/server';

// Types
type MedicalType =
    | "baby_hatch"
    | "clinic"
    | "dentist"
    | "doctors"
    | "hospital"
    | "nursing_home"
    | "pharmacy"
    | "veterinary";

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Mock data for amenities (this would normally come from a database)
const mockAmenities = [
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
];

export async function GET(request: Request) {
    // Get URL and parse query parameters
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const amenityType = searchParams.get('amenity_type');

    // Filter and prepare amenities
    let amenities = [...mockAmenities];

    // Filter by amenity type if provided
    if (amenityType && amenityType !== 'all') {
        amenities = amenities.filter(amenity => amenity.medicalType === amenityType);
    }

    // Add distance to each amenity
    if (lat && lon) {
        amenities = amenities.map(amenity => {
            const distanceValue = calculateDistance(
                lat,
                lon,
                amenity.location.lat,
                amenity.location.lon
            );

            return {
                ...amenity,
                distance: `${distanceValue} km`,
                distanceValue
            };
        });

        // Sort by distance
        amenities = amenities.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    // Add a small delay to simulate network latency (for dev purposes)
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(amenities);
}