import { BIOMES, GROWTH_STAGES, MAX_STAGES } from '../config'
import './tree.css'

/**
 * @typedef {Object} TreeSvgProps
 * @property {import('../../types.js').BiomeId} biome
 * @property {string} species
 * @property {number} stage 0 (semente) a MAX_STAGES
 * @property {number} progress 0..1 até o próximo estágio
 * @property {string} [className]
 */

/**
 * @typedef {Object} Palette
 * @property {string} trunk
 * @property {string} canopy
 * @property {string} [accent]
 * @property {'round' | 'pine' | 'fern' | 'bulb' | 'flat'} shape
 */

/** @type {Record<string, Palette>} */
const PALETTES = {
  carvalho: { trunk: '#7d6149', canopy: '#4f9d69', shape: 'round' },
  ipe: { trunk: '#7d6149', canopy: '#9b7bd4', accent: '#f2ce4b', shape: 'round' },
  pinheiro: { trunk: '#6f5741', canopy: '#2f7a58', shape: 'pine' },
  abeto: { trunk: '#6f5741', canopy: '#2c6e58', accent: '#dfe9e4', shape: 'pine' },
  jequitiba: { trunk: '#7d6149', canopy: '#4a9d6b', shape: 'round' },
  samambaia: { trunk: '#6a8f57', canopy: '#6fbf8a', shape: 'fern' },
  baobá: { trunk: '#9a7b5a', canopy: '#7fae6a', shape: 'bulb' },
  acacia: { trunk: '#8a6a4f', canopy: '#a3b566', shape: 'flat' },
}

const FALLBACK = { trunk: '#7d6149', canopy: '#4f9d69', shape: 'round' }

// Geometria da árvore por estágio (trunkW, trunkH, trunkY, canopyR, canopyCy). Chão em y=175.
const GEOMETRY = [
  { tw: 8, th: 43, ty: 132, cr: 24, cy: 124 }, // estágio 2
  { tw: 12, th: 63, ty: 112, cr: 33, cy: 100 }, // estágio 3
  { tw: 18, th: 79, ty: 96, cr: 40, cy: 84 }, // estágio 4
]

const lerp = (a, b, t) => a + (b - a) * t

const stageLabel = (stage) =>
  stage === 0 ? 'semente' : GROWTH_STAGES[Math.min(GROWTH_STAGES.length, stage) - 1]

function TreeBody({ p, g }) {
  const groundY = 175
  const topY = g.ty
  const trunkX = 100 - g.tw / 2

  if (p.shape === 'pine') {
    const layers = 3
    const width = g.cr * 1.45
    const step = (g.cr * 2.1) / layers
    return (
      <g>
        <rect x={trunkX} y={topY} width={g.tw} height={g.th} fill={p.trunk} rx={g.tw * 0.3} />
        {Array.from({ length: layers }, (_, i) => {
          const baseY = topY + g.cr * 0.9 - i * step * 0.72
          const w = width * (1 - i * 0.26)
          const h = step * 1.35
          return <polygon key={i} points={`100,${baseY - h} ${100 - w / 2},${baseY} ${100 + w / 2},${baseY}`} fill={p.canopy} />
        })}
        {p.accent && <circle cx={100} cy={topY + g.cr * 0.4} r={3} fill={p.accent} />}
      </g>
    )
  }

  if (p.shape === 'fern') {
    const fronds = 6
    return (
      <g>
        <rect x={trunkX} y={topY} width={g.tw} height={g.th} fill={p.trunk} rx={g.tw * 0.3} />
        {Array.from({ length: fronds }, (_, i) => {
          const angle = (-Math.PI / 1.5) * (i / (fronds - 1)) - Math.PI / 6
          const len = g.cr * 1.5
          const ex = 100 + Math.cos(angle) * len
          const ey = topY + Math.sin(angle) * len * 0.7 + 12
          return (
            <path
              key={i}
              d={`M100 ${topY} Q ${(100 + ex) / 2} ${topY - 12} ${ex} ${ey}`}
              stroke={p.canopy}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          )
        })}
      </g>
    )
  }

  if (p.shape === 'bulb') {
    const w = g.tw * 2.4
    return (
      <g>
        <path
          d={`M${100 - w * 0.3} ${groundY} Q${100 - w / 2} ${groundY - g.th * 0.5} ${100 - w * 0.32} ${topY}
              L${100 + w * 0.32} ${topY} Q${100 + w / 2} ${groundY - g.th * 0.5} ${100 + w * 0.3} ${groundY} Z`}
          fill={p.trunk}
        />
        <ellipse cx={100} cy={topY} rx={g.cr * 1.15} ry={g.cr * 0.62} fill={p.canopy} />
        <circle cx={100 - g.cr * 0.7} cy={topY - g.cr * 0.25} r={g.cr * 0.45} fill={p.canopy} />
        <circle cx={100 + g.cr * 0.7} cy={topY - g.cr * 0.25} r={g.cr * 0.45} fill={p.canopy} />
      </g>
    )
  }

  if (p.shape === 'flat') {
    return (
      <g>
        <rect x={trunkX} y={topY} width={g.tw} height={g.th} fill={p.trunk} rx={g.tw * 0.3} />
        <ellipse cx={100} cy={topY} rx={g.cr * 1.3} ry={g.cr * 0.5} fill={p.canopy} />
        <circle cx={100} cy={topY - g.cr * 0.35} r={g.cr * 0.55} fill={p.canopy} />
        {p.accent && <circle cx={100 + g.cr} cy={topY} r={3} fill={p.accent} />}
      </g>
    )
  }

  // round
  return (
    <g>
      <rect x={trunkX} y={topY} width={g.tw} height={g.th} fill={p.trunk} rx={g.tw * 0.3} />
      <circle cx={100} cy={g.cy} r={g.cr} fill={p.canopy} />
      <circle cx={100 - g.cr * 0.62} cy={g.cy + g.cr * 0.42} r={g.cr * 0.68} fill={p.canopy} />
      <circle cx={100 + g.cr * 0.62} cy={g.cy + g.cr * 0.42} r={g.cr * 0.68} fill={p.canopy} />
      {p.accent && (
        <g fill={p.accent}>
          <circle cx={100 - g.cr * 0.4} cy={g.cy - g.cr * 0.4} r={3.5} />
          <circle cx={100 + g.cr * 0.5} cy={g.cy} r={3.5} />
          <circle cx={100 + g.cr * 0.1} cy={g.cy + g.cr * 0.5} r={3.5} />
        </g>
      )}
    </g>
  )
}

