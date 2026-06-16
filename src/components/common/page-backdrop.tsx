import { preload } from "react-dom";

export function PageBackdrop({ src }: { src: string }) {
  preload(src, { as: "image", fetchPriority: "high" });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-1 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url('${src}')` }}
    />
  );
}
