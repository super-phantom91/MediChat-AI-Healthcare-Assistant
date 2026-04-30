import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  assessSymptomUrgency, 
  getRedFlagsForSymptoms, 
  findSymptomById,
  findRelevantConditions,
  symptomDatabase,
  clinicalDecisionRules 
} from "@/lib/medical-database"

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

    const { symptoms, age, gender, duration, severity } = await request.json()

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: "Symptoms are required" },
        { status: 400 }
      )
    }

    // Use medical database for initial assessment
    const urgencyAssessment = assessSymptomUrgency(symptoms, age)
    const redFlags = getRedFlagsForSymptoms(symptoms)
    
    // Get detailed symptom information
    const symptomDetails = symptoms.map((id: string) => findSymptomById(id)).filter(Boolean)
    const symptomNames = symptomDetails.map((s: any) => s?.name || id)
    const allConditions = [...new Set(symptomDetails.flatMap((s: any) => s?.commonConditions || []))]
    const relevantConditions = findRelevantConditions(symptoms)

    // Initialize Gemini AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create enhanced prompt with medical database context
    const symptomPrompt = `You are a MediChat assistant performing symptom analysis. Use the provided medical database context to enhance your analysis.

IMPORTANT: Analyze ONLY the specific symptoms provided by the patient. Do not mention "unspecified symptoms" or generic terms. Focus on the actual symptoms: ${symptomNames.join(', ')}

**MEDICAL DATABASE CONTEXT:**
Initial Assessment: ${urgencyAssessment.urgencyLevel.toUpperCase()} urgency
Reasoning: ${urgencyAssessment.reasoning}
Red Flag Symptoms: ${redFlags.join(', ') || 'None identified'}
Possible Conditions from Database: ${allConditions.join(', ')}
Relevant Medical Conditions: ${relevantConditions.map(c => `${c.name} (${c.icd10})`).join(', ')}

**PATIENT INFORMATION:**
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}
- Symptoms: ${symptomNames.join(', ')}
- Duration: ${duration || 'Not specified'}
- Severity: ${severity || 'Not specified'}

**CLINICAL DECISION RULES REFERENCE:**
${JSON.stringify(clinicalDecisionRules, null, 2)}

**Please provide analysis in this EXACT format:**

🔍 **SYMPTOM ANALYSIS**
Based on the medical database assessment and clinical guidelines for the symptoms: ${symptomNames.join(', ')}

**Most Likely Conditions:**
• [Primary condition] - [Likelihood: High/Medium/Low] - [Brief explanation based on the specific symptoms: ${symptomNames.join(', ')}]
• [Secondary condition] - [Likelihood: High/Medium/Low] - [Brief explanation based on the specific symptoms: ${symptomNames.join(', ')}]
• [Tertiary condition] - [Likelihood: High/Medium/Low] - [Brief explanation based on the specific symptoms: ${symptomNames.join(', ')}]

🚨 **URGENCY LEVEL: ${urgencyAssessment.urgencyLevel.toUpperCase()}**
${urgencyAssessment.reasoning}

${redFlags.length > 0 ? `⚠️ **RED FLAG SYMPTOMS DETECTED:**
${redFlags.map(flag => `• ${flag}`).join('\n')}` : ''}

💡 **IMMEDIATE RECOMMENDATIONS**
${urgencyAssessment.immediateActions.map(action => `• ${action}`).join('\n')}

🏥 **WHEN TO SEEK MEDICAL CARE**
• If any red flag symptoms develop
• ${urgencyAssessment.urgencyLevel === 'emergency' ? 'CALL 911 IMMEDIATELY' : 
    urgencyAssessment.urgencyLevel === 'high' ? 'Seek care within 2-4 hours' :
    urgencyAssessment.urgencyLevel === 'medium' ? 'Schedule appointment within 24-48 hours' :
    'Monitor symptoms and seek care if worsening'}

🏠 **SELF-CARE MEASURES**
• [Specific self-care recommendation 1]
• [Specific self-care recommendation 2]
• [Specific self-care recommendation 3]

⚠️ **IMPORTANT DISCLAIMER**
This analysis combines AI assessment with medical database references but cannot replace professional medical diagnosis. The urgency level is based on clinical decision rules. If symptoms worsen or you're concerned, consult a healthcare provider immediately.

**Analysis Guidelines:**
- Focus specifically on the symptoms provided: ${symptomNames.join(', ')}
- Prioritize the medical database assessment and red flags
- Consider the clinical decision rules in your reasoning
- Be specific about conditions but avoid definitive diagnoses
- Emphasize safety based on the urgency assessment
- Provide actionable, evidence-based advice
- Do not mention "unspecified symptoms" - analyze the actual symptoms provided`

    // Generate response
    const result = await model.generateContent(symptomPrompt)
    const response = await result.response
    const analysis = response.text()

    return NextResponse.json({ 
      analysis,
      databaseAssessment: {
        urgencyLevel: urgencyAssessment.urgencyLevel,
        reasoning: urgencyAssessment.reasoning,
        immediateActions: urgencyAssessment.immediateActions,
        relevantConditions: urgencyAssessment.relevantConditions,
        redFlags
      },
      timestamp: new Date().toISOString(),
      patientInfo: {
        age: age || 'Not specified',
        gender: gender || 'Not specified',
        symptoms: symptomNames,
        duration: duration || 'Not specified',
        severity: severity || 'Not specified'
      }
    })

  } catch (error) {
    console.error("Symptom checker API error:", error)
    
    return NextResponse.json(
      { error: "Failed to analyze symptoms. Please try again." },
      { status: 500 }
    )
  }
}
