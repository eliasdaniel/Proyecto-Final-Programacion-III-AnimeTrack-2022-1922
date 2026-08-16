import { useCallback, useEffect, useState } from 'react'

// Estados posibles de un anime en la biblioteca del usuario.
export const STATUS = {
  WATCHING: 'viendo',
  COMPLETED: 'completado',
  PENDING: 'pendiente',
}

export const STATUS_LABELS = {
  [STATUS.WATCHING]: 'Viendo',
  [STATUS.COMPLETED]: 'Completado',
  [STATUS.PENDING]: 'Pendiente',
}

const STORAGE_KEY = 'animetrack.library'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Hook que administra la biblioteca personal del usuario, persistida en localStorage.
// La biblioteca es un objeto { [animeId]: { ...anime, status } }.
export function useLibrary() {
  const [library, setLibrary] = useState(loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  }, [library])

  // Agrega o actualiza un anime con un estado dado.
  const setStatus = useCallback((anime, status) => {
    setLibrary((prev) => ({
      ...prev,
      [anime.id]: { ...anime, status },
    }))
  }, [])

  // Elimina un anime de la biblioteca.
  const remove = useCallback((animeId) => {
    setLibrary((prev) => {
      const next = { ...prev }
      delete next[animeId]
      return next
    })
  }, [])

  // Devuelve el estado actual de un anime (o null si no esta guardado).
  const getStatus = useCallback(
    (animeId) => library[animeId]?.status ?? null,
    [library],
  )

  const items = Object.values(library)

  return { library, items, setStatus, remove, getStatus }
}
