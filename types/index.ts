export type FuelType = "Flex" | "Gasolina" | "Diesel" | "Eletrico" | "Hibrido";

export type UserTier = "Bronze" | "Prata" | "Ouro" | "Platinum";

export type ServiceStatus =
  | "Agendado"
  | "Confirmado"
  | "Em andamento"
  | "Concluido"
  | "Cancelado";

export type RewardTransactionType = "earn" | "redeem";

export type RewardCategory = "discount" | "product" | "service" | "experience";

export type UrgencyLevel = "Baixa" | "Media" | "Alta" | "Critica";

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  points: number;
  tier: UserTier;
  memberSince: string;
  avatar: string;
}

export interface VehicleSystemScores {
  motor: number;
  freios: number;
  pneus: number;
  suspensao: number;
  arCondicionado: number;
  fluidos: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  mileage: number;
  fuelType: FuelType;
  color: string;
  chassi: string;
  healthScore: number;
  lastService: string;
  nextService: string;
  systems: VehicleSystemScores;
}

export interface Dealership {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  distanceKm: number;
  rating: number;
  availableSlots: number;
  phone: string;
}

export interface ServiceDetail {
  label: string;
  value: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: string;
  date: string;
  time?: string;
  dealershipId: string;
  dealershipName: string;
  mileage: number;
  cost?: number;
  status: ServiceStatus;
  notes?: string;
  details: ServiceDetail[];
}

export interface MaintenanceRecommendation {
  id: string;
  vehicleId: string;
  icon: string;
  name: string;
  dueDate?: string;
  dueMileage?: number;
  urgency: UrgencyLevel;
  description: string;
}

export interface Reward {
  id: string;
  icon: string;
  title: string;
  description: string;
  pointsNeeded: number;
  category: RewardCategory;
}

export interface RewardTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: RewardTransactionType;
}

export interface EarnMethod {
  id: string;
  icon: string;
  title: string;
  points: number;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FipeModel {
  codigo: string;
  nome: string;
}

export interface FipeModelsResponse {
  modelos: FipeModel[];
  anos: FipeModel[];
}

export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface NewVehicleInput {
  brand: string;
  model: string;
  version: string;
  year: number;
  plate: string;
  mileage: number;
  fuelType: FuelType;
  color: string;
}

export interface NewServiceInput {
  vehicleId: string;
  serviceTypes: string[];
  mileage: number;
  dealershipId: string;
  date: string;
  time: string;
  notes: string;
}

export interface TierDefinition {
  tier: UserTier;
  min: number;
  max?: number;
  color: string;
}

export interface StorageSeed {
  user: User;
  vehicles: Vehicle[];
  services: ServiceRecord[];
  rewards: RewardTransaction[];
}
