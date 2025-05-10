"use client"

import { useState, useEffect, useCallback } from "react"

// Type for location data
export type UserLocation = {
  lat: number
  lon: number
}

// Permission states
export type PermissionState = "prompt" | "granted" | "denied" | "unavailable"

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt")

  // Function to request location
  const requestLocation = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setPermissionState("prompt")

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is niet ondersteund door uw browser")
      setPermissionState("unavailable")
      setLocation(null) // No location when unavailable
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
          setPermissionState("granted")
          setIsLoading(false)
        },
        // Error callback
        (error) => {
          // Don't log permission denied as an error since it's an expected user choice
          if (error.code === 1) {
            // Permission denied
            setError("Location access denied")
            setPermissionState("denied")
          } else if (error.code === 2) {
            // Position unavailable
            console.error("Geolocation error:", error.message)
            setError("Your location could not be determined")
            setPermissionState("unavailable")
          } else {
            // Timeout or unknown error
            console.error("Geolocation error:", error.message)
            setError(`Could not retrieve your location: ${error.message}`)
            setPermissionState("unavailable")
          }

          // No default location - set to null when permission is not granted
          setLocation(null)
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
    permissionState,
    requestLocation,
  }
}
