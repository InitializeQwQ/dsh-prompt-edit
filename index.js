/**
 * Host half of the prompt-edit bundle.
 *
 * The feature itself lives in the browser half, which extends the completed-turn
 * footer, forks the Session before the edited prompt, and submits the revised
 * prompt into the child Session.
 *
 * This half exists for one reason: a prompt may carry generic files. Their bytes
 * live only on the Host (`attachments.readFileStream`), while a prompt cites them
 * through Session-owned upload receipts (`{ type: 'file', receiptId }`). The page
 * can therefore rebuild an image from its durable reference but cannot re-attach a
 * file, so this route turns the stored objects of the source prompt into fresh
 * receipts for the child Session, and the page cites those receipts — exactly the
 * shape a file attached in the composer uses.
 *
 * The route sits on the authenticated shared API channel, so only the browser
 * page that owns this Host can call it.
 */
const ADOPT_PATH = '/api/prompt-edit'

/** Encode one JSON answer with no caching. */
function json(status, value) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

/** Report one failure the page can read without guessing. */
function fail(status, message) {
  return json(status, { ok: false, error: { code: 'gateway/bad-request', message } })
}

/** Validate one durable file reference coming off the wire. */
function readFileReference(value) {
  if (value === null || typeof value !== 'object') return undefined
  const { attachmentId, name, bytes } = value
  if (typeof attachmentId !== 'string' || typeof name !== 'string') return undefined
  return { attachmentId, name, ...(typeof bytes === 'number' ? { bytes } : {}) }
}

/**
 * Register the attachment-adoption route.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['connection', 'fileUploads', 'attachments'], (scope) => {
    scope.effect(
      () =>
        scope.connection.fetch.register({
          path: ADOPT_PATH,
          methods: ['POST'],
          requestBody: 'buffered',
          fetch: async (request) => {
            let body
            try {
              body = await request.json()
            } catch {
              return fail(400, 'the request body must be JSON')
            }
            const sessionId = body !== null && typeof body === 'object' ? body.sessionId : undefined
            const files = body !== null && typeof body === 'object' ? body.files : undefined
            if (typeof sessionId !== 'string' || !Array.isArray(files)) {
              return fail(400, 'sessionId and files are required')
            }

            const receipts = []
            for (const raw of files) {
              const file = readFileReference(raw)
              if (file === undefined) return fail(400, 'each file needs a string attachmentId and name')
              try {
                const value = await scope.fileUploads.uploadStream({
                  sessionId,
                  data: scope.attachments.readFileStream(file),
                  name: file.name,
                })
                receipts.push({ attachmentId: file.attachmentId, receiptId: String(value.receiptId) })
              } catch (error) {
                return json(500, {
                  ok: false,
                  error: {
                    code: 'gateway/internal',
                    message: error instanceof Error ? error.message : String(error),
                  },
                })
              }
            }
            return json(200, { ok: true, receipts })
          },
        }),
      'prompt-edit: attachment route',
    )
  })
}
