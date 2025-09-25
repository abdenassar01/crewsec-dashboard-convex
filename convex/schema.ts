import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const controlFeeStatus = v.union(
    v.literal("AWAITING"),
    v.literal("PAID"),
    v.literal("CANCELED"),
    v.literal("CONFLICT")
  );
const vehicleControlStatus = v.union(
    v.literal("CREATED"),
    v.literal("PAID"),
    v.literal("UNPAID")
  );

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("CLIENT"), v.literal("EMPLOYER"), v.literal("ADMIN")),
    enabled: v.optional(v.boolean()),
    userId: v.string(), // Link to auth system user
  }).index("by_email", ["email"]),

  parkings: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    website: v.string(),
    address: v.string(),
    userId: v.id("users"),
    unresolvedMarkuleras: v.number(),
    unresolvedFelparkering: v.number(),
  }).index("by_userId", ["userId"]),

  parkingAvailability: defineTable({
    parkingId: v.id("parkings"),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("AVAILABLE"), v.literal("BOOKED"), v.literal("MAINTENANCE")),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  }).index("by_parkingId", ["parkingId"]).index("by_date_range", ["startDate", "endDate"]),

  vehicles: defineTable({
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
    parkingId: v.id("parkings"),
  }).index("by_parkingId", ["parkingId"]).searchIndex("by_reference", {
    searchField: "reference",
    filterFields: ["parkingId"],
  }),

  canceledViolations: defineTable({
    reference: v.string(),
    cause: v.union(v.literal("FELPARKERING"), v.literal("MAKULERA")),
    resolved: v.boolean(),
    parkingId: v.id("parkings"),
  }).index("by_parkingId", ["parkingId"]),

  controlFees: defineTable({
    reference: v.string(),
    mark: v.string(),
    ticketUrl: v.optional(v.string()),
    easyParkResponse: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    status: controlFeeStatus,
    galleryStorageIds: v.array(v.id("_storage")), // Storing image IDs
    townId: v.id("towns"),
    locationViolationId: v.id("locationViolations"),
  }).index("by_townId", ["townId"]).index("by_locationViolationId", ["locationViolationId"]),

  violationControls: defineTable({
    reference: v.string(),
    description: v.string(),
    vehicle: v.string(),
    status: vehicleControlStatus,
    signChecked: v.boolean(),
    imagesChecked: v.boolean(),
    imagesStorageIds: v.optional(v.array(v.id("_storage"))),
    locationViolationId: v.id("locationViolations"),
  }).searchIndex("by_reference", {
    searchField: "reference"
  }),

  // Static Data Tables
  carBrands: defineTable({
    label: v.string(),
  }).searchIndex("by_label", { searchField: "label" }),

  locations: defineTable({
    label: v.string(),
  }).searchIndex("by_label", { searchField: "label" }),

  violations: defineTable({
    label: v.string(),
    number: v.number(),
  }).searchIndex("by_label", { searchField: "label" }),

  towns: defineTable({
    label: v.string(),
    number: v.number(),
    locationId: v.id("locations"),
  }).index("by_locationId", ["locationId"])
    .searchIndex("by_label", {
        searchField: "label",
        filterFields: ["locationId"]
    }),

  locationViolations: defineTable({
    price: v.number(),
    locationId: v.id("locations"),
    violationId: v.id("violations"),
  }).index("by_locationId", ["locationId"])
    .index("by_violationId", ["violationId"]),

  pushNotificationParams: defineTable({
    userId: v.id("users"),
    expoPushToken: v.string(),
  }).index("by_userId", ["userId"]),
})