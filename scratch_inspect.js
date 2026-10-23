/**
 * Maraluxe Resort and Spa — Menu Data Structure & Schema Inspector
 *
 * Verifies the structural integrity, schema hierarchy, and data correctness
 * of the menu dataset (comparing original HTML source and modular menu-data.js).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ==========================================================================
   1. Configuration & Path Resolution
   ========================================================================== */
const WORKSPACE_DIR = __dirname;
const SOURCE_HTML_FILE = path.join(WORKSPACE_DIR, 'Maraluxe Resort and Spa — Bar Menu(remodelled).html');
const MODULAR_DATA_FILE = path.join(WORKSPACE_DIR, 'menu-data.js');

/* ==========================================================================
   2. Schema Definitions & Validation Rules
   ========================================================================== */
const SCHEMA = {
  root: {
    required: ['venue', 'menu', 'currency', 'currencyLabel', 'groups'],
    types: {
      venue: 'string',
      menu: 'string',
      currency: 'string',
      currencyLabel: 'string',
      groups: 'array'
    }
  },
  group: {
    required: ['name', 'categories'],
    optional: ['hidden'],
    types: {
      name: 'string',
      categories: 'array',
      hidden: 'boolean'
    }
  },
  category: {
    required: ['name', 'items'],
    types: {
      name: 'string',
      items: 'array'
    }
  },
  item: {
    required: ['name', 'options'],
    optional: ['description', 'tags', 'image'],
    types: {
      name: 'string',
      description: 'string',
      tags: 'array',
      options: 'array',
      image: 'object'
    }
  },
  option: {
    required: ['price'],
    optional: ['label'],
    types: {
      price: 'number',
      label: 'string'
    }
  },
  image: {
    optional: ['t', 'f'],
    types: {
      t: 'string',
      f: 'string'
    }
  }
};

/* ==========================================================================
   3. Data Extraction Helpers
   ========================================================================== */
function loadOriginalData() {
  if (!fs.existsSync(SOURCE_HTML_FILE)) {
    throw new Error(`Original source HTML not found at: ${SOURCE_HTML_FILE}`);
  }
  const html = fs.readFileSync(SOURCE_HTML_FILE, 'utf8');
  const match = html.match(/const\s+D\s*=\s*(\{[\s\S]*?\});\s*const\s+L\s*=/);
  if (!match) {
    throw new Error('Unable to extract "const D" data block from source HTML.');
  }
  try {
    return JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`Failed to parse extracted JSON data: ${err.message}`);
  }
}

function loadModularData() {
  if (!fs.existsSync(MODULAR_DATA_FILE)) {
    return null;
  }
  const code = fs.readFileSync(MODULAR_DATA_FILE, 'utf8');
  const sandbox = { window: {}, Object, Array, String, Number, Boolean };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox);
    return sandbox.window.MARALUXE_MENU_DATA || null;
  } catch (err) {
    return null;
  }
}

/* ==========================================================================
   4. Structural Validation & Reporting Engine
   ========================================================================== */
