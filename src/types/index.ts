export interface ProductItem {
  id: string
  type: GarmentType
  quantity: number
  customType?: string
  reference?: string
  factory?: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'planning' | 'in_progress' | 'review' | 'completed' | 'delayed' | 'on_hold' | 'cancelled'
  priority: Priority
  progress: number
  factory: string
  client: string
  startDate: string
  endDate: string
  deadline: string
  budget: number
  estimatedCost: number
  quantity: number
  products?: ProductItem[]
  team: string[]
  type?: 'BULK' | 'SAMPLE'
  attachments?: string[]
}

export interface Order {
  id: string
  reference: string
  client: string
  project_id: string
  status: 'pending' | 'in_production' | 'quality_check' | 'shipped' | 'delivered'
  quantity: number
  total_value: number
  factory: string
  delivery_date: string
  created_date: string
}

export interface Sample {
  id: string
  name: string
  project: string
  factory: string
  status: 'requested' | 'in_development' | 'review' | 'approved' | 'rejected'
  material: string
  color: string
  size: string
  created_date: string
  image_url: string | null
  notes: string
}

export interface Factory {
  id: string
  name: string
  location: string
  country: string
  contactPerson: string
  email: string
  phone: string
  specialties: string[]
  capacity: number
  rating: number
  activeProjects: number
  contact: string
  certifications: string[]
  status: FactoryStatus
}

export interface ProjectStep {
  id: string
  projectId: string
  name: string
  description: string
  status: StepStatus
  estimatedDuration: number
  actualDuration?: number
  startDate?: Date
  endDate?: Date
  assignedTo?: string
  dependencies: string[]
  order: number
}

export interface Material {
  id: string
  name: string
  type: MaterialType
  color: string
  quantity: number
  unit: string
  supplier: string
  cost: number
}

export interface ProjectStep {
  id: string
  projectId: string
  name: string
  description: string
  status: StepStatus
  estimatedDuration: number
  actualDuration?: number
  startDate?: Date
  endDate?: Date
  assignedTo?: string
  dependencies: string[]
  order: number
}

export interface OriginalFactory {
  id: string
  name: string
  location: string
  country: string
  contactPerson: string
  email: string
  phone: string
  specialties: string[]
  capacity: number
  rating: number
  certifications: string[]
  status: FactoryStatus
}

export interface Material {
  id: string
  name: string
  type: MaterialType
  color: string
  quantity: number
  unit: string
  supplier: string
  cost: number
}

export type ProjectStatus = 
  | 'draft'
  | 'in_progress' 
  | 'review'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type FactoryStatus = 'active' | 'inactive' | 'maintenance'

export type StepStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'cancelled'


export type GarmentType = 
  | 'tshirt'
  | 'pull'
  | 'sweatshirt'
  | 'jacket'
  | 'pants'
  | 'headwear'
  | 'dress'
  | 'sweater'
  | 'skirt'
  | 'other'

export type MaterialType = 
  | 'fabric'
  | 'thread'
  | 'buttons'
  | 'zippers'
  | 'accessories'
  | 'other'

export interface ProductionStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  startedDate?: string
  completedDate?: string
  notes?: string
}

export interface ProjectProduction {
  projectId: string
  factoryId: string
  steps: ProductionStep[]
  lastUpdated: string
}