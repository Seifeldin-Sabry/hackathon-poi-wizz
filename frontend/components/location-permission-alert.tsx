"use client"

import { AlertCircle, MapPin, RefreshCw } from "lucide-react"
import type { PermissionState } from "@/hooks/use-user-location"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type LocationPermissionAlertProps = {
  permissionState: PermissionState
  error: string | null
  onRetry: () => void
  isFullPage?: boolean
}

export default function LocationPermissionAlert({
                                                  permissionState,
                                                  error,
                                                  onRetry,
                                                  isFullPage = false,
                                                }: LocationPermissionAlertProps) {
  if (permissionState === "granted") return null

  // For full-page blocking message
  if (isFullPage) {
    return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <MapPin className="h-16 w-16 text-[#CF0039] mb-4" />
            <h2 className="text-2xl font-bold mb-4">Location Access Required</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              This app needs access to your location to function. Without location access, we cannot find medical
              facilities in your area.
            </p>

            {error && (
                <Alert variant="destructive" className="mb-6 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mb-6">
              <h4 className="font-medium mb-2 text-left">Enable location access:</h4>
              <ul className="list-disc pl-5 text-sm space-y-2 text-left">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Look for "Location" or "Location access"</li>
                <li>Change the setting to "Allow"</li>
                <li>Refresh the page or click the button below</li>
              </ul>
            </div>

            <Button onClick={onRetry} className="bg-[#CF0039] hover:bg-[#B8003A] text-white px-8 py-2 text-lg" size="lg">
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
    )
  }

  // For inline alert (original behavior)
  return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-medium">Location Access Required</AlertTitle>
        <AlertDescription className="mt-2">
          <div className="space-y-2">
            <p>
              This app needs access to your location to find medical facilities in your area. Without location access, the
              app cannot function properly.
            </p>
            <div className="mt-2">
              <h4 className="font-medium mb-1">Enable location access:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Look for "Location" or "Location access"</li>
                <li>Change the setting to "Allow"</li>
                <li>Refresh the page or click the button below</li>
              </ul>
            </div>
          </div>

          <Button onClick={onRetry} variant="outline" size="sm" className="mt-3 bg-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try to determine location again
          </Button>
        </AlertDescription>
      </Alert>
  )
}
