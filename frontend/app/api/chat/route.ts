import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json()

        // Forward the request to the FastAPI endpoint
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`FastAPI responded with status: ${response.status}`)
        }

        // Return the FastAPI response
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error forwarding request to FastAPI:", error)
        return NextResponse.json({ reply: "Sorry, there was an error connecting to the service." }, { status: 500 })
    }
}
