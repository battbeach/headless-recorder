const importPuppeteer = `const puppeteer = require('puppeteer');\n`

const header = `const browser = await puppeteer.launch()
const page = await browser.newPage()`

const footer = `
await browser.close()`

const wrappedHeader = `(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()\n`

const wrappedFooter = `
  await browser.close()
})()`

const defaults = {
  wrapAsync: true,
  headless: true
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
  }

  generate (events) {
    return importPuppeteer + this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _getHeader () {
    console.debug(this._options)
    let hdr = this._options.wrapAsync ? wrappedHeader : header
    hdr = this._options.headless ? hdr : hdr.replace('launch()', 'launch({ headless: false })')
    return hdr
  }

  _getFooter () {
    return this._options.wrapAsync ? wrappedFooter : footer
  }

  _parseEvents (events) {
    console.debug(`generating code for ${events.length} events`)
    let result = ''
    for (let event of events) {
      const { action, selector, value, href, keyCode } = event
      switch (action) {
        case 'keydown':
          result += this._handleKeyDown(selector, value, keyCode)
          break
        case 'click':
          result += this._handleClick(selector, href)
          break
        case 'goto*':
          result += `  await page.goto('${href}')\n`
          break
        case 'reload':
          result += `  await page.reload()\n`
          break
      }
    }
    return result
  }
  _handleKeyDown (selector, value, keyCode) {
    if (keyCode === 9) return `  await page.type('${selector}', '${value}')\n`
    return ''
  }

  _handleClick (selector, href) {
    return `  await page.click('${selector}')\n`
  }
}
