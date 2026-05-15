import { useState, useMemo } from 'react'
import { agents } from './data/agents-data.js'
import AgentPanel from './components/AgentPanel.jsx'
import CommandPanel from './components/CommandPanel.jsx'
import PromptPanel from './components/PromptPanel.jsx'

const totalCommands = agents.reduce((sum, a) => sum + a.commands.filter(c => !c.isReadme).length, 0)

export default function App() {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id)
  const [selectedCommandId, setSelectedCommandId] = useState(agents[0]?.commands[0]?.id)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents
    const q = searchQuery.toLowerCase()
    return agents
      .map(agent => ({
        ...agent,
        commands: agent.commands.filter(
          cmd =>
            cmd.name.toLowerCase().includes(q) ||
            cmd.content.toLowerCase().includes(q)
        ),
      }))
      .filter(
        agent =>
          agent.name.toLowerCase().includes(q) ||
          agent.description.toLowerCase().includes(q) ||
          agent.commands.length > 0
      )
  }, [searchQuery])

  const selectedAgent = useMemo(
    () => agents.find(a => a.id === selectedAgentId),
    [selectedAgentId]
  )

  const displayedCommands = useMemo(
    () => filteredAgents.find(a => a.id === selectedAgentId)?.commands ?? [],
    [filteredAgents, selectedAgentId]
  )

  const selectedCommand = useMemo(
    () => selectedAgent?.commands.find(c => c.id === selectedCommandId),
    [selectedAgent, selectedCommandId]
  )

  function handleAgentSelect(agentId) {
    setSelectedAgentId(agentId)
    const agent = filteredAgents.find(a => a.id === agentId)
    setSelectedCommandId(agent?.commands[0]?.id ?? null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="header-icon">⚡</span>
          <h1>Agent Prompt Viewer - Job Aid</h1>
          <span className="header-badge">
            {agents.length} Agents · {totalCommands} Commands
          </span>
        </div>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search agents, commands, content…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </header>

      <div className="app-body">
        <AgentPanel
          agents={filteredAgents}
          selectedAgentId={selectedAgentId}
          onSelect={handleAgentSelect}
        />
        <CommandPanel
          agent={selectedAgent}
          commands={displayedCommands}
          selectedCommandId={selectedCommandId}
          onSelect={setSelectedCommandId}
        />
        <PromptPanel command={selectedCommand} agent={selectedAgent} />
      </div>
    </div>
  )
}
