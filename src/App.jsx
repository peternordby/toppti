import './App.css'
import { useState } from 'react'
import categories from './categories'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram, faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons'

function App() {

  const [gamestate, setGamestate] = useState('start')
  const [selectedId, setSelectedId] = useState(null)
  const [previousIds, setPreviousIds] = useState([])
  const [answersVisible, setAnswersVisible] = useState(false)

  const start = () => {
    setGamestate('started')
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

  const renderState = () => {
    switch (gamestate) {
      case 'start':
        return (
          <>
            <div className="start">
              <h1>Topp 10</h1>
              <div className="buttons">
                <button onClick={start}>Start</button>
                <button onClick={() => { setGamestate("rules") }}>Regler</button>
              </div>
            </div>
          </>
        )
      case 'started':
        return (
          <>
            <h1>{categories[selectedId].navn}</h1>
            {!answersVisible && <button onClick={showAnswers}>Vis Fasit</button>}
            {answersVisible &&
            <>
              <ol>
                {categories[selectedId].fasit.map((fasit, index) => {
                  return (
                    <li key={index}>{fasit}</li>
                  )
                })}
              </ol>
              {previousIds.length === categories.length - 1 ?
                <button onClick={() => { setGamestate("finished") }}>Avslutt</button>
                :
                <button onClick={next}>Neste Kategori</button>
              }
              <div className="source">
                <a href={categories[selectedId].kilde} target='_blank' rel='noopener noreferrer'>Kilde ({ categories[selectedId].år })</a> 
              </div>
            </>
            }
          </>
        )
      case 'finished':
        return (
          <>
            <h1>Takk for at du spilte!</h1>
            <p className='madeby'>Laget av Peter Skaar Nordby</p>
            <div className="socialmedia">
              <a href="https://www.instagram.com/peter.nordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faInstagram} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
              <a href="https://www.linkedin.com/in/peternordby/" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faLinkedin} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
              <a href="https://github.com/peternordby" target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faGithubSquare} size='2xl' style={{color: '#f9f9f9'}}/>
              </a>
            </div>
          </>
        )
      case 'rules':
        return (
          <>
            <h1>Regler</h1>
            <div className="rules">
              <p>Formålet med spillet er å gjette et av svarene som ligger på topp 10 i den gitte kategorien</p>
              <p>Man kan spille på lag eller individuelt, og alle gjør sine egne gjetninger</p>
              <p>Poeng blir bestemt ut i fra hvor på topp 10-listen gjettet var</p>
              <p>Er gjettet ditt nummer 1 på listen, får du/dere 1 poeng</p>
              <p>Er gjettet ditt nummer 10 på listen, får du/dere 10 poeng</p>
              <p>Er ikke gjettet ditt på listen, får du/dere 0 poeng</p>
            </div>
            <button onClick={() => { setGamestate("start") }}>Hjem</button>
          </>
        )
      default:
        return (
          <>
            <h1>Ukjent spilltilstand</h1>
          </>
        )
    }
  }

  return (
    <div className="App">
      {renderState()}
    </div>
  )
}

export default App
