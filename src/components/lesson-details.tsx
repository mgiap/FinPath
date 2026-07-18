// src/components/lesson-details.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function LessonDetails({
  lessonId,
  children,
  className,
}: {
  lessonId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDetailsElement>(null);
  const shouldExpand = searchParams.get("expanded") === lessonId;

  useEffect(() => {
    if (shouldExpand && ref.current) {
      ref.current.open = true;
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [shouldExpand]);

  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}