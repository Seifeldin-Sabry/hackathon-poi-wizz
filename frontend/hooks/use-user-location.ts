"use client"

import { useState, useEffect, useCallback } from "react"

// Type for location data
export type UserLocation = {
  lat: number
  lon: number
}

// Default location (Antwerp center)
const DEFAULT_LOCATION: UserLocation = { lat: 51.2194, lon: 4.4025 }

// Permission states
export type PermissionState = "prompt" | "granted" | "denied" | "unavailable"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDefaultLocation, setIsDefaultLocation] = useState(true)
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt")

  // Function to request location
  const requestLocation = useCallback(() => {
    setIsLoading(true)
    setError(null)

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is niet ondersteund door uw browser")
      setPermissionState("unavailable")
      setIsLoading(false)
      return
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setIsDefaultLocation(false)
        setPermissionState("granted")
        setIsLoading(false)
      },
      // Error callback
      (error) => {
        // Don't log permission denied as an error since it's an expected user choice
        if (error.code === 1) {
          // Permission denied - set state but don't log as error
          setError("Locatietoegang geweigerd")
          setPermissionState("denied")
        } else if (error.code === 2) {
          // Position unavailable
          console.error("Geolocation error:", error.message)
          setError("Uw locatie kon niet worden bepaald")
          setPermissionState("unavailable")
        } else {
          // Timeout or unknown error
          console.error("Geolocation error:", error.message)
          setError(`Kon uw locatie niet ophalen: ${error.message}`)
          setPermissionState("unavailable")
        }

        // Keep using default location
        setIsLoading(false)
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }, [])

  // Initial location request on component mount
  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return {
    location,
    isLoading,
    error,
    isDefaultLocation,
    permissionState,
    requestLocation,
  }
}
