/*
  References to elements already on the page
*/
const modelViewer = document.getElementById("sofa");
const infoBox = document.getElementById("info");

/*
  These inputs are assumed to exist on the page:

  <input id="room-width"  type="number" placeholder="Room width (m)">
  <input id="room-depth"  type="number" placeholder="Room depth (m)">
  <div id="fit-result"></div>
*/
const roomWidthInput = document.getElementById("room-width");
const roomDepthInput = document.getElementById("room-depth");
const fitResult = document.getElementById("fit-result");

/*
  Store detected sofa size so we can reuse it
*/
let sofaSize = null;

/*
  Fired once the 3D model is fully loaded
*/
modelViewer.addEventListener("load", () => {
  const dimensions = modelViewer.getDimensions();

  /*
    Save real-world dimensions (meters)
  */
  sofaSize = {
    width: dimensions.x,
    depth: dimensions.z,
    height: dimensions.y,
  };

  infoBox.innerHTML += `
    <p>
      🛋️ <strong>Sofa dimensions detected:</strong><br>
      Width: ${sofaSize.width.toFixed(2)} m<br>
      Depth: ${sofaSize.depth.toFixed(2)} m
    </p>
  `;
});

/*
  Core logic: check if the sofa fits in the room
*/
function checkRoomFit() {
  if (!sofaSize) {
    fitResult.innerHTML = "⏳ Model not loaded yet.";
    return;
  }

  /*
    Read user-provided room dimensions
  */
  const roomWidth = parseFloat(roomWidthInput.value);
  const roomDepth = parseFloat(roomDepthInput.value);

  if (isNaN(roomWidth) || isNaN(roomDepth)) {
    fitResult.innerHTML = "⚠️ Please enter valid room dimensions.";
    return;
  }

  /*
    Compare sofa footprint vs room footprint
  */
  const fitsWidth = sofaSize.width <= roomWidth;
  const fitsDepth = sofaSize.depth <= roomDepth;

  /*
    Margin buffer (real homes need space to walk)
  */
  const WALKING_CLEARANCE = 0.6; // meters

  const comfortableWidth = sofaSize.width + WALKING_CLEARANCE <= roomWidth;
  const comfortableDepth = sofaSize.depth + WALKING_CLEARANCE <= roomDepth;

  /*
    Decide final result
  */
  if (fitsWidth && fitsDepth && comfortableWidth && comfortableDepth) {
    fitResult.innerHTML = `
      <p style="color:#27ae60; font-weight:600;">
        ✅ This sofa fits comfortably in your room.
      </p>
    `;
  } else if (fitsWidth && fitsDepth) {
    fitResult.innerHTML = `
      <p style="color:#f39c12; font-weight:600;">
        ⚠️ The sofa fits, but the room may feel tight.
      </p>
    `;
  } else {
    fitResult.innerHTML = `
      <p style="color:#c0392b; font-weight:600;">
        ❌ This sofa is too large for the room.
      </p>
    `;
  }
}

/*
  Re-check fit whenever the user changes room size
*/
roomWidthInput.addEventListener("input", checkRoomFit);
roomDepthInput.addEventListener("input", checkRoomFit);

/*
  Optional: re-check when entering AR
*/
modelViewer.addEventListener("ar-status", (event) => {
  if (event.detail.status === "session-started") {
    checkRoomFit();
  }
});
