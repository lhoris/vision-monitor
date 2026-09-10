export interface CommonCodeItem {
  id: number
  value: string
  name: string
  description?: string | null
  sortOrder: number
  defaultValue?: string | null
}

export interface CommonCodeGroup {
  code: string
  description?: string | null
  type?: string | null
  items: CommonCodeItem[]
}

export interface RuntimeCommonCodes {
  version: string
  codes: Record<string, CommonCodeGroup>
}

export interface CommonCodeDetail extends CommonCodeItem {
  codeId: number
  dataEndStatus: string
  remarks?: string | null
}

export interface CommonCode extends Omit<CommonCodeGroup, 'code'> {
  id: number
  name: string
  dataEndStatus: string
  remarks?: string | null
  details: CommonCodeDetail[]
}

export type CommonCodeInput = Pick<CommonCode, 'name' | 'description' | 'type' | 'remarks'>
export type CommonCodeDetailInput = Pick<CommonCodeDetail, 'value' | 'name' | 'description' | 'sortOrder' | 'defaultValue' | 'remarks'>
