// Runner de pruebas E2E: levanta el servidor de Vite y ejecuta Mocha con Selenium WebDriver.
import { spawn } from 'node:child_process'
import http from 'node:http'
import process from 'node:process'

const PORT = 5199
const BASE_URL = `http://localhost:${PORT}`
// Modo demo: navegador visible y pausas (para grabar el video).
const DEMO = process.argv.includes('--demo')

function waitForServer(url, timeout = 40000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const attempt = () => {
      const req = http.get(url, (res) => { res.destroy(); resolve() })
      req.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('El servidor no respondió a tiempo'))
        else setTimeout(attempt, 500)
      })
    }
    attempt()
  })
}

// Levantar Vite usando su binario directamente (evita problemas con npm en Windows).
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'],
  { stdio: 'inherit' },
)

let exitCode = 1
try {
  await waitForServer(BASE_URL)
  console.log(`\n> Servidor listo en ${BASE_URL}. Ejecutando pruebas Selenium...\n`)

  const mocha = spawn(
    process.execPath,
    ['node_modules/mocha/bin/mocha.js', 'tests/**/*.test.js', '--timeout', '90000'],
    { stdio: 'inherit', env: { ...process.env, BASE_URL, ...(DEMO ? { DEMO: '1' } : {}) } },
  )
  exitCode = await new Promise((resolve) => mocha.on('exit', (code) => resolve(code ?? 1)))
} catch (err) {
  console.error(err.message)
} finally {
  server.kill()
}

process.exit(exitCode)
