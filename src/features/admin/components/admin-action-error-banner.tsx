interface AdminActionErrorBannerProps {
  message: string;
}

export function AdminActionErrorBanner({
  message,
}: AdminActionErrorBannerProps) {
  return (
    <div
      className="mx-auto mb-4 max-w-7xl rounded-(--cf-radius-alert) border border-cf-error/40 bg-cf-error/10 px-4 py-3 text-cf-error text-sm"
      role="alert"
    >
      {message}
    </div>
  );
}
