/**
 * Preferences.ts
 * Ported from Preferences.as
 *
 * NOTE: Most preference functionality (toggleTheme, fontSizeUp/Down/Reset,
 * toggleBold, toggleColor, toggleSide, sideHide, sideShow, savePreferences,
 * loadPreferences, updateText/applyFontSettings) is already implemented in
 * UIManager.ts and SaveLoad.ts. This file re-exports loadPreferences from
 * SaveLoad.ts so that any import of '../content/Preferences.ts' still resolves.
 */
export { loadPreferences } from '../systems/SaveLoad.ts'
