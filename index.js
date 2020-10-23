const urlBase = 'https://api.noopschallenge.com/hexbot?count=';
const colorGrid = document.getElementById('color-grid');
const refreshColors = document.getElementById('refresh-colors');
const favoriteIcon = document.getElementById('favorite-icon');
const clipboardIcon = document.getElementById('clipboard-icon');
const removeFavorites = document.getElementById('remove-favorites');

// Returns black or white color based on relative darkness of hexcolor
function getContrast(hexcolor) {
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

function displayColors(colors) {

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

function colorCountByWidth(windowWidth) {

  if (windowWidth < 576) {
    colorCount = 24;
  }
  if (windowWidth >= 576) {
    colorCount = 50;
  }
  if (windowWidth >= 768) {
    colorCount = 84;
  }
  if (windowWidth >= 1024) {
    colorCount = 112;
  }
  if (windowWidth >= 1200) {
    colorCount = 126;
  }
  if (windowWidth >= 1440) {
    colorCount = 132;
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

// Message variable contains the div object which 
// is used to display message after we are done resizing 
let message = document.getElementById("Resizing complete"); 

// timeOutFunctionId stores a numeric ID which is  
// used by clearTimeOut to reset timer 
let timeOutFunctionId; 

// The function that we want to execute after  
// we are done resizing 
function workAfterResizeIsDone() {
  windowWidth = window.innerWidth;
  console.log(`New color count is ${colorCountByWidth(windowWidth)}.`);
  getColors(colorCount);
} 

// The following event is triggered continuously 
// while we are resizing the window 
window.addEventListener("resize", function() { 
    
    // clearTimeOut() resets the setTimeOut() timer 
    // due to this the function in setTimeout() is  
    // fired after we are done resizing 
    clearTimeout(timeOutFunctionId); 
    
    // setTimeout returns the numeric ID which is used by 
    // clearTimeOut to reset the timer 
    timeOutFunctionId = setTimeout(workAfterResizeIsDone, 500); 
});

// Fade in on reload
window.onload = function() {
  colorGrid.style.opacity = 1;
}

// Add color to favorites - li approach
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('add--favorite')) {
    favoriteIcon.src = 'images/add-to-favorites-icon-active.png';
    clipboardIcon.classList.add('icon-active');
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

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

document.addEventListener('click', function (event) {
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

function resetIcons() {
  favoriteIcon.src = 'images/add-to-favorites-icon.png';
  clipboardIcon.classList.remove('icon-active');
}

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
});

// Copy color hexcodes to clip board
copiedHexCodes = "";

clipboardIcon.addEventListener("click", copyText);
function copyText() {
  let copyText = document.querySelectorAll(".favorite--color");

  let copyTextArr = [...copyText];
  
  for (let i = 0; i < copyTextArr.length; i++) {
    copiedHexCodes += copyTextArr[i].innerText + ", ";
  }

  let formattedHexCodes = copiedHexCodes.replace(/,\s*$/, "");

  let copyTextArea = document.getElementById('copied-content');
  copyTextArea.innerHTML = formattedHexCodes;
  copyTextArea.focus();
  copyTextArea.select();

  try {
    let successful = document.execCommand('copy');
    let msg = successful ? 'Successfully' : 'unsuccessful';
    alert(`${msg} copied ${formattedHexCodes} to the clipboard.`);
  } catch(err) {
    alert('Unable to copy');
  }
  copiedHexCodes = "";
}




