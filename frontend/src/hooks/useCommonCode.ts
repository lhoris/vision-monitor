import { useAppSelector } from '@/store'
import type { CommonCodeGroup } from '@/types/commonCode'

export function useCommonCode(code: string): CommonCodeGroup | undefined {
  return useAppSelector((state) => state.commonCode.codes[code.trim().toUpperCase()])
}
