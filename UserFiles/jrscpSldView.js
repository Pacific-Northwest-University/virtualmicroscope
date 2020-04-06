// jrscpSldView.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpSldView.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	Currently, "PNWU Microscope" consists of 15 principal files and other supplementary files:
//		- one HTML file.
//		- one cascading style sheet 
//		- nine javascript files (including jrscpSldView.js)
//		- four PHP files
//	jrscpSldView.jscontains javascript functions that are involved in displaying the 
//		slideView-planes that contain the part of the specimen that currently is loaded.  
//		This file also contains the imgCache functions.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//	  ***************************************************************************************
//	  **************               PRINCIPAL slideView FUNCTIONS               **************
//	  ***************************************************************************************


	// sldImgIdStr() returns a string containing the 'id' of a slideView image element.
	// sldImgSrcStr() returns a string containing the 'src' of a slideView image element
	//	  To maintain forward compatibility, ALL references to a slideView img MUST use these functions
	//	sldPlane is the object  in the array (e.g. sldVw[] or destSldVw[] that contains 
	//		the 'img' element being referenced.  Originally, sldImgIdStr() was passed an integer (arrI)
	//		that was the index to the element in sldVw[] (e.g. see sldImgSrcStr()), but we needed
	//		to generalize this function when the destruction array was added (on 7/24/19).
	//	yId is the ID-number of the row (y-value) component of the 'img' element id
	//	xId is the ID-number of the tile (x-value) component of the 'img' element
function sldImgIdStr(sldPlane, yId, xId){
	return("img" + sldPlane.f + "_" + sldPlane.z + "_" + yId + "_" + xId);
	}

function sldImgSrcStr(arrI, yId, xId) {
	return(sldVw[arrI].dbRoot + yId + "/" + xId + ".jpg");
	}


function sldInitializeView() {
		// NOTE on 8/13/19, replaced references to sldStrtF (a local variable) with glbSldFDef (a global variable)
		//		since the two variables seemed redundant.
		// glbSldFDef & glbSldStrtZ must match values in sldVw[0] and in id string for 1st slideView
	var sldNodeIdStr = "slideView_f" + glbSldStrtF + "z" + glbSldStrtZ;
	var sldRootStr = "";
	
	var bndBoxWidth = parseInt(window.innerWidth) - 4;  // width of sldBndBox (<div id="sldBndBox>); assigned below
	  //   border height is 2px so bndBoxHeight is 4px + menuHeight less than window height
	var bndBoxHeight = parseInt(window.innerHeight) - (glbMenuTotHt + 4);  // height of sldBndBox
	document.getElementById("sldBndBox").style.display = "block";
	document.getElementById("IntroPage").style.display = "none";

	  // set-up bndBox ... 
	  //   border width is 2px so bndBoxWidth is 4px less than innerWidth
	  //     (don't use "box-sizing: border-box" for sldBndBox because we want internal dimensions for slideView)
	  //   border height is 2px so top is 2px more than menu
	document.getElementById("sldBndBox").style.top = glbMenuTotHt + "px";
	document.getElementById("sldBndBox").style.left = "0px";
	document.getElementById("sldBndBox").style.borderWidth = "2px";
	document.getElementById("sldBndBox").style.width = bndBoxWidth + "px";
	document.getElementById("sldBndBox").style.height = bndBoxHeight + "px";
	  // set-up first (immediately-visible) slideView plane
	var maxPixel = 0;  // used to check glbVwFoxX,Y
	var minPixel = 0;  // used to check glbVwFoxX,Y
	var curZ = glbSldStrtZ;  // used to check glbVwFoxX,Y
	menuSetZMag(curZ);  // display current magnification
			// if initial x-position (initial glbVwFoxX) was set by the command-line, 
			//		check to make certain that the value of glbVwFocX is valid
	if (!Number.isNaN(glbVwFocX)) {
		maxPixel = (dbSldData[curZ].strtX + dbSldData[curZ].numX) * dbSldData[curZ].zMult * glbTileSzX;
		minPixel = dbSldData[curZ].strtX * dbSldData[curZ].zMult * glbTileSzX;
		if (glbVwFocX < minPixel) {
			warnBoxCall(true,"Low x-value",'The initial value set for the x-position (\"' + glbVwFocX 
					+ '\") is less than the minimum x-pixel value (\"' + minPixel + '\") at this zoom-level. '
					+ '<br>&nbsp; The specimen initially will be centered at the minimum x-pixel value.');
			glbVwFocX = minPixel;
			}
		else if (glbVwFocX > maxPixel) {
			warnBoxCall(true,"High x-value",'The initial value set for the x-position (\"' + glbVwFocX
					+ '\") is greater than the maximum number of pixels along the x-axis (\"'
					+ maxPixel + '\") at this zoom-level.'
					+ '<br>&nbsp;  The specimen initially will be centered at the maximum x-pixel value.');
			glbVwFocX = maxPixel;
			}
		}
			// if initial y-position (initial glbVwFoxY) was set by the command-line, 
			//		check to make certain that the value of glbVwFocY is valid
	if (!Number.isNaN(glbVwFocY)) {
		maxPixel = (dbSldData[curZ].strtY + dbSldData[curZ].numY) * dbSldData[curZ].zMult * glbTileSzY;
		minPixel = dbSldData[curZ].strtY * dbSldData[curZ].zMult * glbTileSzY;
		if (glbVwFocY < minPixel) {
			warnBoxCall(true,"Low y-value",'The initial value set for the y-position (\"' + glbVwFocY 
					+ '\") is less than the minimum y-pixel value (\"' + minPixel + '\") at this zoom-level. '
					+ '<br>&nbsp; The specimen initially will be centered at the minimum y-pixel value.');
			glbVwFocY = minPixel;
			}
		else if (glbVwFocY > maxPixel) {
			warnBoxCall(true,"High y-value",'The initial value set for the y-position (\"' + glbVwFocY
					+ '\") is greater than the maximum number of pixels along the y-axis (\"'
					+ maxPixel + '\") at this zoom-level.'
					+ '<br>&nbsp;  The specimen initially will be centered at the maximum y-pixel value.');
			glbVwFocY = maxPixel;
			}
		}
		// set glbVwFocX,Y not already set, set them to  to middle of specimen
		//		these calculations assume that sldVw[].dbPixelOffX,Y == 0 && sldVw[].dbTileOffX,Y == 0
	if (Number.isNaN(glbVwFocX)) {
		glbVwFocX = Math.floor(((((dbSldData[curZ].numX/2) + dbSldData[curZ].strtX) * glbTileSzX) + 0.5) * dbSldData[curZ].zMult);
		}
	if (Number.isNaN(glbVwFocY)) {
		glbVwFocY = Math.floor(((((dbSldData[curZ].numY/2) + dbSldData[curZ].strtY) * glbTileSzY) + 0.5) * dbSldData[curZ].zMult);
		}
			// as of 10/28/19, 1st slideView plane is created by call to sldAddPlane() - below
	sldAddPlane(glbSldStrtF,dbRoot,curZ);
	sldVw[0].sldNode.style.visibility = "visible";
	sldVwI = 0;
	sldVw[0].sldVis = true;
			// set focus controls for sldVw[0].z
	sldBuildSlideView(0);
	  // attach onmouse event to sldBndBox; do this after sldBuildSlideView is done.
	document.getElementById("sldBndBox").onmousemove = function(event){sldBndBoxMusMv(event)};
	document.getElementById("sldBndBox").onmouseout = function(event){sldBndBoxMusOut(event)};
	document.getElementById("sldBndBox").onmousedown = function(event){sldMoveViewMusDown(event)};
	document.getElementById("sldBndBox").onmouseup = function(event){sldMoveViewMusReset(event)};
	document.getElementById("sldBndBox").ondblclick = function(event){sldMusDblClk(event)};
	document.getElementById("sldBndBox").onwheel = function(event){sldMusWhlScroll(event)};
	document.getElementById("sldBndBox").onmousemove.bubbles = true;
	document.getElementById("sldBndBox").onmouseout.bubbles = true;
	document.getElementById("sldBndBox").onmousedown.bubbles = true;
	document.getElementById("sldBndBox").onmouseup.bubbles = true;
	document.getElementById("sldBndBox").ondblclick.bubbles = true;
	document.getElementById("sldBndBox").onwheel.bubbles = true;
		// attach touchEvents to sldBndBox; do this after sldBuildSlideView is done.
		//	1/02/20: added useCapture="true" => this should have made event.target = "sldBndBox"
		//		but it doesn't seem to have any effect; target still is slideView plane 
		//		(child of "sldBndBox") if touchEvent occurs on specimen
	document.getElementById("sldBndBox").addEventListener("touchstart", tchSldVwStrt,true);
	document.getElementById("sldBndBox").addEventListener("touchend", tchSldVwEnd,true);
	document.getElementById("sldBndBox").addEventListener("touchcancel",tchSldVwEnd,true);
	document.getElementById("sldBndBox").addEventListener("touchmove",tchSldVwMv,true);
			// set sldBndBox mouse cursor control
	document.getElementById("sldBndBox").style.cursor = "default";
			// display of focus controls
	if ((dbMaxF == 1) || glbFDisabled) { sldHideFCntrl(); }
	else { sldShowFCntrl(); }
	if (!document.getElementById("menuNavVisCheckBx").checked) {
		document.getElementById("sldNavigator").style.display = "none";
		}
	else { document.getElementById("sldNavigator").style.display = "block"; }
	document.getElementById("menuNavVisCheckBx").disabled = false;
	document.getElementById("menuCreditCheckBx").disabled = false;
		// credit box is always checked when a new slide is initialized => see prgInitVar()
		//	need to set "sldCreditBox" to display = "block" in case credit box had been hidden on previous slide
	document.getElementById("sldCreditBox").style.display = "block";
	sldMusWheelSelect(null,glbMusWheelFZ);  // initialize the mouse-wheel selection radio-boxes
			// set-up other focal planes
	if ((dbMaxF > 1) && glbFDisabled) { sldDisableF(); }  // focusing is disabled, don't buffer focal planes
	else { sldAddFZBuffer(); } // add buffer planes
			// since initialization is complete, hide "Choose a slide" box so program can't attempt a 2nd initialization
	document.getElementById("sldSelBox").style.display = "none";
	if (glbIsWaitBxActive) { waitMkBox(); }  // need to update waitBox if it was opened before initialization
	return;
	}


	// sldResizeSldVw() is called when the browser window is resized.
	//   The function first uses sldBuildSlideView() to re-size (re-bulid) the visible slideView
	//    and then it uses sldBuildSlideView() to re-size all other slideView elements.
