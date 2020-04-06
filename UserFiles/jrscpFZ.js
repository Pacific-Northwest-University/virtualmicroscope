// jrscpFZ.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpFZ.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpFZ.js)
//		- four PHP files
//	jrscpFZ.js contains focal plane & zoom javascript functions.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//       ************************************************************************
//       *********       functions used when changing either F or Z   ***********
//       ************************************************************************

//	Note:  the slideView-plane destroy functions are general slideView functions and are in jrscpSldView.js


	//sldUpdtFtoSV() updates glbFtoSV[].
	//	It returns the number of F-levels (at specified zoom level) that are present in slideView
function sldUpdtFtoSV(curZ) {
	var i;
	var tmpF;
	var cnt = 0;  // count of F-levels
	var maxF = dbSldData[curZ].numF;
	if (glbFtoSV.length > maxF) {  // glbFtoSV[] is wrong size ... this is a programing error
		alert('sldUpdtFtoSV(): array (\"glbFtoSV[]\") is wrong size.  It should have a length of ' + maxF + ", but its length is " + glbFtoSV.length);
		glbFtoSV.splice(0);    // splice(0) removes entire array
		}
			// initialize glbFtoSV[]; -1 indicates f-plane not in slideView
	for (i = 0; i < maxF; i++) { glbFtoSV[i] = -1; }
			// add sldVw[] indices to glbFtoSV values
	for (i = 0; i < sldVw.length; i++ ) {
		if (sldVw[i].z == curZ) { 
			tmpF = sldVw[i].f;
			glbFtoSV[tmpF] = i;
			cnt++;
			}
		}
	return(cnt);
	}

	// On 8/14/19, sldRestrictF() was divided into to different functions:
	//	sldLimitF(numLimit) uses the old sldRestrictF()'s multiple calls 
	//		to sldUpdtFtoSV() to whittle-away the number of F-planes in sldVw[]
	//		until numLimit is reached.  This function is used when focusing
	//		and glbSldMaxF < dbMaxF.
	//	sldRestrictFZ(isMusMv,limCurZ) removes from sldVw[] all planes not protected by 
	//		glbSldFBuf & glbSldFZBuf.  The function is passed:
	//	(1)	isMusMv => set to true if mouse button depressed (to move slide)
	//			if isMusMv == true, sldRemovePlane() moves plane to purgSldVw[]
	//			if isMusMv == false, sldRemovePlane() moves plane to destSldVw[]
	//	(2) limCurZ => boolean determining whether to restrict F-planes if Z == curZ
	//			ir true (usual case) => glbSldFBuf determines number of planes with Z==curZ
	//			if false (when used in combination with sldLimitZ() for focusing up-and-down) 
	//				=> sldRestrictFZ() does NOT do ANY trimming of curZ-planes 
