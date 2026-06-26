import { preload } from "react-dom";

export function PageBackdrop({
  src,
  mobileSrc,
}: {
  src: string;
  mobileSrc?: string;
}) {
  preload(src, { as: "image", fetchPriority: "high" });
  if (mobileSrc) {
    preload(mobileSrc, { as: "image", fetchPriority: "high" });
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-1 bg-center bg-cover bg-no-repeat ${
          mobileSrc ? "hidden sm:block" : ""
        }`}
        style={{ backgroundImage: `url('${src}')` }}
      />
      {mobileSrc && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-1 bg-cover bg-top bg-no-repeat sm:hidden"
          style={{
            backgroundImage: `url('${mobileSrc}')`,
            top: "calc(var(--cf-header-h) * -1)",
            bottom: "calc(var(--cf-footer-h) * -1)",
          }}
        />
      )}
    </>
  );
}
