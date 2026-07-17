/* ========================================
   ShareCare - ملف الجافاسكريبت الرئيسي
   ======================================== */

// ===== البيانات الافتراضية =====
const DEFAULT_DATA = {
  users: [
    { id: 1, name: "أحمد علي", email: "ahmed@example.com", password: "123456" },
    { id: 2, name: "سارة خالد", email: "sara@example.com", password: "123456" }
  ],
  items: [
    { id: 1, type: 'donation', title: 'أدوية سعال متبقية', category: 'medicine', condition: 'جيد', location: 'الخرطوم', description: 'علبتان من شراب السعال، لم تستخدما', contact: '0912345678', expiry: '2025-12', userId: 1, date: '2025-06-28' },
    { id: 2, type: 'donation', title: 'ملابس أطفال بحالة ممتازة', category: 'clothing', condition: 'ممتاز', location: 'أم درمان', description: 'ملابس لأعمار 4-6 سنوات', contact: '0922334455', userId: 2, date: '2025-06-27' },
    { id: 3, type: 'request', title: 'أرز أو طحين', category: 'food', location: 'بحري', description: 'أحتاج كيس أرز أو طحين للعائلة', contact: '0911122233', userId: 1, date: '2025-06-26' },
    { id: 4, type: 'donation', title: 'أدوات مطبخ مستعملة', category: 'tools', condition: 'جيد', location: 'الخرطوم', description: 'قدر ضغط ومقلاة', contact: '0933344556', userId: 1, date: '2025-06-25' },
    { id: 5, type: 'request', title: 'مساعدات مدرسية', category: 'other', location: 'مدني', description: 'أحتاج كراسات وأقلام للأطفال', contact: '0944455667', userId: 2, date: '2025-06-24' },
  ]
};

// ===== تحميل / حفظ البيانات =====
function loadData() {
  try {
    const stored = localStorage.getItem('sharecare_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      // دمج مع الافتراضي في حال نقص بعض الحقول
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem('sharecare_data', JSON.stringify(data));
}

// ===== المستخدم الحالي =====
let currentUser = null;
let appData = null;

function getCurrentUser() {
  try {
    const user = localStorage.getItem('sharecare_user');
    return user ? JSON.parse(user) : null;
  } catch { return null; }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('sharecare_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sharecare_user');
  }
  currentUser = user;
}

// ===== تهيئة التطبيق =====
function initApp() {
  appData = loadData();
  currentUser = getCurrentUser();
  // إذا كانت الصفحة هي index (تسجيل الدخول) نعرضها كما هي
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') {
    // لا تفعل شيء، صفحة تسجيل الدخول تعمل بنفسها
  } else {
    // باقي الصفحات تحتاج إلى مستخدم
    if (!currentUser) {
      window.location.href = 'index.html';
      return;
    }
    // تحديث الهيدر
    updateHeader();
    // تحديث المحتوى حسب الصفحة
    const pageName = page.replace('.html', '');
    if (pageName === 'home') renderHome();
    else if (pageName === 'market') renderMarket();
    else if (pageName === 'add') initAddPage();
    else if (pageName === 'stats') renderStats();
  }
}

// ===== تحديث الهيدر =====
function updateHeader() {
  const userArea = document.getElementById('userArea');
  if (!userArea) return;
  if (currentUser) {
    userArea.innerHTML = `
      <span class="avatar">${currentUser.name[0]}</span>
      <span style="font-weight:600;">${currentUser.name}</span>
      <button class="logout-btn" onclick="logout()">🚪 خروج</button>
    `;
  } else {
    userArea.innerHTML = `
      <span class="guest-badge">👤 زائر</span>
      <a href="index.html" class="btn" style="background:#f9a825;color:#1e2a1e;padding:6px 18px;text-decoration:none;border-radius:40px;font-weight:700;">دخول</a>
    `;
  }
}

// ===== تسجيل الخروج =====
function logout() {
  setCurrentUser(null);
  window.location.href = 'index.html';
}

