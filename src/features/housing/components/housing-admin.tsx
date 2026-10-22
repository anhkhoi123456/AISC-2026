"use client";
import { useDemo } from "@/shared/lib/demo-store";
import { actorId, ADMIN, decideCase, supplementCase } from "@/services/housing";
import { DemoActors } from "./demo-actors";
const caseName = {
  residency: "Đối chiếu cư trú",
  exit: "Bàn giao rời phòng",
  review: "Đánh giá",
  trust: "Điểm căn phòng",
  deposit: "Tiền cọc",
};
const caseStatus = {
  new: "Đã tiếp nhận",
  more: "Cần bổ sung",
  accepted: "Có căn cứ",
  rejected: "Chưa đủ căn cứ",
};
export function HousingAdmin() {
  const { data, command } = useDemo();
  return (
    <section className="housing-admin">
      <h2>Vụ việc lượt ở, review và điểm</h2>
      <DemoActors />
      {actorId(data) !== ADMIN ? (
        <p>
          Chọn phía Admin mẫu sau khi đăng nhập để xem xét vụ việc; việc đổi
          phía không tạo phân quyền thật.
        </p>
      ) : (
        <>
          {!data.housing.cases.length && (
            <p>
              Chưa có vụ việc mới. Yêu cầu được tạo từ lượt ở hoặc báo cáo
              review/điểm.
            </p>
          )}
          {data.housing.cases.map((c) => (
            <article className="case-card" key={c.id}>
              <h3>
                {caseName[c.type]} · {caseStatus[c.status]}
              </h3>
              <p>Bằng chứng mẫu: {c.evidence}</p>
              {c.reason && (
                <p>
                  Quyết định: {c.reason} · Admin mẫu ·{" "}
                  {c.decidedAt
                    ? new Date(c.decidedAt).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })
                    : "chưa ghi nhận"}
                </p>
              )}
              {["new", "more"].includes(c.status) && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    command((s) =>
                      decideCase(
                        s,
                        c.id,
                        String(f.get("decision")) as
                          "more" | "accepted" | "rejected",
                        String(f.get("reason")),
                        {
                          amount: Number(f.get("amount")),
                          from: String(f.get("from") || ""),
                          to: String(f.get("to") || ""),
                        },
                      ),
                    );
                  }}
                >
                  <label>
                    Kết luận
                    <select name="decision">
                      <option value="more">Cần bổ sung bằng chứng</option>
                      <option value="accepted">Có căn cứ theo yêu cầu</option>
                      <option value="rejected">Chưa đủ căn cứ</option>
                    </select>
                  </label>
                  {["deposit", "trust"].includes(c.type) && (
                    <label>
                      {c.type === "deposit"
                        ? "Khấu trừ cuối cùng (VNĐ)"
                        : "Điều chỉnh H (−30 đến 30)"}
                      <input
                        name="amount"
                        type="number"
                        required
                        defaultValue="0"
                      />
                    </label>
                  )}
                  {c.type === "residency" && (
                    <label>
                      Ngày vào theo bằng chứng mẫu
                      <input name="from" type="date" />
                    </label>
                  )}
                  {["residency", "exit"].includes(c.type) && (
                    <label>
                      Ngày rời theo bằng chứng mẫu
                      <input name="to" type="date" />
                    </label>
                  )}
                  <label>
                    Lý do và căn cứ quyết định
                    <textarea name="reason" required minLength={5} />
                  </label>
                  <p className="fineprint">
                    Review: quyết định có căn cứ chuyển trạng thái ẩn/khôi phục,
                    không xóa bản gốc. Bất đồng lượt ở cần kiểm tra bằng chứng
                    mẫu trước khi kết luận.
                  </p>
                  <button className="btn outline">
                    Lưu quyết định vụ việc
                  </button>
                </form>
              )}
            </article>
          ))}
        </>
      )}
    </section>
  );
}
export function MyHousingCases() {
  const { data, command } = useDemo(),
    cases = data.housing.cases.filter((c) => c.requester === actorId(data));
  return (
    <section>
      <h2>Yêu cầu xem xét của tôi</h2>
      {!cases.length ? (
        <p>Chưa có yêu cầu xem xét.</p>
      ) : (
        cases.map((c) => (
          <article className="case-card" key={c.id}>
            <h3>
              {caseName[c.type]} ·{" "}
              {c.status === "new"
                ? "Đã tiếp nhận"
                : c.status === "more"
                  ? "Cần bổ sung"
                  : c.status === "accepted"
                    ? "Có căn cứ"
                    : "Chưa đủ căn cứ"}
            </h3>
            <p>{c.evidence}</p>
            {c.reason && <p>Lý do quyết định: {c.reason}</p>}
            {c.status === "more" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  command((s) =>
                    supplementCase(s, c.id, String(f.get("evidence"))),
                  );
                }}
              >
                <label>
                  Bổ sung bằng chứng mẫu
                  <textarea name="evidence" minLength={10} required />
                </label>
                <button className="btn outline">Gửi bằng chứng bổ sung</button>
              </form>
            )}
          </article>
        ))
      )}
    </section>
  );
}
