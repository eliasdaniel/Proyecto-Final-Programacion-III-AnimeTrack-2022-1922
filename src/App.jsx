import { useState } from 'react'
import Catalog from './components/Catalog'
import MyLibrary from './components/MyLibrary'
import { useLibrary } from './store/useLibrary'
import './styles/App.css'

const VIEWS = {
  CATALOG: 'catalogo',
  LIBRARY: 'biblioteca',
}

export default function App() {
  const [view, setView] = useState(VIEWS.CATALOG)
  const { items, setStatus, remove, getStatus } = useLibrary()

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">◉</span>
          <h1>Anime View</h1>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${view === VIEWS.CATALOG ? 'nav-btn--active' : ''}`}
            onClick={() => setView(VIEWS.CATALOG)}
            data-testid="nav-catalogo"
          >
            Catalogo
          </button>
          <button
            className={`nav-btn ${view === VIEWS.LIBRARY ? 'nav-btn--active' : ''}`}
            onClick={() => setView(VIEWS.LIBRARY)}
            data-testid="nav-biblioteca"
          >
            Mi biblioteca <span className="nav-badge">{items.length}</span>
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === VIEWS.CATALOG ? (
          <Catalog getStatus={getStatus} onSetStatus={setStatus} />
        ) : (
          <MyLibrary
            items={items}
            getStatus={getStatus}
            onSetStatus={setStatus}
            onRemove={remove}
          />
        )}
      </main>
    </div>
  )
}
