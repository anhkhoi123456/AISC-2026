import type { HousingState } from "@/features/housing/models";
export type Status =
  "guest" | "pending" | "active" | "review" | "rejected" | "blocked";
export type ListingStatus =
  | "published"
  | "draft"
  | "pending"
  | "changes"
  | "rejected"
  | "hidden"
  | "rented"
  | "closed";
export type FeeStatus = "charged" | "included" | "none" | "unknown";
export type FeeKey =
  | "internet"
  | "cleaning"
  | "electricity"
  | "water"
  | "parking"
  | "management"
  | "extraGuest"
  | "laundry"
  | "transfer";
export type Fee = {
  status: FeeStatus;
  amount: number | null;
  includedIn?: string;
};
export type Identity = {
  checkedAt?: string;
  name: string;
  gender: string;
  birthYear: number;
  occupation: string;
  otp: boolean;
  verified: boolean;
};
export type Listing = {
  posterCapacity?: string;
  roomId?: string;
  ownerId?: string;
  locationConfirmed?: boolean;
  location?: { lat: number; lng: number };
  verification?: {
    contact: boolean;
    identity: boolean;
    rentalRight: boolean;
    checkedAt: string;
  };
  advanceMonths?: number;
  refundTerms?: string;
  conditionalFees?: string;
  verifiedReportIds?: string[];
  feeStates?: Partial<Record<FeeKey, Fee>>;
  depositMonths?: number;
  allowedPets?: ("cat" | "dog")[];
  floor?: number;
  elevator?: boolean;
  view?: string;
  roomNoise?: number;
  trustEvidence?: {
    ownerScore: number;
    checkedImages: number;
    video: boolean;
    rentalRight: boolean;
    flags: ("lowPrice" | "images" | "fraud")[];
    validReports: number;
  };
  id: string;
  title: string;
  area: string;
  address: string;
  image: string;
  price: number;
  size: number;
  capacity: number;
  internet: number;
  cleaning: number;
  electricity: number | null;
  water: number;
  parking: number;
  pets: boolean;
  amenities: string[];
  status: ListingStatus;
  owner: string;
  updated: string;
  note?: string;
  demo: boolean;
  kind?: string;
  leaseMonths?: number;
  rules?: string;
};
export type Criterion =
  | "area"
  | "budget"
  | "lease"
  | "sleep"
  | "tidy"
  | "smoking"
  | "guests"
  | "noise"
  | "food"
  | "pets";
export type Importance = "must" | "important" | "normal" | "ignore";
export type Profile = {
  areas: string[];
  anchor: string;
  commuteMax: number;
  commuteSamples: Record<string, number>;
  monthsMax: number;
  vacancies: number;
  floorMin: number;
  floorMax: number;
  elevator: boolean;
  view: string;
  roomNoiseMax: number;
  requiredAmenities: string[];
  maxDepositMonths: number;
  maxElectricity: number;
  maxExtraFees: number;
  alcohol: number;
  alcoholMax: number;
  guestsMax: number;
  cooking: string;
  diet: string;
  chores: string;
  nightShift: boolean;
  personality: string;
  interests: string[];
  name: string;
  gender: string;
  scenario: string;
  area: string;
  min: number;
  max: number;
  moveFrom: string;
  moveTo: string;
  months: number;
  sleep: string;
  tidy: number;
  smoke: boolean;
  noSmoke: boolean;
  petType: "cat" | "dog";
  pets: boolean;
  acceptPets: boolean;
  bio: string;
  visible: boolean;
  roomId: string;
  quiet: boolean;
  noise: number;
  guests: number;
  food: string;
  importance: Record<Criterion, Importance>;
};
export type Person = Profile & {
  id: string;
  school: string;
  avatar: string;
  likesYou: boolean;
};
export type Report = {
  id: string;
  target: string;
  reason: string;
  detail: string;
  status: "new" | "review" | "closed" | "needs-info";
  decision?: string;
  appeal?: string;
  previousStatus?: ListingStatus;
  previousProfileHidden?: boolean;
};
export type Message = { id: string; text: string; mine: boolean; time: string };
export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  type: "roommatch" | "listing";
  sharing?: { mine: boolean; theirs: boolean };
  ended: boolean;
  messages: Message[];
};

export type Role = "guest" | "tenant" | "landlord" | "admin";
export type DemoState = {
  housing: HousingState;
  identity?: Identity;
  lastSwipe?: {
    id: string;
    likes: string[];
    passed: string[];
    conversationIds: string[];
  };
  status: Status;
  role: Role;
  name: string;
  saved: string[];
  listings: Listing[];
  profile: Profile;
  draft: Profile | null;
  draftStep: number;
  likes: string[];
  passed: string[];
  blocked: string[];
  hiddenProfiles: string[];
  conversations: Conversation[];
  reports: Report[];
  logs: string[];
  contractText: string;
};
