const urlBase = 'https://api.noopschallenge.com/hexbot?count=';
const colorGrid = document.getElementById('color-grid');
const refreshColors = document.getElementById('refresh-colors');
const favoriteIcon = document.getElementById('favorite-icon');
const clipboardIcon = document.getElementById('clipboard-icon');
const removeFavorites = document.getElementById('remove-favorites');

// Returns black or white color based on relative darkness of hexcolor
getContrast = hexcolor => {
	// Removes leading #
	if (hexcolor.slice(0, 1) === '#') {
		hexcolor = hexcolor.slice(1);
	}
	// Convert hex to RGB value
	let r = parseInt(hexcolor.substr(0,2),16);
	let g = parseInt(hexcolor.substr(2,2),16);
  let b = parseInt(hexcolor.substr(4,2),16);
  
	// Get YIQ ratio
	let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	// Check contrast
  return (yiq >= 128) ? '#222' : 'white';
};

displayColors = colors => {

  let myColorsHtml = colors.map(color => {
    return `<div class="my--color" style="background: ${color.value};">
              <span class="add--favorite" 
                style="color:${getContrast(color.value)}; 
                opacity: 0.2;">&#43;
              </span>
              <span class="hex--color" 
                style="color:${getContrast(color.value)}; 
                opacity: 0;">${color.value}
              </span>
            </div>`
  }).join('') // myColorsHtml is an array. .join('') converts to avstring

  colorGrid.innerHTML = `${myColorsHtml}`;
}

// Determine color count based on viewport width
let colorCount;

let windowWidth = window.innerWidth;

colorCountByWidth = windowWidth => {

  if (windowWidth < 576) {
    colorCount = 24;
  }
  if (windowWidth >= 576) {
    colorCount = 48;
  }
  if (windowWidth >= 768) {
    colorCount = 66;
  }
  if (windowWidth >= 1024) {
    colorCount = 96;
  }
  if (windowWidth >= 1366) {
    colorCount = 132;
  }
  if (windowWidth >= 1440) {
    colorCount = 154;
  }
  return colorCount;
}

console.log(`Initial window width is ${windowWidth}.`);
console.log(`Initial color count is ${colorCountByWidth(windowWidth)}.`);

async function getColors(colorCount) {
  const url = urlBase + colorCount;
  let response = await fetch(url);
  let data = await response.json();
  let colors = data.colors;
  displayColors(colors)
}

getColors(colorCount);

// Refresh colors using refresh icon
refreshColors.addEventListener('click', function() {
  getColors(colorCount);
})

// Fade in on reload
window.onload = function() {
  colorGrid.style.opacity = 1;
}

activateIcons = () => {
  favoriteIcon.classList.add('icon-active');
  clipboardIcon.classList.add('icon-active');
};

resetIcons = () => {
  removeFavorites.classList.remove('active');
  favoriteIcon.classList.remove('icon-active');
  clipboardIcon.classList.remove('icon-active');
};

// Add color to favorites
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('add--favorite')) {
    activateIcons();
    event.target.innerHTML = "&#8722;";
    event.target.parentElement.classList.add('selected');
    let hexText = event.target.nextElementSibling.innerText;
    let node = document.createElement("li");
    node.classList.add("favorite--color");
    node.style.background = hexText;
    node.style.color = getContrast(hexText);
    let textnode = document.createTextNode(hexText);
    node.appendChild(textnode);
    document.getElementById("favorite-colors").appendChild(node);
  }

  let hexFavorites = document.querySelectorAll('.favorite--color');
  let hexFavoritesArr = [...hexFavorites];

  if (hexFavoritesArr.length > 1) { 
    removeFavorites.classList.add('active');
  }
}, false);

// Removes single color from favorites and activates corresponding color tile in grid
// Convert rgb string from DOM into hexcode format to match innerText

rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

document.addEventListener('click', function(event) {
  if (event.target.classList.contains('favorite--color')) {
    let hexText = event.target.innerHTML;
    event.target.remove();
    
    // Resets favorite icon, clipboard icon, and remove all if no favorites remain
    if (document.getElementById('favorite-colors').firstChild === null) {
      resetIcons();
    }

    let hexMatches = document.querySelectorAll('.my--color.selected');
    for (let hexMatch of hexMatches) {
      let rgb = hexMatch.style.background;
      let rgbString = rgb.slice(4, -1).replace(/\s+/g, '');
      let rgbStringArr = rgbString.split(',');
      const toNumbers = arr => arr.map(Number);
      let rgbNumbers = toNumbers(rgbStringArr);
      // ES6 spread turns array data into a list of arguments
      let hexValues = rgbToHex(...rgbNumbers);
      let hexValuesUppercase = hexValues.toUpperCase();
      if (hexText === hexValuesUppercase) {
        hexMatch.classList.remove('selected');
        hexMatch.firstChild.nextSibling.innerHTML = '&#43;';
      }
    }
  } 
}, false);

// Remove all favorite colors using trashcan icon

removeFavorites.addEventListener('click', function() {
  resetIcons();
  removeFavorites.classList.remove('active');

  let hexFavorites = document.querySelectorAll('.favorite--color');
  let hexFavoritesArr = [...hexFavorites];

  let hexSelected = document.querySelectorAll('.my--color.selected');
  hexSelectedArr = [...hexSelected];

  for (let i = 0; i < hexFavoritesArr.length; i++) {
    for (let j = 0; j < hexSelectedArr.length; j++) {
      if (hexFavoritesArr[i].innerText === 
        hexSelectedArr[j]. childNodes[2].nextElementSibling.innerText) {
        hexFavoritesArr[i].remove();
        hexSelectedArr[j].classList.remove('selected');
        hexSelectedArr[j].childNodes[1].innerHTML = '&#43;';
      } 
    }
  }
  // Removes any favorites from previous color grid
  for (let i = 0; i < hexFavorites.length; i++) {
    hexFavorites[i].remove();
  }
});

// Copy hexcodes to clipboard

let inputText = '';

// function selectFavorites() {
//   const selectedHex = document.querySelectorAll(".favorite--color");
//   const selectedHexArr = [...selectedHex];
//   for (let i = 0; i < selectedHexArr.length; i++) {
//     inputText += selectedHexArr[i].innerText + ", ";
//   }
//   inputText = inputText.replace(/,\s*$/, "");
//   return inputText;
// }

clipboardIcon.addEventListener('click', () => {
  const selectedHex = document.querySelectorAll(".favorite--color");
  const selectedHexArr = [...selectedHex];
  for (let i = 0; i < selectedHexArr.length; i++) {
    inputText += selectedHexArr[i].innerText + ", ";
  }
  inputText = inputText.replace(/,\s*$/, "");

  navigator.clipboard
    .writeText(inputText)
    .then(function() {
      alert('✔︎ Copied to clipboard.');
    })
    .catch(err => {
      alert('Something went wrong', err);
    })
});