function sldResizeSldVw() {
	  // only resize slideView if it has been initialized
	if (document.getElementById("sldBndBox").style.display != "block") {
		return;
		}
			// turn-off any timers
	if (!Number.isNaN(sldMusSlwDwn.timer)) {  // interrupt mouse-scrolling-slow-down
		sldMusSlwDwnTimerReset();
			// don't need to move stack since stack will be rebuilt using glbVwFocX,Y
		}
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }  // turn-off F-plane cycling
		// probablly don'd need to turn-off destruction timer.
		
	var i;
		// resize sldBndBox
	var bndBoxWidth = parseInt(window.innerWidth) - 4;  // width of sldBndBox => assigned below
	  //   border height is 2px so bndBoxHeight is 4px + menuHeight less than window height
	var bndBoxHeight = parseInt(window.innerHeight) - (glbMenuTotHt + 4);  // height of sldBndBox
	document.getElementById("sldBndBox").style.top = glbMenuTotHt + "px";
	document.getElementById("sldBndBox").style.width = bndBoxWidth + "px";
	document.getElementById("sldBndBox").style.height = bndBoxHeight + "px";
		// re-build currently visible slideView plane
	sldBuildSlideView(sldVwI);
		// after visible slideView plane is re-built, re-build other slideView planes
	for (i = 0; i < sldVw.length; i++) {
		if (i == sldVwI) {
			continue;
			}
		else { 
			sldBuildSlideView(i); 
			}
		}
	return;
	}


	// at leaset for now, sldAddPlane() assumes that:
	//  (1) there > 0 slideView nodes in document (as child of sldBndBox); since every slideView node must
	//       have a corresponding entry in sldVw[], this implies that sldVw.length > 0.
	//  (2) the order of entries in sldVw[] corresponds to the order of slideView nodes in sldBndBox; i.e.,
	//       sldVw planes will be added to the end of the sldVw array, and will be removed by splicing the array.
	//  sldAddPlane() gets the parameters for the new slideView plane from a table (dbSldData[]).  Eventually,
	//		the values for this table will be obtained from the server.
	//  It will be important that every node have a unique id.  This cannot be the sldVw array index, since that
	//    will change when planes are spliced out of the array.  We will use a ombination of FP & ZL, since that
	//    should be unique.  However, addressing the node should be made by through the sldNode element of sldVw[]
	// sldAddPlane() is passed:
	//   fNum, which the number of the focal level,
	//   fSrcStr, which is a text string that, after appending fNum + '/' + zNum + '/' will be the root to the
	//      the y-level image directories.
	//   zNum, which is the number of the zoom level
function sldAddPlane(fNum,fSrcStr,zNum) {
	var i;
	var sldNode = null;
	var sldWaitArr = [];
	var newArrI = sldVw.length;  // end of sldVw[], will be index of new element
	var newNodeIdStr = "slideView_f" + fNum + "z" + zNum;
	  // check for pre-existing fNum,zNum in sldVw[]
	for (i = 0; i < newArrI; i++) {
		if ((sldVw[i].f == fNum) && (sldVw[i].z == zNum)) {
			alert('sldAddPlane(): slideView plane with focal-plane = \"' + fNum +'\" and zoom-level = \"' + zNum + '\" already exists.  Cannot create new slideView plane.');
			return;
			}
		}
	  // check for pre-existing sldNode
	sldNode = document.getElementById(newNodeIdStr);
	if (sldNode != null) {
		alert('sldAddPlane(): slideView plane with id = \"' + newNodeIdStr + '\" already exists.  Cannot create new slideView plane.');
		return;
		}
		// create slideView node
	sldNode = document.createElement("div");
	sldNode.id = newNodeIdStr;
	sldNode.className = "grTileGrid";
	sldNode.style.visibility = "hidden";
	document.getElementById("sldBndBox").appendChild(sldNode);

		// create new entry in sldVw[]
	sldVw[newArrI] = new sldViewC(false,0,0,1,0,0,0,0,null,null,0,0,0,0,"");
	sldVw[newArrI].sldVis = false;
	sldVw[newArrI].sldWait = false;
	sldVw[newArrI].f = fNum;
	sldVw[newArrI].z = zNum;
	sldVw[newArrI].zMult = dbSldData[zNum].zMult;
		//	tiStrtXId, tiMxNumX, tiStrtYId, tiMxNumY will be set by sldBuildSlideView()
	sldVw[newArrI].sldNode = sldNode;
	sldVw[newArrI].dbStrtXId = dbSldData[zNum].strtX;
	sldVw[newArrI].dbMxNumX = dbSldData[zNum].numX;
		// dbTileOffX & dbPixelOffX are assumed to be 0
	sldVw[newArrI].dbStrtYId = dbSldData[zNum].strtY;
	sldVw[newArrI].dbMxNumY = dbSldData[zNum].numY;
	sldVw[newArrI].sldWaitArr = sldWaitArr;
		// dbTileOffY & dbPixelOffY are assumed to be 0
	if (dbMaxF == 1) {  // no f-directory level if only 1 focal plane
		sldVw[newArrI].dbRoot = fSrcStr + zNum + "/";
		}
	else {
		sldVw[newArrI].dbRoot = fSrcStr + fNum + "/" + zNum + "/";
		}
	sldBuildSlideView(newArrI);  // create grid & add images

		// update "View-planes loaded" in "Slide Info" menu
	document.getElementById("menuSldVwSzVal").innerHTML = sldVw.length;
	return;
	}


function sldBuildSlideView(arrI) {
	var i;
	var bndBoxWidth = parseInt(document.getElementById("sldBndBox").style.width);
	var bndBoxHeight = parseInt(document.getElementById("sldBndBox").style.height);
	var sldNode = sldVw[arrI].sldNode;
	var sldWinSzX = bndBoxWidth + (2 * glbSldXYBuf * glbTileSzX);  // width of slideView in pixels 
	var sldWinSzY = bndBoxHeight + (2 * glbSldXYBuf * glbTileSzY);  //height of slideView in pixels
	// updtNumInRow is new number of tiles in row & updtNumRows is new number of rows of tiles 
	var updtNumInRow = Math.ceil(sldWinSzX / glbTileSzX);  
	var updtNumRows = Math.ceil(sldWinSzY / glbTileSzY); 
	var wrkTxt = "";  // text scratch sheet;
	var imgId = "";   // name img being appended ... currently use old format
		// check to make sure that updtNumInRow doesn't exceed the number of jpegs in row - for this Z-level
		//    and that updtNumRows doesn't exceed number of rows of jpegs - for this Z-level
	if (updtNumInRow > sldVw[arrI].dbMxNumX) { updtNumInRow = sldVw[arrI].dbMxNumX; }
	if (updtNumRows > sldVw[arrI].dbMxNumY) { updtNumRows = sldVw[arrI].dbMxNumY; }
		//  set-up grid style for window size	
		   // set grid-template-columns
	for (i = 0; i < updtNumInRow; i++) {
		wrkTxt += glbTileSzX + "px ";
		}
	sldNode.style.gridTemplateColumns = wrkTxt;
	    // set grid-template-rows
	wrkTxt = "";
	for (i = 0; i < updtNumRows; i++) {
		wrkTxt += glbTileSzY + "px ";
		}
	sldNode.style.gridTemplateRows = wrkTxt;
	  //strtTile is an object that holds values returned by sldConvertSlideToScr()
	  //  these are slideView's left, ColStartId, top, and RowStartId
	var strtTile = sldConvertSlideToScr(Number.NaN,Number.NaN,glbVwFocX,glbVwFocY,arrI,updtNumInRow,updtNumRows);
	  // use sldGoToView() to build slideView
	sldGoToView(arrI,strtTile.left,strtTile.strtCol,updtNumInRow,strtTile.top,strtTile.strtRow,updtNumRows);
	return;
	}


	// sldAddRowToEnd() appends a row of images to sldNode (slideView);
	//  This function only works properly if it is called for each row starting with an empty slideView
	//	   sldNode is a pointer to the slideView element to which images are added
	//	   imgRowId is the number-ID (i.e., number of directory containing row of jpegs) of the row
	//     imgColStartId is the number-ID (i.e., jpeg name) of current first image in row
	//	   imgNumInRow is the number of images (tiles) in row
	//  The function returns the number of images appended; on error -1 is returned.
