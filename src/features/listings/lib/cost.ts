import type { Listing } from "@/shared/lib/models";
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
  const common = (room.price + room.internet + room.cleaning) / people;
  const electric =
    room.electricity === null ? null : (room.electricity * kwh) / people;
  return {
    common,
    electric,
    water: room.water,
    parking: room.parking * vehicles,
    total: common + (electric ?? 0) + room.water + room.parking * vehicles,
    complete: electric !== null,
    deposit: room.price / people,
  };
}
