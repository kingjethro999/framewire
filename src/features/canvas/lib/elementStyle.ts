import type { CSSProperties } from 'react'
import type { CanvasElement } from '../../../types'

export function getElementStyle(element: CanvasElement): CSSProperties {
  const style = element.style
  const layout = element.layout
  const align = layout?.align === 'start' ? 'flex-start' : layout?.align === 'end' ? 'flex-end' : layout?.align
  const justify = layout?.justify === 'start' ? 'flex-start' : layout?.justify === 'end' ? 'flex-end' : layout?.justify === 'between' ? 'space-between' : layout?.justify
  return {
    background: style.background,
    color: style.color,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: style.borderWidth ? 'solid' : undefined,
    borderRadius: style.borderRadius,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    textAlign: style.textAlign,
    opacity: style.opacity,
    padding: style.padding,
    boxShadow: style.shadow,
    fontFamily: 'var(--project-font)',
    display: layout?.mode === 'grid' ? 'grid' : layout?.mode === 'flex' ? 'flex' : undefined,
    gridTemplateColumns: layout?.mode === 'grid' ? `repeat(${Math.max(1, layout?.columns ?? 1)}, minmax(0, 1fr))` : undefined,
    flexDirection: layout?.mode === 'flex' ? layout.direction : undefined,
    flexWrap: layout?.wrap ? 'wrap' : undefined,
    gap: layout && layout.mode !== 'absolute' ? layout.gap : undefined,
    alignItems: layout && layout.mode !== 'absolute' ? align : undefined,
    justifyContent: layout && layout.mode !== 'absolute' ? justify : undefined,
    minWidth: layout?.minWidth,
    maxWidth: layout?.maxWidth,
    minHeight: layout?.minHeight,
    maxHeight: layout?.maxHeight,
  }
}
