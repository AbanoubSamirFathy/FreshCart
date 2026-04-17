import { redirect } from "next/navigation";
import { getProductDetailsRoute } from "@/lib/routes";

export default async function ProductPageRedirect({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  redirect(getProductDetailsRoute(productId));
}
