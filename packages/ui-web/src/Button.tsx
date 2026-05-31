import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button({ label, ...props }: ButtonProps) {
  return (
    <button
      className="rounded-none border border-foreground bg-background px-4 py-2 text-sm uppercase tracking-wider shadow-sm ring-1 ring-foreground/5 transition-all hover:bg-foreground hover:text-background"
      {...props}
    >
      {label}
    </button>
  );
}
