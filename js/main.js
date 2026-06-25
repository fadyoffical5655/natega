// ==================== INIT ====================
AOS.init({ duration: 800, once: true });

// ==================== GLOBALS ====================
let allStudents = [];
const MAX_MARKS = 410;

// ==================== DATE ====================
document.getElementById('date').textContent = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ==================== LOAD DATA ====================
function loadData() {
    console.log('🔄 جاري تحميل البيانات...');
    
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log('📡 حالة التحميل:', xhr.status);
            
            if (xhr.status === 200 || xhr.status === 0) {
                try {
                    let text = xhr.responseText;
                    
                    if (!text || text.trim() === '') {
                        throw new Error('الملف فاضي');
                    }
                    
                    console.log('📄 تم قراءة الملف (' + text.length + ' حرف)');
                    console.log('🔍 أول 150 حرف:', text.substring(0, 150));
                    
                    // تنظيف النص
                    text = text.trim();
                    
                    // لو مش بيبدأ بـ [ نضيفها
                    if (!text.startsWith('[')) {
                        text = '[' + text;
                    }
                    
                    // لو مش بينتهي بـ ] نضيفها (ونشيل آخر فاصلة لو موجودة)
                    if (!text.endsWith(']')) {
                        // نشيل آخر فاصلة لو موجودة (حتى لو في سطر لوحدها)
                        text = text.replace(/,(\s*)$/, '');
                        text = text + ']';
                    }
                    
                    console.log('🔧 بعد التنظيف - أول 150 حرف:', text.substring(0, 150));
                    console.log('🔧 آخر 50 حرف:', text.substring(text.length - 50));
                    
                    const jsonData = JSON.parse(text);
                    
                    console.log('✅ تم تحليل JSON بنجاح');
                    console.log('📊 عدد الطلاب:', jsonData.length);
                    
                    if (jsonData.length > 0) {
                        console.log('🔍 أول طالب:', jsonData[0]);
                        console.log('🔍 آخر طالب:', jsonData[jsonData.length - 1]);
                    }
                    
                    allStudents = jsonData.map(item => ({
                        seating_no: String(item.seating_no || '').trim(),
                        arabic_name: String(item.arabic_name || '').trim(),
                        total_degree: parseFloat(item.total_degree) || 0
                    })).filter(s => s.seating_no && s.arabic_name);
                    
                    console.log('✅ تم تجهيز ' + allStudents.length + ' طالب');
                    console.log('🔍 أول 5 أرقام جلوس:', allStudents.slice(0, 5).map(s => s.seating_no));
                    
                    if (allStudents.length > 0) {
                        showToast('success', '✅ تم تحميل ' + allStudents.length + ' طالب بنجاح');
                    } else {
                        throw new Error('لا يوجد طلاب بعد المعالجة');
                    }
                    
                } catch (err) {
                    console.error('❌ خطأ:', err.message);
                    console.error('النص اللي حاولنا نحلله (آخر 200 حرف):', text ? text.substring(text.length - 200) : 'لا يوجد');
                    loadDefaultData();
                }
            } else {
                console.error('❌ فشل التحميل - Status:', xhr.status);
                loadDefaultData();
            }
            
            setTimeout(() => {
                const preloader = document.querySelector('.preloader');
                if (preloader) preloader.classList.add('hide');
            }, 500);
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ خطأ في الاتصال');
        loadDefaultData();
        
        setTimeout(() => {
            const preloader = document.querySelector('.preloader');
            if (preloader) preloader.classList.add('hide');
        }, 500);
    };
    
    xhr.open('GET', 'data.json', true);
    xhr.overrideMimeType('application/json');
    xhr.send();
}

function loadDefaultData() {
    console.log('⚠️ استخدام بيانات افتراضية');
    allStudents = [
        { seating_no: '1001660', arabic_name: 'محمد ابو الحسن حسن مصطفى', total_degree: 163.5 },
        { seating_no: '1001661', arabic_name: 'محمد احمد محمد ابو زيد', total_degree: 187.5 },
        { seating_no: '1001662', arabic_name: 'محمد على محمود عبدالعزيز', total_degree: 168 },
        { seating_no: '1001663', arabic_name: 'محمود سيد انور محمد حامد', total_degree: 212 },
        { seating_no: '1001664', arabic_name: 'محمود عطيه محمود جابر حجاج', total_degree: 154 },
        { seating_no: '1001665', arabic_name: 'مروان اشرف بدرى عبدالكريم محمد', total_degree: 187.5 }
    ];
    showToast('warning', '⚠️ فشل تحميل data.json - استخدام بيانات افتراضية');
}

// ==================== SEARCH ====================
function findBySeat(seat) {
    const term = String(seat).trim();
    console.log('🔎 البحث عن رقم الجلوس:', term);
    
    let found = allStudents.find(s => s.seating_no === term);
    
    if (!found) {
        found = allStudents.find(s => s.seating_no.replace(/^0+/, '') === term.replace(/^0+/, ''));
    }
    
    if (found) {
        console.log('✅ وجد:', found.arabic_name, '-', found.total_degree);
    } else {
        console.log('❌ لم يتم العثور');
        console.log('الأرقام المتاحة:', allStudents.slice(0, 5).map(s => s.seating_no));
    }
    
    return found;
}

