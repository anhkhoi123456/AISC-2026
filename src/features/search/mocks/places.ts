import { areas } from "@/features/listings/mocks/listings";
export type Place = {
  id: string;
  name: string;
  kind: "Trường" | "Metro" | "Siêu thị" | "Chợ" | "Bệnh viện";
  aliases: string[];
  area: string;
};
export const places: Place[] = [
  {
    id: "uit",
    name: "Đại học Công nghệ Thông tin",
    kind: "Trường",
    aliases: ["uit", "dh cntt", "cong nghe thong tin"],
    area: areas[0],
  },
  {
    id: "hcmut",
    name: "Đại học Bách Khoa",
    kind: "Trường",
    aliases: ["hcmut", "bach khoa", "bk"],
    area: areas[1],
  },
  {
    id: "hcmus",
    name: "Đại học Khoa học Tự nhiên",
    kind: "Trường",
    aliases: ["hcmus", "khtn", "tu nhien"],
    area: areas[2],
  },
  {
    id: "ussh",
    name: "Đại học Khoa học Xã hội và Nhân văn",
    kind: "Trường",
    aliases: ["ussh", "nhan van", "xh nv"],
    area: areas[3],
  },
  {
    id: "iu",
    name: "Đại học Quốc tế",
    kind: "Trường",
    aliases: ["iu", "quoc te"],
    area: areas[2],
  },
  {
    id: "uel",
    name: "Đại học Kinh tế – Luật",
    kind: "Trường",
    aliases: ["uel", "kinh te luat"],
    area: areas[4],
  },
  {
    id: "metro-dhqg",
    name: "Ga Đại học Quốc gia",
    kind: "Metro",
    aliases: ["metro", "ga dhqg", "tau dien"],
    area: areas[1],
  },
  {
    id: "metro-cong-nghe-cao",
    name: "Ga Khu Công nghệ cao",
    kind: "Metro",
    aliases: ["metro", "tau dien", "khu cong nghe cao"],
    area: areas[4],
  },
  {
    id: "market-student",
    name: "Chợ sinh viên Làng Đại học (mẫu)",
    kind: "Chợ",
    aliases: ["cho", "cho sinh vien"],
    area: areas[3],
  },
  {
    id: "supermarket",
    name: "Siêu thị khu Đại học (mẫu)",
    kind: "Siêu thị",
    aliases: ["sieu thi", "bach hoa", "tap hoa"],
    area: areas[0],
  },
  {
    id: "hospital",
    name: "Bệnh viện khu Đại học (mẫu)",
    kind: "Bệnh viện",
    aliases: ["benh vien", "phong kham", "y te"],
    area: areas[2],
  },
];
