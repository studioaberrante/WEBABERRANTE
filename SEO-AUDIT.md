# Auditoría SEO — studioaberrante.com
### Fecha: 2 de julio de 2026
### Objetivo: posicionar en Google Chile por "agencia de IA", "estudio de IA" y "generación de contenidos con IA"

---

## Puntaje de salud SEO: 38/100

El sitio es visualmente excepcional pero está casi invisible para Google: no hay palabras clave en los lugares que Google lee, hay muy poco texto (322 palabras), no existe registro en Google Search Console y no hay enlaces externos apuntando al sitio. La buena noticia: la base técnica (velocidad, móvil, HTTPS, robots.txt, sitemap) está sana, y los fundamentos se arreglan rápido.

---

## Cómo funciona posicionarse (contexto)

Google decide el ranking con 3 grandes factores:

1. **Relevancia** — ¿tu página DICE (en texto real) lo que la gente busca? Hoy la palabra "agencia" no aparece en tu sitio, y "Chile" tampoco. Google no puede adivinar.
2. **Autoridad** — ¿otros sitios te enlazan? (prensa, directorios, clientes). Hoy: ~0 backlinks detectables.
3. **Experiencia** — velocidad, móvil, que el usuario no rebote. Aquí están bien.

Para keywords comerciales como "agencia de IA" el proceso toma **3-6 meses** de trabajo consistente. No hay atajo legítimo — desconfía de quien prometa "primer lugar en 2 semanas".

---

## Hallazgos — On-Page (index.html)

### Title tag — FALLA (el problema #1)
- **Actual:** `Studio Aberrante — Not Real, Not Normal.`
- **Problema:** cero palabras clave. Nadie busca "not real not normal". El title es el factor on-page más importante.
- **Recomendado:** `Agencia de IA en Chile — Contenido y Publicidad | Studio Aberrante`

### Meta description — MEJORABLE
- **Actual:** menciona "AI Studio" e "inteligencia artificial" pero no "agencia" ni "Chile" ni "generación de contenido".
- **Recomendada:** `Studio Aberrante: agencia y estudio de IA en Chile. Generación de contenido, spots publicitarios, fotografía y avatares con inteligencia artificial. Nike, Claro, Salcobrand y más.`

### H1 — FALLA
- **Actual:** `Not Real, Not Normal.` (sin keywords)
- **Solución sin tocar el diseño:** convertir el eyebrow "Studio Aberrante — AI Studio" en el `<h1>` real con texto `Studio Aberrante — Agencia de contenido con inteligencia artificial`, y dejar el eslogan como elemento visual (`<p class="hero-title">`). Google lee etiquetas, no estilos.

### Contenido — FALLA (el problema #2)
- **322 palabras en total.** Para competir por keywords comerciales se necesita contenido sustancial (los que rankean por "agencia de IA" tienen 800–2.000+ palabras en su home o páginas de servicio).
- La palabra **"Chile" no aparece en ninguna parte del sitio** — imposible rankear para búsquedas locales ("agencia de ia chile").
- La palabra **"agencia" tampoco aparece** (solo "productora").
- Los textos de servicios son buenos pero cortos (1-2 líneas c/u).

### Otras fallas on-page
- Sin `<link rel="canonical">` en ninguna página.
- Sin datos estructurados (schema Organization/LocalBusiness) en la home. (/tv ya tiene VideoObject ✓)
- Sin `og:locale` (`es_CL`).
- H2 "¿QUÉ MIERDA HACEMOS?" — divertido para humanos, inútil para Google. Se puede mantener visualmente y compensar con H2/H3 con keywords en otras secciones.
- Solo 2 links internos en la home. `/tv` y la home casi no se enlazan entre sí con anchor text descriptivo.

---

## E-E-A-T (confianza para Google)

| Dimensión | Estado | Evidencia |
|---|---|---|
| Experiencia | Presente | Portafolio real con marcas reconocidas (Nike, Claro, Salcobrand) — el mayor activo del sitio |
| Expertise | Débil | No hay texto que explique CÓMO trabajan; no hay casos de estudio |
| Autoridad | Ausente | Sin backlinks, sin menciones de prensa, sin perfil LinkedIn empresa visible |
| Confianza | Presente | HTTPS ✓, equipo con nombres y fotos reales ✓, contacto visible ✓. Falta: testimonios de clientes con nombre |

---

## Análisis de keywords (Chile)

