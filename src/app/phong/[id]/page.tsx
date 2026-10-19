import { DetailScreen } from "@/features/listings/components/detail-screen";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailScreen id={id} />;
}
