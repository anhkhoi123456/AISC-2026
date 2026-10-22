"use client";
import { useState } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useDemo } from "@/shared/lib/demo-store";
import { PageTitle, Empty } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
import {
  contractSample,
  clearerSample,
  contractService,
  inspectContract,
  type Finding,
} from "../services/reader";
export function ContractScreen() {
  return (
    <HashRouter>
      <ContractFlow />
    </HashRouter>
  );
}
function ContractFlow() {
  const { data, update } = useDemo();
  const [text, setText] = useState(data.contractText),
    [findings, setFindings] = useState<Finding[]>(() =>
      inspectContract(data.contractText),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<number | null>(null);
  const navigate = useNavigate();
  async function analyze() {
    setBusy(true);
    setError("");
    try {
      const result = await contractService.inspect(text);
      setFindings(result);
      update((s) => ({ ...s, contractText: text }));
      navigate("/ket-qua");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container section">
      <PageTitle
        eyebrow="ĐỌC KỸ TRƯỚC KHI ĐẶT BÚT"
        title="Kiểm tra điều khoản"
        description="Tìm các điều khoản đáng trao đổi bằng quy tắc từ khóa. Không upload file, không gọi AI."
      />
      <p className="info-note">
        Công cụ minh họa không đánh giá tính hợp pháp hoặc thay thế tư vấn
        chuyên môn. Nội dung chỉ lưu trong trình duyệt; dùng văn bản mẫu, tránh
        dán thông tin riêng tư.
      </p>
      <Routes>
        <Route
          path="/"
          element={
            <div className="contract-input-grid">
              <section className="panel">
                <label>
                  Nội dung hợp đồng
                  <textarea
                    className="contract-textarea"
                    maxLength={30000}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      update((s) => ({ ...s, contractText: e.target.value }));
                    }}
                    placeholder="Dán nội dung hợp đồng hoặc chọn mẫu bên cạnh…"
                  />
                  <small>{text.length}/30.000 ký tự</small>
                </label>
                {error && (
                  <p role="alert" className="warning">
                    {error}
                  </p>
                )}
                <button
                  className="btn primary full"
                  disabled={busy || !text.trim()}
                  onClick={analyze}
                >
                  <Icon name="contract" size={18} />
                  {busy ? "Đang rà soát bằng quy tắc…" : "Rà soát điều khoản"}
                </button>
              </section>
              <aside className="panel">
                <span className="feature-icon">
                  <Icon name="contract" size={27} />
                </span>
                <h2>Văn bản mẫu</h2>
                <p className="muted">
                  Hai mẫu giả lập để so sánh các điều khoản rõ ràng và những
                  điểm cần hỏi thêm.
                </p>
                <div className="sample-actions">
                  <button
                    className="btn outline"
                    onClick={() => {
                      setText(contractSample);
                      update((s) => ({ ...s, contractText: contractSample }));
                    }}
                  >
                    Mẫu có điều khoản cần chú ý
                  </button>
                  <button
                    className="btn outline"
                    onClick={() => {
                      setText(clearerSample);
                      update((s) => ({ ...s, contractText: clearerSample }));
                    }}
                  >
                    Mẫu có điều khoản cụ thể hơn
                  </button>
                </div>
                <p className="fineprint">
                  Từ khóa được dò: cọc, tăng giá/phí, hoàn cọc và chấm dứt thuê.
                  Quy tắc không hiểu được mọi ngữ cảnh.
                </p>
              </aside>
            </div>
          }
        />
        <Route
          path="/ket-qua"
          element={
            <>
              <div className="results-toolbar">
                <h3>{findings.length} điểm cần đọc kỹ</h3>
                <button className="btn outline" onClick={() => navigate("/")}>
                  Sửa văn bản
                </button>
              </div>
              <div className="contract-results">
                <section className="panel source-text">
                  <h2>Văn bản bạn cung cấp</h2>
                  {Array.from(text.matchAll(/[^\n]+/g)).map((m) => (
                    <p
                      id={"clause-" + m.index}
                      key={m.index}
                      className={
                        findings.some((f) => f.start === m.index)
                          ? "highlighted-clause " +
                            (selected === m.index ? "selected" : "")
                          : ""
                      }
                    >
                      {m[0]}
                    </p>
                  ))}
                </section>
                <aside>
                  {findings.length ? (
                    findings.map((f) => (
                      <article key={f.id} className="panel finding-card">
                        <span className="pill">
                          {f.severity === "attention"
                            ? "Cần chú ý"
                            : "Cần đối chiếu"}
                        </span>
                        <h3>{f.title}</h3>
                        <blockquote>{f.excerpt}</blockquote>
                        <p>{f.note}</p>
                        <button
                          className="text-btn"
                          onClick={() => {
                            setSelected(f.start);
                            document
                              .getElementById("clause-" + f.start)
                              ?.scrollIntoView({
                                block: "center",
                                behavior: "smooth",
                              });
                          }}
                        >
                          Xem đúng đoạn văn bản <Icon name="arrow" size={15} />
                        </button>
                      </article>
                    ))
                  ) : (
                    <Empty
                      title="Chưa tìm thấy từ khóa của bộ quy tắc"
                      description="Điều này không đồng nghĩa hợp đồng an toàn hoặc đầy đủ. Hãy đọc toàn bộ nội dung."
                    />
                  )}
                </aside>
              </div>
            </>
          }
        />
      </Routes>
    </main>
  );
}
