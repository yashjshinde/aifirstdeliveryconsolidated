import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..', '..')

const AGENT_DEFS = [
  { id: 'd365-ce',            name: 'D365 Customer Engagement',   description: 'Dynamics 365 CE — Plugins, PCF, JS, Dataverse',        commandsDir: join(repoRoot, 'templates', 'd365-ce', '.claude', 'commands') },
  { id: 'd365-ce-brownfield', name: 'D365 CE Brownfield',         description: 'CE reverse engineering & documentation',               commandsDir: join(repoRoot, 'templates', 'd365-ce-brownfield', '.claude', 'commands') },
  { id: 'd365-fo',            name: 'D365 Finance & Operations',  description: 'Dynamics 365 FO — X++, Data Entities',                commandsDir: join(repoRoot, 'templates', 'd365-fo', '.claude', 'commands') },
  { id: 'integration',        name: 'Azure Integration',          description: 'Azure Functions, Logic Apps, APIM, Bicep',            commandsDir: join(repoRoot, 'templates', 'integration', '.claude', 'commands') },
  { id: 'power-apps',         name: 'Power Apps',                 description: 'Canvas, Model-Driven, Power Automate',               commandsDir: join(repoRoot, 'templates', 'power-apps', '.claude', 'commands') },
  { id: 'data-migration',     name: 'Data Migration',             description: 'Data Migration & ADF Pipelines',                     commandsDir: join(repoRoot, 'templates', 'data-migration', '.claude', 'commands') },
  { id: 'reporting',          name: 'Reporting',                  description: 'Power BI, SSRS, DAX Measures, RLS, Datasets',        commandsDir: join(repoRoot, 'templates', 'reporting', '.claude', 'commands') },
  { id: 'solution-architect', name: 'Solution Architect',         description: 'Cross-domain blueprint synthesis',                   commandsDir: join(repoRoot, 'templates', 'solution-architect', '.claude', 'commands') },
  { id: 'solution-estimate',  name: 'Solution Estimate',          description: 'Factor-based ROM estimation',                        commandsDir: join(repoRoot, 'templates', 'solution-estimate', '.claude', 'commands') },
  { id: 'alm-agent',          name: 'ALM Agent',                  description: 'Azure DevOps work items, tests, wiki, pipelines',    commandsDir: join(repoRoot, 'tools', 'alm-agent', '.claude', 'commands') },
]

function loadCommands(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => ({
    id: basename(f, '.md'), name: basename(f, '.md'),
    content: readFileSync(join(dir, f), 'utf-8'), isReadme: false,
  }))
}

function loadReadme(commandsDir) {
  const p = join(commandsDir, '..', '..', 'README.md')
  return existsSync(p) ? readFileSync(p, 'utf-8') : null
}

const agents = AGENT_DEFS.map(def => {
  const commands = loadCommands(def.commandsDir)
  const readmeContent = loadReadme(def.commandsDir)
  const readme = readmeContent ? [{ id: '__readme__', name: 'README', content: readmeContent, isReadme: true }] : []
  return { id: def.id, name: def.name, description: def.description, commands: [...readme, ...commands] }
})

const css = readFileSync(join(__dirname, '..', 'src', 'App.css'), 'utf-8')

