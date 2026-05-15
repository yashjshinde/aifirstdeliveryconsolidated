# Project Configuration

[project]
name:         My Project
currency:     USD
rate-unit:    Hours

[domains]
# Paths to domain agent roots, relative to this template.
# Adjust to match your project's actual folder layout.
d365-ce-path:         ../d365-ce
integration-path:     ../integration
power-apps-path:      ../power-apps
d365-fo-path:         ../d365-fo
reporting-path:       ../reporting
data-migration-path:  ../data-migration

[brownfield]
# Set enabled: true when estimating features added to an existing system.
# docs-path points to the brownfield agent's docs-generated/ folder.
enabled:    false
docs-path:  ../d365-ce-brownfield/docs-generated

[output]
# Where estimate outputs are written, relative to this template root.
output-path: estimates
