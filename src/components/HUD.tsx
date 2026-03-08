import type { SkillType } from '../types'

interface HUDProps {
  gp: number
  ballInPlay: boolean
  lastSkill: SkillType | null
  ballsFired: number
}

const SKILL_LABELS: Record<SkillType, string> = {
  mining: '⛏️ Mining',
  fishing: '🎣 Fishing',
  sailing: '⛵ Sailing',
  smithing: '🔨 Smithing',
  woodcutting: '🪓 Woodcutting',
  cooking: '🍳 Cooking',
  herblore: '🧪 Herblore',
  crafting: '✂️ Crafting',
  fletching: '🏹 Fletching',
  farming: '🌱 Farming',
}

export function HUD({ gp, ballInPlay, lastSkill, ballsFired }: HUDProps) {
  return (
    <div
      data-testid="hud"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: '#2d1f0e',
        border: '1px solid #8B6914',
        borderRadius: 4,
        fontFamily: 'monospace',
        color: '#FFD700',
        marginBottom: 8,
      }}
    >
      <div data-testid="gp-display">GP: {gp.toLocaleString()}</div>
      <div data-testid="balls-fired">Balls: {ballsFired}</div>
      {lastSkill && <div data-testid="last-skill">{SKILL_LABELS[lastSkill]}</div>}
      {!ballInPlay && (
        <div style={{ color: '#aaa', fontSize: 12 }}>Click table to launch</div>
      )}
    </div>
  )
}
