import { Project, Factory, Order, Sample } from "@/types"

export const projects: Project[] = [
  {
    id: "1",
    name: "Collection Été 2024",
    description: "Ligne de vêtements légers pour la saison estivale",
    status: "in_progress",
    priority: "high",
    progress: 75,
    factory: "Golden Thread Manufacturing",
    client: "Boutique Parisienne",
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    deadline: "2024-03-30",
    budget: 150000,
    estimatedCost: 145000,
    quantity: 1200,
    team: ["Marie Dubois", "Jean Martin"],
    type: "BULK",
    products: [
      {
        id: "prod-1-1",
        type: "tshirt",
        quantity: 500,
        reference: "T-SHIRT-001",
        factory: "Golden Thread Manufacturing"
      },
      {
        id: "prod-1-2",
        type: "headwear",
        quantity: 300,
        reference: "CAP-001",
        factory: "Dragon Fabric Co."
      },
      {
        id: "prod-1-3",
        type: "tshirt",
        quantity: 400,
        reference: "T-SHIRT-002",
        factory: "Silk Road Textiles"
      }
    ]
  },
  {
    id: "2", 
    name: "Denim Premium",
    description: "Collection de jeans haut de gamme",
    status: "planning",
    priority: "medium",
    progress: 25,
    factory: "Silk Road Textiles",
    client: "Fashion Store Lyon",
    startDate: "2024-02-01",
    endDate: "2024-05-15",
    deadline: "2024-05-15",
    budget: 200000,
    estimatedCost: 195000,
    quantity: 800,
    team: ["Sophie Chen", "Lucas Moreau"],
    type: "BULK",
    products: [
      {
        id: "prod-2-1",
        type: "pants",
        quantity: 500,
        reference: "JEAN-SLIM-001",
        factory: "Silk Road Textiles"
      },
      {
        id: "prod-2-2",
        type: "jacket",
        quantity: 300,
        reference: "VESTE-DENIM-001",
        factory: "Golden Thread Manufacturing"
      }
    ]
  },
  {
    id: "3",
    name: "Lingerie Deluxe",
    description: "Sous-vêtements féminins premium",
    status: "completed",
    priority: "low",
    progress: 100,
    factory: "Dragon Fabric Co.",
    client: "Luxury Brands Inc.",
    startDate: "2023-10-01",
    endDate: "2024-01-15",
    deadline: "2024-01-15",
    budget: 120000,
    estimatedCost: 118000,
    quantity: 500,
    team: ["Emma Wilson", "Paul Lambert"],
    type: "SAMPLE",
    products: [
      {
        id: "prod-3-1",
        type: "other",
        customType: "Soutien-gorge",
        quantity: 250,
        reference: "BRA-LUX-001",
        factory: "Dragon Fabric Co."
      },
      {
        id: "prod-3-2",
        type: "other",
        customType: "Culotte",
        quantity: 250,
        reference: "PANT-LUX-001",
        factory: "Dragon Fabric Co."
      }
    ]
  },
  {
    id: "4",
    name: "Sportswear Tech",
    description: "Vêtements de sport avec tissus techniques",
    status: "delayed",
    priority: "urgent",
    progress: 60,
    factory: "Pearl River Garments",
    client: "SportMax",
    startDate: "2024-01-01",
    endDate: "2024-04-01",
    deadline: "2024-04-01",
    budget: 180000,
    estimatedCost: 185000,
    quantity: 1500,
    team: ["Alex Rivera", "Nina Patel"],
    type: "BULK",
    products: [
      {
        id: "prod-4-1",
        type: "tshirt",
        quantity: 600,
        reference: "SPORT-TEE-001",
        factory: "Pearl River Garments"
      },
      {
        id: "prod-4-2",
        type: "pants",
        quantity: 500,
        reference: "SPORT-LEGGING-001",
        factory: "Golden Thread Manufacturing"
      },
      {
        id: "prod-4-3",
        type: "jacket",
        quantity: 400,
        reference: "SPORT-JACKET-001",
        factory: "Silk Road Textiles"
      }
    ]
  },
  {
    id: "5",
    name: "Uniforme Corporate XYZ",
    description: "Collection d'uniformes pour entreprise",
    status: "in_progress",
    priority: "high",
    progress: 45,
    factory: "Golden Thread Manufacturing",
    client: "Corporate XYZ",
    startDate: "2024-02-15",
    endDate: "2024-05-30",
    deadline: "2024-05-30",
    budget: 95000,
    estimatedCost: 92000,
    quantity: 850,
    team: ["Claire Rousseau"],
    type: "BULK",
    products: [
      {
        id: "prod-5-1",
        type: "tshirt",
        quantity: 300,
        reference: "POLO-CORP-001",
        factory: "Golden Thread Manufacturing"
      },
      {
        id: "prod-5-2",
        type: "pants",
        quantity: 300,
        reference: "PANTALON-CORP-001",
        factory: "Silk Road Textiles"
      },
      {
        id: "prod-5-3",
        type: "headwear",
        quantity: 250,
        reference: "CASQUETTE-CORP-001",
        factory: "Dragon Fabric Co."
      }
    ]
  },
  {
    id: "6",
    name: "Street Collection Urban",
    description: "Collection streetwear tendance",
    status: "in_progress",
    priority: "medium",
    progress: 35,
    factory: "Silk Road Textiles",
    client: "Urban Style Store",
    startDate: "2024-03-01",
    endDate: "2024-06-15",
    deadline: "2024-06-15",
    budget: 175000,
    estimatedCost: 170000,
    quantity: 2000,
    team: ["Marc Durand", "Léa Bernard"],
    type: "BULK",
    products: [
      {
        id: "prod-6-1",
        type: "sweatshirt",
        quantity: 700,
        reference: "HOODIE-URB-001",
        factory: "Golden Thread Manufacturing"
      },
      {
        id: "prod-6-2",
        type: "tshirt",
        quantity: 800,
        reference: "TEE-URB-001",
        factory: "Pearl River Garments"
      },
      {
        id: "prod-6-3",
        type: "headwear",
        quantity: 500,
        reference: "BEANIE-URB-001",
        factory: "Dragon Fabric Co."
      }
    ]
  }
]

