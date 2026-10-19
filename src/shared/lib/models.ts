export type Status =
  "guest" | "pending" | "active" | "review" | "rejected" | "blocked";
export type ListingStatus =
  | "published"
  | "draft"
  | "pending"
  | "changes"
  | "rejected"
  | "hidden"
  | "rented";
export type Listing = {
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
  ended: boolean;
  messages: Message[];
};

export type Role = "guest" | "tenant" | "landlord" | "admin";
export type DemoState = {
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
