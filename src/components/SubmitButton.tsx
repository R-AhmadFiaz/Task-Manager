"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel: string;
  children: ReactNode;
}

export function SubmitButton({ children, pendingLabel, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
