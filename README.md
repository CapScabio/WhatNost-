<div align="center">
  <img src="https://nostr.com/images/nostr-logo-black.png" width="100" />
  <h1>WhatNost?</h1>
  <p><strong>El Onboarding Definitivo para Nostr 🚀</strong></p>
  <p><i>Construido para la Hackathon <b>IDENTITY</b> de La Crypta (Abril 2026)</i></p>

  <p>
    <a href="#-el-problema">El Problema</a> •
    <a href="#-la-solución">La Solución</a> •
    <a href="#-features">Features</a> •
    <a href="#-quick-start">Quick Start</a>
  </p>
</div>

---

## 🤔 El Problema
La red Nostr es una revolución criptográfica, pero su curva de aprendizaje asusta a los usuarios comunes. Hablamos de *nsecs*, *npubs*, relays, NIP-05, clientes, web de confianza... Demasiados tecnicismos para alguien que solo quiere crear una cuenta y hablar con el mundo sin ser censurado.

## 💡 La Solución
**WhatNost?** es una DApp diseñada específicamente para mitigar la fricción inicial y convertir un proceso abstracto en una experiencia premium tipo *Linktree* web2, guiando a los nuevos usuarios paso a paso:

1. **Generación Mágica:** Creamos la criptografía en la consola sin asustar al usuario.
2. **Pedagogía de Seguridad:** Una UX que **obliga** al usuario a guardar su `nsec` (clave privada) de la forma correcta antes de continuar, sin sacrificar comodidad.
3. **Dashboard Bento-Box:** Un gestor de perfil (NIP-01) en tiempo real con Live Previews, emulando la facilidad de armar un perfil en Instagram o Twitter. Trae integración de tu propia Lightning Address como wallet.

---

## ✨ Features

- 🌈 **Diseño Premium:** Interfaz oscura, elegante, con transiciones impulsadas por `framer-motion` y utilidades de `lucide-react`.
- 🔑 **Llévate tus Llaves (Login):** Autenticación sin servidores ni contraseñas. Funciona vía nsec, NIP-07 (Alby) o Nostr Connect (Bunker).
- 🎨 **Visualizador en Vivo Bento-Box:** Todo lo que escribes en tu perfil Kind 0 se ve instantáneamente reflejado en un "teléfono virtual" en pantalla.
- ⚡ **Lightning Ready:** Trae a tu propia wallet Lightning (vía LUD-16) y exhibe tu Verificación NIP-05.

---

## 🛠 Stack Tecnológico

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 + Framer Motion
- **Protocolo Nostr:** `@nostr-dev-kit/ndk` + `nostr-tools`
- **Gestión de Estado:** Zustand

---

## 🚀 Quick Start (Local)

Para correr este proyecto en tu entorno local:

```bash
# 1. Clona este repositorio
git clone https://github.com/CapScabio/whatnost.git
cd whatnost

# 2. Instala dependencias web y animaciones
npm install

# 3. Corre el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y experimenta el mejor Onboarding del protocolo Nostr.

---

<div align="center">
  <p>Construido con ⚡ por Santiago para <b>La Crypta</b></p>
</div>
