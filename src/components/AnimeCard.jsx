import { STATUS, STATUS_LABELS } from '../store/useLibrary'

// Tarjeta que muestra un anime y permite asignarle un estado.
export default function AnimeCard({ anime, currentStatus, onSetStatus, onRemove }) {
  return (
    <article className="anime-card" data-testid="anime-card">
      <div className="anime-card__poster">
        {anime.image ? (
          <img src={anime.image} alt={anime.title} loading="lazy" />
        ) : (
          <div className="anime-card__noimg">Sin imagen</div>
        )}
        {anime.score && <span className="anime-card__score">★ {anime.score}</span>}
      </div>

      <div className="anime-card__body">
        <h3 className="anime-card__title" title={anime.title}>{anime.title}</h3>
        <p className="anime-card__meta">
          {anime.year || 's/f'} · {anime.episodes ? `${anime.episodes} eps` : 'eps s/d'}
        </p>

        {currentStatus && (
          <span className={`badge badge--${currentStatus}`} data-testid="status-badge">
            {STATUS_LABELS[currentStatus]}
          </span>
        )}

        <div className="anime-card__actions">
          {Object.values(STATUS).map((status) => (
            <button
              key={status}
              type="button"
              className={`btn btn--sm ${currentStatus === status ? 'btn--active' : ''}`}
              onClick={() => onSetStatus(anime, status)}
              data-testid={`set-${status}`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
          {currentStatus && onRemove && (
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => onRemove(anime.id)}
              data-testid="remove-btn"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
