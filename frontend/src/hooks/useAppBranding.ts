import { useTranslation } from 'react-i18next'
import type { CommonCodeItem } from '@/types/commonCode'
import { useCommonCode } from './useCommonCode'

const BRANDING_CODE = 'APP_BRANDING'

function resolveBrandingValue(
  items: CommonCodeItem[] | undefined,
  value: string,
  language: string,
  fallback: string
): string {
  const item = items?.find((entry) => entry.value.toUpperCase() === value)
  const localizedName = language.startsWith('ko') ? item?.nameKo : item?.nameEn
  return localizedName?.trim() || item?.name?.trim() || fallback
}

export function useAppBranding() {
  const { i18n, t } = useTranslation()
  const branding = useCommonCode(BRANDING_CODE)

  return {
    title: resolveBrandingValue(branding?.items, 'APP_TITLE', i18n.language, t('header.title')),
    subtitle: resolveBrandingValue(branding?.items, 'APP_SUBTITLE', i18n.language, t('header.subtitle')),
  }
}
