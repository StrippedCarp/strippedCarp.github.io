# Maraluxe Resort and Spa — Bar Menu & Content Management Dashboard

A security-hardened, offline-capable Progressive Web App (PWA) bar menu and content management price editor for **Maraluxe Resort and Spa**.

---

## 🍸 Live Pages on GitHub Pages

Once deployed on GitHub Pages:

- **Guest Bar Menu:** `https://<your-username>.github.io/<repo-name>/`
  - High-performance, offline-capable luxury digital bar menu for resort guests.
  - Features real-time drink search, category pills, smooth scroll-spy, and image lightbox.
  - Zero-XSS DOM architecture, strict CSP, and offline caching via Service Worker (`sw.js`).

- **Manager Price Editor Dashboard:** `https://<your-username>.github.io/<repo-name>/admin.html`
  - Non-developer friendly management tool for restaurant and bar managers.
  - **Manager Passcode:** `Maraluxe2026!`
  - Allows inline price adjustments, stock status toggling (`In Stock` / `Out of Stock`), and adding new items.
  - **One-Click Download:** Packages changes into an updated, immutable `menu-data.js` file ready to be committed.

---

## 📁 Architecture & File Structure

```text
├── index.html       # Public guest menu shell with strict Content Security Policy (CSP)
├── styles.css       # Consolidated, un-minified BEM luxury hospitality stylesheet
├── assets.js        # High-resolution Base64 WebP brand logos and ambient banners
├── menu-data.js     # Clean, frozen inventory dataset with typo-corrected brand names
├── app.js           # Security-hardened DOM rendering engine and Service Worker controller
├── sw.js            # Cache-First offline Service Worker with dynamic font caching
├── admin.html       # Non-developer Content Management & Price Editor dashboard
├── admin.css        # Responsive styling for the manager dashboard
└── admin.js         # Admin authentication, state management, and file export logic
```

---

## 🚀 How to Publish to GitHub Pages

1. **Create a GitHub repository:** Create a new empty public repository on [GitHub](https://github.com/new) (e.g. `maraluxe-bar-menu`).
2. **Push your code:**
   ```bash
   git add .
   git commit -m "Initial commit: Maraluxe Bar Menu & Price Editor"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages:**
   - In your repository, go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch `main` and folder `/(root)`.
   - Click **Save**.
4. In 1–2 minutes, your bar menu will be live at:
   `https://<your-username>.github.io/<repo-name>/`
