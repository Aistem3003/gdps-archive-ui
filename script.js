// Конфігурація API
// Замінити порожній рядок на бекенд
const API_URL   = '';

// MOCK_MODE автоматично вмикається, якщо API_URL порожній
const MOCK_MODE = !API_URL;

let uploadedFiles = [];

function go(n) {
  document.querySelectorAll('.step-view').forEach((el, i) =>
    el.classList.toggle('active', i === n));
  ['pip0','pip1','pip2'].forEach((id, i) => {
    const d = document.getElementById(id);
    d.classList.remove('active','done');
    if (i < n) d.classList.add('done');
    if (i === n) d.classList.add('active');
  });
  window.scrollTo({ top:0, behavior:'smooth' });
}

function tryGoStep1() {
  if (uploadedFiles.length === 0) return;
  buildFileTree();
  go(1);
}

function tryGoStep2() {
  const hasData = uploadedFiles.some(u => u.checked && Object.keys(u.meta).length > 0);
  
  if (hasData) {
    go(2);
  } else {
    const status = document.getElementById('meta-status');
    status.textContent = 'X SELECT AND FILL DATA FOR AT LEAST 1 FILE';
    status.className = 'gd-upload-status error';
    setTimeout(() => { 
      if (status.textContent.includes('FILL DATA')) {
        status.textContent = ''; 
        status.className = 'gd-upload-status'; 
      }
    }, 4000);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(1) + ' MB';
}

function guessFolder(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.dat') || name.endsWith('.lvl')) return 'DS FILES';
  if (name.includes('yt') || name.includes('youtube')) return 'YT FILES';
  if (name.endsWith('.mp4') || name.endsWith('.mkv')) return 'YT FILES';
  return 'DS FILES';
}

function handleFiles(files) {
  Array.from(files).forEach(f => {
    if (!uploadedFiles.find(u => u.file.name === f.name)) {
      uploadedFiles.push({ file:f, folder:guessFolder(f), checked:true, meta:{} });
    }
  });
  renderChips();
  updateStep0UI();
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('over');
  handleFiles(e.dataTransfer.files);
}

function removeFile(name) {
  uploadedFiles = uploadedFiles.filter(u => u.file.name !== name);
  renderChips();
  updateStep0UI();
}

function renderChips() {
  const c = document.getElementById('chips');
  c.innerHTML = '';
  uploadedFiles.forEach(u => {
    const s = document.createElement('span');
    s.className = 'gd-chip';
    s.innerHTML = `${u.file.name}
      <span class="gd-chip-remove" onclick="removeFile('${u.file.name.replace(/'/g,"\\'")}')">✕</span>`;
    c.appendChild(s);
  });
}

function updateStep0UI() {
  const empty   = document.getElementById('s0-empty');
  const summary = document.getElementById('s0-summary');
  const btn     = document.getElementById('btn-s0-next');
  const has     = uploadedFiles.length > 0;

  empty.style.display   = has ? 'none' : 'block';
  summary.style.display = has ? 'block' : 'none';
  btn.disabled = !has;

  if (has) {
    const total = uploadedFiles.reduce((s, u) => s + u.file.size, 0);
    summary.textContent = `${uploadedFiles.length} FILE${uploadedFiles.length>1?'S':''} — ${formatSize(total)}`;
  }
}

function buildFileTree() {
  const tree = document.getElementById('fileTree');
  tree.innerHTML = '';

  const groups = {};
  uploadedFiles.forEach(u => {
    if (!groups[u.folder]) groups[u.folder] = [];
    groups[u.folder].push(u);
  });

  Object.keys(groups).forEach(folderName => {
    const head = document.createElement('div');
    head.className = 'gd-folder-head open';
    head.textContent = folderName;
    head.onclick = () => toggleFolder(head);
    tree.appendChild(head);

    const children = document.createElement('div');
    children.className = 'gd-folder-children';

    groups[folderName].forEach(u => {
      const item = document.createElement('label');
      item.className = 'gd-file-item';
      item.dataset.filename = u.file.name; 

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = u.checked;
      cb.onchange = () => { u.checked = cb.checked; };

      const nameSpan = document.createElement('span');
      nameSpan.className = 'gd-file-name';
      nameSpan.textContent = u.file.name;

      if (Object.keys(u.meta).length > 0) {
        nameSpan.classList.add('meta-filled');
      } else {
        nameSpan.classList.add('meta-empty');
      }

      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'gd-file-size';
      sizeSpan.textContent = formatSize(u.file.size);

      item.append(cb, nameSpan, sizeSpan);
      children.appendChild(item);
    });

    tree.appendChild(children);
  });
}

function toggleFolder(el) {
  el.classList.toggle('open');
  const ch = el.nextElementSibling;
  if (ch) ch.style.display = el.classList.contains('open') ? '' : 'none';
}

function applyMetaToSelected() {
  const platformVal = document.getElementById('platform').value;
  const authorVal = document.getElementById('author').value.trim();
  const levelnameVal = document.getElementById('levelname').value.trim();
  const approxtimeVal = document.getElementById('approxtime').value;
  const status = document.getElementById('meta-status');

  if (!authorVal || !levelnameVal || !approxtimeVal) {
    status.textContent = 'X PLEASE FILL ALL FIELDS';
    status.className = 'gd-upload-status error';
    return;
  }

  const selectedCount = uploadedFiles.filter(u => u.checked).length;
  if (selectedCount === 0) {
    status.textContent = 'X NO FILES SELECTED';
    status.className = 'gd-upload-status error';
    return;
  }

  const meta = {
    platform:   platformVal,
    author:     authorVal,
    levelname:  levelnameVal,
    approxtime: approxtimeVal,
  };
  
  let count = 0;
  uploadedFiles.forEach(u => { 
    if (u.checked) {
      u.meta = { ...meta }; 
      count++;
    }
  });

  buildFileTree();

  status.textContent = `✔ APPLIED TO ${count} FILE${count!==1?'S':''}`;
  status.className = 'gd-upload-status success';
  setTimeout(() => { status.textContent = ''; status.className = 'gd-upload-status'; }, 2000);
}

async function submitUpload() {
  const login     = document.getElementById('login').value.trim();
  const userid    = document.getElementById('userid').value.trim();
  const status    = document.getElementById('s2-status');
  const btnSubmit = document.getElementById('btn-submit');
  const btnBack   = document.getElementById('btn-back-s2');

  const selected = uploadedFiles.filter(u => u.checked);
  if (selected.length === 0) {
    status.textContent = 'X NO FILES SELECTED';
    status.className = 'gd-upload-status error';
    return;
  }

  if (!login || !userid) {
    status.textContent = 'X PLEASE ENTER LOGIN AND ID';
    status.className = 'gd-upload-status error';
    return;
  }

  btnSubmit.disabled = true;
  btnBack.disabled   = true;
  status.textContent = 'PREPARING...';
  status.className   = 'gd-upload-status';

  try {
    if (MOCK_MODE) {
      await mockUpload(selected);
    } else {
      await realUpload(selected, login, userid);
    }
    showModal('LEVEL COMPLETE!<br>FILES UPLOADED!');
    status.textContent = '';
    setProgress('prog-overall', 0);
    setProgress('prog-current', 0);
  } catch (err) {
    status.textContent = 'X ' + (err.message || 'UPLOAD FAILED');
    status.className   = 'gd-upload-status error';
  } finally {
    btnSubmit.disabled = false;
    btnBack.disabled   = false;
  }
}

function mockUpload(files) {
  return new Promise(resolve => {
    const overallStatus = document.getElementById('upload-status');
    const s2Status      = document.getElementById('s2-status');
    let fileIdx = 0;

    function uploadNext() {
      if (fileIdx >= files.length) {
        setProgress('prog-overall', 100);
        setProgress('prog-current', 100);
        s2Status.textContent = `✔ ${files.length} FILE${files.length>1?'S':''} SENT`;
        s2Status.className   = 'gd-upload-status success';
        resolve();
        return;
      }
      const u = files[fileIdx];
      overallStatus.textContent = `UPLOADING ${fileIdx+1}/${files.length}: ${u.file.name}`;
      s2Status.textContent = `SENDING ${u.file.name}...`;
      setProgress('prog-overall', Math.round((fileIdx / files.length) * 100));
      setProgress('prog-current', 0);

      let pct = 0;
      const speed = Math.max(20, Math.min(80, Math.random()*60+20));
      const tick = setInterval(() => {
        pct += speed / 10;
        if (pct >= 100) {
          pct = 100;
          clearInterval(tick);
          setProgress('prog-current', 100);
          setProgress('prog-overall', Math.round(((fileIdx+1)/files.length)*100));
          fileIdx++;
          setTimeout(uploadNext, 300);
        } else {
          setProgress('prog-current', Math.round(pct));
        }
      }, 100);
    }
    uploadNext();
  });
}

async function realUpload(files, login, userid) {
  const overallStatus = document.getElementById('upload-status');
  const s2Status      = document.getElementById('s2-status');

  for (let i = 0; i < files.length; i++) {
    const u = files[i];
    overallStatus.textContent = `UPLOADING ${i+1}/${files.length}: ${u.file.name}`;
    s2Status.textContent = `SENDING ${u.file.name}...`;
    setProgress('prog-overall', Math.round((i / files.length) * 100));
    setProgress('prog-current', 0);

    const fd = new FormData();
    fd.append('file', u.file);
    fd.append('folder', u.folder);
    fd.append('login', login);
    fd.append('userid', userid);
    fd.append('meta', JSON.stringify({
      platform:   u.meta.platform   || document.getElementById('platform').value,
      author:     u.meta.author     || document.getElementById('author').value,
      levelname:  u.meta.levelname  || document.getElementById('levelname').value,
      approxtime: u.meta.approxtime || document.getElementById('approxtime').value,
    }));

    await uploadWithProgress(API_URL, fd, pct => setProgress('prog-current', pct));
    setProgress('prog-overall', Math.round(((i+1)/files.length)*100));
  }

  s2Status.textContent = `✔ ${files.length} FILE${files.length>1?'S':''} SENT`;
  s2Status.className   = 'gd-upload-status success';
}

function uploadWithProgress(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded/e.total)*100));
    };
    xhr.onload  = () => xhr.status >= 200 && xhr.status < 300
      ? resolve(xhr.response)
      : reject(new Error(`SERVER ERROR ${xhr.status}`));
    xhr.onerror = () => reject(new Error('NETWORK ERROR'));
    xhr.send(formData);
  });
}

