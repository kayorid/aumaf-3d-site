import type { APIRoute } from 'astro'

export const prerender = true

// Robots.txt dinâmico — usa o site configurado em astro.config.ts para evitar
// apontar para o domínio errado em homologação. LLM crawlers explicitamente
// permitidos (Política GEO).
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://aumaf.kayoridolfi.ai')).origin
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# AI crawlers — explicitamente permitidos para visibilidade em LLMs (ver /llms.txt).
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

Sitemap: ${origin}/sitemap-index.xml
`
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
