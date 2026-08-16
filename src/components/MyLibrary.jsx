import { useState } from 'react'
import { STATUS, STATUS_LABELS } from '../store/useLibrary'
import AnimeCard from './AnimeCard'

// Vista "Mi biblioteca": muestra los animes guardados, filtrables por estado.
export default function MyLibrary({ items, getStatus, onSetStatus, onRemove }) {
  const [filter, setFilter] = useState('todos')

  const filtered = filter === 'todos'
    ? items
    : items.filter((a) => a.status === filter)

  const counts = {
    todos: items.length,
    [STATUS.WATCHING]: items.filter((a) => a.status === STATUS.WATCHING).length,
    [STATUS.COMPLETED]: items.filter((a) => a.status === STATUS.COMPLETED).length,
    [STATUS.PENDING]: items.filter((a) => a.status === STATUS.PENDING).length,
  }

  return (
    <section>
      <div className="filters" data-testid="filters">
        <button
          className={`chip ${filter === 'todos' ? 'chip--active' : ''}`}
          onClick={() => setFilter('todos')}
          data-testid="filter-todos"
        >
          Todos ({counts.todos})
        </button>
        {Object.values(STATUS).map((status) => (
          <button
            key={status}
            className={`chip ${filter === status ? 'chip--active' : ''}`}
            onClick={() => setFilter(status)}
            data-testid={`filter-${status}`}
          >
            {STATUS_LABELS[status]} ({counts[status]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="state-msg" data-testid="empty-library">
          No hay animes en esta lista todavia. Ve al catalogo y agrega algunos.
        </p>
      ) : (
        <div className="grid" data-testid="library-grid">
          {filtered.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              currentStatus={getStatus(anime.id)}
              onSetStatus={onSetStatus}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}
