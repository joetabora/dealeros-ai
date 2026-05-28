"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuItem() {
  const { pending } = useFormStatus();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={pending}
      render={<button type="submit" className="w-full" />}
    >
      <LogOut />
      {pending ? "Signing out..." : "Sign out"}
    </DropdownMenuItem>
  );
}
