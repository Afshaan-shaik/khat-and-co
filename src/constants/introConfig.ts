/**
 * Configuration options for the Khath & Co. Cinematic Intro.
 */

/**
 * Controls whether the cinematic intro plays when a visitor arrives via a
 * shared letter link (e.g., ?id=... or #l=...).
 *
 * - `true` (Default): The cinematic intro plays first on every visit/refresh.
 *   Once dismissed or completed, the recipient sees the wax-sealed letter in the ReaderModal.
 * - `false`: Direct shared letter links skip the cinematic intro and go straight to the letter.
 */
export const SHOW_INTRO_ON_LETTER_LINKS = true;
