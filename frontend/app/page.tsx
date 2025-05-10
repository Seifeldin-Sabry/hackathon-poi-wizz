"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, MapPin, Send, AlertTriangle, Info } from "lucide-react"
import { AmenityList } from "@/components/amenity-list"
import Link from "next/link";

export default function Home() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
    const [linkToAmenityList, setLinkToAmenityList] = useState("")
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationRequested, setLocationRequested] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for geolocation support and permissions on component mount
  useEffect(() => {
    checkGeolocationSupport()
    return () => {
      // Clear any pending timeouts when component unmounts
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current)
      }
    }
  }, [])

  const checkGeolocationSupport = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setDebugInfo("Browser does not support Geolocation API")
      return false
    }

    // On Mac/Safari, we need to handle permissions differently
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permissionStatus) => {
            setDebugInfo(`Geolocation permission status: ${permissionStatus.state}`)

            if (permissionStatus.state === "granted") {
              getLocation()
            } else if (permissionStatus.state === "prompt") {
              // We'll wait for user to click the button
            } else if (permissionStatus.state === "denied") {
              setLocationError("Location access has been denied. Please enable it in your browser settings.")
            }

            // Listen for changes to permission state
            permissionStatus.onchange = () => {
              setDebugInfo(`Geolocation permission changed to: ${permissionStatus.state}`)
              if (permissionStatus.state === "granted") {
                getLocation()
              } else if (permissionStatus.state === "denied") {
                setLocationError("Location access has been denied. Please enable it in your browser settings.")
                setLocation(null)
              }
            }
          })
          .catch((error) => {
            // Safari on Mac might not support permissions API fully
            setDebugInfo(`Error checking permissions: ${error.message}. Trying direct geolocation request.`)
            // Try getting location directly
            getLocation()
          })
    } else {
      // Fallback for browsers that don't support the permissions API
      setDebugInfo("Permissions API not supported. Trying direct geolocation request.")
      getLocation()
    }

    return true
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setLocationRequested(true)
    setLocationError(null)
    setLoading(true)
    setDebugInfo("Requesting geolocation...")

    // Set a timeout for geolocation request (Safari on Mac can hang)
    locationTimeoutRef.current = setTimeout(() => {
      setLoading(false)
      setLocationError(
          "Geolocation request timed out. Safari on Mac may require enabling location services in System Preferences.",
      )
      setDebugInfo("Manual timeout triggered after 15 seconds")
    }, 15000)

    try {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            // Clear the timeout since we got a response
            if (locationTimeoutRef.current) {
              clearTimeout(locationTimeoutRef.current)
            }

            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            })
            setLoading(false)
            setDebugInfo(
                `Location obtained: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
            )
          },
          (error) => {
            // Clear the timeout since we got a response
            if (locationTimeoutRef.current) {
              clearTimeout(locationTimeoutRef.current)
            }

            setLoading(false)
            setDebugInfo(`Geolocation error: ${error.code} - ${error.message}`)

            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocationError(
                    "Location access was denied. On Mac, ensure location services are enabled in System Preferences → Security & Privacy → Privacy → Location Services.",
                )
                break
              case error.POSITION_UNAVAILABLE:
                setLocationError(
                    "Location information is unavailable. Try refreshing the page or check your internet connection.",
                )
                break
              case error.TIMEOUT:
                setLocationError(
                    "The request to get your location timed out. This can happen on Safari/Mac. Try using Chrome or Firefox.",
                )
                break
              default:
                setLocationError(
                    `An unknown error occurred (${error.code}). Try refreshing or using a different browser.`,
                )
                break
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
      )
    } catch (e) {
      // Clear the timeout if there's an exception
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current)
      }

      setLoading(false)
      setLocationError("An unexpected error occurred when trying to access your location.")
      setDebugInfo(`Exception in geolocation request: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Fallback to manual location input
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLat, setManualLat] = useState("")
  const [manualLon, setManualLon] = useState("")

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lat = Number.parseFloat(manualLat)
    const lon = Number.parseFloat(manualLon)

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setLocationError(
          "Please enter valid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
      )
      return
    }

    setLocation({ lat, lon })
    setLocationError(null)
    setDebugInfo(`Using manually entered location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return
    if (!location) {
      setLocationError("Location access is required to use this app")
      getLocation()
      return
    }

    setLoading(true)
    setResponse("")
    setHasSearched(true)
    setDebugInfo(`Sending request with location: ${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          user_lat: location.lat,
          user_lon: location.lon,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Response from server:", data.reply) // Log the response for debugging
      setResponse(data.reply)
      setLinkToAmenityList(data.link_to_amenities)
      setMessage("")
      setDebugInfo("Received response from server")
    } catch (error) {
      console.error("Error:", error)
      setResponse("Sorry, something went wrong. Please try again.")
      setDebugInfo(`Error in fetch: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
      <main className="container mx-auto py-10 px-4 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Location Finder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!location && (
                <div className="flex flex-col items-center gap-4">
                  {locationError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Location Required</AlertTitle>
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                  )}

                  <Button
                      onClick={getLocation}
                      disabled={loading}
                      variant={locationRequested && locationError ? "destructive" : "default"}
                      size="lg"
                      className="mt-2"
                  >
                    {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting location...
                        </>
                    ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          {locationRequested && locationError ? "Retry Location Access" : "Share your location to continue"}
                        </>
                    )}
                  </Button>

                  {locationRequested && locationError && (
                      <Button variant="outline" onClick={() => setShowManualInput(!showManualInput)} className="mt-2">
                        {showManualInput ? "Hide manual input" : "Enter location manually"}
                      </Button>
                  )}

                  {showManualInput && (
                      <form onSubmit={handleManualLocationSubmit} className="w-full max-w-md space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="latitude" className="text-sm font-medium">
                              Latitude
                            </label>
                            <Input
                                id="latitude"
                                type="text"
                                placeholder="e.g. 51.5074"
                                value={manualLat}
                                onChange={(e) => setManualLat(e.target.value)}
                                required
                            />
                          </div>
                          <div>
                            <label htmlFor="longitude" className="text-sm font-medium">
                              Longitude
                            </label>
                            <Input
                                id="longitude"
                                type="text"
                                placeholder="e.g. -0.1278"
                                value={manualLon}
                                onChange={(e) => setManualLon(e.target.value)}
                                required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          Use this location
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          You can find your coordinates using{" "}
                          <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="underline">
                            latlong.net
                          </a>{" "}
                          or Google Maps
                        </p>
                      </form>
                  )}

                  {!locationRequested && (
                      <p className="text-sm text-center text-muted-foreground mt-2">
                        This app requires your location to find nearby services
                      </p>
                  )}

                  {locationRequested && locationError && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Mac/Safari Users</AlertTitle>
                        <AlertDescription>
                          If you're using Safari on Mac, you may need to enable location services in System Preferences →
                          Security & Privacy → Privacy → Location Services, and ensure Safari is checked.
                        </AlertDescription>
                      </Alert>
                  )}
                </div>
            )}

            {location && (
                <div className="text-center text-sm text-muted-foreground mb-4">
                  <p className="flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Using location: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                  </p>
                </div>
            )}

            {loading && hasSearched && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Searching for locations...</p>
                </div>
            )}

            {response && !loading && (
                <div className="mt-4">
                  {response}
                </div>
            )}

            {linkToAmenityList && !loading && (
                <div className="mt-4">
                    <Link href={linkToAmenityList} target="_blank" className="text-blue-500 underline">
                        View nearby amenities
                    </Link>
                </div>
            )}

            {/* Debug information - uncomment during development */}
            {/* {debugInfo && (
            <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-700 font-mono">
              <p>Debug: {debugInfo}</p>
            </div>
          )} */}
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={location ? "Ask about hospitals, pharmacies, etc. nearby..." : "Location access required"}
                  disabled={loading || !location}
                  className={!location ? "bg-muted" : ""}
              />
              <Button type="submit" disabled={loading || !location}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
  )
}
