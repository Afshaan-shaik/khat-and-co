import { WorkspaceSessionRecord } from '../types/letter';

const SESSION_STORAGE_ID_KEY = 'khath:workspace_session_id';
const SESSION_STORAGE_TOKEN_KEY = 'khath:workspace_session_token';
const SESSION_STORAGE_CREATED_KEY = 'khath:workspace_session_created_at';

/**
 * Generates a cryptographically strong unguessable string.
 */
function generateSecureToken(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const part1 = crypto.randomUUID().replace(/-/g, '');
    const part2 = crypto.randomUUID().replace(/-/g, '');
    return `${prefix}_${part1}${part2}`;
  }
  // Fallback for environments where crypto.randomUUID is not present
  const randomArr = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomArr);
    return `${prefix}_${Array.from(randomArr).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

/**
 * Retrieves the current tab's active WorkspaceSessionRecord,
 * or initializes a fresh one if this is a newly opened tab, new window, or separate browser.
 *
 * Guarantees:
 * - Same tab + refresh: PRESERVED (same workspaceSessionId).
 * - New tab / Edge / Chrome / Firefox / Mobile: FRESH WORKSPACE.
 */
export function getOrCreateWorkspaceSession(): {
  session: WorkspaceSessionRecord;
  isNew: boolean;
} {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedId = window.sessionStorage.getItem(SESSION_STORAGE_ID_KEY);
      const storedToken = window.sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
      const storedCreatedAt = window.sessionStorage.getItem(SESSION_STORAGE_CREATED_KEY);

      // Verify the stored session is valid
      if (
        storedId &&
        storedToken &&
        storedId.startsWith('ws_') &&
        storedToken.startsWith('wst_')
      ) {
        return {
          session: {
            id: storedId,
            sessionToken: storedToken,
            createdAt: storedCreatedAt || new Date().toISOString(),
            lastActiveAt: new Date().toISOString()
          },
          isNew: false
        };
      }

      // Generate a new workspace session for this fresh browsing context
      const newId = generateSecureToken('ws');
      const newToken = generateSecureToken('wst');
      const now = new Date().toISOString();

      window.sessionStorage.setItem(SESSION_STORAGE_ID_KEY, newId);
      window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, newToken);
      window.sessionStorage.setItem(SESSION_STORAGE_CREATED_KEY, now);

      return {
        session: {
          id: newId,
          sessionToken: newToken,
          createdAt: now,
          lastActiveAt: now
        },
        isNew: true
      };
    }
  } catch (err) {
    console.warn('sessionStorage unavailable, using transient memory session:', err);
  }

  // Fallback for SSR / headless without sessionStorage
  const transientId = generateSecureToken('ws');
  const transientToken = generateSecureToken('wst');
  const now = new Date().toISOString();
  return {
    session: {
      id: transientId,
      sessionToken: transientToken,
      createdAt: now,
      lastActiveAt: now
    },
    isNew: true
  };
}

/**
 * Returns authorization headers for workspace-authenticated API calls.
 */
export function getWorkspaceAuthHeaders(): Record<string, string> {
  const { session } = getOrCreateWorkspaceSession();
  return {
    'x-workspace-session-id': session.id,
    'x-workspace-session-token': session.sessionToken
  };
}

/**
 * Resets the active workspace session in this tab, creating a brand new isolated workspace.
 */
export function resetWorkspaceSession(): WorkspaceSessionRecord {
  const newId = generateSecureToken('ws');
  const newToken = generateSecureToken('wst');
  const now = new Date().toISOString();

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_STORAGE_ID_KEY, newId);
      window.sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, newToken);
      window.sessionStorage.setItem(SESSION_STORAGE_CREATED_KEY, now);
    }
  } catch (err) {
    console.warn('Could not reset session in sessionStorage:', err);
  }

  return {
    id: newId,
    sessionToken: newToken,
    createdAt: now,
    lastActiveAt: now
  };
}
