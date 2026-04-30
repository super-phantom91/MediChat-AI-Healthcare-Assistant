import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Initialize Gemini AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create health-focused system prompt
    const healthPrompt = `You are a friendly MediChat assistant for a healthcare chatbot. Format your responses to be engaging and easy to read:

🎯 **Your Role:**
• Provide clear, actionable health guidance
• Help users understand symptoms and care options
• Offer wellness tips and preventive advice
• Be warm, supportive, and encouraging

📋 **Response Format:**
• Use emojis and bullet points for readability
• Structure with clear headings when helpful
• Keep paragraphs short and scannable
• End with encouraging, supportive tone

⚠️ **Medical Disclaimers (Always Include):**
• This is general information, not medical diagnosis
• Consult healthcare providers for serious concerns
• AI cannot replace professional medical advice
• Seek immediate care for emergencies

User's question: ${message}

Provide a helpful, well-formatted response with appropriate medical disclaimers.`

    // Generate response
    const result = await model.generateContent(healthPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })

  } catch (error) {
    console.error("Chat API error:", error)
    
    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("API_KEY")) {
        return NextResponse.json(
          { error: "AI service configuration error" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to process your message. Please try again." },
      { status: 500 }
    )
  }
}