export const factories: Factory[] = [
  {
    id: "1",
    name: "Golden Thread Manufacturing",
    location: "Guangzhou, Chine",
    country: "Chine",
    contactPerson: "Zhang Wei",
    email: "zhang.wei@goldenthread.cn",
    phone: "+86 20 1234 5678",
    specialties: ["Coton", "Lin", "Tricots"],
    capacity: 50000,
    rating: 4.8,
    activeProjects: 12,
    contact: "zhang.wei@goldenthread.cn",
    certifications: ["ISO 9001", "OEKO-TEX", "GOTS"],
    status: "active"
  },
  {
    id: "2", 
    name: "Silk Road Textiles",
    location: "Shanghai, Chine",
    country: "Chine",
    contactPerson: "Li Ming",
    email: "li.ming@silkroad.cn",
    phone: "+86 21 8765 4321",
    specialties: ["Soie", "Denim", "Broderie"],
    capacity: 35000,
    rating: 4.6,
    activeProjects: 8,
    contact: "li.ming@silkroad.cn",
    certifications: ["ISO 9001", "WRAP"],
    status: "active"
  },
  {
    id: "3",
    name: "Dragon Fabric Co.",
    location: "Shenzhen, Chine",
    country: "Chine",
    contactPerson: "Wang Jin",
    email: "wang.jin@dragonfabric.cn",
    phone: "+86 755 9876 5432",
    specialties: ["Lingerie", "Dentelle", "Élastique"],
    capacity: 25000,
    rating: 4.9,
    activeProjects: 6,
    contact: "wang.jin@dragonfabric.cn",
    certifications: ["ISO 9001", "OEKO-TEX", "SEDEX"],
    status: "active"
  }
]

export const orders: Order[] = [
  {
    id: "ORD-001",
    reference: "CMD-2024-001",
    client: "Boutique Parisienne",
    project_id: "1",
    status: "in_production",
    quantity: 1200,
    total_value: 45000,
    factory: "Golden Thread Manufacturing",
    delivery_date: "2024-03-15",
    created_date: "2024-01-20"
  },
  {
    id: "ORD-002", 
    reference: "CMD-2024-002",
    client: "Fashion Store Lyon",
    project_id: "2",
    status: "pending",
    quantity: 800,
    total_value: 32000,
    factory: "Silk Road Textiles",
    delivery_date: "2024-04-01",
    created_date: "2024-02-05"
  }
]

export const samples: Sample[] = [
  {
    id: "SMP-001",
    name: "T-shirt Coton Bio",
    project: "Collection Été 2024",
    factory: "Golden Thread Manufacturing",
    status: "approved",
    material: "Coton biologique",
    color: "Bleu marine",
    size: "M",
    created_date: "2024-01-20",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
    notes: "Excellent toucher, couleur conforme aux attentes"
  },
  {
    id: "SMP-002",
    name: "Jean Slim Fit",
    project: "Denim Premium", 
    factory: "Silk Road Textiles",
    status: "in_development",
    material: "Denim stretch",
    color: "Indigo foncé",
    size: "32/34",
    created_date: "2024-02-01",
    image_url: null,
    notes: "En attente de l'échantillon avec les finitions"
  }
]