import './App.css'
import { useState } from 'react'
import categories from './categories'

function App() {

  const [hasStarted, setHasStarted] = useState(false)
  const [hasFinished, setHasFinished] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [previousIds, setPreviousIds] = useState([])
  const [answersVisible, setAnswersVisible] = useState(false)

  const start = () => {
    setHasStarted(true)
    setSelectedId(Math.floor(Math.random() * categories.length))
  }

  const next = () => {
    const newPreviousIds = [...previousIds, selectedId]
    setPreviousIds(newPreviousIds)
    let newSelectedId = Math.floor(Math.random() * categories.length)
    while (newPreviousIds.includes(newSelectedId)) {
      newSelectedId = Math.floor(Math.random() * categories.length)
    }
    setSelectedId(newSelectedId)
    setAnswersVisible(false)
  }

  const showAnswers = () => {
    setAnswersVisible(true)
  }

  const end = () => {
    setHasFinished(true)
  }

  return (
    <>
      {
        hasFinished ?
          <h1>Ferdig</h1>
          :
        <>
        {
          hasStarted?
        <>
          <h1>{categories[selectedId].navn}</h1>
          {!answersVisible && <button onClick={showAnswers}>Vis Fasit</button>}
          {answersVisible && !hasFinished &&
          <>
            <ol>
              {categories[selectedId].fasit.map((fasit, index) => {
                return (
                  <li key={index}>{fasit}</li>
                )
              })}
            </ol>
            {previousIds.length === categories.length - 1 ?
              <button onClick={end}>Avslutt</button>
              :
              <button onClick={next}>Neste Kategori</button>
            }
            <div className="source">
              <a href={categories[selectedId].kilde} target='_blank' rel='noopener noreferrer'>Kilde</a> 
            </div>
          </>
          }
        </>
        :
        <>
          <h1>Topp 10</h1>
          <button onClick={start}>Start</button>
        </>
      }
      </>
      }
    </>
  )
}

export default App
