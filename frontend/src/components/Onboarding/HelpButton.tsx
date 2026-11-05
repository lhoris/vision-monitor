import type { ButtonHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'

type HelpButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'title' | 'type'>

export function HelpButton({ className = '', ...props }: HelpButtonProps) {
  const { t } = useTranslation()
  const label = t('onboarding.helpButton') === 'onboarding.helpButton' ? 'Help' : t('onboarding.helpButton')

  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300 ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.75 9a2.45 2.45 0 1 1 4.25 1.67c-.78.75-2 1.18-2 2.83" />
        <path d="M12 17h.01" />
      </svg>
    </button>
  )
}
