import type { Metadata } from 'next'
import './globals.css'
import {Button} from "@/components/ui/button";
import {List} from "lucide-react";
import Link from "next/link";
import type React from "react";

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
      {children}
      </body>
    </html>
  )
}
