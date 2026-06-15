import { connection } from "next/server";

import { Skeleton } from "@/components/ui/skeleton";
import { getActiveCategories } from "@/features/categories/api/server/get-active-categories";
import { LandingCategoryChips } from "@/features/inquiries/components/landing-page";

const CHIP_SKELETON_KEYS = [
  "chip-1",
  "chip-2",
  "chip-3",
  "chip-4",
  "chip-5",
  "chip-6",
];

export async function FunnelCategoryChips() {
  // Stream at request time so the static landing shell builds without a DB.
  await connection();
  const categories = await getActiveCategories();
  return <LandingCategoryChips categories={categories} />;
}

export function CategoryChipsSkeleton() {
  return (
    <div className="flex min-h-10 flex-nowrap justify-center gap-4 px-1">
      {CHIP_SKELETON_KEYS.map((key) => (
        <Skeleton
          className="h-(--cf-chip-h) w-28 shrink-0 rounded-full"
          key={key}
        />
      ))}
    </div>
  );
}
