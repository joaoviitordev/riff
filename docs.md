# Riff — Planejamento do Projeto

> Rede social musical com dados ao vivo do Spotify. Projeto próprio para portfólio.

---

## Visão Geral

Uma plataforma onde o usuário conecta sua conta do Spotify e ganha um perfil social musical. É possível ver o que outros usuários estão ouvindo em tempo real, acompanhar métricas de gosto musical e seguir pessoas com gostos parecidos.

**Diferencial:** Spotify Wrapped on demand, perfil social e now playing ao vivo — tudo junto, acessível a qualquer momento, não só em dezembro.

---

## Produto

### Features do MVP

| Feature                      | Descrição                                | Prioridade    |
| ---------------------------- | ---------------------------------------- | ------------- |
| Login com Spotify            | OAuth via Spotify, sem senha própria     | 🔴 Essencial  |
| Onboarding de username       | Escolha do `@handle` na primeira entrada | 🔴 Essencial  |
| Perfil público `/[username]` | Bio, foto, banner                        | 🔴 Essencial  |
| Now Playing ao vivo          | Música atual visível no perfil           | 🔴 Essencial  |
| Top artistas e músicas       | Short / medium / long term               | 🔴 Essencial  |
| Seguir usuários              | Follow/unfollow + contagem               | 🟡 Importante |
| Ver perfil de outros         | Now playing de quem você segue           | 🟡 Importante |
| Upload de avatar e banner    | Supabase Storage                         | 🟡 Importante |

### Decisões de produto

**Login:** OAuth only com Spotify — o usuário não cria senha no sistema. A identidade dele vive no seu produto através do `@username` escolhido no onboarding.

**Now Playing:** polling a cada 30 segundos via Supabase Realtime. Se o usuário estiver offline ou com o Spotify pausado, exibe "última música ouvida" com timestamp.

**Limite da Spotify API:** no modo desenvolvimento, até 25 usuários. Para portfólio isso é mais que suficiente. Para escalar, é necessário solicitar quota extension na Spotify for Developers.

---

## Fluxos Principais

### Autenticação e Onboarding

```
Usuário clica em "Entrar com Spotify"
        ↓
NextAuth redireciona para Spotify OAuth
        ↓
Spotify retorna accessToken + refreshToken
        ↓
NextAuth salva tokens no banco (model User)
        ↓
Primeira vez? → redireciona para /onboarding
        ↓
Usuário escolhe @username
        ↓
Conta criada → redireciona para /
```

---

## Ordem de Implementação

### Fase 1 — Base

- [ ] Setup Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar Supabase (banco + storage)
- [ ] Configurar Drizzle e rodar migrations
- [ ] NextAuth com provider Spotify
- [ ] Página de onboarding (escolha do @username)
- [ ] Página de perfil estática `/[username]`

### Fase 2 — Spotify Data

- [ ] Wrapper da Spotify API com refresh de token
- [ ] API routes para top tracks e top artists
- [ ] Componentes de métricas no profile
- [ ] Now Playing — polling + escrita no banco

### Fase 3 — Social

- [ ] Sistema de follows (follow/unfollow + contagem)
- [ ] Now Playing ao vivo com Supabase Realtime
- [ ] Ver perfil de outros usuários autenticado

### Fase 4 — Polish

- [ ] Upload de avatar e banner (Supabase Storage)
- [ ] Estados de loading e empty states bem feitos
- [ ] SEO e meta tags dinâmicas no perfil (`/[username]`)
- [ ] Mobile responsivo
- [ ] Deploy na Vercel com domínio próprio

---

## Referências

- [Spotify for Developers](https://developer.spotify.com)
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [NextAuth v5 Docs](https://authjs.dev)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Drizzle ORM Docs](https://orm.drizzle.team)