function sldAddRowToEnd(sldNode,arrI,imgRowId,imgColStartId,imgNumInRow) {
	var i;
	var imgColId;
	var imgIdTxt = "";
	var imgNode;
	
	for (i=0; i < imgNumInRow; i++){
		imgColId = imgColStartId + i;
		imgIdTxt = sldImgIdStr(sldVw[arrI],imgRowId,imgColId);
		imgNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgIdTxt,sldImgSrcStr(arrI,imgRowId,imgColId),arrI);
		if (imgNode == null) {
			alert('sldAddRowToEnd(): could not find/create \"' + imgIdTxt + '\" - ABORTING ROW CREATION")');
			return(-1);
			}
		if (sldNode.appendChild(imgNode) != imgNode) {
			alert('sldAddRowToEnd(): could not add \"' + imgIdTxt + '\" to slideView- ABORTING ROW CREATION")');
			return(-1);
			}
		}
	return(i);
	}


	// sldGetNewImgNode() returns an "img" with the specified 'id'.
	//	If the "new" image already exists (e.g. its in the Cache, sldGetNewImgNode() returns the node.
	//  	otherwise sldGetNewImgNode creates new "img" element and returns the pointer to the new node 
	//	On 11/06/19, added arrI, which is an index to the view-plane of which the imageNode is a child,
	//		so that this function could efficiently update the wait box.
function sldGetNewImgNode(sldWaitArr,imgNodeId,imgSrc,arrI) {
	var wtBxNode;  // node pointing to 'missing tiles <td> in waitBox
	var imgNode = document.getElementById(imgNodeId);
	var i;
	var sldCacheIndex;
		// if "img" with this id already is in use, 
		//		we have a problem since a node cannot have two locations in document 
	if (imgNode != null)  { // an "img" with this id already is in use
		alert('Warning:  ' + imgNodeId + ' (\"' + imgNode.src + '\") already is in use.');
		return(imgNode);
		}
		// look for image in glbImgCache
		//	Reverse order on 'for' loop because image most likely at top of cache
		//	NOTE:  NEED TO CHECK/SET tileSz once we have implemented 'digital' zoom
	for (i=glbImgCache.length - 1; i >= 0; i--) {
		if (glbImgCache[i].id == imgNodeId) {
			imgNode = glbImgCache[i];
			glbImgCache.splice(i,1);
			return(imgNode);
			}
		}
		// new image doesn't exist => create it
	imgNode = document.createElement("IMG");
	imgNode.id = imgNodeId;
	sldWaitArr.push(imgNodeId);
	imgNode.src = imgSrc;
	imgNode.height = glbTileSzY;
	imgNode.width = glbTileSzX;
	imgNode.style.pointerEvents = "none";
	imgNode.onload = function() {sldImgLoaded(this.id)};
	if (glbIsWaitBxActive) {
		wtBxNode = document.getElementById("wtMTile"+arrI);
		if (wtBxNode != null) {
			wtBxNode.innerHTML = sldWaitArr.length;
			}
		}
	return(imgNode);
	}

	// sldConvertScrToSlide() converts boundary-box X,Y coordinates (scrX,Y) to slide coordinates
	//    assuming zoom-level of sldVw[arrI].  arrI almost always will be sldVwI.
	//    Boundary-box coordinates are screen coordinates corrected for the boundary-box border.
	//  The function returns the slide coordinates as an {x,y} object.
	//    If updtVwFoc == true, the function also copies these slide coordinates to glbVwFocX,Y.
	//   In order to determine whether to display x,y values, sldBndBoxMusMv() needs to determine if the mouse is
	//      on the slide (the slide can be scrolled so that the field-of-view extends above/below/left/right of the
	//      specimen).  To determine this, sldBndBoxMusMv() needs to know the coordinates at the current-zoom-level
	//      view relative to the upper left corner of the first tile in the database at this zoom-level.  To 
	//      accommodate this, sldConvertScrToSlide() returns two X,Y pairs:
	//   sldCoord.sldX,Y are the absolute coordinates from the upper-left corner of a theoretical 0,0 tile  
	//      (eventually corrected to maximum zoom-level)
	//   sldCoord.levX,Y are the zoom-level specific coordinates relative to the upper-left corner of the first tile in
	//      the database for sldVw[arrI} slideView-plane (NOT corrected for zoom-level.
	
function sldConvertScrToSlide(argX, argY, arrI, updtVwFoc) {
	   // if argX or argY is NaN, use middle of screen for scrX,Y
	var scrX = argX;
	var scrY = argY;
	if (Number.isNaN(scrX)) {
		scrX = parseInt(document.getElementById("sldBndBox").style.width) / 2;
		}
	if (Number.isNaN(scrY)) {
		scrY =  parseInt(document.getElementById("sldBndBox").style.height) / 2;
		}
	var sldCoord = {sldX: 0, sldY: 0, levX: 0, levY: 0};   // an object in which to return the slide coordinates
	var sldZMult = sldVw[arrI].zMult;  //  this is true only for highest Zoom-level; will need to make this a variable accessible through
	var sldNode = sldVw[arrI].sldNode;  // pointer to the slideView level whose screen coordinates are being converted
		//levSldViewX,Y is slideView's upper-left corner to the upper-left corner of sldBndBox
		// The units for sldViewX,Y are pixels at the current Z level.
		  // sldX will be negative if left side of slideView is to the left of BndBox's left
	var levSldViewX = parseInt(sldNode.style.left);
	  // sldY will be negative if top of slideView is above top of BndBox	
	var levSldViewY = parseInt(sldNode.style.top);  // slideView's top relative to BndBox
		  // levOutViewX,Y are the number of pixels (at the current zoom-level;
		  //		 i.e sldVw[arrI].z) between the top,left corner of the first tile
		  //   in the data-base for the current zoom-level and the top-left corner of the first tile in slideView
	var levOutViewX = (sldVw[arrI].tiStrtXId - sldVw[arrI].dbStrtXId) * glbTileSzX;
	var levOutViewY = (sldVw[arrI].tiStrtYId - sldVw[arrI].dbStrtYId) * glbTileSzY;
	  // levX,Y is the zoom-level-specific coordinate of scrX,Y relateive to the upper-left corner of the first tile in the
	  //     database at current zoom-level.  This coordinate is useful for telling whether the mouse is on the specimen
	  //     or is on blank space.
	  // The slideView zoom-level coordinates for the top,left corner of the screen (actually, the bounding box ... sldBndBox)
	  //   are the number of out-of-view pixels corrected for the offset of slideView relative to the bounding box.
	  // The slideView zoom-level coordinate of scrX,Y is the slideView zoom-level coordinate of the upper/left cornoer of 
	  //   the bounding box + scrX,Y :
	var levX = levOutViewX - levSldViewX + scrX;
	var levY = levOutViewY - levSldViewY + scrY;
	  // In order to convert levX,Y into zoom-level-independent coordinates, two further adjustments are needed.
	  // First, since the first tile of each zoom-level in the database is not 0,0, we need to add distance from 
	  //  the global (zoom-level) origin to the coordinate of the upper,left corner of the first tile in the database
	  //  database(at the current zoom-level). On 11/01/19, I deleted the reference to dbTileOffX,Y (and
	  //  dbPixelOffX,Y) since these are 0 if libvips centered the pyramid.
	var levFixOrigX = sldVw[arrI].dbStrtXId * glbTileSzX;
	var levFixOrigY = sldVw[arrI].dbStrtYId * glbTileSzY;
	  // Second, we need to use sldVw[].zMult to correct for the fact that one pixel at the current zoom-level corresponds
	  //   to zMult pixels at the highest magnification.
	  //  The term (sldZMult/2) is included because a pixel at any zoom-level < maximum zoom level represents a cluster of
	  //    pixels and we want the coordinates of the middle of the cluster.  For cases where sldZMult%2 is not 0 (which
	  //    probably only occurs at the maximum zoom level, we choose the lower pixel, since the origin has a value of 0,0.  
	var sldX = Math.floor((sldZMult * (levFixOrigX + levX)) + (sldZMult/2));
	var sldY = Math.floor((sldZMult * (levFixOrigY + levY)) + (sldZMult/2));
       // results will be returned as sldCoord	
	sldCoord.levX = levX;
	sldCoord.levY = levY;
	sldCoord.sldX = sldX;
	sldCoord.sldY = sldY;
	  // if flagged, global coordinates to glbVwFocX,Y	
	if (updtVwFoc == true) {
		glbVwFocX = sldX;
		glbVwFocY = sldY;
		}
	return (sldCoord);
	}


	// sldConvertSlideToScr() is passed the screen (scrArgX,Y) and global (vfX,Y) coordinates of point on the specimen,
	//   and the index (arrI) of a sldVw[] plane.  If scrArgX,Y == NaN, then the middle of the screen is calculated & used.
	//   The function also is passed tiNumSldVwX,Y because the number of tiles in a row & number of rows may not have been set yet.
	// The function returns an object (sldStrtTile) containing the start column/row of slideView (e.g., sldVw[].tiStrtX/YId)
	//   and pixel offset of slideView (i.e. top,left) such that the specified point on the specimen (vfX,Y) is located at
	//   the specified point on the screen (scrX,Y).