// ===== عرض الإشعارات =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    // إنشاء الحاوية إذا لم تكن موجودة
    const div = document.createElement('div');
    div.id = 'toastContainer';
    div.className = 'toast-container';
    document.body.appendChild(div);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> ${message}`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== دوال الصفحة الرئيسية =====
function renderHome() {
  if (!appData) return;
  const items = appData.items || [];
  const donations = items.filter(i => i.type === 'donation');
  const requests = items.filter(i => i.type === 'request');
  const recent = items.slice(-6).reverse();

  // إحصائيات
  document.getElementById('statDonations').textContent = donations.length;
  document.getElementById('statRequests').textContent = requests.length;
  document.getElementById('statUsers').textContent = (appData.users || []).length;

  // آخر العناصر
  const container = document.getElementById('recentItems');
  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="big-icon">📦</span><p>لا توجد عناصر مضافة بعد</p></div>`;
  } else {
    container.innerHTML = recent.map(item => `
      <div class="item-card">
        <span class="tag ${item.category}">${getCategoryLabel(item.category)}</span>
        <h4>${item.title}</h4>
        <div class="meta">
          <span>📍 ${item.location}</span>
          <span>${item.type === 'donation' ? 'تبرع' : 'طلب'}</span>
        </div>
        <div class="desc">${item.description || ''}</div>
      </div>
    `).join('');
  }

  // تحديث الأثر
  document.getElementById('impactDonations').textContent = donations.length;
  document.getElementById('impactRequests').textContent = requests.length;
  document.getElementById('impactBeneficiaries').textContent = (appData.users || []).length * 2; // محاكاة
}

function getCategoryLabel(cat) {
  const map = { medicine: 'أدوية', clothing: 'ملابس', food: 'طعام', tools: 'أدوات', other: 'أخرى' };
  return map[cat] || cat;
}

// ===== دوال السوق الاجتماعي =====
function renderMarket() {
  if (!appData) return;
  const items = appData.items || [];
  // عرض التبرعات في التبويب الأول
  renderMarketTab('donation');
  // الأحداث للتبويبات
  document.querySelectorAll('.market-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.market-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderMarketTab(this.dataset.type);
    });
  });
  // شريط الفلترة
  document.getElementById('filterCategory')?.addEventListener('change', () => renderMarketTab(document.querySelector('.market-tab.active')?.dataset.type || 'donation'));
  document.getElementById('filterLocation')?.addEventListener('change', () => renderMarketTab(document.querySelector('.market-tab.active')?.dataset.type || 'donation'));
}

