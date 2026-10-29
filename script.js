// Navigasi halaman dengan efek fade
const pages = [...document.querySelectorAll('.page')];
const navLinks = [...document.querySelectorAll('[data-page]')];
const mainNav = document.getElementById('mainNav');
const menuToggle = document.getElementById('menuToggle');

function showPage(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;
  pages.forEach(page => {
    page.classList.remove('active');
    page.setAttribute('aria-hidden', 'true');
  });
  target.classList.add('active');
  target.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
navLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showPage(link.dataset.page);
}));
document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => showPage(button.dataset.go));
});
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
document.getElementById('year').textContent = new Date().getFullYear();

// Galeri slide dan filter kategori
const slides = [...document.querySelectorAll('.gallery-slide')];
const dotsContainer = document.getElementById('slideDots');
const filterButtons = [...document.querySelectorAll('.filter-button')];
let activeFilter = 'semua';
let currentSlide = 0;

function visibleSlides() {
  return slides.filter(slide => activeFilter === 'semua' || slide.dataset.category === activeFilter);
}
function renderGallery() {
  const visible = visibleSlides();
  slides.forEach(slide => slide.classList.remove('current'));
  dotsContainer.innerHTML = '';
  if (!visible.length) return;
  if (currentSlide >= visible.length) currentSlide = 0;
  visible[currentSlide].classList.add('current');
  visible.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (index === currentSlide ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Tampilkan foto ${index + 1}`);
    dot.addEventListener('click', () => { currentSlide = index; renderGallery(); });
    dotsContainer.appendChild(dot);
  });
}
document.getElementById('prevSlide').addEventListener('click', () => {
  const visible = visibleSlides();
  if (!visible.length) return;
  currentSlide = (currentSlide - 1 + visible.length) % visible.length;
  renderGallery();
});
document.getElementById('nextSlide').addEventListener('click', () => {
  const visible = visibleSlides();
  if (!visible.length) return;
  currentSlide = (currentSlide + 1) % visible.length;
  renderGallery();
});
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  currentSlide = 0;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  renderGallery();
}));
renderGallery();

// Artikel: artikel baru tersimpan pada localStorage browser ini
const articleForm = document.getElementById('articleForm');
const articleList = document.getElementById('articleList');
const storageKey = 'gowesCommunityArticlesV1';

function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function createArticleCard(article, savedIndex) {
  const card = document.createElement('article');
  card.className = 'article-card';
  card.innerHTML = `<span class="article-tag">ARTIKEL ANGGOTA</span>
    <h3>${safeText(article.title)}</h3>
    <p class="article-meta">Ditulis oleh ${safeText(article.author)}</p>
    <p>${safeText(article.body).replace(/\n/g, '<br>')}</p>
    <button class="delete-article" type="button">Hapus artikel</button>`;
  card.querySelector('.delete-article').addEventListener('click', () => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;
    const stored = getStoredArticles();
    stored.splice(savedIndex, 1);
    localStorage.setItem(storageKey, JSON.stringify(stored));
    renderStoredArticles();
  });
  return card;
}
function getStoredArticles() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function renderStoredArticles() {
  articleList.querySelectorAll('[data-saved-article="true"]').forEach(card => card.remove());
  getStoredArticles().forEach((article, index) => {
    const card = createArticleCard(article, index);
    card.dataset.savedArticle = 'true';
    articleList.prepend(card);
  });
}
articleForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(articleForm);
  const article = {
    title: formData.get('title').trim(),
    author: formData.get('author').trim(),
    body: formData.get('body').trim()
  };
  if (!article.title || !article.author || !article.body) return;
  const stored = getStoredArticles();
  stored.unshift(article);
  localStorage.setItem(storageKey, JSON.stringify(stored));
  articleForm.reset();
  renderStoredArticles();
  alert('Artikel berhasil ditambahkan di browser ini.');
});
renderStoredArticles();

// Tombol hapus untuk artikel contoh yang ditulis langsung di HTML
document.querySelectorAll('#articleList > .article-card:not([data-saved-article]) .delete-article')
  .forEach(button => button.addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus artikel ini?')) button.closest('.article-card').remove();
  }));

// Agar halaman awal terbaca dengan benar oleh teknologi bantu
pages.forEach(page => page.setAttribute('aria-hidden', String(!page.classList.contains('active'))));
