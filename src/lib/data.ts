export interface Field {
  id: string;
  name: string;
  cropType: string;
  area: number;
  health: number;
  moisture: number;
  nitrogen: number;
  growthStage: string;
  expectedYield: number;
  lastIrrigation: string;
  lastFertilization: string;
  latitude: number;
  longitude: number;
  boundaries: { lat: number; lng: number }[];
  /** AgroMonitoring polygon ID for satellite/weather data */
  agroMonitoringId?: string;
  /** Future IoT sensor IDs attached to this field */
  sensorIds?: string[];
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  health: number;
  status: string;
  location: string;
  image: string;
  vaccinations: { name: string; date: string }[];
  medicalHistory: { date: string; condition: string; treatment: string }[];
  productionHistory: { date: string; product: string; amount: number }[];
  gpsLocation: { lat: number; lng: number };
}

export interface Machinery {
  id: string;
  name: string;
  type: string;
  image: string;
  hoursUsed: number;
  fuelLevel: number;
  status: "active" | "idle" | "maintenance" | "offline";
  lastMaintenance: string;
  nextService: string;
  assignedWorker: string;
  location: string;
  efficiency: number;
}

export interface Worker {
  id: string;
  name: string;
  photo: string;
  role: string;
  experience: number;
  skills: string[];
  hourlyRate: number;
  availability: "available" | "busy" | "offline";
  rating: number;
  assignedTo: string[];
  joinedDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "review" | "done";
  assignedTo: string;
  field?: string;
  dueDate: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  seller: string;
  image: string;
  description: string;
  rating: number;
  location: string;
}

export const fields: Field[] = [
  {
    id: "f1",
    name: "North Field",
    cropType: "Wheat",
    area: 45,
    health: 92,
    moisture: 68,
    nitrogen: 75,
    growthStage: "Flowering",
    expectedYield: 5400,
    lastIrrigation: "2024-03-15",
    lastFertilization: "2024-03-10",
    latitude: 40.7128,
    longitude: -74.006,
    boundaries: [
      { lat: 40.7138, lng: -74.007 },
      { lat: 40.7148, lng: -74.006 },
      { lat: 40.7142, lng: -74.004 },
      { lat: 40.7132, lng: -74.005 },
    ],
    agroMonitoringId: undefined,
    sensorIds: [],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-03-15T10:30:00Z",
  },
  {
    id: "f2",
    name: "South Meadow",
    cropType: "Corn",
    area: 32,
    health: 78,
    moisture: 55,
    nitrogen: 60,
    growthStage: "Vegetative",
    expectedYield: 4200,
    lastIrrigation: "2024-03-12",
    lastFertilization: "2024-03-08",
    latitude: 40.7118,
    longitude: -74.004,
    boundaries: [
      { lat: 40.7128, lng: -74.005 },
      { lat: 40.7138, lng: -74.004 },
      { lat: 40.7132, lng: -74.002 },
      { lat: 40.7122, lng: -74.003 },
    ],
    agroMonitoringId: undefined,
    sensorIds: [],
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-03-12T14:00:00Z",
  },
  {
    id: "f3",
    name: "East Orchard",
    cropType: "Apples",
    area: 28,
    health: 45,
    moisture: 40,
    nitrogen: 35,
    growthStage: "Fruiting",
    expectedYield: 2800,
    lastIrrigation: "2024-03-10",
    lastFertilization: "2024-03-05",
    latitude: 40.7145,
    longitude: -74.002,
    boundaries: [
      { lat: 40.7155, lng: -74.003 },
      { lat: 40.7165, lng: -74.002 },
      { lat: 40.7159, lng: -74.0 },
      { lat: 40.7149, lng: -74.001 },
    ],
    agroMonitoringId: undefined,
    sensorIds: [],
    createdAt: "2024-02-01T11:00:00Z",
    updatedAt: "2024-03-10T16:00:00Z",
  },
  {
    id: "f4",
    name: "West Pasture",
    cropType: "Soybeans",
    area: 38,
    health: 88,
    moisture: 72,
    nitrogen: 80,
    growthStage: "Pod Development",
    expectedYield: 3600,
    lastIrrigation: "2024-03-14",
    lastFertilization: "2024-03-12",
    latitude: 40.7115,
    longitude: -74.008,
    boundaries: [
      { lat: 40.7125, lng: -74.009 },
      { lat: 40.7135, lng: -74.008 },
      { lat: 40.7129, lng: -74.006 },
      { lat: 40.7119, lng: -74.007 },
    ],
    agroMonitoringId: undefined,
    sensorIds: [],
    createdAt: "2024-01-10T07:00:00Z",
    updatedAt: "2024-03-14T09:00:00Z",
  },
  {
    id: "f5",
    name: "Central Valley",
    cropType: "Rice",
    area: 52,
    health: 62,
    moisture: 85,
    nitrogen: 55,
    growthStage: "Tillering",
    expectedYield: 6200,
    lastIrrigation: "2024-03-16",
    lastFertilization: "2024-03-14",
    latitude: 40.713,
    longitude: -74.0,
    boundaries: [
      { lat: 40.714, lng: -74.001 },
      { lat: 40.715, lng: -74.0 },
      { lat: 40.7144, lng: -73.998 },
      { lat: 40.7134, lng: -73.999 },
    ],
    agroMonitoringId: undefined,
    sensorIds: [],
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-03-16T08:30:00Z",
  },
];

