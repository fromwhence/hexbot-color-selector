'use strict';

const urlBase = 'https://api.noopschallenge.com/hexbot?count=';
const colorGrid = document.getElementById('color-grid');
const stickyToolbar = document.querySelector('.favorite-colors-container');
const favoriteIcon = document.querySelector('.favorite-icon');
const clipboardIcon = document.querySelector('.clipboard-icon');
const favoriteColors = document.querySelector('.favorite-colors');
const deleteFavoritesIcon = document.querySelector('.delete-favorites');

// Instructions modal
function instructionsModal() {
  const overlay = document.querySelector('.modal-overlay');
  const modalWindow = document.querySelector('.modal-window');
  const openModal = document.querySelector('.open-instructions');

  const openModalHandler = function () {
    overlay.classList.remove('fade-out', 'hidden');
    modalWindow.classList.remove('close-modal', 'hidden');
    overlay.classList.add('fade-in');
  };

  const closeModalHandler = function () {
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    modalWindow.classList.add('close-modal');
  };

  openModal.addEventListener('click', openModalHandler);
  modalWindow.addEventListener('click', closeModalHandler);
  overlay.addEventListener('click', closeModalHandler);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModalHandler();
    }
  });
}

instructionsModal();

// Icon behaviors
const activateIcons = () => {
  favoriteIcon.classList.add('icon-active');
  clipboardIcon.classList.add('icon-active');
};

const resetIcons = () => {
  deleteFavoritesIcon.classList.remove('active');
  favoriteIcon.classList.remove('icon-active');
  clipboardIcon.classList.remove('icon-active');
};

// Global function to convert RGB to Hexcodes
const rgbToHex = function (r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Global function to assign font color based on relative darkness of hexcolor
const getContrast = function (hexcolor) {
  // Removes leading #
  if (hexcolor.slice(0, 1) === '#') {
    hexcolor = hexcolor.slice(1);
  }
  // Convert hex to RGB value
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);

  // Get YIQ ratio
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Check contrast
  return yiq >= 128 ? '#333' : 'white';
};

// Sticky toolbar
const sticky = stickyToolbar.offsetTop;
function setStickyToolbar() {
  if (window.pageYOffset > sticky) {
    stickyToolbar.classList.add('sticky');
  } else {
    stickyToolbar.classList.remove('sticky');
  }
}
window.onscroll = () => setStickyToolbar();

// Generate random color grid
const displayRandomColors = function () {
  // Determine the number of color squares based on viewport width
  const colorGridCount = function () {
    let colorCount;
    const windowWidth = window.innerWidth;

    const colorCountByWidth = function (width) {
      if (width < 576) {
        colorCount = 36;
      }
      if (width >= 576) {
        colorCount = 48;
      }
      if (width >= 768) {
        colorCount = 72;
      }
      if (width >= 1024) {
        colorCount = 96;
      }
      if (width >= 1366) {
        colorCount = 132;
      }
      if (width >= 1500) {
        colorCount = 156;
      }
      return colorCount;
    };
    colorCountByWidth(windowWidth);
    return colorCount;
  };

  const colorTotal = colorGridCount();

  // Create random rgb values
  const getRandomColors = function (colorTotal) {
    const random = function (number) {
      return Math.floor(Math.random() * (number + 1));
    };
    const randomColor = function () {
      const colorCode =
        'rgb(' + random(255) + ',' + random(255) + ',' + random(255) + ')';
      return colorCode;
    };
    let randomColorsArr = [];
    while (randomColorsArr.length < colorTotal) {
      randomColorsArr.push(randomColor());
    }
    return randomColorsArr;
  };

  const randomColors = getRandomColors(colorTotal);

  // Convert rgb values to hexcodes
  const convertRgbColorsToHex = function (randomColors) {
    const formatRbg = randomColors.map(color => {
      return color
        .slice(4, -1)
        .replace(/\s+/g, '')
        .split(',')
        .map(x => +x);
    });
    const toHexArr = formatRbg.map(color => {
      return rgbToHex(...color);
    });
    return toHexArr;
  };

  const randomHexColors = convertRgbColorsToHex(randomColors);

  // Generate html for color grid
  const displayColors = function (randomHexColors) {
    let myColorsHtml = randomHexColors
      .map(color => {
        return `
        <div class="my--color" style="background: ${color};">
          <span class="add--favorite" 
            style="color:${getContrast(color)}; 
            ">&#43;
          </span>
          <span class="hex--color" 
            style="color:${getContrast(color)}; 
            ">${color}
          </span>
        </div>`;
      })
      .join(''); // myColorsHtml is an array, .join('') converts to a string
    colorGrid.innerHTML = `${myColorsHtml}`;
  };

  displayColors(randomHexColors);
};

