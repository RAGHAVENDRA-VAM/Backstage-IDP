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

  const orderTabs = () => {
    // Find tab container containing links (either role="tablist", [class*="tabs"], or a nav/header row of links)
    const tabHeaders = document.querySelectorAll('[role="tablist"], .MuiTabs-flexContainer, nav[aria-label*="tab"]');
    tabHeaders.forEach(tabList => {
      const tabs = Array.from(tabList.children) as HTMLElement[];
      if (tabs.length >= 3) {
        // Sort tabs according to desiredTabOrder
        const sorted = [...tabs].sort((a, b) => {
          const aKey = getTabKey(a);
          const bKey = getTabKey(b);

          const aIdx = desiredTabOrder.indexOf(aKey) !== -1 ? desiredTabOrder.indexOf(aKey) : 99;
          const bIdx = desiredTabOrder.indexOf(bKey) !== -1 ? desiredTabOrder.indexOf(bKey) : 99;

          return aIdx - bIdx;
        });

        // Re-append in sorted order if order differs
        sorted.forEach((tab) => {
          tabList.appendChild(tab);
        });
      }
    });
  };

  const cleanRepoText = () => {
    // Target any element containing text that matches the owner/repo format
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, header, [class*="title"], [class*="header"], [class*="Title"], [class*="Header"], [class*="toolbar"], [class*="Toolbar"], span, p');
    elements.forEach(el => {
      if (el.children.length === 0) {
        const text = el.textContent?.trim() || '';
        if (text.startsWith('RAGHAVENDRA-VAM/')) {
          el.textContent = text.replace(/^RAGHAVENDRA-VAM\//i, '');
        } else if (text.includes('/') && !text.includes(' ') && !text.startsWith('http') && !text.startsWith('/') && text.split('/').length === 2) {
          const parts = text.split('/');
          if (parts[0] && parts[1]) {
            el.textContent = parts[1];
          }
        }
      }
    });
  };

  const observer = new MutationObserver(() => {
    cleanRepoText();
    orderTabs();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    cleanRepoText();
    orderTabs();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      cleanRepoText();
      orderTabs();
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());

