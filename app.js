// Main controller for 20-week interactive learning strategy worksheets

// State variables
let currentWeek = null; // null means show Dashboard
let activeTheme = 'light';
let userState = {
  studentInfo: { grade: '', name: '', date: '' },
  worksheets: {} // Keyed by week number "01".."20"
};

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  applyTheme();
  renderSidebar();
  showView();
  updateGlobalProgress();
  setupEventListeners();
});

// Load state from localStorage
function loadFromLocalStorage() {
  const savedState = localStorage.getItem('phjh_learning_strategy_state');
  if (savedState) {
    try {
      userState = JSON.parse(savedState);
      if (!userState.studentInfo) userState.studentInfo = { grade: '', name: '', date: '' };
      if (!userState.worksheets) userState.worksheets = {};
    } catch (e) {
      console.error('Error parsing saved state:', e);
    }
  }
  
  const savedTheme = localStorage.getItem('phjh_learning_strategy_theme');
  if (savedTheme) {
    activeTheme = savedTheme;
  }
}

// Save state to localStorage
function saveToLocalStorage() {
  localStorage.setItem('phjh_learning_strategy_state', JSON.stringify(userState));
  localStorage.setItem('phjh_learning_strategy_theme', activeTheme);
}

// Global Event Listeners
function setupEventListeners() {
  // Theme Toggle Button
  document.getElementById('theme-toggle').addEventListener('click', () => {
    activeTheme = activeTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveToLocalStorage();
  });

  // Home Button
  document.getElementById('home-btn').addEventListener('click', () => {
    navigateToWeek(null);
  });
  
  // Dashboard Hero Button
  const heroBtn = document.getElementById('hero-start-btn');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      navigateToWeek("01");
    });
  }

  // Teacher Settings Modal Event Listeners
  const settingsBtn = document.getElementById('btn-teacher-settings');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsCancelBtn = document.getElementById('settings-cancel-btn');
  const settingsSaveBtn = document.getElementById('settings-save-btn');
  const scriptUrlInput = document.getElementById('teacher-script-url');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      const savedUrl = localStorage.getItem('phjh_teacher_script_url') || 'https://script.google.com/macros/s/AKfycbzmOvbpSaixFE8l_EdXwMCrvIHLPx3vZeujLrGfkljjECBHPM7mbTU3KQHqmJ0FVyV6wQ/exec';
      scriptUrlInput.value = savedUrl;
      settingsModal.style.display = 'flex';
    });
  }

  const closeModal = () => {
    if (settingsModal) {
      settingsModal.style.display = 'none';
    }
  };

  if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeModal);
  if (settingsCancelBtn) settingsCancelBtn.addEventListener('click', closeModal);

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeModal();
      }
    });
  }

  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener('click', () => {
      const url = scriptUrlInput.value.trim();
      localStorage.setItem('phjh_teacher_script_url', url);
      alert('教師後台網址已儲存！');
      closeModal();
    });
  }
}

// Apply visual theme class
function applyTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (activeTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
  } else {
    document.body.classList.remove('dark-theme');
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
  }
}

// Navigation between dashboard and worksheets
function navigateToWeek(weekNum) {
  // If leaving a week page, the canvas is automatically saved when drawn, but let's double-check
  currentWeek = weekNum;
  renderSidebar();
  showView();
  updateGlobalProgress();
  
  // Scroll main content back to top
  document.getElementById('main-scroll-content').scrollTop = 0;
}

