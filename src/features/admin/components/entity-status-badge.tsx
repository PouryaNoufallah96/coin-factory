import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EntityStatusBadgeProps {
  active: boolean;
  deletedAt: Date | null;
}

export function EntityStatusBadge({
  active,
  deletedAt,
}: EntityStatusBadgeProps) {
  if (deletedAt) {
    return (
      <Badge
        className="border-muted-foreground/30 text-muted-foreground"
        variant="outline"
      >
        Archived
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        active
          ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "border-amber-600/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400"
      )}
      variant="outline"
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
