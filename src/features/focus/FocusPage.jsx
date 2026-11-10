import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTimer, MAX_MINUTES, MIN_MINUTES, PAUSE_AFTER_MINUTES } from './useTimer'
import { useStore } from '../../store/useStore'
import { BIOMES, DEFAULT_BIOME, GROWTH_STAGES, MAX_STAGES, stagesForMinutes } from '../../biomes/config'
import DurationPicker from './DurationPicker'
import LinkPicker from './LinkPicker'
import SpeciesPicker from './SpeciesPicker'
import TreePicker from './TreePicker'
import TreeSvg from '../../biomes/trees/TreeSvg'
import ConfirmDialog from '../../components/ConfirmDialog'
import './focus.css'

const fmt = (totalSeconds) =>
  `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`

const stageName = (stage) =>
  stage === 0 ? 'semente' : GROWTH_STAGES[Math.min(GROWTH_STAGES.length, stage) - 1]

export default function FocusPage() {
  const timer = useTimer()
  const tasks = useStore((s) => s.tasks)
  const notebooks = useStore((s) => s.notebooks)
  const trees = useStore((s) => s.trees)
  const [searchParams] = useSearchParams()

  // Configuração da próxima sessão (só enquanto ocioso).
  const [duration, setDuration] = useState('25')
  const [link, setLink] = useState(() => {
    // Pré-seleção vindo de outra tela: #/foco?notebookId=ID e/ou ?taskId=ID (spec 03).
    const state = useStore.getState()
    const presetTaskId = searchParams.get('taskId') ?? undefined
    const task = presetTaskId ? state.tasks.find((t) => t.id === presetTaskId) : undefined
    const presetNotebookId = searchParams.get('notebookId') ?? undefined
    const notebookId =
      task?.notebookId ??
      (presetNotebookId && state.notebooks.some((n) => n.id === presetNotebookId)
        ? presetNotebookId
        : undefined)
    return { taskId: task?.id, notebookId }
  })
  const [treeChoice, setTreeChoice] = useState('new')
  const [speciesState, setSpeciesState] = useState('')
  const [error, setError] = useState(null)
  const [confirmGiveUp, setConfirmGiveUp] = useState(false)

  const { active, pausedAt, minutes } = timer

  // Re-render visual a cada 250 ms; o valor vem sempre de Date.now(), nunca do tick.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) {
      document.title = 'Grove'
      return
    }
    const updateTitle = () => {
      const remaining = Math.max(0, Math.ceil((minutes * 60_000 - useTimer.getState().elapsedMs()) / 1000))
      document.title = `🌱 ${fmt(remaining)} · Grove`
    }
    updateTitle()
    const draw = setInterval(() => setTick((t) => t + 1), 250)
    const title = setInterval(updateTitle, 1000)
    return () => {
      clearInterval(draw)
      clearInterval(title)
      document.title = 'Grove'
    }
  }, [active, minutes])

  // ----- Estado ocioso: derivados -----
  const chosenTree = treeChoice === 'new' ? undefined : trees.find((t) => t.id === treeChoice)
  const effectiveTreeChoice = treeChoice === 'new' || chosenTree ? treeChoice : 'new'
  const notebook = notebooks.find((n) => n.id === link.notebookId)
  const biome = chosenTree ? chosenTree.biome : (notebook?.biome ?? DEFAULT_BIOME)
  const speciesOptions = BIOMES[biome].species
  const species = chosenTree
    ? chosenTree.species
    : speciesOptions.some((sp) => sp.id === speciesState)
      ? speciesState
      : (speciesOptions[0]?.id ?? '')

  // ----- Estado em andamento: derivados -----
  const elapsed = timer.elapsedMs()
  const totalMs = minutes * 60_000
  const remainingSec = Math.max(0, Math.ceil((totalMs - elapsed) / 1000))
  const progress = Math.min(1, elapsed / totalMs)
  const activeTree = timer.treeId ? trees.find((t) => t.id === timer.treeId) : undefined
  const initialStage = activeTree?.stages ?? 0
  const finalStage = Math.min(MAX_STAGES, initialStage + stagesForMinutes(minutes))
  const floatPos = progress * (finalStage - initialStage)
  const displayedStage = Math.min(finalStage, initialStage + Math.floor(floatPos))
  const frac = floatPos - Math.floor(floatPos)
  const activeBiome = timer.biome ?? DEFAULT_BIOME
  const activeSpecies = timer.species ?? species

  const linkedTask = timer.taskId ? tasks.find((t) => t.id === timer.taskId) : undefined
  const linkedNotebook = timer.notebookId ? notebooks.find((n) => n.id === timer.notebookId) : undefined

  const onStart = () => {
    const value = duration.trim()
    const n = Number(value)
    if (!/^\d+$/.test(value) || n < MIN_MINUTES || n > MAX_MINUTES) {
      setError(`Informe um número inteiro entre ${MIN_MINUTES} e ${MAX_MINUTES} minutos.`)
      return
    }
    if (!chosenTree && !species) {
      setError('Escolha uma espécie para plantar.')
      return
    }
    setError(null)
    timer.start(n, {
      biome,
      species,
      taskId: link.taskId,
      notebookId: link.notebookId,
      treeId: chosenTree?.id,
    })
  }

  const onGiveUp = () => {
    timer.giveUp()
    setConfirmGiveUp(false)
    setError(null)
  }

  if (!active) {
    return (
      <section className="focus-page">
        <h1>Foco</h1>
        <form
          className="focus-setup"
          onSubmit={(e) => {
            e.preventDefault()
            onStart()
          }}
        >
          <DurationPicker value={duration} onChange={(v) => { setDuration(v); setError(null) }} error={error ?? undefined} />
          <LinkPicker taskId={link.taskId} notebookId={link.notebookId} onChange={setLink} />
          <TreePicker value={effectiveTreeChoice} onChange={setTreeChoice} />
          <SpeciesPicker
            biome={biome}
            species={species}
            onChange={setSpeciesState}
            locked={Boolean(chosenTree)}
            lockReason="Espécie e bioma seguem a árvore escolhida."
          />
          <button type="submit" className="button-primary focus-start">
            🌱 Plantar
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="focus-page">
      <h1>Foco</h1>

      <figure className="focus-tree">
        <TreeSvg biome={activeBiome} species={activeSpecies} stage={displayedStage} progress={frac} />
        <figcaption className="focus-stage-note">
          {stageName(displayedStage)}
          {displayedStage < finalStage && (
            <>
              {' '}
              <span aria-hidden="true">→</span>
              <span className="sr-only">crescendo para</span> {stageName(finalStage)}
            </>
          )}
        </figcaption>
      </figure>

      <div className="focus-time" role="timer" aria-label={`Tempo restante: ${Math.floor(remainingSec / 60)} minutos e ${remainingSec % 60} segundos`}>
        {fmt(remainingSec)}
      </div>

      <div className="focus-status">
        {pausedAt && <span className="focus-paused-badge">Pausado</span>}
        {(linkedTask || linkedNotebook) && (
          <p className="hint focus-links">
            {linkedTask && <>Tarefa: {linkedTask.title}</>}
            {linkedTask && linkedNotebook && ' · '}
            {linkedNotebook && <>Caderno: {linkedNotebook.name}</>}
          </p>
        )}
      </div>

      <div className="focus-controls">
        {!pausedAt ? (
          <>
            <button
              type="button"
              className="button-primary"
              onClick={timer.pause}
              disabled={!timer.canPause()}
              aria-describedby={timer.canPause() ? undefined : 'pause-hint'}
            >
              Pausar
            </button>
            {!timer.canPause() && (
              <span id="pause-hint" className="hint">
                Disponível após {PAUSE_AFTER_MINUTES} min
              </span>
            )}
          </>
        ) : (
          <button type="button" className="button-primary" onClick={timer.resume}>
            ▶ Retomar
          </button>
        )}
        <button type="button" className="focus-giveup" onClick={() => setConfirmGiveUp(true)}>
          Desistir
        </button>
      </div>

      <ConfirmDialog
        open={confirmGiveUp}
        danger
        title="Desistir da sessão?"
        message="Se desistir, a árvore morre e a sessão não será salva. Continuar?"
        confirmLabel="Sim, desistir"
        onConfirm={onGiveUp}
        onCancel={() => setConfirmGiveUp(false)}
      />
    </section>
  )
}
