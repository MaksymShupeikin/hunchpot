import type { CSSProperties } from "react";
import type { Person } from "@/lib/api";

export function Avatar({ person, size = 28, className = "" }: { person: Person; size?: number; className?: string }) {
  return (
    <span
      className={`avatar ${className}`}
      style={{ "--h": person.hue, "--s": `${size}px` } as CSSProperties}
      title={`@${person.handle}`}
    >
      {person.name[0]}
    </span>
  );
}
