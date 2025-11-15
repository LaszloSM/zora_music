# Logo Files

Coloca tus archivos de logo personalizados aquí:

- **logo.svg** - Logo principal (usado en el componente Logo)
- **favicon.svg** - Icono del navegador
- **logo.png** - Versión PNG del logo
- **logo-light.svg** - Versión para tema claro (opcional)
- **logo-dark.svg** - Versión para tema oscuro (opcional)

## Uso en componentes

Para usar la imagen del logo en lugar del ícono, edita `src/components/Logo.tsx`:

```tsx
// Reemplaza la línea del comentario con:
<img src="/logo.svg" alt="Zora Music" className={sizeClass.container} />
```

## Formatos recomendados

- **SVG**: Escalable, ideal para todos los tamaños
- **PNG**: 512x512px mínimo para buena calidad
- **ICO**: Para favicons en navegadores antiguos

## Colores del tema

- Primary: `#5bc0de` (cyan)
- Secondary: `#9b59b6` (purple)
- Gradient: `from-[#5bc0de] to-[#9b59b6]`