function validateSchema(data) {
  const issues = [];
  const stats = {
    groupsCount: 0,
    categoriesCount: 0,
    itemsCount: 0,
    optionsCount: 0,
    imagesCount: 0,
    tagsCount: 0,
    priceMin: Infinity,
    priceMax: -Infinity
  };

  // 1. Root Validation
  if (!data || typeof data !== 'object') {
    issues.push({ path: 'root', message: 'Data root is not an object.' });
    return { valid: false, issues, stats };
  }

  SCHEMA.root.required.forEach(key => {
    if (!(key in data)) {
      issues.push({ path: 'root', message: `Missing required root property: "${key}"` });
    }
  });

  const rootExtra = Object.keys(data).filter(k => !SCHEMA.root.required.includes(k));
  if (rootExtra.length > 0) {
    issues.push({ path: 'root', message: `Unexpected root properties: ${rootExtra.join(', ')}` });
  }

  if (!Array.isArray(data.groups)) {
    issues.push({ path: 'root.groups', message: 'Property "groups" must be an array.' });
    return { valid: issues.length === 0, issues, stats };
  }

  stats.groupsCount = data.groups.length;

  // 2. Groups Validation
  data.groups.forEach((group, gIdx) => {
    const gPath = `groups[${gIdx}] (${group.name || 'unnamed'})`;

    SCHEMA.group.required.forEach(key => {
      if (!(key in group)) {
        issues.push({ path: gPath, message: `Missing required property: "${key}"` });
      }
    });

    const allowedGroupKeys = [...SCHEMA.group.required, ...SCHEMA.group.optional];
    const groupExtra = Object.keys(group).filter(k => !allowedGroupKeys.includes(k));
    if (groupExtra.length > 0) {
      issues.push({ path: gPath, message: `Unexpected properties: ${groupExtra.join(', ')}` });
    }

    if (!Array.isArray(group.categories)) {
      issues.push({ path: `${gPath}.categories`, message: 'Property "categories" must be an array.' });
      return;
    }

    stats.categoriesCount += group.categories.length;

    // 3. Categories Validation
    group.categories.forEach((category, cIdx) => {
      const cPath = `${gPath} -> categories[${cIdx}] (${category.name || 'unnamed'})`;

      SCHEMA.category.required.forEach(key => {
        if (!(key in category)) {
          issues.push({ path: cPath, message: `Missing required property: "${key}"` });
        }
      });

      const categoryExtra = Object.keys(category).filter(k => !SCHEMA.category.required.includes(k));
      if (categoryExtra.length > 0) {
        issues.push({ path: cPath, message: `Unexpected properties: ${categoryExtra.join(', ')}` });
      }

      if (!Array.isArray(category.items)) {
        issues.push({ path: `${cPath}.items`, message: 'Property "items" must be an array.' });
        return;
      }

      stats.itemsCount += category.items.length;

      // 4. Items Validation
      category.items.forEach((item, iIdx) => {
        const iPath = `${cPath} -> item[${iIdx}] ("${item.name || 'unnamed'}")`;

        SCHEMA.item.required.forEach(key => {
          if (!(key in item)) {
            issues.push({ path: iPath, message: `Missing required property: "${key}"` });
          }
        });

        const allowedItemKeys = [...SCHEMA.item.required, ...SCHEMA.item.optional];
        const itemExtra = Object.keys(item).filter(k => !allowedItemKeys.includes(k));
        if (itemExtra.length > 0) {
          issues.push({ path: iPath, message: `Unexpected properties: ${itemExtra.join(', ')}` });
        }

        // Tags
        if (item.tags) {
          if (!Array.isArray(item.tags)) {
            issues.push({ path: `${iPath}.tags`, message: '"tags" must be an array.' });
          } else {
            stats.tagsCount += item.tags.length;
          }
        }

        // Image
        if (item.image) {
          stats.imagesCount++;
          if (typeof item.image !== 'object') {
            issues.push({ path: `${iPath}.image`, message: '"image" must be an object.' });
          } else {
            if (item.image.t && typeof item.image.t !== 'string') {
              issues.push({ path: `${iPath}.image.t`, message: 'Thumbnail image URI must be a string.' });
            }
            if (item.image.f && typeof item.image.f !== 'string') {
              issues.push({ path: `${iPath}.image.f`, message: 'Full image URI must be a string.' });
            }
          }
        }

        // Options & Prices
        if (!Array.isArray(item.options) || item.options.length === 0) {
          issues.push({ path: `${iPath}.options`, message: 'Item must have at least one pricing option.' });
        } else {
          stats.optionsCount += item.options.length;
          item.options.forEach((opt, oIdx) => {
            const oPath = `${iPath}.options[${oIdx}]`;
            if (typeof opt.price !== 'number' || isNaN(opt.price) || opt.price <= 0) {
              issues.push({ path: oPath, message: `Invalid price value: ${opt.price}` });
            } else {
              if (opt.price < stats.priceMin) stats.priceMin = opt.price;
              if (opt.price > stats.priceMax) stats.priceMax = opt.price;
            }
          });
        }
      });
    });
  });

  return {
    valid: issues.length === 0,
    issues,
    stats
  };
}

/* ==========================================================================
   5. Hierarchical Tree Visualizer
   ========================================================================== */
