import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HUD } from './HUD'

describe('HUD', () => {
  it('displays GP', () => {
    render(<HUD gp={1500} ballInPlay={false} lastSkill={null} ballsFired={0} />)
    expect(screen.getByTestId('gp-display')).toHaveTextContent('GP: 1,500')
  })

  it('displays balls fired count', () => {
    render(<HUD gp={0} ballInPlay={false} lastSkill={null} ballsFired={5} />)
    expect(screen.getByTestId('balls-fired')).toHaveTextContent('Balls: 5')
  })

  it('shows last skill when set', () => {
    render(<HUD gp={0} ballInPlay={false} lastSkill="mining" ballsFired={0} />)
    expect(screen.getByTestId('last-skill')).toHaveTextContent('Mining')
  })

  it('shows launch hint when ball not in play', () => {
    render(<HUD gp={0} ballInPlay={false} lastSkill={null} ballsFired={0} />)
    expect(screen.getByText('Click table to launch')).toBeInTheDocument()
  })

  it('hides launch hint when ball is in play', () => {
    render(<HUD gp={0} ballInPlay={true} lastSkill={null} ballsFired={0} />)
    expect(screen.queryByText('Click table to launch')).not.toBeInTheDocument()
  })

  it('does not show last skill when null', () => {
    render(<HUD gp={0} ballInPlay={false} lastSkill={null} ballsFired={0} />)
    expect(screen.queryByTestId('last-skill')).not.toBeInTheDocument()
  })
})
