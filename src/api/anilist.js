// Capa de acceso a la API publica AniList (GraphQL).
// Documentacion: https://docs.anilist.co/
// Se migro desde Jikan porque esa API respondia 504 de forma intermitente.
const ENDPOINT = 'https://graphql.anilist.co'

// Consulta reutilizable: lista los mas populares o busca por texto.
const QUERY = `
query ($search: String, $sort: [MediaSort]) {
  Page(perPage: 25) {
    media(type: ANIME, search: $search, sort: $sort, isAdult: false) {
      id
      title { romaji english }
      coverImage { large }
      averageScore
      seasonYear
      episodes
      description(asHtml: false)
      genres
    }
  }
}`

// Normaliza un anime de AniList a la forma que usa nuestra app.
function mapAnime(item) {
  return {
    id: item.id,
    title: item.title?.english || item.title?.romaji || 'Sin titulo',
    image: item.coverImage?.large || '',
    // AniList da la puntuacion sobre 100; la pasamos a escala sobre 10.
    score: item.averageScore ? +(item.averageScore / 10).toFixed(1) : null,
    year: item.seasonYear ?? null,
    episodes: item.episodes ?? null,
    synopsis: item.description ?? '',
    genres: item.genres || [],
  }
}

// Busca animes por texto. Si no hay texto, trae los mas populares.
// Reintenta un par de veces ante errores transitorios de red o del servidor.
export async function searchAnime(query, signal, retries = 2) {
  const search = query && query.trim() ? query.trim() : null
  const variables = {
    search,
    // Si hay busqueda, ordenar por coincidencia; si no, por popularidad.
    sort: search ? ['SEARCH_MATCH'] : ['POPULARITY_DESC'],
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: QUERY, variables }),
      signal,
    })

    if (res.ok) {
      const json = await res.json()
      const media = json?.data?.Page?.media || []
      return media.map(mapAnime)
    }

    // 429 (limite de peticiones) y 5xx son transitorios: esperar y reintentar.
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await new Promise((r) => setTimeout(r, 700 * (attempt + 1)))
      continue
    }
    throw new Error(`Error al consultar la API (${res.status})`)
  }
}
