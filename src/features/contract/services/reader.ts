import { normalize } from "@/features/search/lib/text";
import { delay } from "@/services/latency";
export const contractSample = `HỢP ĐỒNG THUÊ PHÒNG — VĂN BẢN MẪU DEMO
1. Giá thuê: 3.000.000 đồng/tháng. Điện, nước thanh toán theo phụ lục.
2. Người thuê đặt cọc 2 tháng tiền phòng. Tiền cọc không được khấu trừ vào tiền thuê tháng cuối.
3. Bên cho thuê được tăng giá và các khoản phí bất kỳ lúc nào mà không báo trước.
4. Tiền cọc không hoàn lại nếu người thuê chuyển đi trước hạn, kể cả khi đã báo trước.
5. Bên cho thuê có quyền chấm dứt thuê ngay lập tức, không cần báo trước cho người thuê.
6. Hai bên ký xác nhận sau khi đã đọc và thống nhất nội dung.`;
export const clearerSample = `HỢP ĐỒNG THUÊ — MẪU THAM KHẢO DEMO
1. Giá phòng là 3.000.000 đồng/tháng trong 12 tháng.
2. Đặt cọc một tháng tiền phòng. Hoàn cọc trong 7 ngày sau bàn giao, trừ khoản thiệt hại có chứng từ được hai bên xác nhận.
3. Tăng giá tối đa 5% khi gia hạn, báo trước bằng văn bản ít nhất 30 ngày.
4. Chấm dứt thuê cần báo trước 30 ngày; các khoản phải thanh toán được đối chiếu khi bàn giao.`;
export type Finding = {
  id: string;
  title: string;
  note: string;
  excerpt: string;
  start: number;
  end: number;
  severity: "attention" | "review";
};
export function inspectContract(text: string) {
  const findings: Finding[] = [];
  for (const m of text.matchAll(/[^\n]+/g)) {
    const raw = m[0],
      q = normalize(raw),
      start = m.index!;
    const add = (
      id: string,
      title: string,
      note: string,
      severity: "attention" | "review",
    ) =>
      findings.push({
        id: id + "-" + start,
        title,
        note,
        excerpt: raw,
        start,
        end: start + raw.length,
        severity,
      });
    if (/dat coc|tien coc/.test(q))
      add(
        "deposit",
        "Điều khoản tiền cọc",
        "Kiểm tra số tháng cọc, cách sử dụng và chứng từ nhận tiền.",
        "review",
      );
    if (/tang gia|tang phi|dieu chinh (gia|phi)/.test(q))
      add(
        "increase",
        "Điều chỉnh giá và phí",
        /bat ky|khong bao truoc|tuy y/.test(q)
          ? "Có quyền thay đổi rộng hoặc không báo trước. Hãy hỏi giới hạn tăng và thời gian báo trước."
          : "Đọc kỹ mức tăng, thời điểm áp dụng và cách thông báo.",
        /bat ky|khong bao truoc|tuy y/.test(q) ? "attention" : "review",
      );
    if (/hoan (lai )?(tien )?coc|khong hoan/.test(q))
      add(
        "refund",
        "Điều kiện hoàn cọc",
        /khong hoan/.test(q)
          ? "Đoạn này đề cập không hoàn cọc. Hãy hỏi trường hợp áp dụng và các ngoại lệ."
          : "Đối chiếu hạn hoàn cọc và cơ sở của từng khoản khấu trừ.",
        /khong hoan/.test(q) ? "attention" : "review",
      );
    if (/cham dut|chuyen di|ket thuc thue/.test(q))
      add(
        "termination",
        "Chấm dứt thuê",
        /ngay lap tuc|khong can bao truoc/.test(q)
          ? "Có khả năng chấm dứt không báo trước. Hãy làm rõ quyền của cả hai bên."
          : "Xem thời gian báo trước, trách nhiệm và chi phí khi kết thúc.",
        /ngay lap tuc|khong can bao truoc/.test(q) ? "attention" : "review",
      );
  }
  return findings;
}
export const contractService = {
  async inspect(text: string) {
    await delay(250);
    if (!text.trim()) throw Error("Hãy dán nội dung hoặc chọn hợp đồng mẫu.");
    if (text.length > 30000) throw Error("Demo hỗ trợ tối đa 30.000 ký tự.");
    return inspectContract(text);
  },
};