function sldConvertSlideToScr(scrArgX,scrArgY,vfX,vfY,arrI,tiNumSldVwX,tiNumSldVwY) {
	var scrX = scrArgX;
	var scrY = scrArgY;
	var scrWidth = parseInt(document.getElementById("sldBndBox").style.width);
	var scrHeight = parseInt(document.getElementById("sldBndBox").style.height);
	if (Number.isNaN(scrX)) {
		scrX = scrWidth / 2;
		}
	if (Number.isNaN(scrY)) {
		scrY = scrHeight / 2;
		}

	var dbMaxX = sldVw[arrI].dbMxNumX;  // sldVw[].dbMxNumX is set by sldInitialize or sldAddPlane()
	var dbStrtX = sldVw[arrI].dbStrtXId;  // sldVw[].dbStrtXId is set by sldInitialize or sldAddPlane()
	var dbMaxY = sldVw[arrI].dbMxNumY;  // sldVw[].dbMxNumY is set by sldInitialize or sldAddPlane()
	var dbStrtY = sldVw[arrI].dbStrtYId;  // sldVw[].dbStrtYId is set by sldInitialize or sldAddPlane()
	var zMult = sldVw[arrI].zMult; // multiplication factor for this zoom-level
	   // levX,Y are the zoom-level-specific coordinates:  0,0 is top,left corner of first tile; see notes
	   //	11/01/19 - deleted reference to dbTileOffX,Y
	var levX = Math.round((vfX/zMult) - 0.5) - (sldVw[arrI].dbStrtXId * glbTileSzX);
	var levY = Math.round((vfY/zMult) - 0.5) - (sldVw[arrI].dbStrtYId * glbTileSzY);
	var pxAddX = levX % glbTileSzX;   // number of pixels from left-side of current tile to point
	var pxAddY = levY % glbTileSzY;   // number of pixels from top of current tile to point

	  // calculate tiScrVwX,Y => tiScrVw = tiCur - tiStrt
	  //   round-up if pxAdd is more than half-way across tile, otherwise, round-down
	var tiScrVwX;
	  if (pxAddX > (glbTileSzX / 2)) { tiScrVwX = Math.ceil((scrX/scrWidth) * tiNumSldVwX); }
	  else { tiScrVwX = Math.floor((scrX/scrWidth) * tiNumSldVwX); }
	var tiScrVwY;
	  if (pxAddY > (glbTileSzY / 2)) { tiScrVwY = Math.ceil((scrY/scrHeight) * tiNumSldVwY); }
	  else { tiScrVwY = Math.floor((scrY/scrHeight) * tiNumSldVwY); }

	var sldLeft = scrX - (tiScrVwX * glbTileSzX) - pxAddX;
	var sldCol = Math.floor((levX - pxAddX) / glbTileSzX) - tiScrVwX + sldVw[arrI].dbStrtXId;
	var sldTop = scrY - (tiScrVwY  * glbTileSzY) - pxAddY;
	var sldRow = Math.floor((levY - pxAddY) / glbTileSzY) - tiScrVwY + sldVw[arrI].dbStrtYId;

		// need to adjust sldLeft & sldCol if at edge of slide
	while ((sldCol + tiNumSldVwX) > (dbMaxX + dbStrtX)) {
		sldLeft -= glbTileSzX;
		sldCol--;
		}
	while (sldCol < dbStrtX) {
		sldLeft += glbTileSzX;
		sldCol++;
		}
		// need to adjust sldTop & sldRow if at edge of slide
	while ((sldRow + tiNumSldVwY) > (dbMaxY + dbStrtY)) {
		sldTop -= glbTileSzY;
		sldRow--;
		}
	while (sldRow < dbStrtY) {
		sldTop += glbTileSzY;
		sldRow++;
		}
	return {strtCol: sldCol, strtRow: sldRow, left: sldLeft, top: sldTop};
	}

	// sldShwXYPos() reports x,y position in the infoboxes on menu
function sldShwXYPos(clientX,clientY) {
	  //bndBoxX & bndBoxY is mouse position relative to top-left corner of sldBndBox
	var bndBoxX = clientX - parseInt(document.getElementById("sldBndBox").style.left);
	var bndBoxY = clientY - parseInt(document.getElementById("sldBndBox").style.top);

	var sldCoord = sldConvertScrToSlide(bndBoxX, bndBoxY, sldVwI, false);

	var sldMaxX = sldVw[sldVwI].dbMxNumX * glbTileSzX;  // maximum value of valX that is still on specimen;
	var sldMaxY = sldVw[sldVwI].dbMxNumY * glbTileSzY;  // maximum value of valY that is still on specimen;

	if ((sldCoord.levX < 0) || (sldCoord.levY < 0) || (sldCoord.levX > sldMaxX) || (sldCoord.levY > sldMaxY)) {
		document.getElementById("menuSldXPos").innerHTML = "&nbsp;";
		document.getElementById("menuSldYPos").innerHTML = "&nbsp;";
		}
	else {
		document.getElementById("menuSldXPos").innerHTML = sldCoord.sldX;
		document.getElementById("menuSldYPos").innerHTML = sldCoord.sldY;
		}
	return;
	}


	// This function clears X & Y position of mouse from menu when the mouse is no longer over slideView
	//   It also resets slideView's onmousemove	in case the mousebutton was down when the mouse moved off slideView
function sldBndBoxMusOut() {
	document.getElementById("menuSldXPos").innerHTML = "&nbsp;";
	document.getElementById("menuSldYPos").innerHTML = "&nbsp;";
	document.getElementById("sldBndBox").onmousemove = function(event){sldBndBoxMusMv(event)};
	document.getElementById("sldBndBox").style.cursor = "default";
	}

	//  sldGoToView() differs from the slideView move functions in that, rather than shifting the current slideView,
	//    it completely redraws slideView.  Current tiles are excised (and passed to cache) and replaced with new
	//    tiles using sldGetNewImgNode() to insert new image.
	//  sldGoToView() assumes that the gridTemplateColumns & gridTemplateRows has been updated to reflect
	//   sldNewNumInRow && sldNewNumRows.
	//    If goNumInRow < sldInRow, it will remove 'extra' tiles at end (right-side) of each row.
	//    If goNumRows < sldVw[0].tiMxNumY, it will remove 'extra' rows at bottom of slideView
	//    If goNumInRow  > sldVw[0].tiMxNumX, it will insert extra tiles at end of each row
	//    If goNumRows > sldVw[0].tiMxNumY, it will insert extra tiles at bottom of slideView
	//	 arrI is the index in sldVw[] of the slideView plane that is being redrawn (sldNode = sldVw[arrI}.sldNode)
	//   goLeft is the new style.left value for sldNode
	//   goTileStartX is the new Id-number of the tiles in the left-most column
	//   goNumInRow is the new number of tiles in each row (this must match the number of "tile-size" texts in gridTemplateColumns
	//   goTop is the new style.top value for sldNode
	//   goTileStartY is the new Id-number of first row of tiles
	//   goNumRows is the new number of rows (this must match number of "tile-size" texts in gridTemplateRows
