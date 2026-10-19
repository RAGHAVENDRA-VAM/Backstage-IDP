import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';

// Automatically format repository display names in headers and cards to hide username prefix (e.g. RAGHAVENDRA-VAM/Claims_UI -> Claims_UI)
if (typeof window !== 'undefined') {
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
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    cleanRepoText();
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      cleanRepoText();
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());

