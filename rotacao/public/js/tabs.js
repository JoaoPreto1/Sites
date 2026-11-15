// Separadores ligados ao #hash do URL, para se poder ir direto a uma secção
export function setupTabs(loaders) {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const loaded = new Set();

  async function open(name, { focus = false } = {}) {
    if (!tabs.some((t) => t.dataset.tab === name)) name = tabs[0].dataset.tab;
    for (const tab of tabs) tab.setAttribute('aria-selected', tab.dataset.tab === name);
    for (const panel of document.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== name;
    if (focus) tabs.find((t) => t.dataset.tab === name).focus();
    if (!loaded.has(name)) {
      loaded.add(name);
      await loaders[name]?.(document.querySelector(`[data-panel="${name}"]`));
    }
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      history.replaceState(null, '', `#${tab.dataset.tab}`);
      open(tab.dataset.tab);
    });
  }

  window.addEventListener('hashchange', () => open(window.location.hash.slice(1)));

  return {
    open,
    reload(name) {
      loaded.delete(name);
      if (!document.querySelector(`[data-panel="${name}"]`).hidden) open(name);
    },
    start: () => open(window.location.hash.slice(1)),
  };
}
