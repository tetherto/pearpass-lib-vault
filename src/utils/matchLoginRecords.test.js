import { matchLoginRecords } from './matchLoginRecords'

const record = (id, data) => ({ id, data })

describe('matchLoginRecords', () => {
  it('returns [] when parsedOtp is missing', () => {
    expect(matchLoginRecords(null, [record('a', { title: 'GitHub' })])).toEqual(
      []
    )
    expect(
      matchLoginRecords(undefined, [record('a', { title: 'GitHub' })])
    ).toEqual([])
  })

  it('returns [] when records list is empty or not an array', () => {
    expect(matchLoginRecords({ issuer: 'GitHub' }, [])).toEqual([])
    expect(matchLoginRecords({ issuer: 'GitHub' }, null)).toEqual([])
  })

  it('returns [] when parsedOtp has neither issuer nor label (raw secret case)', () => {
    expect(
      matchLoginRecords(
        { secret: 'JBSWY3DPEHPK3PXP', type: 'TOTP' },
        [record('a', { title: 'GitHub', websites: ['github.com'] })]
      )
    ).toEqual([])
  })

  it('matches issuer to a website by collapsed domain label', () => {
    const recs = [
      record('a', { title: 'GitHub work', websites: ['https://github.com'] }),
      record('b', { title: 'Bank', websites: ['https://mybank.com'] })
    ]
    const result = matchLoginRecords({ issuer: 'GitHub' }, recs)
    expect(result.map((m) => m.record.id)).toEqual(['a'])
    expect(result[0].reasons).toEqual(['issuer-domain'])
  })

  it('matches issuer hostname to website regardless of subdomain', () => {
    const recs = [
      record('a', {
        title: 'Google',
        websites: ['https://accounts.google.com/signin']
      })
    ]
    const result = matchLoginRecords({ issuer: 'google.com' }, recs)
    expect(result).toHaveLength(1)
    expect(result[0].reasons).toEqual(['issuer-domain'])
  })

  it('matches issuer to a ccTLD-suffixed website (amazon.co.uk)', () => {
    const recs = [
      record('a', { title: 'Amazon UK', websites: ['https://amazon.co.uk'] }),
      record('b', { title: 'Bank', websites: ['https://mybank.com'] })
    ]
    const result = matchLoginRecords({ issuer: 'Amazon' }, recs)
    expect(result.map((m) => m.record.id)).toEqual(['a'])
    expect(result[0].reasons).toEqual(['issuer-domain'])
  })

  it('does not match issuer against a path segment of an unrelated website', () => {
    const recs = [
      record('a', {
        title: 'Example',
        websites: ['https://example.com/github/auth']
      })
    ]
    expect(matchLoginRecords({ issuer: 'GitHub' }, recs)).toEqual([])
  })

  it('does not match issuer against title when website is missing', () => {
    const recs = [
      record('a', { title: 'GitHub - Personal' }),
      record('b', { title: 'Banking' })
    ]
    expect(matchLoginRecords({ issuer: 'github' }, recs)).toEqual([])
  })

  it('matches OTP label account to username (exact, case-insensitive)', () => {
    const recs = [
      record('a', { title: 'Twitter', username: 'jane@example.com' }),
      record('b', { title: 'Twitter alt', username: 'someone-else' })
    ]
    const result = matchLoginRecords(
      { label: 'Jane@Example.com' },
      recs
    )
    expect(result.map((m) => m.record.id)).toEqual(['a'])
    expect(result[0].reasons).toEqual(['label-username'])
  })

  it('matches label local-part to a username without an @', () => {
    const recs = [record('a', { title: 'Site', username: 'jane' })]
    const result = matchLoginRecords({ label: 'jane@example.com' }, recs)
    expect(result).toHaveLength(1)
    expect(result[0].reasons).toEqual(['label-username'])
  })

  it('does not match label when username is unrelated', () => {
    const recs = [record('a', { title: 'Site', username: 'totally-different' })]
    expect(matchLoginRecords({ label: 'jane@example.com' }, recs)).toEqual([])
  })

  it('ranks multi-signal matches above single-signal matches', () => {
    const recs = [
      record('weak', { title: 'GitHub - work', websites: ['https://github.com'] }),
      record('strong', {
        title: 'GitHub - personal',
        username: 'jane@example.com',
        websites: ['https://github.com']
      })
    ]
    const result = matchLoginRecords(
      { issuer: 'GitHub', label: 'jane@example.com' },
      recs
    )
    expect(result.map((m) => m.record.id)).toEqual(['strong', 'weak'])
    expect(result[0].reasons.length).toBeGreaterThan(result[1].reasons.length)
  })

  it('returns all matches when multiple records share the same issuer', () => {
    const recs = [
      record('a', { title: 'GitHub work', websites: ['github.com'] }),
      record('b', { title: 'GitHub personal', websites: ['github.com'] })
    ]
    const result = matchLoginRecords({ issuer: 'GitHub' }, recs)
    expect(result.map((m) => m.record.id).sort()).toEqual(['a', 'b'])
  })

  it('breaks score ties deterministically by record id', () => {
    const recs = [
      record('z', { title: 'GitHub', websites: ['github.com'] }),
      record('a', { title: 'GitHub', websites: ['github.com'] })
    ]
    const result = matchLoginRecords({ issuer: 'GitHub' }, recs)
    expect(result.map((m) => m.record.id)).toEqual(['a', 'z'])
  })

  it('handles missing data fields without throwing', () => {
    const recs = [
      record('a', {}),
      record('b', undefined),
      { id: 'c' }
    ]
    expect(() =>
      matchLoginRecords({ issuer: 'GitHub', label: 'jane' }, recs)
    ).not.toThrow()
    expect(matchLoginRecords({ issuer: 'GitHub', label: 'jane' }, recs)).toEqual(
      []
    )
  })

  it('ignores empty/whitespace issuer and label', () => {
    const recs = [record('a', { title: 'GitHub' })]
    expect(matchLoginRecords({ issuer: '   ', label: '' }, recs)).toEqual([])
  })
})
