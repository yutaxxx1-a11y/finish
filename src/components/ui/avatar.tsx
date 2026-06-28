import Image from "next/image";

import { cn, getInitials } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  className?: string;
};

export function Avatar({ src, name, className }: AvatarProps) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-semibold", className)}>
      {src ? (
        <Image src={src} alt={name ?? "avatar"} fill sizes="40px" className="object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
