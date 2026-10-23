/**
 * Maraluxe Resort and Spa — Content Management & Price Editor
 * 
 * Non-developer friendly menu administration logic.
 * Handles PIN security, visual item updates, category filtering,
 * live metrics calculation, and one-click data file export.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Security & Configuration Constants
     ========================================================================== */
  const ADMIN_PIN = 'Maraluxe2026!';
  const AUTH_STORAGE_KEY = 'maraluxe_admin_auth';
  const DRAFT_STORAGE_KEY = 'maraluxe_menu_draft';

  // Signature cocktail asset mapping to preserve clean references
  const COCKTAIL_IMAGE_KEYS = {
    'Maraluxe Coconut Velvet': { t: 'cocktails.coconutVelvetThumb', f: 'cocktails.coconutVelvetFull' },
    'Maraluxe Mango Splash': { t: 'cocktails.mangoSplashThumb', f: 'null' },
    'Maraluxe Oasis': { t: 'cocktails.oasisThumb', f: 'null' },
    'Maraluxe Strawberry Bliss': { t: 'cocktails.strawberryBlissThumb', f: 'null' },
    'Maraluxe Tropical Sunset': { t: 'cocktails.tropicalSunsetThumb', f: 'null' }
  };

  /* ==========================================================================
     2. Application State
     ========================================================================== */
  let originalData = null;
  let workingData = null;
  let activeCategoryFilter = 'ALL';
  let activeGroupFilter = 'ALL';
  let activeStatusFilter = 'ALL';
  let searchQuery = '';
  let pendingDeleteTarget = null; // { groupIdx, catIdx, itemIdx, name }

  const modifiedItemsSet = new Set(); // Stores unique item identifiers that were changed

  /* ==========================================================================
     3. DOM Element References
     ========================================================================== */
  // PIN Gate
  const pinGateModalEl = document.getElementById('pinGateModal');
  const pinCardEl = document.getElementById('pinCard');
  const pinFormEl = document.getElementById('pinForm');
  const pinInputEl = document.getElementById('pinInput');
  const pinToggleBtnEl = document.getElementById('pinToggleBtn');
  const pinErrorMsgEl = document.getElementById('pinErrorMsg');
  const logoutBtnEl = document.getElementById('logoutBtn');

  // Metrics
  const metricTotalItemsEl = document.getElementById('metricTotalItems');
  const metricTotalCategoriesEl = document.getElementById('metricTotalCategories');
  const metricModifiedCountEl = document.getElementById('metricModifiedCount');
  const metricOutOfStockCountEl = document.getElementById('metricOutOfStockCount');

  // Toolbar
  const adminSearchInputEl = document.getElementById('adminSearchInput');
  const searchClearBtnEl = document.getElementById('searchClearBtn');
  const groupFilterSelectEl = document.getElementById('groupFilterSelect');
  const statusFilterSelectEl = document.getElementById('statusFilterSelect');
  const categoryFilterPillsEl = document.getElementById('categoryFilterPills');
  const openAddModalBtnEl = document.getElementById('openAddModalBtn');

  // Content Container
  const inventoryContainerEl = document.getElementById('inventoryContainer');

  // Sticky Action Bar
  const statusDotEl = document.getElementById('statusDot');
  const statusMessageEl = document.getElementById('statusMessage');
  const statusSubtextEl = document.getElementById('statusSubtext');
  const discardChangesBtnEl = document.getElementById('discardChangesBtn');
  const previewCodeBtnEl = document.getElementById('previewCodeBtn');
  const downloadDataBtnEl = document.getElementById('downloadDataBtn');

  // Add Item Modal
  const addDrinkModalEl = document.getElementById('addDrinkModal');
  const addDrinkFormEl = document.getElementById('addDrinkForm');
  const newItemNameEl = document.getElementById('newItemName');
  const newItemCategoryEl = document.getElementById('newItemCategory');
  const newItemTagEl = document.getElementById('newItemTag');
  const newItemOptionLabelEl = document.getElementById('newItemOptionLabel');
  const newItemPriceEl = document.getElementById('newItemPrice');
  const newItemDescEl = document.getElementById('newItemDesc');
  const cancelAddBtnEl = document.getElementById('cancelAddBtn');

  // Confirm Delete Modal
  const confirmDeleteModalEl = document.getElementById('confirmDeleteModal');
  const deleteConfirmPromptEl = document.getElementById('deleteConfirmPrompt');
  const confirmDeleteBtnEl = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtnEl = document.getElementById('cancelDeleteBtn');

  // Code Preview Modal
  const previewModalEl = document.getElementById('previewModal');
  const previewCodeContentEl = document.getElementById('previewCodeContent');
  const closePreviewBtnEl = document.getElementById('closePreviewBtn');
  const downloadFromPreviewBtnEl = document.getElementById('downloadFromPreviewBtn');

  // Toast Container
  const toastContainerEl = document.getElementById('toastContainer');

  /* ==========================================================================
     4. Helper Functions & UI Utilities
     ========================================================================== */

  /**
   * Shows a temporary toast message.
   */
  function showToast(message, icon) {
    const toast = document.createElement('div');
    toast.className = 'toast';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast__icon';
    iconSpan.textContent = icon || '✨';
    toast.appendChild(iconSpan);

    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast__message';
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    toastContainerEl.appendChild(toast);

    // Trigger transition
    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3800);
  }

  /**
   * Generates a stable unique identifier for an item.
   */
  function getItemKey(groupIdx, catIdx, itemIdx) {
    return `${groupIdx}_${catIdx}_${itemIdx}`;
  }

  /**
   * Formats numbers with thousand comma separators.
   */
  function formatNumber(num) {
    return Number(num || 0).toLocaleString();
  }

  /* ==========================================================================
     5. Authentication Gate Logic
     ========================================================================== */
  function checkAuthentication() {
    let isAuthenticated = false;
    try {
      isAuthenticated = window.sessionStorage.getItem(AUTH_STORAGE_KEY) === '1';
    } catch (e) {
      isAuthenticated = false;
    }

    if (isAuthenticated) {
      pinGateModalEl.hidden = true;
    } else {
      pinGateModalEl.hidden = false;
      pinInputEl.value = '';
      pinErrorMsgEl.textContent = '';
      setTimeout(function () {
        pinInputEl.focus();
      }, 100);
    }
  }

  function setupAuthenticationListeners() {
    pinFormEl.addEventListener('submit', function (event) {
      event.preventDefault();
      const enteredPin = pinInputEl.value.trim();

      if (enteredPin === ADMIN_PIN) {
        try {
          window.sessionStorage.setItem(AUTH_STORAGE_KEY, '1');
        } catch (e) {}

        pinGateModalEl.hidden = true;
        showToast('Welcome to Maraluxe Bar Menu Manager', '🍸');
      } else {
        pinErrorMsgEl.textContent = 'Incorrect PIN. Please try again.';
        pinCardEl.classList.add('shake');
        setTimeout(function () {
          pinCardEl.classList.remove('shake');
        }, 400);
      }
    });

    pinToggleBtnEl.addEventListener('click', function () {
      const isPassword = pinInputEl.type === 'password';
      pinInputEl.type = isPassword ? 'text' : 'password';
      pinToggleBtnEl.textContent = isPassword ? '🙈' : '👁️';
    });

    logoutBtnEl.addEventListener('click', function () {
      try {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {}
      checkAuthentication();
      showToast('Dashboard locked', '🔒');
    });
  }

  /* ==========================================================================
     6. State Initialization & Draft Management
     ========================================================================== */
  function initializeData() {
    if (window.MARALUXE_MENU_DATA) {
      originalData = JSON.parse(JSON.stringify(window.MARALUXE_MENU_DATA));
    } else {
      // Fallback empty structure
      originalData = {
        venue: 'Maraluxe Resort and Spa',
        menu: 'bar',
        currency: 'KES',
        currencyLabel: 'Ksh.',
        groups: []
      };
    }

    // Check for existing draft in localStorage
    let savedDraft = null;
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        savedDraft = JSON.parse(rawDraft);
      }
    } catch (e) {}

    if (savedDraft && Array.isArray(savedDraft.groups)) {
      workingData = savedDraft;
      showToast('Restored your previous unsaved draft session', '📝');
    } else {
      workingData = JSON.parse(JSON.stringify(originalData));
    }

    // Hydrate brand logos if assets available
    if (window.MARALUXE_ASSETS && window.MARALUXE_ASSETS.logo) {
      document.querySelectorAll('.brand-logo').forEach(function (img) {
        img.src = window.MARALUXE_ASSETS.logo;
      });
    }

    populateGroupFilterDropdown();
    populateCategoryAddDropdown();
    renderCategoryFilterPills();
    renderInventory();
    updateMetrics();
  }

  function saveDraftToStorage() {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(workingData));
    } catch (e) {}
    updateMetrics();
  }

  function clearDraftStorage() {
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
  }

  /* ==========================================================================
     7. Metrics & Status Updates
     ========================================================================== */
  function updateMetrics() {
    let totalItems = 0;
    let totalCategories = 0;
    let outOfStockCount = 0;

    if (workingData && Array.isArray(workingData.groups)) {
      workingData.groups.forEach(function (group) {
        if (Array.isArray(group.categories)) {
          totalCategories += group.categories.length;
          group.categories.forEach(function (category) {
            if (Array.isArray(category.items)) {
              totalItems += category.items.length;
              category.items.forEach(function (item) {
                if (item.outOfStock || (Array.isArray(item.tags) && item.tags.includes('Out of Stock'))) {
                  outOfStockCount++;
                }
              });
            }
          });
        }
      });
    }

    metricTotalItemsEl.textContent = totalItems;
    metricTotalCategoriesEl.textContent = totalCategories;
    metricModifiedCountEl.textContent = modifiedItemsSet.size;
    metricOutOfStockCountEl.textContent = outOfStockCount;

    // Sticky Bar Status
    if (modifiedItemsSet.size > 0) {
      statusDotEl.className = 'status-dot status-dot--unsaved';
      statusMessageEl.textContent = `${modifiedItemsSet.size} item${modifiedItemsSet.size > 1 ? 's' : ''} modified in this session`;
      statusSubtextEl.textContent = 'Ready to download updated data file';
      discardChangesBtnEl.disabled = false;
    } else {
      statusDotEl.className = 'status-dot';
      statusMessageEl.textContent = 'All menu items are current';
      statusSubtextEl.textContent = 'No unsaved adjustments';
      discardChangesBtnEl.disabled = true;
    }
  }

  /* ==========================================================================
     8. Filter Dropdowns & Category Pills
     ========================================================================== */
  function populateGroupFilterDropdown() {
    groupFilterSelectEl.replaceChildren();

    const allOpt = document.createElement('option');
    allOpt.value = 'ALL';
    allOpt.textContent = 'All Menu Groups';
    groupFilterSelectEl.appendChild(allOpt);

    if (workingData && Array.isArray(workingData.groups)) {
      workingData.groups.forEach(function (g) {
        const opt = document.createElement('option');
        opt.value = g.name;
        opt.textContent = g.name + (g.hidden ? ' (Hidden)' : '');
        groupFilterSelectEl.appendChild(opt);
      });
    }
  }

  function populateCategoryAddDropdown() {
    newItemCategoryEl.replaceChildren();

    if (workingData && Array.isArray(workingData.groups)) {
      workingData.groups.forEach(function (group, gIdx) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = group.name;

        group.categories.forEach(function (cat, cIdx) {
          const opt = document.createElement('option');
          opt.value = `${gIdx}_${cIdx}`;
          opt.textContent = cat.name;
          optGroup.appendChild(opt);
        });

        newItemCategoryEl.appendChild(optGroup);
      });
    }
  }

  function renderCategoryFilterPills() {
    categoryFilterPillsEl.replaceChildren();

    // "All" Pill
    const allPill = document.createElement('button');
    allPill.type = 'button';
    allPill.className = 'pill-btn' + (activeCategoryFilter === 'ALL' ? ' pill-btn--active' : '');
    allPill.textContent = 'All Categories';
    allPill.addEventListener('click', function () {
      activeCategoryFilter = 'ALL';
      renderCategoryFilterPills();
      renderInventory();
    });
    categoryFilterPillsEl.appendChild(allPill);

    if (workingData && Array.isArray(workingData.groups)) {
      workingData.groups.forEach(function (group) {
        if (activeGroupFilter !== 'ALL' && group.name !== activeGroupFilter) {
          return;
        }

        group.categories.forEach(function (cat) {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'pill-btn' + (activeCategoryFilter === cat.name ? ' pill-btn--active' : '');

          const titleSpan = document.createElement('span');
          titleSpan.textContent = cat.name;
          pill.appendChild(titleSpan);

          const countSpan = document.createElement('span');
          countSpan.className = 'pill-btn__count';
          countSpan.textContent = cat.items ? cat.items.length : 0;
          pill.appendChild(countSpan);

          pill.addEventListener('click', function () {
            activeCategoryFilter = cat.name;
            renderCategoryFilterPills();
            renderInventory();
          });

          categoryFilterPillsEl.appendChild(pill);
        });
      });
    }
  }

  /* ==========================================================================
     9. Inventory Rendering Engine
     ========================================================================== */
  function renderInventory() {
    inventoryContainerEl.replaceChildren();

    if (!workingData || !Array.isArray(workingData.groups)) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.textContent = 'No menu data available.';
      inventoryContainerEl.appendChild(emptyMsg);
      return;
    }

    let renderedItemsCount = 0;

    workingData.groups.forEach(function (group, gIdx) {
      if (activeGroupFilter !== 'ALL' && group.name !== activeGroupFilter) {
        return;
      }

      group.categories.forEach(function (category, cIdx) {
        if (activeCategoryFilter !== 'ALL' && category.name !== activeCategoryFilter) {
          return;
        }

        // Filter items based on search and status
        const matchingItems = [];
        category.items.forEach(function (item, iIdx) {
          const itemKey = getItemKey(gIdx, cIdx, iIdx);
          const isModified = modifiedItemsSet.has(itemKey);
          const isOutOfStock = Boolean(item.outOfStock || (Array.isArray(item.tags) && item.tags.includes('Out of Stock')));

          // Status filter check
          if (activeStatusFilter === 'MODIFIED' && !isModified) return;
          if (activeStatusFilter === 'OUT_OF_STOCK' && !isOutOfStock) return;
          if (activeStatusFilter === 'IN_STOCK' && isOutOfStock) return;

          // Search query check
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = item.name.toLowerCase().includes(query);
            const tagMatch = item.tags && item.tags.some(function (t) { return t.toLowerCase().includes(query); });
            const catMatch = category.name.toLowerCase().includes(query);
            if (!nameMatch && !tagMatch && !catMatch) {
              return;
            }
          }

          matchingItems.push({ item: item, iIdx: iIdx, key: itemKey, isModified: isModified, isOutOfStock: isOutOfStock });
        });

        if (matchingItems.length === 0) {
          return;
        }

        renderedItemsCount += matchingItems.length;

        // Group & Category Container
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'menu-group-wrapper';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'menu-group-header';

        const titleDiv = document.createElement('h3');
        titleDiv.className = 'menu-group-title';
        titleDiv.textContent = `${group.name} — ${category.name}`;

        const chip = document.createElement('span');
        chip.className = 'category-badge-chip';
        chip.textContent = `${matchingItems.length} item${matchingItems.length > 1 ? 's' : ''}`;
        titleDiv.appendChild(chip);

        headerDiv.appendChild(titleDiv);
        groupWrapper.appendChild(headerDiv);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'items-grid';

        matchingItems.forEach(function (matchObj) {
          const itemCard = createItemCard(matchObj.item, gIdx, cIdx, matchObj.iIdx, matchObj.key, matchObj.isModified, matchObj.isOutOfStock);
          gridDiv.appendChild(itemCard);
        });

        groupWrapper.appendChild(gridDiv);
        inventoryContainerEl.appendChild(groupWrapper);
      });
    });

    if (renderedItemsCount === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.padding = '60px 20px';
      emptyDiv.style.color = 'var(--admin-text-muted)';
      emptyDiv.innerHTML = `<p style="font-size: 18px; margin-bottom: 8px;">No drinks matched your current filter.</p>
        <p style="font-size: 13.5px;">Try clearing your search query or selecting "All Categories".</p>`;
      inventoryContainerEl.appendChild(emptyDiv);
    }
  }

  /**
   * Constructs an individual editable item card row.
   */
  function createItemCard(item, gIdx, cIdx, iIdx, itemKey, isModified, isOutOfStock) {
    const card = document.createElement('div');
    card.className = 'item-card' +
      (isModified ? ' item-card--modified' : '') +
      (isOutOfStock ? ' item-card--out-of-stock' : '');

    // 1. Thumbnail / Beverage Icon Box
    const thumbBox = document.createElement('div');
    thumbBox.className = 'item-card__thumb-box';

    if (item.image && item.image.t) {
      const img = document.createElement('img');
      img.className = 'item-card__thumb-img';
      img.src = item.image.t;
      img.alt = item.name;
      thumbBox.appendChild(img);
    } else {
      thumbBox.textContent = '🍸';
    }
    card.appendChild(thumbBox);

    // 2. Name & Details Column
    const detailsCol = document.createElement('div');
    detailsCol.className = 'item-card__details';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'item-card__name-input';
    nameInput.value = item.name;
    nameInput.title = 'Click to edit item name';

    nameInput.addEventListener('change', function () {
      const trimmed = nameInput.value.trim();
      if (trimmed && trimmed !== item.name) {
        item.name = trimmed;
        modifiedItemsSet.add(itemKey);
        card.classList.add('item-card--modified');
        saveDraftToStorage();
        showToast(`Updated name to "${trimmed}"`, '✏️');
      }
    });
    detailsCol.appendChild(nameInput);

    // Metadata tags
    const metaRow = document.createElement('div');
    metaRow.className = 'item-card__meta-row';

    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(function (tag) {
        if (tag === 'Out of Stock') return;
        const tagSpan = document.createElement('span');
        tagSpan.className = 'item-card__tag' + (tag === 'Signature' ? ' item-card__tag--gold' : '');
        tagSpan.textContent = tag;
        metaRow.appendChild(tagSpan);
      });
    }

    if (isOutOfStock) {
      const outTag = document.createElement('span');
      outTag.className = 'item-card__tag item-card__tag--stock-out';
      outTag.textContent = 'Out of Stock';
      metaRow.appendChild(outTag);
    }

    if (isModified) {
      const modTag = document.createElement('span');
      modTag.className = 'item-card__tag item-card__tag--gold';
      modTag.textContent = 'Modified';
      metaRow.appendChild(modTag);
    }

    detailsCol.appendChild(metaRow);
    card.appendChild(detailsCol);

    // 3. Pricing & Volume Options Column
    const pricingCol = document.createElement('div');
    pricingCol.className = 'item-card__pricing-group';

    if (Array.isArray(item.options)) {
      item.options.forEach(function (opt, oIdx) {
        const optionRow = document.createElement('div');
        optionRow.className = 'option-row';

        // Volume / Option Label
        if (item.options.length > 1 || opt.label) {
          const labelInput = document.createElement('input');
          labelInput.type = 'text';
          labelInput.className = 'option-row__label-input';
          labelInput.value = opt.label || '';
          labelInput.placeholder = 'Size (e.g. 750ml)';
          labelInput.title = 'Size or volume label';

          labelInput.addEventListener('change', function () {
            opt.label = labelInput.value.trim();
            modifiedItemsSet.add(itemKey);
            card.classList.add('item-card--modified');
            saveDraftToStorage();
          });

          optionRow.appendChild(labelInput);
        }

        // Price Input
        const priceWrapper = document.createElement('div');
        priceWrapper.className = 'option-row__price-wrapper';

        const currSpan = document.createElement('span');
        currSpan.className = 'option-row__currency';
        currSpan.textContent = 'Ksh';
        priceWrapper.appendChild(currSpan);

        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.className = 'option-row__price-input';
        priceInput.value = opt.price;
        priceInput.min = '0';
        priceInput.step = '10';
        priceInput.title = 'Edit price in Ksh.';

        priceInput.addEventListener('change', function () {
          const newPrice = parseFloat(priceInput.value);
          if (!isNaN(newPrice) && newPrice >= 0 && newPrice !== opt.price) {
            opt.price = newPrice;
            modifiedItemsSet.add(itemKey);
            card.classList.add('item-card--modified');
            saveDraftToStorage();
            showToast(`${item.name} price updated to Ksh. ${formatNumber(newPrice)}`, '💰');
          }
        });

        priceWrapper.appendChild(priceInput);
        optionRow.appendChild(priceWrapper);

        pricingCol.appendChild(optionRow);
      });
    }

    card.appendChild(pricingCol);

    // 4. Action Controls Column
    const controlsCol = document.createElement('div');
    controlsCol.className = 'item-card__controls';

    // Out of Stock Toggle Button
    const outToggleBtn = document.createElement('button');
    outToggleBtn.type = 'button';
    outToggleBtn.className = 'status-toggle-btn' + (isOutOfStock ? ' status-toggle-btn--out' : '');
    outToggleBtn.title = isOutOfStock ? 'Mark item back in stock' : 'Mark item out of stock';
    outToggleBtn.textContent = isOutOfStock ? '🚫 Unavailable' : '✅ In Stock';

    outToggleBtn.addEventListener('click', function () {
      if (!item.tags) item.tags = [];
      const tagIdx = item.tags.indexOf('Out of Stock');

      if (isOutOfStock) {
        if (tagIdx !== -1) item.tags.splice(tagIdx, 1);
        item.outOfStock = false;
        showToast(`${item.name} marked back In Stock`, '✅');
      } else {
        if (tagIdx === -1) item.tags.push('Out of Stock');
        item.outOfStock = true;
        showToast(`${item.name} marked Out of Stock`, '🚫');
      }

      modifiedItemsSet.add(itemKey);
      saveDraftToStorage();
      renderInventory();
    });
    controlsCol.appendChild(outToggleBtn);

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn--danger-ghost btn--icon-only';
    deleteBtn.title = 'Delete item from menu';
    deleteBtn.textContent = '🗑️';

    deleteBtn.addEventListener('click', function () {
      openDeleteConfirmModal(gIdx, cIdx, iIdx, item.name);
    });
    controlsCol.appendChild(deleteBtn);

    card.appendChild(controlsCol);

    return card;
  }

  /* ==========================================================================
     10. Add New Drink Modal Controllers
     ========================================================================== */
  function setupAddDrinkModal() {
    openAddModalBtnEl.addEventListener('click', function () {
      populateCategoryAddDropdown();
      newItemNameEl.value = '';
      newItemTagEl.value = '';
      newItemOptionLabelEl.value = '';
      newItemPriceEl.value = '';
      newItemDescEl.value = '';
      addDrinkModalEl.hidden = false;
      setTimeout(function () {
        newItemNameEl.focus();
      }, 100);
    });

    cancelAddBtnEl.addEventListener('click', function () {
      addDrinkModalEl.hidden = true;
    });

    addDrinkFormEl.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = newItemNameEl.value.trim();
      const catVal = newItemCategoryEl.value; // "gIdx_cIdx"
      const price = parseFloat(newItemPriceEl.value);
      const optionLabel = newItemOptionLabelEl.value.trim();
      const tag = newItemTagEl.value.trim();
      const desc = newItemDescEl.value.trim();

      if (!name || isNaN(price) || price <= 0 || !catVal) {
        showToast('Please provide a valid name and price', '⚠️');
        return;
      }

      const parts = catVal.split('_');
      const gIdx = parseInt(parts[0], 10);
      const cIdx = parseInt(parts[1], 10);

      const targetGroup = workingData.groups[gIdx];
      const targetCat = targetGroup && targetGroup.categories[cIdx];

      if (!targetCat) {
        showToast('Selected category not found', '❌');
        return;
      }

      const newItem = {
        name: name,
        options: [
          {
            label: optionLabel || '',
            price: price
          }
        ]
      };

      if (tag) {
        newItem.tags = [tag];
      }

      if (desc) {
        newItem.description = desc;
      }

      targetCat.items.push(newItem);

      const newKey = getItemKey(gIdx, cIdx, targetCat.items.length - 1);
      modifiedItemsSet.add(newKey);

      addDrinkModalEl.hidden = true;
      saveDraftToStorage();
      renderCategoryFilterPills();
      renderInventory();
      showToast(`Added "${name}" to ${targetCat.name}`, '🎉');
    });
  }

  /* ==========================================================================
     11. Delete Item Confirmation Modal
     ========================================================================== */
  function openDeleteConfirmModal(gIdx, cIdx, iIdx, itemName) {
    pendingDeleteTarget = { gIdx: gIdx, cIdx: cIdx, iIdx: iIdx, name: itemName };
    deleteConfirmPromptEl.textContent = `Are you sure you want to remove "${itemName}" from the menu? This action can be undone by clicking "Discard Changes" before downloading.`;
    confirmDeleteModalEl.hidden = false;
  }

  function setupDeleteConfirmModal() {
    cancelDeleteBtnEl.addEventListener('click', function () {
      confirmDeleteModalEl.hidden = true;
      pendingDeleteTarget = null;
    });

    confirmDeleteBtnEl.addEventListener('click', function () {
      if (!pendingDeleteTarget) return;

      const { gIdx, cIdx, iIdx, name } = pendingDeleteTarget;
      const targetCat = workingData.groups[gIdx] && workingData.groups[gIdx].categories[cIdx];

      if (targetCat && targetCat.items) {
        targetCat.items.splice(iIdx, 1);
        modifiedItemsSet.add(`del_${Date.now()}`); // Mark session as dirty
        saveDraftToStorage();
        renderCategoryFilterPills();
        renderInventory();
        showToast(`Removed "${name}" from menu`, '🗑️');
      }

      confirmDeleteModalEl.hidden = true;
      pendingDeleteTarget = null;
    });
  }

  /* ==========================================================================
     12. Data File Generator & Download Logic
     ========================================================================== */

  /**
   * Generates production-ready, clean, 2-space indented JavaScript code
   * for menu-data.js while preserving cocktail image references.
   */
  function generateMenuDataJsCode() {
    // Clone state so we can normalize before stringifying
    const exportData = JSON.parse(JSON.stringify(workingData));

    // Placeholder tokens for signature cocktail images
    const placeholderMap = {};

    if (Array.isArray(exportData.groups)) {
      exportData.groups.forEach(function (group) {
        group.categories.forEach(function (category) {
          category.items.forEach(function (item) {
            // Clean up internal flags if any
            delete item.outOfStock;

            // Preserve signature cocktail asset references
            if (COCKTAIL_IMAGE_KEYS[item.name]) {
              const placeholderT = `__ASSET_T_${Math.random().toString(36).substring(2, 9)}__`;
              const placeholderF = `__ASSET_F_${Math.random().toString(36).substring(2, 9)}__`;

              placeholderMap[placeholderT] = COCKTAIL_IMAGE_KEYS[item.name].t;
              placeholderMap[placeholderF] = COCKTAIL_IMAGE_KEYS[item.name].f;

              item.image = {
                t: placeholderT,
                f: placeholderF
              };
            }
          });
        });
      });
    }

    let jsonString = JSON.stringify(exportData, null, 2);

    // Replace placeholder tokens with raw JS variables
    Object.keys(placeholderMap).forEach(function (token) {
      const rawCode = placeholderMap[token];
      jsonString = jsonString.split('"' + token + '"').join(rawCode);
    });

    // Indent JSON 2 spaces to align within the IIFE
    const indentedJson = jsonString
      .split('\n')
      .map(function (line) { return '  ' + line; })
      .join('\n');

    return `(function () {
  'use strict';

  function deepFreeze(target) {
    if (target && typeof target === 'object' && !Object.isFrozen(target)) {
      Object.freeze(target);
      Object.keys(target).forEach(function (key) {
        deepFreeze(target[key]);
      });
    }
    return target;
  }

  const cocktails = (window.MARALUXE_ASSETS && window.MARALUXE_ASSETS.cocktails) || {};

  window.MARALUXE_MENU_DATA = deepFreeze(
${indentedJson}
  );
})();
`;
  }

  /**
   * Triggers an automatic browser download of the updated menu-data.js file.
   */
  function downloadUpdatedMenuData() {
    const fileContent = generateMenuDataJsCode();
    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'menu-data.js';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    showToast('Downloaded updated menu-data.js!', '📥');
  }

  /* ==========================================================================
     13. Action Bar Listeners & Modal Controls
     ========================================================================== */
  function setupActionBarListeners() {
    // Download CTA
    downloadDataBtnEl.addEventListener('click', downloadUpdatedMenuData);

    // Discard Changes
    discardChangesBtnEl.addEventListener('click', function () {
      if (confirm('Discard all adjustments and revert to the original saved menu?')) {
        clearDraftStorage();
        workingData = JSON.parse(JSON.stringify(originalData));
        modifiedItemsSet.clear();
        populateGroupFilterDropdown();
        populateCategoryAddDropdown();
        renderCategoryFilterPills();
        renderInventory();
        updateMetrics();
        showToast('All unsaved changes discarded', '↩️');
      }
    });

    // Code Preview Modal
    previewCodeBtnEl.addEventListener('click', function () {
      previewCodeContentEl.textContent = generateMenuDataJsCode();
      previewModalEl.hidden = false;
    });

    closePreviewBtnEl.addEventListener('click', function () {
      previewModalEl.hidden = true;
    });

    downloadFromPreviewBtnEl.addEventListener('click', function () {
      downloadUpdatedMenuData();
      previewModalEl.hidden = true;
    });

    // Search and Filters
    adminSearchInputEl.addEventListener('input', function (event) {
      searchQuery = event.target.value.trim();
      searchClearBtnEl.hidden = !searchQuery;
      renderInventory();
    });

    searchClearBtnEl.addEventListener('click', function () {
      adminSearchInputEl.value = '';
      searchQuery = '';
      searchClearBtnEl.hidden = true;
      renderInventory();
      adminSearchInputEl.focus();
    });

    groupFilterSelectEl.addEventListener('change', function (event) {
      activeGroupFilter = event.target.value;
      activeCategoryFilter = 'ALL';
      renderCategoryFilterPills();
      renderInventory();
    });

    statusFilterSelectEl.addEventListener('change', function (event) {
      activeStatusFilter = event.target.value;
      renderInventory();
    });
  }

  /* ==========================================================================
     14. Application Initialization
     ========================================================================== */
  function init() {
    checkAuthentication();
    setupAuthenticationListeners();
    initializeData();
    setupAddDrinkModal();
    setupDeleteConfirmModal();
    setupActionBarListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
