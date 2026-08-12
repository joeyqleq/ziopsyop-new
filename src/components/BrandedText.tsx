import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Display-only wordmark treatment. Only uppercase O becomes the branded zero;
 * the parent heading keeps the original phrase as its accessible name.
 */
export function BrandedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("contents", className)} aria-hidden="true">
      {text.split("").map((character, index) =>
        character === "O" ? (
          <span key={index} className="brand-zero">
            0
          </span>
        ) : (
          <Fragment key={index}>{character}</Fragment>
        ),
      )}
    </span>
  );
}
