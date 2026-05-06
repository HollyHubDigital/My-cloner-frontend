// Store extracted files
let extractedFiles = {
  html: '',
  css: '',
  js: '',
  title: ''
};

// Initialize when DOM is ready
function initializeApp() {
  const cloneForm = document.getElementById('cloneForm');
  const urlInput = document.getElementById('urlInput');
  const cloneBtn = document.getElementById('cloneBtn');
  const btnText = document.getElementById('btnText');
  const statusMessage = document.getElementById('statusMessage');
  const statusText = document.getElementById('statusText');
  const resultsContainer = document.getElementById('resultsContainer');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (!cloneForm || !urlInput) {
    console.warn('DOM elements not found, will retry...');
    setTimeout(initializeApp, 100);
    return;
  }

  // Progress animation state variables
  let progressInterval = null;
  let progressValue = 0;
  let currentStage = 0;
  const stages = [
    { name: 'Analyzing', target: 15 },
    { name: 'Fetching', target: 40 },
    { name: 'Rendering', target: 70 },
    { name: 'Inlining assets', target: 90 },
    { name: 'Finalizing', target: 98 }
  ];

  // Tab Navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => content.style.display = 'none');
      const tabEl = document.getElementById(`${tabName}-tab`);
      if (tabEl) {
        tabEl.style.display = 'block';
      }
      
      // Load preview on demand
      if (tabName === 'preview') {
        loadPreview();
      }
    });
  });

  // Show status message
  function showStatus(message, type = 'info') {
    statusMessage.classList.remove('hidden');
    statusMessage.className = `mt-4 p-4 rounded-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    statusText.textContent = message;
    
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.classList.add('hidden');
      }, 5000);
    }
  }

  // Load preview by combining all files
  function loadPreview() {
    if (!extractedFiles.html) return;
    
    console.log('🔄 Loading preview...');
    console.log('HTML size:', extractedFiles.html.length);
    console.log('CSS size:', extractedFiles.css.length);
    console.log('JS size:', extractedFiles.js.length);
    
    // The HTML from server may already have CSS/JS embedded (especially for Puppeteer renders)
    // Only add them if they're NOT already present
    let previewDoc = extractedFiles.html;
    
    // Check if CSS is already embedded in the HTML
    const cssAlreadyEmbedded = previewDoc.includes('id="cloned-site-styles"') || previewDoc.includes('data-origin="inlined-stylesheets"');
    
    // Inline CSS only if not already embedded
    if (extractedFiles.css && !cssAlreadyEmbedded) {
      previewDoc = previewDoc.replace(
        '</head>',
        `<style>${extractedFiles.css}</style></head>`
      );
    }
    
    // Handle JavaScript - wrap it to execute after DOM is ready
    let jsToInline = '';
    if (extractedFiles.js) {
      // Wrap the JS to ensure it runs after DOM is ready
      jsToInline = `<script>
(function() {
  // Execute after DOM content is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      try {
        ${extractedFiles.js}
      } catch(e) {
        console.warn('Error executing cloned site script:', e);
      }
    });
  } else {
    // DOM already loaded
    try {
      ${extractedFiles.js}
    } catch(e) {
      console.warn('Error executing cloned site script:', e);
    }
  }
})();
</script>`;
    }
    
    // Inject JS before closing body tag
    if (jsToInline && !previewDoc.includes('id="cloned-site-scripts"')) {
      previewDoc = previewDoc.replace(
        '</body>',
        jsToInline + '</body>'
      );
    }
    
    const previewFrame = document.getElementById('previewFrame');
    if (previewFrame) {
      try {
        // Use blob URL for better iframe content loading
        const blob = new Blob([previewDoc], { type: 'text/html;charset=UTF-8' });
        const blobUrl = URL.createObjectURL(blob);
        
        console.log('✅ Blob URL created, loading preview...');
        previewFrame.src = blobUrl;
        
        // Cleanup old blob URLs after a delay
        setTimeout(() => {
          const oldUrl = previewFrame.dataset.blobUrl;
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }
          previewFrame.dataset.blobUrl = blobUrl;
        }, 100);
        
      } catch (e) {
        console.error('Error loading preview via blob:', e);
        // Fallback to srcdoc
        try {
          previewFrame.srcdoc = previewDoc;
        } catch (e2) {
          console.error('Error loading preview via srcdoc:', e2);
        }
      }
    }
  }

  // Display code in code blocks
  function displayCode() {
    const htmlCode = document.getElementById('htmlCode');
    const cssCode = document.getElementById('cssCode');
    const jsCode = document.getElementById('jsCode');
    
    if (htmlCode) htmlCode.textContent = extractedFiles.html;
    if (cssCode) cssCode.textContent = extractedFiles.css;
    if (jsCode) jsCode.textContent = extractedFiles.js;
  }

  // Copy to clipboard
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const type = btn.dataset.type;
      const content = extractedFiles[type];
      
      try {
        await navigator.clipboard.writeText(content);
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (error) {
        showStatus('Failed to copy to clipboard', 'error');
      }
    });
  });

  // Download individual files
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.dataset.type;
      const filename = btn.dataset.filename;
      const content = extractedFiles[type];
      
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showStatus(`✓ Downloaded ${filename}!`, 'success');
    });
  });

  // Form submission
  cloneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    
    if (!url) {
      showStatus('Please enter a website URL', 'error');
      return;
    }
    
    // Reset UI
    cloneBtn.disabled = true;
    statusMessage.classList.add('hidden');
    // Start progress animation
    startProgress();
    
    try {
      const apiCloneUrl = (window.API_CONFIG && window.API_CONFIG.endpoints && window.API_CONFIG.endpoints.clone) || '/api/clone';
      const response = await fetch(apiCloneUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      
      console.log('📦 API Response received:');
      console.log('  Success:', result.success);
      console.log('  Title:', result.title);
      console.log('  HTML size:', result.html?.length);
      console.log('  CSS size:', result.css?.length);
      console.log('  JS size:', result.js?.length);
      
      if (result.success) {
        // Store the extracted files
        extractedFiles = {
          html: result.html,
          css: result.css || '',
          js: result.js || '',
          title: result.title
        };
        
        console.log('✅ Files stored in memory');
        
        // Show results
        resultsContainer.classList.remove('hidden');
        displayCode();
        
        console.log('📺 Loading preview...');
        loadPreview();
        
        // Switch to preview tab
        const previewTab = document.querySelector('[data-tab="preview"]');
        if (previewTab) {
          previewTab.click();
          console.log('🎯 Switched to preview tab');
        }
        
        showStatus(`✅ Successfully cloned: ${result.title}`, 'success');
      } else {
        showStatus(`❌ Error: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      showStatus(`❌ Failed to clone website: ${error.message}`, 'error');
    } finally {
      cloneBtn.disabled = false;
      stopProgress();
    }
  });

  // Progress animation helper functions
  function startProgress() {
    const progressEl = document.getElementById('btnProgress');
    const textEl = document.getElementById('btnText');
    if (!progressEl || !textEl) return;
    progressValue = 0;
    currentStage = 0;
    progressEl.style.display = 'inline-block';
    textEl.textContent = stages[0].name;
    progressEl.textContent = '0%';

    progressInterval = setInterval(() => {
      // gently increase progress
      const stage = stages[Math.min(currentStage, stages.length - 1)];
      const step = Math.max(1, Math.floor(Math.random() * 4));
      progressValue = Math.min(stage.target, progressValue + step);
      progressEl.textContent = `${progressValue}%`;

      // once we reach the stage target, advance to next stage
      if (progressValue >= stage.target) {
        currentStage = Math.min(currentStage + 1, stages.length - 1);
        const next = stages[Math.min(currentStage, stages.length - 1)];
        document.getElementById('btnText').textContent = next.name;
      }
    }, 400);
  }

  function stopProgress(finalText) {
    const progressEl = document.getElementById('btnProgress');
    const textEl = document.getElementById('btnText');
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (progressEl) {
      progressEl.textContent = '100%';
      setTimeout(() => { progressEl.style.display = 'none'; }, 700);
    }
    if (textEl) textEl.textContent = finalText || 'Clone Website';
  }

  // Handle Enter key in URL input
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      cloneForm.dispatchEvent(new Event('submit'));
    }
  });

  console.log('✅ Website Cloner initialized successfully!');
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