function renderMarketTab(type) {
  const container = document.getElementById('marketItems');
  if (!container) return;
  let items = appData.items.filter(i => i.type === type);
  // تطبيق الفلاتر
  const catFilter = document.getElementById('filterCategory')?.value;
  const locFilter = document.getElementById('filterLocation')?.value;
  if (catFilter) items = items.filter(i => i.category === catFilter);
  if (locFilter) items = items.filter(i => i.location === locFilter);

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="big-icon">🔍</span><p>لا توجد ${type === 'donation' ? 'تبرعات' : 'طلبات'} متطابقة</p></div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-card">
      <span class="tag ${item.category}">${getCategoryLabel(item.category)}</span>
      <h4>${item.title}</h4>
      <div class="meta">
        <span>📍 ${item.location}</span>
        <span>${item.condition ? 'حالة: ' + item.condition : ''}</span>
      </div>
      <div class="desc">${item.description || ''}</div>
      <div class="actions">
        <button class="btn" onclick="contactDonor('${item.contact}')">📞 طلب العنصر</button>
      </div>
    </div>
  `).join('');
}

function contactDonor(contact) {
  if (contact) {
    showToast(`📞 رقم التواصل: ${contact}`, 'success');
  } else {
    showToast('لا يوجد رقم تواصل مسجل', 'error');
  }
}

// ===== دوال صفحة الإضافة =====
function initAddPage() {
  const form = document.getElementById('addForm');
  if (!form) return;
  // تغيير الحقول حسب النوع
  document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const conditionGroup = document.getElementById('conditionGroup');
      if (this.value === 'donation') {
        conditionGroup.style.display = 'block';
        document.querySelector('label[for="condition"]').textContent = 'الحالة';
      } else {
        conditionGroup.style.display = 'none';
      }
    });
  });
  // حدث الإرسال
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.querySelector('input[name="type"]:checked')?.value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const condition = document.getElementById('condition')?.value || '';

    if (!type || !title || !category || !location || !description || !contact) {
      showToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }
    const newItem = {
      id: Date.now(),
      type,
      title,
      category,
      location,
      description,
      contact,
      condition: type === 'donation' ? condition : '',
      userId: currentUser?.id || 0,
      date: new Date().toISOString().slice(0,10)
    };
    appData.items.push(newItem);
    saveData(appData);
    showToast(`✅ تم إضافة ${type === 'donation' ? 'التبرع' : 'الطلب'} بنجاح`);
    form.reset();
    // إعادة تعيين العرض
    document.getElementById('conditionGroup').style.display = 'block';
  });
}

// ===== دوال الإحصائيات =====
function renderStats() {
  if (!appData) return;
  const items = appData.items || [];
  const donations = items.filter(i => i.type === 'donation');
  const requests = items.filter(i => i.type === 'request');
  const users = appData.users || [];

  document.getElementById('statTotalItems').textContent = items.length;
  document.getElementById('statDonationsCount').textContent = donations.length;
  document.getElementById('statRequestsCount').textContent = requests.length;
  document.getElementById('statUsersCount').textContent = users.length;
  document.getElementById('statBeneficiaries').textContent = (users.length * 2) + requests.length; // محاكاة
  // إحصائيات حسب التصنيف
  const categories = ['medicine', 'clothing', 'food', 'tools', 'other'];
  const labels = ['أدوية', 'ملابس', 'طعام', 'أدوات', 'أخرى'];
  const counts = categories.map(cat => items.filter(i => i.category === cat).length);
  // عرض كأشرطة بسيطة
  const container = document.getElementById('categoryStats');
  container.innerHTML = labels.map((label, i) => `
    <div class="row">
      <span class="label">${label}</span>
      <div style="display:flex;align-items:center;gap:8px;flex:1;max-width:60%;">
        <div style="flex:1;height:10px;background:#f0ece8;border-radius:10px;overflow:hidden;">
          <div style="height:100%;width:${counts[i] > 0 ? (counts[i] / Math.max(1, items.length) * 100) : 0}%;background:#2d6a4f;border-radius:10px;"></div>
        </div>
        <span style="font-weight:700;">${counts[i]}</span>
      </div>
    </div>
  `).join('');
}

// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
  // التأكد من وجود حاوية الإشعارات
  if (!document.getElementById('toastContainer')) {
    const div = document.createElement('div');
    div.id = 'toastContainer';
    div.className = 'toast-container';
    document.body.appendChild(div);
  }
  initApp();
});

// ===== دوال خاصة بصفحة تسجيل الدخول =====
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}Form`).classList.add('active');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) { showToast('يرجى تعبئة جميع الحقول', 'error'); return; }
  const user = appData.users.find(u => u.email === email && u.password === password);
  if (!user) { showToast('البريد أو كلمة المرور غير صحيحة', 'error'); return; }
  setCurrentUser(user);
  showToast(`مرحباً ${user.name} 👋`);
  setTimeout(() => { window.location.href = 'home.html'; }, 500);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm = document.getElementById('regConfirm').value.trim();
  if (!name || !email || !password || !confirm) {
    showToast('يرجى تعبئة جميع الحقول', 'error'); return;
  }
  if (password !== confirm) { showToast('كلمتا المرور غير متطابقتين', 'error'); return; }
  if (appData.users.some(u => u.email === email)) {
    showToast('البريد الإلكتروني مسجل مسبقاً', 'error'); return;
  }
  const newUser = { id: Date.now(), name, email, password };
  appData.users.push(newUser);
  saveData(appData);
  showToast('✅ تم إنشاء الحساب بنجاح');
  // تسجيل الدخول تلقائياً
  setCurrentUser(newUser);
  setTimeout(() => { window.location.href = 'home.html'; }, 500);
}