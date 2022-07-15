import { StatusBar } from 'expo-status-bar'
import React, { FC, useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, Pressable, View } from 'react-native'
// import useGameClock from './src/hooks/useGameClock'
import GameClock, { GameClockStatus } from './src/logic/GameClock'

const HomeLayout: FC<any> = ({ gameStatus, setTotalTime, setMilestones, startGame }) => {
  const { milestones, totalTime } = gameStatus
  const minutes = toMinutes(totalTime)
  return (
    <>
      <Text style={styles.h1}>Set your game time (In Minutes)</Text>
      <TextInput
        keyboardType='numeric'
        onChangeText={(mins) => setTotalTime(toMilliseconds(Number(mins)))}
        value={minutes?.toString()}
        maxLength={2} // setting limit of input
        selectTextOnFocus
        style={styles.inputField}
      />
      <Text style={styles.h1}>Would you like Quarters or Halves?</Text>
      <Pressable
        onPress={() => setMilestones(4)}
        style={milestones === 4 ? styles.selectedToggleButton : styles.unselectedToggleButton}
      >
        <Text>QUARTERS</Text>
      </Pressable>
      <Pressable
        onPress={() => setMilestones(2)}
        style={milestones === 2 ? styles.selectedToggleButton : styles.unselectedToggleButton}
      >
        <Text>HALVES</Text>
      </Pressable>
      <Pressable onPress={() => startGame()} style={styles.basicButton}>
        <Text style={styles.h1}>START GAME</Text>
      </Pressable>
    </>
  )
}

const GameRunningLayout: FC<any> = ({ gameStatus, stopGame }) => {
  const { currentTime } = gameStatus
  return (
    <>
      <Text style={styles.h1}>{displayTime(currentTime)}</Text>
      <Pressable onPress={() => stopGame()} style={styles.basicButton}>
        <Text style={styles.h1}>PAUSE GAME</Text>
      </Pressable>
    </>
  )
}

const GamePausedLayout: FC<any> = ({ gameStatus, startGame, resetGame }) => {
  const { currentTime, totalTime, milestones, currentMilestone } = gameStatus
  const isQuarters = milestones === 4
  const quarterText = `Quarter ${currentMilestone} / ${milestones}`
  const halvesText = `${formatOrdinal(currentMilestone)} Half`
  return (
    <>
      {currentTime >= totalTime && <Text style={styles.h1}>GAME OVER</Text>}
      <Text style={styles.h1}>{isQuarters ? quarterText : halvesText}</Text>
      <Text style={styles.h1}>{displayTime(currentTime)}</Text>
      {currentTime < totalTime && (
        <Pressable onPress={() => startGame()} style={styles.basicButton}>
          <Text style={styles.h1}>CONTINUE GAME</Text>
        </Pressable>
      )}
      <Pressable onPress={() => resetGame()} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>RESET GAME</Text>
      </Pressable>
    </>
  )
}

const formatOrdinal = (time: number) => (time === 1 ? '1st' : '2nd')

const toMilliseconds = (time: number): number => {
  const milliseconds: number = time * 60000
  return Number(milliseconds)
}

const toMinutes = (ms: number): number => Math.floor((ms / 1000 / 60) % 60)

const displayTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = toMinutes(ms)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function App() {
  const [totalTime = 300000, setTotalTime] = useState<number>()
  const [milestones = 2, setMilestones] = useState<number>()
  const [currentTime = 0, setCurrentTime] = useState<number>()
  const [milestoneIsComplete, setMilestonesComplete] = useState<number>()
  const [gameIsComplete, setGameIsComplete] = useState<boolean>()
  const [gameClock, setGameClock] = useState<GameClock>()
  const [gameStatus, setGameStatus] = useState<GameClockStatus>()

  const onMilestoneComplete = (status: GameClockStatus) => {
    setMilestonesComplete(status.currentMilestone)
  }

  const onGameComplete = (status: GameClockStatus) => {
    setGameIsComplete(true)
  }

  // const { gameStatus, startGame, stopGame, resetGame } = useGameClock(
  //   Number(totalTime),
  //   4,
  //   setMilestoneIsComplete,
  //   setGameIsComplete
  // )
  useEffect(() => {
    if (!gameClock) {
      const newGameClock = new GameClock(
        Number(totalTime),
        milestones,
        setGameStatus,
        onMilestoneComplete,
        onGameComplete
      )
      setGameClock(newGameClock)
      setGameStatus(newGameClock.status)
    } else {
      gameClock.setMilestones(milestones)
      gameClock.setTime(Number(totalTime))
      setGameStatus(gameClock.status)
    }
  }, [gameClock, milestones, totalTime])
  return (
    <View style={styles.container}>
      {gameClock && gameStatus && !gameStatus.isRunning && gameStatus.currentTime === 0 && (
        <HomeLayout
          gameStatus={gameStatus}
          setTotalTime={setTotalTime}
          setMilestones={setMilestones}
          startGame={() => gameClock.start()}
        />
      )}
      {gameClock && gameStatus && gameStatus.isRunning && (
        <GameRunningLayout
          gameStatus={gameStatus}
          currentMilestone={gameStatus.currentMilestone}
          stopGame={() => gameClock.stop()}
        />
      )}
      {gameClock && gameStatus && !gameStatus.isRunning && gameStatus.currentTime > 0 && (
        <GamePausedLayout
          gameStatus={gameStatus}
          startGame={() => gameClock.start()}
          resetGame={() => gameClock.reset()}
        />
      )}
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    width: 50,
    height: 50,
    borderColor: '#4681f4',
    borderWidth: 2,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 30,
    padding: 15,
  },
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedToggleButton: {
    backgroundColor: '#4681f4',
    width: 250,
    height: 50,
    borderColor: '#4681f4',
    borderWidth: 2,
    borderRadius: 9,
    justifyContent: 'center',
    marginTop: 10,
    alignItems: 'center',
  },
  unselectedToggleButton: {
    backgroundColor: '#fff',
    width: 250,
    height: 50,
    borderColor: '#4681f4',
    borderWidth: 2,
    borderRadius: 9,
    justifyContent: 'center',
    marginTop: 10,
    alignItems: 'center',
  },
  basicButton: {
    backgroundColor: '#5dbea3',
    width: 250,
    height: 50,
    borderColor: '#5dbea3',
    borderWidth: 2,
    borderRadius: 9,
    justifyContent: 'center',
    margin: 30,
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 30,
  },
  resetButton: {
    backgroundColor: '#ffbd03',
    width: 150,
    height: 50,
    borderColor: '#ffbd03',
    borderWidth: 2,
    borderRadius: 9,
    justifyContent: 'center',
    margin: 0,
    padding: 10,
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 30,
  },
})
