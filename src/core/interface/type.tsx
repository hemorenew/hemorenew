/* eslint-disable @typescript-eslint/no-explicit-any */

// Auth Types
export type AuthServiceProps = {
  validate: (password: string, dbPassword: string) => Promise<boolean>;
};

// User Types
export type User = {
  id: string | number;
  firstName: string;
  lastName: string;
  token: string;
  tokenExpires: number;
  profession?: string;
  ci?: string;
  phone?: string;
  user?: string;
  password?: string;
  status?: string;
};

// New User Types
export type NewUser = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

// IronSession Types
export type IronSessionProps = {
  password: string;
  cookieName: string;
};

// AuthContext Types
export type AuthContextType = {
  isLoggedIn: boolean;
  userData: UserDataType;
  userLoaded: boolean;
  mutateUser: (user: any) => void;
};

export type UserDataType = {
  id: number;
  name: string;
  token: string;
  tokenExpires: string;
};

// Patient Types
export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  ci?: string;
  birthDate?: string;
  phone?: string;
  dryWeight?: number;
  attended?: User;
  status?: string;
}

// Filter Types
export interface Filter {
  _id: string;
  patient: Patient;
  brand: string;
  model: string;
  primingReal: number;
  firstUse: Date;
  status: string;
}

// Washing Types
export interface Washing {
  _id: string;
  patient: Patient;
  filter: Filter;
  attended: User;
  residualVolume: number;
  integrityTest: number;
  startDate: string;
  status?: string;
}

// Filter Usage Types
export interface FilterUsage {
  filter: {
    brand: string;
    model: string;
    firstUse: Date;
    status: string;
  };
  count: number;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

// Modal Props Types
export interface FilterModalProps {
  filter: {
    brand: string;
    model: string;
    firstUse: Date;
    status: string;
  };
  count: number;
  onClose: () => void;
  data: ChartData;
}

export interface WashingModalProps {
  washing: Washing;
  onClose: () => void;
}

// Carousel Types
export interface CarouselItem {
  image: string;
  title: string;
  description: string;
  details: string;
}

export interface CarouselProps {
  onStart: () => void;
  user: any;
}

// Navigation Types
export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}

// Database Connection Types
export interface ConnectionState {
  isConnected: boolean;
}
