import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';

// Automatically reorder catalog tabs to standard enterprise lifecycle sequence:
// 1. Overview -> 2. Jira -> 3. GitHub Actions -> 4. Pull Requests -> 5. Azure DevOps -> 6. Azure -> 7. AWS -> 8. Datadog -> 9. TechDocs / Docs -> 10. Dependencies
if (typeof window !== 'undefined') {
  const desiredTabOrder = [
    'overview',
    'jira',
    'github-actions',
    'pull-requests',
    'azure-devops',
    'azure',
    'aws',
    'datadog',
    'docs',
    'dependencies',
  ];

  const getTabKey = (el: HTMLElement) => {
    const href = (el.getAttribute('href') || el.querySelector('a')?.getAttribute('href') || '').toLowerCase();
    const text = (el.textContent || '').trim().toLowerCase();

    // Check Azure DevOps first to prevent colliding with Azure
    if (href.includes('azure-devops') || text.includes('azure devops') || text.includes('ado')) return 'azure-devops';
    // Check GitHub Actions
    if (href.includes('github-actions') || text.includes('github action') || text.includes('actions') || text === 'github') return 'github-actions';
    // Check Pull Requests
    if (href.includes('pull-requests') || text.includes('pull request') || text.includes('pulls') || text === 'pr' || text === 'prs') return 'pull-requests';
    // Check Jira
    if (href.includes('jira') || text.includes('jira')) return 'jira';
    // Check Azure Cloud
    if (href.includes('azure') || text.includes('azure')) return 'azure';
    // Check AWS Cloud
    if (href.includes('aws') || text.includes('aws') || text.includes('amazon')) return 'aws';
    // Check Datadog
    if (href.includes('datadog') || text.includes('datadog')) return 'datadog';
    // Check TechDocs / Docs
    if (href.includes('docs') || text.includes('techdocs') || text === 'docs') return 'docs';
    // Check Dependencies
    if (href.includes('dependencies') || text.includes('dependencies') || text.includes('dependency')) return 'dependencies';
    // Overview
    if (text.includes('overview') || href.endsWith('/component/' + href.split('/').pop()) || href.endsWith('/api/' + href.split('/').pop())) return 'overview';

    const last = href.split('/').pop() || '';
    return last || 'overview';
  };

  let isReordering = false;

  const orderTabs = () => {
    if (isReordering) return;
    // Only reorder entity catalog header tabs to avoid tampering with in-page sub-tabs or /dashboard
    if (!window.location.pathname.includes('/catalog/')) return;
    const tabHeaders = document.querySelectorAll('header [role="tablist"], nav.MuiTabs-root [role="tablist"], [data-testid="header-tabs"] [role="tablist"]');
    tabHeaders.forEach(tabList => {
      // Safety check: ensure these are top-level entity navigation tabs (each containing <a> with href)
      const tabs = Array.from(tabList.children) as HTMLElement[];
      const hasLinks = tabs.some(t => t.tagName === 'A' || t.querySelector('a') || t.getAttribute('href'));
      if (!hasLinks || tabs.length < 3) return;

      const innerFlex = tabList.querySelector('.MuiTabs-flexContainer') as HTMLElement;
      const targetContainer = innerFlex || tabList;
      const currentTabs = Array.from(targetContainer.children) as HTMLElement[];

      if (currentTabs.length >= 3) {
        const sorted = [...currentTabs].sort((a, b) => {
          const aKey = getTabKey(a);
          const bKey = getTabKey(b);
          const aIdx = desiredTabOrder.indexOf(aKey) !== -1 ? desiredTabOrder.indexOf(aKey) : 99;
          const bIdx = desiredTabOrder.indexOf(bKey) !== -1 ? desiredTabOrder.indexOf(bKey) : 99;
          return aIdx - bIdx;
        });

        // Only touch the DOM if order actually differs
        const needsReorder = currentTabs.some((tab, idx) => tab !== sorted[idx]);
        if (needsReorder) {
          isReordering = true;
          try {
            sorted.forEach((tab) => {
              targetContainer.appendChild(tab);
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

  if (window.location.pathname === '/' || window.location.pathname === '') {
    window.location.replace('/catalog');
  }

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

