import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Medication, MedicationLog } from "@/lib/health-models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const query: any = { userId: session.user?.email }
    if (activeOnly) {
      query.isActive = true
    }

    const medications = await Medication.find(query)
      .sort({ createdAt: -1 })

    return NextResponse.json({ medications })
  } catch (error) {
    console.error("Medications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, dosage, frequency, times, startDate, endDate, reminderEnabled, notes, prescribedBy, sideEffects } = await request.json()

    if (!name || !dosage || !frequency || !times || !startDate) {
      return NextResponse.json({ error: "Name, dosage, frequency, times, and start date are required" }, { status: 400 })
    }

    await connectToDatabase()

    const medication = new Medication({
      userId: session.user?.email,
      name,
      dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      reminderEnabled: reminderEnabled !== false,
      notes,
      prescribedBy,
      sideEffects: sideEffects || []
    })

    await medication.save()

    return NextResponse.json({ medication })
  } catch (error) {
    console.error("Medication save error:", error)
    return NextResponse.json({ error: "Failed to save medication" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Medication ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId: session.user?.email },
      updateData,
      { new: true }
    )

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ medication })
  } catch (error) {
    console.error("Medication update error:", error)
    return NextResponse.json({ error: "Failed to update medication" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Medication ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const result = await Medication.findOneAndDelete({
      _id: id,
      userId: session.user?.email
    })

    if (!result) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Medication delete error:", error)
    return NextResponse.json({ error: "Failed to delete medication" }, { status: 500 })
  }
}
