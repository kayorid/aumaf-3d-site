/**
 * Side-effect import that wires up all concrete workers into the registry.
 *
 * Each worker module must call `registerWorker(...)` from `./index` at import time.
 * Adding a worker = adding an import here. No other site needs editing.
 */

// Each side-effect import wires its worker into the registry.
import './lead-notification.worker'
import './post-publish.worker'
import './botyio-lead-sync.worker'
import './analytics-ingest.worker'
import './analytics-rollup.worker'

export {}
