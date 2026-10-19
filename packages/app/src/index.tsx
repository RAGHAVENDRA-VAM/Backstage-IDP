import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';

// Automatically reorder catalog tabs to: Overview, Jira, GitHub Actions, Pull Requests, Azure, Datadog, TechDocs
if (typeof window !== 'undefined') {
  const desiredTabOrder = [
    'overview',
    'jira',
    'github-actions',
    'pull-requests',
    'azure',
    'datadog',
    'docs',
  ];

  const getTabKey = (el: HTMLElement) => {
    const href = (el.getAttribute('href') || el.querySelector('a')?.getAttribute('href') || '').toLowerCase();
    const text = (el.textContent || '').trim().toLowerCase();

    if (href.includes('github-actions') || text.includes('github action')) return 'github-actions';
    if (href.includes('pull-requests') || text.includes('pull request')) return 'pull-requests';
    if (href.includes('jira') || text === 'jira') return 'jira';
    if (href.includes('azure') || text === 'azure') return 'azure';
    if (href.includes('datadog') || text === 'datadog') return 'datadog';
    if (href.includes('docs') || text === 'techdocs' || text === 'docs') return 'docs';
    if (text === 'overview' || href.endsWith('/component/' + href.split('/').pop())) return 'overview';

    const last = href.split('/').pop() || '';
    return last || 'overview';
  };

  let isReordering = false;

  const orderTabs = () => {
    if (isReordering) return;
    const tabHeaders = document.querySelectorAll('[role="tablist"], .MuiTabs-flexContainer, nav[aria-label*="tab"]');
    tabHeaders.forEach(tabList => {
      const tabs = Array.from(tabList.children) as HTMLElement[];
      if (tabs.length >= 3) {
        const sorted = [...tabs].sort((a, b) => {
          const aKey = getTabKey(a);
          const bKey = getTabKey(b);
          const aIdx = desiredTabOrder.indexOf(aKey) !== -1 ? desiredTabOrder.indexOf(aKey) : 99;
          const bIdx = desiredTabOrder.indexOf(bKey) !== -1 ? desiredTabOrder.indexOf(bKey) : 99;
          return aIdx - bIdx;
        });

        // Only touch the DOM if order actually differs
        const needsReorder = tabs.some((tab, idx) => tab !== sorted[idx]);
        if (needsReorder) {
          isReordering = true;
          try {
            sorted.forEach((tab) => {
              tabList.appendChild(tab);
            });
          } finally {
            setTimeout(() => { isReordering = false; }, 50);
          }
        }
      }
    });
  };

  const cleanRepoText = () => {
    if (isReordering) return;
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, header, [class*="title"], [class*="header"], [class*="Title"], [class*="Header"], [class*="toolbar"], [class*="Toolbar"]');
    elements.forEach(el => {
      if (el.children.length === 0) {
        const text = el.textContent?.trim() || '';
        if (text.startsWith('RAGHAVENDRA-VAM/')) {
          el.textContent = text.replace(/^RAGHAVENDRA-VAM\//i, '');
        }
      }
    });
  };

  let debounceTimer: any = null;
  const observer = new MutationObserver(() => {
    if (isReordering) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      cleanRepoText();
      orderTabs();
    }, 100);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    cleanRepoText();
    orderTabs();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      cleanRepoText();
      orderTabs();
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());

