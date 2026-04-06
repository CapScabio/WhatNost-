# CLAUDE.md — Nostr Starter Kit

Este es el starter kit para la hackathon **IDENTITY** de La Crypta (Abril 2026).

## Stack
- **Next.js 16** + TypeScript + Tailwind CSS
- **NDK** (Nostr Dev Kit) — abstracción de nostr-tools
- **Zustand** — state management
- **nostr-tools** — utilidades core

## Estructura
```
src/
├── app/              # Next.js App Router
├── components/       # React components
│   ├── Navbar.tsx    # Nav con botón de login
│   ├── LoginModal.tsx # Modal con 3 métodos de auth
│   └── Profile.tsx   # Perfil tipo Twitter
├── lib/
│   └── nostr.ts      # Funciones de Nostr (NDK, login, fetch)
├── store/
│   └── auth.ts       # Zustand store para auth
└── types/
    └── nostr.d.ts    # Types para window.nostr
```

## Comandos
```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción
```

## Métodos de Login Implementados
1. **Extension** — Alby, nos2x, o cualquier NIP-07
2. **nsec** — Clave privada directa (solo en memoria)
3. **Bunker** — Remote signer via NIP-46

## Features Actuales
- ✅ Conexión a relays (Damus, Nostr.band, nos.lol, Primal)
- ✅ Login con 3 métodos
- ✅ Fetch y display de perfil (kind 0)
- ✅ Followers y following count
- ✅ Timeline de notas (kind 1)
- ✅ Formato timestamp relativo

## Ideas para Expandir
- [ ] Publicar notas (kind 1)
- [ ] Editar perfil (kind 0)
- [ ] Verificación NIP-05
- [ ] Zaps (NIP-57)
- [ ] DMs encriptados (NIP-04)
- [ ] Follow/unfollow usuarios
- [ ] Búsqueda de usuarios
- [ ] Perfil de otros usuarios (vista pública)
- [ ] Replies y threads
- [ ] Reposts
- [ ] Likes/reactions

## Relays Default
- wss://relay.damus.io
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.primal.net

## Recursos
- [NDK Documentation](https://ndk.fyi)
- [Nostr Protocol](https://nostr.com)
- [NIPs Repository](https://github.com/nostr-protocol/nips)
- [nostr-tools](https://github.com/nbd-wtf/nostr-tools)

## Hackathon
- **Tema:** IDENTITY — Nostr Identity & Social
- **Nivel:** Beginner
- **Inscripción:** https://tally.so/r/9qDNEY
- **Discord:** La Crypta