function sldGoToView(arrI,goLeft,goColStartId,goNumInRow,goTop,goRowStartId,goNumRows) {
	var i;
	var sldNode = sldVw[arrI].sldNode;
	var oldRowStartId = sldVw[arrI].tiStrtYId;
	var oldNumRows = sldVw[arrI].tiMxNumY;
	var oldColStartId = sldVw[arrI].tiStrtXId;
	var oldNumInRow = sldVw[arrI].tiMxNumX;
	  // remove all 'old' image elements from sldNode
	for (i = 0; i < oldNumRows; i++) {
		if ( sldRemoveRow(sldNode,sldVw[arrI],oldRowStartId + i,oldColStartId,oldNumInRow) != oldNumInRow) {
			alert("sldRemoveRow() failed - ABORTING GoTo");
			return;
			}
		}
	  // add 'new' image elements to go Element
	for (i = 0; i < goNumRows; i++) {
		if (sldAddRowToEnd(sldNode,arrI,goRowStartId + i,goColStartId,goNumInRow) != goNumInRow) {
			alert("sldAddRowToEnd() failed - ABORTING GoTo");
			return;
			}
		}
	  // set new top,left corner
	sldNode.style.top = goTop + "px";
	sldNode.style.left = goLeft + "px";
	   // set new global coordinates:  NOTE: this will need to be changed when zoom-levels are implemented
	sldVw[arrI].tiMxNumX = goNumInRow;
	sldVw[arrI].tiMxNumY = goNumRows;
	sldVw[arrI].tiStrtXId = goColStartId;
	sldVw[arrI].tiStrtYId = goRowStartId;
	return;
	}    
	

	// sldRemoveRow() removes a row of tile images from slideView
	//    It returns the number of images removed; on error, it returns -1
	//  sldNode is a pointer to the div (i.e. slideView) containing the "img" nodes
	//	sldPlane is the object in the array (sldVw or destSldVw) that contains sldNode and the 
	//		rows being referred to.  Originally (before 7/24/19), sldRemoveRow() was passed an
	//		integer (arrI) that was the index to this view-plane in sldVw[].  This was replaced with
	//		a reference to the actual array element (e.g. sldVw[arrI]) so that the function could be
	//		used with destSldVw[] as well as with sldVw[].  However, it turns out that this function
	//		isn't good for destSldVw because imgNodes don't need to be removed from sldNode if
	//		sldNode is destroyed.
	//  imgRowId is the numerical ID (e.g., the name of the row directory) of the row being removed
	//  imgColStartId is the numerical ID of the first tile in row (i.e. sldVw[0].tiStrtXId)
	//  imgNumInRow is the number of tiles in the row
function sldRemoveRow(sldNode,sldPlane,imgRowId,imgColStartId,imgNumInRow) {
	var i;
	var imgColId;
	var imgIdTxt = "";
	var imgNode;

	for (i=0; i< imgNumInRow; i++){
		imgColId = imgColStartId + i;
		imgIdTxt = sldImgIdStr(sldPlane,imgRowId,imgColId);
		imgNode = document.getElementById(imgIdTxt);
		if (imgNode == null) {
			alert('sldRemoveRow(): could not find \"' + imgIdTxt + '\" - ABORTING ROW REMOVAL ")');
			return(-1);
			}
		if (sldNode.removeChild(imgNode) == null) {
			alert('sldRemoveRow(): could not remove \"' + imgIdTxt + '\" - ABORTING ROW REMOVAL ")');
			return(-1);
			}
		else { sldPushCache(imgNode); }
		}
	return(i);
	}


	// sldClearSldVw() is called when user clicks menu's back to slide list (<li id="menuToSldList">
	//	This function (created 10/28/19):
	//	(0)	turns-off any timers that might be on (i.e., glbFCycVal)
	//	(1)	hides <div id="sldBndBox"> and displays, <div id="IntroPage"> and sets cursor to "wait"
	//	(2)	sets sldVw[sldVwI].sldVis = false and then sets sldVwI = NaN (necessary for sldRemovePlane to work)
	//	(3)	uses sldRemovePlane() to remove each view-plane listed in sldVw.  This is less efficient than just
	//		removing all of sldBndBox's child nodes and splicing-out all of the elements of sldVw[], but it
	//		probably won't be that long and it may be a little safer (it also requires less new programming).
	//	(4)	calls destClearArr() to clear the destruction array - which was just filled with all of the slideView-
	//		planes removed from sldVw[] by sldRemovePlane().
	//	(5)	calls sldClearCache() to clear the image-cache - which was just filled by destClearArr()
	//	(6)	calls prgReInitWnd() to get a new slide.
	//	12/03/19 => removed "Confirm" box at beginning of this function ... if the user clicks the "back to slide list"
	//		button, he/she doesn't need to confirm that this is what he/she wants to do
	//	12/16/19 => replace call to progLoadInit() with call to prgReInitWnd()
function sldClearSldVw() {
	var i;
		// need to call sldResetWaitCurs() because the call sldSetWaitCurs()
		//	would overwrite the initial cursor values in glbDivWaitArr[]
	if (glbWait) { sldResetWaitCurs(); } 
	sldSetWaitCurs();  //display "wait" cursor while unloading slideView
			// turn-off timers
	if (!Number.isNaN(glbFCycVal.timId)) {  // focus cycling is on; turn it off
		clearInterval(glbFCycVal.timId);
		glbFCycVal.timId = Number.NaN;
		glbFCycVal.dir = 1;
		document.getElementById("navFocStartCycle").style.display = "block";
		document.getElementById("menuFocStartCycle").style.display = "block";
		document.getElementById("navFocStopCycle").style.display = "none";
		document.getElementById("menuFocStopCycle").style.display = "none";
		}
	document.getElementById("IntroPage").style.opacity = 1; // this should already be set, but it's safer this way
	document.getElementById("IntroPage").style.display = "block";
	document.getElementById("sldBndBox").style.display = "none";
	sldVw[sldVwI].sldVis = false;
	sldVwI = Number.NaN;
	for (i = (sldVw.length - 1); i>=0; i--) {
		sldRemovePlane(i,false);
		}
		// need to call sldResetWaitCurs() before calling destClearArr() because
		//	destClearArr() calls sldSetWaitCurs()
		//	which would overwrite the initial cursor values in glbDivWaitArr[]
	sldResetWaitCurs();
	destClearArr();  // this re-sets destTimer as well as clearing out destSldVw[] & purgSldVw[]
	sldClearCache();  
	prgReInitWnd(); 
	return;
	}

	// sldRemovePlane() moves a slideView plane whose index is sldI, i.e., sldVw[sldI]
	// from sldVw[] to either 
	//	=>	destSldVw[] if isMusMv == false, or
	//	=>	purgSldVw[] if isMusMv
	//	The function also removes the corresponding sldNodes (child nodes) from sldBndBox
	//		sldBndBox is a <div> that is the parent to the sldNodes listed in sldVw[]
function sldRemovePlane(sldI,isMusMv) {
	var i;
	var sldVwPlane = sldVw[sldI];
	var sldNode = sldVwPlane.sldNode;
	var remNode;  // node returned by removeChild(); should equal sldNode
	if (sldVwPlane.sldVis) {
		alert('sldRemovePlane(): sldVwI = ' + sldVwI + '; index sldVwPlane = ' + sldI
				+ '.  Cannot remove displayed view-plane from sldVw[].  sldRemovePlane() aborting.');
		return;
		}
	sldVw.splice(sldI,1);
			// update sldVwI
	for (i = 0; i < sldVw.length; i++) { 
		if (sldVw[i].sldVis) { sldVwI = i; } // sldVis == true for only one slideView plane
		}
			// remove sldNode from sldBndBox
	remNode = document.getElementById("sldBndBox").removeChild(sldNode);
	if (remNode == null) { 
		alert("sldRemovePlane(): remNode == null. Could not remove slideView node from sldBndBox"); 
		}
	else if (remNode != sldNode) {
		alert("sldRemovePlane(): remNode != null && remNode != sldNode.  This should not be."); 
		}
			// push sldVwPlane onto destruction or purgatory array
	if (isMusMv) { 
		purgSldVw.push(sldVwPlane); 
		document.getElementById("menuPurgArrSzVal").innerHTML = purgSldVw.length;
		}
	else {
		destSldVw.push(sldVwPlane);
		document.getElementById("menuDestArrSzVal").innerHTML = destSldVw.length;
		}
		// update "View-planes loaded" in "Slide Info" menu
	document.getElementById("menuSldVwSzVal").innerHTML = sldVw.length;
	return;
	}


		//   ************************************************************
		//   *************    destroy slideView FUNCTIONS   *************
		//   ************************************************************

	// destDeletePlane is called by the destTimer.
	// When completed, this function will: 
	//	(1) pop a slideView plane off the top of destSldVw[]
	//	??? NO! This is done by sldRemovePlane(): remove the sldNode from sldBndBox 
	//	(3) remove all of the images from sldNode & pushed them onto the cache
	//	destDeletePlane() turns on destTimer if destSldVw.length > 0, so other
	//		functions DO NOT need to turn on destTimer if they call destDeletePlane()
	//	  If a function (e.g. move functions) already are doing a lot of 'background'
	//			operations after user-interaction, it may be good for these functions
	//			to turn-on destTimer, rather than calling destDeletePlane()
	// Can't access img elements by id (as originally planned) because these may
	//		have been duplicated in sldVw after slideView plane was moved to 
	//		destSldVw[].  Use DOM.childNodes method instead
