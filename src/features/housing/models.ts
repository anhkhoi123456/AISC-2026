import type { Listing } from "@/shared/lib/models";
export type PhysicalRoom = {
  id: string;
  managerId: string;
  capacity: number;
  externalResidents: number;
  roommatePolicy: "closed" | "approval" | "open";
  allowedRecruiters: string[];
};
export type Stay = {
  id: string;
  roomId: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  tenantName: string;
  plannedDate: string;
  moveInDate?: string;
  moveOutDate?: string;
  status:
    "requested" | "handover" | "active" | "leaving" | "ended" | "rejected";
  accepted: string[];
  handover: string[];
  exitConfirmed: string[];
  verificationSource?: "two-sided" | "admin-sample";
  snapshot: Listing;
  sharers: number;
  contract: { version: number; mode: "paper" | "electronic"; text: string };
  inventory: string;
  electricityMeter: number;
  waterMeter: number;
  exitReason?: string;
  deposit: {
    amount: number;
    payment: PaymentStatus;
    method?: string;
    deduction: number;
    reason: string;
    response: "none" | "accepted" | "disputed";
    refund: "pending" | "declared" | "received";
  };
};
export type PaymentStatus =
  "unpaid" | "declared" | "checking" | "received" | "disputed";
export type Bill = {
  id: string;
  stayId: string;
  period: string;
  due: string;
  total: number;
  kwh: number;
  vehicles: number;
  adjustment: number;
  reason: string;
  terms: Listing;
  status: PaymentStatus;
  method?: string;
};
export type RoomReview = {
  id: string;
  roomId: string;
  stayId: string;
  tenantId: string;
  name: string;
  stars: number;
  criteria: number[];
  text: string;
  date: string;
  reply: string;
  hidden: boolean;
  edits: number;
};
export type HousingCase = {
  id: string;
  type: "residency" | "exit" | "review" | "trust" | "deposit";
  target: string;
  requester: string;
  evidence: string;
  status: "new" | "more" | "accepted" | "rejected";
  reason: string;
  reviewer?: string;
  decidedAt?: string;
};
export type HousingEvent = {
  id: string;
  roomId: string;
  kind: string;
  actor: string;
  date: string;
  reason: string;
  before?: string;
  after?: string;
};
export type HousingState = {
  placeOverrides?: import("@/features/search/mocks/places").Place[];
  rooms: PhysicalRoom[];
  stays: Stay[];
  bills: Bill[];
  reviews: RoomReview[];
  cases: HousingCase[];
  events: HousingEvent[];
  versions: {
    id: string;
    listingId: string;
    roomId: string;
    date: string;
    snapshot: Listing;
  }[];
  notifications: {
    id: string;
    recipient: string;
    text: string;
    href: string;
    date: string;
    read: boolean;
  }[];
  changes: {
    id: string;
    stayId: string;
    price: number;
    date: string;
    reason: string;
    status: "proposed" | "accepted" | "rejected";
  }[];
  permissions: {
    id: string;
    roomId: string;
    tenantId: string;
    stayId: string;
    status: "pending" | "accepted" | "rejected";
  }[];
  follows: { roomId: string; accountId: string }[];
  trustAdjustments: {
    caseId: string;
    roomId: string;
    amount: number;
    reason: string;
  }[];
  listingDrafts: Record<string, { listing: Listing; step: number }>;
};
