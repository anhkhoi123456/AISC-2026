import type { Listing } from "@/shared/lib/models";
import { feeAmount, feeKeys } from "./fees";
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
export function cost(room: Listing, people = 2, kwh = 120, vehicles = 1) {
  if (
    !Number.isInteger(people) ||
    people < 1 ||
    people > room.capacity ||
    !Number.isFinite(kwh) ||
    kwh < 0 ||
    !Number.isInteger(vehicles) ||
    vehicles < 0
  )
    throw new Error("Số người hoặc mức sử dụng chưa hợp lệ.");
  const amounts = Object.fromEntries(
    feeKeys.map((k) => [k, feeAmount(room, k)]),
  );
  const unknown = feeKeys.filter(
    (k) => !["transfer", "extraGuest"].includes(k) && amounts[k] === null,
  );
  const common =
    (room.price +
      (amounts.internet ?? 0) +
      (amounts.cleaning ?? 0) +
      (amounts.management ?? 0)) /
    people;
  const electric =
    amounts.electricity === null ? null : (amounts.electricity * kwh) / people;
  const water = amounts.water ?? 0,
    parking = (amounts.parking ?? 0) * vehicles;
  const extras =
    water +
    parking +
    (amounts.laundry ?? 0) +
    (common - room.price / people) +
    (electric ?? 0);
  return {
    common,
    electric,
    water,
    parking,
    extras,
    total: room.price / people + extras,
    complete: unknown.length === 0,
    unknown,
    deposit: (room.price * (room.depositMonths ?? 1)) / people,
    transfer: amounts.transfer,
    extraGuest: amounts.extraGuest,
    initial:
      room.price / people +
      extras +
      (room.price * (room.depositMonths ?? 1)) / people +
      (room.price * Math.max(0, (room.advanceMonths ?? 1) - 1)) / people,
  };
}
