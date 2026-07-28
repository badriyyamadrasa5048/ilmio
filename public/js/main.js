document.addEventListener('DOMContentLoaded', function () {

  const toggleBtn = document.getElementById('sidebarCollapse');
  const sidebar   = document.getElementById('sidebar');

  /* ── 1. Create mobile backdrop if not present ── */
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop d-print-none';
    document.body.appendChild(backdrop);
  }

  /* ── 2. Load sidebar state from localStorage (desktop only) ── */
  if (window.innerWidth >= 768 && sidebar) {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('active');
    } else {
      sidebar.classList.remove('active');
    }
  }

  /* ── 3. Toggle Sidebar function ── */
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('active');
      
      if (window.innerWidth >= 768) {
        // Save state for desktop
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('active'));
      } else {
        // Mobile drawer overlay backdrop toggle
        if (sidebar.classList.contains('active')) {
          backdrop.classList.add('show');
        } else {
          backdrop.classList.remove('show');
        }
      }
    });
  }

  /* ── 4. Close mobile sidebar drawer on backdrop click ── */
  backdrop.addEventListener('click', function () {
    if (sidebar) {
      sidebar.classList.remove('active');
      backdrop.classList.remove('show');
    }
  });

  /* ── 5. Auto-highlight active sidebar nav link ── */
  const currentPath = window.location.pathname;
  document.querySelectorAll('#sidebar .sidebar-nav .nav-item').forEach(item => {
    const link = item.querySelector('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    const isActive =
      currentPath === href ||
      (href.length > 1 && href !== '/dashboard' && currentPath.startsWith(href));
    if (isActive) {
      document.querySelectorAll('#sidebar .nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });

  /* ── 6. Inline table search (for pages with #tableSearch input) ── */
  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      document.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ── 7. Global nav search (top navbar) ── */
  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      document.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ── 8. Bottom nav tap highlight (mobile) ── */
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('touchstart', function () {
      this.style.background = 'var(--indigo-light)';
    }, { passive: true });
    item.addEventListener('touchend', function () {
      setTimeout(() => { this.style.background = ''; }, 200);
    }, { passive: true });
  });

  /* ── 9. Auto-dismiss flash alerts after 4 seconds ── */
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 4000);
  });

});
