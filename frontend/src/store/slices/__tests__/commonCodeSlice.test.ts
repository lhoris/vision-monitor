import reducer, { clearCommonCodes, mergeCommonCodes } from '../commonCodeSlice'

describe('commonCodeSlice', () => {
  it('merges runtime codes and clears them on logout action', () => {
    const loaded = reducer(undefined, mergeCommonCodes({ version: '1', codes: { STATUS: { code: 'STATUS', items: [] } } }))
    expect(loaded.codes.STATUS.code).toBe('STATUS')
    expect(reducer(loaded, { type: 'auth/logout' }).codes).toEqual({})
    expect(reducer(loaded, clearCommonCodes()).codes).toEqual({})
  })
})