export const animals: Animal[] = [
  {
    id: "a1",
    name: "Bessie",
    species: "Cow",
    breed: "Holstein",
    age: 4,
    weight: 680,
    health: 95,
    status: "Lactating",
    location: "North Barn",
    image: "",
    vaccinations: [
      { name: "BVD", date: "2024-01-15" },
      { name: "IBR", date: "2024-01-15" },
      { name: "Anthrax", date: "2023-12-01" },
    ],
    medicalHistory: [
      { date: "2024-02-10", condition: "Mastitis", treatment: "Antibiotics" },
    ],
    productionHistory: [
      { date: "2024-03-15", product: "Milk", amount: 28 },
      { date: "2024-03-14", product: "Milk", amount: 26 },
      { date: "2024-03-13", product: "Milk", amount: 27 },
    ],
    gpsLocation: { lat: 40.713, lng: -74.006 },
  },
  {
    id: "a2",
    name: "Clover",
    species: "Sheep",
    breed: "Merino",
    age: 3,
    weight: 85,
    health: 88,
    status: "Grazing",
    location: "South Pasture",
    image: "",
    vaccinations: [
      { name: "Clostridial", date: "2024-02-01" },
      { name: "Pasteurella", date: "2024-02-01" },
    ],
    medicalHistory: [],
    productionHistory: [
      { date: "2024-03-10", product: "Wool", amount: 4.5 },
      { date: "2024-02-28", product: "Wool", amount: 4.2 },
    ],
    gpsLocation: { lat: 40.711, lng: -74.004 },
  },
  {
    id: "a3",
    name: "Henrietta",
    species: "Chicken",
    breed: "Rhode Island Red",
    age: 2,
    weight: 3.5,
    health: 92,
    status: "Laying",
    location: "Coop A",
    image: "",
    vaccinations: [
      { name: "Newcastle", date: "2024-01-20" },
      { name: "Avian Influenza", date: "2024-01-20" },
    ],
    medicalHistory: [],
    productionHistory: [
      { date: "2024-03-15", product: "Eggs", amount: 6 },
      { date: "2024-03-14", product: "Eggs", amount: 5 },
      { date: "2024-03-13", product: "Eggs", amount: 7 },
    ],
    gpsLocation: { lat: 40.714, lng: -74.002 },
  },
  {
    id: "a4",
    name: "Porky",
    species: "Pig",
    breed: "Yorkshire",
    age: 1.5,
    weight: 180,
    health: 75,
    status: "Growing",
    location: "Pig Barn",
    image: "",
    vaccinations: [
      { name: "PRRS", date: "2024-02-15" },
      { name: "PCV2", date: "2024-02-15" },
    ],
    medicalHistory: [
      { date: "2024-03-01", condition: "Minor infection", treatment: "Antibiotics" },
    ],
    productionHistory: [],
    gpsLocation: { lat: 40.712, lng: -74.005 },
  },
];