function destDeletePlane() {
		// catch destTimer
	if (Number.isNaN(destTimer.id) == false) {  // timer is on => turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
		// are planes present to delete?
	if (destSldVw.length == 0) {
		destTimer.isOn = false;  // timer.id was cleared above
		return;
		}
			//	There was a question of whether to 'pop' or 'shift' the plane from destSldVw[]
			//	  If destSldVw[] is cleared quickly, then all of the elements in destSldVw[]
			//		probably will be equally likely to be re-used so the order on imgs in the
			//		cache would not be significant.  Depending on how it is implemented, 
			//		'shifting' could be as efficient as 'popping' in terms of CPU time, and 
			//		'shifting' does not require calculation of the index of the top of the array
			//		to determine which slideView plane to remove.
	var cacheI;
	var imgI;	// counter for reading nodeLst 'for' loop
	var imgNode;  // 'pointer' to <img> object
	var imgId = "";  // id string for <img> object
	var sldVwPlane = destSldVw.shift();  // remove sldVwPlane from destruction array
	var sldNode = sldVwPlane.sldNode;  // 'pointer' to slideView <div> object
	var nodeLst = sldNode.childNodes;  //  DOM Node list object containing all sldNode's children
				// push imgs onto cache after checking for duplicates	
	for (imgI = 0; imgI < nodeLst.length; imgI++) {
		if ( nodeLst[imgI].nodeName == "IMG") {  // makes sure we've only got img's
			imgNode = nodeLst[imgI];
			imgId = "";  // re-initialize id string;
			imgId = imgNode.id;
			if ((imgId == "undefined") || (imgId == "")) {
				alert('destDeletePlane(), slideView node: \"' + sldNode.id 
						+ '\". No ID for child node (node =  ' + imgI 
						+ '). This node was NOT pushed onto the image cache');
				continue;
				}
				// check for duplicates in glbImgCache
				//	NOTE:  this 'for' loop should BE DELETED if duplicate checking 
				//		is enabled in sldPushCache() => see sldPushCache() below
			for (cacheI = (glbImgCache.length - 1); cacheI >= 0; cacheI--) {
				if (imgId == glbImgCache[cacheI].id) { 
					glbImgCache.splice(cacheI,1);
					}
				}   // end of duplicate checking 'for' loop
			sldPushCache(imgNode);
			}  // end of if child is <img>
		}
	document.getElementById("menuDestArrSzVal").innerHTML = destSldVw.length;
		// restore destTimer
	if (destSldVw.length > 0) {
		destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
		destTimer.isOn = true;
		}
	return;
	}

	// purgRestoreSldVw() moves the slideView planes in purgSldVw[]
	//	to sldVw[] and adds the corresponding sldNode to the children
	//	of sldBndBox

function purgRestoreSldVw() {
	var sldViewPlane;  // holds the sldVw[] object popped off purgSldVw[]
	var sldNode;  // holds the DOM node retrieved from sldViewPlane.sldNode
	var bndBoxNode = document.getElementById("sldBndBox");
	while (purgSldVw.length > 0) {
		sldViewPlane = purgSldVw.pop();
		sldNode = sldViewPlane.sldNode;
		sldVw[sldVw.length] = sldViewPlane;
		bndBoxNode.appendChild(sldNode);
		}
	return;		
	}

		// onMouseDown or 2-finger touch F-restricted planes were moved to purgSldVw.
		//	If the mouse or finger was not moved after being depressed/touching the screeen
		//	(i.e., the mouseDown/screen-touch was a mistake), then the purged planes are
		//	are restored to sldVw[].  Otherwise, they are moved to destSldVw[] for destruction
		//	Prior to 11/15/19, this function was part of sldMoveViewMusReset()
function purgClrArray(){
	if ((sldMvDistX == 0) && (sldMvDistY == 0) && (purgSldVw.length > 0)) { // mouse down-and-up without moving
		purgRestoreSldVw();	// move purged slideView planes back to sldVw[]
		}
			// if slideView was moved, then any slideView planes in purgatory should be destroyed
	else if (purgSldVw.length > 0) { // mouse was moved & there are planes in purgSldVw[]
		while (purgSldVw.length > 0) { 
			destSldVw.push(purgSldVw.pop()); // pop out of purgSldVw[] & push into destSldVw[]
			}
			// destuction timer should be turned on at the end of mouse movement
			//	 since there are now planes in destSldVw[]
		destTimer.isOn = true;  // destTimer should be turned on at end of mouse/touch movement
		}
	return;
	}


	// destClearArr() probably will never be used in real life, but it is
	//		included as a 'safety valve' in case somethint goes wrong
	//	This function is called when slideView movement buttons are released (e.g.
	//		on mouseUp during mouse-movements or navigator buttons), and should be called by
	//		any other functions that push slideView planes onto destSldVw[] or
	//		purgSldVw[]  ... if the sum of the slideView planes in these two arrays
	//		exceeds destArrayMaxNum.  This function also can be called from the
	//		"Settings" menu.
	//	The function moves all of the slideView-planes in purgSldVw[] to destSldVw[]
	//		and then calls destDeletePlane() repetitively until destSldVw[] is empty.	

function destClearArr() {
	var oldWait = glbWait;
		// if not in "wait"-state, turn off buttons and turn on wait cursor
	if (!oldWait) {
		glbWait = true;
		sldSetWaitCurs();
		}
		//  turn off destTimer
	if (!Number.isNaN(destTimer.id)) {
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
	destTimer.isOn = false;
			// move purgSldVw[] items to destSldVw[]
	while (purgSldVw.length > 0) { 
		destSldVw.push(purgSldVw.pop()); // pop out of purgSldVw[] & push into destSldVw[]
		}
			// clear destSldVw[]
	while (destSldVw.length > 0) {
		destDeletePlane();
		}
			// reset cursor & navigator
	if (!oldWait) {
		glbWait = false;
		sldResetWaitCurs();		
		}
	return;
	}





//	  **********************************************************************************
//	  **************               WAIT slideView FUNCTIONS               **************
//	  **********************************************************************************

function sldImgLoaded(idStr) {
	var wtBxNode;  // node for "missing tile" <td> in waitBox
	var sldVwF = parseInt(idStr.slice(3));
	var sldVwZ = parseInt(idStr.slice(idStr.indexOf("_") + 1));
	var arrI;
	if (Number.isNaN(sldVwF)) {
		alert("sldImgLoaded() could not read imgNode.id (\"" + idStr + "\")." 
				+ "\n  You probably should close PNWU Microscope, as this probably is a fatal error."
				+ "\n  Please report this bug.");
		return;
		}
	if (Number.isNaN(sldVwZ)) {
		alert("sldImgLoaded() could not read imgNode.id (\"" + idStr + "\")." 
				+ "\n  You probably should close PNWU Microscope, as this probably is a fatal error."
				+ "\n  Please report this bug.");
		return;
		}
			// get index of slideView plane in sldVw[]
	for (arrI = sldVw.length - 1; arrI >= 0; arrI--) {
		if ((sldVw[arrI].f == sldVwF) && (sldVw[arrI].z == sldVwZ)) {
			break;
			}
		}
	if (arrI < 0) { return; }   // imgNode not in slideView plane in sldVw[]
			// remove imgNode.id from wait list (sldVw[].sldWaitArr)
	if (!sldWaitUnlist(sldVw[arrI].sldWaitArr,idStr)) { return; }  // imgNode not in wait list
	var arrSz = sldVw[arrI].sldWaitArr.length;
	if (glbIsWaitBxActive) {  // need to update waitBox
		wtBxNode = document.getElementById("wtMTile"+arrI);
		if (wtBxNode != null) { wtBxNode.innerHTML = arrSz; }
		}
				// if sldWaitUnlist() returned true => test to see if slideView plane is causing "wait" interrupt
	if (sldVw[arrI].sldWait && (arrSz == 0)) {
		sldVw[arrI].sldWait = false;
		if (glbIsWaitBxActive) {  // need to update waitBox
			wtBxNode = document.getElementById("wtIsM"+arrI);
			if (wtBxNode != null) { wtBxNode.innerHTML = "&#9744;"; }
			}
		sldUnWait();
		}
	return;
	}

	// sldWaitUnlist() is passed a sldVw[].sldWaitArr array and an imgNode.id idString
	//	The function looks through the array for a string that matches idStr
	//	If the string is matched, the function splices the string out of the array and returns true
	//	If it doesn't find a match, the function returns false.
function sldWaitUnlist(waitArr,idStr) {
	var i;
	for (i = 0; i < waitArr.length; i++) {
		if (waitArr[i] == idStr) {
			waitArr.splice(i,1);
			return(true);
			}
		}
	return(false);
	}

	// NOTE; functions which are disabled when glbWait is true are:
	//	(1) sldFPBtnClk()
	//	(2)	sldStrtFCyc()
	//	(3)	sldNextFCyc()
	//	(4) sldZBtnClk()
	//	(5) sldMusDblClk()
	//	(7) multiple touchEvent functions
	//	Mouse wheel movements are treated as button-clicks (btn?3), so these are handled by button-click fxns
	// sldSetWait():  This function is called if changing focus or zoom attempts to make visible a
	//		sldVw view-plane which is not yet fully loaded (sldVw[].sldWaitArr.length > 0).
	//	This function should leave sldVw[] in the state prior to the attempted sldVw[] level change,
	//		so that sldUnWait() can re-initiate slideView functioning by calling the function that 
	//		called sldSetWait().  The functions that call sldSetWait() are:
	//	(1) sldFPBtnClk() => glbWait & sldVw[].sldWait are set by sldChangeF()
	//	(2) sldNextFCyc() => glbWait & sldVw[].sldWait are set by sldChangeF()
	//	(3)	sldZBtnClk() => glbWait & sldVw[].sldWait are set by sldChangeZ()
	//	The actions taken by sldSetWait() are:
	//	(1) sets glbWait = true;  this should have already been done by the calling function
	//			but its cheap in terms of clock-cycles and we need to be certain
	//		glbWait == true disables most buttons/functions
	//	(2) turns off glbFCycVal timer
	//	(3) changes sldBndBox mouse controls:
	//		(a)	mouse down shows infoWait box instead of setting-up mouse movements
	//		(b) mouse up hides infoWait box
	//		(c) mouse move reports x,y position on menu, but doesn't move slideView => this would already
	//			be the case if "wait" state occurs while mouse is up (or not on sldBndBox; e.g., if the
	//			mouse is on the Navigator), but it's better to be safe 
	//	(4)	turns off mouse slow-down scrolling => this should already be off, but good to make certain
	//	(5) sets cursor(s) to "wait"
	//		if touchEvent occurred on a button (glbNoTch == false or glbTchMenuFree == false) AND sldAction =="c"
	//			also turns on menu-touch-wait clocks
	//	(6) sets glbWaitAct & glbWaitDir:
	//	(7) calls menuBldWaitBox();
	//	(8) sets time-out timer
function sldSetWait(sldAction,actDir) {
			// disable slideView
		// the following statement is redundant, since glbWait is set to true by
		//	sldChangeF() or sldChangeZ() prior to the call to sldSetWait().
		//	However, it's safer to leave this statement here
	glbWait = true;  // used to determine wait status; turns off most buttons
		// if sldAction = "c" - F-cycling is on => need to turn it off
		//	F-cycling should be off in all other cases, but it's safer to make sure
	if (!Number.isNaN(glbFCycVal.timId)) { // if F-cycling on, turn it off
		window.clearInterval(glbFCycVal.timId);
		glbFCycVal.timId = Number.NaN;
		}
		// turn off sldBndBox mouse controls;
	document.getElementById("sldBndBox").onmousedown 
			= function() {if (!glbIsWaitBxOpen) {document.getElementById("waitBox").style.display = "block";}};
	document.getElementById("sldBndBox").onmouseup 
			= function() {if (!glbIsWaitBxOpen) {document.getElementById("waitBox").style.display = "none";}};
	document.getElementById("sldBndBox").onmouseout  // need to prevent waitBox hanging around on mouseout 
			= function() {if (!glbIsWaitBxOpen) {document.getElementById("waitBox").style.display = "none";}};
	document.getElementById("sldBndBox").ondblclick = function(event){return;};  // disable double-click
		// assuming mouse was "up" when sldSetWait() is called (which it should be), then
		//		resetting onmousemove shouldn't be necessary, but seting onmousemove insures
		//		 that the mouse actions are properly set
	document.getElementById("sldBndBox").onmousemove = function(event){sldBndBoxMusMv(event)};
		// 11/21/19:  no longer switch touchmove-interrupt handlers; sldSetWait() just starts clock-wait icons.
		//		tchSldVwMv() handles preventing slideView movment during wait
	if (glbSVTchPt >= 2) { tchClkIconStrt(); }
				// mouse slow-down should be off, but make sure
				// interrupt mouse-scrolling-slow-down and update slideView stack
			// prior to 11/21/19, the call to sldMoveStack() was inside the "if" test of slow-down scrolling.
			//		However, with the introduction of 2-finger movements, we can't guarantee that we are in
			//		a "mouse-up" (< 2-finger) state at this point.  In addition, the "if" test of btnTimers
			//		also does a sldMoveStack() call ... move to after both of these
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (!Number.isNaN(sldMusSlwDwn.timer))) {
		sldMusSlwDwnTimerReset();
		}
			//  Check for unfinished move-button movements
		// Prior to 11/21/19, the call to sldMoveStack() and setting sldVwFoc (sldConvertScrToSlide())
		//		were inside the "if" test of btnTimers; these were moved to outside the if statement.
		//		to accommodate the change in slow-down scrolling (above)
	if (!Number.isNaN(glbMvBtnObj.timer)) { // clear move-button timer
		window.clearInterval(glbMvBtnObj.timer);
		glbMvBtnObj.timer = Number.NaN;
		if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
			sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
			}
		}
	if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}
	sldConvertScrToSlide(Number.NaN,Number.NaN,sldVwI,true); // set sldVwFoc
	glbWaitAct = sldAction;
	glbWaitDir = actDir;

	sldSetWaitCurs();
	var navNode = document.getElementById("sldNavigator"); 
	if ((!(glbTchMenuFree && glbNoTch)) && (glbWaitAct == "c")) {
		tchWaitBtnSetup(navNode.offsetLeft + 85, navNode.offsetTop +140);
		}
			// waitBox is shown if mouse is depressed on sldBndBox during "wait" state
	if (!glbIsWaitBxOpen) {  // waitBox isn't already open, need to setup box
		waitMkBox();
		document.getElementById("waitBoxHdrTxt").innerHTML = "Please Wait";
		glbIsWaitBxActive = true;
		}
			// update display of "wait" status in waitBox
	document.getElementById("waitBxWaitState").innerHTML = "true";
			// calls to sldFPBtnClk() & sldZBtnClk() turn-off destTimer.
			//	We should turn it back on while we're waiting for images
	if (destTimer.isOn && Number.isNaN(destTimer.id)) {  // destTimer should be but was turned-off
		destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
		if (Number.isNaN(destTimer.id)) {
			alert("sldSetWait():  Could not turn destruction timer on.");
			}
		}
			// set time-out timer
	glbAjxTimer = window.setTimeout(sldWaitTimedOut,glbWaitTimeOut);
	return;
	}

