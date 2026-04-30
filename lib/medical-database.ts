// Medical symptom database with clinical decision support
export interface Symptom {
    id: string
    name: string
    category: string
    severity: 'mild' | 'moderate' | 'severe'
    urgency: 'low' | 'medium' | 'high' | 'emergency'
    commonConditions: string[]
    redFlags: string[]
  }
  
  export interface MedicalCondition {
    id: string
    name: string
    icd10: string
    commonSymptoms: string[]
    riskFactors: string[]
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
    selfCare: string[]
    seekCareIf: string[]
  }
  
  export const symptomDatabase: Symptom[] = [
    {
      id: 'fever',
      name: 'Fever',
      category: 'Constitutional',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Viral infection', 'Bacterial infection', 'COVID-19', 'Influenza'],
      redFlags: ['Temperature >103°F (39.4°C)', 'Fever lasting >3 days', 'Severe headache with fever', 'Difficulty breathing']
    },
    {
      id: 'chest_pain',
      name: 'Chest Pain',
      category: 'Cardiovascular',
      severity: 'severe',
      urgency: 'high',
      commonConditions: ['Heart attack', 'Angina', 'Pulmonary embolism', 'Muscle strain'],
      redFlags: ['Crushing chest pain', 'Pain radiating to arm/jaw', 'Shortness of breath', 'Sweating with chest pain']
    },
    {
      id: 'headache',
      name: 'Headache',
      category: 'Neurological',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Tension headache', 'Migraine', 'Cluster headache', 'Sinus headache'],
      redFlags: ['Sudden severe headache', 'Headache with fever and neck stiffness', 'Vision changes', 'Confusion']
    },
    {
      id: 'shortness_of_breath',
      name: 'Shortness of Breath',
      category: 'Respiratory',
      severity: 'severe',
      urgency: 'high',
      commonConditions: ['Asthma', 'Pneumonia', 'Heart failure', 'Pulmonary embolism'],
      redFlags: ['Severe difficulty breathing', 'Blue lips or fingernails', 'Cannot speak in full sentences', 'Chest pain with breathing']
    },
    {
      id: 'abdominal_pain',
      name: 'Abdominal Pain',
      category: 'Gastrointestinal',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Gastritis', 'Appendicitis', 'Gallstones', 'Kidney stones'],
      redFlags: ['Severe right lower quadrant pain', 'Pain with vomiting', 'Rigid abdomen', 'Blood in stool']
    },
    {
      id: 'cough',
      name: 'Cough',
      category: 'Respiratory',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Common cold', 'Bronchitis', 'Pneumonia', 'COVID-19'],
      redFlags: ['Coughing up blood', 'Severe difficulty breathing', 'High fever with cough', 'Chest pain with cough']
    },
    {
      id: 'nausea',
      name: 'Nausea',
      category: 'Gastrointestinal',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Gastroenteritis', 'Food poisoning', 'Migraine', 'Pregnancy'],
      redFlags: ['Severe dehydration', 'Blood in vomit', 'Severe abdominal pain', 'High fever']
    },
    {
      id: 'dizziness',
      name: 'Dizziness',
      category: 'Neurological',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Inner ear infection', 'Low blood pressure', 'Dehydration', 'Medication side effect'],
      redFlags: ['Sudden severe dizziness', 'Dizziness with chest pain', 'Loss of consciousness', 'Severe headache']
    },
    {
      id: 'fatigue',
      name: 'Fatigue',
      category: 'Constitutional',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Viral infection', 'Anemia', 'Depression', 'Sleep disorders'],
      redFlags: ['Extreme weakness', 'Difficulty breathing', 'Chest pain', 'Confusion']
    },
    {
      id: 'rash',
      name: 'Rash',
      category: 'Dermatological',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Allergic reaction', 'Eczema', 'Contact dermatitis', 'Viral infection'],
      redFlags: ['Difficulty breathing', 'Swelling of face/throat', 'Widespread blistering', 'High fever with rash']
    },
    {
      id: 'runny_nose',
      name: 'Runny Nose',
      category: 'Respiratory',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Common cold', 'Allergies', 'Sinusitis', 'COVID-19'],
      redFlags: ['Severe difficulty breathing', 'High fever with runny nose', 'Blood in nasal discharge']
    },
    {
      id: 'sore_throat',
      name: 'Sore Throat',
      category: 'Respiratory',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Viral infection', 'Strep throat', 'Allergies', 'COVID-19'],
      redFlags: ['Severe difficulty swallowing', 'High fever with sore throat', 'Swollen lymph nodes', 'Difficulty breathing']
    },
    {
      id: 'congestion',
      name: 'Nasal Congestion',
      category: 'Respiratory',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Common cold', 'Allergies', 'Sinusitis', 'COVID-19'],
      redFlags: ['Severe difficulty breathing', 'High fever with congestion', 'Facial pain or pressure']
    },
    {
      id: 'sneezing',
      name: 'Sneezing',
      category: 'Respiratory',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Allergies', 'Common cold', 'Viral infection', 'Environmental irritants'],
      redFlags: ['Severe difficulty breathing', 'High fever with sneezing', 'Anaphylaxis symptoms']
    },
    {
      id: 'body_aches',
      name: 'Body Aches',
      category: 'Constitutional',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Viral infection', 'Influenza', 'COVID-19', 'Overexertion'],
      redFlags: ['Severe muscle weakness', 'Difficulty moving', 'High fever with body aches', 'Chest pain']
    },
    {
      id: 'chills',
      name: 'Chills',
      category: 'Constitutional',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Fever', 'Viral infection', 'Bacterial infection', 'COVID-19'],
      redFlags: ['Severe chills with high fever', 'Difficulty breathing', 'Chest pain', 'Altered mental status']
    },
    {
      id: 'loss_of_appetite',
      name: 'Loss of Appetite',
      category: 'Gastrointestinal',
      severity: 'mild',
      urgency: 'low',
      commonConditions: ['Viral infection', 'Stress', 'Depression', 'Medication side effect'],
      redFlags: ['Severe weight loss', 'Difficulty swallowing', 'Severe abdominal pain', 'High fever']
    },
    {
      id: 'vomiting',
      name: 'Vomiting',
      category: 'Gastrointestinal',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Gastroenteritis', 'Food poisoning', 'Viral infection', 'Pregnancy'],
      redFlags: ['Blood in vomit', 'Severe dehydration', 'Severe abdominal pain', 'High fever with vomiting']
    },
    {
      id: 'diarrhea',
      name: 'Diarrhea',
      category: 'Gastrointestinal',
      severity: 'moderate',
      urgency: 'medium',
      commonConditions: ['Gastroenteritis', 'Food poisoning', 'Viral infection', 'Medication side effect'],
      redFlags: ['Blood in stool', 'Severe dehydration', 'Severe abdominal pain', 'High fever with diarrhea']
    }
  ]
  
  export const medicalConditions: MedicalCondition[] = [
    {
      id: 'common_cold',
      name: 'Common Cold',
      icd10: 'J00',
      commonSymptoms: ['cough', 'runny_nose', 'sore_throat', 'congestion', 'sneezing'],
      riskFactors: ['Recent exposure to sick individuals', 'Seasonal changes', 'Stress', 'Poor sleep', 'Weakened immune system'],
      urgencyLevel: 'low',
      selfCare: ['Rest and hydration', 'Over-the-counter cold medications', 'Warm salt water gargling', 'Humidifier use', 'Nasal saline rinses'],
      seekCareIf: ['Fever >101.3°F for >3 days', 'Difficulty breathing', 'Severe headache', 'Ear pain', 'Symptoms lasting >10 days']
    },
    {
      id: 'viral_infection',
      name: 'Viral Upper Respiratory Infection',
      icd10: 'J06.9',
      commonSymptoms: ['fever', 'cough', 'fatigue', 'headache'],
      riskFactors: ['Recent exposure', 'Seasonal changes', 'Stress', 'Poor sleep'],
      urgencyLevel: 'low',
      selfCare: ['Rest and hydration', 'Over-the-counter pain relievers', 'Warm salt water gargling', 'Humidifier use'],
      seekCareIf: ['Fever >101.3°F for >3 days', 'Difficulty breathing', 'Severe headache', 'Ear pain']
    },
    {
      id: 'heart_attack',
      name: 'Acute Myocardial Infarction',
      icd10: 'I21.9',
      commonSymptoms: ['chest_pain', 'shortness_of_breath', 'nausea'],
      riskFactors: ['Age >45 (men) or >55 (women)', 'Smoking', 'High blood pressure', 'Diabetes', 'Family history'],
      urgencyLevel: 'emergency',
      selfCare: ['Call 911 immediately', 'Chew aspirin if not allergic', 'Stay calm and rest'],
      seekCareIf: ['Any chest pain with risk factors', 'Crushing chest pain', 'Pain with sweating/nausea']
    }
  ]
  
  export const clinicalDecisionRules = {
    chestPain: {
      emergency: ['Crushing pain', 'Radiation to arm/jaw', 'Sweating', 'Nausea', 'Age >40 with risk factors'],
      high: ['Exertional pain', 'Pain lasting >20 minutes', 'Previous heart disease'],
      medium: ['Atypical chest discomfort', 'Stress-related pain'],
      low: ['Sharp, brief pain', 'Pain with movement', 'Young age, no risk factors']
    },
    fever: {
      emergency: ['Temperature >104°F', 'Altered mental status', 'Severe headache', 'Neck stiffness'],
      high: ['Temperature >103°F', 'Immunocompromised', 'Age >65 or <3 months'],
      medium: ['Temperature 101-103°F', 'Persistent >3 days'],
      low: ['Temperature <101°F', 'Recent vaccination', 'Mild symptoms']
    },
    abdominalPain: {
      emergency: ['Severe right lower quadrant pain', 'Rigid abdomen', 'Blood in stool/vomit'],
      high: ['Persistent severe pain', 'Pain with fever', 'Unable to eat/drink'],
      medium: ['Moderate pain', 'Intermittent pain', 'Mild nausea'],
      low: ['Mild discomfort', 'Pain after eating', 'Stress-related']
    }
  }
  
  export function assessSymptomUrgency(symptoms: string[], age?: number, riskFactors?: string[]): {
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'
    reasoning: string
    immediateActions: string[]
    relevantConditions: string[]
  } {
    // Check for emergency symptoms
    const emergencySymptoms = ['chest_pain', 'shortness_of_breath']
    const hasEmergencySymptom = symptoms.some(s => emergencySymptoms.includes(s))
    
    if (hasEmergencySymptom) {
      return {
        urgencyLevel: 'emergency',
        reasoning: 'Symptoms suggest potential life-threatening condition',
        immediateActions: ['Call 911 immediately', 'Do not drive yourself', 'Stay with someone if possible'],
        relevantConditions: ['Heart attack', 'Pulmonary embolism', 'Severe asthma attack']
      }
    }
    
    // Check for high-risk combinations
    const highRiskCombos = [
      ['fever', 'headache'],
      ['abdominal_pain', 'nausea'],
      ['chest_pain', 'dizziness'],
      ['fever', 'chest_pain'],
      ['shortness_of_breath', 'chest_pain']
    ]
    
    const hasHighRiskCombo = highRiskCombos.some(combo => 
      combo.every(symptom => symptoms.includes(symptom))
    )
    
    if (hasHighRiskCombo || (age && age > 65 && symptoms.length > 2)) {
      return {
        urgencyLevel: 'high',
        reasoning: 'Symptom combination or demographics suggest serious condition requiring prompt medical attention',
        immediateActions: ['Seek medical care within 2-4 hours', 'Monitor symptoms closely', 'Have someone drive you'],
        relevantConditions: ['Serious infection', 'Appendicitis', 'Cardiac issues']
      }
    }
    
    // Check for common cold symptoms
    const coldSymptoms = ['cough', 'runny_nose', 'sore_throat', 'congestion', 'sneezing']
    const hasColdSymptoms = symptoms.some(s => coldSymptoms.includes(s))
    
    if (hasColdSymptoms && symptoms.length <= 3) {
      return {
        urgencyLevel: 'low',
        reasoning: 'Symptoms consistent with common cold or upper respiratory infection',
        immediateActions: ['Rest and hydration', 'Over-the-counter cold medications', 'Monitor for worsening symptoms'],
        relevantConditions: ['Common cold', 'Viral upper respiratory infection', 'Allergies']
      }
    }
    
    // Medium urgency assessment
    if (symptoms.length > 3 || symptoms.includes('fever')) {
      return {
        urgencyLevel: 'medium',
        reasoning: 'Multiple symptoms warrant medical evaluation',
        immediateActions: ['Schedule appointment with healthcare provider within 24-48 hours', 'Monitor for worsening', 'Rest and hydration'],
        relevantConditions: ['Viral infection', 'Bacterial infection', 'Inflammatory condition']
      }
    }
    
    // Low urgency
    return {
      urgencyLevel: 'low',
      reasoning: 'Symptoms are mild and likely self-limiting',
      immediateActions: ['Self-care measures', 'Monitor symptoms', 'Schedule routine appointment if persistent'],
      relevantConditions: ['Common cold', 'Minor strain', 'Stress-related symptoms']
    }
  }
  
  export function getSymptomsByCategory() {
    const categories = symptomDatabase.reduce((acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = []
      }
      acc[symptom.category].push(symptom)
      return acc
    }, {} as Record<string, Symptom[]>)
    
    return categories
  }
  
  export function findSymptomById(id: string): Symptom | undefined {
    return symptomDatabase.find(symptom => symptom.id === id)
  }
  
  export function getRedFlagsForSymptoms(symptomIds: string[]): string[] {
  const redFlags = new Set<string>()
  
  symptomIds.forEach(id => {
    const symptom = findSymptomById(id)
    if (symptom) {
      symptom.redFlags.forEach(flag => redFlags.add(flag))
    }
  })
  
  return Array.from(redFlags)
}

export function findRelevantConditions(symptomIds: string[]): MedicalCondition[] {
  const relevantConditions: MedicalCondition[] = []
  
  medicalConditions.forEach(condition => {
    const matchingSymptoms = condition.commonSymptoms.filter(symptom => 
      symptomIds.includes(symptom)
    )
    
    if (matchingSymptoms.length >= Math.min(2, condition.commonSymptoms.length)) {
      relevantConditions.push(condition)
    }
  })
  
  return relevantConditions
}