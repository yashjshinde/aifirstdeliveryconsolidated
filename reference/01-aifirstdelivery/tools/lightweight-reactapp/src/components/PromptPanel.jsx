import { useState } from 'react'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

function slugify(text) {
  return text.toLowerCase().replace(/\s/g, '-').replace(/[^\w-]/g, '')
}

function addHeadingIds(html) {
  return html.replace(/<h([1-6])>(.*?)<\/h\1>/g, (_match, level, inner) => {
    const id = slugify(inner.replace(/<[^>]+>/g, ''))
    return `<h${level} id="${id}">${inner}</h${level}>`
  })
}

document.addEventListener('click', (ev) => {
  const link = ev.target.closest('a')
  if (!link) return
  const href = link.getAttribute('href')
  if (!href?.startsWith('#')) return
  ev.preventDefault()
  const target = document.getElementById(href.slice(1))
  if (!target) return
  const container = document.querySelector('.prompt-content')
  if (container) {
    container.scrollTop = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - 16
  }
}, true)

function ReadmeView({ command, agent }) {
  const rendered = addHeadingIds(marked.parse(command.content))
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(command.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="prompt-header">
        <div className="prompt-title">
          <span className="readme-header-icon">📖</span>
          <h2>README</h2>
          {agent && <span className="prompt-agent-badge">{agent.name}</span>}
        </div>
        <div className="prompt-actions">
          <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>
      <div className="prompt-content">
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: rendered }} />
      </div>
    </>
  )
}

function CommandView({ command, agent }) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('rendered')

  const rendered = marked.parse(command.content)

  function handleCopy() {
    navigator.clipboard.writeText(command.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="prompt-header">
        <div className="prompt-title">
          <span className="prompt-slash">/</span>
          <h2>{command.name}</h2>
          {agent && <span className="prompt-agent-badge">{agent.name}</span>}
        </div>
        <div className="prompt-actions">
          <div className="view-toggle">
            <button className={viewMode === 'rendered' ? 'active' : ''} onClick={() => setViewMode('rendered')}>Rendered</button>
            <button className={viewMode === 'raw' ? 'active' : ''} onClick={() => setViewMode('raw')}>Raw</button>
          </div>
          <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div className="prompt-content">
        {viewMode === 'rendered' && (
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: rendered }} />
        )}
        {viewMode === 'raw' && (
          <pre className="raw-content">{command.content}</pre>
        )}
      </div>
    </>
  )
}

export default function PromptPanel({ command, agent }) {
  if (!command) {
    return (
      <div className="prompt-panel">
        <div className="empty-state">Select a command to view its prompt</div>
      </div>
    )
  }
  return (
    <div className="prompt-panel">
      {command.isReadme
        ? <ReadmeView command={command} agent={agent} />
        : <CommandView command={command} agent={agent} />
      }
    </div>
  )
}
