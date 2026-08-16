import { useEffect, useRef, useState } from 'react'
import { searchAnime } from '../api/anilist'
import AnimeCard from './AnimeCard'

// Vista de catalogo: barra de busqueda + resultados de la API AniList.
export default function Catalog({ getStatus, onSetStatus }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    // Debounce para no golpear la API en cada tecla.
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const controller = new AbortController()

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await searchAnime(query, controller.signal)
        setResults(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        setLoading(false)
      }
    }, 450)

    return () => {
      controller.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <section>
      <div className="search-bar">
        <input
          type="search"
          placeholder="Buscar anime (ej. Naruto, One Piece)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar anime"
          data-testid="search-input"
        />
      </div>

      {loading && <p className="state-msg" data-testid="loading">Cargando animes...</p>}
      {error && <p className="state-msg state-msg--error" data-testid="error">{error}</p>}
      {!loading && !error && results.length === 0 && (
        <p className="state-msg" data-testid="no-results">No se encontraron animes.</p>
      )}

      <div className="grid" data-testid="catalog-grid">
        {results.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            currentStatus={getStatus(anime.id)}
            onSetStatus={onSetStatus}
          />
        ))}
      </div>
    </section>
  )
}
