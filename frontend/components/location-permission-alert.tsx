"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import type { PermissionState } from "@/hooks/use-user-location"

type LocationPermissionAlertProps = {
  permissionState: PermissionState
  error: string | null
  onRetry: () => void
}

export default function LocationPermissionAlert({ permissionState, error, onRetry }: LocationPermissionAlertProps) {
  if (permissionState === "granted") return null

  return (
    <Alert variant={permissionState === "denied" ? "default" : "destructive"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-medium">
        {permissionState === "denied" ? "Locatietoegang aanbevolen" : "Locatieprobleem"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {permissionState === "denied" ? (
          <div className="space-y-2">
            <p>
              Deze app werkt het beste met toegang tot uw locatie om nauwkeurige afstanden tot medische voorzieningen te
              berekenen. Momenteel wordt een standaard locatie (Centrum Antwerpen) gebruikt.
            </p>
            <div className="mt-2">
              <h4 className="font-medium mb-1">Locatietoegang inschakelen:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Klik op het slotpictogram in de adresbalk van uw browser</li>
                <li>Zoek naar "Locatie" of "Locatietoegang"</li>
                <li>Wijzig de instelling naar "Toestaan"</li>
                <li>Vernieuw de pagina of klik op de knop hieronder</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>{error || "Er is een probleem met het bepalen van uw locatie."}</p>
        )}

        <Button onClick={onRetry} variant="outline" size="sm" className="mt-3 bg-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Probeer opnieuw locatie te bepalen
        </Button>
      </AlertDescription>
    </Alert>
  )
}
