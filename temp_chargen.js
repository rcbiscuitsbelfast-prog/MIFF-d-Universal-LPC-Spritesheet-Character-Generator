/**

 * @typedef {{
    fileName:string,
    zPos: number,
    custom_animation: string?,
    parentName: string,
    name: string,
    variant: string,
    supportedAnimations: string
  }} ItemToDraw

 * @typedef {{
      bodyTypeName: string,
      url: string,
      spritesheets: string,
      version: number,
      datetime: string,
      credits: string[],
  }} ItemsMeta
 */

$.expr[":"].icontains = function (a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

// copied from https://github.com/mikemaccana/dynamic-template/blob/046fee36aecc1f48cf3dc454d9d36bb0e96e0784/index.js
const es6DynamicTemplate = (templateString, templateVariables) =>
  templateString.replace(/\${(.*?)}/g, (_, g) => templateVariables[g]);

// adapted from tiny-debounce
// https://github.com/vuejs-tips/tiny-debounce/blob/ac7eb88715b9fb81124d4d5fa714abde0853dce9/index.js
function debounce(fn, delay) {
  let timeoutID = null;
  return function () {
    clearTimeout(timeoutID);
    const args = arguments;
    timeoutID = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// DEBUG mode will be turned on if on localhost and off in production
// but this can be overridden by adding debug=(true|false) to the querystring.
/*
debug isLocalhost result
true  true        true
true  false       true
false true        false
false false       false
unset true        true
unset false       false
*/
const boolMap = {
  true: true,
  false: false,
};
const bool = (s) => boolMap[s] ?? null;
const isLocalhost = window.location.hostname === "localhost";
const debugQueryString = () => bool(jHash.val("debug"));
const DEBUG = debugQueryString() ?? isLocalhost;

// Initialize performance profiler (uses same DEBUG flag as console logging)
const profiler = new PerformanceProfiler({
  enabled: DEBUG,
  verbose: false,
  logSlowOperations: true
});

// Always expose profiler for manual control
window.profiler = profiler;

$(document).ready(function () {
  let matchBodyColor = true;
  
  /** @type {ItemToDraw[]} */
  let itemsToDraw = [];

  /** @type {ItemsMeta} */
  let itemsMeta = {};

  let params = jHash.val();
  let sheetCredits = [];

  let imagesToLoad = 0;
  let imagesLoaded = 0;
  let didStartRenderAfterLoad = false;

  const canvas = $("#spritesheet").get(0);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const images = {};
  const universalFrameSize = 64;
  const universalSheetWidth = 832;
  const universalSheetHeight = 3456;

  const base_animations = {
    spellcast: 0,
    thrust: 4 * universalFrameSize,
    walk: 8 * universalFrameSize,
    slash: 12 * universalFrameSize,
    shoot: 16 * universalFrameSize,
    hurt: 20 * universalFrameSize,
    climb: 21 * universalFrameSize,
    idle: 22 * universalFrameSize,
    jump: 26 * universalFrameSize,
    sit: 30 * universalFrameSize,
    emote: 34 * universalFrameSize,
    run: 38 * universalFrameSize,
    combat_idle: 42 * universalFrameSize,
    backslash: 46 * universalFrameSize,
    halfslash: 50 * universalFrameSize,
  };
  
  const animationFrameCounts = {
	spellcast: 7,
	thrust: 8,
	walk: 9,
	slash: 6,
	shoot: 13,
	hurt: 6,
	climb: 6,
	idle: 2,
	jump: 5,
	sit: 3,
	emote: 3,
	run: 8,
	combat_idle: 2,
	backslash: 13,
	halfslash: 7
  };

  const sexes = ["male", "female", "teen", "child", "muscular", "pregnant"];

  const allElements = document.querySelectorAll("#chooser [id][type=radio]");
  const ids = Array.prototype.map.call(allElements, (el) => el.id);

  const getBodyTypeName = () => {
    return whichPropCheckedExact("sex", sexes);
  };

  // Preview Animation
  let past = Date.now();
  const anim = $("#previewAnimations").get(0);
  const animCtx = anim.getContext("2d");
  let animationItems = [1, 2, 3, 4, 5, 6, 7, 8]; // default for walk
  let animRowStart = 8; // default for walk
  let animRowNum = 4; // default for walk
  let currentAnimationItemIndex = 0;
  let activeCustomAnimation = "";
  let addedCustomAnimations = [];

  // on hash (url) change event, interpret and redraw
  jHash.change(function () {
    params = jHash.val();
    interpretParams();
    redraw();
  });

  interpretParams();
  if (Object.keys(params).length == 0) {
    $("input[type=reset]").click();
    setParams();
    selectDefaults();
  }
  redraw();
  showOrHideElements();
  nextFrame();

  function getParent(id) {
    const el = document.getElementById(id);
    return el.getAttribute("parentname");
  }

  // set params and redraw when any radio button is clicked on
  $("#chooser input[type=radio]").each(function () {
    $(this).click(function () {
      if (matchBodyColor) {
        matchBodyColorForThisAsset = $(this).attr("matchBodyColor");
        if (
          matchBodyColorForThisAsset &&
          matchBodyColorForThisAsset != "false"
        ) {
          selectColorsToMatch($(this).attr("variant"));
        }
      }
      setParams();
      redraw();
      showOrHideElements();
    });
  });

  $("#controls>details").on("toggle", function (event) {
    $("#preview-animations").toggleClass(
      "controls-open",
      $(event.target).attr("open")
    );
  });

  // Toggle display of a list elements children when clicked
