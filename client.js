window.__ModuleLoader__.load({
  id: '@local/dsh-prompt-edit',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'prompt-edit';
    const TAIL_SLOT = 'conversation.chat.turnTail';
    const OVERLAY_SLOT = 'shell.overlay';

    const zh = {
      'action.edit': '编辑提问',
      'action.tooltip': '修改这条提问，并在新分支中重新生成回答',
      'dialog.title': '编辑提问',
      'dialog.description':
        '保存后，会从这条提问之前创建一个新分支，并用修改后的内容重新生成回答。当前对话保持原样，新分支会出现在侧边栏。',
      'dialog.attachments':
        '这条提问还带有 {count} 个非文本内容，重新生成时只会保留文字。',
      'dialog.placeholder': '输入修改后的提问…',
      'dialog.hint': '⌘/Ctrl + Enter 保存 · Esc 取消',
      'dialog.count': '{count} 字',
      'dialog.cancel': '取消',
      'dialog.submit': '保存并重新生成',
      'dialog.submitting': '正在创建分支…',
      'dialog.resolving': '正在加载上一轮对话…',
      'dialog.empty': '提问不能为空',
      'error.fork': '创建分支失败：{message}',
      'error.prompt': '发送修改后的提问失败：{message}',
      'error.boundary': '暂时找不到这条提问之前的位置，请重试或先向上滚动加载更早的对话。',
      'error.unknown': '未知错误',
    };

    const en = {
      'action.edit': 'Edit prompt',
      'action.tooltip': 'Edit this prompt and regenerate the answer in a new branch',
      'dialog.title': 'Edit prompt',
      'dialog.description':
        'Saving creates a new branch just before this prompt and regenerates the answer with your changes. The current conversation stays intact and the branch appears in the sidebar.',
      'dialog.attachments':
        'This prompt also carried {count} non-text item(s); only the text is kept when regenerating.',
      'dialog.placeholder': 'Type the revised prompt…',
      'dialog.hint': '⌘/Ctrl + Enter to save · Esc to cancel',
      'dialog.count': '{count} characters',
      'dialog.cancel': 'Cancel',
      'dialog.submit': 'Save & regenerate',
      'dialog.submitting': 'Creating branch…',
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
.dsh-pe__tail{display:flex;align-items:center;margin:0 0 -6px;transition:opacity .12s ease}
.dsh-pe__trigger{display:inline-flex;align-items:center;gap:6px;height:26px;margin:0 0 0 -8px;padding:0 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:18px;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.dsh-pe__trigger:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-pe__trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-pe__trigger svg{width:13px;height:13px;flex:none}
[data-actions-reveal="hover"] .dsh-pe__tail{opacity:0}
[data-turn-tail]:hover .dsh-pe__tail,[data-turn-tail]:focus-within .dsh-pe__tail{opacity:1}
@media (hover:none){[data-actions-reveal="hover"] .dsh-pe__tail{opacity:1}}
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
@media (prefers-reduced-motion:reduce){.dsh-pe__tail,.dsh-pe__trigger{transition:none}.dsh-pe__spinner{animation:none}}
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

    /** Count the parts a text-only re-send cannot carry. */
    function nonTextCount(content) {
      if (!Array.isArray(content)) return 0;
      let count = 0;
      for (const block of content) {
        if (block !== null && typeof block === 'object' && block.type !== 'text') count += 1;
      }
      return count;
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

    /**
     * Resolve the numeric Turn of the footer seat's `turn` prop.
     *
     * The seat hands over the Turn state object (`{ turn, start, end, status }`),
     * not a bare number, so normalize before indexing the Chat timeline; a plain
     * number is accepted too.
     */
    function turnNumber(value) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      const inner = value !== null && typeof value === 'object' ? value.turn : undefined;
      return typeof inner === 'number' && Number.isFinite(inner) ? inner : null;
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

    function createAction(ctx, store) {
      return function PromptEditAction({ turn, sessionId, useChat, useAccess, t }) {
        const turnNo = turnNumber(turn);
        const forkAllowed = useAccess('session/fork');
        const closed = useChat(
          React.useCallback(
            (snapshot) => turnNo !== null && snapshot.timeline.turns.get(turnNo)?.status === 'closed',
            [turnNo],
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
              const seq = previous?.end?.seq;
              return typeof seq === 'number' ? seq : -1;
            },
            [turnNo],
          ),
        );
        const promptNode = useChat(React.useCallback((snapshot) => firstUserNode(snapshot, turnNo), [turnNo]));

        if (turnNo === null || !forkAllowed || !closed || promptNode === null || promptNode === undefined) return null;

        const content = promptNode.data.content;
        const open = () => {
          store.open({
            sessionId,
            turn: turnNo,
            initialText: promptText(content),
            attachments: nonTextCount(content),
            boundary,
            turnStartSeq: startSeq >= 0 ? startSeq : null,
            resolveBoundary: () => revealPreviousTurn(ctx, sessionId, turnNo, startSeq >= 0 ? startSeq : null),
          });
        };

        return h(
          'div',
          { className: 'dsh-pe__tail', 'data-prompt-edit': 'trigger' },
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-pe__trigger',
              title: t('action.tooltip'),
              'aria-label': t('action.edit'),
              onClick: open,
            },
            h(PencilIcon),
            h('span', null, t('action.edit')),
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
                  increaseTitle: true,
                });
                childRef.current = childId;
              } catch (cause) {
                setBusy(false);
                setError(format(t('error.fork'), { message: describeError(cause) || t('error.unknown') }));
                return;
              }
            }

            try {
              const result = await ctx.remote.session.prompt({
                requestId: newRequestId(),
                sessionId: childId,
                mode: 'queue',
                content: [{ type: 'text', text: nextText }],
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
          tag.dataset.plugin = '@local/dsh-prompt-edit';
          tag.textContent = STYLE;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'dsh-prompt-edit: styles');
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-prompt-edit: dictionaries');
        ctx.slots.inject(TAIL_SLOT, () =>
          ctx.slots.register(
            {
              name: TAIL_SLOT,
              id: 'prompt-edit',
              order: 40,
              locale: NS,
            },
            createAction(ctx, store),
          ),
        );
        ctx.slots.inject(OVERLAY_SLOT, () =>
          ctx.slots.register(
            {
              name: OVERLAY_SLOT,
              id: 'prompt-edit-dialog',
              order: 95,
              locale: NS,
            },
            createDialog(ctx, store),
          ),
        );
      },
    };
  },
});
