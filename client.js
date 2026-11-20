window.__ModuleLoader__.load({
  id: 'dsh-prompt-edit',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'prompt-edit';
    const USER_SLOT = 'conversation.chat.node';
    const OVERLAY_SLOT = 'shell.overlay';

    const zh = {
      'action.edit': '编辑提问',
      'action.tooltip': '修改这条提问，并从这条提问重写后面的对话',
      'action.copy': '复制',
      'action.copied': '已复制',
      'dialog.title': '编辑提问',
      'dialog.description':
        '保存后，这条提问及其之后的回答会从对话中移除，修改后的内容作为新的提问重新生成。原对话会被归档，可在「已归档」中恢复。',
      'dialog.attachments':
        '原提问的 {count} 个附件会一起带上（图片原样重发，文件重新挂到新对话）。',
      'dialog.placeholder': '输入修改后的提问…',
      'dialog.hint': '⌘/Ctrl + Enter 保存 · Esc 取消',
      'dialog.count': '{count} 字',
      'dialog.cancel': '取消',
      'dialog.submit': '保存并重新生成',
      'dialog.submitting': '正在重写对话…',
      'dialog.resolving': '正在加载上一轮对话…',
      'dialog.empty': '提问不能为空',
      'error.fork': '创建分支失败：{message}',
      'error.prompt': '发送修改后的提问失败：{message}',
      'error.boundary': '暂时找不到这条提问之前的位置，请重试或先向上滚动加载更早的对话。',
      'error.unknown': '未知错误',
    };

    const en = {
      'action.edit': 'Edit prompt',
      'action.tooltip': 'Edit this prompt and rewrite the conversation from here',
      'action.copy': 'Copy',
      'action.copied': 'Copied',
      'dialog.title': 'Edit prompt',
      'dialog.description':
        'Saving removes this prompt and every turn after it, then regenerates the answer from your revised text. The original conversation is archived and can be restored from Archived.',
      'dialog.attachments':
        'The {count} attachment(s) of the original prompt are carried over (images re-sent, files re-staged).',
      'dialog.placeholder': 'Type the revised prompt…',
      'dialog.hint': '⌘/Ctrl + Enter to save · Esc to cancel',
      'dialog.count': '{count} characters',
      'dialog.cancel': 'Cancel',
      'dialog.submit': 'Save & regenerate',
      'dialog.submitting': 'Rewriting the conversation…',
      'dialog.resolving': 'Loading the previous turn…',
      'dialog.empty': 'The prompt cannot be empty',
      'error.fork': 'Could not branch the conversation: {message}',
      'error.prompt': 'Could not send the revised prompt: {message}',
      'error.boundary':
        'The point before this prompt is not loaded yet. Try again, or scroll up to load earlier turns.',
      'error.unknown': 'Unknown error',
    };

    /*
     * Colors are --dsw-alias-* theme tokens only. The scrim tints the base
     * surface with color-mix so it follows light and dark themes.
     * The tail entry reuses the host's own reveal contract: `data-actions-reveal`
     * is "always" on the latest response-ending turn and "hover" elsewhere.
     */
    const STYLE = `
.dsh-pe__userRow{display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:100%}
.dsh-pe__userActions{display:flex;align-items:center;gap:8px;height:calc(28px + var(--dsh-content-font-delta,0px));opacity:0;transition:opacity 80ms ease}
.dsh-pe__userRow:hover .dsh-pe__userActions,.dsh-pe__userRow:focus-within .dsh-pe__userActions{opacity:1}
@media (hover:none){.dsh-pe__userActions{opacity:1}}
.dsh-pe__fallback{max-width:100%;padding:10px 16px;border-radius:var(--dsw-radius-xl);background:var(--dsw-specific-bubble);color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word}
.dsh-pe__userTime{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);white-space:nowrap;padding-right:4px}
.dsh-pe__iconBtn{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));display:inline-flex;align-items:center;justify-content:center;padding:6px;border:0;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background-color 80ms ease,color 80ms ease}
.dsh-pe__iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.dsh-pe__iconBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsh-pe__iconBtn svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px))}
.dsh-pe__overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto;background:color-mix(in srgb,var(--dsw-alias-bg-base) 58%,transparent)}
.dsh-pe__dialog{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;width:min(600px,100%);max-height:calc(100vh - 48px);overflow:auto;padding:20px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 24px 64px color-mix(in srgb,var(--dsw-alias-label-primary) 22%,transparent)}
.dsh-pe__header{display:flex;flex-direction:column;gap:6px}
.dsh-pe__title{margin:0;font-size:16px;font-weight:600;line-height:24px;color:var(--dsw-alias-label-primary)}
.dsh-pe__description{margin:0;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.dsh-pe__warning{margin:0;font-size:13px;line-height:1.6;color:var(--dsw-alias-state-warn-primary)}
.dsh-pe__textarea{box-sizing:border-box;width:100%;min-height:140px;max-height:45vh;resize:vertical;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:1.6}
.dsh-pe__textarea:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 20%,transparent)}
.dsh-pe__textarea:disabled{opacity:.7}
.dsh-pe__hint{display:flex;justify-content:space-between;gap:12px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsh-pe__error{margin:0;font-size:13px;line-height:1.6;color:var(--dsw-alias-state-error-primary);white-space:pre-wrap;word-break:break-word}
.dsh-pe__footer{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}
.dsh-pe__button{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
.dsh-pe__button:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.dsh-pe__button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pe__button:disabled{opacity:.55;cursor:default}
.dsh-pe__button--primary{border-color:transparent;background:var(--dsw-alias-brand-primary);color:#fff}
.dsh-pe__button--primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary);filter:brightness(1.08)}
.dsh-pe__spinner{display:inline-block;width:12px;height:12px;margin-right:6px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:dsh-pe-spin .8s linear infinite}
.dsh-pe__srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes dsh-pe-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.dsh-pe__userActions,.dsh-pe__iconBtn{transition:none}.dsh-pe__spinner{animation:none}}
@media (max-width:480px){.dsh-pe__overlay{padding:12px}.dsh-pe__dialog{padding:16px}}
`;

    /** Read a localized template's `{name}` placeholders. */
    function format(template, values) {
      return String(template).replace(/\{(\w+)\}/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
      );
    }

    /** Concatenate the text blocks of one user prompt. */
    function promptText(content) {
      if (!Array.isArray(content)) return '';
      const parts = [];
      for (const block of content) {
        if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') {
          parts.push(block.text);
        }
      }
      return parts.join('\n');
    }

    /** Attachment references of one prompt, in their original order. */
    function promptAttachments(content) {
      const images = [];
      const files = [];
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block === null || typeof block !== 'object') continue;
          if (block.type === 'image' && block.attachment !== undefined) images.push(block.attachment);
          else if (block.type === 'file' && block.attachment !== undefined) files.push(block.attachment);
        }
      }
      return { images, files };
    }

    /** Total attachment count of one prompt content list. */
    function attachmentCount(content) {
      const { images, files } = promptAttachments(content);
      return images.length + files.length;
    }

    /** Authenticated host route the bundle's Host half registers for file adoption. */
    const ADOPT_PATH = '/api/prompt-edit';

    /**
     * Re-attach the original prompt's images and files to the rewritten prompt.
     *
     * Images are durable references in the session log, so the Session attachment
     * route returns their bytes and the prompt carries them inline again; the same
     * stored object is referenced, not a copy. Generic files are stored verbatim on
     * the Host and cannot be read from the page, so the Host half turns each stored
     * object into a fresh upload receipt for the child Session and the prompt cites
     * those receipts, exactly like a file attached in the composer.
     * @param ctx - client plugin context.
     * @param sourceSessionId - Session whose log holds the references.
     * @param childId - Session that will receive the rewritten prompt.
     * @param attachments - image and file references of the original prompt.
     * @returns the leading content parts plus how many references were dropped.
     */
    async function carryAttachments(ctx, sourceSessionId, childId, { images, files }) {
      const parts = [];
      let dropped = 0;

      for (const attachment of images) {
        try {
          const result = await ctx.remote.session.attachment({ sessionId: sourceSessionId, attachment });
          if (result === null || result === undefined || result.ok !== true) {
            dropped += 1;
            continue;
          }
          const mediaType = result.value?.attachment?.mediaType ?? attachment.mediaType;
          const data = result.value?.data;
          if (typeof mediaType !== 'string' || typeof data !== 'string' || data === '') {
            dropped += 1;
            continue;
          }
          parts.push({
            type: 'image',
            mediaType,
            data,
            ...(typeof attachment.name === 'string' && attachment.name !== '' ? { name: attachment.name } : {}),
          });
        } catch {
          dropped += 1;
        }
      }

      if (files.length > 0) {
        const receipts = new Map();
        try {
          const response = await fetch(ADOPT_PATH, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sessionId: childId, files }),
          });
          const payload = response.ok ? await response.json() : null;
          if (payload !== null && payload.ok === true && Array.isArray(payload.receipts)) {
            for (const entry of payload.receipts) {
              if (typeof entry?.attachmentId === 'string' && typeof entry?.receiptId === 'string') {
                receipts.set(entry.attachmentId, entry.receiptId);
              }
            }
          } else {
            console.warn('[prompt-edit] the file adoption route refused the request', response.status, payload);
          }
        } catch (cause) {
          /* a disabled Host half leaves the text intact; files are counted as dropped */
          console.warn('[prompt-edit] the file adoption route is unreachable', cause);
        }
        for (const attachment of files) {
          const receiptId = receipts.get(String(attachment.attachmentId));
          if (receiptId === undefined) {
            dropped += 1;
            continue;
          }
          parts.push({ type: 'file', receiptId });
        }
      }

      return { parts, dropped };
    }

    /** Read a human-facing message out of an unknown failure. */
    function describeError(error) {
      if (error !== null && typeof error === 'object' && typeof error.message === 'string' && error.message !== '') {
        return error.message;
      }
      if (typeof error === 'string' && error !== '') return error;
      return '';
    }

    function newRequestId() {
      try {
        return window.crypto.randomUUID();
      } catch {
        return `prompt-edit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      }
    }

    function clientTimeZone() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      } catch {
        return 'UTC';
      }
    }

    /** First durable user prompt of one Turn, or null for other trigger kinds. */
    function firstUserNode(snapshot, turn) {
      if (typeof turn !== 'number' || !Number.isFinite(turn)) return null;
      const locations = snapshot?.locations;
      const nodes = snapshot?.nodes;
      if (locations === undefined || nodes === undefined) return null;
      for (const key of locations.getTurn(turn)) {
        const node = nodes.get(key);
        if (node === undefined || node.kind !== 'user' || !Array.isArray(node.data?.content)) continue;
        // Runtime context, skill catalogs, and time snapshots also arrive as
        // user-role messages; only a real human prompt may be edited.
        const source = node.data?.source;
        if (source !== null && typeof source === 'object' && typeof source.kind === 'string' && source.kind !== 'user') {
          continue;
        }
        return node;
      }
      return null;
    }

    /** Read the inclusive fork boundary that ends the Turn before `turn`. */
    function readPreviousEnd(target, turn) {
      const snapshot = target.getSnapshot();
      const previous = snapshot?.timeline?.turns?.get(turn - 1);
      const seq = previous?.end?.seq;
      return typeof seq === 'number' && seq >= 0 ? seq : null;
    }

    /** Resolve once the previous Turn's end lands in the loaded window, or on timeout. */
    function waitForPreviousEnd(target, turn, timeoutMs) {
      return new Promise((resolve) => {
        let settled = false;
        let unsubscribe = () => {};
        let timer = null;
        const read = () => readPreviousEnd(target, turn);
        const finish = (value) => {
          if (settled) return;
          settled = true;
          if (timer !== null) clearTimeout(timer);
          try {
            unsubscribe();
          } catch {
            /* subscription already gone */
          }
          resolve(value);
        };
        timer = setTimeout(() => finish(read()), timeoutMs);
        const check = () => {
          const value = read();
          if (value !== null) finish(value);
        };
        try {
          unsubscribe = target.subscribe(check);
        } catch {
          finish(read());
          return;
        }
        check();
      });
    }

    /**
     * Make the Turn before `turn` part of the loaded history window.
     *
     * The fork has to stop before the edited prompt was enqueued, so the child
     * never inherits the original message. The only safe client-visible point is
     * the previous Turn's `turn/end`; while history paging has not loaded it,
     * jump-load through this Turn's start and wait for the Chat timeline to
     * publish that Turn.
     */
    async function revealPreviousTurn(ctx, sessionId, turn, turnStartSeq) {
      try {
        const binding = ctx.sessions.binding(sessionId);
        if (binding === undefined) return null;
        const target = ctx.uiConversation.binding(binding).target('chat');
        const immediate = readPreviousEnd(target, turn);
        if (immediate !== null) return immediate;
        const session = binding.session;
        if (
          session !== undefined &&
          typeof session.loadThrough === 'function' &&
          typeof turnStartSeq === 'number' &&
          turnStartSeq > 0 &&
          session.hasMore === true
        ) {
          // One page before this Turn's start; prepends are Turn-aligned, so the
          // previous Turn arrives whole.
          await session.loadThrough(turnStartSeq - 1);
        }
        return await waitForPreviousEnd(target, turn, 8000);
      } catch {
        return null;
      }
    }

    /** One-shot record of the prompt currently open in the editor. */
    function createEditorStore() {
      let request = null;
      const listeners = new Set();
      const emit = () => {
        for (const listener of [...listeners]) listener();
      };
      return {
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        get() {
          return request;
        },
        open(next) {
          request = next;
          emit();
        },
        close() {
          if (request === null) return;
          request = null;
          emit();
        },
      };
    }

    function PencilIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M3.2 12.8 4.1 9.5 10.9 2.7a1.6 1.6 0 0 1 2.3 2.3L6.4 11.8l-3.2.9Z' }),
        h('path', { d: 'm9.7 3.9 2.4 2.4' }),
        h('path', { d: 'M3.2 14.2h9.6' }),
      );
    }

    /** Split one durable prompt into the bubble text, its attachments, and extra blocks. */
    function contentParts(content) {
      const texts = [];
      const attachments = [];
      const rest = [];
      for (const block of Array.isArray(content) ? content : []) {
        if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') {
          texts.push(block.text);
        } else if (block !== null && typeof block === 'object' && block.type === 'image' && block.attachment !== undefined) {
          attachments.push({ type: 'image', image: { attachment: block.attachment } });
        } else if (block !== null && typeof block === 'object' && block.type === 'file' && block.attachment !== undefined) {
          attachments.push({ type: 'file', file: block.attachment });
        } else {
          rest.push(block);
        }
      }
      return { text: texts.join(''), attachments, rest };
    }

    /** Turn whose durable range covers one event sequence. */
    function turnOfSeq(snapshot, seq) {
      if (typeof seq !== 'number') return null;
      const turns = snapshot?.timeline?.turns;
      if (!(turns instanceof Map)) return null;
      for (const [turn, state] of turns) {
        const start = state?.start?.seq;
        if (typeof start !== 'number' || seq < start) continue;
        const end = state?.end?.seq;
        if (typeof end === 'number' && seq > end) continue;
        return turn;
      }
      return null;
    }

    /** Clock label for one durable message time: HH:mm today, a dated stamp otherwise. */
    function formatClock(time) {
      if (typeof time !== 'number' || !Number.isFinite(time)) return '';
      const date = new Date(time);
      const now = new Date();
      const locale = typeof navigator === 'object' && typeof navigator.language === 'string' ? navigator.language : 'en';
      const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
      try {
        return new Intl.DateTimeFormat(
          locale,
          sameDay ? { hour: '2-digit', minute: '2-digit' } : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        ).format(date);
      } catch {
        return '';
      }
    }

    /** Two overlapping sheets, matching the host's copy glyph weight. */
    function CopyIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('rect', { x: 5.6, y: 5.6, width: 8, height: 8, rx: 1.6 }),
        h('path', { d: 'M10.4 5.6V4a1.6 1.6 0 0 0-1.6-1.6H4A1.6 1.6 0 0 0 2.4 4v4.8A1.6 1.6 0 0 0 4 10.4h1.6' }),
      );
    }

    /**
     * Durable user row carrying the edit affordance beside copy.
     *
     * The shipped row renders its action strip inline and exposes no seat inside
     * it, so this entry owns the `user` key: the bubble itself still comes from the
     * `conversation.chat.user.content` factory, and only the strip is local. The
     * message-source seat that the shipped entry declares has no occupants, so
     * leaving it out of this row changes nothing visible.
     */
    function createUserRow(ctx, store) {
      return function PromptEditUserRow({ node, renderFactorySlot, loadImage, t, useChat, useAccess, sessionId }) {
        const data = node.data;
        const seq = data?.seq;
        const turnNo = useChat(React.useCallback((snapshot) => turnOfSeq(snapshot, seq), [seq]));
        const editable = useChat(
          React.useCallback(
            (snapshot) => {
              if (turnNo === null) return false;
              const state = snapshot.timeline.turns.get(turnNo);
              if (state === undefined || state.status !== 'closed') return false;
              const first = firstUserNode(snapshot, turnNo);
              return first !== null && first !== undefined && first.data?.seq === seq;
            },
            [seq, turnNo],
          ),
        );
        const startSeq = useChat(
          React.useCallback(
            (snapshot) => {
              if (turnNo === null) return -1;
              const start = snapshot.timeline.turns.get(turnNo)?.start;
              return typeof start?.seq === 'number' ? start.seq : -1;
            },
            [turnNo],
          ),
        );
        const boundary = useChat(
          React.useCallback(
            (snapshot) => {
              if (turnNo === null || turnNo <= 1) return 0;
              const previous = snapshot.timeline.turns.get(turnNo - 1);
              const seqBefore = previous?.end?.seq;
              return typeof seqBefore === 'number' ? seqBefore : -1;
            },
            [turnNo],
          ),
        );
        const forkAllowed = useAccess('session/fork');
        const [copied, setCopied] = React.useState(false);
        const timerRef = React.useRef(null);

        const parts = React.useMemo(() => contentParts(data?.content), [data]);
        const prepared = React.useMemo(
          () => ({
            text: parts.text,
            attachments: parts.attachments,
            extraBlocks: parts.rest,
            ...(data?.referenceLabels === undefined ? {} : { referenceLabels: data.referenceLabels }),
          }),
          [data?.referenceLabels, parts],
        );
        const facts = React.useMemo(
          () => ({
            ...(data?.referenceLabels === undefined ? {} : { sessionLabels: data.referenceLabels }),
            ...(data?.skillNames === undefined ? {} : { skillNames: data.skillNames }),
          }),
          [data?.referenceLabels, data?.skillNames],
        );

        React.useEffect(
          () => () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current);
          },
          [],
        );

        const copy = () => {
          if (typeof navigator !== 'object' || navigator.clipboard === undefined) return;
          navigator.clipboard.writeText(parts.text).then(
            () => {
              setCopied(true);
              timerRef.current = window.setTimeout(() => {
                timerRef.current = null;
                setCopied(false);
              }, 1000);
            },
            () => {},
          );
        };

        const open = () => {
          if (turnNo === null) return;
          store.open({
            sessionId,
            turn: turnNo,
            initialText: promptText(data?.content),
            content: data?.content,
            attachments: attachmentCount(data?.content),
            boundary,
            turnStartSeq: startSeq >= 0 ? startSeq : null,
            resolveBoundary: () => revealPreviousTurn(ctx, sessionId, turnNo, startSeq >= 0 ? startSeq : null),
          });
        };

        let bubble;
        try {
          bubble =
            typeof renderFactorySlot === 'function'
              ? renderFactorySlot('conversation.chat.user.content', { content: prepared, loadImage, facts, interactive: true })
              : h('div', { className: 'dsh-pe__fallback' }, parts.text);
        } catch (error) {
          bubble = h('div', { className: 'dsh-pe__fallback' }, parts.text);
        }

        return h(
          'div',
          { className: 'dsh-pe__userRow', 'data-prompt-edit': 'user-row' },
          bubble,
          h(
            'div',
            { className: 'dsh-pe__userActions' },
            h('span', { className: 'dsh-pe__userTime' }, formatClock(data?.time)),
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-pe__iconBtn',
                title: copied ? t('action.copied') : t('action.copy'),
                'aria-label': copied ? t('action.copied') : t('action.copy'),
                onClick: copy,
              },
              h(CopyIcon),
            ),
            editable && forkAllowed
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-pe__iconBtn',
                    title: t('action.tooltip'),
                    'aria-label': t('action.edit'),
                    'data-prompt-edit': 'trigger',
                    onClick: open,
                  },
                  h(PencilIcon),
                )
              : null,
          ),
        );
      };
    }

    function createDialog(ctx, store) {
      return function PromptEditDialog({ t }) {
        const request = React.useSyncExternalStore(store.subscribe, store.get, store.get);
        const [value, setValue] = React.useState('');
        const [busy, setBusy] = React.useState(false);
        const [resolving, setResolving] = React.useState(false);
        const [error, setError] = React.useState(null);
        const [target, setTarget] = React.useState(null);
        const childRef = React.useRef(undefined);
        const inputRef = React.useRef(null);
        const titleId = React.useId();
        const descriptionId = React.useId();
        const textareaId = React.useId();

        // Reset per request; the dialog component stays mounted in the overlay.
        React.useEffect(() => {
          if (request === null) return;
          const restore = document.activeElement;
          setValue(request.initialText);
          setBusy(false);
          setError(null);
          childRef.current = undefined;
          const initial = request.turn <= 1 ? 0 : request.boundary;
          setTarget(initial >= 0 ? initial : null);
          let active = true;
          if (initial < 0 && request.turn > 1) {
            setResolving(true);
            void Promise.resolve(request.resolveBoundary()).then(
              (resolved) => {
                if (!active) return;
                setResolving(false);
                if (typeof resolved === 'number' && resolved >= 0) setTarget(resolved);
                else setError(t('error.boundary'));
              },
              () => {
                if (!active) return;
                setResolving(false);
                setError(t('error.boundary'));
              },
            );
          } else {
            setResolving(false);
          }
          return () => {
            active = false;
            if (restore instanceof HTMLElement && restore.isConnected) {
              try {
                restore.focus();
              } catch {
                /* the trigger may be gone */
              }
            }
          };
        }, [request, t]);

        const blocked = busy || resolving;

        const close = React.useCallback(() => {
          if (busy) return;
          const childId = childRef.current;
          childRef.current = undefined;
          store.close();
          if (childId !== undefined) {
            // Closed before the revised prompt was accepted: discard the branch
            // this attempt created instead of leaving a blank row behind.
            try {
              void Promise.resolve(ctx.uiWorkspace.archiveSession(childId, { stopActivity: true })).catch(() => {});
            } catch {
              /* best-effort cleanup */
            }
          }
        }, [busy]);

        const submit = React.useCallback(() => {
          if (request === null || blocked) return;
          const nextText = value.trim();
          if (nextText === '') {
            setError(t('dialog.empty'));
            return;
          }
          void (async () => {
            let boundary = target;
            if (request.turn <= 1) boundary = 0;
            if (!(typeof boundary === 'number' && boundary >= 0)) {
              setResolving(true);
              const resolved = await request.resolveBoundary();
              setResolving(false);
              if (!(typeof resolved === 'number' && resolved >= 0)) {
                setError(t('error.boundary'));
                return;
              }
              boundary = resolved;
              setTarget(resolved);
            }

            setBusy(true);
            setError(null);

            let childId = childRef.current;
            if (childId === undefined) {
              try {
                childId = await ctx.sessions.fork({
                  sessionId: request.sessionId,
                  atSeq: boundary,
                  increaseTitle: false,
                });
                childRef.current = childId;
              } catch (cause) {
                setBusy(false);
                setError(format(t('error.fork'), { message: describeError(cause) || t('error.unknown') }));
                return;
              }
            }

            let content = [{ type: 'text', text: nextText }];
            const carried = promptAttachments(request.content);
            if (carried.images.length > 0 || carried.files.length > 0) {
              const transferred = await carryAttachments(ctx, request.sessionId, childId, carried);
              content = [...transferred.parts, ...content];
              if (transferred.dropped > 0) {
                console.warn(`[prompt-edit] ${transferred.dropped} attachment(s) could not be carried over`);
              }
            }

            try {
              const result = await ctx.remote.session.prompt({
                requestId: newRequestId(),
                sessionId: childId,
                mode: 'queue',
                content,
                clientTimeZone: clientTimeZone(),
              });
              if (result === null || result === undefined || result.ok !== true) {
                setBusy(false);
                setError(
                  format(t('error.prompt'), {
                    message: describeError(result?.error) || t('error.unknown'),
                  }),
                );
                return;
              }
            } catch (cause) {
              setBusy(false);
              setError(format(t('error.prompt'), { message: describeError(cause) || t('error.unknown') }));
              return;
            }

            childRef.current = undefined;
            store.close();
            // The session log is append-only and DSH exposes no in-place cut, so
            // the branch is the mechanism. Hiding the source makes it read as the
            // same conversation continued; the removed turns stay in Archived.
            try {
              await ctx.uiWorkspace.archiveSession(request.sessionId, { stopActivity: true });
            } catch {
              /* an archive refusal must not hide the branch that already answered */
            }
            ctx.uiWorkspace.openSession(childId);
          })();
        }, [blocked, request, target, t, value]);

        React.useEffect(() => {
          if (request === null) return;
          const input = inputRef.current;
          if (input === null) return;
          input.focus();
          const end = input.value.length;
          input.setSelectionRange(end, end);
        }, [request]);

        const handlersRef = React.useRef(null);
        React.useEffect(() => {
          handlersRef.current = { close, submit };
        }, [close, submit]);

        React.useEffect(() => {
          if (request === null) return undefined;
          const onKeyDown = (event) => {
            const handlers = handlersRef.current;
            if (event.key === 'Escape') {
              event.preventDefault();
              if (handlers !== null) handlers.close();
            } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              if (handlers !== null) handlers.submit();
            } else if (event.key === 'Tab') {
              const dialog = document.querySelector('[data-prompt-edit="dialog"]');
              if (dialog === null) return;
              const focusable = dialog.querySelectorAll(
                'textarea, button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
              );
              if (focusable.length === 0) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              const active = document.activeElement;
              if (event.shiftKey && (active === first || !dialog.contains(active))) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
              }
            }
          };
          window.addEventListener('keydown', onKeyDown);
          return () => window.removeEventListener('keydown', onKeyDown);
        }, [request]);

        if (request === null) return null;

        const message = error;

        return h(
          'div',
          {
            className: 'dsh-pe__overlay',
            onMouseDown: (event) => {
              if (event.target === event.currentTarget && !busy) close();
            },
          },
          h(
            'div',
            {
              className: 'dsh-pe__dialog',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-labelledby': titleId,
              'aria-describedby': descriptionId,
              'data-prompt-edit': 'dialog',
              onMouseDown: (event) => event.stopPropagation(),
            },
            h(
              'div',
              { className: 'dsh-pe__header' },
              h('h2', { id: titleId, className: 'dsh-pe__title' }, t('dialog.title')),
              h('p', { id: descriptionId, className: 'dsh-pe__description' }, t('dialog.description')),
            ),
            request.attachments > 0
              ? h(
                  'p',
                  { className: 'dsh-pe__warning' },
                  format(t('dialog.attachments'), { count: request.attachments }),
                )
              : null,
            h('label', { className: 'dsh-pe__srOnly', htmlFor: textareaId }, t('dialog.title')),
            h('textarea', {
              id: textareaId,
              ref: inputRef,
              className: 'dsh-pe__textarea',
              value,
              rows: 5,
              disabled: blocked,
              placeholder: t('dialog.placeholder'),
              spellCheck: false,
              onChange: (event) => {
                setValue(event.target.value);
                if (error !== null) setError(null);
              },
            }),
            h(
              'div',
              { className: 'dsh-pe__hint' },
              h('span', null, resolving ? t('dialog.resolving') : t('dialog.hint')),
              h('span', null, format(t('dialog.count'), { count: value.length })),
            ),
            message !== null
              ? h('p', { className: 'dsh-pe__error', role: 'alert' }, message)
              : null,
            h(
              'div',
              { className: 'dsh-pe__footer' },
              h(
                'button',
                { type: 'button', className: 'dsh-pe__button', disabled: busy, onClick: close },
                t('dialog.cancel'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-pe__button dsh-pe__button--primary',
                  disabled: blocked || value.trim() === '',
                  onClick: submit,
                },
                busy ? h('span', { className: 'dsh-pe__spinner', 'aria-hidden': true }) : null,
                busy ? t('dialog.submitting') : t('dialog.submit'),
              ),
            ),
          ),
        );
      };
    }

    return {
      inject: ['slots', 'sessions', 'uiConversation', 'uiWorkspace', 'locale', 'remote', 'remote.session'],
      apply(ctx) {

        const store = createEditorStore();
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = 'dsh-prompt-edit';
          tag.textContent = STYLE;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'dsh-prompt-edit: styles');
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-prompt-edit: dictionaries');
        ctx.slots.inject(USER_SLOT, () => {
          try {
            const dispose = ctx.slots.register(
              {
                name: USER_SLOT,
                key: 'user',
                locale: NS,
                priority: -1,
              },
              createUserRow(ctx, store),
            );
            return dispose;
          } catch {
            return () => {};
          }
        });
        ctx.slots.inject(OVERLAY_SLOT, () =>
          ctx.slots.register(
            {
              name: OVERLAY_SLOT,
              id: 'prompt-edit-dialog',
              order: 105,
              locale: NS,
            },
            createDialog(ctx, store),
          ),
        );
      },
    };
  },
});
