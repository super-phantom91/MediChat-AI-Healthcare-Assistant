import mongoose from "mongoose"

// Blood Pressure Schema
const bloodPressureSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  systolic: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  diastolic: {
    type: Number,
    required: true,
    min: 30,
    max: 200
  },
  heartRate: {
    type: Number,
    min: 30,
    max: 220
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Blood Sugar Schema
const bloodSugarSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  glucose: {
    type: Number,
    required: true,
    min: 20,
    max: 800
  },
  unit: {
    type: String,
    enum: ['mg/dL', 'mmol/L'],
    default: 'mg/dL'
  },
  measurementType: {
    type: String,
    enum: ['fasting', 'postprandial', 'random', 'bedtime'],
    required: true
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Weight Schema
const weightSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 1000
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  bodyFat: {
    type: Number,
    min: 0,
    max: 100
  },
  muscleMass: {
    type: Number,
    min: 0,
    max: 200
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Medication Schema
const medicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly']
  },
  times: [{
    type: String, // Format: "HH:MM"
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  notes: String,
  prescribedBy: String,
  sideEffects: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Medication Log Schema (for tracking actual doses taken)
const medicationLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  medicationName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  actualTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['taken', 'missed', 'delayed'],
    default: 'taken'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Health Goals Schema
const healthGoalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'blood_pressure', 'blood_sugar', 'exercise', 'medication_adherence'],
    required: true
  },
  target: {
    value: Number,
    unit: String,
    description: String
  },
  current: {
    value: Number,
    unit: String
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create indexes for better query performance
bloodPressureSchema.index({ userId: 1, timestamp: -1 })
bloodSugarSchema.index({ userId: 1, timestamp: -1 })
weightSchema.index({ userId: 1, timestamp: -1 })
medicationSchema.index({ userId: 1, isActive: 1 })
medicationLogSchema.index({ userId: 1, scheduledTime: -1 })
healthGoalSchema.index({ userId: 1, isActive: 1 })

// Export models
export const BloodPressure = mongoose.models.BloodPressure || mongoose.model('BloodPressure', bloodPressureSchema)
export const BloodSugar = mongoose.models.BloodSugar || mongoose.model('BloodSugar', bloodSugarSchema)
export const Weight = mongoose.models.Weight || mongoose.model('Weight', weightSchema)
export const Medication = mongoose.models.Medication || mongoose.model('Medication', medicationSchema)
export const MedicationLog = mongoose.models.MedicationLog || mongoose.model('MedicationLog', medicationLogSchema)
export const HealthGoal = mongoose.models.HealthGoal || mongoose.model('HealthGoal', healthGoalSchema)

// TypeScript interfaces for type safety
export interface IBloodPressure {
  _id?: string
  userId: string
  systolic: number
  diastolic: number
  heartRate?: number
  notes?: string
  timestamp: Date
  createdAt: Date
}

export interface IBloodSugar {
  _id?: string
  userId: string
  glucose: number
  unit: 'mg/dL' | 'mmol/L'
  measurementType: 'fasting' | 'postprandial' | 'random' | 'bedtime'
  notes?: string
  timestamp: Date
  createdAt: Date
}

export interface IWeight {
  _id?: string
  userId: string
  weight: number
  unit: 'kg' | 'lbs'
  bodyFat?: number
  muscleMass?: number
  notes?: string
  timestamp: Date
  createdAt: Date
}

export interface IMedication {
  _id?: string
  userId: string
  name: string
  dosage: string
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'as_needed' | 'weekly' | 'monthly'
  times: string[]
  startDate: Date
  endDate?: Date
  isActive: boolean
  reminderEnabled: boolean
  notes?: string
  prescribedBy?: string
  sideEffects?: string[]
  createdAt: Date
}

export interface IMedicationLog {
  _id?: string
  userId: string
  medicationId: string
  medicationName: string
  dosage: string
  scheduledTime: Date
  actualTime: Date
  status: 'taken' | 'missed' | 'delayed'
  notes?: string
  createdAt: Date
}

export interface IHealthGoal {
  _id?: string
  userId: string
  type: 'weight_loss' | 'weight_gain' | 'blood_pressure' | 'blood_sugar' | 'exercise' | 'medication_adherence'
  target: {
    value: number
    unit: string
    description: string
  }
  current: {
    value: number
    unit: string
  }
  deadline?: Date
  isActive: boolean
  progress: number
  createdAt: Date
}