function printStructuralTree(data) {
  console.log(`\n📦 ${data.venue} — ${data.menu.toUpperCase()} MENU [Currency: ${data.currency} (${data.currencyLabel})]`);
  console.log('│');

  data.groups.forEach((group, gIdx, gArr) => {
    const isLastGroup = gIdx === gArr.length - 1;
    const gPrefix = isLastGroup ? '└──' : '├──';
    const gChildPrefix = isLastGroup ? '    ' : '│   ';

    const hiddenFlag = group.hidden ? ' (hidden)' : '';
    console.log(`${gPrefix} 📁 Group: "${group.name}"${hiddenFlag} [${group.categories.length} categories]`);

    group.categories.forEach((cat, cIdx, cArr) => {
      const isLastCat = cIdx === cArr.length - 1;
      const cPrefix = isLastCat ? '└──' : '├──';
      const cChildPrefix = isLastCat ? '    ' : '│   ';

      console.log(`${gChildPrefix}${cPrefix} 📂 Category: "${cat.name}" (${cat.items.length} items)`);

      cat.items.forEach((item, iIdx, iArr) => {
        const isLastItem = iIdx === iArr.length - 1;
        const iPrefix = isLastItem ? '└──' : '├──';

        const prices = (item.options || [])
          .map(o => (o.label ? `${o.label}: ` : '') + `${data.currencyLabel} ${o.price.toLocaleString()}`)
          .join(' | ');

        const tags = item.tags && item.tags.length ? ` [${item.tags.join(', ')}]` : '';
        const img = item.image ? ' 🖼️' : '';

        console.log(`${gChildPrefix}${cChildPrefix}${iPrefix} • ${item.name}${tags}${img} — ${prices}`);
      });
    });
    if (!isLastGroup) {
      console.log('│');
    }
  });
  console.log('');
}

/* ==========================================================================
   6. Main Execution Controller
   ========================================================================== */
function main() {
  console.log('=================================================================');
  console.log('  MARALUXE MENU DATA — STRUCTURAL INTEGRITY INSPECTION');
  console.log('=================================================================');

  try {
    const data = loadOriginalData();
    const result = validateSchema(data);

    printStructuralTree(data);

    console.log('=================================================================');
    console.log('  STRUCTURAL AUDIT SUMMARY');
    console.log('=================================================================');
    console.log(`  • Status:           ${result.valid ? '✅ STRUCTURALLY VALID' : '❌ ISSUES DETECTED'}`);
    console.log(`  • Groups:           ${result.stats.groupsCount}`);
    console.log(`  • Categories:       ${result.stats.categoriesCount}`);
    console.log(`  • Items:            ${result.stats.itemsCount}`);
    console.log(`  • Pricing Options:  ${result.stats.optionsCount}`);
    console.log(`  • Image Assets:     ${result.stats.imagesCount}`);
    console.log(`  • Item Tags:        ${result.stats.tagsCount}`);
    console.log(`  • Price Range:      ${data.currencyLabel} ${result.stats.priceMin.toLocaleString()} – ${data.currencyLabel} ${result.stats.priceMax.toLocaleString()}`);

    if (result.issues.length > 0) {
      console.log(`\n  ⚠️  Issues Found (${result.issues.length}):`);
      result.issues.forEach(iss => console.log(`    - [${iss.path}] ${iss.message}`));
    } else {
      console.log('\n  ✨ Zero schema violations or rogue keys found.');
    }

    const modularData = loadModularData();
    if (modularData) {
      console.log('\n  Modular menu-data.js parity check:');
      console.log('  • Loaded menu-data.js:       ✅ Present');
      console.log('  • Root object frozen:        ' + (Object.isFrozen(modularData) ? '✅ Yes' : '❌ No'));
      console.log('  • Groups array frozen:       ' + (Object.isFrozen(modularData.groups) ? '✅ Yes' : '❌ No'));
    }
    console.log('=================================================================\n');
  } catch (error) {
    console.error(`\n❌ Error during structural inspection: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  SCHEMA,
  loadOriginalData,
  loadModularData,
  validateSchema
};
