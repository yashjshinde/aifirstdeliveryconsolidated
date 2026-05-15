export default function CommandPanel({ agent, commands, selectedCommandId, onSelect }) {
  if (!agent) {
    return (
      <div className="command-panel">
        <div className="panel-header">Commands</div>
        <div className="empty-state">Select an agent</div>
      </div>
    )
  }

  const readme = commands.find(c => c.isReadme)
  const regularCmds = commands.filter(c => !c.isReadme)

  return (
    <div className="command-panel">
      <div className="panel-header">
        <span>{agent.name}</span>
        <span className="command-badge">{regularCmds.length}</span>
      </div>
      <div className="agent-description">{agent.description}</div>
      <ul className="command-list">

        {readme && (
          <>
            <li
              className={`command-item readme-item${readme.id === selectedCommandId ? ' selected' : ''}`}
              onClick={() => onSelect(readme.id)}
            >
              <span className="readme-icon">📖</span>
              <span className="command-name">README</span>
            </li>
            {regularCmds.length > 0 && <li className="command-divider" />}
          </>
        )}

        {regularCmds.map(cmd => (
          <li
            key={cmd.id}
            className={`command-item${cmd.id === selectedCommandId ? ' selected' : ''}`}
            onClick={() => onSelect(cmd.id)}
          >
            <span className="command-slash">/</span>
            <span className="command-name">{cmd.name}</span>
          </li>
        ))}

        {commands.length === 0 && (
          <li className="command-empty">No commands match</li>
        )}
      </ul>
    </div>
  )
}
