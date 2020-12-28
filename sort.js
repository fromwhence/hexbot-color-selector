'use strict';

const sortByHue = document.getElementById('sort-by-hue');
const sortByText = document.getElementsByClassName('sort-by-text')[0];
const sortIcon = document.getElementById('sort-icon');
const refreshColors = document.getElementById('refresh-colors');

const shuffleColors = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

// const fadeTransition = () => {
//   colorGrid.classList.add('fade-transition');
//   setTimeout(function () {
//     colorGrid.classList.remove('fade-transition');
//   }, 1500);
// };

// Sort colors by hue or randomize

const sortGrid = () => {
  let hexToSort = [];
  let hexGrid = document.querySelectorAll('.my--color');
  let hexGridArr = [...hexGrid];

  for (let i = 0; i < hexGridArr.length; i++) {
    let hex = hexGridArr[i].lastElementChild.innerText;
    hexToSort.push(hex);
  }

  // Color conversion and hue sorting function

  function hexToHsb(hex) {
    hex = hex.replace(/^#/, '');
    hex = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;

    let r = parseInt(hex.substr(0, 2), 16) / 255,
      g = parseInt(hex.substr(2, 2), 16) / 255,
      b = parseInt(hex.substr(4, 2), 16) / 255;

    let cMax = Math.max(r, g, b),
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

  let sortedColors = hexToSort;

  sortedColors = sortedColors.sort(function (a, b) {
    let hsva = hexToHsb(a);
    let hsvb = hexToHsb(b);
    return hsva[0] - hsvb[0];
  });

  const displaySortedColors = colors => {
    let sortedColorsHtml = colors
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
    let shuffledColors = shuffleColors(hexToSort);
    displaySortedColors(shuffledColors);
    fadeTransition();
  }

  hexToSort = [];
};

sortByHue.addEventListener('click', sortGrid);

refreshColors.addEventListener('click', function () {
  sortByText.textContent = 'By Hue';
  sortIcon.classList.remove('fa-random');
  sortIcon.classList.add('fa-sort');
  getColors(colorCount);
  fadeTransition();
});