export const machinery: Machinery[] = [
  {
    id: "m1",
    name: "John Deere 8R",
    type: "Tractor",
    image: "",
    hoursUsed: 1240,
    fuelLevel: 45,
    status: "active",
    lastMaintenance: "2024-02-28",
    nextService: "2024-05-28",
    assignedWorker: "John Smith",
    location: "North Field",
    efficiency: 87,
  },
  {
    id: "m2",
    name: "Case IH 9250",
    type: "Harvester",
    image: "",
    hoursUsed: 890,
    fuelLevel: 30,
    status: "idle",
    lastMaintenance: "2024-03-01",
    nextService: "2024-06-01",
    assignedWorker: "Mike Johnson",
    location: "Machine Shed",
    efficiency: 92,
  },
  {
    id: "m3",
    name: "DJI Agras T40",
    type: "Drone",
    image: "",
    hoursUsed: 340,
    fuelLevel: 80,
    status: "active",
    lastMaintenance: "2024-03-10",
    nextService: "2024-04-10",
    assignedWorker: "Sarah Wilson",
    location: "South Meadow",
    efficiency: 95,
  },
  {
    id: "m4",
    name: "Hardi Commander",
    type: "Sprayer",
    image: "",
    hoursUsed: 560,
    fuelLevel: 60,
    status: "maintenance",
    lastMaintenance: "2024-03-05",
    nextService: "2024-03-20",
    assignedWorker: "Tom Brown",
    location: "Workshop",
    efficiency: 78,
  },
  {
    id: "m5",
    name: "Krone Big X",
    type: "Harvester",
    image: "",
    hoursUsed: 2100,
    fuelLevel: 25,
    status: "offline",
    lastMaintenance: "2024-02-15",
    nextService: "2024-03-25",
    assignedWorker: "Mike Johnson",
    location: "Machine Shed",
    efficiency: 72,
  },
];

export const workers: Worker[] = [
  {
    id: "w1",
    name: "John Smith",
    photo: "",
    role: "Senior Operator",
    experience: 12,
    skills: ["Tractor Operation", "Harvesting", "Irrigation", "Maintenance"],
    hourlyRate: 28,
    availability: "available",
    rating: 4.8,
    assignedTo: ["m1"],
    joinedDate: "2018-03-01",
  },
  {
    id: "w2",
    name: "Sarah Wilson",
    photo: "",
    role: "Drone Operator",
    experience: 5,
    skills: ["Drone Operation", "Field Analysis", "Data Processing", "GIS"],
    hourlyRate: 32,
    availability: "busy",
    rating: 4.6,
    assignedTo: ["m3"],
    joinedDate: "2020-06-15",
  },
  {
    id: "w3",
    name: "Mike Johnson",
    photo: "",
    role: "Harvester Operator",
    experience: 8,
    skills: ["Harvester Operation", "Maintenance", "Logistics"],
    hourlyRate: 25,
    availability: "available",
    rating: 4.5,
    assignedTo: ["m2", "m5"],
    joinedDate: "2019-11-01",
  },
  {
    id: "w4",
    name: "Emily Davis",
    photo: "",
    role: "Farm Hand",
    experience: 3,
    skills: ["Animal Care", "Field Work", "Fencing"],
    hourlyRate: 18,
    availability: "available",
    rating: 4.2,
    assignedTo: [],
    joinedDate: "2022-04-01",
  },
  {
    id: "w5",
    name: "Tom Brown",
    photo: "",
    role: "Mechanic",
    experience: 15,
    skills: ["Engine Repair", "Hydraulics", "Electrical", "Welding"],
    hourlyRate: 35,
    availability: "busy",
    rating: 4.9,
    assignedTo: ["m4"],
    joinedDate: "2016-01-15",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Irrigate North Field",
    description: "Schedule irrigation for the north field wheat crop based on moisture levels",
    type: "Irrigation",
    priority: "high",
    status: "todo",
    assignedTo: "John Smith",
    field: "North Field",
    dueDate: "2024-03-18",
    createdAt: "2024-03-16",
  },
  {
    id: "t2",
    title: "Harvest South Meadow",
    description: "Begin harvesting corn from South Meadow",
    type: "Harvesting",
    priority: "critical",
    status: "in_progress",
    assignedTo: "Mike Johnson",
    field: "South Meadow",
    dueDate: "2024-03-20",
    createdAt: "2024-03-15",
  },
  {
    id: "t3",
    title: "Fertilize East Orchard",
    description: "Apply nitrogen fertilizer to apple trees",
    type: "Fertilizing",
    priority: "medium",
    status: "todo",
    assignedTo: "John Smith",
    field: "East Orchard",
    dueDate: "2024-03-19",
    createdAt: "2024-03-16",
  },
  {
    id: "t4",
    title: "Vaccinate Cattle",
    description: "Annual vaccination for the cattle herd",
    type: "Livestock Care",
    priority: "high",
    status: "todo",
    assignedTo: "Emily Davis",
    dueDate: "2024-03-21",
    createdAt: "2024-03-14",
  },
  {
    id: "t5",
    title: "Drone Survey",
    description: "Aerial survey of all fields for health assessment",
    type: "Monitoring",
    priority: "medium",
    status: "in_progress",
    assignedTo: "Sarah Wilson",
    dueDate: "2024-03-17",
    createdAt: "2024-03-16",
  },
  {
    id: "t6",
    title: "Fix Hydraulic Leak",
    description: "Repair hydraulic system on Hardi Commander sprayer",
    type: "Maintenance",
    priority: "high",
    status: "review",
    assignedTo: "Tom Brown",
    field: "Workshop",
    dueDate: "2024-03-16",
    createdAt: "2024-03-15",
  },
  {
    id: "t7",
    title: "Plant Cover Crop",
    description: "Plant winter cover crop in Central Valley",
    type: "Planting",
    priority: "low",
    status: "todo",
    assignedTo: "Emily Davis",
    field: "Central Valley",
    dueDate: "2024-03-25",
    createdAt: "2024-03-16",
  },
  {
    id: "t8",
    title: "Spray Pesticide",
    description: "Apply pesticide to West Pasture soybeans",
    type: "Spraying",
    priority: "high",
    status: "todo",
    assignedTo: "Sarah Wilson",
    field: "West Pasture",
    dueDate: "2024-03-19",
    createdAt: "2024-03-16",
  },
];

