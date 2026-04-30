import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { BloodPressure } from "@/lib/health-models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const readings = await BloodPressure.find({
      userId: session.user?.email,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(limit)

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("Blood pressure fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch blood pressure data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { systolic, diastolic, heartRate, notes, timestamp } = await request.json()

    if (!systolic || !diastolic) {
      return NextResponse.json({ error: "Systolic and diastolic values are required" }, { status: 400 })
    }

    await connectToDatabase()

    const reading = new BloodPressure({
      userId: session.user?.email,
      systolic,
      diastolic,
      heartRate,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    })

    await reading.save()

    return NextResponse.json({ reading })
  } catch (error) {
    console.error("Blood pressure save error:", error)
    return NextResponse.json({ error: "Failed to save blood pressure reading" }, { status: 500 })
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
      return NextResponse.json({ error: "Reading ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const result = await BloodPressure.findOneAndDelete({
      _id: id,
      userId: session.user?.email
    })

    if (!result) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Blood pressure delete error:", error)
    return NextResponse.json({ error: "Failed to delete blood pressure reading" }, { status: 500 })
  }
}
