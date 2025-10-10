export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UsedBoardStatus {
  PENDING_VALIDATION = "PENDING_VALIDATION",
  VALIDATED = "VALIDATED",
  REJECTED = "REJECTED",
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  RECYCLED_TO_PRODUCT = "RECYCLED_TO_PRODUCT",
  SOLD = "SOLD",
}

export enum BoardCondition {
  GOOD = "GOOD",
  AVERAGE = "AVERAGE",
  BAD = "BAD",
}

export enum BoardType {
  SKATE = "SKATE",
  CRUISER = "CRUISER",
  LONG = "LONG",
}

export enum PointsType {
  PURCHASE = "PURCHASE",
  RECYCLING = "RECYCLING",
  ADJUSTMENT_RECYCLING = "ADJUSTMENT_RECYCLING",
}

export enum ProductStatus {
  CATALOG = "CATALOG",
  SOLD = "SOLD",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export enum NotificationTarget {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum PaymentType {
  EURO = "EURO",
  POINTS = "POINTS",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
