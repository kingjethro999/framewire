import type { CanvasElement } from '../../../types'
import { useEditorStore } from '../../../store/editorStore'

export function ElementRenderer({ element, content }: { element: CanvasElement; content?: string }) {
  const form = useEditorStore((state) => state.project.workspace?.forms.find((item) => item.id === element.formId))
  const value = content ?? element.content
  const lines = value.split('\n')
  if (element.type === 'image') return <img className="element-image" src={element.src} alt={element.alt ?? ''} draggable={false} loading="lazy" />
  if (element.type === 'input') return <div className="element-input">{value}</div>
  if (element.type === 'button') return <div className="element-button">{value}</div>
  if (element.type === 'divider' || element.type === 'rectangle') return null
  if (element.type === 'nav') {
    const parts = value.split(/\s{2,}/)
    return <div className="element-nav">{parts.map((part, index) => <span key={`${part}-${index}`} className={index === 0 ? 'element-nav-brand' : ''}>{part}</span>)}</div>
  }
  if (element.type === 'hero') return <div className="element-hero"><strong>{lines[0]}</strong><p>{lines.slice(1).join(' ')}</p></div>
  if (element.type === 'card') return <div className="element-card"><strong>{lines[0]}</strong><p>{lines.slice(1).join(' ')}</p></div>
  if (element.type === 'form' && form) return <form className="element-form" onSubmit={(event) => event.preventDefault()}><strong>{form.name}</strong>{form.fields.map((field) => <label key={field.id}><span>{field.label}{field.required ? ' *' : ''}</span>{field.type === 'textarea' ? <textarea required={field.required} /> : field.type === 'checkbox' ? <input type="checkbox" required={field.required} /> : <input type={field.type} required={field.required} />}</label>)}<button type="submit">Submit</button></form>
  if (element.type === 'form') return <div className="element-form"><strong>{lines[0]}</strong>{lines.slice(1, -1).map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}<button>{lines.at(-1)}</button></div>
  return <div className="element-text">{value}</div>
}
