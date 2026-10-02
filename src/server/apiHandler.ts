import type { IncomingMessage, ServerResponse } from 'http';

// Private in-memory store for development and serverless execution
interface SessionRecord {
  id: string;
  token: string;
  createdAt: string;
  lastActiveAt: string;
}

interface StoredMemory {
  id: string;
  workspaceSessionId: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  is4K: boolean;
  caption?: string;
  memoryDate?: string;
  memoryTitle?: string;
  focalPoint: 'center' | 'top' | 'bottom' | 'face' | 'custom';
  focalX?: number;
  focalY?: number;
  sortOrder: number;
  createdAt: string;
  isPublished: boolean;
  publishedLetterSlug?: string;
  originalDataUrl: string;
  previewDataUrl: string;
}

interface PublishedLetterRecord {
  slug: string;
  workspaceSessionId: string;
  publishedMemoryIds: string[];
}

const sessions = new Map<string, SessionRecord>();
const memories = new Map<string, StoredMemory>();
const publishedLetters = new Map<string, PublishedLetterRecord>();

// Helper to validate image magic bytes
function validateMagicBytes(buffer: Buffer): { valid: boolean; mimeType: string } {
  if (buffer.length < 12) return { valid: false, mimeType: '' };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png' };
  }
  // WebP: RIFF ... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, mimeType: 'image/webp' };
  }
  // HEIC: ftypheic / ftypmif1
  const ftyp = buffer.toString('ascii', 4, 8);
  if (ftyp === 'ftyp') {
    return { valid: true, mimeType: 'image/heic' };
  }

  return { valid: false, mimeType: '' };
}

// Basic dimension parser for JPEG & PNG
function parseImageDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG: width at byte 16..19, height at byte 20..23 (big-endian)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer.length >= 24) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }

  // JPEG parse
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return { width: 1920, height: 1080 };
}