| Keyword | Intención | Dificultad | Nota |
|---|---|---|---|
| agencia de ia | Comercial | Alta | Genérica y ambigua (muchos resultados de consultoría/software). Trabajarla, pero no es la más rentable |
| agencia de ia chile | Comercial | Media | La versión ganable a mediano plazo |
| estudio de ia / ai studio chile | Comercial | Media | Menos volumen, más alineada con la marca |
| generación de contenido con ia | Mixta | Alta | Mucho resultado informativo (herramientas). Atacarla con blog, no con la home |
| publicidad con inteligencia artificial chile | Comercial | Media-baja | Long-tail valiosa: quien la busca quiere contratar |
| video con ia para empresas / spot publicitario con ia | Transaccional | Baja | Las más ganables a corto plazo — crear páginas de servicio |
| fotografía con ia para marcas | Transaccional | Baja | Ídem |
| avatares ia / clonación digital chile | Transaccional | Baja | Casi sin competencia local |

**Estrategia:** la home apunta a "agencia/estudio de IA (Chile)"; páginas de servicio y casos de estudio capturan las long-tail transaccionales; el blog captura las informativas.

---

## Técnico

| Ítem | Estado |
|---|---|
| HTTPS | ✓ |
| Móvil / viewport | ✓ |
| robots.txt + sitemap.xml | ✓ (recién creados) |
| **Google Search Console** | ✗ NO REGISTRADO — sin esto Google puede tardar semanas en indexar y no tienes ningún dato |
| Canonical | ✗ faltan |
| Schema home | ✗ falta Organization/LocalBusiness |
| Velocidad | Aceptable. Riesgo: video Vimeo de fondo en hero (LCP) + 7 preloads de logos con fetchpriority high compiten por ancho de banda |
| Analytics | Solo contador propio en /tv. Sin datos de tráfico de la home |

---

## Estrategia de contenido (lo que realmente mueve la aguja)

1. **Casos de estudio** — el contenido más valioso que puedes crear y nadie puede copiar: "Cómo hicimos el spot de Salcobrand 100% con IA" (proceso, antes/después, resultados). 600-1.000 palabras + video. Uno al mes. Capturan búsquedas como "campaña publicitaria con ia ejemplo".
2. **Páginas de servicio individuales** — /video-con-ia, /fotografia-con-ia, /avatares-ia. Hoy los servicios son tarjetas de 2 líneas dentro de la home; como páginas propias con 500+ palabras cada una pueden rankear por sus propias keywords.
3. **FAQ en la home** — "¿Cuánto cuesta un video con IA?", "¿Qué es una agencia de IA?", "¿La IA reemplaza al equipo de filmación?" — con schema FAQPage. Apunta a los featured snippets y a ser citado por ChatGPT/Gemini.
4. **Blog (opcional, mes 2+)** — 2 artículos/mes sobre IA aplicada a marketing en Chile.

---

## Autoridad / Backlinks (el 50% que no está en tu código)

Por orden de impacto para una agencia chilena:

1. **Google Business Profile** (gratis, 20 min) — aparecer en Maps y en el panel local para "agencia de ia santiago".
2. **Directorios de agencias**: Clutch.co, Sortlist, GoodFirms — gratis, dan backlink + leads reales.
3. **Prensa de industria**: el ángulo "primera plataforma de streaming de contenido IA gratuita de Chile" (Aberrante TV) es noticiable — AdLatina, Marcas y Marketing, La Tercera Pulso, Fayerwayer.
4. **LinkedIn empresa** + perfiles del equipo enlazando el sitio.
5. **Los creadores de Selects** (Talat, Nina) enlazando Aberrante TV desde sus portafolios/LinkedIn — backlinks internacionales naturales.
6. **Vimeo**: descripciones de todos los videos con link a studioaberrante.com.

---

## Plan priorizado

### Crítico (esta semana)
1. **Registrar en Google Search Console** y enviar sitemap.xml — sin esto, todo lo demás es invisible.
2. **Title, meta description, H1 y canonical** de la home con keywords + "Chile".
3. **Schema Organization** en la home (JSON-LD).
4. **Crear Google Business Profile.**

### Alta prioridad (este mes)
5. Expandir el texto de la home: intro "agencia de generación de contenido con IA en Chile" + sección FAQ con schema.
6. Primer caso de estudio (Salcobrand o Nike).
7. Alta en Clutch + Sortlist + LinkedIn empresa.
8. Testimonios de 2-3 clientes con nombre y cargo.

### Media (este trimestre)
9. Páginas de servicio individuales (3-5 páginas).
10. Un caso de estudio al mes.
11. Gestión de prensa con el ángulo Aberrante TV.
12. lastmod en sitemap + agregar casos/servicios al sitemap.

### Baja (cuando haya recursos)
13. Blog con 2 artículos/mes.
14. Versión estática del hero en móvil (mejora LCP).
15. Google Analytics 4 o Plausible para medir todo el sitio.
