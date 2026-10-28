/**
 * Host half of the prompt-edit bundle.
 *
 * The whole feature lives in the browser half: it extends the completed-turn
 * footer, forks the Session before the edited prompt, and submits the revised
 * prompt into the child Session. This row exists so the bundle owns a visible
 * inventory entry and can be enabled or disabled like any other plugin.
 */
export function apply() {}