function sldRestrictFZ(isMusMv, limCurZ) {
					// interrupt destruction timer
	if (destTimer.isOn) {  // need to interrupt destruction timer
		if (Number.isNaN(destTimer.id) == false) {
			window.clearInterval(destTimer.id);
			destTimer.id = Number.NaN;
			}
		}
	var i;
	var arrSVI = [];  // array holding sldVw[] indices of planes to be destroyed
	var indZ;  // index of Z-values used by for loop
	var curF = sldVw[sldVwI].f;
	var curZ = sldVw[sldVwI].z;
	
		// walk through Z looking for planes to remove
	for (indZ = 0; indZ < dbMaxZ; indZ++) {
		if (sldUpdtFtoSV(indZ) == 0) { continue; } // no F planes at this Z
				// 3/27/20 - fix bug => if indZ < glbSldZFLim, then f == glbSldFDef is preserved if 
				//		indZ is between curZ +/- glbSldFZBuf OR
				//		indZ is between curZ +/- glbSldZBuf
				//	This could be done as a single if statement, but it is easier to read as two if statements
		if (indZ < glbSldZFLim) {  // if Z < glbSldZFLim => only f == glbSldFDef is allowed.
					// if indZ is within FZ-buffer range => save f==glbSldFDef
			if ((indZ >= (curZ - glbSldFZBuf)) && (indZ <= (curZ + glbSldFZBuf))) {
				for (i = 0; i < glbFtoSV.length; i++) {
					if ((glbFtoSV[i] >= 0) && (i != glbSldFDef)) {
						arrSVI[arrSVI.length] = glbFtoSV[i];
						}
					}
				}  // end if within FZ-buffer range
					// if indZ is within Z-buffer range, save f== glbSldFDef 
			else if ((indZ >= (curZ - glbSldZBuf)) && (indZ <= (curZ + glbSldZBuf))) {
				for (i = 0; i < glbFtoSV.length; i++) {
					if ((glbFtoSV[i] >= 0) && (i != glbSldFDef)) {
						arrSVI[arrSVI.length] = glbFtoSV[i];
						}
					}
				}  // end if within Z-buffer range
			else { // Z < glbSldZFLim, but outside of buffer range; remove all planes
				for (i = 0; i < glbFtoSV.length; i++) {
					if (glbFtoSV[i] >= 0) {
						arrSVI[arrSVI.length] = glbFtoSV[i];
						}
					}
				}  // end else outside  Z-buffer range
			}  // end if < glbSldZFLim
				// if limCurZ == false, do NOT restrict F-planes for Z==curZ
				//		otherwise, for Z == curZ, save F-planes +/- glbSldFBuf
		else if (indZ == curZ) { // save F-planes +/- glbSldFBuf
			if (limCurZ) { // if limCurZ == true, then limit curZ
				for (i = 0; i < glbFtoSV.length; i++) {
					if ((glbFtoSV[i] >= 0) && ((i < (curF - glbSldFBuf)) || (i > (curF + glbSldFBuf)))) {
						arrSVI[arrSVI.length] = glbFtoSV[i];
						}
					}  // end walk through glbFtoSV[]
				}
			}  // end if == curZ
					// for Z +/- glbSldFZBuf (like Z == curZ) save F-planes +/- glbSldFBuf
		else if ((indZ >= (curZ - glbSldFZBuf)) && (indZ <= (curZ + glbSldFZBuf))){ // save F-planes +/- glbSldFBuf
			for (i = 0; i < glbFtoSV.length; i++) {
				if ((glbFtoSV[i] >= 0) && ((i < (curF - glbSldFBuf)) || (i > (curF + glbSldFBuf)))) {
					arrSVI[arrSVI.length] = glbFtoSV[i];
					}
				}  // end walk through glbFtoSV[]
			}  // end if  <> curZ +/- glbSldZBuf
					// for Z +/- glbSldZBuf (but <> Z +/- glbSldFZBuf)save F-planes +/- glbSldFZBuf
		else if ((indZ >= (curZ - glbSldZBuf)) && (indZ <= (curZ + glbSldZBuf))){ // save F-planes +/- glbSldFZBuf
			for (i = 0; i < glbFtoSV.length; i++) {
				if ((glbFtoSV[i] >= 0) && ((i < (curF - glbSldFZBuf)) || (i > (curF + glbSldFZBuf)))) {
					arrSVI[arrSVI.length] = glbFtoSV[i];
					}
				}  // end walk through glbFtoSV[]
			}  // end if  <> curZ +/- glbSldZBuf
		else {  // destroy all planes outside of buffer-range
			for (i = 0; i < glbFtoSV.length; i++) {
				if (glbFtoSV[i] >= 0) {
					arrSVI[arrSVI.length] = glbFtoSV[i];
					}
				}  // end walk through glbFtoSV[]
			}  // end final else in walk-through
		}  // end walk-through Z-planes
				// use arrSVI to remove planes				
		arrSVI.sort(function(a, b){return b - a});  // sort arrSVI[] in reverse order
		for (i = 0; i < arrSVI.length; i++) {  // arrSVI[] is list of planes to be removed
			sldRemovePlane(arrSVI[i],isMusMv);
			}
	if (glbIsWaitBxActive && (arrSVI.length > 0)) { waitMkBox(); }  // if waitBox is active, need to update entire sldVw[]-list
			// start/re-start destTimer
	if (destTimer.isOn) {
		if (Number.isNaN(destTimer.id)) {  // need to re-start timer
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	else {  // destruction timer is off
		if (Number.isNaN(destTimer.id) == false) {  // this should NOT be, it is good to check for errors
			alert('Destruction array timer is \"off\", but has an ID number (\"' + destTimer.id +'\").');
			window.clearInterval(destTimer.id);
			destTimer.id = Number.NaN;
			}
		if (destSldVw.length > 0) {  // need to start timer
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			destTimer.isOn = true;
			}
		}
	return;
	}


	//sldUpdtZtoSV() updates glbZtoSV[].
	//	It returns the number of Z-levels (at current/default F) loaded into sldVw[]
function sldUpdtZtoSV() {
	var i;
	var tmpZ;
	var tmpF;
	var cnt = 0;  // count of Z-levels
	var curF = sldVw[sldVwI].f;
	var endSldVwI = sldVw.length;  // end (last item + 1) of SldVw[]
	if (glbZtoSV.length > dbMaxZ) {  // glbFtoSV[] is wrong size ... this is a programing error
		alert('sldUpdtZtoSV(): array (\"glbZtoSV[]\") is wrong size.  It should have a length of ' 
					+ dbMaxZ + ", but its length is " + glbZtoSV.length);
		glbFtoSV.splice(0);  // splice(0) removes entire array
		}
			// initialize glbFtoSV[]; -1 indicates f-plane not in slideView
	for (i = 0; i < dbMaxZ; i++) { glbZtoSV[i] = -1; }
			// add sldVw[] indices to glbFtoSV values
	for (i = 0; i < endSldVwI; i++ ) {
		tmpZ = sldVw[i].z;
		tmpF = sldVw[i].f; 
			// assign sldVw index to glbZtoSV[tmpZ] if 
			//	Z-level (tmpZ) >= no-focus limit && F == current focal plane
			//	OR Z-level ix < no-focus limit && F == default F
		if (((tmpZ >= glbSldZFLim) && (tmpF == curF))
				|| ((tmpZ < glbSldZFLim) && (tmpF == glbSldFDef))) {
			glbZtoSV[tmpZ] = i;
			cnt++;
			}
		}
	return(cnt);
	}

	// sldAddFZBuffer() adds buffering planes to sldVw[].
	//	It is called after sldRestrictFZ() whenever F or Z are changed
function sldAddFZBuffer() {
					// interrupt destruction timer
	if (destTimer.isOn) {  // need to interrupt destruction timer
		if (!Number.isNaN(destTimer.id)) {
			window.clearInterval(destTimer.id);
			destTimer.id = Number.NaN;
			}
		}
	var cntAddn = 0;  // counts the number of slideView planes added
	var i;
	var maxF;  // number of focal planes at Z
	var indZ;  // index of Z-values used by for loop
	var curF = sldVw[sldVwI].f;
	var curZ = sldVw[sldVwI].z;
				// walk-through zoom-levels looking for missing buffer planes
	for (indZ = curZ - glbSldZBuf; indZ <= curZ + glbSldZBuf; indZ++) {
		if (indZ < 0) { continue; }  // skip negative values of Z
		if (indZ >= dbMaxZ) { break; }  // end loop if Z > dbMaxZ
		maxF = dbSldData[indZ].numF;
		sldUpdtFtoSV(indZ);
		if (indZ < glbSldZFLim) {  // for Z < glbSldZFLim, only F = glbSldFDef is loaded
			if (glbFtoSV[glbSldFDef] < 0) {  // need to add plane
				sldAddPlane(glbSldFDef,dbRoot,indZ);
				cntAddn++;
				}
			}
		else if ((indZ >= (curZ - glbSldFZBuf)) && (indZ <= (curZ + glbSldFZBuf))) {
			for (i = curF - glbSldFBuf; i <= curF + glbSldFBuf; i++) {  // buffer is +/- glbSldFBuf
				if (i < 0) { continue; }  // skip negative values for F
				if (i >= maxF) { break; }  // end loop when i > maxF
				if (glbFtoSV[i] < 0) {  // need to add plane
					sldAddPlane(i,dbRoot,indZ);
					cntAddn++;
					}
				}  // end for loop
			} // end if Z +/ glbSldFZBuf
		else {  // curZ-glbSldZBuf < indZ < curZ-glbSldFZBuf OR curZ+glbSldFZBuf < indZ < curZ+glbSldZBuf => buffer is +/- glbSldFZBuf
			for (i = curF - glbSldFZBuf; i <= curF + glbSldFZBuf; i++) {  // buffer is +/- glbSldFBuf
				if (i < 0) { continue; }  // skip negative values for F
				if (i >= maxF) { break; }  // end loop when i > maxF
				if (glbFtoSV[i] < 0) {  // need to add plane
					sldAddPlane(i,dbRoot,indZ);
					cntAddn++;
					}
				}  // end for loop
			}  // end else Z +/- glbSldZBuf
		}
	if (glbIsWaitBxActive && (cntAddn > 0)) { waitMkBox(); }  // if waitBox is active, need to update entire sldVw[]-list
			// start/re-start destTimer
	if (destTimer.isOn) {
		if (Number.isNaN(destTimer.id)) {  // need to re-start timer
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	return;
	}

	// sldMusWheelSelect() is called when one of the radio buttons (or associated <div>'s)
	//		is clicked to change whether the mouse wheel controls zooming or focusing
	// button value indicates which 
function sldMusWheelSelect(clkEvent,clkVal) {
	if (clkEvent != null) {	clkEvent.stopPropagation(); }
	if (clkVal == "f") {
		glbMusWheelFZ = "f";
		document.getElementById("menuMusWhlFRadio").checked = true;
		document.getElementById("navMusWhlFRadio").checked = true;
		}
	else if  (clkVal == "z") {
		glbMusWheelFZ = "z";
		document.getElementById("menuMusWhlZRadio").checked = true;
		document.getElementById("navMusWhlZRadio").checked = true;
		}
	else {
		alert('sldMusWheelSelect():  illegal value (\"' + clkVal
				+ '\") for mouse-wheel selector.\n\n  Value remains = \"'
				+ glbMusWheelFZ + '\".');
		}
	return;
	}

	// sldMusWhlScroll() is passed the event object when the mouse-wheel is scrolled
	//		on sldBndBox.  The function checks for a "wait"-interrupt state and to make
	//		certain that sufficient time (glbPnchWhlWait) has elapsed since the previous
	//		mouse-wheel or pinch-spread event.  If all is OK the function then calls 
	//		sldPnchWhlScrll() to effect the zoom-in/out or focus-up/down.
	//	Prior to 11/18/19, sldMusWhlScroll() and sldPnchWhlScrl() were combined as a
	//		single function that only handled the mouse-wheel event.
function sldMusWhlScroll(whlEvent) {
	if (glbWait) { return; }
	var curTime = Date.now();
	if ((!Number.isNaN(glbPnchWhlTime)) && ((curTime - glbPnchWhlTime) < glbPnchWhlWait)) {
		return;   // wheel-scrolling too fast
		}
	glbPnchWhlTime = curTime;
	sldPnchWhlScrl(whlEvent.deltaY);
	return;
	}


	// On 11/18/19, the distal part of sldMusWhlScroll() was split-off into a new function
	//		(sldPnchWhlScrl()), which handles equivalent input from either a mouse-wheel
	//		event or a pinch-spread touch-event
	//	The function is passed an integer indicating the size and direction of the movement;
	//		however, only the direction (whether positive or negative) is relevant.
	//	The function converts the wheel- or finger-movement into the equivalent 
	//		of a button-click on either the zoom-level controls or focus controls
	//		depending on the value of glbMusWheelFZ ("z" or "f").
function sldPnchWhlScrl(scrlAmt) {
	var isPnch = false;  // set to true if pinch/spread event (instead of mouse-wheel event)
	if (glbSVTchPt >= 0) { isPnch = true; }
	var warnTxt = "";
	var curZ = sldVw[sldVwI].z;
	if (glbMusWheelFZ == 'f') {
		if (curZ < glbSldZFLim) {  // focusing disabled
			if (isPnch) { warnTxt = "Finger pinch/spread movement"; }
			else { warnTxt = "Mouse-wheel scrolling"; }
			warnTxt += ' is set to control focusing, ';
			warnTxt += 'but focusing is disabled at the current zoom-level (\"';
			warnTxt += curZ + '\").';
			warnBoxCall(true,"Focusing Disabled",warnTxt);
			}
		else if (scrlAmt > 0) {  // backward scroll: > 0 => focus-up
			sldFPBtnClk(13);
			}
		else if (scrlAmt < 0)  {  // forward scroll: < 0 => focus-down
			sldFPBtnClk(23);
			}
		else {  // zero is an illegal value
			warnTxt = 'sldPnchWhlScrl() - zero value.';
			warnTxt += '\n\nThe scroll amount returned by the ';
			if (isPnch) { warnTxt += "pinch/spread finger movement"; }
			else { warnTxt += "mouse-wheel scrolling"; }
			warnTxt += ' was \"' + scrlAmt + '\",';
			warnTxt += '\n which could not be converted into a focus change.';
				// use alert box even for finger movement, since this is an error that
				//		should abort finger actions.
			alert(warnTxt);
			}
		}
	else if (glbMusWheelFZ == 'z') {
		if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }  // turn-off F-plane cycling
		if (scrlAmt > 0) {  // backward scroll: > 0 => zoom out
			sldZBtnClk(13);
			}
		else if (scrlAmt < 0)  {  // forward scroll: < 0 => zoom in
			sldZBtnClk(23);
			}
		else {  // zero is an illegal value
			warnTxt = 'sldPnchWhlScrl() - zero value.';
			warnTxt += '\n\nThe scroll amount returned by the ';
			if (isPnch) { warnTxt += "pinch/spread finger movement"; }
			else { warnTxt += "mouse-wheel scrolling"; }
			warnTxt += ' was \"' + scrlAmt + '\",';
			warnTxt += '\n which could not be converted into a change in zoom-level.';
			alert(warnTxt);
			}
		}
	return;
	}

//       ******************************************************************
//       *********       slideView focal plane (FP) FUNCTIONS   ***********
//       ******************************************************************

//  Having multiple focal planes raises memory & performance issues.  My current thoughts are
//   that the best way to handle these is to vary the mumber of f-levels in slideView depending
//   on current activity.
//		dbMaxF - is the total number of focal planes available for this slide.  Usually,
//		  glbSldMaxF == dbMaxF.  However, if the user changes glbSldMaxF, then focusing up/down
//		  wiill cause focal planes to be added to/removed from slideView during focusing operations
//		  after the number of focal planes in slideView reaches glbSldMaxF.
//		glbSldMaxF - is the maximum number of F-levels in slideView() when focus controls are being
//		  implemented.  The default will be the maximum number of focal planes in the database for
//		  this slide, although we will add to the "settings" menu an option to change this.
//		  Operating a focus control will cause additional F-levels to be added to slideView up to
//		  dbMaxF.  Unless changed by the "Change Settings" box, glbSldMaxF is NaN prior to initialization
//		  since we don't know the number of focal planes in the specimen until initialization.
//		glbSldFBuf - is the number of focal planes at the current zoom-level that are actively 
//		  present in slideView when the slide is moved.  This variable acts like glbSldXYBuf ... 
//		  it is the number of focal planes that buffer the current slideView plane on a single side of the
//		  the current slideView.  glbSldFBuf = 1 implies that there are 3 focal planes loaded:
//		  the current slideView plane, the focal plane above the current view, and the focal plane
//		  below the current view.
//		glbSldFZBuf - is the number of focal planes at zoom-levels other than the current zoom-level
//		  that may be in sldVw[].  By default, glbSldFZBuf == 0, and increasing this number will have
//		  significant consequences in terms of sldVw[] size, performance, and demands on the server.
//		sldForceF and sldForceZ are not yet implemented.  If implemented these boolean variables would
//			determine whether glbSldFBuf, glbSldZBuf, and glbSldFZBuf only determine which planes are NOT removed
//			during plane-restiction (sldForceF/Z == false) or whether sldAddPlane() is called to add 
//			buffer planes (sldForceF/Z == true) when the buffer planes are missing.  It may not be
//			worthwhile to implement this, since sldForceF/Z = false would negate the value of buffering.
//		Moving or zooming the slide will call a function sldRestrictFZ() that removes from sldVw[] all of 
//			of the view-planes except those specified by glbSldFBuf, glbSldZBuf, & glbSldFZBuf.  The view-planes
//			removed from sldVw[] are transferred to destSldVw or purgSldVw for later destruction.


	//  sldFPBtunClk() handles navigator or menu commands (button-clicks) that
	//    change the focal plane level.
	//  Buttons are coded as for move-buttons:
	//    dig1:  0=wait-restart, 1=navigator, 2=menu, 3=mouse wheel
	//    dig2:  1=Up, 2=Down
function sldFPBtnClk(btnNum) {
			// inactivate buttons until image is displayed
	if (document.getElementById("sldBndBox").style.display == "none") {return;}
	if (glbWait) { return; }  // sldSetWait() turns off mouse slow-down & focal-plane cycling
				// interrupt mouse-scrolling-slow-down and update slideView stack
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (!Number.isNaN(sldMusSlwDwn.timer))) {
		sldMusSlwDwnTimerReset();
		}
		// prior to 11/21/19, the call to sldMoveStack() was inside the "if" test of slow-down scrolling.
		//		However, with the introduction of 2-finger movements, we can't guarantee that we are in
		//		a "mouse-up" (< 2-finger) state at this point.
	if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}
			// turn-off focal-plane cycling.
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
	if (!Number.isNaN(destTimer.id)) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}

	var i;
	var newFNum = sldVw[sldVwI].f;  // focal plane level => adjusted to new value below
	var oldArrI = sldVwI;  // index to old focal plane in slideView
	var newArrI = Number.NaN;  // index to new focal plane in slideView

	var btnDig1 = btnNum % 10;  // 1st digit indicates type (source) of button
	  // 2nd digit of button indicates focus up/down
	var btnDig2 = Math.floor(btnNum/10);
			// check for valid button number
	if ((btnDig1 < 0) || (btnDig1 > 3)) {
		alert('sldFPBtnClk():  First digit (\"' + btnDig1 + '\") of focal plane button number (\"' 
			+ btnNum + '\") is invalid - FOCUS NOT CHANGED');
		return;
		}
			// adjust newFNum to indicate new focal (as specified by button number
	if (btnDig2 == 1) { newFNum++; } // increase FP
	else if (btnDig2 == 2) { newFNum--; }  // decrease FP
	else {
		alert('sldFPBtnClk():  Second digit (\"' + btnDig2 + '\") of focal plane button number (\"' 
			+ btnNum + '\") is invalid - FOCUS NOT CHANGED');
		return;
		}
			// check for top/bottom of focus
			//  NOTE:  These 'alert' boxes should be changed to warning boxes
			//		(which beep() and go away when some other action occurs)
			//		when I get around to writing the code for warning boxes.
	if (newFNum < 0) {
		warnBoxCall(true,"Focus Too Low",'Already at lowest focal plane (\"0\").  Cannot focus down.  The focus was NOT changed.');
		return;
		}
	else if (newFNum >= dbMaxF) {
		warnBoxCall(true,"Focus Too High",'Already at highest focal plane (\"' + (dbMaxF-1) + '\").  Cannot focus up.  The focus was NOT changed.');
		return;
		}
	else { sldChangeF(newFNum); }
	if (glbWait) {  // images for newFNum focal plane not full loaded & slideView NOT changed = > go into wait mode.
		if (btnDig2 == 1) { sldSetWait("f",1); }
		else { sldSetWait("f",-1); }
		return; 
		}  
	sldRestrictFZ(false,false);  // remove all excess Z-levels except for Z == curZ
	sldAddFZBuffer();  // since F has changed buffering at other Z-levels has changed
	if (destTimer.isOn == true) {  // need to restart destruction timer (also restarted by sldChangeF())
		if (Number.isNaN(destTimer.id)) {
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	return;
	}

	// sldStrtFCyc () starts cycling through focal planes.  This function:
	//	(1)	switches buttons on navigator ("navFocStartCycle" & "navFocStopCycle") and
	//		on "View" menu
	//	(2)	calls sldNextFCyc() to show implement 1st step of cycle
	//	(3)	sets timer on glbFCycVal.timId
function sldStrtFCyc() {
			// inactivate buttons until image is displayed
	if (document.getElementById("sldBndBox").style.display == "none") {return;}
	if (glbWait) { return; }  // inactivate buttons if waiting for images to load
		// since changing focal planes doesn't involve destSldVw[] and doesn't involve hand-eye interactions
		//	I think that it is OK to leave destruction timer (destTimer) on here.
				// switch buttons
	document.getElementById("navFocStartCycle").style.display = "none";
	document.getElementById("menuFocStartCycle").style.display = "none";
	document.getElementById("navFocStopCycle").style.display = "block";
	document.getElementById("menuFocStopCycle").style.display = "block";
				// interrupt mouse-scrolling-slow-down
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (!Number.isNaN(sldMusSlwDwn.timer))) {
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}

		// make first step
	sldNextFCyc();
	if (glbWait) {  // glbWait set by sldNextFCyc()-sldChangeF().
			// If images for next F-plane aren't loaded, don't do anything more.
			//	glbWaitAct & glbWaitDir are set by sldSetWait(), which is called by sldNextFCyc()
		return; 
		}
	sldRestrictFZ(false,false);  // remove all excess Z-levels except for Z == curZ
		// turn on F-cycle timer
	if (!Number.isNaN(glbFCycVal.timId)) {  // timer already is on
		alert('sldStrtFCyc(): focus cycle timer already is on (timer ID = \"'
				+ glbFCycVal.timId + '\").  Timer will be turned off and and then turned back on.');
		clearInterval(glbFCycVal.timId);
		glbFCycVal.timId = Number.NaN;
		}
	glbFCycVal.timId = setInterval(sldNextFCyc,glbFCycInterval);
	if (Number.isNaN(glbFCycVal.timId)) {
		alert('sldStrtFCyc(): could not turn on focus cycle timer.  Timer ID is illegal (\"NaN\").');
		}
	return;
	}


	// sldStopFCyc () stops cycling through focal planes.  This function:
	//	(1)	switches buttons on navigator ("navFocStartCycle" & "navFocStopCycle") and
	//		on "View" menu
	//	(2)	clears timer on glbFCycVal.timId
function sldStopFCyc() {
		// switch buttons
	document.getElementById("navFocStartCycle").style.display = "block";
	document.getElementById("menuFocStartCycle").style.display = "block";
	document.getElementById("navFocStopCycle").style.display = "none";
	document.getElementById("menuFocStopCycle").style.display = "none";
			// if F-cycling is turned off during a "wait" state, the system will complete
			//		the interrupted focal-plane change when leaving "wait" as a single "f" step
	if (glbWait) { 
		if (glbWaitAct != "c") {
			alert("sldStopFCyc(): \"wait\" action (\"glbWaitAct\") must be \"c\" if \"navFocStopCycle\" "
					+ "and \"menuFocStopCycle\" are visible during a \"wait\" state (\"glbWait\" = true)."
					+ "\n  Please report this (probably fatal) error.");
			}
		else { glbWaitAct = "f"; }
		return;
		}
		// turn off timer
	if (Number.isNaN(glbFCycVal.timId)) {
		alert('sldStopFCyc(): focus cycle timer ID is illegal (\"NaN\"); cannot turn off timer');
		}
	else {
		clearInterval(glbFCycVal.timId);
		glbFCycVal.timId = Number.NaN;
		}
		// sldRestrictFZ() was called when F-cycling started, so F-plane restriction already has occured
	sldAddFZBuffer();  // since F may be different, need to add any missing buffer planes.
	return;
	}

function sldNextFCyc() {
		// f-cycle timer should be turned off by sldSetWait(), so sldNextFCyc() should never be called
		//	when glbWait == true, but it is safer to turn check & exit if this ever happens
	if (glbWait) {  // don't F-cycle if waiting for images
		if (!Number.isNaN(glbFCycVal.timId)) { // turn-off timer
			window.clearInterval(glbFCycVal.timId);
			glbFCycVal.timId = Number.NaN;
			}
		return;
		}
	var sldF = sldVw[sldVwI].f;  // focal plane value; will be incremented later
	var sldZ = sldVw[sldVwI].z;  // current zoom-level; used (only?) to get maxF
	var maxF = (dbSldData[sldZ].numF) - 1;  // index of 'top' focal plane
			// get new focal-plane value
	if (sldF == 0) { // at bottom of focus, must focus 'up'
		glbFCycVal.dir = 1;
		}
	if (sldF == maxF) { // at bottom of focus, must focus 'up'
		glbFCycVal.dir = -1;
		}
	sldF += glbFCycVal.dir;
			// use sldChangeF() to move to next focal plane
	sldChangeF(sldF);
	if (glbWait) {  // images for newFNum focal plane not full loaded & slideView NOT changed = > go into wait mode.
		sldSetWait("c",glbFCycVal.dir);
		}  
	return;
	}

	// sldChgFDefVal() is called (e.g. by chgSetSubmit()) if glbSldFDef or glbSldZFLim
	//		are changed after initialization.  This is necessary because the view-planes
	//		used if Z < glbSldZFLim changes if either of these values change
	//	sldChgFDefVal() is called AFTER glbSldFDef & glbSldZFLim have been changed, but before 
	//		any other actions (e.g., changing sldVwI or slide-view plane displayed) have been
	//		taken.
function sldChgFDefVal(oldFDef,oldZFLim)  {
	var i;
	var curZ = sldVw[sldVwI].z;  // zoom-level doesn't change
	var oldF = sldVw[sldVwI].f;  // focal-plane before any changes
	var maxF = dbSldData[curZ].numF - 1;
	var newSVI;  // new value for sldVwI if F changes
	var oldSVI = sldVwI;
			// turn-off timers
			// turn-off any timers
	if (!Number.isNaN(sldMusSlwDwn.timer)) {  // interrupt mouse-scrolling-slow-down
		sldMusSlwDwnTimerReset();
			// don't need to move stack since stack will be rebuilt using glbVwFocX,Y
		}
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }  // turn-off F-plane cycling
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
	if (!Number.isNaN(destTimer.id)) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
			// check for valid values
	if ((glbSldFDef < 0) || (glbSldFDef > maxF)) {
		alert('sldChgFDefVal():  value for \"Default focal plane\" (\"' 
				+ glbSldFDef + '\") cannot be less than \"0\" or greater than \"'
				+ maxF + '\".\n\n This value has been re-set to \"' + oldFDef + '\".');
		glbSldFDef = oldFDefault;
		}
	if ((glbSldZFLim < 0) || (glbSldZFLim > dbMaxZ)) {
		alert('sldChgFDefVal():  value for \"Zoom-level limit for focusing\" (\"' 
				+ glbSldZFLim + '\") cannot be less than \"0\" or greater than \"'
				+ dbMaxZ + '\".\n\n This value has been re-set to \"' + oldZFLim + '\".');
		glbSldZFLim = oldZFLim;
		}
			// if needed, add new 'current' view-plane
	if ((oldF != glbSldFDef) && (curZ < glbSldZFLim)) { // visible view plane will change.
			// get sldVw[] index for glbSldFDef,curZ view-plane (which will become the visible plane)
		sldUpdtFtoSV(curZ);
		newSVI = glbFtoSV[glbSldFDef];  // get sldVw[] index for glbSldFDef,curZ plane
		if (newSVI < 0) {  // glbSldFDef,curZ plane doesn't exist => add it
			sldAddPlane(glbSldFDef,dbRoot,curZ);
			sldUpdtFtoSV(curZ);
			newSVI = glbFtoSV[glbSldFDef];
			if (newSVI < 0) {  // failure adding new slideView plane to sldVw[]
				alert('sldChgFDefVal(): failure adding slideView plane (f =  ' + glbSldFDef 
						+ ') to sldVw[].\n\n The value for \"Default focal plane\" (\"' 
						+ glbSldFDef + '\") is being re-set to its previous value (\"'
						+ oldFDefault + '\").\n The value for \"Zoom-level limit for focus\" (\"'
						+ glbSldZFLim + '\") is being re-set to its previous value (\"'
						+ oldZFLimit +'\").');
				glbSldFDef = oldFDefault;
				glbSldZFLim = oldZFLimit;
				return;
				}
			}
			// display glbSldFDef,curZ slideView plane
		sldVw[newSVI].sldNode.style.visibility = "visible";
		sldVw[newSVI].sldVis = true;
		sldVwI = newSVI;
		sldVw[oldSVI].sldNode.style.visibility = "hidden";
		sldVw[oldSVI].sldVis = false;
		document.getElementById("menuSldFP").innerHTML = glbSldFDef;
		document.getElementById("menuDrpDwnFPVal").innerHTML = glbSldFDef;
		}
			// change focus controls to match new glbSldZFLim
	sldResetFocusControls()
			// reset buffer planes to match new values
	sldRestrictFZ(false,true);
	sldAddFZBuffer();
			// don't need to reset mouse slow-down & focus-cycling timers
			// if needed, restart destruction timer
	if (destSldVw.length > 0) {  // need to start destruction timer
		if (Number.isNaN(destTimer.id)) { 
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		destTimer.isOn = true;
		}
	return;
	}


	// sldChangeF() changes the displayed slideView plane to a plane with a different F-value.  This function:
	//	(1)	populates glbFtoSV[].
	//	(2)	if slideView plane with F-value exists, displays this plane
	//		else it calls sldAddPlane() to create slideView plane and then displays the plane
	//	(3)	if slideView planes defined by glbSldFBuf do not exist, sldChangeF() calls sldAddPlane() to create
	//				the new planes.
	//	(4)	if required by glbSldMaxF, it calls ... to remove excess slideView planes and updates glbFtoSV[]
function sldChangeF(newF) {
		// since changing focal planes doesn't involve destSldVw[] and doesn't involve hand-eye interactions
		//		I don't think that we need to turn-off the destruction timer (destTimer) for this function.
	var i;
	var wtBxNode;  // node for children of waitBox
	var cntAddn = 0;  // counter to keep track of number of slideView planes added
	var extF;  // temporary variable for F-values of new 'buffer' slideView's
	var newSVI;  // index in sldVw[] of slideView whose sldVw[].f == newF
	var oldSVI = sldVwI;  // index in sldVw[] of previously visible slideView plane
	var curZ = sldVw[sldVwI].z;
	
	if ((newF < 0) || (newF >= dbSldData[curZ].numF)) {
		alert('sldChangeF(): illegal value (\"' + newF + '\") for focal plane.  Cannot change focus.');
		return;
		}
		// glbFtoSV[] is an array ordered by F (for current Z), where the value of glbFtoSV[i] is the
		//		index is sldVw[] of the plane with Z=current Z and F = i.  
		//		glbFtoSV[i] == -1 if plane with f=i is not in sldVw[]
	sldUpdtFtoSV(curZ);  // update glbFtoSV[]
	newSVI = glbFtoSV[newF];  
			// if slideView plane with F-value == newF does not exist, create it
			//	if slideView plane with F== newF does not exist, then glbFtoSV[newF]==-1
	if (newSVI < 0) {  // F-value slideView plane does not exist
		sldAddPlane(newF,dbRoot,curZ);
		sldUpdtFtoSV(curZ);
		newSVI = glbFtoSV[newF];
		if (newSVI < 0) {  // failure adding new slideView plane to sldVw[]
			alert('sldChangeF(): failure adding slideView plane (f =  ' + newF + ') to sldVw[].  Cannot change focus.' );
			return;
			}
		if (glbIsWaitBxActive) { waitMkBox(); }  // added viewPlane to sldVw[], if waitBox is active need to update it
		}
			// check to see if sldVw{newSVI] is fully loaded.
	if (sldVw[newSVI].sldWaitArr.length > 0) {
		sldVw[newSVI].sldWait = true;
			// because sldChangeF() doesn't know if it was changing in response to button-click or F-timer cycling
			//		this function can't call sldSetWait(), instead it sets glbWait and lets (requires) that the 
			//		function calling sldChangeF() call sldSetWait()
		glbWait = true;  // calling function will use glbWait to determine whether to call sldSetWait() 
		if (glbIsWaitBxActive) {  // if waitBox is active, need to update "wait"-state date in waitBox
			wtBxNode = document.getElementById("wtIsM" + newSVI);
			if (wtBxNode != null) { 
				wtBxNode.innerHTML = "&#9745;"; 
				}
			}
		return;
		}
	sldVw[newSVI].sldWait = false;  // probably not necessary, it's a cheap precaution, since we tested sldWaitArr
			// display slideView plane
	sldVw[newSVI].sldNode.style.visibility = "visible";
	sldVw[newSVI].sldVis = true;
	sldVwI = newSVI;
	sldVw[oldSVI].sldNode.style.visibility = "hidden";
	sldVw[oldSVI].sldVis = false;
	document.getElementById("menuSldFP").innerHTML = newF;
	document.getElementById("menuDrpDwnFPVal").innerHTML = newF;
	if (glbIsWaitBxActive) {  // if waitBox is active, need to update "is-visible" in waitBox
		wtBxNode = document.getElementById("wtIsV" + newSVI);
		if (wtBxNode != null) { wtBxNode.innerHTML = "&#9745;"; }
		wtBxNode = document.getElementById("wtIsV" + oldSVI);
		if (wtBxNode != null) { wtBxNode.innerHTML = "&#9744;"; }
		}
		// add F-plane buffer planes to slideView
	for (i = 1; i <= glbSldFBuf; i++) {
		extF = newF + i;
		if ((extF < dbSldData[curZ].numF) && (glbFtoSV[extF] < 0)) {
			sldAddPlane(extF,dbRoot,curZ);
			cntAddn++;
			}
		extF = newF - i;
		if ((extF >= 0) && (glbFtoSV[extF] < 0)) {
			sldAddPlane(extF,dbRoot,curZ);
			cntAddn++;
			}
		}
		// check sldVw alignment
	sldChkFAlign();
		// test for, and remove, excess F-planes from slideView
			//	sldUpdtFtoSV() returns the number of F-planes (at current Z) in slideView
			//	glbSldMaxF is the maxiimum number of F-planes allowed in slideView during 
			//		focusing operations.
			//	In most cases, at initialization glbSldMaxF is set to glbSldMaxF = dbMaxF,
			//		and the test:  sldUpdtFtoSV() > glbSldMaxF fails.
			//	Testing for excess F-planes (and calling sldLimitF() to remove them)
			//		is included here in case glbSldMaxF was decreased on initialization
			//		(through command-line argument) or using "Change Settings"
	if ( sldUpdtFtoSV(curZ) > glbSldMaxF) { 
		sldLimitF(glbSldMaxF);
		if (glbIsWaitBxActive) { waitMkBox(); }
		}
		// unless waitBox was already updated after call to sldLimitF() (see immediately above)
		//	need to update waitBox if waitBox is active AND if viewPlanes were added to sldVw[]
	else if (glbIsWaitBxActive && (cntAddn > 0)) { waitMkBox(); } 
	return;
	}


	//sldLimitF() removes slideView planes from sldVw[] until the number 
	//		focus levels (at current Z-level) is less-than or equal-to the
	//		specified value.  The function is passed:
	//	(1)	numLimitF: is an integer indicating the number of F-levels to keep in sldVw[]
	//		if numLimitF is less than the number of F-planes buffered at this Z-level, then
	//			the number of F-planes preserved is ( 2*glbSldFBuf ) + 1
	//	The function removes the focal planes furthest from the current focal plane first.
	//	The multiple calls to sldUpdtFtoSV() is awkward and unnecessary (see sldRestrictFZ()
	//		for use of an array that stores a list of planes-to-be-deleted rather than altering
	//		sldVw[] midway through the search).  At some point this function probably should
	//		be re-written, but its only used when focusing up-and-down with glbSldMaxF < dbMaxF
	//	NOTE:  sldLimitF() does NOT remove F-planes with Z != curZ.  Use sldRestrctF() with
	//		limCurZ == false in conjunction with sldLimitF
function sldLimitF(numLimit) {
			// turn-off focal-plane cycling.
			//	F-cycling could be on if glbSldMaxF < dbMaxF; see sldChangeF()
	var isFCycTimerOn = false;  // used at end of function to determine whether to turn F-cycling on
	if (!Number.isNaN(glbFCycVal.timId)) {  // f-cycling was on
		clearInterval(glbFCycVal.timId);
		glbFCycVal.timId = Number.NaN;
		isFCycTimerOn = true;
		}
					// interrupt destruction timer
	if (destTimer.isOn) {  // need to interrupt destruction timer
		if (Number.isNaN(destTimer.id) == false) {
			window.clearInterval(destTimer.id);
			destTimer.id = Number.NaN;
			}
		}
	var i;
	var lmtLoop = 0;  // a counter to ensure 'while' loop is not endless
	var topI;
	var botI;
	var indSV;  // index for sldVw
	var curF = sldVw[sldVwI].f;
	var curZ = sldVw[sldVwI].z;
	var tmpF;  // F for slideView plane being tested 
	var tmpZ;  // Z for slideView plane being tested 
	var maxF = dbSldData[curZ].numF;
	var numCur = sldUpdtFtoSV(curZ);
	var numToKeep = (2 * glbSldFBuf) + 1;
	if (numLimit > numToKeep) { numToKeep = numLimit; }
			// walk through sldVw[], removing F(at z=curZ) until <= numToKeep
	while ((numCur > numToKeep) && (lmtLoop < 1000)) {
		for (i = maxF; i > glbSldFBuf; i-- ) {  // counts down range of +/- glbSldFBuf around curF 
			topI = curF + i;
			botI = curF - i;
			if (topI < maxF) {
				if (glbFtoSV[topI] >= 0) {  // sldVw[] has plane with f==topI
					indSV = glbFtoSV[topI];
					sldRemovePlane(indSV,false);
					break;		//this breaks the 'for' loop
					}
				}
			if (botI >= 0 ) {
				if (glbFtoSV[botI] >= 0) {  // sldVw[] has plane with f==botI
					indSV = glbFtoSV[botI];
					sldRemovePlane(indSV,false);
					break;
					}
				}
			}  // end of 'for' loop  => for counts down until slideView plane is removed or limit is reached
		lmtLoop++;
		if (lmtLoop >= 1000) { alert("sldLimitF():  runaway 'while' loop.  Aborting loop."); }
		numCur = sldUpdtFtoSV(curZ);  // need to update glbFtoSV since splicing sldVw changes indices
		}
			// re-start F-cycling timer
	if (isFCycTimerOn) { glbFCycVal.timId = setInterval(sldNextFCyc,glbFCycInterval); }
			// start/re-start destTimer
	if (destTimer.isOn) {
		if (Number.isNaN(destTimer.id)) {  // need to re-start timer
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	else {  // destruction timer is off
		if (Number.isNaN(destTimer.id) == false) {  // this should NOT be, it is good to check for errors
			alert('Destruction array timer is \"off\", but has ad ID number (\"' + destTimer.id +'\").');
			window.clearInterval(destTimer.id);
			destTimer.id = Number.NaN;
			}
		if (destSldVw.length > 0) {  // need to start timer
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			destTimer.isOn = true;
			}
		}
	return;
	}


	// sldRealignSldVw() uses calls to sldGoToView() to redraw all slideView planes
	//		with Z==sldVw[arrI].z (with different f) using common values for top/left
	//		and sldStrtX,YId.  This function was created to deal with cases where
	//		rounding errors during moves results in a slight off-set between focal-planes.
	//	arrI is the sldVw index of the slideView plane that will serve as the reference
	//		to which all the other planes will be aligned.  I suspect that we will 
	//		never have a case where arrI != sldVwI, but passing the index leaves us with
	//		the flexibility to align planes with zoom-levels other than the one being viewed.
function sldRealignSldVw(arrI) {
	var i;
	var curZ = sldVw[arrI].z;
	var curStrtX = sldVw[arrI].tiStrtXId;
	var curStrtY = sldVw[arrI].tiStrtYId;
	var curLeft = parseInt(sldVw[arrI].sldNode.style.left);
	var curTop = parseInt(sldVw[arrI].sldNode.style.top);
	var tiMxX = sldVw[arrI].tiMxNumX;
	var tiMxY = sldVw[arrI].tiMxNumY;
	for (i = 0; i < sldVw.length; i++) {
		if (curZ != sldVw[i].z) { continue; }
		if (arrI == i) { continue; }
		if (tiMxX != sldVw[i].tiMxNumX) {
			alert('sldRealignSldVw(): Number of tiles in row (\"' + tiMxX 
					+ '\") for reference plane (\"' + arrI 
					+ '\") is different from number of tiles in row (\"' + sldVw[i].tiMxNumX 
					+ '\") for current view-plane (\"' + i + '\").  Aborting realignment.');
			break;
			}
		if (tiMxY != sldVw[i].tiMxNumY) {
			alert('sldRealignSldVw(): Number of rows (\"' + tiMxY 
					+ '\") for reference plane (\"' + arrI 
					+ '\") is different from number of rows (\"' + sldVw[i].tiMxNumY 
					+ '\") for current view-plane (\"' + i + '\").  Aborting realignment.');
			break;
			}
		sldGoToView(i,curLeft,curStrtX,tiMxX,curTop,curStrtY,tiMxY);
		}
	return;
	}

function sldChkFAlign() {
	var i;
	var curZ = sldVw[sldVwI].z;
	var refX = (sldVw[sldVwI].tiStrtXId * glbTileSzX) + parseInt(sldVw[sldVwI].sldNode.style.left);
	var refY = (sldVw[sldVwI].tiStrtYId * glbTileSzY) + parseInt(sldVw[sldVwI].sldNode.style.top);
	var tmpX;
	var tmpY;
	var isAligned = true;
	for (i = 0; i < sldVw.length; i++) {
		if (sldVw[i].z == curZ) {
			tmpX = (sldVw[i].tiStrtXId * glbTileSzX) + parseInt(sldVw[i].sldNode.style.left);
			if (tmpX != refX) {
				isAligned = false;
				break;
				}
			tmpY = (sldVw[i].tiStrtYId * glbTileSzY) + parseInt(sldVw[i].sldNode.style.top);
			if (tmpY != refY) {
				isAligned = false;
				break;
				}
			}  // end if X = curZ
		}  // end 'for' loop
	if (!isAligned) { sldRealignSldVw(sldVwI); }
	return (isAligned);
	}
	


//       ******************************************************************
//       *********       functions to disable/enable Focusing   ***********
//       ******************************************************************

	// Since focusing is allowed only if z > glbSldZFLim, display of the
	//		focusing controls has to be displayed/hidden depending on
	//		Z-level.  To avoid duplicating code in multiple locations
	//		the display instructions turning on/off the focus controls
	//		are aggregated into sldResetFocusControls().
function sldResetFocusControls() {
	if ((dbMaxF == 1) || glbFDisabled) { return; }  // focus control is turned off
	if (sldVw[sldVwI].z < glbSldZFLim) {
				// navigator controls
		document.getElementById("navNoFocusTxtBx").innerHTML = "Focusing not available for zoom-levels < " + glbSldZFLim;
		document.getElementById("navNoFocus").style.display = "block";
		document.getElementById("navFPbtn11").style.display = "none";
		document.getElementById("navFPbtn21").style.display = "none";
		document.getElementById("navFocStartCycle").style.display = "none";
				// menu controls
		document.getElementById("menuNoF").style.display = "block";
		document.getElementById("menuFBtn12").style.display = "none";
		document.getElementById("menuFBtn22").style.display = "none";
		document.getElementById("menuFocStartCycle").style.display = "none";
		document.getElementById("menuRealignFoc").style.display = "none";
		}
	else {
		document.getElementById("navNoFocus").style.display = "none";
		document.getElementById("navFPbtn11").style.display = "block";
		document.getElementById("navFPbtn21").style.display = "block";
		document.getElementById("navFocStartCycle").style.display = "block";
				// menu controls
		document.getElementById("menuNoF").style.display = "none";
		document.getElementById("menuFBtn12").style.display = "block";
		document.getElementById("menuFBtn22").style.display = "block";
		document.getElementById("menuFocStartCycle").style.display = "block";
		document.getElementById("menuRealignFoc").style.display = "block";
		}
	return;
	}

		// sldHideFCntrl() is called by sldInitializeView() when a single-focal plane slide is loaded
		//	and by sldEnDisableF() when focusing is disabled.
		// The function removes focus controls from navigator & menu.
function sldHideFCntrl() {
				// hide focal plane controls
	document.getElementById("navFocCntrl").style.display = "none";
	document.getElementById("menuNoF").style.display = "none";
	document.getElementById("menuFBtn12").style.display = "none";
	document.getElementById("menuFBtn22").style.display = "none";
	document.getElementById("menuFocStartCycle").style.display = "none";
	document.getElementById("menuRealignFoc").style.display = "none";
	document.getElementById("menuViewFDiv2").style.display = "none";
				// hide mouse-wheel controls
	glbMusWheelFZ = "z";
	document.getElementById("menuMusWheelSel").style.display = "none";
	document.getElementById("menuViewFDiv1").style.display = "none";
	document.getElementById("navMusWhlZBox").style.display = "none";
				// hide focus-related setting changes
	document.getElementById("menuRestrictF").style.display = "none";
	document.getElementById("menuZFLiimit").style.display = "none";
	document.getElementById("menuFDef").style.display = "none";
	document.getElementById("menuFChgSet").style.display = "none";
				// change navigator settings
	document.getElementById("navZbtn11").style.height = "30px";
	document.getElementById("navZ11InsideTop").style.top = "-3px";
	document.getElementById("navZ11InsideBot").style.bottom = "-2px";
	document.getElementById("navZbtn21").style.height = "30px";
	document.getElementById("navZbtn21").style.top = "63px";
	document.getElementById("navZ21InsideTop").style.top = "-3px";
	document.getElementById("navZ21InsideBot").style.bottom = "-2px";
	document.getElementById("navZoomCntrl").style.height = "96px";
	document.getElementById("navMvBtn16").style.marginLeft = "49px";
	document.getElementById("navMvBtn11").style.marginLeft = "49px";
	document.getElementById("navMvBtn21").style.marginLeft = "49px";
	document.getElementById("navMvBtn26").style.marginLeft = "49px";
	document.getElementById("navMvBtn36").style.marginTop = "54px";
	document.getElementById("navMvBtn31").style.marginTop = "54px";
	document.getElementById("navMvBtn41").style.marginTop = "54px";
	document.getElementById("navMvBtn46").style.marginTop = "54px";
	document.getElementById("sldNavigator").style.height = "180px";
	document.getElementById("sldNavigator").style.width = "169px";
	return;
	}

		// sldShowFCntrl() is called by sldEnableF().
		//	This function reverses the actions of sldHideFCntrl(),
		//		resetting the navigatore and displaying the focus-related
		//		menu buttons.
		//	Since it uses sldResetFocusControls(), this function must be called
		//		AFTER glbFDisabled = false && sldChgFDefVal() have been called.
function sldShowFCntrl() {
				// show or change navigator settings
	document.getElementById("sldNavigator").style.height = "236px";
	document.getElementById("sldNavigator").style.width = "260px";
	document.getElementById("navFocCntrl").style.display = "block";
	document.getElementById("navZoomCntrl").style.height = "152px";
	document.getElementById("navMusWhlZBox").style.display = "block";
	document.getElementById("navZbtn21").style.height = "44px";
	document.getElementById("navZbtn21").style.top = "78px";
	document.getElementById("navZ21InsideTop").style.top = "4px";
	document.getElementById("navZ21InsideBot").style.bottom = "7px";
	document.getElementById("navZbtn11").style.height = "45px";
	document.getElementById("navZ11InsideTop").style.top = "4px";
	document.getElementById("navZ11InsideBot").style.bottom = "7px";
	document.getElementById("navMvBtn16").style.marginLeft = "96px";
	document.getElementById("navMvBtn11").style.marginLeft = "96px";
	document.getElementById("navMvBtn21").style.marginLeft = "96px";
	document.getElementById("navMvBtn26").style.marginLeft = "96px";
	document.getElementById("navMvBtn36").style.marginTop = "84px";
	document.getElementById("navMvBtn31").style.marginTop = "84px";
	document.getElementById("navMvBtn41").style.marginTop = "84px";
	document.getElementById("navMvBtn46").style.marginTop = "84px";
			// display & set mouse wheel controls
			// navigator mouse-wheel selector displayed above
	document.getElementById("menuMusWheelSel").style.display = "block";
	document.getElementById("menuViewFDiv1").style.display = "block";
	if (glbMusWheelFZ == "f") {
		document.getElementById("menuMusWhlFRadio").checked = true;
		document.getElementById("navMusWhlFRadio").checked = true;
		}
	else {
		document.getElementById("menuMusWhlZRadio").checked = true;
		document.getElementById("navMusWhlZRadio").checked = true;
		}
			// display menu focus controls and
			//  update menu & navigator controls for glbSldZFLim
	sldResetFocusControls();
	document.getElementById("menuViewFDiv2").style.display = "block";
				// show focus-related setting changes
	document.getElementById("menuRestrictF").style.display = "block";
	document.getElementById("menuZFLiimit").style.display = "block";
	document.getElementById("menuFDef").style.display = "block";
	document.getElementById("menuFChgSet").style.display = "block";
	return;
	}

		// sldDisableF() can only be called at or after initialization.
		//	Clicking "Disable focus" before initializetion causes sldDisable to be set to true
		//  	which will call this function on intialization.
		//	The function:
		//	(1)	saves old values of F parameters.
		//	(2) sets sldFZLimit = dbMax & glbSldFDef = curF so current focal plane is displayed and
		//		focusing is disabled at all zoom-levels.
		//	(3)	sets glbSldFBuf = 0 & glbSldFZBuf = 0; so focal-planes are not buffered
		//	(4) calls sldChgFDefVal() to clean-up any extra slideView planes.
		//	(5)	calls sldHideFCntrl() to hide focus controls.
function sldDisableF() {
		// save current state so it can be restored by sldEnableF()
	var curF = sldVw[sldVwI].f;
	glbOldFBuf = glbSldFBuf;
	glbSldFBuf = 0;
	glbOldFZBuf = glbSldFZBuf;
	glbSldFZBuf = 0;
	glbOldFDef = glbSldFDef;
	glbSldFDef = curF;
	glbOldZFLim = glbSldZFLim;
	glbSldZFLim = dbMaxZ;
		// use sldChgFDefVal() to clean-up slideView stack
	sldChgFDefVal(glbOldFDef,glbOldZFLim);
	glbFDisabled = true;  // this is redundant, but better safe than sorry
	sldHideFCntrl();  // hide focus controls
			// update setting menu
	document.getElementById("menuFBufVal").innerHTML = glbSldFBuf;
	document.getElementById("menuFZBufVal").innerHTML = glbSldFZBuf;
	document.getElementById("menuMaxFVal").innerHTML = "&nbsp;";
	return;	
	}

		// sldEnableF() undoes what sldDisable() did.
		//	Unlike sldDisableF(), this function is NOT called on initialization
		//		since the default action is for focusing to be enabled if dbMaxZ > 1
function sldEnableF() {
	var curF = sldVw[sldVwI].f;
		// restore values for glbSldFBuf, glbSldFZBuf, glbSldFDef by sldEnableF()
	glbSldFBuf = glbOldFBuf;
	glbOldFBuf = Number.NaN;
	glbSldFZBuf = glbOldFZBuf;
	glbOldFZBuf = Number.NaN;
	glbSldFDef = glbOldFDef;
	glbOldFDef = Number.NaN;
	glbSldZFLim = glbOldZFLim;
	glbOldZFLim = Number.NaN;
		// only need to clean-up slideView stack if curF != glbSldFDef
	if (curF != glbSldFDef) { sldChgFDefVal(curF,dbMaxZ); }
	else { sldAddFZBuffer(); }  // add missing F-buffer planes
	glbFDisabled = false;  // this is redundant, but better safe than sorry
	sldShowFCntrl();
			// update setting menu
	document.getElementById("menuFBufVal").innerHTML = glbSldFBuf;
	document.getElementById("menuFZBufVal").innerHTML = glbSldFZBuf;
	document.getElementById("menuMaxFVal").innerHTML = glbSldMaxF;
	return;	
	}

		// sldEnDisableF() is called by the 'menuEnDisableF' button on the Settings menu
		//	This function toggles the boolean 'glbFDisabled' variable, sets the 'menuEnDisableF' innerHTML text,
		//		and then calls sldDisableF() or sldEnableF() as appropriate.	
function sldEnDisableF() {
	var sldVwIsInit = false;  // indicates if slideView is initialized
	if (document.getElementById("sldBndBox").style.display == "block") {
		sldVwIsInit = true;
		}
	if (glbFDisabled) {  // focusing was disabled, enable it
		glbFDisabled = false;
		document.getElementById("menuEnDisableF").innerHTML = "Disable focusing";
		if (!sldVwIsInit) { return; }
		else { sldEnableF(); }
		}
	else { // focusing was enabled, disable it
		glbFDisabled = true;
		document.getElementById("menuEnDisableF").innerHTML = "Enable focusing";
		if (!sldVwIsInit) { return; }
		else { sldDisableF(); }
		}
	return;	
	}


//       ******************************************************************
//       *********       slideView zoom-level (Z) FUNCTIONS   ***********
//       ******************************************************************

	// sldChangeZ() changes the displayed slideView plane to a plane with a different zoom-level.  This function:
	//	(1)	populates glbZtoSV[].
	//	(2)	if slideView plane with F-value exists, displays this plane
	//		else it calls sldAddPlane() to create slideView plane and then displays the plane
	//	(3)	if slideView planes defined by glbSldFBuf do not exist, sldChangeF() calls sldAddPlane() to create
	//				the new planes.
	//	(4)	if required by glbSldMaxF, it calls ... to remove excess slideView planes and updates glbFtoSV[]
function sldChangeZ(newZ) {
	var wtBxNode;  // node for children of waitBox
	var oldSVI = sldVwI;  // sldVw[] index of formerly visible slideView plane.
	var newSvI;   // sldVw[] index of slideView plane at newZ; assigned below
	var newF = sldVw[sldVwI].f;	// F value of new slideView plane; adjusted below.
	if (newZ < glbSldZFLim) { newF = glbSldFDef; }  // use default F if focusing turned off
	if ((newZ < 0) || (newZ >= dbMaxZ)) {
		alert('sldChangeZ(): illegal value (\"' + newZ + '\") for zoom-level.  Cannot change zoom-level.');
		return;
		}
		// sldUpdtZtoSV creates an array ordered by Z-level whose value is index in sldVw[] at curF
		//		glbZtoSV[] == -1 indicates the Z-level is not present in sldVw[]
	sldUpdtZtoSV();
	newSVI = glbZtoSV[newZ];  // newSVI is index in sldVw[] of slideView plane with Z == newZ
	if (newSVI < 0) {  // slideView plane with z == newZ doesn't exist
		sldAddPlane(newF,dbRoot,newZ);  // create new slideView plane
		sldUpdtZtoSV();  // update glbZtoSV[] to add new slideView plane
		newSVI = glbZtoSV[newZ];  // find new slideView plane in sldVw[]
		if (newSVI < 0) {  // failure adding new slideView plane to sldVw[]
			alert("sldChangeZ(): could not add slideView plane (z = " + newZ + ") to sldVw[].  Cannot change zoom-level.");
			return;
			}
		if (glbIsWaitBxActive) { waitMkBox(); }  // added viewPlane to sldVw[], if waitBox is active need to update it
		}
			// check to see if all images in sldVw{newSVI] are loaded.
	if (sldVw[newSVI].sldWaitArr.length > 0) {
		sldVw[newSVI].sldWait = true;
			// because sldChangeZ() doesn't know the direction of zoom; setting glbWaitAct & glbWaitDir is done by
			//	(call to sldSetWait()) by calling fxn (which always is sldZBtnClk()?)
		glbWait = true;  // calling function will use glbWait to determine whether to cal sldSetWait() 
		if (glbIsWaitBxActive) {  // if waitBox is active, need to update "wait"-state date in waitBox
			wtBxNode = document.getElementById("wtIsM" + newSVI);
			if (wtBxNode != null) { wtBxNode.innerHTML = "&#9745;"; }
			}
		return;
		}
	sldVw[newSVI].sldWait = false;  // probably not necessary, it's a cheap precaution, since we tested sldWaitArr
			// all images are loaded, can proceed with making viewPlane visible
			//	display slideView plane
	sldVw[newSVI].sldNode.style.visibility = "visible";
	sldVw[newSVI].sldVis = true;
	sldVwI = newSVI;
	sldVw[oldSVI].sldNode.style.visibility = "hidden";
	sldVw[oldSVI].sldVis = false;
	if (glbIsWaitBxActive) {  // if waitBox is active, need to update "is-visible" in waitBox
		wtBxNode = document.getElementById("wtIsV" + newSVI);
		if (wtBxNode != null) { wtBxNode.innerHTML = "&#9745;"; }
		wtBxNode = document.getElementById("wtIsV" + oldSVI);
		if (wtBxNode != null) { wtBxNode.innerHTML = "&#9744;"; }
		}
	document.getElementById("menuSldZ").innerHTML = newZ;  
	document.getElementById("menuDrpDwnZVal").innerHTML = newZ;
	menuSetZMag(newZ);  // display newZ's magnification on Slide Info menu
	document.getElementById("menuSldFP").innerHTML = newF;  // focal plane may have changed if z < glbSldZFLim
	document.getElementById("menuDrpDwnFPVal").innerHTML = newF;
	sldResetFocusControls()
			// remove view-planes outside of buffering region
	sldRestrictFZ(false,true);
			// add new buffering planes if needed
	sldAddFZBuffer();
			// check to see if destruction timer is needed (sldRestrictFZ() was called)
	if (destSldVw.length > 0) {  // need to start destruction timer
		if (Number.isNaN(destTimer.id)) { 
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		destTimer.isOn = true;
		}
	return;
	}


	//  sldZBtunClk() handles navigator or menu commands (button-clicks) that change the zoom level.
	//  Buttons are coded as for move-buttons:
	//    dig1:  0=wait-restart, 1=navigator 2=menu, 3=mouse wheel,4=double-click mouse
	//    dig2:  1=Zoom Out, 2=Zoom In
function sldZBtnClk(btnNum) {
			// inactivate buttons until image is displayed
	if (document.getElementById("sldBndBox").style.display == "none") {return;}
	if (glbWait) { return; } 
				// interrupt mouse-scrolling-slow-down and update slideView stack
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (!Number.isNaN(sldMusSlwDwn.timer))) {
		sldMusSlwDwnTimerReset();
		}
		// prior to 11/21/19, the call to sldMoveStack() was inside the "if" test of slow-down scrolling.
		//		However, with the introduction of 2-finger movements, we can't guarantee that we are in
		//		a "mouse-up" (< 2-finger) state at this point.
	if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}
			// turn-off focal-plane cycling.
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
	if (!Number.isNaN(destTimer.id)) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}

	var i;
	var newZNum = sldVw[sldVwI].z;  // zoom-level => adjusted to new value below
	var oldArrI = sldVwI;  // index to old focal plane in slideView
	var newArrI = Number.NaN;  // index to new focal plane in slideView

	var btnDig1 = btnNum % 10;  // 1st digit indicates type (source) of button
	  // 2nd digit of button indicates focus up/down
	var btnDig2 = Math.floor(btnNum/10);
			// check for valid button number
	if ((btnDig1 < 0) || (btnDig1 > 4)) {
		alert('sldZBtnClk():  First digit (\"' + btnDig1 + '\") of zoom-change button number (\"' 
			+ btnNum + '\") is invalid - ZOOM-LEVEL NOT CHANGED');
		return;
		}
			// adjust newFNum to indicate new focal (as specified by button number
	if (btnDig2 == 1) { newZNum--; } // zoom-out, decrease Z
	else if (btnDig2 == 2) { newZNum++; }  // zoom-in, increaseZ
	else {
		alert('sldZPBtnClk():  Second digit (\"' + btnDig2 + '\") of zoom-change button number (\"' 
			+ btnNum + '\") is invalid - ZOOM-LEVEL NOT CHANGED');
		return;
		}
			// check to for top/bottom zoom-levels
			//	NOTE:  Eventually hitting the bottom zoom-level will result in pixel-multiplication
			//		zoom, rather than an alert box
	if (newZNum < 0) {
		warnBoxCall(true,"Zoomed-Out",'Already maximally zoomed-out (zoom-level = \"0\").  Cannot zoom-out further.  The zoom-level was NOT changed.');
		return;
		}
	else if (newZNum >= dbMaxZ) {
		warnBoxCall(true,"Zoomed-In",'Already at highest magnification (zoom-level = \"' + (dbMaxZ-1) + '\").  Cannot zoom-in further.  The zoom-level was NOT changed.');
		return;
		}
	else { sldChangeZ(newZNum);  }
	if (glbWait) {  // images for newFNum focal plane not full loaded & slideView NOT changed = > go into wait mode.
		if (btnDig2 == 1) { sldSetWait("z",1); }
		else { sldSetWait("z",-1); }
		}  
	if (destTimer.isOn == true) {  // need to restart destruction timer
		if (Number.isNaN(destTimer.id)) {
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	return;
	}



