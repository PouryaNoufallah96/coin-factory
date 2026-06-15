import { toast } from "sonner";

export function funnelAlert(message: string, id?: string) {
  toast.error(message, id ? { id } : undefined);
}
