import { describe, expect, it } from 'vitest'
import { maskEmail, maskName, maskPhone } from '@/utils/privacyMasking'

describe('privacy masking', () => {
  it('masks names', () => {
    expect(maskName('김민수')).toBe('김*수')
    expect(maskName('김수')).toBe('김*')
  })
  it('masks phone middle digits', () => {
    expect(maskPhone('010-1234-5897')).toBe('010-****-5897')
    expect(maskPhone('01012345897')).toBe('010****5897')
  })
  it('keeps two email local-part characters', () => {
    expect(maskEmail('lahoris@posco.com')).toBe('la*****@posco.com')
  })
})