function findByName(name) {
    const term = name.trim().toLowerCase();
    console.log('🔎 البحث عن اسم:', term);
    
    const found = allStudents.filter(s => 
        s.arabic_name.toLowerCase().includes(term)
    );
    
    console.log('🎯 عدد النتائج:', found.length);
    return found;
}

// ==================== TABS ====================
function switchTab(type) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');

    document.getElementById('seatPanel').classList.remove('active');
    document.getElementById('namePanel').classList.remove('active');
    document.getElementById(type + 'Panel').classList.add('active');

    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('resultsContainer').innerHTML = '';
}

// ==================== DISPLAY SINGLE ====================
function showSingleResult(student) {
    const section = document.getElementById('resultsSection');
    const container = document.getElementById('resultsContainer');

    if (!student) {
        container.innerHTML = `
            <div class="no-result" data-aos="zoom-in">
                <i class="fas fa-search"></i>
                <h3>لم يتم العثور على النتيجة</h3>
                <p>تأكد من رقم الجلوس أو الاسم وحاول مرة أخرى</p>
                <button onclick="clearResults()"><i class="fas fa-redo"></i> بحث جديد</button>
            </div>
        `;
        section.style.display = 'block';
        AOS.refresh();
        return;
    }

    const percent = (student.total_degree / MAX_MARKS) * 100;
    const passed = percent >= 50;
    const headerClass = passed ? 'pass' : 'fail';
    const icon = passed ? 'fa-check-circle' : 'fa-times-circle';
    const status = passed ? '🎉 ناجح - ألف مبروك!' : '💔 راسب - لا تيأس وحاول مرة أخرى';

    let barClass = 'low';
    if (percent >= 75) barClass = 'high';
    else if (percent >= 50) barClass = 'mid';

    container.innerHTML = `
        <div class="result-card" data-aos="zoom-in">
            <div class="card-header ${headerClass}">
                <div class="icon-bg"><i class="fas ${icon}"></i></div>
                <h3>${student.arabic_name}</h3>
                <p class="status">${status}</p>
            </div>
            <div class="card-body">
                <div class="info-row">
                    <div class="info-item">
                        <div class="lbl">رقم الجلوس</div>
                        <div class="val">${student.seating_no}</div>
                    </div>
                    <div class="info-item">
                        <div class="lbl">النسبة المئوية</div>
                        <div class="val" style="color:var(--gold-dark)">${percent.toFixed(1)}%</div>
                    </div>
                </div>

                <div class="total-box">
                    <div class="lbl">المجموع الكلي</div>
                    <div class="val">${student.total_degree} <small>/ ${MAX_MARKS}</small></div>
                    <div class="percent-bar">
                        <div class="percent-fill ${barClass}" style="width: 0%"></div>
                    </div>
                </div>

                <button class="print-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> طباعة النتيجة
                </button>
            </div>
        </div>
    `;

    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        const fill = container.querySelector('.percent-fill');
        if (fill) fill.style.width = percent + '%';
    }, 200);

    AOS.refresh();
}

// ==================== DISPLAY MULTIPLE ====================
function showMultipleResults(students) {
    const section = document.getElementById('resultsSection');
    const container = document.getElementById('resultsContainer');

    if (students.length === 0) {
        showSingleResult(null);
        return;
    }

    let html = `
        <div class="result-count" data-aos="fade-down">
            <i class="fas fa-users"></i> تم العثور على ${students.length} طالب
        </div>
        <div class="students-grid">
    `;

    students.forEach((s, i) => {
        const perc = (s.total_degree / MAX_MARKS) * 100;
        const good = perc >= 50;

        html += `
            <div class="mini-card" data-aos="fade-up" data-aos-delay="${i * 80}"
                 onclick="showSingleResult(findBySeat('${s.seating_no}'))">
                <div class="avtr"><i class="fas fa-user-graduate"></i></div>
                <h4>${s.arabic_name}</h4>
                <p class="seat">رقم الجلوس: ${s.seating_no}</p>
                <p class="deg ${good ? 'good' : 'bad'}">${s.total_degree} / ${MAX_MARKS}</p>
                <span class="tap">انقر للتفاصيل</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
    AOS.refresh();
}

function clearResults() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('seatInput').value = '';
    document.getElementById('nameInput').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== TOAST ====================
function showToast(type, msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `
        <span>${msg}</span>
        <button class="close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

// ==================== FORM EVENTS ====================
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.getElementById('seatForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const seat = document.getElementById('seatInput').value.trim();
        
        if (!seat) return showToast('warning', 'من فضلك أدخل رقم الجلوس');
        if (!allStudents.length) return showToast('error', 'جاري تحميل البيانات...');

        showSingleResult(findBySeat(seat));
    });

    document.getElementById('nameForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        
        if (!name) return showToast('warning', 'من فضلك أدخل اسم الطالب');
        if (name.length < 2) return showToast('warning', 'اكتب حرفين على الأقل');
        if (!allStudents.length) return showToast('error', 'جاري تحميل البيانات...');

        const found = findByName(name);
        if (found.length === 0) showSingleResult(null);
        else if (found.length === 1) showSingleResult(found[0]);
        else showMultipleResults(found);
    });

    document.querySelectorAll('.input-wrap input').forEach(inp => {
        inp.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.closest('form').dispatchEvent(new Event('submit'));
            }
        });
    });
});