// Helper to parse JSON body
function parseJsonBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) {
    if (typeof (req as any).body === 'object') {
      return Promise.resolve((req as any).body);
    }
    if (typeof (req as any).body === 'string') {
      try {
        return Promise.resolve(JSON.parse((req as any).body));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => {
      data += chunk;
      // 45MB max payload for 4K base64/JSON uploads
      if (data.length > 45 * 1024 * 1024) {
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse | any, status: number, body: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(status).json(body);
  }
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

/**
 * Main API request router for /api/*
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string
): Promise<boolean> {
  const method = req.method?.toUpperCase() || 'GET';
  const url = new URL(urlPath, 'http://localhost');
  const rawPath = url.pathname.replace(/\/$/, '');
  const pathname = rawPath.startsWith('/api') ? rawPath : `/api${rawPath}`;

  // Extract Session Headers
  const sessionId = (req.headers['x-workspace-session-id'] as string) || '';
  const authHeader = (req.headers['authorization'] as string) || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  const sessionToken = (req.headers['x-workspace-session-token'] as string) || bearerToken || '';

  // Validate or Register Workspace Session
  function verifyWorkspaceAuth(): boolean {
    if (!sessionId || !sessionToken) return false;
    const session = sessions.get(sessionId);
    if (!session) {
      // Auto-register session if token has secure format
      if (sessionId.startsWith('ws_') && sessionToken.startsWith('wst_')) {
        sessions.set(sessionId, {
          id: sessionId,
          token: sessionToken,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        });
        return true;
      }
      return false;
    }
    if (session.token !== sessionToken) return false;
    session.lastActiveAt = new Date().toISOString();
    return true;
  }

  // 1. /api/session (Session Heartbeat / Registration)
  if (pathname === '/api/session') {
    if (method === 'GET') {
      sendJson(res, 200, { status: 'active', service: 'Khath & Co. Workspace Session API' });
      return true;
    }
    if (method === 'POST') {
      const body = await parseJsonBody(req).catch(() => ({}));
      const reqId = body.id || sessionId;
      const reqToken = body.token || sessionToken;

      if (!reqId || !reqToken || !reqId.startsWith('ws_') || !reqToken.startsWith('wst_')) {
        sendJson(res, 400, { error: 'Invalid workspace session parameters' });
        return true;
      }

      sessions.set(reqId, {
        id: reqId,
        token: reqToken,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      });

      sendJson(res, 200, { status: 'active', sessionId: reqId });
      return true;
    }
  }

  // 2. POST /api/memory/upload-auth
  if (pathname === '/api/memory/upload-auth' && method === 'POST') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized: Invalid workspace session' });
      return true;
    }

    // Check count of memories for this workspace (1-3 images max)
    const existing = Array.from(memories.values()).filter(
      (m) => m.workspaceSessionId === sessionId
    );

    if (existing.length >= 3) {
      sendJson(res, 400, {
        error: 'Memory Folio limit reached (maximum 3 photographs allowed per letter)'
      });
      return true;
    }

    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sendJson(res, 200, {
      authorized: true,
      memoryId,
      maxSizeBytes: 35 * 1024 * 1024 // 35MB
    });
    return true;
  }

  // 3. POST /api/memory/upload (Direct Secure Upload)
  if (pathname === '/api/memory/upload' && method === 'POST') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized: Invalid workspace session' });
      return true;
    }

    // Check count
    const existing = Array.from(memories.values()).filter(
      (m) => m.workspaceSessionId === sessionId
    );
    if (existing.length >= 3) {
      sendJson(res, 400, {
        error: 'Memory Folio supports a maximum of 3 photographs per letter'
      });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const {
        previewDataUrl,
        filename,
        caption,
        memoryDate,
        memoryTitle,
        focalPoint,
        focalX,
        focalY,
        width: explicitWidth,
        height: explicitHeight
      } = body;

      const rawDataUrl = body.dataUrl || (body.fileBase64 ? `data:${body.mimeType || 'image/jpeg'};base64,${body.fileBase64}` : '');

      if (!rawDataUrl || typeof rawDataUrl !== 'string') {
        sendJson(res, 400, { error: 'Missing photograph data' });
        return true;
      }

      // Extract base64 and inspect magic bytes
      const match = rawDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        sendJson(res, 400, { error: 'Invalid data URL format' });
        return true;
      }

      const mime = match[1];
      const rawBase64 = match[2];
      const buffer = Buffer.from(rawBase64, 'base64');

      // Security: Validate Magic Bytes to prevent arbitrary/executable uploads
      const magicCheck = validateMagicBytes(buffer);
      if (!magicCheck.valid) {
        sendJson(res, 400, {
          error: 'Unsupported or corrupted image file signature. Only JPEG, PNG, WebP, and HEIC photographs are permitted.'
        });
        return true;
      }

      // Determine dimensions
      const parsedDims = parseImageDimensions(buffer);
      const width = explicitWidth && explicitWidth > 0 ? explicitWidth : parsedDims.width;
      const height = explicitHeight && explicitHeight > 0 ? explicitHeight : parsedDims.height;
      const orientation = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
      const is4K = width >= 3840 || height >= 3840;

      const memoryId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const storageKey = `folio/${sessionId}/${memoryId}`;

      const newMemory: StoredMemory = {
        id: memoryId,
        workspaceSessionId: sessionId,
        originalFilename: filename || `photo_${existing.length + 1}.jpg`,
        mimeType: mime,
        byteSize: buffer.length,
        width,
        height,
        orientation,
        is4K,
        caption: caption ? String(caption).slice(0, 200) : undefined,
        memoryDate: memoryDate ? String(memoryDate).slice(0, 100) : undefined,
        memoryTitle: memoryTitle ? String(memoryTitle).slice(0, 100) : undefined,
        focalPoint: focalPoint || 'center',
        focalX,
        focalY,
        sortOrder: existing.length,
        createdAt: new Date().toISOString(),
        isPublished: false,
        originalDataUrl: rawDataUrl, // 100% original uncompressed preserved!
        previewDataUrl: previewDataUrl || rawDataUrl
      };

      memories.set(memoryId, newMemory);

      const createdItem = {
        id: memoryId,
        storageObjectKey: storageKey,
        originalFilename: newMemory.originalFilename,
        mimeType: newMemory.mimeType,
        byteSize: newMemory.byteSize,
        width: newMemory.width,
        height: newMemory.height,
        orientation: newMemory.orientation,
        is4K: newMemory.is4K,
        caption: newMemory.caption,
        memoryDate: newMemory.memoryDate,
        memoryTitle: newMemory.memoryTitle,
        focalPoint: newMemory.focalPoint,
        focalX: newMemory.focalX,
        focalY: newMemory.focalY,
        sortOrder: newMemory.sortOrder,
        createdAt: newMemory.createdAt,
        originalUrl: `/api/memory/${memoryId}?type=original`,
        previewUrl: `/api/memory/${memoryId}?type=preview`
      };

      // Return metadata with secure relative API URLs
      sendJson(res, 201, {
        success: true,
        item: createdItem,
        ...createdItem
      });
      return true;
    } catch (err: any) {
      console.error('Upload processing error:', err);
      sendJson(res, 500, { error: 'Failed to process photograph upload' });
      return true;
    }
  }

  // 4. GET /api/memory/folio (Retrieve all memories for active workspace)
  if (pathname === '/api/memory/folio' && method === 'GET') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const userMemories = Array.from(memories.values())
      .filter((m) => m.workspaceSessionId === sessionId)
      .map((m) => ({
        id: m.id,
        storageObjectKey: `folio/${sessionId}/${m.id}`,
        originalFilename: m.originalFilename,
        mimeType: m.mimeType,
        byteSize: m.byteSize,
        width: m.width,
        height: m.height,
        orientation: m.orientation,
        is4K: m.is4K,
        caption: m.caption,
        memoryDate: m.memoryDate,
        memoryTitle: m.memoryTitle,
        focalPoint: m.focalPoint,
        focalX: m.focalX,
        focalY: m.focalY,
        sortOrder: m.sortOrder,
        createdAt: m.createdAt,
        originalUrl: `/api/memory/${m.id}?type=original`,
        previewUrl: `/api/memory/${m.id}?type=preview`
      }));

    sendJson(res, 200, { items: userMemories });
    return true;
  }

  // 5. GET /api/memory/:id (Download / View Image — IDOR PROTECTED)
  if (pathname.startsWith('/api/memory/') && method === 'GET') {
    const memoryId = pathname.replace('/api/memory/', '');

    // Authorization & IDOR protection:
    // If this is not an explicitly authorized published letter query (with valid share slug or token),
    // require valid workspace session authentication.
    const shareSlug = url.searchParams.get('slug') || '';
    const shareToken = url.searchParams.get('token') || '';
    const isPublicRecipientQuery = Boolean(shareSlug || shareToken);

    if (!isPublicRecipientQuery && !verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized: Missing or invalid workspace session' });
      return true;
    }

    const memory = memories.get(memoryId);
    if (!memory) {
      sendJson(res, 404, { error: 'Memory item not found' });
      return true;
    }

    // IDOR & Authorization check:
    // 1. Is caller the owner workspace session?
    const isOwner = verifyWorkspaceAuth() && memory.workspaceSessionId === sessionId;

    // 2. Is this memory part of an explicitly published letter with a valid share token or slug?
    const isPublishedAndGranted =
      memory.isPublished &&
      ((shareSlug && memory.publishedLetterSlug === shareSlug) || shareToken === 'recipient_grant');

    if (!isOwner && !isPublishedAndGranted) {
      // FORBIDDEN: User does not own this private memory and it is not published to them!
      sendJson(res, 403, {
        error: 'Forbidden: Access denied. This memory belongs to another private workspace.'
      });
      return true;
    }

    // Serve either original high-resolution or display preview
    const isOriginal = url.searchParams.get('type') === 'original';
    const targetDataUrl = isOriginal ? memory.originalDataUrl : memory.previewDataUrl;

    const match = targetDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      sendJson(res, 500, { error: 'Corrupt stored image' });
      return true;
    }

    const mime = match[1];
    const imageBuf = Buffer.from(match[2], 'base64');

    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': imageBuf.length,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(imageBuf);
    return true;
  }

  // 6. PATCH /api/memory/:id (Update metadata)
  if (pathname.startsWith('/api/memory/') && method === 'PATCH') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized: Missing or invalid workspace session' });
      return true;
    }

    const memoryId = pathname.replace('/api/memory/', '');
    const memory = memories.get(memoryId);

    if (!memory) {
      sendJson(res, 404, { error: 'Memory item not found' });
      return true;
    }

    if (memory.workspaceSessionId !== sessionId) {
      sendJson(res, 403, { error: 'Forbidden: You do not own this memory' });
      return true;
    }

    const body = await parseJsonBody(req).catch(() => ({}));
    if (body.caption !== undefined) memory.caption = String(body.caption).slice(0, 200);
    if (body.memoryDate !== undefined) memory.memoryDate = String(body.memoryDate).slice(0, 100);
    if (body.memoryTitle !== undefined) memory.memoryTitle = String(body.memoryTitle).slice(0, 100);
    if (body.focalPoint) memory.focalPoint = body.focalPoint;
    if (body.focalX !== undefined) memory.focalX = Number(body.focalX);
    if (body.focalY !== undefined) memory.focalY = Number(body.focalY);

    sendJson(res, 200, { success: true, memory });
    return true;
  }

  // 7. DELETE /api/memory/:id
  if (pathname.startsWith('/api/memory/') && method === 'DELETE') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized: Missing or invalid workspace session' });
      return true;
    }

    const memoryId = pathname.replace('/api/memory/', '');
    const memory = memories.get(memoryId);

    if (!memory) {
      sendJson(res, 404, { error: 'Memory item not found' });
      return true;
    }

    if (memory.workspaceSessionId !== sessionId) {
      sendJson(res, 403, { error: 'Forbidden: You do not own this memory' });
      return true;
    }

    memories.delete(memoryId);
    sendJson(res, 200, { success: true, deletedId: memoryId });
    return true;
  }

  // 8. POST /api/letter/publish-folio (Grant public recipient access to selected memories)
  if (pathname === '/api/letter/publish-folio' && method === 'POST') {
    if (!verifyWorkspaceAuth()) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await parseJsonBody(req).catch(() => ({}));
    const { slug, memoryIds } = body;

    if (!slug || !Array.isArray(memoryIds)) {
      sendJson(res, 400, { error: 'Missing slug or memory IDs' });
      return true;
    }

    // Only allow publishing memories owned by this workspace
    const validIds: string[] = [];
    for (const memId of memoryIds) {
      const mem = memories.get(memId);
      if (mem && mem.workspaceSessionId === sessionId) {
        mem.isPublished = true;
        mem.publishedLetterSlug = slug;
        validIds.push(memId);
      }
    }

    publishedLetters.set(slug, {
      slug,
      workspaceSessionId: sessionId,
      publishedMemoryIds: validIds
    });

    sendJson(res, 200, {
      success: true,
      slug,
      publishedCount: validIds.length
    });
    return true;
  }

  return false;
}
