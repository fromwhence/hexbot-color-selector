'use strict';

const sortByHue = document.querySelector('.sort-by-hue');
const sortByText = document.querySelector('.sort-by-text');
const sortIcon = document.querySelector('.sort-icon');

const shuffleColors = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

// Sort colors by hue or randomize
const sortGrid = function () {
  const hexSorted = [];
  const hexGridArr = Array.from(document.querySelectorAll('.my--color'));

  for (let i = 0; i < hexGridArr.length; i++) {
    const hex = hexGridArr[i].lastElementChild.innerText;
    hexSorted.push(hex);
  }

  // Color conversion and hue sorting function
  function hexToHsb(hex) {
    hex = hex.replace(/^#/, '');
    hex = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;

    const r = parseInt(hex.substr(0, 2), 16) / 255,
      g = parseInt(hex.substr(2, 2), 16) / 255,
      b = parseInt(hex.substr(4, 2), 16) / 255;

    const cMax = Math.max(r, g, b),
      cMin = Math.min(r, g, b),
      delta = cMax - cMin,
      saturation = cMax ? delta / cMax : 0;

    switch (cMax) {
      case 0:
        return [0, 0, 0];
      case cMin:
        return [0, 0, cMax];
      case r:
        return [60 * (((g - b) / delta) % 6) || 0, saturation, cMax];
      case g:
        return [60 * ((b - r) / delta + 2) || 0, saturation, cMax];
      case b:
        return [60 * ((r - g) / delta + 4) || 0, saturation, cMax];
    }
  }

  const sortedColors = hexSorted.sort(function (a, b) {
    const hsva = hexToHsb(a);
    const hsvb = hexToHsb(b);
    return hsva[0] - hsvb[0];
  });

  const displaySortedColors = function (sortedColors) {
    const sortedColorsHtml = sortedColors
      .map(color => {
        return `<div class="my--color" style="background: ${color};">
                <span class="add--favorite" 
                  style="color:${getContrast(color)}; 
                  opacity: 0.2;">&#43;
                </span>
                <span class="hex--color" 
                  style="color:${getContrast(color)}; 
                  opacity: 0;">${color}
                </span>
              </div>`;
      })
      .join('');
    colorGrid.innerHTML = `${sortedColorsHtml}`;
  };

  if (sortByText.textContent === 'By Hue') {
    sortByText.textContent = 'Random';
    sortIcon.classList.remove('fa-sort');
    sortIcon.classList.add('fa-random');
    displaySortedColors(sortedColors);
    fadeTransition();
  } else if (sortByText.textContent === 'Random') {
    sortByText.textContent = 'By Hue';
    sortIcon.classList.remove('fa-random');
    sortIcon.classList.add('fa-sort');
    const shuffledColors = shuffleColors(hexSorted);
    displaySortedColors(shuffledColors);
    fadeTransition();
  }
};

sortByHue.addEventListener('click', sortGrid);
