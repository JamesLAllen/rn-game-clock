import GameClock from './GameClock'

describe('GameClock', () => {
  const onStatus = jest.fn()
  const onMilestoneComplete = jest.fn()
  const onGameComplete = jest.fn()
  const gameClock = new GameClock(undefined, undefined, onStatus, onMilestoneComplete, onGameComplete)
  it('sets time to 5:00:00', () => {
    // sets to 5 minutes
    gameClock.setTime(300000)
    expect(gameClock.totalTime).toBe(300000)
  })
  it('sets milestones to quarters', () => {
    gameClock.setMilestones(4)
    expect(gameClock.milestones).toBe(4)
  })
  it('Milestone Tests', () => {
    gameClock.reset()
    gameClock.setTime(300000) // set to 5 minutes
    gameClock.setMilestones(4)
    gameClock.start()
    jest.advanceTimersByTime(180000) // advance by 3 minutes
    expect(gameClock.currentMilestone).toBe(3)
    expect(gameClock.milestoneTime).toBe(30000)
  })
  it('Game Complete tests', () => {
    gameClock.reset()
    gameClock.setTime(300000) // set to 5 minutes
    gameClock.setMilestones(2) // just halves this time
    gameClock.start()
    jest.advanceTimersByTime(300000) // advance by 5 minutes (trigger end events)
    expect(gameClock.currentMilestone).toBe(2) // second half
    expect(gameClock.milestoneTime).toBe(0)
    expect(onStatus).toHaveBeenCalled()
    expect(onMilestoneComplete).toHaveBeenCalled()
    expect(onGameComplete).toHaveBeenCalled()
  })
})
