/* =====================================================
   Asalxon Malika klinikasi — umumiy skript
   ===================================================== */

/* ---------- Theme (sessiya davomida, sahifa ochilganda tizim rejimiga mos) ---------- */
(function initTheme(){
  var html = document.documentElement;
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('themeToggle');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var cur = html.getAttribute('data-theme');
      html.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
    });
  });
})();

/* ---------- 3D tilt (sichqoncha harakatiga qarab) ---------- */
function enableTilt(selector, intensity){
  intensity = intensity || 8;
  document.querySelectorAll(selector).forEach(function(el){
    var scene = el.closest('.tilt-scene') || el;
    scene.addEventListener('mousemove', function(e){
      var r = scene.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'rotateY('+(px*intensity)+'deg) rotateX('+(-py*intensity)+'deg)';
    });
    scene.addEventListener('mouseleave', function(){
      el.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  });
}

/* ---------- Floating liquid dock ---------- */
(function initDock(){
  document.addEventListener('DOMContentLoaded', function(){
    var dock = document.getElementById('dock');
    if(!dock) return;
    var indicator = document.getElementById('dockIndicator');
    var items = Array.prototype.slice.call(dock.querySelectorAll('.dock-item'));
    var page = document.body.getAttribute('data-page');

    function moveIndicator(el){
      if(!el) return;
      var dockRect = dock.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      indicator.style.left = (r.left - dockRect.left) + 'px';
      indicator.style.width = r.width + 'px';
      indicator.animate([{transform:'scaleX(1)'},{transform:'scaleX(1.08)'},{transform:'scaleX(1)'}],
        {duration:420, easing:'cubic-bezier(.34,1.56,.64,1)'});
    }

    var activeBtn = items.filter(function(b){ return b.dataset.page === page; })[0] || items[0];
    items.forEach(function(b){ b.classList.toggle('active', b === activeBtn); });

    window.addEventListener('load', function(){ moveIndicator(activeBtn); });
    window.addEventListener('resize', function(){ moveIndicator(dock.querySelector('.dock-item.active')); });
  });
})();

/* ---------- Umumiy yordamchi ---------- */
function showToast(msg, isError){
  var toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.toggle('error', !!isError);
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 3200);
}

function pad(n){ return n < 10 ? '0'+n : ''+n; }
function isoDate(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
var UZ_WEEKDAYS = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan'];
var UZ_MONTHS = ['Yan','Fev','Mar','Apr','May','Iyun','Iyul','Avg','Sen','Okt','Noy','Dek'];

/* =====================================================
   SHIFOKORLAR + QABULGA YOZILISH (shifokorlar.html da ishlaydi)
   ===================================================== */
var DEPARTMENTS = [
  { id:'hammasi', name:'Hammasi' },
  { id:'terapevt', name:'Terapevt' },
  { id:'stomatolog', name:'Tish doktori' },
  { id:'kardiolog', name:'Kardiolog' },
  { id:'pediatr', name:'Pediatr' },
  { id:'nevropatolog', name:'Nevropatolog' }
];

var DOCTORS = [
  { id:'d6', name:'Jasur Xolmatov', dept:'stomatolog', deptName:'Tish doktori', exp:10, desc:'Bolalar va kattalar stomatologiyasi, tish olib tashlash.', bg:'linear-gradient(135deg,#2E6E61,#DE9C4F)' }
];

var TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

function initials(name){
  return name.split(' ').map(function(p){ return p[0]; }).join('').slice(0,2).toUpperCase();
}

(function initDoctorsPage(){
  document.addEventListener('DOMContentLoaded', function(){
    var deptRow = document.getElementById('deptRow');
    var docGrid = document.getElementById('docGrid');
    if(!docGrid) return;

    var activeDept = 'hammasi';

    function renderDepts(){
      deptRow.innerHTML = '';
      DEPARTMENTS.forEach(function(d){
        var chip = document.createElement('button');
        chip.className = 'dept-chip' + (d.id === activeDept ? ' active' : '');
        chip.type = 'button';
        chip.textContent = d.name;
        chip.addEventListener('click', function(){
          activeDept = d.id;
          renderDepts();
          renderDoctors();
        });
        deptRow.appendChild(chip);
      });
    }

    function renderDoctors(){
      docGrid.innerHTML = '';
      var list = DOCTORS.filter(function(doc){ return activeDept === 'hammasi' || doc.dept === activeDept; });
      list.forEach(function(doc){
        var card = document.createElement('div');
        card.className = 'doc-card';
        card.innerHTML =
          '<div class="avatar" style="background:'+doc.bg+'">'+initials(doc.name)+'</div>' +
          '<h3>'+doc.name+'</h3>' +
          '<span class="role">'+doc.deptName+'</span>' +
          '<p>'+doc.desc+'</p>' +
          '<div class="exp"><span>Tajriba</span><span>'+doc.exp+' yil</span></div>' +
          '<button class="btn btn-primary pick-btn" type="button">Qabulga yozilish</button>';
        card.querySelector('.pick-btn').addEventListener('click', function(){ openBooking(doc); });
        docGrid.appendChild(card);
      });
    }

    renderDepts();
    renderDoctors();
    initBookingModal();
  });
})();

function initBookingModal(){
  var veil = document.getElementById('bookVeil');
  if(!veil) return;
  var closeBtn = document.getElementById('closeBook');
  var docHead = document.getElementById('bookDocHead');
  var dateRow = document.getElementById('dateRow');
  var slotGrid = document.getElementById('slotGrid');
  var step1 = document.getElementById('bookStep1');
  var step2 = document.getElementById('bookStep2');
  var backBtn = document.getElementById('bookBack');
  var form = document.getElementById('bookForm');
  var summary = document.getElementById('bookSummary');

  var state = { doctor:null, date:null, time:null };

  function hide(){ veil.classList.remove('open'); }
  closeBtn.addEventListener('click', hide);
  veil.addEventListener('click', function(e){ if(e.target === veil) hide(); });

  function nextDays(n){
    var days = [];
    var today = new Date();
    for(var i=0;i<n;i++){
      var d = new Date(today);
      d.setDate(today.getDate()+i);
      days.push(d);
    }
    return days;
  }

  function renderDates(){
    dateRow.innerHTML = '';
    var days = nextDays(7);
    days.forEach(function(d, idx){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'date-chip' + (idx===0 ? ' active' : '');
      chip.innerHTML = UZ_WEEKDAYS[d.getDay()] + '<b>' + d.getDate() + '</b>' + UZ_MONTHS[d.getMonth()];
      chip.addEventListener('click', function(){
        Array.prototype.forEach.call(dateRow.children, function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        state.date = isoDate(d);
        state.time = null;
        loadSlots();
      });
      dateRow.appendChild(chip);
      if(idx===0){ state.date = isoDate(d); }
    });
  }

  function loadSlots(){
    slotGrid.innerHTML = '<p style="grid-column:1/-1;font-size:13px;">Vaqtlar tekshirilmoqda…</p>';
    fetch('/.netlify/functions/slots?doctorId='+state.doctor.id+'&date='+state.date)
      .then(function(r){ return r.ok ? r.json() : { taken: [] }; })
      .catch(function(){ return { taken: [] }; })
      .then(function(data){
        var taken = data.taken || [];
        slotGrid.innerHTML = '';
        TIME_SLOTS.forEach(function(t){
          var btn = document.createElement('button');
          btn.type = 'button';
          var isTaken = taken.indexOf(t) !== -1;
          btn.className = 'slot-btn' + (isTaken ? ' taken' : '');
          btn.textContent = t + (isTaken ? ' · band' : '');
          if(isTaken){ btn.disabled = true; }
          btn.addEventListener('click', function(){
            Array.prototype.forEach.call(slotGrid.children, function(c){ c.classList.remove('active'); });
            btn.classList.add('active');
            state.time = t;
          });
          slotGrid.appendChild(btn);
        });
      });
  }

  window.openBooking = function(doc){
    state.doctor = doc;
    state.time = null;
    docHead.innerHTML =
      '<div class="avatar" style="background:'+doc.bg+'">'+initials(doc.name)+'</div>' +
      '<div><h3 style="font-size:17px;">'+doc.name+'</h3><span class="role">'+doc.deptName+'</span></div>';
    step1.classList.add('show'); step2.classList.remove('show');
    renderDates();
    loadSlots();
    veil.classList.add('open');
  };

  document.getElementById('toStep2').addEventListener('click', function(){
    if(!state.date || !state.time){ showToast('Iltimos, kun va vaqtni tanlang', true); return; }
    summary.textContent = state.doctor.name + ' — ' + state.date + ', soat ' + state.time;
    step1.classList.remove('show'); step2.classList.add('show');
  });

  backBtn.addEventListener('click', function(){
    step2.classList.remove('show'); step1.classList.add('show');
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('bookName').value.trim();
    var phone = document.getElementById('bookPhone').value.trim();
    if(!name || !phone){ return; }
    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda…';

    fetch('/.netlify/functions/book', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        doctorId: state.doctor.id,
        doctorName: state.doctor.name,
        dept: state.doctor.deptName,
        date: state.date,
        time: state.time,
        name: name,
        phone: phone
      })
    })
    .then(function(r){ return r.json().then(function(data){ return { ok:r.ok, data:data }; }); })
    .then(function(res){
      submitBtn.disabled = false;
      submitBtn.textContent = 'Qabulga yozilish';
      if(res.ok){
        showToast('Qabulga muvaffaqiyatli yozildingiz!');
        hide();
        form.reset();
        loadSlots();
      } else {
        showToast(res.data && res.data.message ? res.data.message : 'Bu vaqt band qilingan, boshqasini tanlang', true);
        loadSlots();
        step2.classList.remove('show'); step1.classList.add('show');
      }
    })
    .catch(function(){
      submitBtn.disabled = false;
      submitBtn.textContent = 'Qabulga yozilish';
      showToast('Server bilan bog‘lanib bo‘lmadi. Qaytadan urinib ko‘ring.', true);
    });
  });
}

/* =====================================================
   PROFIL sahifasi
   ===================================================== */
(function initProfilePage(){
  document.addEventListener('DOMContentLoaded', function(){
    var tabPatient = document.getElementById('tabPatient');
    var tabDoctor = document.getElementById('tabDoctor');
    var panelPatient = document.getElementById('panelPatient');
    var panelDoctor = document.getElementById('panelDoctor');
    if(!tabPatient) return;

    tabPatient.addEventListener('click', function(){
      tabPatient.classList.add('active'); tabDoctor.classList.remove('active');
      panelPatient.classList.add('show'); panelDoctor.classList.remove('show');
    });
    tabDoctor.addEventListener('click', function(){
      tabDoctor.classList.add('active'); tabPatient.classList.remove('active');
      panelDoctor.classList.add('show'); panelPatient.classList.remove('show');
    });

    var doctorForm = document.getElementById('doctorLoginForm');
    if(doctorForm){
      doctorForm.addEventListener('submit', function(e){
        e.preventDefault();
        showToast('So‘rov yuborildi. Klinika administratori tez orada tasdiqlaydi.');
        doctorForm.reset();
      });
    }
  });
})();
