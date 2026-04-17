import { redirect } from "next/navigation";
import { getBrandDetailsRoute } from "@/lib/routes";

export default async function BrandPageRedirect({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  redirect(getBrandDetailsRoute(brandId));
}
