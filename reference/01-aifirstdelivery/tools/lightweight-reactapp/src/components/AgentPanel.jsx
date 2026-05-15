const AGENT_META = {
  'd365-ce':            { color: '#0078d4', icon: '🔷' },
  'd365-ce-brownfield': { color: '#8B4513', icon: '🟤' },
  'd365-fo':            { color: '#5c2d91', icon: '🟣' },
  'integration':        { color: '#d83b01', icon: '🔶' },
  'power-apps':         { color: '#742774', icon: '💜' },
  'data-migration':     { color: '#107c10', icon: '🟢' },
  'reporting':          { color: '#c47a00', icon: '📊' },
  'solution-architect': { color: '#003a6c', icon: '🔵' },
  'solution-estimate':  { color: '#006b6b', icon: '🔹' },
  'alm-agent':          { color: '#b91c1c', icon: '🔴' },
}

export default function AgentPanel({ agents, selectedAgentId, onSelect }) {
  return (
    <aside className="agent-panel">
      <div className="panel-header">Agents</div>
      <ul className="agent-list">
        {agents.map(agent => {
          const meta = AGENT_META[agent.id] ?? { color: '#6b7280', icon: '📄' }
          const isSelected = agent.id === selectedAgentId
          const cmdCount = agent.commands.filter(c => !c.isReadme).length
          return (
            <li
              key={agent.id}
              className={`agent-item${isSelected ? ' selected' : ''}`}
              style={{ '--agent-color': meta.color }}
              onClick={() => onSelect(agent.id)}
            >
              <span className="agent-icon">{meta.icon}</span>
              <div className="agent-info">
                <span className="agent-name">{agent.name}</span>
                <span className="agent-count">{cmdCount} commands</span>
              </div>
            </li>
          )
        })}
        {agents.length === 0 && (
          <li className="agent-empty">No agents match</li>
        )}
      </ul>
    </aside>
  )
}
