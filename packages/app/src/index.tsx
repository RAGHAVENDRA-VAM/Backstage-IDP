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

  const orderTabs = () => {
    // Find tab container containing links
    const tabHeaders = document.querySelectorAll('header [role="tablist"], [role="tablist"]');
    tabHeaders.forEach(tabList => {
      const tabs = Array.from(tabList.children) as HTMLElement[];
      if (tabs.length > 2) {
        let changed = false;
        // Sort tabs according to desiredTabOrder
        const sorted = [...tabs].sort((a, b) => {
          const aHref = (a.getAttribute('href') || a.querySelector('a')?.getAttribute('href') || '').toLowerCase();
          const bHref = (b.getAttribute('href') || b.querySelector('a')?.getAttribute('href') || '').toLowerCase();

          const aPath = aHref.split('/').pop() || 'overview';
          const bPath = bHref.split('/').pop() || 'overview';

          const aIdx = desiredTabOrder.indexOf(aPath) !== -1 ? desiredTabOrder.indexOf(aPath) : 99;
          const bIdx = desiredTabOrder.indexOf(bPath) !== -1 ? desiredTabOrder.indexOf(bPath) : 99;

          return aIdx - bIdx;
        });

        // Re-append in sorted order if order differs
        sorted.forEach((tab, idx) => {
          if (tabs[idx] !== tab) {
            tabList.appendChild(tab);
            changed = true;
          }
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

