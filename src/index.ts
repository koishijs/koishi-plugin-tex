import { Context, Schema } from 'koishi'
import {} from '@koishijs/plugin-puppeteer'
import { escape } from 'querystring'

export const name = 'TeX'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const using = ['puppeteer'] as const

export function apply(ctx: Context) {
  ctx.i18n.define('zh', require('./locales/zh'))

  ctx.command('tex <code:rawtext>', { authority: 2 })
    .action(async ({ session }, tex) => {
      if (!tex) return session.text('.expect-text')
      return ctx.puppeteer.render(null, async (page, next) => {
        await page.goto('https://www.zhihu.com/equation?tex=' + escape(tex))
        const svg = await page.$('svg')
        const inner: string = await svg.evaluate((node: SVGElement) => {
          node.style.padding = '0.25rem 0.375rem'
          return node.innerHTML
        })
        const text = inner.match(/>([^<]+)<\/text>/)
        return text ? text[1] : next(svg)
      })
    })
}
