import { notFound, redirect } from "next/navigation";
import { apiServices } from "../services/api";
import {
  getBrandDetailsRoute,
  getProductDetailsRoute,
} from "@/lib/routes";

const LEGACY_PRODUCT_PREFIX = "products";

export default async function EntityRedirectPage({
  params,
}: {
  params: Promise<{ entityId: string }>;
}) {
  const { entityId } = await params;

  if (entityId.startsWith(LEGACY_PRODUCT_PREFIX)) {
    const productId = entityId.slice(LEGACY_PRODUCT_PREFIX.length);

    if (productId) {
      redirect(getProductDetailsRoute(productId));
    }
  }

  try {
    await apiServices.getProductDetails(entityId);
    redirect(getProductDetailsRoute(entityId));
  } catch {
    // Fall through and try brand details next.
  }

  try {
    await apiServices.getBrandDetails(entityId);
    redirect(getBrandDetailsRoute(entityId));
  } catch {
    notFound();
  }
}
