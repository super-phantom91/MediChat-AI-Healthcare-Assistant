import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined")
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

// GET - Retrieve chat messages for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await connectToDatabase()
    const db = client.db("medichat")
    const messages = db.collection("messages")

    const userMessages = await messages
      .find({ userId: (session.user as any).id })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json({ messages: userMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST - Save a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, sender } = await request.json()

    if (!text || !sender) {
      return NextResponse.json(
        { error: "Text and sender are required" },
        { status: 400 }
      )
    }

    const client = await connectToDatabase()
    const db = client.db("medichat")
    const messages = db.collection("messages")

    const newMessage = {
      userId: (session.user as any).id,
      text,
      sender,
      timestamp: new Date(),
      createdAt: new Date()
    }

    const result = await messages.insertOne(newMessage)

    return NextResponse.json({
      message: "Message saved successfully",
      messageId: result.insertedId,
      ...newMessage
    })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    )
  }
}

// DELETE - Clear all messages for user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const messageId = url.searchParams.get("messageId")

    const client = await connectToDatabase()
    const db = client.db("medichat")
    const messages = db.collection("messages")

    if (messageId) {
      // Delete specific message
      const result = await messages.deleteOne({
        _id: new ObjectId(messageId),
        userId: (session.user as any).id
      })

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ message: "Message deleted successfully" })
    } else {
      // Clear all messages for user
      const result = await messages.deleteMany({
        userId: (session.user as any).id
      })

      return NextResponse.json({
        message: "All messages cleared successfully",
        deletedCount: result.deletedCount
      })
    }
  } catch (error) {
    console.error("Error deleting messages:", error)
    return NextResponse.json(
      { error: "Failed to delete messages" },
      { status: 500 }
    )
  }
}