displayRandomColors();
// End of display random colors function

// Fade in and fade out color grid
const fadeTransition = () => {
  colorGrid.classList.add('fade-transition');
  setTimeout(function () {
    colorGrid.classList.remove('fade-transition');
  }, 1500);
};

// Global variables for favorite colors features
let hexFavoritesArr;
let hexSelected;

// Add color from grid to favorites
colorGrid.addEventListener('click', function (event) {
  if (event.target.classList.contains('add--favorite')) {
    activateIcons();
    event.target.innerHTML = '&#8722;';
    event.target.parentElement.classList.add('selected');
    const hexText = event.target.nextElementSibling.innerText;
    const node = document.createElement('li');
    node.classList.add('favorite--color');
    node.style.background = hexText;
    node.style.color = getContrast(hexText);
    node.innerText = hexText;
    favoriteColors.appendChild(node);
  }

  hexFavoritesArr = Array.from(document.querySelectorAll('.favorite--color'));
  hexSelected = Array.from(document.querySelectorAll('.selected'));
  if (hexFavoritesArr.length > 0) {
    deleteFavoritesIcon.classList.add('active');
  }
});

// Removes single color from favorites
favoriteColors.addEventListener('click', function (event) {
  if (event.target.classList.contains('favorite--color')) {
    const hexText = event.target;
    const hexTextMatch = hexText.style.background;
    // Resets favorite icon, clipboard icon, and remove all if no favorites remain
    if (document.querySelector('.favorite-colors').firstChild === null) {
      resetIcons();
    }
    const hexMatches = Array.from(
      document.querySelectorAll('.my--color.selected')
    );
    // Remove color from favorites
    hexText.remove();
    // Activates matching color in grid
    for (let i = 0; i < hexMatches.length; i++) {
      if (hexTextMatch === hexMatches[i].style.background) {
        hexMatches[i].classList.remove('selected');
        hexMatches[i].firstChild.nextSibling.innerHTML = '&#43;';
      }
    }

    hexFavoritesArr = Array.from(document.querySelectorAll('.favorite--color'));
    if (hexFavoritesArr.length < 1) {
      deleteFavoritesIcon.classList.remove('active');
    }
  }
});

// Remove all favorite colors using trashcan icon
deleteFavoritesIcon.addEventListener('click', function () {
  resetIcons();
  deleteFavoritesIcon.classList.remove('active');

  for (let i = 0; i < hexFavoritesArr.length; i++) {
    hexFavoritesArr[i].remove();
  }

  for (let i = 0; i < hexSelected.length; i++) {
    hexSelected[i].classList.remove('selected');
    hexSelected[i].firstChild.nextSibling.innerHTML = '&#43;';
  }
});

// Copy hexcodes to clipboard
let inputText = '';

clipboardIcon.addEventListener('click', () => {
  const selectedHex = document.querySelectorAll('.favorite--color');
  const selectedHexArr = [...selectedHex];
  for (let i = 0; i < selectedHexArr.length; i++) {
    inputText += selectedHexArr[i].innerText + ', ';
  }
  inputText = inputText.replace(/,\s*$/, '');

  navigator.clipboard
    .writeText(inputText)
    .then(function () {
      alert(`✔︎ Hex color codes copied to clipboard.`);
    })
    .catch(err => {
      alert('Something went wrong. Please try again.', err);
    });
  inputText = '';
});

// Color grid transition
window.addEventListener('load', event => {
  colorGrid.style.opacity = '1';
});

// Refresh color grid
document
  .querySelector('.refresh-colors')
  .addEventListener('click', function () {
    sortByText.textContent = 'By Hue';
    sortIcon.classList.remove('fa-random');
    sortIcon.classList.add('fa-sort');
    displayRandomColors();
    fadeTransition();
  });
