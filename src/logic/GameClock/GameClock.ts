export type GameClockStatus = {
  isRunning: boolean
  totalTime: number
  currentTime: number
  milestones: number
  currentMilestone: number
  milestoneTime: number
}

export const initialProps: GameClockStatus = {
  isRunning: false,
  totalTime: 12000, // defaults to 2 minutes
  currentTime: 0,
  milestones: 2, // defaults to halves
  currentMilestone: 0,
  milestoneTime: 0,
}

export default class GameClock {
  private _totalTime: number = initialProps.totalTime
  private _milestones: number = initialProps.milestones
  private _currentTime: number = initialProps.currentTime
  private _currentMilestone: number = initialProps.currentMilestone
  private _milestoneTime: number = initialProps.milestoneTime
  private _timerInterval: ReturnType<typeof setInterval> | null = null
  private _onStatus: Function | null = null
  private _onMilestoneComplete: Function | null = null
  private _onGameComplete: Function | null = null

  constructor(
    time?: number,
    milestones?: number,
    onStatus?: Function,
    onMilestoneComplete?: Function,
    onGameComplete?: Function
  ) {
    if (time) this.setTime(time)
    if (milestones) this.setMilestones(milestones)
    if (onStatus) this._onStatus = onStatus
    if (onMilestoneComplete) this._onMilestoneComplete = onMilestoneComplete
    if (onGameComplete) this._onGameComplete = onGameComplete
  }

  public setTime = (time: number): number => {
    this._totalTime = time
    return this._totalTime
  }

  public setMilestones(milestones: number) {
    this._milestones = milestones
  }

  public start() {
    if (this._currentMilestone === 0) this._currentMilestone = 1
    if (this._timerInterval) this.stop()
    this._timerInterval = setInterval(() => {
      let currentTime = this._currentTime + 1000
      if (currentTime >= this._totalTime) {
        currentTime = this._totalTime
        this.stop()
      }
      const prevMilestone = this._currentMilestone
      const milestone = Math.floor((currentTime / this._totalTime) * this._milestones) + 1
      this._currentMilestone = milestone
      this._currentTime = currentTime
      if (milestone > prevMilestone) {
        this.stop()
        if (this._onMilestoneComplete && this._currentMilestone < this._milestones)
          this._onMilestoneComplete(this.status)
        if (this._onGameComplete && this._currentMilestone > this._milestones) {
          this._currentMilestone = this._milestones
          this._onGameComplete(this.status)
        }
      }
      if (this._onStatus) this._onStatus(this.status)
    }, 1000)
  }

  public stop() {
    if (this._timerInterval) clearInterval(this._timerInterval)
    this._timerInterval = null
    if (this._onStatus) this._onStatus(this.status)
  }

  public reset() {
    this._currentTime = 0
    this._currentMilestone = 0
    this.stop()
  }

  get currenTime(): number {
    return this._currentTime
  }

  get totalTime(): number {
    return this._totalTime
  }

  get milestones(): number {
    return this._milestones
  }

  get currentMilestone(): number {
    return this._currentMilestone
  }

  get milestoneTime(): number {
    if (this._currentMilestone === this._milestones) return 0 // account for capping the current milestone
    const currentMilestoneTime = (this._currentMilestone - 1) * (this._totalTime / this._milestones)
    return this._currentTime - currentMilestoneTime
  }

  get status(): GameClockStatus {
    return {
      isRunning: this._timerInterval !== null,
      totalTime: this._totalTime,
      currentTime: this._currentTime,
      milestones: this._milestones,
      currentMilestone: this._currentMilestone,
      milestoneTime: this.milestoneTime,
    }
  }
}
