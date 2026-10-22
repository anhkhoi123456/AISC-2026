import type { Listing } from "@/shared/lib/models";
export const areas = [
  "Gần ĐH Công nghệ Thông tin",
  "Gần ĐH Bách Khoa",
  "Gần ĐH Khoa học Tự nhiên",
  "KTX khu A",
  "KTX khu B",
];
export const roomImages = ["/images/student-room.jpg", "/images/room-2.jpg"];
export const initialListings: Listing[] = [
  {
    id: "phong-ban-cong",
    title: "Phòng 28 m² có ban công và bếp riêng",
    area: areas[0],
    address: "Đường Hàn Thuyên, khu vực Làng Đại học",
    image: roomImages[0],
    price: 3200000,
    size: 28,
    capacity: 2,
    internet: 100000,
    cleaning: 40000,
    electricity: 3500,
    water: 60000,
    parking: 100000,
    pets: true,
    amenities: ["Máy lạnh", "WC riêng", "Ban công", "Bếp riêng"],
    status: "published",
    owner: "Cô Hạnh",
    updated: "2026-10-19",
    demo: true,
  },
  {
    id: "studio-cua-so",
    title: "Studio 24 m² có cửa sổ, WC riêng",
    area: areas[1],
    address: "Đường Tạ Quang Bửu, khu vực Làng Đại học",
    image: roomImages[1],
    price: 2800000,
    size: 24,
    capacity: 2,
    internet: 100000,
    cleaning: 40000,
    electricity: 3500,
    water: 60000,
    parking: 100000,
    pets: false,
    amenities: ["Nội thất", "WC riêng", "Cửa sổ", "Chỗ để xe"],
    status: "published",
    owner: "Anh Minh",
    updated: "2026-10-18",
    demo: true,
  },
  {
    id: "can-phong-xanh",
    title: "Căn phòng xanh bên khung cửa",
    area: areas[2],
    address: "Đường Nguyễn Du, khu vực Làng Đại học",
    image: roomImages[0],
    price: 3600000,
    size: 32,
    capacity: 3,
    internet: 100000,
    cleaning: 40000,
    electricity: 3500,
    water: 60000,
    parking: 100000,
    pets: true,
    amenities: ["Máy lạnh", "WC riêng", "Bếp riêng", "Nội thất"],
    status: "published",
    owner: "Chị Mai",
    updated: "2026-10-19",
    demo: true,
  },
  {
    id: "phong-gan-ktx",
    title: "Phòng 22 m² có WC riêng, chỗ để xe",
    area: areas[3],
    address: "Khu dân cư gần KTX khu A",
    image: roomImages[1],
    price: 2400000,
    size: 22,
    capacity: 2,
    internet: 100000,
    cleaning: 40000,
    electricity: null,
    water: 60000,
    parking: 100000,
    pets: false,
    amenities: ["WC riêng", "Chỗ để xe", "Cửa sổ"],
    status: "published",
    owner: "Chú Thành",
    updated: "2026-10-17",
    demo: true,
  },
  {
    id: "tin-cua-ban",
    title: "Phòng 26 m² có bếp riêng, chỗ để xe",
    area: areas[0],
    address: "Đường Hàn Thuyên, Làng Đại học",
    image: roomImages[1],
    price: 3000000,
    size: 26,
    capacity: 2,
    internet: 100000,
    cleaning: 40000,
    electricity: 3500,
    water: 60000,
    parking: 100000,
    pets: true,
    amenities: ["WC riêng", "Bếp riêng", "Chỗ để xe"],
    status: "pending",
    owner: "Bạn",
    updated: "2026-10-19",
    demo: true,
  },
];

initialListings.splice(
  initialListings.findIndex((r) => r.id === "can-phong-xanh"),
  1,
);
initialListings.forEach((r, i) => {
  r.trustEvidence ??= {
    ownerScore: 42,
    checkedImages: 0,
    video: false,
    rentalRight: false,
    flags: [],
    validReports: 0,
  };
  r.floor ??= i + 1;
  r.elevator ??= i > 1;
  r.view ??= i === 0 ? "Ban công" : "Cửa sổ";
  r.roomNoise ??= 2;
  r.depositMonths ??= 1;
  r.allowedPets ??= r.pets ? ["cat"] : [];
  r.feeStates ??= {
    internet: { status: "charged", amount: r.internet },
    cleaning: { status: "charged", amount: r.cleaning },
    electricity: {
      status: r.electricity === null ? "unknown" : "charged",
      amount: r.electricity,
    },
    water: { status: "charged", amount: r.water },
    parking: { status: "charged", amount: r.parking },
    management: { status: "included", amount: 0 },
    extraGuest: { status: "none", amount: 0 },
    laundry: { status: "included", amount: 0 },
    transfer: { status: "none", amount: 0 },
  };
  r.kind ??= i % 2 === 0 ? "Phòng trọ" : "Studio";
  r.leaseMonths ??= 6;
  r.rules ??=
    "Giờ giấc tự do. Giữ yên tĩnh sau 22h. Khách ở lại và chuyển đi sớm cần thống nhất trước.";
});

const sampleCoordinates = [
  { lat: 10.8735, lng: 106.8006 },
  { lat: 10.879, lng: 106.806 },
  { lat: 10.867, lng: 106.793 },
  { lat: 10.876, lng: 106.803 },
];
initialListings.forEach((r, i) => {
  r.locationConfirmed=true;
  r.roomId = r.id;
  r.ownerId = "owner-demo";
  r.location = sampleCoordinates[i];
  r.verification = {
    contact: true,
    identity: true,
    rentalRight: r.status === "published",
    checkedAt: "2026-10-22T03:00:00Z",
  };
  r.advanceMonths = 1;
  r.refundTerms =
    "Đối chiếu khi bàn giao lại, khấu trừ chỉ khi có lý do và phản hồi.";
  r.conditionalFees =
    "Khách ở lại và chuyển nhượng phải thỏa thuận riêng; không cộng vào tháng bình thường.";
  Object.values(r.feeStates || {}).forEach((f) => {
    if (f.status === "included") f.includedIn = "Tiền thuê phòng";
  });
});
