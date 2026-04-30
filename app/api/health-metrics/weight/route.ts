import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Weight } from "@/lib/health-models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const days = parseInt(searchParams.get('days') || '90')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const readings = await Weight.find({
      userId: session.user?.email,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(limit)

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("Weight fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch weight data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { weight, unit, bodyFat, muscleMass, notes, timestamp } = await request.json()

    if (!weight) {
      return NextResponse.json({ error: "Weight value is required" }, { status: 400 })
    }

    await connectToDatabase()

    const reading = new Weight({
      userId: session.user?.email,
      weight,
      unit: unit || 'kg',
      bodyFat,
      muscleMass,
      notes,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    })

    await reading.save()

    return NextResponse.json({ reading })
  } catch (error) {
    console.error("Weight save error:", error)
    return NextResponse.json({ error: "Failed to save weight reading" }, { status: 500 })
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

    const result = await Weight.findOneAndDelete({
      _id: id,
      userId: session.user?.email
    })

    if (!result) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Weight delete error:", error)
    return NextResponse.json({ error: "Failed to delete weight reading" }, { status: 500 })
  }
}
