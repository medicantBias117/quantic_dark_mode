async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const invertColors = document.getElementById("invert_colors");
const brightness = document.getElementById("slider_brightness");
const color = document.getElementById("slider_color");
const saturation = document.getElementById("slider_saturation");

let isInverted = false;
let brightness_val = 100;
let hue_shift = 0;
let saturation_val = 100;

let check_for_storage = window.localStorage.getItem("brightness_val");
if (check_for_storage) {
  isInverted = window.localStorage.getItem("isInverted");
  brightness_val = window.localStorage.getItem("brightness_val");
  hue_shift = window.localStorage.getItem("hue_shift");
  saturation_val = window.localStorage.getItem("saturation_val");

  //set the values on the FE
  updateUI();
  updateFilters();
}

document.querySelectorAll(".autoModes").forEach( (el)=> {
    el.addEventListener("click", () => {
        document.querySelectorAll(".autoModes").forEach((item) => {
          item.classList.remove("active");
        });
        el.classList.add("active");

        let theme = el.innerText

        if (theme == "Study") {
          isInverted = true;
          brightness_val = 70;
          hue_shift = 50;
          saturation_val = 100;
          
        } else if (theme == "B&W") {
          isInverted = true;
          brightness_val = 70;
          hue_shift = 50;
          saturation_val = 0;
          
        } else if (theme == "Off Color") {
          isInverted = false;
          brightness_val = 85;
          hue_shift = 0;
          saturation_val = 50;
        }
        updateUI();
        updateFilters();
      });
      
})



function updateUI() {
  invertColors.checked = isInverted;
  brightness.value = brightness_val;
  color.value = hue_shift;
  saturation.value = saturation_val;

  document.getElementById("brightness-slider-val").innerText = brightness_val;
  document.getElementById("color-slider-val").innerText = hue_shift;
  document.getElementById("saturation-slider-val").innerText = saturation_val;

  //just in case
  window.localStorage.setItem("isInverted", isInverted);
  window.localStorage.setItem("brightness_val", brightness_val);
  window.localStorage.setItem("color-slider-val", hue_shift);
  window.localStorage.setItem("saturation_val", saturation_val);
}

invertColors.addEventListener("change", () => {
  if (invertColors.checked) {
    isInverted = true;
  } else {
    isInverted = false;
  }
  updateFilters();
  window.localStorage.setItem("isInverted", isInverted);
});

brightness.addEventListener("input", () => {
  //first update the current value
  document.getElementById("brightness-slider-val").innerText = brightness.value;
  brightness_val = brightness.value;
  window.localStorage.setItem("brightness_val", brightness_val);
  updateFilters();
});

color.addEventListener("input", () => {
  document.getElementById("color-slider-val").innerText = color.value;
  hue_shift = color.value;
  window.localStorage.setItem("hue_shift", hue_shift);
  updateFilters();
});

saturation.addEventListener("input", () => {
  document.getElementById("saturation-slider-val").innerText = saturation.value;
  saturation_val = saturation.value;
  window.localStorage.setItem("saturation_val", saturation_val);
  updateFilters();
});

async function updateFilters() {
  console.log("updateFilters");
  const tab = await getCurrentTab();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: updateCSS,
    args: [isInverted, brightness_val, hue_shift, saturation_val],
  });
}

function updateCSS(isInverted, brightness_val, hue_shift, saturation_val) {
  console.log("updateCSS");
  const pageRoot = document.getElementById("sp-page");

  if (!pageRoot) {
    console.log("ERROR! ROOT NOT FOUND");
  }

  let filter_vals = "";

  filter_vals += isInverted ? "invert(1) " : "";
  filter_vals +=
    brightness_val < 100 ? " brightness(" + brightness_val / 100 + ") " : "";
  filter_vals +=
    hue_shift > 0
      ? " hue-rotate(" + Math.round((hue_shift * 360) / 100) + "deg)"
      : "";
  filter_vals +=
    saturation_val < 100 ? " saturate(" + saturation_val / 100 + ") " : "";

  pageRoot.style.filter = filter_vals;
}

document.querySelector("button").addEventListener("click", ()=>{
    isInverted = false;
    brightness_val = 100;
    hue_shift = 0;
    saturation_val = 100;
  
    updateUI()
    updateFilters()
})
