(function () {
  'use strict';

  /* ==========================================================================
     1. Security Validators & Formatting Helpers
     ========================================================================== */

  /**
   * Validates that an image string is strictly a safe Base64 image data URI.
   * Prevents javascript: or data:text/html URI injection.
   */
  function isSafeImageUri(uri) {
    if (typeof uri !== 'string' || !uri) {
      return false;
    }
    const safeDataUriPattern = /^data:image\/(webp|png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/;
    return safeDataUriPattern.test(uri);
  }

  /**
   * Replaces straight quotes with typographic apostrophes for editorial polish.
   */
  function formatTypography(text) {
    return String(text).replace(/'/g, '’');
  }

  /**
   * Formats numbers with thousands separators (e.g., 10000 -> "10,000").
   */
  function formatPrice(amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Converts a category/group name to a valid CSS/DOM id slug.
   */
  function createSlug(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /* ==========================================================================
     2. DOM Element Selectors
     ========================================================================== */
  const menuContainerEl = document.getElementById('menuContent');
  const categoryPillsEl = document.getElementById('categoryPills');
  const searchInputEl = document.getElementById('searchInput');
  const lightboxModalEl = document.getElementById('lightboxModal');
  const lightboxImageEl = document.getElementById('lightboxImage');
  const lightboxCaptionEl = document.getElementById('lightboxCaption');
  const ageGateModalEl = document.getElementById('ageGateModal');
  const confirmAgeBtnEl = document.getElementById('confirmAgeBtn');
  const declineAgeBtnEl = document.getElementById('declineAgeBtn');
  const ageGatePromptEl = document.getElementById('ageGatePrompt');
  const ageGateActionsEl = document.getElementById('ageGateActions');


  /* ==========================================================================
     3. Banner Style Mapping
     ========================================================================== */
  const BANNER_MODIFIER_MAP = {
    'Cocktails': 'category-banner--green',
    'Beer & Cider': 'category-banner--lounge',
    'Spirits': 'category-banner--spirits',
    'Wine': 'category-banner--wine',
    'Shots & Singles': 'category-banner--spirits',
    'Soft Drinks': 'category-banner--lounge'
  };

  /* ==========================================================================
     4. Zero-XSS DOM Component Constructors
     ========================================================================== */

  /**
   * Safely builds a single menu item row using pure DOM methods.
   */
  function createMenuItemElement(itemData) {
    const itemRow = document.createElement('div');
    itemRow.className = 'menu-item';

    const infoCol = document.createElement('div');
    infoCol.className = 'menu-item__info';

    if (itemData.image && itemData.image.t && isSafeImageUri(itemData.image.t)) {
      const thumbImg = document.createElement('img');
      const hasFullImage = Boolean(itemData.image.f && isSafeImageUri(itemData.image.f));
      thumbImg.className = 'menu-item__thumb' + (hasFullImage ? ' menu-item__thumb--zoomable' : '');
      thumbImg.loading = 'lazy';
      thumbImg.decoding = 'async';
      thumbImg.width = 64;
      thumbImg.height = 64;
      thumbImg.src = itemData.image.t;
      thumbImg.alt = formatTypography(itemData.name);

      if (hasFullImage) {
        thumbImg.addEventListener('click', function () {
          openLightbox(itemData.image.f, itemData.name);
        });
      }

      infoCol.appendChild(thumbImg);
    }

    const textContainer = document.createElement('div');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'menu-item__title';
    titleSpan.textContent = formatTypography(itemData.name);
    textContainer.appendChild(titleSpan);

    const isUnavailable = Boolean(itemData.outOfStock) ||
      (Array.isArray(itemData.tags) && itemData.tags.includes('Out of Stock'));
    if (isUnavailable) {
      itemRow.classList.add('menu-item--unavailable');
    }

    if (Array.isArray(itemData.tags)) {
      itemData.tags.forEach(function (tagText) {
        if (tagText === 'Out of Stock') {
          return; // rendered below as a single unavailable badge
        }
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'menu-item__badge';
        badgeSpan.textContent = tagText;
        textContainer.appendChild(badgeSpan);
      });
    }

    if (isUnavailable) {
      const soldOutBadge = document.createElement('span');
      soldOutBadge.className = 'menu-item__badge menu-item__badge--unavailable';
      soldOutBadge.textContent = 'Unavailable';
      textContainer.appendChild(soldOutBadge);
    }

    if (itemData.description) {
      const descDiv = document.createElement('div');
      descDiv.className = 'menu-item__desc';
      descDiv.textContent = itemData.description;
      textContainer.appendChild(descDiv);
    }

    infoCol.appendChild(textContainer);
    itemRow.appendChild(infoCol);

    const pricingCol = document.createElement('div');
    pricingCol.className = 'menu-item__pricing';

    if (Array.isArray(itemData.options)) {
      itemData.options.forEach(function (option) {
        const optionRow = document.createElement('div');
        optionRow.className = 'menu-item__price-option';

        if (option.label) {
          const labelSpan = document.createElement('span');
          labelSpan.className = 'menu-item__option-label';
          labelSpan.textContent = option.label;
          optionRow.appendChild(labelSpan);
        }

        const amountEl = document.createElement('b');
        amountEl.className = 'menu-item__option-amount';
        amountEl.textContent = formatPrice(option.price);
        optionRow.appendChild(amountEl);

        pricingCol.appendChild(optionRow);
      });
    }

    itemRow.appendChild(pricingCol);
    return itemRow;
  }

  /**
   * Safely builds the featured carousel section for signature cocktails.
   */
  function createFeaturedSectionElement(signatureCategory) {
    if (!signatureCategory || !Array.isArray(signatureCategory.items) || signatureCategory.items.length === 0) {
      return null;
    }

    const section = document.createElement('section');
    section.className = 'menu-section';
    section.id = 'section-signature';

    const banner = document.createElement('div');
    banner.className = 'category-banner category-banner--cocktails';

    const title = document.createElement('h2');
    title.className = 'category-banner__title';
    title.textContent = 'Signature Cocktails';
    banner.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'category-banner__subtitle';
    subtitle.textContent = 'Crafted in-house at Maraluxe';
    banner.appendChild(subtitle);

    section.appendChild(banner);

    const carousel = document.createElement('div');
    carousel.className = 'featured-carousel';

    signatureCategory.items.forEach(function (itemData) {
      const card = document.createElement('div');
      card.className = 'featured-card';

      if (itemData.image && itemData.image.t && isSafeImageUri(itemData.image.t)) {
        const img = document.createElement('img');
        const hasFullImage = Boolean(itemData.image.f && isSafeImageUri(itemData.image.f));
        img.className = 'featured-card__img' + (hasFullImage ? ' menu-item__thumb--zoomable' : '');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 92;
        img.height = 92;
        img.src = itemData.image.t;
        img.alt = formatTypography(itemData.name);

        if (hasFullImage) {
          img.addEventListener('click', function () {
            openLightbox(itemData.image.f, itemData.name);
          });
        }

        card.appendChild(img);
      }

      const cardTitle = document.createElement('b');
      cardTitle.className = 'featured-card__title';
      const cleanName = itemData.name.replace(/^Maraluxe\s+/i, '');
      cardTitle.textContent = formatTypography(cleanName);
      card.appendChild(cardTitle);

      const badge = document.createElement('small');
      badge.className = 'featured-card__badge';
      badge.textContent = 'Signature';
      card.appendChild(badge);

      const priceEl = document.createElement('span');
      priceEl.className = 'featured-card__price';
      const firstPrice = itemData.options && itemData.options[0] ? itemData.options[0].price : 0;
      priceEl.textContent = itemData.options && itemData.options.length > 1
        ? 'from ' + formatPrice(firstPrice)
        : formatPrice(firstPrice);
      card.appendChild(priceEl);

      carousel.appendChild(card);
    });

    section.appendChild(carousel);
    return section;
  }

  /* ==========================================================================
     5. Main Menu Renderer
     ========================================================================== */
  function renderMenu(rawQuery) {
    // Sanitize and enforce 60-character cap on search input
    const cleanQuery = String(rawQuery || '')
      .slice(0, 60)
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const menuData = window.MARALUXE_MENU_DATA;
    if (!menuData || !Array.isArray(menuData.groups)) {
      return;
    }

    const visibleGroups = menuData.groups.filter(function (group) {
      return !group.hidden;
    });

    const activeNavigationGroups = [];

    menuContainerEl.replaceChildren();
    categoryPillsEl.replaceChildren();

    const fragment = document.createDocumentFragment();

    // Featured section when no search filter is active
    if (!cleanQuery) {
      const cocktailsGroup = visibleGroups.find(function (g) {
        return g.name === 'Cocktails';
      });
      const signatureCat = cocktailsGroup && Array.isArray(cocktailsGroup.categories)
        ? cocktailsGroup.categories.find(function (c) { return c.name === 'Signature Cocktails'; })
        : null;

      if (signatureCat) {
        const featuredEl = createFeaturedSectionElement(signatureCat);
        if (featuredEl) {
          fragment.appendChild(featuredEl);
          activeNavigationGroups.push({ name: 'Signature', targetId: 'section-signature' });
        }
      }
    }

    visibleGroups.forEach(function (group) {
      const sectionId = 'section-' + createSlug(group.name);
      const groupSection = document.createElement('section');
      groupSection.className = 'menu-section';
      groupSection.id = sectionId;

      const bannerModifier = BANNER_MODIFIER_MAP[group.name] || 'category-banner--spirits';
      const banner = document.createElement('div');
      banner.className = 'category-banner ' + bannerModifier;

      const groupTitle = document.createElement('h2');
      groupTitle.className = 'category-banner__title';
      groupTitle.textContent = group.name;
      banner.appendChild(groupTitle);
      groupSection.appendChild(banner);

      let matchedItemsInGroup = 0;

      group.categories.forEach(function (category) {
        // In default view, signature cocktails are already showcased in the carousel
        if (!cleanQuery && category.name === 'Signature Cocktails') {
          return;
        }

        const matchingItems = category.items.filter(function (item) {
          return !cleanQuery ||
            item.name.toLowerCase().includes(cleanQuery) ||
            category.name.toLowerCase().includes(cleanQuery) ||
            (item.description && item.description.toLowerCase().includes(cleanQuery));
        });

        if (matchingItems.length === 0) {
          return;
        }

        matchedItemsInGroup += matchingItems.length;

        const subHeading = document.createElement('h3');
        subHeading.className = 'subcategory-heading';
        subHeading.textContent = category.name;
        groupSection.appendChild(subHeading);

        matchingItems.forEach(function (itemData) {
          groupSection.appendChild(createMenuItemElement(itemData));
        });
      });

      if (matchedItemsInGroup > 0) {
        fragment.appendChild(groupSection);
        activeNavigationGroups.push({ name: group.name, targetId: sectionId });
      }
    });

    if (activeNavigationGroups.length === 0) {
      const emptyStateEl = document.createElement('div');
      emptyStateEl.className = 'empty-state';
      emptyStateEl.textContent = 'No drinks match \u201C' + cleanQuery + '\u201D.';
      menuContainerEl.appendChild(emptyStateEl);
      return;
    }

    menuContainerEl.appendChild(fragment);

    // Build Category Navigation Pills safely
    const pillsFragment = document.createDocumentFragment();
    activeNavigationGroups.forEach(function (navGroup, index) {
      const pillBtn = document.createElement('button');
      pillBtn.type = 'button';
      pillBtn.className = 'category-pills__btn' + (index === 0 ? ' category-pills__btn--active' : '');
      pillBtn.dataset.targetSection = navGroup.targetId;
      pillBtn.textContent = navGroup.name;
      pillsFragment.appendChild(pillBtn);
    });
    categoryPillsEl.appendChild(pillsFragment);

    setupScrollSpy();
  }

  /* ==========================================================================
     6. Scroll-Spy & Smooth Navigation
     ========================================================================== */
  let activeSpySectionId = '';
  let spyRafId = null;
  let navigationLockTimer = null;
  let isProgrammaticScroll = false;
  const navEl = document.querySelector('.menu-nav');

  // Height of the sticky nav (plus a little breathing room) = the "reading line".
  function getNavOffset() {
    return (navEl ? navEl.getBoundingClientRect().bottom : 0) + 8;
  }

  function setActivePill(sectionId) {
    if (!sectionId || sectionId === activeSpySectionId) {
      return;
    }
    activeSpySectionId = sectionId;
    categoryPillsEl.querySelectorAll('.category-pills__btn').forEach(function (btn) {
      const isMatch = btn.dataset.targetSection === sectionId;
      btn.classList.toggle('category-pills__btn--active', isMatch);
      if (isMatch) {
        // Keep the active pill visible inside the horizontal strip only (never scroll the page).
        const stripRect = categoryPillsEl.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        categoryPillsEl.scrollLeft += (btnRect.left + btnRect.width / 2) - (stripRect.left + stripRect.width / 2);
      }
    });
  }

  // Active section = the last one whose top has passed the reading line.
  function updateActiveFromScroll() {
    spyRafId = null;
    if (isProgrammaticScroll) {
      return;
    }
    const line = getNavOffset();
    const sections = document.querySelectorAll('.menu-section');
    let currentId = sections.length ? sections[0].id : '';
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line + 1) {
        currentId = sections[i].id;
      } else {
        break;
      }
    }
    setActivePill(currentId);
  }

  function onScrollForSpy() {
    if (isProgrammaticScroll) {
      // Release the lock once the smooth scroll has settled.
      clearTimeout(navigationLockTimer);
      navigationLockTimer = setTimeout(function () {
        isProgrammaticScroll = false;
        updateActiveFromScroll();
      }, 150);
      return;
    }
    if (!spyRafId) {
      spyRafId = requestAnimationFrame(updateActiveFromScroll);
    }
  }

  function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }
    // Highlight exactly the pill that was pressed, and ignore scroll-spy until we arrive.
    setActivePill(sectionId);
    isProgrammaticScroll = true;
    clearTimeout(navigationLockTimer);
    navigationLockTimer = setTimeout(function () {
      isProgrammaticScroll = false;
    }, 1200); // safety net if no scroll event fires (already at target)

    const top = target.getBoundingClientRect().top + window.pageYOffset - getNavOffset() + 9;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function setupScrollSpy() {
    activeSpySectionId = ''; // pills were rebuilt; resync highlight
    updateActiveFromScroll();
  }
  /* ==========================================================================
     7. Lightbox Controller
     ========================================================================== */
  function openLightbox(imageUri, titleText) {
    if (!isSafeImageUri(imageUri)) {
      return;
    }
    lightboxImageEl.src = imageUri;
    lightboxImageEl.alt = formatTypography(titleText);
    lightboxCaptionEl.textContent = formatTypography(titleText);
    lightboxModalEl.hidden = false;
  }

  function closeLightbox() {
    lightboxModalEl.hidden = true;
    lightboxImageEl.removeAttribute('src');
    lightboxCaptionEl.textContent = '';
  }

  /* ==========================================================================
     8. Age Verification Gate
     ========================================================================== */
  function initAgeGate() {
    let isVerified = false;
    try {
      isVerified = window.sessionStorage.getItem('maraluxe_age_verified') === '1';
    } catch (storageError) {
      isVerified = false;
    }

    if (isVerified) {
      ageGateModalEl.hidden = true;
      return;
    }

    document.body.style.overflow = 'hidden';
    confirmAgeBtnEl.focus();

    confirmAgeBtnEl.addEventListener('click', function () {
      document.body.style.overflow = '';
      try {
        window.sessionStorage.setItem('maraluxe_age_verified', '1');
      } catch (storageError) {
        // Silently continue if private browsing blocks sessionStorage
      }
      ageGateModalEl.hidden = true;
    });

    declineAgeBtnEl.addEventListener('click', function () {
      ageGatePromptEl.textContent = 'No problem. Please ask our team about our restaurant menu and soft drinks.';
      ageGateActionsEl.hidden = true;
    });
  }

  /* ==========================================================================
     9. Service Worker Registration
     ========================================================================== */
  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {
          // Gracefully continue offline support attempt
        });
      });
    }
  }

  /* ==========================================================================
     10. Application Initialization & Asset Hydration
     ========================================================================== */
  function initApplication() {
    const assets = window.MARALUXE_ASSETS;

    if (assets) {
      // Hydrate safe brand logo
      if (isSafeImageUri(assets.logo)) {
        document.querySelectorAll('.brand-logo').forEach(function (imgEl) {
          imgEl.src = assets.logo;
        });
      }

      // Hydrate safe CSS background variables
      if (assets.banners) {
        const rootStyle = document.documentElement.style;
        const bannerKeys = {
          hero: '--banner-hero',
          cocktails: '--banner-cocktails',
          spirits: '--banner-spirits',
          green: '--banner-green',
          lounge: '--banner-lounge',
          wine: '--banner-wine'
        };

        // Hydrate immediate above-the-fold hero banner
        if (isSafeImageUri(assets.banners.hero)) {
          rootStyle.setProperty('--banner-hero', 'url("' + assets.banners.hero + '")');
        }

        // Defer below-the-fold banners to leave initial thread completely free
        const deferFn = window.requestIdleCallback || window.requestAnimationFrame || function (cb) { setTimeout(cb, 16); };
        deferFn(function () {
          ['cocktails', 'spirits', 'green', 'lounge', 'wine'].forEach(function (key) {
            const uri = assets.banners[key];
            if (isSafeImageUri(uri)) {
              rootStyle.setProperty(bannerKeys[key], 'url("' + uri + '")');
            }
          });
        });
      }
    }

    // Attach pill navigation click delegation
    categoryPillsEl.addEventListener('click', function (event) {
      const button = event.target.closest('.category-pills__btn');
      if (!button) {
        return;
      }
      scrollToSection(button.dataset.targetSection);
    });

    window.addEventListener('scroll', onScrollForSpy, { passive: true });
    window.addEventListener('resize', onScrollForSpy, { passive: true });

    // Attach hardened search input event listener
    searchInputEl.addEventListener('input', function (event) {
      renderMenu(event.target.value);
    });

    // Attach Lightbox event listeners
    lightboxModalEl.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightboxModalEl.hidden) {
        closeLightbox();
      }
    });

    initAgeGate();
    initServiceWorker();
    renderMenu('');
  }

  // Launch application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
  } else {
    initApplication();
  }
})();
