/**
 * Side-effect import that wires up all concrete workers into the registry.
 *
 * Each worker module must call `registerWorker(...)` from `./index` at import time.
 * Adding a worker = adding an import here. No other site needs editing.
 */

// Workers are registered as their files are added in subsequent commits.
// Importing this empty module today is intentional: it gives `server.ts`
// a single, stable side-effect entry point.

export {}
