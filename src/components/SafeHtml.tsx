import type { CSSProperties, HTMLAttributes } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

type SafeHtmlProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  html: string | null | undefined;
  className?: string;
  style?: CSSProperties;
};

/** Renders untrusted HTML (CMS, products, blog) with XSS filtering. */
export default function SafeHtml({ html, className, style, ...rest }: SafeHtmlProps) {
  return (
    <div
      {...rest}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
