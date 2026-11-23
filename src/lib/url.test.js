import { describe, expect, it } from 'vitest'
import { safeHttpUrl } from './url'

describe('safeHttpUrl', () => {
  it('rejeita esquemas perigosos (qualquer caixa)', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('JAVASCRIPT:alert(1)')).toBeNull()
    expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    expect(safeHttpUrl('ftp://exemplo.com/arquivo')).toBeNull()
    expect(safeHttpUrl('file:///etc/passwd')).toBeNull()
  })

  it('rejeita vazio, só espaços e não-string', () => {
    expect(safeHttpUrl('')).toBeNull()
    expect(safeHttpUrl('   ')).toBeNull()
    expect(safeHttpUrl(undefined)).toBeNull()
    expect(safeHttpUrl(42)).toBeNull()
  })

  it('sem protocolo, assume https://', () => {
    expect(safeHttpUrl('exemplo.com')).toBe('https://exemplo.com/')
    expect(safeHttpUrl('  www.exemplo.com/a?b=1  ')).toBe('https://www.exemplo.com/a?b=1')
  })

  it('mantém http e https válidos', () => {
    expect(safeHttpUrl('http://exemplo.com/x')).toBe('http://exemplo.com/x')
    expect(safeHttpUrl('https://exemplo.com/x?y=1#z')).toBe('https://exemplo.com/x?y=1#z')
  })
})