function sldWaitTimedOut() {
	var arrI  // added 3/31/20
		// I considered explicitly doing a clearTimeout(glbAjxTimer) here, but it
		//	probably isn't needed or useful, since sldWaitTimedOut() is only called
		//	by the timeout timer, and I think that the timeout timer automatically
		//	is cleared when it fires (i.e., the difference between setTimeout & setInterval)
	glbAjxTimer = Number.NaN;
	var timeOutSec = glbWaitTimeOut/1000;
	var timeOutStr = timeOutSec.toPrecision(2);
	var txtStr = "The waiting time for the server to load image tiles has timed-out.";
	txtStr += "\n\n  Click \"OK\" if you want to wait another " + timeOutStr + " seconds";
	txtStr += "\n      	for the image tiles to be loaded.";
	txtStr += "\n  Click \"Cancel\" if you want to proceed without waiting";
	txtStr += "\n      	for all of the image tiles to be loaded.";
	if (confirm(txtStr)) {
		glbAjxTimer = window.setTimeout(sldWaitTimedOut,glbWaitTimeOut);
		}
	else {
			// 3/31/20 => need to unblock sldVw[]
		for (arrI = 0; arrI < sldVw.length; arrI++) {
			sldVw[arrI].sldWait = false;  // don't wait even though sldVw[arrI].waitArr is not empty
			}
		sldUnWait();
		}
	return;
	}


	// sldUnWait() undoes what was done by sldSetWait()
	//	Since the sldVwI plane was not changed when a glbWait == true was set
	//	sldUnWait should be able to recommence by just calling the function that
	// 	generated the 'wait' "interrupt
