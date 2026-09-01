import type { CSSProperties } from 'react'
import type { CanvasElement } from '../../../types'

export function getElementStyle(element: CanvasElement): CSSProperties {
  const style = element.style
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
  }
}
