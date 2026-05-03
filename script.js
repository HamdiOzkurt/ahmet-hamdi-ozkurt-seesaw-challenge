const PLANK_WIDTH = 400; 
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];

const state = { 
  objects: []
};

const plank      = document.getElementById('plank');
const leftSpan   = document.getElementById('left-weight');
const rightSpan  = document.getElementById('right-weight');
const balanceEl  = document.getElementById('balance-indicator');
const nextSpan   = document.getElementById('next-weight');
const angleSpan  = document.getElementById('tilt-angle');

var nextWeight = Math.floor(Math.random() * 10) + 1;
nextSpan.textContent = nextWeight;

// Spring simülasyonu değişkenleri — velocity tabanlı yumuşak dönüş
var currentAngle = 0;
var targetAngle  = 0;
var velocity     = 0;
var animating    = false;
var isPaused     = false;
var MAX_VEL      = 0.25;

function getColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]; // Renk paletlerini rast gele seçmek için getColor fonksiyonunu oluşturmak istedim.
  //  COLORS dizisinden rastgele bir renk seçmek için Math.random() ve Math.floor() fonksiyonlarını kullandım.
}

function renderObject(obj) {
  const size = 22 + obj.weight * 3; // Burada ağırlık nesnesinin boyutunun belirlemesi için renderObject fonksiyonunu oluşturdum.
  //  Ağırlık değeri arttıkça nesnenin boyutunun da artması için  bir formül kullandım: 22 piksel taban boyutuna ağırlığın 3 katını ekledim.

  const el = document.createElement('div'); // Ağırlık nesnesini temsil etmek için bir div elementi oluşturdum.
  el.className = 'weight-object'; // Oluşturduğum div elementine weight-object sınıfını atadım, böylece CSS ile stil verebilirim.
  el.dataset.id = obj.id; // Her ağırlık nesnesine benzersiz bir id atamak için data-id özelliğini kullandım, bu sayede ileride bu nesneleri tanımlayabilir ve istediğim şekilde yönetebilir..
  el.textContent = obj.weight; // Ağırlık nesnesinin üzerine ağırlık değerini yazdırmak için textContent özelliğini kullandım, böylece kullanıcı hangi ağırlık nesnesine tıkladığını görebilir.

  el.style.width  = size + 'px'; // Ağırlık nesnesinin genişliğini belirlemek için style.width özelliğini kullandım, böylece ağırlık değeri arttıkça nesnenin genişliği de artacak.
  el.style.height = size + 'px'; // Aynı şkeilde heigth özelliğini kullanarak ağırlık nesnesinin yüksekliğini belirledim, böylece ağırlık değeri arttıkça nesnenin yüksekliği de artacak.
  el.style.background = obj.color; // Ağırlık nesnesinin arka plan rengini belirlemek için style.background özelliğini kullandım, her nesne farklı bir renkte görünecek.
  // Daire veya kare: görsel çeşitlilik için shape özelliğine göre border-radius ayarlanır
  el.style.borderRadius = obj.shape === 'circle' ? '50%' : '6px';
  el.style.left = (PLANK_WIDTH / 2 + obj.offset - size / 2) + 'px'; // Ağırlık nesnesinin yatay konumunu belirlemek için style.left özelliğini kullandım, 
  //nesne tahtanın ortasından başlayarak offset değerine göre sağa veya sola kayacak.
  el.style.top  = (-size) + 'px'; // Ağırlık nesnesinin dikey konumunu belirlemek için style.top özelliğini kullandım, nesne tahtnaın üstünde dik durabilsin diye bunu yapmak istedim.

  plank.appendChild(el); // Oluşturduğum ağırlık nesnesini plank elementinin içine eklemek için appendChild metodunu kullandım,kullanıcı tahtaya tıkladığında yeni bir ağırlık nesnesi görünecek.
}

