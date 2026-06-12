const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatAdminDate(value: Date | string) {
  return dateFormatter.format(new Date(value));
}