const appJs = `
(function () {
  var e = React.createElement;
  var F = React.Fragment;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useMemo = React.useMemo;

  function slugify(text) {
    return text.toLowerCase().replace(/\\s/g, '-').replace(/[^\\w-]/g, '');
  }

  function addHeadingIds(html) {
    return html.replace(/<h([1-6])>(.*?)<\\/h\\1>/g, function(match, level, inner) {
      var plain = inner.replace(/<[^>]+>/g, '');
      var id = slugify(plain);
      return '<h' + level + ' id="' + id + '">' + inner + '</h' + level + '>';
    });
  }

  marked.setOptions({ breaks: true, gfm: true });

  document.addEventListener('click', function(ev) {
    var link = ev.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    ev.preventDefault();
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    var container = document.querySelector('.prompt-content');
    if (container) {
      container.scrollTop = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - 16;
    }
  }, true);

  var AGENTS = window.AGENTS;

  var AGENT_META = {
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
  };

  function AgentPanel(props) {
    var agents = props.agents, selectedAgentId = props.selectedAgentId, onSelect = props.onSelect;
    return e('aside', { className: 'agent-panel' },
      e('div', { className: 'panel-header' }, 'Agents'),
      e('ul', { className: 'agent-list' },
        agents.length === 0 && e('li', { className: 'agent-empty' }, 'No agents match'),
        agents.map(function (agent) {
          var meta = AGENT_META[agent.id] || { color: '#6b7280', icon: '📄' };
          var isSelected = agent.id === selectedAgentId;
          var cmdCount = agent.commands.filter(function (c) { return !c.isReadme; }).length;
          return e('li', {
            key: agent.id,
            className: 'agent-item' + (isSelected ? ' selected' : ''),
            style: { '--agent-color': meta.color },
            onClick: function () { onSelect(agent.id); },
          },
            e('span', { className: 'agent-icon' }, meta.icon),
            e('div', { className: 'agent-info' },
              e('span', { className: 'agent-name' }, agent.name),
              e('span', { className: 'agent-count' }, cmdCount + ' commands')
            )
          );
        })
      )
    );
  }

  function CommandPanel(props) {
    var agent = props.agent, commands = props.commands,
        selectedCommandId = props.selectedCommandId, onSelect = props.onSelect;
    if (!agent) {
      return e('div', { className: 'command-panel' },
        e('div', { className: 'panel-header' }, 'Commands'),
        e('div', { className: 'empty-state' }, 'Select an agent')
      );
    }
    var readme = commands.find(function (c) { return c.isReadme; });
    var regularCmds = commands.filter(function (c) { return !c.isReadme; });
    return e('div', { className: 'command-panel' },
      e('div', { className: 'panel-header' },
        e('span', null, agent.name),
        e('span', { className: 'command-badge' }, regularCmds.length)
      ),
      e('div', { className: 'agent-description' }, agent.description),
      e('ul', { className: 'command-list' },
        readme && e(F, { key: '__readme_group' },
          e('li', {
            className: 'command-item readme-item' + (readme.id === selectedCommandId ? ' selected' : ''),
            onClick: function () { onSelect(readme.id); },
          },
            e('span', { className: 'readme-icon' }, '📖'),
            e('span', { className: 'command-name' }, 'README')
          ),
          regularCmds.length > 0 && e('li', { className: 'command-divider' })
        ),
        regularCmds.map(function (cmd) {
          return e('li', {
            key: cmd.id,
            className: 'command-item' + (cmd.id === selectedCommandId ? ' selected' : ''),
            onClick: function () { onSelect(cmd.id); },
          },
            e('span', { className: 'command-slash' }, '/'),
            e('span', { className: 'command-name' }, cmd.name)
          );
        }),
        commands.length === 0 && e('li', { className: 'command-empty' }, 'No commands match')
      )
    );
  }

  function ReadmeView(props) {
    var command = props.command, agent = props.agent;
    var copiedState = useState(false); var copied = copiedState[0]; var setCopied = copiedState[1];
    var rendered = addHeadingIds(marked.parse(command.content));

    function handleCopy() {
      navigator.clipboard.writeText(command.content);
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2000);
    }
    return e(F, null,
      e('div', { className: 'prompt-header' },
        e('div', { className: 'prompt-title' },
          e('span', { className: 'readme-header-icon' }, '📖'),
          e('h2', null, 'README'),
          agent && e('span', { className: 'prompt-agent-badge' }, agent.name)
        ),
        e('div', { className: 'prompt-actions' },
          e('button', { className: 'copy-btn' + (copied ? ' copied' : ''), onClick: handleCopy },
            copied ? '✓ Copied' : '📋 Copy'
          )
        )
      ),
      e('div', { className: 'prompt-content' },
        e('div', { className: 'markdown-body', dangerouslySetInnerHTML: { __html: rendered } })
      )
    );
  }

  function CommandView(props) {
    var command = props.command, agent = props.agent;
    var copiedState = useState(false); var copied = copiedState[0]; var setCopied = copiedState[1];
    var viewModeState = useState('rendered'); var viewMode = viewModeState[0]; var setViewMode = viewModeState[1];

    useEffect(function () {
      setCopied(false); setViewMode('rendered');
    }, [command.id]);

    var rendered = marked.parse(command.content);

    function handleCopy() {
      navigator.clipboard.writeText(command.content);
      setCopied(true);
      setTimeout(function () { setCopied(false); }, 2000);
    }

    return e(F, null,
      e('div', { className: 'prompt-header' },
        e('div', { className: 'prompt-title' },
          e('span', { className: 'prompt-slash' }, '/'),
          e('h2', null, command.name),
          agent && e('span', { className: 'prompt-agent-badge' }, agent.name)
        ),
        e('div', { className: 'prompt-actions' },
          e('div', { className: 'view-toggle' },
            e('button', { className: viewMode === 'rendered' ? 'active' : '', onClick: function () { setViewMode('rendered'); } }, 'Rendered'),
            e('button', { className: viewMode === 'raw' ? 'active' : '', onClick: function () { setViewMode('raw'); } }, 'Raw')
          ),
          e('button', { className: 'copy-btn' + (copied ? ' copied' : ''), onClick: handleCopy },
            copied ? '✓ Copied' : '📋 Copy'
          )
        )
      ),
      e('div', { className: 'prompt-content' },
        viewMode === 'rendered' && e('div', { className: 'markdown-body', dangerouslySetInnerHTML: { __html: rendered } }),
        viewMode === 'raw' && e('pre', { className: 'raw-content' }, command.content)
      )
    );
  }

  function PromptPanel(props) {
    var command = props.command, agent = props.agent;
    if (!command) {
      return e('div', { className: 'prompt-panel' },
        e('div', { className: 'empty-state' }, 'Select a command to view its prompt')
      );
    }
    return e('div', { className: 'prompt-panel' },
      command.isReadme
        ? e(ReadmeView, { command: command, agent: agent })
        : e(CommandView, { command: command, agent: agent })
    );
  }

  var totalCommands = AGENTS.reduce(function (sum, a) {
    return sum + a.commands.filter(function (c) { return !c.isReadme; }).length;
  }, 0);

  function App() {
    var agentIdState = useState(AGENTS[0] ? AGENTS[0].id : null);
    var selectedAgentId = agentIdState[0]; var setSelectedAgentId = agentIdState[1];
    var cmdIdState = useState(AGENTS[0] && AGENTS[0].commands[0] ? AGENTS[0].commands[0].id : null);
    var selectedCommandId = cmdIdState[0]; var setSelectedCommandId = cmdIdState[1];
    var searchState = useState(''); var searchQuery = searchState[0]; var setSearchQuery = searchState[1];

    var filteredAgents = useMemo(function () {
      if (!searchQuery.trim()) return AGENTS;
      var q = searchQuery.toLowerCase();
      return AGENTS.map(function (agent) {
        return Object.assign({}, agent, {
          commands: agent.commands.filter(function (cmd) {
            return cmd.name.toLowerCase().indexOf(q) !== -1 || cmd.content.toLowerCase().indexOf(q) !== -1;
          })
        });
      }).filter(function (agent) {
        return agent.name.toLowerCase().indexOf(q) !== -1 ||
               agent.description.toLowerCase().indexOf(q) !== -1 ||
               agent.commands.length > 0;
      });
    }, [searchQuery]);

    var selectedAgent = useMemo(function () {
      return AGENTS.find(function (a) { return a.id === selectedAgentId; });
    }, [selectedAgentId]);

    var displayedCommands = useMemo(function () {
      var fa = filteredAgents.find(function (a) { return a.id === selectedAgentId; });
      return fa ? fa.commands : [];
    }, [filteredAgents, selectedAgentId]);

    var selectedCommand = useMemo(function () {
      return selectedAgent ? selectedAgent.commands.find(function (c) { return c.id === selectedCommandId; }) : null;
    }, [selectedAgent, selectedCommandId]);

    function handleAgentSelect(agentId) {
      setSelectedAgentId(agentId);
      var agent = filteredAgents.find(function (a) { return a.id === agentId; });
      setSelectedCommandId(agent && agent.commands[0] ? agent.commands[0].id : null);
    }

    return e('div', { className: 'app' },
      e('header', { className: 'app-header' },
        e('div', { className: 'header-title' },
          e('span', { className: 'header-icon' }, '⚡'),
          e('h1', null, 'Agent Prompt Viewer - Job Aid'),
          e('span', { className: 'header-badge' }, AGENTS.length + ' Agents · ' + totalCommands + ' Commands')
        ),
        e('div', { className: 'search-wrapper' },
          e('span', { className: 'search-icon' }, '🔍'),
          e('input', {
            type: 'text', className: 'search-input',
            placeholder: 'Search agents, commands, content…',
            value: searchQuery,
            onChange: function (ev) { setSearchQuery(ev.target.value); }
          }),
          searchQuery && e('button', { className: 'search-clear', onClick: function () { setSearchQuery(''); } }, '×')
        )
      ),
      e('div', { className: 'app-body' },
        e(AgentPanel, { agents: filteredAgents, selectedAgentId: selectedAgentId, onSelect: handleAgentSelect }),
        e(CommandPanel, { agent: selectedAgent, commands: displayedCommands, selectedCommandId: selectedCommandId, onSelect: setSelectedCommandId }),
        e(PromptPanel, { command: selectedCommand, agent: selectedAgent })
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(e(App, null));
})();
`

const agentsJson = JSON.stringify(agents)
const totalCommands = agents.reduce((sum, a) => sum + a.commands.filter(c => !c.isReadme).length, 0)
const totalAgents = agents.length

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent Prompt Viewer - Job Aid</title>
  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/marked@9.1.6/marked.min.js"><\/script>
  <style>
${css}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>window.AGENTS = ${agentsJson};<\/script>
  <script>
${appJs}
  <\/script>
</body>
</html>`

const outPath = join(__dirname, '..', 'agent-prompt-viewer.html')
writeFileSync(outPath, html, 'utf-8')

const kb = Math.round(html.length / 1024)
console.log(`✅  agent-prompt-viewer.html generated (${kb} KB)`)
console.log(`   ${totalAgents} agents · ${totalCommands} commands embedded`)
console.log(`   Open the file in any browser — no server or npm needed`)