// Tahtanın her iki tarafındaki toplam torkları hesaplamak için computeTorques fonksiyonunu oluşturdum, bu fonksiyon state.objects dizisindeki her nesnenin ağırlığını ve offsetini kullanarak soldaki ve sağdaki toplam torkları hesaplayacak.
function computeTorques() {
  var left = 0;
  var right = 0;

  state.objects.forEach(function(obj) {
    if (obj.offset < 0) { // Nesnenin offseti yani tahtanın ortasından ne kadar uzak olduğu negatifse, bu nesne sol tarafta demektir ve soldaki toplam torka eklenir. Torku hesaplamak için ağırlık ile offsetin mutlak değerini çarparak ekledim,
    // nesne ne kadar uzakta olursa o kadar fazla tork oluşturacak.
      left += obj.weight * Math.abs(obj.offset);  
    } else {
      right += obj.weight * obj.offset;
    }
  });
  return {left:left,right:right};

}


// PDF'de verilen formül: açıyı ±30 derece ile sınırlandırıyorum.
// /10 yerine /50 kullandım — küçük tork farklarında çok agresif dönmesin diye.
function getAngle(left, right) {
  return Math.max(-30, Math.min(30, (right - left) / 50));
}


// Spring simülasyonu: velocity tabanlı, hedefe ivmelenerek yaklaşır
function animateToTarget() {
  var stiffness = 0.03;
  var damping   = 0.90;

  if (isPaused) { animating = false; return; }

  var diff = targetAngle - currentAngle;
  velocity += diff * stiffness;

  if (velocity >  MAX_VEL) velocity =  MAX_VEL;
  if (velocity < -MAX_VEL) velocity = -MAX_VEL;

  velocity *= damping;
  currentAngle += velocity;
  plank.style.transform = 'rotate(' + currentAngle + 'deg)';
  angleSpan.textContent = currentAngle.toFixed(1);

  if (Math.abs(diff) < 0.05 && Math.abs(velocity) < 0.02) {
    currentAngle = targetAngle;
    velocity = 0;
    plank.style.transform = 'rotate(' + currentAngle + 'deg)';
    animating = false;
    return;
  }

  requestAnimationFrame(animateToTarget);
}

// Hedef açıyı hesaplar ve animasyonu başlatır, ağırlık panelini günceller
function updateSeesaw() {
  var torques = computeTorques();
  targetAngle = getAngle(torques.left, torques.right);

  if (!animating) {
    animating = true;
    requestAnimationFrame(animateToTarget);
  }

  var leftTotal = 0;
  var rightTotal = 0;
  state.objects.forEach(function(obj) {
    if (obj.offset < 0) leftTotal += obj.weight;
    else rightTotal += obj.weight;
  });

  leftSpan.textContent  = leftTotal.toFixed(1);
  rightSpan.textContent = rightTotal.toFixed(1);

  // İki tarafın torku birbirine çok yakınsa denge göstergesini göster
  var diff = Math.abs(torques.left - torques.right);
  if (state.objects.length > 0 && diff < 200) {
    balanceEl.textContent = '⚖ Balanced!';
    balanceEl.classList.add('visible');
  } else {
    balanceEl.classList.remove('visible');
  }
}

// Mevcut objeleri localStorage'a kaydeder
function saveState() {
  localStorage.setItem('seesaw-objects', JSON.stringify(state.objects));
}

function loadState() {
  var saved = localStorage.getItem('seesaw-objects'); // localStorage'dan kaydedilmiş ağırlık nesnelerini almak için getItem metodunu kullandım,kullanıcı sayfayı yenilediğinde veya tekrar ziyaret ettiğinde önceki durumunu görebilecek.
  if (!saved) return; 

  state.objects = JSON.parse(saved); // Alınan JSON stringini tekrar JavaScript objesine dönüştürmek için JSON.parse metodunu kullandım,kaydedilmiş ağırlık nesnelerini hafıza içinde kullanabileceğim bir formata getirmiş oldum.
  state.objects.forEach(function(obj) { // Yüklenen her ağırlık nesnesini ekranda göstermek için forEach döngüsü ile state.objects dizisindeki her nesne için 
  // renderObject fonksiyonunu çağırdım, kullanıcı sayfayı yenilediğinde veya tekrar ziyaret ettiğinde önceki durumunu görebilecek.
    renderObject(obj);
  });
  updateSeesaw(); // Yüklenen nesnelerle tahtayı yeniden dengelemek için updateSeesaw fonksiyonunu çağırdım, kullanıcı sayfayı yenilediğinde veya tekrar ziyaret ettiğinde tahtanın önceki durumunu görebilecek.
}

