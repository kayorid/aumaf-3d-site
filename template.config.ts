/**
 * ============================================================
 *  TEMPLATE CONFIG — entry-point ergonômico
 * ============================================================
 *
 * Este arquivo é apenas um pointer. O conteúdo editável vive em:
 *   packages/shared/src/template/config.ts
 *
 * O módulo está em `packages/shared` para ser importado de modo
 * uniforme pelo frontend-public, frontend-admin e backend via:
 *
 *   import { templateConfig } from '@template/shared'
 *
 * Para editar a marca, abra o arquivo abaixo, ou rode:
 *   $ npm run brand:init
 *
 * Veja `docs/template/REBRAND.md` para detalhes.
 * ============================================================
 */

export { templateConfig, default } from './packages/shared/src/template/config'
export type * from './packages/shared/src/template/types'
