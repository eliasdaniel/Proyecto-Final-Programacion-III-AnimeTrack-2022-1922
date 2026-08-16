// Utilidades compartidas para las pruebas E2E con Selenium WebDriver.
import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

// La URL base la inyecta el runner 
export const BASE_URL = process.env.BASE_URL || 'http://localhost:5199'

// Clave donde la app guarda la biblioteca del usuario en localStorage.
export const STORAGE_KEY = 'animetrack.library'

// Modo demo
export const DEMO = process.env.DEMO === '1'
const DELAY = Number(process.env.DEMO_DELAY || 1400)

// Pausa entre acciones 
export async function pause(driver, ms = DELAY) {
  if (DEMO) await driver.sleep(ms)
}


export async function typeText(driver, element, text) {
  if (!DEMO) {
    await element.sendKeys(text)
    return
  }
  for (const char of text) {
    await element.sendKeys(char)
    await driver.sleep(160)
  }
}


export async function createDriver() {
  const options = new chrome.Options().addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  )
  if (DEMO) {
    options.addArguments('--start-maximized')
  } else {
    options.addArguments('--headless=new', '--window-size=1400,1000')
  }
  return new Builder().forBrowser('chrome').setChromeOptions(options).build()
}


export const testId = (id) => By.css(`[data-testid="${id}"]`)

// Espera a que el catalogo cargue al menos una tarjeta de anime.
export async function waitForCards(driver, timeout = 20000) {
  await driver.wait(until.elementLocated(testId('anime-card')), timeout)
}

// Cuenta cuantas tarjetas de anime hay actualmente en la pagina.
export async function countCards(driver) {
  return (await driver.findElements(testId('anime-card'))).length
}

// Siembra una biblioteca conocida en localStorage y recarga la pagina.
export async function seedLibrary(driver, items) {
  await driver.get(BASE_URL)
  await driver.executeScript(
    'window.localStorage.setItem(arguments[0], arguments[1]);',
    STORAGE_KEY,
    JSON.stringify(items),
  )
  await driver.navigate().refresh()
}

// Datos de ejemplo con los tres estados, para pruebas.
export const sampleLibrary = {
  1: { id: 1, title: 'Cowboy Bebop', image: '', score: 8.7, year: 1998, episodes: 26, synopsis: '', genres: [], status: 'viendo' },
  5: { id: 5, title: 'Fullmetal Alchemist: Brotherhood', image: '', score: 9.1, year: 2009, episodes: 64, synopsis: '', genres: [], status: 'completado' },
  9: { id: 9, title: 'One Piece', image: '', score: 8.7, year: 1999, episodes: null, synopsis: '', genres: [], status: 'pendiente' },
}
