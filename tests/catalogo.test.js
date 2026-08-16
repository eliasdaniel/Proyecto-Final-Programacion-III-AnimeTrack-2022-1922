// Pruebas E2E del catalogo con Selenium WebDriver + Mocha.
import assert from 'node:assert'
import { By, until } from 'selenium-webdriver'
import {
  createDriver, BASE_URL, testId, waitForCards, countCards, pause, typeText,
} from './helpers.js'

describe('Catálogo (Selenium)', function () {
  this.timeout(90000)
  let driver

  beforeEach(async () => { driver = await createDriver() })
  afterEach(async () => { if (driver) await driver.quit() })

  it('CP-01: la página carga con el título y la vista de catálogo', async () => {
    await driver.get(BASE_URL)
    await driver.wait(until.titleContains('Anime View'), 10000)
    const heading = await driver.wait(until.elementLocated(By.css('h1')), 10000)
    assert.strictEqual((await heading.getText()).trim(), 'Anime View')
    assert.ok(await driver.findElement(testId('search-input')))
    await pause(driver)
  })

  it('CP-02: el catálogo muestra animes al iniciar', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    assert.ok((await countCards(driver)) > 0, 'debe mostrarse al menos un anime')
    await pause(driver)
  })

  it('CP-03: buscar un anime filtra los resultados', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    await pause(driver)
    await typeText(driver, await driver.findElement(testId('search-input')), 'Naruto')
    // Esperar a que aparezca alguna tarjeta cuyo título contenga "Naruto".
    await driver.wait(async () => {
      const titles = await driver.findElements(By.css('.anime-card__title'))
      for (const t of titles) {
        if ((await t.getText()).toLowerCase().includes('naruto')) return true
      }
      return false
    }, 20000, 'no se encontró ningún anime con "Naruto"')
    await pause(driver)
  })

  it('CP-04: muestra mensaje de error si la API falla', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    await pause(driver)
    // Simular caída de red para forzar el error de la API.
    await driver.setNetworkConditions({
      offline: true, latency: 0, download_throughput: 0, upload_throughput: 0,
    })
    await typeText(driver, await driver.findElement(testId('search-input')), 'Rosa de Guadalupe')
    await driver.wait(until.elementLocated(testId('error')), 20000)
    await pause(driver)
  })
})
