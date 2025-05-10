import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation } from 'lucide-react'

interface Amenity {
    id: string; // Changed to string to accommodate future IDs
    index: number;
    name: string;
    address: string;
    distance: string;
    isOpen: boolean;
}

interface AmenityListProps {
    responseText: string;
}

export function AmenityList({ responseText }: AmenityListProps) {
    // Parse the response text into structured data
    const parseResponse = (text: string): { title: string; amenities: Amenity[] } => {
        try {
            // Extract the title (first line)
            const lines = text.trim().split("\n");
            const title = lines[0];
            const amenities: Amenity[] = [];

            // Process each line after the title and empty line
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Extract the index number at the beginning (e.g., "1.")
                const indexMatch = line.match(/^(\d+)\./);
                if (!indexMatch) continue;

                const index = parseInt(indexMatch[1]);

                // Remove the index from the beginning
                let remaining = line.substring(indexMatch[0].length).trim();

                // Split by the distance pattern
                const distanceMatch = remaining.match(/$$([0-9.]+)\s*km\s*away$$/);
                if (!distanceMatch) continue;

                const distance = distanceMatch[0];
                const parts = remaining.split(distance);

                // The first part contains name and address
                const nameAddressPart = parts[0].trim();

                // The second part contains the open status
                const isOpen = parts[1].includes("✅ Open Now");

                // Split name and address by the first " - "
                const nameAddressSplit = nameAddressPart.split(" - ");
                const name = nameAddressSplit[0].trim();
                const address = nameAddressSplit.length > 1 ? nameAddressSplit[1].trim() : "";

                amenities.push({
                    id: `temp-id-${index}`, // Placeholder for future real IDs
                    index,
                    name,
                    address,
                    distance: distanceMatch[1] + " km",
                    isOpen
                });
            }

            return { title, amenities };
        } catch (error) {
            console.error("Error parsing response:", error);
            return { title: "Results", amenities: [] };
        }
    };

    const { title, amenities } = parseResponse(responseText);

    if (amenities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">No results found or unable to parse the response.</div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="grid gap-3">
                {amenities.map((amenity) => (
                    <AmenityCard key={amenity.id} amenity={amenity} />
                ))}
            </div>
        </div>
    );
}

function AmenityCard({ amenity }: { amenity: Amenity }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">{amenity.name}</h3>
                            <Badge variant={amenity.isOpen ? "success" : "outline"} className="ml-2">
                                {amenity.isOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>

                        {amenity.address && (
                            <div className="flex items-start gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{amenity.address}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1 text-sm">
                            <Navigation className="h-3 w-3 text-blue-500" />
                            <span>{amenity.distance} away</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
