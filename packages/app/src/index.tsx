import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';

// Automatically format repository display names in headers and cards to hide username prefix (e.g. RAGHAVENDRA-VAM/Claims_UI -> Claims_UI)
if (typeof window !== 'undefined') {
  const cleanRepoText = () => {
    // Target header titles, typography, and card headers
    const elements = document.querySelectorAll('h6, header, [class*="title"], [class*="header"]');
    elements.forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        const text = el.textContent?.trim() || '';
        if (text.includes('/') && !text.includes(' ') && !text.startsWith('http')) {
          const parts = text.split('/');
          if (parts.length === 2 && parts[1]) {
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
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());

