import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react'

interface DataGridTableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

interface DataGridTextProps {
  children: ReactNode
  className?: string
  title?: string
}

interface DataGridToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface DataGridActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function DataGridTable({ className = '', children, ...props }: DataGridTableProps) {
  return <table {...props} className={`data-grid-table ${className}`}>{children}</table>
}

export function DataGridText({ children, className = '', title }: DataGridTextProps) {
  return <span className={`grid-cell-value ${className}`} title={title}>{children}</span>
}

export function DataGridToolbar({ children, className = '', ...props }: DataGridToolbarProps) {
  return <div {...props} className={`data-grid-toolbar ${className}`}>{children}</div>
}

export function DataGridActionButton({ variant = 'secondary', className = '', children, ...props }: DataGridActionButtonProps) {
  const variantClass = {
    primary: 'bg-blue-600 font-semibold text-white hover:bg-blue-700',
    secondary: 'border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    danger: 'border border-rose-300 bg-white font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-rose-950/30',
  }[variant]

  return <button {...props} className={`rounded px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}>{children}</button>
}