export const transactions: Transaction[] = [
  { id: "tr1", type: "income", category: "Crop Sales", amount: 45000, description: "Wheat harvest sale", date: "2024-03-15", status: "completed" },
  { id: "tr2", type: "expense", category: "Equipment", amount: 12000, description: "Tractor maintenance", date: "2024-03-14", status: "completed" },
  { id: "tr3", type: "income", category: "Dairy", amount: 5800, description: "Milk sales - March", date: "2024-03-13", status: "completed" },
  { id: "tr4", type: "expense", category: "Labor", amount: 8500, description: "Weekly payroll", date: "2024-03-12", status: "completed" },
  { id: "tr5", type: "expense", category: "Supplies", amount: 3400, description: "Fertilizer purchase", date: "2024-03-11", status: "completed" },
  { id: "tr6", type: "income", category: "Livestock", amount: 12000, description: "Lamb sale", date: "2024-03-10", status: "completed" },
  { id: "tr7", type: "expense", category: "Utilities", amount: 2100, description: "Water & electricity", date: "2024-03-09", status: "pending" },
  { id: "tr8", type: "income", category: "Crop Sales", amount: 32000, description: "Corn harvest", date: "2024-03-08", status: "completed" },
  { id: "tr9", type: "expense", category: "Insurance", amount: 1500, description: "Monthly premium", date: "2024-03-07", status: "pending" },
  { id: "tr10", type: "income", category: "Eggs", amount: 2400, description: "Egg sales", date: "2024-03-06", status: "completed" },
];

export const marketplaceItems: MarketplaceItem[] = [
  { id: "mp1", name: "Premium Wheat Seeds", category: "Seeds", price: 45, quantity: 100, seller: "GreenGrow Co.", image: "", description: "High-yield winter wheat seeds, disease resistant", rating: 4.5, location: "Iowa" },
  { id: "mp2", name: "Organic Fertilizer 20-20-20", category: "Fertilizers", price: 32, quantity: 200, seller: "NutriField Inc.", image: "", description: "Balanced NPK fertilizer for all crop types", rating: 4.3, location: "Ohio" },
  { id: "mp3", name: "Holstein Heifer", category: "Animals", price: 1800, quantity: 5, seller: "DairyBest Farms", image: "", description: "Registered Holstein heifers, vaccinated", rating: 4.8, location: "Wisconsin" },
  { id: "mp4", name: "Used Tractor Tires", category: "Equipment", price: 750, quantity: 4, seller: "FarmParts USA", image: "", description: "28-inch tractor tires, good condition", rating: 4.0, location: "Texas" },
  { id: "mp5", name: "Irrigation System", category: "Equipment", price: 4500, quantity: 1, seller: "AquaFarm Systems", image: "", description: "Complete pivot irrigation system, 40 acres coverage", rating: 4.6, location: "Nebraska" },
  { id: "mp6", name: "Free-Range Chickens", category: "Animals", price: 15, quantity: 50, seller: "Happy Hen Farm", image: "", description: "Heritage breed laying hens", rating: 4.7, location: "Pennsylvania" },
  { id: "mp7", name: "Spraying Service", category: "Services", price: 25, quantity: 1, seller: "AeroSpray LLC", image: "", description: "Professional aerial spraying per acre", rating: 4.4, location: "Regional" },
  { id: "mp8", name: "Seasonal Farm Hand", category: "Workers", price: 18, quantity: 3, seller: "AgriStaff Agency", image: "", description: "Experienced seasonal workers available", rating: 4.2, location: "Various" },
];

