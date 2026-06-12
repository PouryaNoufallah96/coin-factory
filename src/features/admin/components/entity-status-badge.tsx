import { Badge } from "@/components/ui/badge";

interface EntityStatusBadgeProps {
  active: boolean;
  deletedAt: Date | null;
}

export function EntityStatusBadge({
  active,
  deletedAt,
}: EntityStatusBadgeProps) {
  if (deletedAt) {
    return <Badge variant="outline">Deleted</Badge>;
  }

  return (
    <Badge variant={active ? "secondary" : "outline"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
