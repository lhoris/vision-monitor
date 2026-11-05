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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300 ${className}`}
    >
      ?
    </button>
  )
}