function setProgress(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = pct + '%';
}

function showModal(html) {
  document.getElementById('modal-text').innerHTML = html;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
  uploadedFiles = [];
  renderChips();
  updateStep0UI();
  document.getElementById('fileInput').value = '';
  go(0);
}

updateStep0UI();

(function setMaxDate() {
  const dateInput = document.getElementById('approxtime');
  if (!dateInput) return;
  
  function getCurrentMaxDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  dateInput.addEventListener('change', function() {
    if (!this.value) return; 

    const currentMax = getCurrentMaxDate();

    if (this.value > currentMax) {
      this.value = currentMax;
    } 
    else if (this.value < "2010-01-01T00:00") {
      this.value = "2010-01-01T00:00";
    }
  });
})();

(function () {
  const tip = document.createElement('div');
  tip.id = 'gd-preview-tip';
  tip.style.cssText = [
    'position:fixed',
    'z-index:9000',
    'pointer-events:none',
    'display:none',
    'flex-direction:column',
    'align-items:center',
    'gap:8px',
    'max-width:260px',
    'padding:10px',
    'background:rgba(7,20,50,0.97)',
    'border:3px solid #000',
    'border-radius:3px',
    'box-shadow:0 4px 0 rgba(0,0,0,0.6),0 0 0 2px #b5ff5a55',
    'font-family:\'Press Start 2P\',monospace',
    'font-size:8px',
    'color:#ddffa0',
    'text-shadow:1px 1px 0 #000',
    'letter-spacing:0.5px',
  ].join(';');
  document.body.appendChild(tip);

  let vDown = false;
  let currentEntry = null;
  let mouseX = 0, mouseY = 0;
  let activeURL = null;
  let activeVideo = null;

  document.addEventListener('keydown', e => {
    if ((e.key === 'v' || e.key === 'V') && !e.repeat) {
      vDown = true;
      if (currentEntry) showPreview(currentEntry);
    }
  });
  document.addEventListener('keyup', e => {
    if (e.key === 'v' || e.key === 'V') {
      vDown = false;
      hideTip();
    }
  });

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (tip.style.display !== 'none') placeTip();
  });

  document.addEventListener('mouseover', e => {
    const item = e.target.closest('.gd-file-item');
    if (!item) return;
    const name = item.dataset.filename;
    currentEntry = name
      ? uploadedFiles.find(u => u.file.name === name) || null
      : null;
    if (vDown && currentEntry) showPreview(currentEntry);
  });

  document.addEventListener('mouseout', e => {
    const item = e.target.closest('.gd-file-item');
    if (!item) return;
    if (!item.contains(e.relatedTarget)) {
      currentEntry = null;
      if (vDown) hideTip();
    }
  });

  function showPreview(entry) {
    clearTip();
    const file = entry.file;
    const ext  = file.name.split('.').pop().toLowerCase();

    if (['png','jpg','jpeg','gif','webp'].includes(ext)) renderImage(file);
    else if (['mp4','mkv','webm','mov','avi'].includes(ext)) renderVideo(file);
    else renderFallback(file);
  }

  function hideTip() {
    tip.style.display = 'none';
    clearTip();
  }

  function clearTip() {
    if (activeVideo) { activeVideo.pause(); activeVideo.src = ''; activeVideo = null; }
    if (activeURL)   { URL.revokeObjectURL(activeURL); activeURL = null; }
    tip.innerHTML = '';
  }

  function placeTip() {
    const pad = 18;
    const tw  = tip.offsetWidth  || 260;
    const th  = tip.offsetHeight || 200;
    const ww  = window.innerWidth;
    const wh  = window.innerHeight;
    let x = mouseX + pad, y = mouseY + pad;
    if (x + tw > ww - pad) x = mouseX - tw - pad;
    if (y + th > wh - pad) y = mouseY - th - pad;
    if (x < pad) x = pad;
    if (y < pad) y = pad;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }

  function renderImage(file) {
    const url = URL.createObjectURL(file);
    activeURL  = url;
    const img  = document.createElement('img');
    img.src    = url;
    img.style.cssText = 'max-width:240px;max-height:180px;display:block;border:2px solid #000;image-rendering:pixelated;';
    img.onload = () => { tip.append(img, makeLabel(file)); tip.style.display = 'flex'; placeTip(); };
    img.onerror = () => { URL.revokeObjectURL(url); activeURL = null; renderFallback(file); };
  }

  function renderVideo(file) {
    const url = URL.createObjectURL(file);
    activeURL = url;
    const video = document.createElement('video');
    activeVideo = video;
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';
    video.style.cssText = 'max-width:240px;max-height:180px;display:block;border:2px solid #000;background:#000;';

    video.addEventListener('loadedmetadata', () => {
      if (activeVideo !== video) return;
      video.currentTime = Math.max(0.5, video.duration * 0.05);
    });

    video.addEventListener('seeked', () => {
      if (activeVideo !== video) return;
      tip.append(video, makeLabel(file));
      tip.style.display = 'flex';
      placeTip();
    }, { once: true });

    video.addEventListener('error', () => {
      if (activeVideo !== video) return;
      activeVideo = null;
      URL.revokeObjectURL(url);
      activeURL = null;
      renderFallback(file);
    });

    video.load();
  }

  function renderFallback(file) {
    const ext  = file.name.split('.').pop().toUpperCase();
    const icon = document.createElement('div');
    icon.style.cssText = [
      'width:64px', 'height:64px',
      'background:rgba(0,0,0,0.5)',
      'border:3px solid #b5ff5a',
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-size:11px', 'color:#b5ff5a',
      'text-shadow:1px 1px 0 #000', 'letter-spacing:1px',
    ].join(';');
    icon.textContent = ext;
    tip.append(icon, makeLabel(file));
    tip.style.display = 'flex';
    placeTip();
  }

  function makeLabel(file) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;max-width:240px;';

    const n = document.createElement('div');
    n.style.cssText = 'font-size:7px;color:#ddffa0;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;';
    n.textContent = file.name;

    const s = document.createElement('div');
    s.style.cssText = 'font-size:7px;color:rgba(255,255,255,0.35);';
    s.textContent = fmtSize(file.size);

    wrap.append(n, s);
    return wrap;
  }

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }

})();