// Update sidebar selection and visual badges
function renderSidebar() {
  const menuContainer = document.getElementById('sidebar-menu-list');
  menuContainer.innerHTML = '';
  
  // Define Unit titles mapping
  const units = [
    { title: "單元一：環境打造", weeks: ["01", "02", "15"] },
    { title: "單元二：記憶魔法師", weeks: ["03", "04", "05", "13", "16"] },
    { title: "單元三：工具應用", weeks: ["06", "07", "12", "18"] },
    { title: "單元四：組織高手", weeks: ["08", "09", "11", "14", "17"] },
    { title: "單元五：我的小成就", weeks: ["10", "19", "20"] }
  ];
  
  units.forEach((unit, uIdx) => {
    const unitGroup = document.createElement('div');
    unitGroup.className = 'unit-group';
    
    // Check if unit should be expanded (if it contains current week or if expanded is saved)
    let isExpanded = localStorage.getItem(`unit_expanded_${uIdx}`) !== 'false';
    if (currentWeek && unit.weeks.includes(currentWeek)) {
      isExpanded = true;
    }
    
    const unitHeader = document.createElement('div');
    unitHeader.className = 'unit-header';
    unitHeader.innerHTML = `
      <span>${unit.title}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: ${isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}; transition: transform 0.2s;">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    
    const unitWeeks = document.createElement('div');
    unitWeeks.className = 'unit-weeks';
    unitWeeks.style.display = isExpanded ? 'block' : 'none';
    
    // Toggle expand collapse
    unitHeader.addEventListener('click', () => {
      const isVisible = unitWeeks.style.display === 'block';
      unitWeeks.style.display = isVisible ? 'none' : 'block';
      unitHeader.querySelector('svg').style.transform = isVisible ? 'rotate(-90deg)' : 'rotate(0deg)';
      localStorage.setItem(`unit_expanded_${uIdx}`, !isVisible);
    });
    
    unitGroup.appendChild(unitHeader);
    
    unit.weeks.forEach(weekNo => {
      const data = worksheetsData.find(w => w.week === weekNo);
      if (!data) return;
      
      const item = document.createElement('div');
      item.className = `week-item ${currentWeek === weekNo ? 'active' : ''}`;
      
      const titleShort = data.title.split(' - ')[1] || data.title;
      
      // Calculate completion status
      const completion = getWeekCompletion(weekNo);
      let statusClass = 'not-started';
      if (completion === 100) statusClass = 'completed';
      else if (completion > 0) statusClass = 'in-progress';
      
      item.innerHTML = `
        <span>第 ${weekNo} 週 ${titleShort}</span>
        <span class="week-status ${statusClass}"></span>
      `;
      
      item.addEventListener('click', () => {
        navigateToWeek(weekNo);
      });
      
      unitWeeks.appendChild(item);
    });
    
    unitGroup.appendChild(unitWeeks);
    menuContainer.appendChild(unitGroup);
  });
}

// Show Dashboard or Worksheet View
function showView() {
  const dashboard = document.getElementById('dashboard-view');
  const worksheet = document.getElementById('worksheet-view');
  const topNav = document.getElementById('top-nav');
  
  if (currentWeek === null) {
    dashboard.style.display = 'block';
    worksheet.style.display = 'none';
    topNav.style.display = 'none';
    renderDashboard();
  } else {
    dashboard.style.display = 'none';
    worksheet.style.display = 'block';
    topNav.style.display = 'flex';
    renderWorksheet(currentWeek);
  }
}

// Calculate the percentage completion of a week
function getWeekCompletion(weekNo) {
  const data = worksheetsData.find(w => w.week === weekNo);
  if (!data) return 0;
  
  const weekState = userState.worksheets[weekNo] || {};
  const inputs = weekState.inputs || {};
  const checks = weekState.checks || [];
  const canvasData = weekState.canvasData || null;
  const feedback = weekState.feedback || {};
  
  let totalItems = 0;
  let filledItems = 0;
  
  data.sections.forEach((sec, sIdx) => {
    if (sec.type === 'table') {
      // Each cell in rows that doesn't start with Example (例：) or is blank in raw rows
      sec.rows.forEach((row, rIdx) => {
        if (row[0] && row[0].startsWith('例：')) return; // Skip example rows
        
        row.forEach((cell, cIdx) => {
          // If the cell was empty in data, it is a student fillable field
          if (cell === '') {
            totalItems++;
            const inputKey = `week-${weekNo}-sec-${sIdx}-row-${rIdx}-col-${cIdx}`;
            if (inputs[inputKey] && inputs[inputKey].trim() !== '') {
              filledItems++;
            }
          }
        });
      });
    } else if (sec.type === 'draw_box') {
      totalItems++;
      if (canvasData && canvasData !== 'blank') {
        filledItems++;
      }
    } else if (sec.type === 'checklist') {
      sec.items.forEach((item, iIdx) => {
        totalItems++;
        if (checks[iIdx] === true) {
          filledItems++;
        }
      });
    }
  });
  
  if (totalItems === 0) return 0;
  return Math.round((filledItems / totalItems) * 100);
}

// Calculate Global Progress Bar
function updateGlobalProgress() {
  let totalWeeks = 20;
  let completedCount = 0;
  
  for (let i = 1; i <= 20; i++) {
    const weekNo = i < 10 ? `0${i}` : `${i}`;
    const comp = getWeekCompletion(weekNo);
    if (comp === 100) {
      completedCount++;
    }
  }
  
  const percent = Math.round((completedCount / totalWeeks) * 100);
  
  // Update sidebar progress bar
  document.getElementById('global-progress-bar').style.width = `${percent}%`;
  document.getElementById('global-progress-percent').innerText = `${percent}%`;
  
  // Dashboard progress
  const dashPercent = document.getElementById('dash-progress-percent');
  if (dashPercent) {
    dashPercent.innerText = `${percent}%`;
    document.getElementById('dash-progress-bar').style.width = `${percent}%`;
    document.getElementById('dash-completed-weeks').innerText = `${completedCount} / 20 週已完成`;
  }
  
  return { percent, completedCount };
}

// Render Dashboard View
function renderDashboard() {
  const statsGrid = document.getElementById('units-stats-grid');
  statsGrid.innerHTML = '';
  
  const units = [
    { title: "單元一：環境打造", weeks: ["01", "02", "15"], color: "border-left: 4px solid #ef4444;" },
    { title: "單元二：記憶魔法師", weeks: ["03", "04", "05", "13", "16"], color: "border-left: 4px solid #3b82f6;" },
    { title: "單元三：工具應用", weeks: ["06", "07", "12", "18"], color: "border-left: 4px solid #10b981;" },
    { title: "單元四：組織高手", weeks: ["08", "09", "11", "14", "17"], color: "border-left: 4px solid #f59e0b;" },
    { title: "單元五：我的小成就", weeks: ["10", "19", "20"], color: "border-left: 4px solid #8b5cf6;" }
  ];
  
  units.forEach(unit => {
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.style = unit.color;
    
    // Count how many weeks in unit are completed
    let compCount = 0;
    unit.weeks.forEach(w => {
      if (getWeekCompletion(w) === 100) compCount++;
    });
    
    card.innerHTML = `
      <div>
        <div class="unit-card-title">${unit.title}</div>
        <div class="unit-card-weeks-count">${compCount} / ${unit.weeks.length} 週已完成</div>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 16px;">包含：第 ${unit.weeks.join(', ')} 週</div>
    `;
    
    // Go to first uncompleted week or first week of unit
    card.addEventListener('click', () => {
      const unfinished = unit.weeks.find(w => getWeekCompletion(w) < 100);
      navigateToWeek(unfinished || unit.weeks[0]);
    });
    
    statsGrid.appendChild(card);
  });
}

// Render Worksheet Form Page
function renderWorksheet(weekNo) {
  const data = worksheetsData.find(w => w.week === weekNo);
  if (!data) return;
  
  // Set navbar title
  document.getElementById('nav-week-title').innerText = data.title;
  
  const container = document.getElementById('worksheet-container');
  container.innerHTML = '';
  
  // Load week response state (inputs, checks, canvas, feedback)
  if (!userState.worksheets[weekNo]) {
    userState.worksheets[weekNo] = { inputs: {}, checks: [], canvasData: null, feedback: { comment: '', score: '' } };
  }
  const weekState = userState.worksheets[weekNo];
  
  // 1. Title Header
  const header = document.createElement('div');
  header.className = 'worksheet-header';
  header.innerHTML = `
    <h3>115學年度第一學期 學習策略學習單</h3>
    <span class="week-badge">第 ${weekNo} 週 — ${data.title}</span>
  `;
  container.appendChild(header);
  
  // 2. Student Info Grid
  const infoGrid = document.createElement('div');
  infoGrid.className = 'student-info-grid';
  infoGrid.innerHTML = `
    <div class="info-field">
      <span>班級：</span>
      <input type="text" id="student-class" value="資源班" disabled>
    </div>
    <div class="info-field">
      <span>年級：</span>
      <input type="text" id="student-grade" placeholder="請輸入">
    </div>
    <div class="info-field">
      <span>姓名：</span>
      <input type="text" id="student-name" placeholder="請輸入">
    </div>
    <div class="info-field">
      <span>日期：</span>
      <input type="text" id="student-date" placeholder="115年__月__日">
    </div>
  `;
  container.appendChild(infoGrid);
  
  // Set student info values and listeners
  const gradeInput = infoGrid.querySelector('#student-grade');
  const nameInput = infoGrid.querySelector('#student-name');
  const dateInput = infoGrid.querySelector('#student-date');
  
  gradeInput.value = userState.studentInfo.grade || '';
  nameInput.value = userState.studentInfo.name || '';
  dateInput.value = userState.studentInfo.date || '';
  
  const saveInfo = () => {
    userState.studentInfo.grade = gradeInput.value;
    userState.studentInfo.name = nameInput.value;
    userState.studentInfo.date = dateInput.value;
    saveToLocalStorage();
  };
  gradeInput.addEventListener('input', saveInfo);
  nameInput.addEventListener('input', saveInfo);
  dateInput.addEventListener('input', saveInfo);
  
  // 3. Objectives section
  const objCard = document.createElement('div');
  objCard.className = 'card-section';
  objCard.innerHTML = `
    <div class="section-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      一、學習目標
    </div>
    <ul class="objectives-list">
      ${data.objectives.map(obj => `<li>${obj}</li>`).join('')}
    </ul>
  `;
  container.appendChild(objCard);
  
  // 4. Render Dynamic Sections
  data.sections.forEach((sec, sIdx) => {
    const secCard = document.createElement('div');
    secCard.className = 'card-section';
    
    // Add title
    const titleEl = document.createElement('div');
    titleEl.className = 'section-title';
    let iconSvg = '';
    if (sec.type === 'text') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    } else if (sec.type === 'table') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>`;
    } else if (sec.type === 'draw_box') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
    } else if (sec.type === 'checklist') {
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;
    }
    titleEl.innerHTML = `${iconSvg} ${sec.title}`;
    secCard.appendChild(titleEl);
    
    // Add content depending on type
    if (sec.type === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = 'text-content';
      textDiv.innerText = sec.content;
      secCard.appendChild(textDiv);
    } 
    else if (sec.type === 'table') {
      const table = document.createElement('table');
      table.className = 'interactive-table';
      
      // Header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      sec.headers.forEach(h => {
        const th = document.createElement('th');
        th.innerText = h;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Body
      const tbody = document.createElement('tbody');
      sec.rows.forEach((row, rIdx) => {
        const tr = document.createElement('tr');
        const isExample = row[0] && row[0].startsWith('例：');
        if (isExample) {
          tr.className = 'example-row';
        }
        
        row.forEach((cell, cIdx) => {
          const td = document.createElement('td');
          
          if (cell !== '') {
            // Static text cell
            td.innerText = cell;
          } else {
            // Interactive input cell
            const inputKey = `week-${weekNo}-sec-${sIdx}-row-${rIdx}-col-${cIdx}`;
            const val = weekState.inputs[inputKey] || '';
            
            const textarea = document.createElement('textarea');
            textarea.className = 'cell-input';
            textarea.value = val;
            textarea.placeholder = "請輸入...";
            
            // Auto save on input
            textarea.addEventListener('input', () => {
              weekState.inputs[inputKey] = textarea.value;
              saveToLocalStorage();
              updateGlobalProgress();
              renderSidebar();
            });
            
            td.appendChild(textarea);
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      secCard.appendChild(table);
    } 
    else if (sec.type === 'draw_box') {
      const wrapper = document.createElement('div');
      wrapper.className = 'canvas-wrapper';
      
      // 1. Description inside canvas section if present
      if (sec.content) {
        const desc = document.createElement('div');
        desc.className = 'text-content';
        desc.style.marginBottom = '12px';
        desc.style.width = '100%';
        desc.innerText = sec.content;
        wrapper.appendChild(desc);
      }
      
      // 2. Toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'canvas-toolbar';
      toolbar.innerHTML = `
        <div class="canvas-tool-group">
          <button class="canvas-btn active" id="canvas-tool-brush" title="畫筆">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.34211 19.4836 5.34211 20.2664 4.85857 20.75C4.37504 21.2336 3.59218 21.2336 3.10865 20.75C0.970176 18.6115 -0.158569 15.6562 0.0125866 12.5975C0.316867 7.15949 4.74312 2.73324 10.1811 2.42896C16.3262 2.08511 21.4631 6.83785 21.9686 12.836C22.4265 18.2678 18.5714 23.0945 13.1906 23.8643C12.7937 23.921 12.3929 23.95 11.9897 23.95C11.3917 23.95 10.8223 23.6997 10.4208 23.2568C10.0538 22.8519 10.0538 22.2481 10.4208 21.8432C10.8223 21.4003 11.3917 21.15 11.9897 21.15C12.5298 21.15 13.0649 21.0967 13.5855 20.9937C17.7011 20.1779 20.7289 16.5186 20.3117 12.1834C19.9238 8.15175 16.5983 4.82625 12.5666 4.43831C8.2314 4.0211 4.57213 7.04889 3.75631 11.1645C3.6533 11.6851 3.6 12.2202 3.6 12.7603C3.6 13.3583 3.35 13.9277 2.9071 14.3292C2.50218 14.6962 1.89842 14.6962 1.4935 14.3292C1.05061 13.9277 0.800315 13.3583 0.800315 12.7603C0.800315 6.26526 6.06526 1 12.5603 1C19.0554 1 24.3203 6.26526 24.3203 12.7603C24.3203 18.6669 19.9806 23.5702 14.2394 24.3162C13.4891 24.4137 12.7346 24.4603 11.9897 24.4603C11.9932 24.4603 11.9967 24.4603 12.0002 24.4603L12 22Z" fill="currentColor"/></svg>
          </button>
          <button class="canvas-btn" id="canvas-tool-eraser" title="橡皮擦">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"></path><path d="M17 17L12 12"></path></svg>
          </button>
        </div>
        <div class="canvas-tool-group" id="canvas-colors">
          <div class="brush-color selected" data-color="#4f46e5" style="background-color: #4f46e5;"></div>
          <div class="brush-color" data-color="#10b981" style="background-color: #10b981;"></div>
          <div class="brush-color" data-color="#ef4444" style="background-color: #ef4444;"></div>
          <div class="brush-color" data-color="#f59e0b" style="background-color: #f59e0b;"></div>
          <div class="brush-color" data-color="#000000" style="background-color: #000000;"></div>
        </div>
        <div class="canvas-tool-group">
          <span class="stroke-slider-label">粗細:</span>
          <input type="range" class="stroke-slider" id="stroke-slider" min="1" max="20" value="4">
        </div>
        <div class="canvas-tool-group">
          <button class="canvas-btn" id="canvas-btn-clear" title="清除畫布" style="border-radius: 8px; width: auto; height: auto; padding: 6px 10px; font-size: 0.8rem; font-weight: bold; border-radius: 20px;">
            清除
          </button>
          <button class="canvas-btn" id="canvas-btn-download" title="下載圖片" style="border-radius: 8px; width: auto; height: auto; padding: 6px 10px; font-size: 0.8rem; font-weight: bold; border-radius: 20px;">
            下載
          </button>
        </div>
      `;
      wrapper.appendChild(toolbar);
      
      // 3. Canvas Container
      const canvasContainer = document.createElement('div');
      canvasContainer.className = 'canvas-container';
      
      const canvas = document.createElement('canvas');
      canvas.className = 'canvas-board';
      canvas.width = 800; // Fixed coordinate system
      canvas.height = 250;
      
      canvasContainer.appendChild(canvas);
      wrapper.appendChild(canvasContainer);
      secCard.appendChild(wrapper);
      
      // Init drawing handlers for this canvas
      setTimeout(() => initCanvasDrawing(canvas, weekNo, weekState), 0);
    } 
    else if (sec.type === 'checklist') {
      const checklist = document.createElement('div');
      checklist.className = 'checklist-container';
      
      // Initialize list response state
      if (!weekState.checks || weekState.checks.length === 0) {
        weekState.checks = new Array(sec.items.length).fill(false);
      }
      
      sec.items.forEach((item, iIdx) => {
        const itemLabel = document.createElement('label');
        const isChecked = weekState.checks[iIdx] === true;
        itemLabel.className = `checklist-item ${isChecked ? 'checked' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        
        checkbox.addEventListener('change', () => {
          weekState.checks[iIdx] = checkbox.checked;
          if (checkbox.checked) {
            itemLabel.classList.add('checked');
          } else {
            itemLabel.classList.remove('checked');
          }
          saveToLocalStorage();
          updateGlobalProgress();
          renderSidebar();
        });
        
        itemLabel.appendChild(checkbox);
        itemLabel.appendChild(document.createTextNode(` ${item}`));
        checklist.appendChild(itemLabel);
      });
      
      secCard.appendChild(checklist);
    }
    
    container.appendChild(secCard);
  });
  
  // 5. Teacher Feedback Box
  const feedbackCard = document.createElement('div');
  feedbackCard.className = 'card-section feedback-section';
  feedbackCard.innerHTML = `
    <div class="section-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      【學習回饋與表現評估】
    </div>
    <div class="feedback-grid">
      <div class="feedback-left">
        <span style="font-size: 0.8rem; font-weight: bold; margin-bottom: 6px; color: var(--text-secondary);">老師評語與回饋：</span>
        <textarea id="feedback-comment" placeholder="輸入評語..."></textarea>
      </div>
      <div class="feedback-right">
        <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-secondary);">課堂表現評分：</span>
        <div class="score-options">
          <div class="score-btn" data-score="優">優</div>
          <div class="score-btn" data-score="佳">佳</div>
          <div class="score-btn" data-score="可">可</div>
          <div class="score-btn" data-score="待努力">待努力</div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(feedbackCard);
  
  // Setup feedback bindings
  const commentArea = feedbackCard.querySelector('#feedback-comment');
  commentArea.value = weekState.feedback.comment || '';
  commentArea.addEventListener('input', () => {
    weekState.feedback.comment = commentArea.value;
    saveToLocalStorage();
  });
  
  const scoreBtns = feedbackCard.querySelectorAll('.score-btn');
  const activeScore = weekState.feedback.score || '';
  if (activeScore) {
    feedbackCard.querySelector(`.score-btn[data-score="${activeScore}"]`).classList.add('selected');
  }
  
  scoreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scoreBtns.forEach(b => b.classList.remove('selected'));
      
      if (weekState.feedback.score === btn.dataset.score) {
        // Toggle off
        weekState.feedback.score = '';
      } else {
        btn.classList.add('selected');
        weekState.feedback.score = btn.dataset.score;
      }
      saveToLocalStorage();
    });
  });
  
  // 6. Navigation buttons at bottom
  const navContainer = document.createElement('div');
  navContainer.className = 'week-nav-container';
  
  // Previous week button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn';
  prevBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    上一週
  `;
  const prevWeekNo = getOffsetWeek(weekNo, -1);
  if (prevWeekNo) {
    prevBtn.addEventListener('click', () => navigateToWeek(prevWeekNo));
  } else {
    // Go to dashboard
    prevBtn.addEventListener('click', () => navigateToWeek(null));
  }
  navContainer.appendChild(prevBtn);
  
  // Next week button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-primary';
  const nextWeekNo = getOffsetWeek(weekNo, 1);
  if (nextWeekNo) {
    nextBtn.innerHTML = `
      下一週
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
    `;
    nextBtn.addEventListener('click', () => navigateToWeek(nextWeekNo));
  } else {
    nextBtn.innerHTML = `回儀表板`;
    nextBtn.addEventListener('click', () => navigateToWeek(null));
  }
  navContainer.appendChild(nextBtn);
  
  container.appendChild(navContainer);
  
  // Dynamic top bar buttons bind
  document.getElementById('nav-btn-print').onclick = () => {
    window.print();
  };
  
  document.getElementById('nav-btn-reset').onclick = () => {
    if (confirm('確定要清除此週的填寫內容嗎？此動作無法復原。')) {
      userState.worksheets[weekNo] = { inputs: {}, checks: [], canvasData: null, feedback: { comment: '', score: '' } };
      saveToLocalStorage();
      updateGlobalProgress();
      renderSidebar();
      renderWorksheet(weekNo);
    }
  };

  const submitBtn = document.getElementById('nav-btn-submit');
  if (submitBtn) {
    submitBtn.onclick = () => {
      submitWorksheet(weekNo, data);
    };
  }
}

// Find previous/next week IDs
function getOffsetWeek(currentWeekNo, offset) {
  const currentNum = parseInt(currentWeekNo, 10);
  const targetNum = currentNum + offset;
  if (targetNum >= 1 && targetNum <= 20) {
    return targetNum < 10 ? `0${targetNum}` : `${targetNum}`;
  }
  return null;
}

// Initialize HTML5 Canvas drawing board logic
function initCanvasDrawing(canvas, weekNo, weekState) {
  const ctx = canvas.getContext('2d');
  
  // Clean canvas & configure drawing parameters
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Load existing drawing
  if (weekState.canvasData) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = weekState.canvasData;
  } else {
    // Fill with empty transparent color
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // Drawing states
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentTool = 'brush'; // or 'eraser'
  let currentColor = '#4f46e5';
  let currentStroke = 4;
  
  // Toolbar buttons bind
  const brushTool = document.getElementById('canvas-tool-brush');
  const eraserTool = document.getElementById('canvas-tool-eraser');
  const colorDots = document.querySelectorAll('.brush-color');
  const strokeSlider = document.getElementById('stroke-slider');
  const clearBtn = document.getElementById('canvas-btn-clear');
  const downloadBtn = document.getElementById('canvas-btn-download');
  
  const setTool = (tool) => {
    currentTool = tool;
    if (tool === 'brush') {
      brushTool.classList.add('active');
      eraserTool.classList.remove('active');
      ctx.strokeStyle = currentColor;
    } else {
      eraserTool.classList.add('active');
      brushTool.classList.remove('active');
      ctx.strokeStyle = activeTheme === 'dark' ? '#1a1f2e' : '#ffffff'; // Match canvas backgrounds
    }
  };
  
  brushTool.addEventListener('click', () => setTool('brush'));
  eraserTool.addEventListener('click', () => setTool('eraser'));
  
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      currentColor = dot.dataset.color;
      if (currentTool === 'brush') {
        ctx.strokeStyle = currentColor;
      }
    });
  });
  
  strokeSlider.addEventListener('input', () => {
    currentStroke = strokeSlider.value;
    ctx.lineWidth = currentStroke;
  });
  
  clearBtn.addEventListener('click', () => {
    if (confirm('確定要清除畫布嗎？')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveCanvas();
    }
  });
  
  downloadBtn.addEventListener('click', () => {
    // Create link and download
    const link = document.createElement('a');
    link.download = `第${weekNo}週_學習策略_心智圖畫布.png`;
    
    // Create temporary white background canvas for download
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill white bg
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);
    
    link.href = tempCanvas.toDataURL();
    link.click();
  });
  
  // Coordinates helper (since canvas is scaled via CSS, map display coords to canvas internal drawing coords)
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }
  
  // Drawing operations
  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    // Update eraser color dynamically in case theme was changed
    if (currentTool === 'eraser') {
      ctx.strokeStyle = activeTheme === 'dark' ? '#1a1f2e' : '#ffffff';
    }
    
    const pos = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastX = pos.x;
    lastY = pos.y;
  }
  
  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
  }
  
  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      saveCanvas();
    }
  }
  
  // Save canvas as base64 string
  function saveCanvas() {
    // Check if canvas is blank to update completion status
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    
    if (canvas.toDataURL() === blank.toDataURL()) {
      weekState.canvasData = 'blank';
    } else {
      weekState.canvasData = canvas.toDataURL();
    }
    
    saveToLocalStorage();
    updateGlobalProgress();
    renderSidebar();
  }
  
  // Mouse Events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch Events
  canvas.addEventListener('touchstart', (e) => {
    startDrawing(e);
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    draw(e);
  }, { passive: false });
  
  canvas.addEventListener('touchend', stopDrawing);
}

// Submit worksheet data to Google Sheets backend
function submitWorksheet(weekNo, data) {
  const url = localStorage.getItem('phjh_teacher_script_url') || 'https://script.google.com/macros/s/AKfycbzmOvbpSaixFE8l_EdXwMCrvIHLPx3vZeujLrGfkljjECBHPM7mbTU3KQHqmJ0FVyV6wQ/exec';
  if (!url) {
    alert('未設定教師後台網址！請先回到首頁儀表板，點選右上方「教師設定」貼上您的 Google Apps Script 網頁應用程式網址。');
    return;
  }

  // Validate student info
  const name = (userState.studentInfo.name || '').trim();
  const grade = (userState.studentInfo.grade || '').trim();
  
  if (!name) {
    alert('請先在學習單上方填寫您的「姓名」！');
    const nameInput = document.getElementById('student-name');
    if (nameInput) {
      nameInput.focus();
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  if (!grade) {
    alert('請先在學習單上方填寫您的「年級」！');
    const gradeInput = document.getElementById('student-grade');
    if (gradeInput) {
      gradeInput.focus();
      gradeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const weekState = userState.worksheets[weekNo] || { inputs: {}, checks: [], canvasData: null, feedback: { comment: '', score: '' } };

  // Compile answers into formatted text
  let answersText = '';
  data.sections.forEach((sec, sIdx) => {
    answersText += `【${sec.title}】\n`;
    if (sec.type === 'text') {
      answersText += `(內容說明)\n`;
    } else if (sec.type === 'table') {
      sec.rows.forEach((row, rIdx) => {
        if (row[0] && row[0].startsWith('例：')) return; // Skip example row
        
        let rowParts = [];
        row.forEach((cell, cIdx) => {
          if (cell !== '') {
            rowParts.push(cell);
          } else {
            const inputKey = `week-${weekNo}-sec-${sIdx}-row-${rIdx}-col-${cIdx}`;
            const val = (weekState.inputs[inputKey] || '').trim();
            rowParts.push(val ? `作答: ${val}` : `作答: (空白)`);
          }
        });
        answersText += `- ${rowParts.join(' | ')}\n`;
      });
    } else if (sec.type === 'checklist') {
      if (weekState.checks && weekState.checks.length > 0) {
        sec.items.forEach((item, iIdx) => {
          const checked = weekState.checks[iIdx] === true ? '✓' : '☐';
          answersText += `- [${checked}] ${item}\n`;
        });
      } else {
        answersText += `- (尚未勾選任何項目)\n`;
      }
    } else if (sec.type === 'draw_box') {
      const hasDrawing = weekState.canvasData && weekState.canvasData !== 'blank';
      answersText += `- 心智圖/畫布狀態: ${hasDrawing ? '學生已完成繪圖 (詳見圖檔欄位)' : '學生未在畫布作圖'}\n`;
    }
    answersText += '\n';
  });

  // Get score and comments
  const score = weekState.feedback.score || '';
  const comment = weekState.feedback.comment || '';

  // Get submit button to show loading status
  const submitBtn = document.getElementById('nav-btn-submit');
  const originalHtml = submitBtn.innerHTML;
  
  // Set button to loading state
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';
  submitBtn.innerHTML = `<span class="spinner"></span> 傳送中...`;

  // Prepare payload
  const payload = {
    studentName: name,
    studentGrade: grade,
    week: weekNo,
    title: data.title,
    answersText: answersText,
    canvasData: (weekState.canvasData && weekState.canvasData !== 'blank') ? weekState.canvasData : '',
    score: score,
    teacherComment: comment
  };

  // Perform post request
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    return response.json();
  })
  .then(res => {
    if (res && res.result === 'success') {
      alert('學習單已成功送出！作答成果已收集至後台試算表。');
    } else {
      alert('送出失敗：' + (res && res.error ? res.error : '伺服器錯誤'));
    }
  })
  .catch(err => {
    console.error('Error submitting sheet:', err);
    // Since Google Apps Script Web App redirects are sometimes blocked by CORS on the redirect target,
    // we show a helpful warning, but if it's a redirect issue, the data was actually written.
    alert('已嘗試送出！\n\n提示：因為 Google 試算表轉址安全機制，瀏覽器可能會顯示 CORS/連線警報，但您的作答內容通常已成功寫入。請請老師至後台 Google 試算表確認是否有您的資料。');
  })
  .finally(() => {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.innerHTML = originalHtml;
  });
}