function sldUnWait() {
	if (!Number.isNaN(glbAjxTimer)) { // TimeOut timer is on => turn it off
		window.clearTimeout(glbAjxTimer);
		glbAjxTimer = Number.NaN;
		}
	glbWait = false;  // release lock on controls/slideView movements
	sldResetWaitCurs();  // moved 3/31/20
		// 4/06/20 => moved & adjusted since wait-clock icons after fingers-up during wait state
		//	(1) turn-off "wait"-clock icons.
		//	(2) clear glbTchMvArr[], so the next 2-finger movement isused as the starting point for 
		//		future movements.
	if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
	if (!Number.isNaN(glbTchWaitIconTimer.id)) { tchClkIconEnd(); }
	glbTchMvArr.splice(0); // splice(0) removes entire array => next 2-finger movement becomes start of movement 
			// re-start process (function) that was interrupted
	if (glbWaitAct == "c") { // sldNextFCyc() generated the "wait" signal
		sldNextFCyc();  // advance to the next focal plane
				// re-start F-cycle timer
		if (!Number.isNaN(glbFCycVal.timId)) {  // timer already is on
			alert('sldUnWait(): focus cycle timer already is on (timer ID = \"'
					+ glbFCycVal.timId + '\").  Timer will be turned off and and then turned back on.');
			clearInterval(glbFCycVal.timId);
			glbFCycVal.timId = Number.NaN;
			}
		glbFCycVal.timId = setInterval(sldNextFCyc,glbFCycInterval);
		if (Number.isNaN(glbFCycVal.timId)) {
			alert('sldUnWait(): could not turn on focus cycle timer.  Timer ID is illegal (\"NaN\").');
			}
		}
	else if (glbWaitAct == "f") {  //sldFPBtnClk() generated the "wait" signal
		if (glbWaitDir > 0 ) { sldFPBtnClk(10); }
		else if (glbWaitDir < 0 ) { sldFPBtnClk(20); }
		else { alert("sldUnWait(): action-direction cannot be 0"); }
		}
	else if (glbWaitAct == "z") {  //sldFPBtnClk() generated the "wait" signal
		if (glbWaitDir > 0 ) { sldZBtnClk(10); }
		else if (glbWaitDir < 0 ) { sldZBtnClk(20); }
		else { alert("sldUnWait(): action-direction cannot be 0"); }
		}
	else { 
		alert("sldUnWait(): invalid value for glbWaitAct (\"" + glbWaitAct + "\")."
				+ "\n  This probably is a fatal error; you may want to close your browser."
				+ "\n  Please report this bug.");
		}
			// check for move-button down => warn if down
	if (glbMvBtnObj.btnNum > 0) { sldWaitMvBtnWarn(); }
			// turn on sldBndBox mouse controls;
	document.getElementById("sldBndBox").onmousedown = function(event){sldMoveViewMusDown(event)};
	document.getElementById("sldBndBox").onmouseup = function(event){sldMoveViewMusReset(event)};
	document.getElementById("sldBndBox").ondblclick = function(event){sldMusDblClk(event)};
			// update display of "wait" status in waitBox
	if (glbIsWaitBxActive) { 
		document.getElementById("waitBxWaitState").innerHTML = glbWait;
		}
	if (!glbIsWaitBxOpen) {  // waitBox wasn't opened by user, need to close waitBox
		glbIsWaitBxActive = false;
		document.getElementById("waitBox").style.display = "none";
		}	
	return;
	}

	// sldWaitMvBtnErrWarn() calls warnBoxCall() if the mouse was down on a move-button
	//		when the "wait" state was exited.
	//	This was written as a separate function solely to keep sldUnWait() readable.
function sldWaitMvBtnWarn() {
	var errStr = "";
	var btnDig1 = glbMvBtnObj.btnNum % 10;
	var btnDig2 = Math.floor((glbMvBtnObj.btnNum)/10);
	var str1 = "";
	var str2 = "";
				// errStr1 indicates location of move-button
	if ((btnDig1 == 1) || (btnDig1 == 6)) { str1 = "navigator"; }
	else if (btnDig1 == 2) { str1 = "menu"; }
	else { strDig1 = "\"unknown location\""; }
				// errStr2 indicates the button/arrow depressed
	switch (btnDig2) {
			case 1:  str2 = "Up";
				break;
			case 2:  str2 = "Down";
				break;
			case 3:  str2 = "Left";
				break;
			case 4:  str2 = "Right";
				break;
			default: str2 = "\"Unknown\"";
			}
	if (btnDig1 == 1) {	str2 += "-Arrow"; }
	else if (btnDig1 == 6) { str2 += " Double-Arrow"; }
	else { str2 += " Button"; }
				// errStr holds the body of WarnBox message
	errStr = "Movement of view-plane caused by pressing the ";
	errStr += str2 + " on the " + str1;
	errStr += "<br>&nbsp;&nbsp;may have been interrupted.";
	errStr +="<br><br>Re-press the " + str2 + " if you want to move the view-plane.";
	warnBoxCall(true,"Re-press " + str2 + "?",errStr);
	return;
	}

	// Previous attempts to set the wait cursoer on a piecemeal or global basis weren't working, so I wrote:
	//	sldWaitCurs() which:
	//	(1)	uses getElementsByTagName() to create a collection of all divs.
	//	(2)	loops through the collection of <div>'s and pushes the node & cursor string for each <div> 
	//		onto glbWaitDivArr[] unless it:
	//		(a) includes "Clicable" in the className (this would include both class=menuClickable and
	//			class=navClickable.
	//		(b) has an id that matches one of the strings in local array.
	//	(3)	sets the cursor for the "pushed" <div> to "wait"
	//	(4)	as an additional effort sets body.style.cursor to "wait"
	// The cursors are set back to their previous state by sldResetWaitCursor() ... see below
function sldSetWaitCurs() {
	if (glbDivWaitArr.length > 0 ) {
		warnBoxCall(false,"DivWaitArr full",
				"<b>sldSetWaitCurs():</b>&nbsp; The size of glbDivWaitArr[] (\""
				+ glbDivWaitArr.length + "\") is NOT ZERO.<br>" 
				+ "&nbsp; Please report this error.");
		return;
		} 
	var i;
	var j;
	var divObj;  // object containing node & cursor that will be stored in glbDivWaitArr[]
	var curNode;  // <div> node being examined
	var exclArr = [  // array of id's of <div>'s specifically excluded from glbDivWaitArr[]
			"menuNavVis",
			"menuCreditVis"
			] ;
	var divList = document.getElementsByTagName("div");
	for (i = 0; i < divList.length; i++) {
		curNode = divList[i];  // current <div>
			// eliminate menuClickable and navClickable <div>'s
		if (curNode.className.indexOf("Clickable") >= 0) { continue; } ;
		for (j = 0; j < exclArr.length ; j++ ) {
			if (curNode.id == exclArr[j]) { break; }
			}
		if ( j < exclArr.length ) { continue; } // found match in exclArr[]
		divObj = {node: curNode, cursor: curNode.style.cursor};
		glbDivWaitArr.push(divObj);
		curNode.style.cursor = "wait";
		}
	document.body.style.cursor = "wait";  // this puts the "wait" cursor on the menu bar
	return;
	}

	// sldResetWaitCurs() is called by sldUnWait() at the end of a "wait" state.
	//	This function resets the cursors for the <div>'s stored in glDivWaitArr[] 
	//		and then deletes all of the objects stored in this array.
	//	glbDivWaitArr[] was populated by sldSetWaitCurs() at the beginning of the
	//		"wait" state.
function sldResetWaitCurs() {
	var i;
	var arrLen = glbDivWaitArr.length  // added 3/31/20
	for (i = 0; i < arrLen; i++) {
		glbDivWaitArr[i].node.style.cursor = glbDivWaitArr[i].cursor;
		}
	document.body.style.cursor = "";
	glbDivWaitArr.splice(0);  // splice(0) removes entire array
	return;
	}

		//   ******************************************************
		//   *************    glbImgCache FUNCTIONS   *************
		//   ******************************************************


	// sldPushCache() pushes "img" element (sldImgNode) onto glbImgCache
	//    if cache is too large, sldPushCache removes an "img" Tile from base of Cache
	//	NOTE: sldPushCache() currently checks cache for duplicates.  With a large cache, this could
	//		be time-consuming.  Currently, there doesn't seem to be significant degradation of 
	//		slide movement functions (with cache size = 2000), but we may want/need to disable
	//		duplicate checking if slide-movement becomes jerky.  If duplicate checking is disabled
	//		here, consider adding it to destDeletPlane().
function sldPushCache(sldImgNode) {
	var i;
	var imgId = sldImgNode.id;
		// check cache for duplicates
//	for (i = (glbImgCache.length - 1); i >= 0; i--) {
//		if (imgId == glbImgCache[i].id) { glbImgCache.splice(i,1); }
//		}
		// push img onto cache
		// NOTE:  does NOT check tileSz - this MUST be done when/if img recovered from cache
	glbImgCache.push(sldImgNode);
	while (glbImgCache.length > glbImgCacheMaxSz) { glbImgCache.shift(); }
	}
	
function sldClearCache() {
	glbImgCache.splice(0);  // splice(0) removes entire array
	menuUpdtCacheSz();
	return;
	}

