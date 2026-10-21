// All evidence supplied here is simulated; none is inferred from images or gender.
export type UserEvidence = {
  otp?: boolean;
  verified?: boolean;
  student?: boolean;
  social?: boolean;
  avatar?: boolean;
  bio?: boolean;
  profileComplete?: boolean;
  responseRate?: number;
  attendanceRate?: number;
  reviews?: { count: number; average: number };
  months?: number;
  confirmedStays?: number;
  deductions?: number;
  verifiedFraud?: boolean;
  blocked?: boolean;
};
const clamp = (n: number, max: number) => Math.min(max, Math.max(0, n));
export function userTrustScore(e: UserEvidence) {
  const components = [
    {
      label: "Xác thực nền mẫu",
      score: (e.otp ? 10 : 0) + (e.verified ? 20 : 0),
      max: 30,
    },
    {
      label: "Xác thực bổ sung mẫu",
      score: (e.student ? 6 : 0) + (e.social ? 4 : 0),
      max: 10,
    },
    {
      label: "Hoàn thiện hồ sơ",
      score: (e.avatar ? 3 : 0) + (e.bio ? 2 : 0) + (e.profileComplete ? 5 : 0),
      max: 10,
    },
    {
      label: "Hành vi mẫu",
      score:
        10 * clamp(e.responseRate ?? 0, 1) +
        10 * clamp(e.attendanceRate ?? 0, 1),
      max: 20,
    },
    {
      label: "Đánh giá đã xác nhận mẫu",
      score:
        e.reviews && e.reviews.count > 0
          ? ((20 *
              ((clamp(e.reviews.average, 5) * e.reviews.count + 9) /
                (e.reviews.count + 3))) /
              5) *
            Math.min(1, e.reviews.count / 3)
          : 0,
      max: 20,
    },
    {
      label: "Thâm niên & giao dịch mẫu",
      score: clamp(e.months ?? 0, 5) + clamp(e.confirmedStays ?? 0, 5),
      max: 10,
    },
  ];
  const deductions =
    Math.max(0, e.deductions ?? 0) + (e.verifiedFraud ? 40 : 0);
  const score = Math.round(
    clamp(
      components.reduce((n, c) => n + c.score, 0) - deductions,
      e.verifiedFraud ? 29 : 100,
    ),
  );
  return {
    score,
    components,
    deductions,
    hidden: !!e.blocked,
    label:
      score >= 80
        ? "Rất tốt"
        : score >= 60
          ? "Tốt"
          : score >= 30
            ? "Đang xây dựng uy tín"
            : "Cần thận trọng",
  };
}
