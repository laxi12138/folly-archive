(() => {
  const data = window.RUINWRIGHT_MECHANICS;
  const RL = window.RuinLanguage;
  if (!data || !RL) return;

  const UI = {
    title:{zh:'墟构机械数据库',en:'Ruinwright Mechanism Archive',ja:'墟構機械データベース'},
    manifesto:{zh:'墟构师宣言 ↗',en:'Manifesto ↗',ja:'墟構師宣言 ↗'},
    archive:{zh:'遗构馆 ↗',en:'Relic Archive ↗',ja:'遺構館 ↗'},
    classification:{zh:'分类',en:'Classification',ja:'分類'},
    allRecords:{zh:'全部档案',en:'All records',ja:'全記録'},
    selectRecord:{zh:'选择左侧机械档案',en:'Select a record on the left',ja:'左の機械記録を選択'},
    nothingSelected:{zh:'未选择机械档案',en:'No record selected',ja:'機械記録が未選択'},
    loadOnSelect:{zh:'图纸文件只在被选中时加载。',en:'A drawing loads only after selection.',ja:'図面は選択したときだけ読み込みます。'},
    missing:{zh:'图纸文件缺失',en:'Drawing file missing',ja:'図面ファイルがありません'},
    loading:{zh:'正在加载图纸…',en:'Loading drawing…',ja:'図面を読み込み中…'},
    sample:{zh:'示例档案',en:'Sample record',ja:'サンプル記録'},
    collapse:{zh:'折叠',en:'Collapse',ja:'折りたたむ'},
    expand:{zh:'展开',en:'Expand',ja:'展開'}
  };

  const tree = document.getElementById('taxonomy-tree');
  const recordsEl = document.getElementById('mechanism-records');
  const filterLabel = document.getElementById('record-filter-label');
  const sheetVisual = document.getElementById('sheet-visual');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetNote = document.getElementById('sheet-note');
  const sheetTags = document.getElementById('sheet-tags');
  const allBtn = document.querySelector('.taxonomy-all');

  const nodeById = new Map();
  let lang = RL.read();
  let activeFilter = 'all';
  let activeRecord = null;
  let imageToken = 0;

  const local = value => typeof value === 'string' ? value : (value?.[lang] ?? value?.zh ?? '');
  const labelForTag = tag => local(data.tagLabels[tag] || tag);

  function descendantTags(node) {
    if (node.tag) return [node.tag];
    return [...new Set((node.children || []).flatMap(descendantTags))];
  }

  function indexNodes(nodes) {
    nodes.forEach(node => {
      nodeById.set(node.id, node);
      if (node.children) indexNodes(node.children);
    });
  }
  indexNodes(data.taxonomy);

  function renderTree() {
    tree.replaceChildren();

    function renderNode(node) {
      const wrap = document.createElement('div');
      wrap.className = `taxonomy-node ${node.children ? 'taxonomy-node-branch' : 'taxonomy-node-leaf'}`;
      wrap.dataset.nodeId = node.id;

      const row = document.createElement('div');
      row.className = 'taxonomy-row';

      if (node.children) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'taxonomy-toggle';
        toggle.textContent = '−';
        toggle.setAttribute('aria-label', `${UI.collapse[lang]} ${local(node.label)}`);
        toggle.addEventListener('click', event => {
          event.stopPropagation();
          const collapsed = wrap.classList.toggle('collapsed');
          toggle.textContent = collapsed ? '+' : '−';
          toggle.setAttribute('aria-label', `${collapsed ? UI.expand[lang] : UI.collapse[lang]} ${local(node.label)}`);
        });
        row.appendChild(toggle);
      }

      const filter = document.createElement('button');
      filter.type = 'button';
      filter.className = 'taxonomy-filter';
      filter.dataset.filter = node.id;
      filter.textContent = local(node.label);
      filter.classList.toggle('active', activeFilter === node.id);
      row.appendChild(filter);
      wrap.appendChild(row);

      if (node.children) {
        const children = document.createElement('div');
        children.className = 'taxonomy-node-children';
        node.children.forEach(child => children.appendChild(renderNode(child)));
        wrap.appendChild(children);
      }
      return wrap;
    }

    data.taxonomy.forEach(node => tree.appendChild(renderNode(node)));
  }

  function filterTags(filterId) {
    if (filterId === 'all') return null;
    const node = nodeById.get(filterId);
    return node ? descendantTags(node) : [filterId];
  }

  function matches(record, filterId) {
    const tags = filterTags(filterId);
    return !tags || record.tags.some(tag => tags.includes(tag));
  }

  function setFilter(filterId) {
    activeFilter = filterId;
    allBtn.classList.toggle('active', filterId === 'all');
    renderTree();
    const node = nodeById.get(filterId);
    filterLabel.textContent = filterId === 'all' ? UI.allRecords[lang] : local(node?.label);
    renderRecords();
  }

  allBtn.addEventListener('click', () => setFilter('all'));
  tree.addEventListener('click', event => {
    const btn = event.target.closest('.taxonomy-filter');
    if (btn) setFilter(btn.dataset.filter);
  });

  function renderRecords() {
    const filtered = data.records.filter(record => matches(record, activeFilter));
    recordsEl.replaceChildren();
    const frag = document.createDocumentFragment();

    filtered.forEach(record => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mechanism-record';
      button.dataset.recordCode = record.code;
      if (activeRecord?.code === record.code) button.classList.add('active');

      const title = document.createElement('span');
      title.className = 'record-title';
      title.textContent = local(record.title);

      // v74: the list is deliberately reduced to one line per mechanism.
      // Codes and tag previews remain in the data model but are not repeated
      // in the browsing column; the selected sheet still carries its tags.
      button.append(title);
      button.addEventListener('click', () => selectRecord(record));
      frag.appendChild(button);
    });
    recordsEl.appendChild(frag);
  }

  function renderSheetTags(record) {
    sheetTags.replaceChildren();
    record.tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sheet-tag';
      btn.textContent = labelForTag(tag);
      const matchingNode = [...nodeById.values()].find(node => node.tag === tag);
      btn.addEventListener('click', () => setFilter(matchingNode?.id || tag));
      sheetTags.appendChild(btn);
    });
  }

  function emptyVisual(message) {
    sheetVisual.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty-drawing';
    const symbol = document.createElement('span');
    symbol.className = 'empty-symbol';
    const small = document.createElement('small');
    small.textContent = message;
    empty.append(symbol, small);
    sheetVisual.appendChild(empty);
  }

  function selectRecord(record) {
    activeRecord = record;
    const token = ++imageToken;
    sheetTitle.textContent = local(record.title);
    sheetNote.textContent = local(record.note) || UI.sample[lang];
    renderSheetTags(record);
    renderRecords();

    if (!record.image) {
      emptyVisual(UI.selectRecord[lang]);
      history.replaceState(null, '', `#${record.code}`);
      return;
    }

    sheetVisual.innerHTML = `<div class="sheet-loading">${UI.loading[lang]}</div>`;
    const img = new Image();
    img.alt = local(record.title);
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', () => {
      if (token !== imageToken || activeRecord?.code !== record.code) return;
      sheetVisual.replaceChildren(img);
    }, {once:true});
    img.addEventListener('error', () => {
      if (token !== imageToken || activeRecord?.code !== record.code) return;
      emptyVisual(UI.missing[lang]);
    }, {once:true});
    img.src = record.image;
    history.replaceState(null, '', `#${record.code}`);
  }

  function refreshLanguage(nextLang, animated) {
    lang = nextLang;
    RL.applyMap(UI, lang, document, animated);
    document.title = UI.title[lang];
    renderTree();
    filterLabel.textContent = activeFilter === 'all'
      ? UI.allRecords[lang]
      : local(nodeById.get(activeFilter)?.label);
    renderRecords();

    if (activeRecord) {
      sheetTitle.textContent = local(activeRecord.title);
      sheetNote.textContent = local(activeRecord.note) || UI.sample[lang];
      renderSheetTags(activeRecord);
      if (!activeRecord.image) emptyVisual(UI.selectRecord[lang]);
    } else {
      sheetTitle.textContent = UI.nothingSelected[lang];
      sheetNote.textContent = UI.loadOnSelect[lang];
      emptyVisual(UI.selectRecord[lang]);
    }
  }

  window.addEventListener('ruinlanguagechange', event => {
    document.body.classList.add('language-changing');
    refreshLanguage(event.detail.lang, event.detail.animated);
    setTimeout(() => document.body.classList.remove('language-changing'), 260);
  });

  RL.bind();
  refreshLanguage(RL.read(), false);

  if (location.hash) {
    const code = decodeURIComponent(location.hash.slice(1));
    const record = data.records.find(item => item.code === code);
    if (record) selectRecord(record);
  }
})();