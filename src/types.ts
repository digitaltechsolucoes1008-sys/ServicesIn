export interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
}

export interface Service {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: 'hora' | 'dia' | 'trabalho';
  experienceYears: number;
  workingDays: string[];
  contactInfo: string;
  providerName?: string;
}

export interface Booking {
  id: number;
  serviceId: number;
  customerId: number;
  status: string;
  createdAt: string;
  serviceTitle: string;
  providerName: string;
  providerEmail: string;
}
