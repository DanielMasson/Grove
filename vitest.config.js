import { defineConfig } from 'vitest/config'

// Separado do vite.config.js (B01) para não gerar conflito. Os testes cobrem funções puras e o
// store; o teste do store pede jsdom por conta própria (comentário `@vitest-environment` no arquivo).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