/** @param {TreeSvgProps} props */
export default function TreeSvg({ biome, species, stage, progress, className }) {
  const p = PALETTES[species] ?? FALLBACK
  const biomeColors = BIOMES[biome].colors
  const s = Math.max(0, Math.min(MAX_STAGES, stage))
  const frac = Math.max(0, Math.min(1, progress))

  // Geometria interpolada: estágio 2..4 cresce continuamente até o próximo.
  let body
  if (s === 0) {
    body = (
      <g>
        <ellipse cx={100} cy={169} rx={17} ry={8} fill={p.trunk} opacity={0.5} />
        <ellipse cx={100} cy={163} rx={6} ry={8} fill={p.trunk} />
        <ellipse cx={98} cy={161} rx={2} ry={3} fill="#fff" opacity={0.5} />
      </g>
    )
  } else if (s === 1) {
    body = (
      <g>
        <path d="M100 172 L100 148" stroke={p.trunk} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={89} cy={145} rx={11} ry={6.5} fill={p.canopy} transform="rotate(-25 89 145)" />
        <ellipse cx={111} cy={153} rx={11} ry={6.5} fill={p.canopy} transform="rotate(25 111 153)" />
      </g>
    )
  } else {
    const idx = Math.min(2, s - 2)
    const k = s >= MAX_STAGES ? 0 : frac
    const a = GEOMETRY[idx]
    const b = GEOMETRY[Math.min(2, idx + 1)]
    const g = {
      tw: lerp(a.tw, b.tw, k),
      th: lerp(a.th, b.th, k),
      ty: lerp(a.ty, b.ty, k),
      cr: lerp(a.cr, b.cr, k),
      cy: lerp(a.cy, b.cy, k),
    }
    body = <TreeBody p={p} g={g} />
  }

  const name = BIOMES[biome].species.find((sp) => sp.id === species)?.name ?? species

  return (
    <svg
      viewBox="0 0 200 200"
      className={className ? `tree-svg ${className}` : 'tree-svg'}
      role="img"
      aria-label={`${name} — estágio ${stageLabel(s)}`}
    >
      <rect x="0" y="0" width="200" height="200" rx="16" fill={biomeColors.sky} />
      <path d="M0 175 Q60 160 110 172 T200 168 L200 200 L0 200 Z" fill={biomeColors.ground} />
      <ellipse cx="100" cy="176" rx="34" ry="7" fill="#000" opacity="0.08" />
      <g key={s} className="tree-body">
        {body}
      </g>
    </svg>
  )
}