// Web Audio API ile hafif bir düşme sesi üretir, harici kütüphane kullanmadan
function playDropSound() {
  var ctx  = new (window.AudioContext || window.webkitAudioContext)();
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}



// Her drop olayını logla: "8kg dropped on left side at 170px from center"
function logDrop(obj) {
  var side = obj.offset < 0 ? 'left' : 'right';
  var dist = Math.abs(Math.round(obj.offset));
  var li   = document.createElement('li');
  var dot  = document.createElement('span');
  dot.className = 'log-dot';
  dot.style.background = obj.color;
  li.appendChild(dot);
  li.appendChild(document.createTextNode(
    obj.weight + 'kg dropped on ' + side + ' side at ' + dist + 'px from center'
  ));
  var log = document.getElementById('activity-log');
  log.prepend(li);
}

function clampOffset(offset, size) {
  var limit = PLANK_WIDTH / 2 - size / 2 - 4;
  return Math.max(-limit, Math.min(limit, offset));
}
// Pause butonuna basınca animasyon ve yeni obje ekleme durur
document.getElementById('pause-btn').addEventListener('click', function() {
  isPaused = !isPaused;
  this.textContent = isPaused ? 'Resume' : 'Pause';
  this.classList.toggle('paused', isPaused);

  if (!isPaused && !animating) {
    animating = true;
    requestAnimationFrame(animateToTarget);
  }
});

plank.addEventListener('click', function(e) {
  if (isPaused) return;
  const weight = nextWeight; // Önceden üretilmiş ağırlığı kullan
  const size   = 22 + weight * 3;
  const raw    = e.offsetX - PLANK_WIDTH / 2; // Tahtaya tıklanan noktanın tahtanın ortasından ne kadar uzak olduğunu hesaplamak için e.offsetX özelliğini kullandım,nesnesi tıklanan noktaya göre sağa veya sola kayacak.
  const offset = clampOffset(raw, size);

  const obj = {  // Yeni bir ağırlık nesnesi oluşturmak için bir obje tanımladım, bu obje id, weight, offset, color ve shape gibi özelliklere sahip olacak.
    id: Date.now(),
    weight: weight,
    offset: offset,
    color: getColor(),
    shape: Math.random() > 0.5 ? 'circle' : 'square' // rastgele daire veya kare
  };

  state.objects.push(obj); // Oluşturduğum ağırlık nesnesini state.objects dizisine eklemek için push metodunu kullandım, hafıza içinde oluşturulan tüm ağırlık nesnelerini tutabileceğim bir yapı oluşturmuş oldum.
  renderObject(obj); // Oluşturduğum ağırlık nesnesini ekranda göstermek için renderObject fonksiyonunu çağırdım,kullanıcı tahtaya tıkladığında yeni bir ağırlık nesnesi görebilecek.
  updateSeesaw(); // Her yeni nesne eklenince tahtayı yeniden dengele
  logDrop(obj);
  saveState();
  playDropSound();

  nextWeight = Math.floor(Math.random() * 10) + 1;
  nextSpan.textContent = nextWeight;
});

// Reset butonuna basınca tüm objeleri temizler ve localStorage'ı sıfırlar
document.getElementById('reset-btn').addEventListener('click', function() {
  state.objects = [];
  plank.innerHTML = '';
  localStorage.removeItem('seesaw-objects');
  document.getElementById('activity-log').innerHTML = '';
  renderScale();
  updateSeesaw();
});


// Plank üzerinde pivot'tan mesafeyi gösteren çizgi ve etiketler
function renderScale() {
  plank.querySelectorAll('.scale-tick, .scale-label').forEach(function(el) { el.remove(); });
  var step = 50;
  for (var x = -(PLANK_WIDTH / 2); x <= (PLANK_WIDTH / 2); x += step) {
    var tick = document.createElement('div');
    tick.className = 'scale-tick';
    tick.style.left = (PLANK_WIDTH / 2 + x) + 'px';
    plank.appendChild(tick);
    if (x !== 0) {
      var label = document.createElement('div');
      label.className = 'scale-label';
      label.style.left = (PLANK_WIDTH / 2 + x) + 'px';
      label.textContent = Math.abs(x) + 'px';
      plank.appendChild(label);
    }
  }
}

renderScale();
loadState();
