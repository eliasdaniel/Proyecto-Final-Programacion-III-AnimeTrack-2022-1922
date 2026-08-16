// Pruebas E2E de la biblioteca con Selenium WebDriver + Mocha.
import assert from 'node:assert'
import { until } from 'selenium-webdriver'
import {
  createDriver, BASE_URL, testId, waitForCards, countCards,
  seedLibrary, sampleLibrary, pause,
} from './helpers.js'

describe('Mi biblioteca (Selenium)', function () {
  this.timeout(90000)
  let driver

  beforeEach(async () => { driver = await createDriver() })
  afterEach(async () => { if (driver) await driver.quit() })

  it('CP-05: marcar un anime como "Viendo" muestra la insignia', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    await pause(driver)
    const first = (await driver.findElements(testId('anime-card')))[0]
    await first.findElement(testId('set-viendo')).click()
    const badge = await driver.wait(until.elementLocated(testId('status-badge')), 5000)
    assert.strictEqual((await badge.getText()).trim(), 'Viendo')
    await pause(driver)
  })

  it('CP-06: un anime marcado aparece en Mi biblioteca', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    await pause(driver)
    const first = (await driver.findElements(testId('anime-card')))[0]
    await first.findElement(testId('set-completado')).click()
    await driver.wait(until.elementLocated(testId('status-badge')), 5000)
    await pause(driver)

    await driver.findElement(testId('nav-biblioteca')).click()
    await driver.wait(until.elementLocated(testId('library-grid')), 5000)
    assert.strictEqual(await countCards(driver), 1)
    const badge = await driver.findElement(testId('status-badge'))
    assert.strictEqual((await badge.getText()).trim(), 'Completado')
    await pause(driver)
  })

  it('CP-07: el contador del nav aumenta al agregar animes', async () => {
    await driver.get(BASE_URL)
    await waitForCards(driver)
    await pause(driver)
    const cards = await driver.findElements(testId('anime-card'))
    await cards[0].findElement(testId('set-pendiente')).click()
    await pause(driver)
    await cards[1].findElement(testId('set-viendo')).click()
    await driver.wait(async () => {
      const text = await driver.findElement(testId('nav-biblioteca')).getText()
      return text.includes('2')
    }, 5000, 'el contador no llegó a 2')
    await pause(driver)
  })

  it('CP-08: filtrar la biblioteca por estado', async () => {
    await seedLibrary(driver, sampleLibrary)
    await driver.findElement(testId('nav-biblioteca')).click()
    await driver.wait(until.elementLocated(testId('library-grid')), 5000)
    assert.strictEqual(await countCards(driver), 3)
    await pause(driver)

    await driver.findElement(testId('filter-viendo')).click()
    await driver.wait(async () => (await countCards(driver)) === 1, 5000)
    const badge = await driver.findElement(testId('status-badge'))
    assert.strictEqual((await badge.getText()).trim(), 'Viendo')
    await pause(driver)
  })

  it('CP-09: quitar un anime lo elimina de la biblioteca', async () => {
    await seedLibrary(driver, { 1: sampleLibrary[1] })
    await driver.findElement(testId('nav-biblioteca')).click()
    await driver.wait(until.elementLocated(testId('anime-card')), 5000)
    await pause(driver)
    await driver.findElement(testId('remove-btn')).click()
    await driver.wait(until.elementLocated(testId('empty-library')), 5000)
    await pause(driver)
  })

  it('CP-10: la biblioteca persiste al recargar la página', async () => {
    await seedLibrary(driver, { 5: sampleLibrary[5] })
    await driver.navigate().refresh()
    await driver.findElement(testId('nav-biblioteca')).click()
    await driver.wait(until.elementLocated(testId('anime-card')), 5000)
    const badge = await driver.findElement(testId('status-badge'))
    assert.strictEqual((await badge.getText()).trim(), 'Completado')
    await pause(driver)
  })
})
