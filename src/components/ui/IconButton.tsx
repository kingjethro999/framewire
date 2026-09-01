import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  children: ReactNode
}

export function IconButton({ label, active, children, className, ...props }: IconButtonProps) {
  return (
    <button className={clsx('icon-button', active && 'is-active', className)} title={label} aria-label={label} {...props}>
      {children}
    </button>
  )
}
