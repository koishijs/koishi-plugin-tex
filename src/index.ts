import { Context, Schema } from 'koishi'
import {} from '@koishijs/plugin-puppeteer'
import { escape } from 'querystring'

declare module 'koishi' {
  interface Modules {
    tex: typeof import('.')
  }
}

export interface Config {}

export const name = 'tex'

export const schema: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.with(['puppeteer'], () => {
    ctx.command('tex <code:rawtext>', 'TeX 渲染', { authority: 2 })
      .usage('渲染器由 https://www.zhihu.com/equation 提供。')
      .action(async (_, tex) => {
        if (!tex) return '请输入要渲染的 LaTeX 代码。'
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
  })
}
