import { describe, expect, it } from 'vitest'
import { parseYouTubeId } from './youtube'

const ID = 'dQw4w9WgXcQ'

describe('parseYouTubeId', () => {
  it('aceita todos os formatos de link', () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://youtube.com/watch?v=${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://youtu.be/${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID)
    expect(parseYouTubeId(`https://www.youtube.com/live/${ID}`)).toBe(ID)
  })

  it('ignora parâmetros extras', () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`)).toBe(ID)
    expect(parseYouTubeId(`https://youtu.be/${ID}?si=abc&t=30`)).toBe(ID)
  })

  it('aceita link sem protocolo e com espaços em volta', () => {
    expect(parseYouTubeId(`youtu.be/${ID}`)).toBe(ID)
    expect(parseYouTubeId(`  www.youtube.com/watch?v=${ID}  `)).toBe(ID)
  })

  it('rejeita ID com tamanho ou caracteres inválidos', () => {
    expect(parseYouTubeId('https://youtu.be/curto')).toBeNull()
    expect(parseYouTubeId(`https://youtu.be/${ID}extra`)).toBeNull()
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc$%^&*()_')).toBeNull()
  })

  it('rejeita outros sites, links sem vídeo e esquemas não http', () => {
    expect(parseYouTubeId(`https://vimeo.com/${ID}`)).toBeNull()
    expect(parseYouTubeId(`https://evil.com/watch?v=${ID}`)).toBeNull()
    expect(parseYouTubeId('https://www.youtube.com/watch')).toBeNull()
    expect(parseYouTubeId('https://www.youtube.com/')).toBeNull()
    expect(parseYouTubeId(`javascript:alert('${ID}')`)).toBeNull()
  })

  it('rejeita vazio e não-string', () => {
    expect(parseYouTubeId('')).toBeNull()
    expect(parseYouTubeId('   ')).toBeNull()
    expect(parseYouTubeId(undefined)).toBeNull()
  })
})
