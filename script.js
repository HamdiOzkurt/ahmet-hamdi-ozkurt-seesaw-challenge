const PLANK_WIDTH = 400; 
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];

const state = { 
  objects: []
};

const plank     = document.getElementById('plank');
const leftSpan  = document.getElementById('left-weight');
const rightSpan = document.getElementById('right-weight');

function getColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]; // Renk paletlerini rast gele seçmek için getColor fonksiyonunu oluşturmak istedim.
  //  COLORS dizisinden rastgele bir renk seçmek için Math.random() ve Math.floor() fonksiyonlarını kullandım.
}