export const notifications = [
  { id: "n1", title: "Rain expected tomorrow", description: "60% chance of rain, consider delaying irrigation", type: "weather", time: "2 min ago", read: false },
  { id: "n2", title: "Disease detected", description: "Early blight detected in East Orchard via drone scan", type: "alert", time: "15 min ago", read: false },
  { id: "n3", title: "Low moisture alert", description: "South Meadow moisture below 50%", type: "warning", time: "1 hour ago", read: false },
  { id: "n4", title: "Task completed", description: "Mike completed harvesting South Meadow corn", type: "success", time: "2 hours ago", read: false },
  { id: "n5", title: "Maintenance due", description: "Krone Big X harvester due for service in 3 days", type: "warning", time: "3 hours ago", read: true },
  { id: "n6", title: "Harvest ready", description: "West Pasture soybeans ready for harvest", type: "success", time: "5 hours ago", read: true },
];

export const weatherData = {
  current: {
    temperature: 22,
    humidity: 65,
    rain: 30,
    wind: 12,
    condition: "Partly Cloudy",
    icon: "cloud-sun",
  },
  forecast: [
    { day: "Mon", temp: 23, humidity: 60, rain: 20, wind: 10, condition: "Sunny" },
    { day: "Tue", temp: 20, humidity: 70, rain: 60, wind: 15, condition: "Rainy" },
    { day: "Wed", temp: 18, humidity: 75, rain: 80, wind: 20, condition: "Stormy" },
    { day: "Thu", temp: 21, humidity: 55, rain: 10, wind: 8, condition: "Sunny" },
    { day: "Fri", temp: 24, humidity: 50, rain: 5, wind: 6, condition: "Sunny" },
    { day: "Sat", temp: 22, humidity: 65, rain: 40, wind: 12, condition: "Cloudy" },
    { day: "Sun", temp: 19, humidity: 70, rain: 50, wind: 14, condition: "Rainy" },
  ],
};

export const analyticsData = {
  cropHealth: [
    { month: "Jan", wheat: 85, corn: 78, soybeans: 82, apples: 70 },
    { month: "Feb", wheat: 80, corn: 75, soybeans: 85, apples: 65 },
    { month: "Mar", wheat: 92, corn: 78, soybeans: 88, apples: 45 },
    { month: "Apr", wheat: 88, corn: 82, soybeans: 80, apples: 55 },
    { month: "May", wheat: 75, corn: 85, soybeans: 72, apples: 60 },
    { month: "Jun", wheat: 70, corn: 80, soybeans: 68, apples: 75 },
  ],
  revenue: [
    { month: "Oct", income: 45000, expenses: 28000 },
    { month: "Nov", income: 38000, expenses: 25000 },
    { month: "Dec", income: 42000, expenses: 30000 },
    { month: "Jan", income: 35000, expenses: 22000 },
    { month: "Feb", income: 52000, expenses: 31000 },
    { month: "Mar", income: 48000, expenses: 27000 },
  ],
  yieldPrediction: [
    { year: "2019", wheat: 48, corn: 140, soybeans: 42 },
    { year: "2020", wheat: 52, corn: 152, soybeans: 45 },
    { year: "2021", wheat: 45, corn: 138, soybeans: 40 },
    { year: "2022", wheat: 55, corn: 160, soybeans: 48 },
    { year: "2023", wheat: 58, corn: 165, soybeans: 50 },
    { year: "2024", wheat: 62, corn: 172, soybeans: 53 },
  ],
};

