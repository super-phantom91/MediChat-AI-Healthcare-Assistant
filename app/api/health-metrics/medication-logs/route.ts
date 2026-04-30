import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { MedicationLog } from "@/lib/health-models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const medicationId = searchParams.get('medicationId')
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const query: any = {
      userId: session.user?.email,
      scheduledTime: { $gte: startDate }
    }

    if (medicationId) {
      query.medicationId = medicationId
    }

    const logs = await MedicationLog.find(query)
      .sort({ scheduledTime: -1 })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Medication logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch medication logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { medicationId, medicationName, dosage, scheduledTime, actualTime, status, notes } = await request.json()

    if (!medicationId || !medicationName || !dosage || !scheduledTime) {
      return NextResponse.json({ error: "Medication ID, name, dosage, and scheduled time are required" }, { status: 400 })
    }

    await connectToDatabase()

    const log = new MedicationLog({
      userId: session.user?.email,
      medicationId,
      medicationName,
      dosage,
      scheduledTime: new Date(scheduledTime),
      actualTime: actualTime ? new Date(actualTime) : new Date(),
      status: status || 'taken',
      notes
    })

    await log.save()

    return NextResponse.json({ log })
  } catch (error) {
    console.error("Medication log save error:", error)
    return NextResponse.json({ error: "Failed to save medication log" }, { status: 500 })
  }
}
