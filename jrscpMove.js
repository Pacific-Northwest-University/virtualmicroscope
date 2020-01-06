// jrscpMove.js
//	Copyright 2019  Pacific Northwest University of Health Sciences
    
//	jrscpMove.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpMove.js)
//		- four PHP files
//	jrscpMove.js contains javascript functions that are involved in moving the slideView-planes.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//       *************************************************************
//       *********       slideView other mouse FUNCTIONS   ***********
//       *************************************************************

	// sldBndBoxMusMv() sends clientX,Y position to sldShwXYPos() when mouse moves.
	//	This should be what happens when mouse is moved with buttons UP
function sldBndBoxMusMv(mouseMv) {
	if (glbSVTchPt > 0) { return; }  //Touches are acive, mouse is inactive
	else { sldShwXYPos(mouseMv.clientX, mouseMv.clientY); }
	return;
	}

//       ************************************************************
//       *********       slideView mouse MOVE FUNCTIONS   ***********
//       ************************************************************


	// sldMoveViewMusDown() is called when a onmousedown event occurs on slideView
function sldMoveViewMusDown(eventMusDown) {
	if (glbSVTchPt > 0) {  // When touches are acive, mouse is inactive
		warnBoxCall(false,"Mouse disabled","The mouse is not active when a finger is touching a touch-sensitive screen.");
		return; 
		} 
	var i;
			// if F-cycle timer is on => turn-off focal plane cycling
	if (Number.isNaN(glbFCycVal.timId) == false) { sldStopFCyc(); }
			// restrict F-planes if too many planes in sldVw[]
			//	since isMusMv == true, extra slideView planes go into purgSldVw
	sldRestrictFZ(true,true);
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
			//	turning off destTimer MUST come after (potential) call to sldRestrictFZ() since
			//		sldRestrictF turns on destruction timer
	if (Number.isNaN(destTimer.id) == false) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
		  // if scrolling is slowing down after previous move, stop scrolling & update stack
		  //   scrolling-slow down implies that sldVw[] already is F-restricted.
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (Number.isNaN(sldMusSlwDwn.timer) == false)) {
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}

	var curTime = new Date();  // need this to calculate velocity
		// check for left button =>  NOTE: this is where we can handle other mouse buttons
	if (eventMusDown.which != 1) { return;}
	else {   // left button down
		sldMusPos.x = eventMusDown.clientX;
		sldMusPos.y = eventMusDown.clientY;
		sldMusPos.eventTime = curTime;
		document.getElementById("sldBndBox").style.cursor = "move";
		// set onmousemove events to be handled by sldMoveViewMus()
		document.getElementById("sldBndBox").onmousedown.bubbles = true;
		document.getElementById("sldBndBox").onmousemove = function(event){sldMoveViewMus(event)};
		}
	return;
	}

	// sldMoveViewMus() is called when mouse is moved and mouse-button is down
function sldMoveViewMus(eventMusMove) {
//	var tmpTxt = "";
	var curTime = new Date();
	var curX = eventMusMove.clientX;
	var curY = eventMusMove.clientY;
	var sldMoveX = curX - sldMusPos.x;
	var sldMoveY = curY - sldMusPos.y;
			// move current view-plane and track movements for other sldVw planes
	sldMoveView("sldBndBox", sldVwI, sldMoveY, sldMoveX);  // move sldView
	sldMvDistX += sldMoveX;  // update sldMove values for other sldVw planes
	sldMvDistY += sldMoveY;  

		// get variables for slow-down velocity
	var sldElapsedTime = curTime.getTime() - sldMusPos.eventTime.getTime();
	var curVelX = sldMoveX/sldElapsedTime;
	var curVelY = sldMoveY/sldElapsedTime;
	var avgPts = sldMusSlwDwn.avgPts;
		//reset external variables => sld MvDistX,Y already set (above)
			// update sldMusPos object
	sldMusPos.x = curX;
	sldMusPos.y = curY;
	sldMusPos.eventTime = curTime;
			// update sldMusSlwDwn velocity values
	if (Number.isFinite(curVelX) && Number.isFinite(curVelY)) {
		sldMusSlwDwn.velX = ((sldMusSlwDwn.velX * avgPts) + curVelX)/(avgPts + 1);
		sldMusSlwDwn.velY = ((sldMusSlwDwn.velY * avgPts) + curVelY)/(avgPts + 1);
		}
	return;
	}

	//sldMoveViewMusReset() is called when mouse-button is released
function sldMoveViewMusReset(eventMouseUp) {
	var curTime = new Date();  // need time of mouseUp for sldElapsedTime (see below)
		// reset cursor and onmousemove handling
	document.getElementById("sldBndBox").onmousemove = function(event){sldBndBoxMusMv(event)};
	if (glbWait) { document.getElementById("sldBndBox").style.cursor = "wait"; }
	else { document.getElementById("sldBndBox").style.cursor = "default"; }
			// onMouseDown or 2-finger touch F-restricted planes were moved to purgSldVw.
			//	These need either to be restored (if mouse-down or touch was abortive
			//	or moved to destSldVw[].
	purgClrArray();
		//  if mouse has been moved during the last 0.5 seconds,set sldMusSlwDwn timer
	var sldElapsedTime = curTime.getTime() - sldMusPos.eventTime.getTime();
	if (sldElapsedTime < glbSlwDwnMxTime ) {  // button released immediately after moving: start mouse slow-down scrolling
		sldSetSlwDwnVel();
		}
	else {      // mouse-derived movement of screen is done: update stack & set sldVwFoc
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
			// sldRestrictFZ() was called before the start of the movement
			// sldAddFZBuffer() was called when F-btn or Z-btn was clicked or when F-cycling was stopped 
				// test for destSldVw[] and purgSldVw[] over maximum
		if ((destSldVw.length + purgSldVw.length) > destArrayMaxNum) {
			alert('Destruction array sizes (destSldVw = ' + destSldVw.length
					+ ' & purgSldVw = ' + purgSldVw.length 
					+ ') exceed maximum (\"' + destArrayMaxNum 
					+ '\").  These arrays will be purged now.');
			destClearArr();
			}
				// if destruction array timer was turned off at beginning of mouse movement, turn it back on
		else if (destTimer.isOn && Number.isNaN(destTimer.id)) {
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	return;
	}


		// sldMusSlwDwnTimerReset() resets the mouse-slow-down timer (i.e., sldMusSlwDwn).  This function:
		//	(1)	sets velocity to 0
		//	(2)	turns off timer (i.e. clears interval and sets timer to NaN)
		//	This function was created (7/26/19) to replace identical code in:
		//	 - sldMoveViewMusDown()
		//	 - sldMvBtnDown()
		//	 - sldMoveViewMusReset()
function sldMusSlwDwnTimerReset() {
	if (!Number.isNaN(sldMusSlwDwn.timer)) {  // timer is on => turn it off
		window.clearInterval(sldMusSlwDwn.timer);
		sldMusSlwDwn.timer = Number.NaN;
		}
	sldMusSlwDwn.velX = 0;
	sldMusSlwDwn.velY = 0;
	sldConvertScrToSlide(Number.NaN,Number.NaN,sldVwI,true);  // set glbVwFocX,Y to midpoint of screen
	}

	// sldSetSlwDwnVel() sets the maximum velocity in sldMusSlwDwn and then turns-on the slow-down timer.
	//	There had occassionally been a problem with mouse-based scrolling 'jumping' when the mouse was
	//		released (onMouseUp).  Although I don't know, I suspect the problem is a very short
	//		elapsed time resulting in an excessive velocity.  To fix this (on 7/26/19), turning on the
	//		slow-down timer was moved from sldMoveViewMusReset() to sldSetSlwDwnVel().  If either the 
	//		absolute value of x- or y-velocity is > sldMusSlwDwnMxVel, sldSetSlwDwnVel() proportionately
	//		adjusts the x- and y-velocities.
function sldSetSlwDwnVel() {
	var velMax = Math.max(Math.abs(sldMusSlwDwn.velX),Math.abs(sldMusSlwDwn.velY));
	var velRatio;
	if (velMax > sldMusSlwDwnMxVel) {
		velRatio = sldMusSlwDwnMxVel / velMax;
		sldMusSlwDwn.velX *= velRatio;
		sldMusSlwDwn.velY *= velRatio;
		}
	sldMusSlwDwn.timer = window.setInterval(sldSlwDwnViewMove,sldMusSlwDwn.interval);
	return;
	}

	// sldSlwDwnViewMove() is called by a timer set by sldMoveViewMusReset()
	//    It moves slideView in decreasing amounts in the same direction as the mouse had previously moved
function sldSlwDwnViewMove() {
	if (Number.isNaN(sldMusSlwDwn.timer)) {
		alert("sldSlwDwnViewMove():  timer is NaN");
		return;
		}
	   //  sldMoveX,Y are the number of pixels that slideView will move
	var sldMoveX = sldMusSlwDwn.velX * sldMusSlwDwn.interval;
	var sldMoveY = sldMusSlwDwn.velY * sldMusSlwDwn.interval;
	if (Number.isNaN(sldMoveX) || Number.isNaN(sldMoveY)) {
		alert('sldSlwDwnViewMove(): illegal slow-down velocity (x,y = ' + sldMusSlwDwn.velX + ',' + sldMusSlwDwn.velY + ')');
		sldMusSlwDwn.velX = 0;
		sldMusSlwDwn.velY = 0;
		sldMoveX = 0;
		sldMoveY = 0;
		}
	var sldAbsX = Math.abs(sldMoveX);
	var sldAbsY = Math.abs(sldMoveY);
	   // test for too small movements => set to velocity to 0 to avoid rounding-error loops
	if (sldAbsX < 1) { sldMusSlwDwn.velX = 0; }
	if (sldAbsY < 1) { sldMusSlwDwn.velY = 0; }
	if ((sldAbsX < 1) && (sldAbsY < 1)) {  // scrolling stopped:  end timer & update stack and sldVwFoc
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
			// test for destSldVw[] and purgSldVw[] over maximum
		if ((destSldVw.length + purgSldVw.length) > destArrayMaxNum) {
			alert('Destruction array sizes (destSldVw = ' + destSldVw.length
					+ ' & purgSldVw = ' + purgSldVw.length 
					+ ') exceed maximum (\"' + destArrayMaxNum 
					+ '\").  These arrays will be purged now.');
			destClearArr();
			}
				// if destruction array timer was turned off at beginning of mouse movement, turn it back on
		else if (destTimer.isOn && Number.isNaN(destTimer.id)) {
			destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
			}
		}
	else {  // move slideView and decelerate velocity
		sldMoveX = Math.round(sldMoveX);    // make sldMoveX an integer
		sldMoveY = Math.round(sldMoveY);    // make sldMoveY an integer
		sldMoveView("sldBndBox", sldVwI, sldMoveY, sldMoveX);  // move sldView
		sldMvDistX += sldMoveX;
		sldMvDistY += sldMoveY;
		sldMusSlwDwn.velX = sldMusSlwDwn.velX * sldMusSlwDwn.decel;
		sldMusSlwDwn.velY = sldMusSlwDwn.velY * sldMusSlwDwn.decel;
		}
	return;
	}




//       *************************************************************
//       *********       slideView other mouse FUNCTIONS   ***********
//       *************************************************************


function sldMusDblClk(musEvent) {
	if (glbWait) { return; }
	var tmpTxt = ""
			// turn-off timers
	if (!Number.isNaN(sldMusSlwDwn.timer)) {  // interrupt mouse-scrolling-slow-down
		sldMusSlwDwnTimerReset();
			// still NEED TO MOVE STACK after correcting for changed glbVwFocX,Y
		}
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }  // turn-off F-plane cycling
			// restrict F-planes if too many planes in sldVw[]
			//	isMusMove = false because view-planes will move regardless of whether mouse moves
			//		extra slideView planes go into destSldVw[]
	sldRestrictFZ(false,true);
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
			//	turning off destTimer MUST come after (potential) call to sldRestrictFZ() since
			//		sldRestrictF turns on destruction timer
	if (Number.isNaN(destTimer.id) == false) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
		  // musBndBoxX,Y is mouse position relative to top-left corner of sldBndBox
	var musBndBoxX = musEvent.clientX - parseInt(document.getElementById("sldBndBox").style.left);
	var musBndBoxY = musEvent.clientY - parseInt(document.getElementById("sldBndBox").style.top);
			// curMoveX,Y is the distance in pixels in the current view plane that slideView must
			//		move for the mouse position to move to the center of sldBndBox
	var curMoveX = (parseInt(document.getElementById("sldBndBox").style.width)/2) - musBndBoxX;
	var curMoveY = (parseInt(document.getElementById("sldBndBox").style.height)/2) - musBndBoxY;
			//	move current view-plane
	sldMoveView("sldBndBox",sldVwI,curMoveY,curMoveX);
	sldConvertScrToSlide(Number.NaN,Number.NaN,sldVwI,true); // set sldVwFoc
			//	move stack, including previous unfulfilled moves
	sldMvDistX += curMoveX;
	sldMvDistY += curMoveY;
	sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
			// sldRestrictFZ() already was called at beginning
			//	sldAddFZBuffer() would have been called by sldFPBtnClk(), sldStopFCyc(), or sldChangeF()
			//	but might need to add buffer planes if last action was focusing

			//	zoom-in, zoom-out, do nothing depending on depressed key
			//		double-clicking mouse is same as pushing button "0"
	if (musEvent.ctrlKey) { } // if cntrlKey => don't do anything
			// shiftKey => zoom-out one step
	else if (musEvent.shiftKey) { sldZBtnClk(14); }
			// no key => zoom in
	else { sldZBtnClk(24); }
			// restart timer
			// test for destSldVw[] and purgSldVw[] over maximum
	if ((destSldVw.length + purgSldVw.length) > destArrayMaxNum) {
		alert('Destruction array sizes (destSldVw = ' + destSldVw.length
				+ ' & purgSldVw = ' + purgSldVw.length 
				+ ') exceed maximum (\"' + destArrayMaxNum 
				+ '\").  These arrays will be purged now.');
		destClearArr();
		}
	else if (destSldVw.length > 0) {
		destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
		destTimer.isOn = true;
		}
	return;
	}




//       *************************************************************
//       *********       slideView button MOVE FUNCTIONS   ***********
//       *************************************************************


	// the CSS :hover selector doesn't work properly if a jscript function reset .style.backgroundColor
	// sldMvBtnOver() was written and sldMvBtnOut() modified to handle this problem.
	//   btnNode is the pointer (object) to the move-button over which the mouse is moving.
	// NOTE:  this function is used for zoom & focus controls as well as slideView movement controls
function sldMvBtnOver(btnNum,btnNode) {
	var btnDig1 = btnNum % 10;  // first digit of button ID indicates step size & type of button 
	if (document.getElementById("sldBndBox").style.display != "block") { // slideView not intialized
		  // button disabled until slideView is visible
		if (btnDig1 == 2) {   // menu move-buttone
			btnNode.style.backgroundColor = "rgb(224,224,224)";  // normal color for menu
			}  // move-button is on menu
		if ((btnDig1 == 1) || (btnDig1 == 6)) { // navigator move-button
			btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";  // normal color for menu
			}
		btnNode.style.cursor = "default";
		return;
		}
	else if (glbWait) {  // button disabled if waiting for images to load
		if (btnDig1 == 2) {   // menu move-buttone
			btnNode.style.backgroundColor = "rgb(224,224,224)";  // normal color for menu
			}  // move-button is on menu
		if ((btnDig1 == 1) || (btnDig1 == 6)) { // navigator move-button
			btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";  // normal color for menu
			}
		btnNode.style.cursor = "wait";
		return;
		}
	else {   // button is clickable - use default settings
		if (btnDig1 == 2) {   // menu move-buttone
			btnNode.style.backgroundColor = "rgb(208,208,224)";  // normal color for menu
			}  // move-button is on menu
		if ((btnDig1 == 1) || (btnDig1 == 6)) { // navigator move-button
			btnNode.style.backgroundColor = "rgba(224,192,192,0.8)";  // normal color for menu
			}
		btnNode.style.cursor = "pointer"; }
	return;
	}
 

	//sldMvBtnOut() fixes the :hover problem and handles the case of depressed mouse leaving the button
	//   btnNum is the number of the mouse-button
	//   btnNode is the pointer (object) to the move-button
function sldMvBtnOut(btnNum,btnNode) {
	var btnDig1 = btnNum % 10;  // first digit of button ID indicates step size & type of button 
	if (btnDig1 == 2) { menuBtnOut(btnNode); }  // menu move-button
	else if ((btnDig1 == 1) || (btnDig1 == 6)) { navBtnOut(btnNode); }// navigator move-button
	else { 
		alert("sldMvBtnOut(): move-button number (\"" + btnNum 
				+ "\") is not a valid number for navigator or menu move-button");
		return;
		}
		// statement below would only be true if a move-button was depressed when the mouse moved off the button
	if (btnNum == glbMvBtnObj.btnNum) {sldMvBtnUp(btnNum,btnNode); }  // mouse button was depressed on btnNum button
	}
		

	// sldMvBtnDown() is called when one of the move-buttons is depressed (onMouseDown)
	//  Button numbers (mvBtnNum) identify specific buttons and are coded to indicate direction & speed.
	//  mvBtnShftKey is true if the Shift-key was also depressed (otherwise, it should be false)
	//  sldMvBtnDown(), first changes button style (to indicate  

function sldMvBtnDown(mvBtnNum,mvBtnShftKey,btnNode) {
			// determine location (& step-size) of button by getting btnDig1
	var btnDig1 = mvBtnNum % 10;  // first digit of button ID indicates step size & type of button 
	if ((btnDig1 < 1) || (btnDig1 > 9)) {
		alert('sldMvBtnDown():  First digit (\"' + btnDig1 + '\") of button number (\"' 
					+ mvBtnNum +'\") is invalid.  ABORTING MOVE');
		return;
		}
			// get btnDig2 => check for a valid btnNum
	var btnDig2 = Math.floor(mvBtnNum/10);  
	if ((btnDig2 < 1) || (btnDig2 > 4)) {	
		alert('sldMvBtnDown():  Second digit (\"' + btnDig2 + '\") of button number (\"' + mvBtnNum +'\") is invalid.  ABORTING MOVE');
		return;
		}
			// set button color & cursor
	if (btnDig1 == 2) { menuBtnDown(btnNode); }  // button is a menu button
	else { navBtnDown(btnNode); } // currently all other buttons (btnDig1 == 1 or 6) are on navigator
			// check for inactive buttons
	if (document.getElementById("sldBndBox").style.display != "block") { return; }
	if (glbWait) {  // move buttons disabled during "wait" interrupt
		glbMvBtnObj.btnNum = mvBtnNum;  // in case button is still down when "wait" is released
		return;
		}
			// if button is on navigator & active, need to get red button image
	var btnImgId = "";    // DOM id of image in Arrow-box
	if ((btnDig1 == 1) || (btnDig1 == 6)) {   // button is a navigator arrow
		btnImgId = "navMvBtnImg" + mvBtnNum;
		switch (mvBtnNum) {
			case 11:  document.getElementById(btnImgId).src = "../images/arrowUpRed2.png";
						break;
			case 16:  document.getElementById(btnImgId).src = "../images/trpl_arrowUpRed2.png";
						break;
			case 21:  document.getElementById(btnImgId).src = "../images/arrowDownRed2.png";
						break;
			case 26:  document.getElementById(btnImgId).src = "../images/trpl_arrowDownRed2.png";
						break;
			case 31:  document.getElementById(btnImgId).src = "../images/arrowLeftRed2.png";
						break;
			case 36:  document.getElementById(btnImgId).src = "../images/trpl_arrowLeftRed2.png";
						break;
			case 41:  document.getElementById(btnImgId).src = "../images/arrowRightRed2.png";
						break;
			case 46:  document.getElementById(btnImgId).src = "../images/trpl_arrowRightRed2.png";
						break;
			default:  alert('sldMvBtnDown(): button \"' + btnId + '\" is not a navigator button.');
						break;
			}
		}
			// if F-cycle timer is on => turn-off focal plane cycling
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }
			// restrict F-planes if too many planes in sldVw[]
			//	since isMusMv == false, extra slideView planes go directly into destSldVw[]
	if (sldVw.length > ((2 * glbSldFBuf) + (2 * glbSldZBuf) +1)) {
		sldRestrictFZ(false,true);
		}
	  // if scrolling is slowing down after previous move, stop scrolling & update stack
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (Number.isNaN(sldMusSlwDwn.timer) == false)) {
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}
			// calculate step-size
	var mvStepSz;
		// mvStepSxMax is the maximum allowable step-size = 10% of shortest dimension of slide at current zoom-level
	var stpSzMax = Math.floor(Math.min((sldVw[sldVwI].dbMxNumX * glbTileSzX),(sldVw[sldVwI].dbMxNumY * glbTileSzY))/10);
	var stpSzSmall = sldMvStepSz;     // stpSzSmall is the small-step size; can be adjusted by stpSzMax
	var stpSzBig = sldMvStepSz * sldMvStepMult;  //stpSzBig is the large step-size; can be adjusted bh stpSzMax
	if (stpSzMax < 10) {stpSzMax =	10; }  // minimum step size is 10 pixels
	if (stpSzSmall > stpSzMax) {
		alert('Warning:  step-size for slide movement decreased from ' + stpSzSmall + ' pixels to ' + stpSzMax 
					+ ' pixels.\n  You should change \"Move-button step size\"'
					+ '\n  in \"Menu\" => \"Settings\" => \"Change settings...\"'); 
		stpSzSmall = stpSzMax;
		}

	if (btnDig1 > 5) {  // big step-size button pressed
		if (stpSzBig > stpSzMax) {stpSzBig = stpSzMax; }
		if (stpSzBig <= stpSzSmall) {
			alert('Warning: large steps in slide movement are the same as small steps.'
					+ '\n  You should change \"Move-button step multiplier\" '
					+ '\n  in \"Menu\" => \"Settings\" => \"Change settings...\"'); 
			stpSzBig = stpSzSmall;    // minimum step-size
			}
		if (mvBtnShftKey) {   // double-big steps
			mvStepSz = stpSzBig * sldMvStepMult; 
			}
		else  {mvStepSz = stpSzBig; }
		}
	else {   // small step-size key pressed
		if (mvBtnShftKey) { mvStepSz = stpSzSmall * sldMvStepMult; }
		else { mvStepSz = stpSzSmall; }
		}
	if ( mvStepSz > stpSzMax) { mvStepSz = stpSzMax; }
		  // set-up glbMvBtnObj (except for timer) and call sldMvBtnMv()
	if ((btnDig2 == 1) || (btnDig2 == 3)) { mvStepSz *= -1; }  // button is Up or Left, mvStepSz is negative
	if ((btnDig2 == 1) || (btnDig2 == 2)) {   // Up/Down button pressed, move in Y-direction
		glbMvBtnObj.mvX = 0;
		glbMvBtnObj.mvY = mvStepSz;
		}
	else if ((btnDig2 == 3) || (btnDig2 == 4)) {   // Left/Right button pressed, move in Y-direction
		glbMvBtnObj.mvX = mvStepSz;
		glbMvBtnObj.mvY = 0;
		}
	else {
		alert('sldMvBtnDown():  illegal value for second digit (\"' 
				+ btnDig2 + '\") of button number (\"' + mvBtnNum + '\" - ABORTING MOVE');
		return;
		}
	glbMvBtnObj.btnNum = mvBtnNum;
	sldMvBtnMv();  // 1st move; if button is kept depressed, timer will call this fxn multiple times
	    // set timer
	glbMvBtnObj.timer = window.setInterval(sldMvBtnMv,sldMvStepInterval);

	return;
	}

	// sldMvBtnMv() calls sldMoveView with mvBoundBox = "sldBndBox" and arrI = sldVwI using glbMvBtnObj values.
	//    The function then updates sldMvDistX,Y.  This function is necessary to respond to timer interrupts
	//    from the timer set-up by sldMvBtnDown()
function sldMvBtnMv() {
	if ((glbMvBtnObj.mvX == 0) && (glbMvBtnObj.mvY == 0)) {
		alert("sldMvBtn():  distance moved is zero(" + glbMvBtnObj.mvX + "," + glbMvBtnObj.mvY + "; button=" + glbMvBtnObj.btnNum + ")." );
		return;
		}
	else {
		sldMoveView("sldBndBox",sldVwI,glbMvBtnObj.mvY,glbMvBtnObj.mvX);
		sldMvDistX += glbMvBtnObj.mvX;
		sldMvDistY += glbMvBtnObj.mvY;
		}
	return;
	}

	//sldMvBtnUp() is called when the mouse, which had been depressed on a move-button, is released or moves off the button.
	//  The function cancels the glbMvBtnObj timer, resets the move-button to its original color & background, calls sldMoveSldStack(),
	//  resets glbMvBtnObj and sldVwFoc variables.

function sldMvBtnUp(mvBtnNum,btnNode) {
			// determine location (& step-size) of button by getting btnDig1
	var btnDig1 = mvBtnNum % 10;  // first digit of button ID indicates step size & type of button 
	if ((btnDig1 < 1) || (btnDig1 > 9)) {
		alert('sldMvBtnUp():  First digit (\"' + btnDig1 + '\") of button number (\"' 
					+ mvBtnNum +'\") is invalid.  ABORTING MOVE');
		return;
		}
			// get btnDig2 => check for a valid btnNum
	var btnDig2 = Math.floor(mvBtnNum/10);  
	if ((btnDig2 < 1) || (btnDig2 > 4)) {	
		alert('sldMvBtnUp():  Second digit (\"' + btnDig2 + '\") of button number (\"' + mvBtnNum +'\") is invalid.  ABORTING MOVE');
		return;
		}
			// set button color & cursor
	if (btnDig1 == 2) { menuBtnUp(btnNode); }  // button is a menu button
	else { navBtnUp(btnNode); } // currently all other buttons (btnDig1 == 1 or 6) are on navigator
			// if navigator buttons, reset arrow image
	var btnImgId = "";    // DOM id of image in Arrow-box
	if ((btnDig1 == 1) || (btnDig1 == 6)) {   // button is a navigator arrow
		btnImgId = "navMvBtnImg" + mvBtnNum;
		switch (mvBtnNum) {
			case 11:  document.getElementById(btnImgId).src = "../images/arrowUpBlk2.png";
						break;
			case 16:  document.getElementById(btnImgId).src = "../images/trpl_arrowUpBlk2.png";
						break;
			case 21:  document.getElementById(btnImgId).src = "../images/arrowDownBlk2.png";
						break;
			case 26:  document.getElementById(btnImgId).src = "../images/trpl_arrowDownBlk2.png";
						break;
			case 31:  document.getElementById(btnImgId).src = "../images/arrowLeftBlk2.png";
						break;
			case 36:  document.getElementById(btnImgId).src = "../images/trpl_arrowLeftBlk2.png";
						break;
			case 41:  document.getElementById(btnImgId).src = "../images/arrowRightBlk2.png";
						break;
			case 46:  document.getElementById(btnImgId).src = "../images/trpl_arrowRightBlk2.png";
						break;
			default:  alert('sldMvBtnUp(): button \"' + btnId + '\" is not a navigator button.');
						break;
			}
		}
		// nothing happens if menu move-button is pressed before slideView is initialized
	if (document.getElementById("sldBndBox").style.display != "block") { return; }
		// nothing happens if button-down didn't do anything
	if ((glbMvBtnObj.btnNum == 0) && (Number.isNan(glbMvBtnObj.timer))) { return; }
		// check to make certain we have the correct button
	if (mvBtnNum != glbMvBtnObj.btnNum) {
		alert('sldMvBtnUp():  move-button (\"' + mvBtnNum + '\") that was released is different from the one (\"' 
			+ glbMvBtnObj.btnNum + '\") that was depressed.');
		}
			// need to deal with "wait" interrupts since they can straddle button-up & button-down
			//	keep track of button up/down, but don't move slideView during wait.
	if (glbWait) {  // movement disabled during "wait" interrupt
			// timer should have been turned off by sldSetWait() - check this
		if (!Number.isNaN(glbMvBtnObj.timer)) {
			alert("sldMvBtnUp(btnNum = " + mvBtnNum + "): move-button timer for button #" 
					+ glbMvBtnObj.btnNum + " was on during \"wait\" interrupt."
					+ "\n  Timer has been turned off.");
			window.clearInterval(glbMvBtnObj.timer);
			glbMvBtnObj.timer = Number.NaN;
			}
		glbMvBtnObj.btnNum = 0;
		glbMvBtnObj.mvX =0;
		glbMvBtnObj.mvY = 0;
		return;
		}
	else if (Number.isNaN(glbMvBtnObj.timer)) { // timer should be on
		alert("sldMvBtnUp(btnNum = " + mvBtnNum + "): Timer for move-button #" 
				+ glbMvBtnObj.btnNum + " was NOT set!"
				+ "\n  This may be a serious problem.  Please report this bug.");
		}
	else { window.clearInterval(glbMvBtnObj.timer); }
	glbMvBtnObj.timer = Number.NaN;
	glbMvBtnObj.btnNum = 0;
	glbMvBtnObj.mvX =0;
	glbMvBtnObj.mvY = 0;
	sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
	sldConvertScrToSlide(Number.NaN,Number.NaN,sldVwI,true); // set sldVwFoc
		// sldRestrictFZ() was called before the start of the movement
		// sldAddFZBuffer() was called when F-btn or Z-btn was clicked or when F-cycling was stopped 
			// test for destSldVw[] and purgSldVw[] over maximum
	if ((destSldVw.length + purgSldVw.length) > destArrayMaxNum) {
		alert('Destruction array sizes (destSldVw = ' + destSldVw.length
				+ ' & purgSldVw = ' + purgSldVw.length 
				+ ') exceed maximum (\"' + destArrayMaxNum 
				+ '\").  These arrays will be purged now.');
		destClearArr();
		}
	else if (destSldVw.length > 0) {
		destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
		destTimer.isOn = true;
		}
	return;
	}



//       ************************************************************
//       *********       slideView general MOVE FUNCTIONS   ***********
//       ************************************************************


	// sldMoveStack() uses repetitive calls to sldMoveView() to move all of slideView-objects in the sldVw[] array
	//    EXCEPT for the current (visible) slideView.  It also resets sldMvDistX,Y = 0.
	// The code to update a stack of slideView elements which all have the same dimensions & zoom-level is simple enough
	//   that a separate function would not be needed.  However, it gets more complicated if the slideView stack
	//   includes elements at different zoom-levels.  sldMoveStack() was created as a separate function in anticipation
	//   of stacks with multiple zoom-levels.
	//  mvBouncBox & curViewI probably do not need to be included as arguments, since they almost always will be
	//   "sldBndBox" and sldVwI.  However, we include them since it is safer to not use global variables.
	//  upDown & leftRight are the number of screen-pixels to move at sldVw[curViewI] zoom level.
function sldMoveStack(mvBoundBox, curViewI, upDown, leftRight) {
	if ((upDown == 0) && (leftRight == 0)) {return;}
	var i;
	var zRatio;
	for (i = 0; i <sldVw.length; i++) {
		if (i == curViewI) { continue; }
		    // this needs to be updated for zoom-level
		else {
			zRatio = (sldVw[curViewI].zMult)/(sldVw[i].zMult);
			sldMoveView(mvBoundBox,i,Math.round(upDown*zRatio),Math.round(leftRight*zRatio)); 
			}
		}
	   // reset sldMvDistX,Y after all slideView planes have been moved
	sldMvDistX = 0;
	sldMvDistY = 0;
	return;
	}


	// sldMoveView() moves sldVw[arrI].sldNode by the up/down and left/right by the specified number of pixels
	//    a negative value moves the element up or to the left.
	// This function is the entry point for moving any slideView-type element ... even those that are not visisble.
	//     Calls to sldScrollUp/Down/Left/Right should be made through this function
	//  mvBoundBox the ID-string for the 'div' object (i.e. sldBndBox) containing object (slideView) being moved
	//	arrI is the index of the object in SldVw[] being moved 
	//  upDown is the negative(up)/positive(down) integer indicating number of (screen) pixels to move the element up or down
	//  leftRight is the negative(left)/positive(right) integer indicating number of (screen) pixels to move the element up or down
	//    NOTE: pixels in upDown / leftRight are screen-pixels at the zoom-level of the specified slideView plane (i.e. arrI). 
	//		This is NOT the number of pixels on the original specimen, and (depending on sldVw[arrI].zMult) may be different
	//		from the values specified by sldMoveDist(which is calculated using sldVw[sldVwI].zMult).  For most movements, the
	//		conversion from pixels in the displayed view (sldVwI) to pixels in the current view (arrI) is done in sldMoveStack().
function sldMoveView(mvBoundBox, arrI, upDown, leftRight) {
//	var tmpTxt = "";
	var sldNode = sldVw[arrI].sldNode;
	var imgNextTileInRow = sldVw[arrI].tiStrtXId + sldVw[arrI].tiMxNumX;  // tile immediatedly to right of last column of current slideView
	var imgNextRow = sldVw[arrI].tiStrtYId + sldVw[arrI].tiMxNumY;   // row immediately below last row of current slideView
	var imgTop = parseInt(sldNode.style.top);
	var imgLeft = parseInt(sldNode.style.left);
	var pxOffSetX = (glbSldTileOff + glbSldXYBuf) * glbTileSzX;  // number of pixels outside of viewing area before scrolling
	var pxOffSetY = (glbSldTileOff + glbSldXYBuf) * glbTileSzY;  // number of pixels outside of viewing area before scrolling
	var imgBoxHeight = parseInt(document.getElementById(mvBoundBox).style.height);
	var imgBoxWidth = parseInt(document.getElementById(mvBoundBox).style.width);
			// reset imgTop & imgLeft 
	imgTop += upDown;
	imgLeft += leftRight;
	    // test for scrolling to left:  one-at-a-time add tiles to right and remove from left
	if (leftRight < 0 ) {
		while (   //should be "while", but "if" is safer during development
			((imgLeft + pxOffSetX) < 0) 
				&& (imgNextTileInRow < sldVw[arrI].dbStrtXId + sldVw[arrI].dbMxNumX)
			)            
		  {    
			if (sldScrollLeft(arrI,sldVw[arrI].tiStrtXId,imgNextTileInRow) != 1) {
				alert("sldMoveView(): sldScrollLeft() failed (return != 1) - ABORTING SCROLL LEFT");
				break;
				}
			else {
				imgLeft += glbTileSzX;  // imgLeft moves to right to compensate for removed column of tiles
				sldVw[arrI].tiStrtXId++;  // what had been second column is now first column
				imgNextTileInRow++;
				}
		  	}
		sldNode.style.left = imgLeft + "px";
		}
		  // test for scrolling to right:  add tiles on left & remove from right
		  //    imgLeft + (sldVw[arrI].tiMxNumX * glbTileSzX) is right side of sldeView in pixels
	else if (leftRight > 0) {
		while (   
			((imgLeft + (sldVw[arrI].tiMxNumX * glbTileSzX) - pxOffSetX) > imgBoxWidth)
				&& (sldVw[arrI].tiStrtXId > sldVw[arrI].dbStrtXId)
			)
		  { 
			if (sldScrollRight(arrI,sldVw[arrI].tiStrtXId-1,imgNextTileInRow-1) != 1) {
				alert("sldMoveView(): sldScrollRight() failed (return != 1) - ABORTING SCROLL RIGHT");
				break;
				}
			else {
				imgLeft -= glbTileSzX;  // imgLeft moves to left to compensate for removed column of tiles
				sldVw[arrI].tiStrtXId--;  // new first column
				imgNextTileInRow--;
				}
		  	}
		sldNode.style.left = imgLeft + "px";
		}
	  // test for scrolling up: add tiles to bottom & remove from top:
	if (upDown < 0) {
		while ( 
			((imgTop + pxOffSetY) < 0) 
				&& (imgNextRow < (sldVw[arrI].dbStrtYId + sldVw[arrI].dbMxNumY))
		   )
		  { 
			if (sldScrollUp(arrI,sldVw[arrI].tiStrtYId,imgNextRow) != 1) {
				alert("sldMoveView(): sldScrollUp() failed (return != 1) - ABORTING SCROLL UP");
				break;
				}
			else {
				imgTop += glbTileSzY;  // imgTop moves to down to compensate for removed row of tiles
				sldVw[arrI].tiStrtYId++;  // 2nd row now is new top row
				imgNextRow++;
				}
		  	}
		sldNode.style.top = imgTop + "px";
		}
	  // test for scrolling down:  add tiles to top & remove tiles from bottom
	else if (upDown > 0) {
		while (  
		 ((imgTop + (sldVw[arrI].tiMxNumY * glbTileSzY) - pxOffSetY) > imgBoxHeight)
		   && (sldVw[arrI].tiStrtYId > sldVw[arrI].dbStrtYId)
		   )
		  { 
			if(sldScrollDown(arrI,imgNextRow-1,sldVw[arrI].tiStrtYId-1) != 1) {
				alert("sldMoveView(): sldScrollDown() failed (return != 1) - ABORTING SCROLL DOWN");
				break;
				}
			else {
				imgTop -= glbTileSzY;  // imgTop moves to up to compensate for added row of tiles
				sldVw[arrI].tiStrtYId--;  // new top row
				imgNextRow--;
				}
		  	}
		sldNode.style.top = imgTop + "px";
		}
	}


function sldScrollDown(arrI,imgRowToRemove,imgRowToAdd) {
	var sldImgNotLoaded = false;  // boolean set by sldWaitUnlist() to determine if waitBox should be updated
	var wtBxNode;  // node for "missing tile" ,td> in waitBox
	var sldNode = sldVw[arrI].sldNode;  //link to hold slideView element
	var i;
	var imgStartTile = sldVw[arrI].tiStrtXId + sldVw[arrI].tiMxNumX - 1;  // last image in row => we are counting down
	var imgEndTile = sldVw[arrI].tiStrtXId - 1;  // one less then 1st image in row => we are counting down
	var imgNextImgIdTxt = "";   // ID of image to be inserted/removed
	var imgNextImgNode;   // pointer to img node to be inserted
	var imgPrevImgNode;   // pointer to node adjacent to node to be inserted
			// remove row
	for (i = imgStartTile; i > imgEndTile; i--) {
		imgNextImgIdTxt = sldImgIdStr(sldVw[arrI],imgRowToRemove,i);
		imgNextImgNode = document.getElementById(imgNextImgIdTxt);
		if (imgNextImgNode == null) {
			alert('sldScrollDown(), remove row:  could not find: \"' + imgNextImgIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		if (sldNode.removeChild(imgNextImgNode) == null) {
			alert('sldScrollDown():  could not remove: \"' + imgNextImgIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
			sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgNextImgIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
			if (glbIsWaitBxActive && sldImgNotLoaded) {
				wtBxNode = document.getElementById("wtMTile"+arrI);
				if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
				}
			sldPushCache(imgNextImgNode);}  // push nextNode onto cache
		}
				// add new first row
		   // get pointer to first ImgNode in row below row-to-add
	i = imgRowToAdd + 1;  // use "i" as a temporary variable here
	imgNextImgIdTxt = sldImgIdStr(sldVw[arrI],i,sldVw[arrI].tiStrtXId);
	imgNextImgNode = document.getElementById(imgNextImgIdTxt);
		// insert new first row into slideView
	for (i = imgStartTile; i > imgEndTile; i--) {
		if (imgNextImgNode == null) {  // before reassigning 'old' imgNextImgNode to imgPrevImgNode, check for validity
			alert('sldScrollDown(), add row:  could not find: \"' + imgNextImgIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		else {
			imgPrevImgNode = imgNextImgNode;  // reassign 'old' imgNextImgNode to imgPrevImgNode
				// get 'new' imgNextImgNode
			imgNextImgIdTxt = sldImgIdStr(sldVw[arrI],imgRowToAdd,i);
			imgNextImgNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgNextImgIdTxt,sldImgSrcStr(arrI,imgRowToAdd,i),arrI);
				// insert 'new' imgNextImgNode before imgPrevImgNode
			if (sldNode.insertBefore(imgNextImgNode,imgPrevImgNode) == null) {
				alert('sldScrollDown():  could not insert: \"' + imgNewIdTxt + '\" - ABORTING SCROLL');
				return(0);
				}
			}
		}
 	return(1);
	}

function sldScrollUp(arrI,imgRowToRemove,imgRowToAdd) {
	var i;
	var sldImgNotLoaded = false;  // boolean set by sldWaitUnlist() to determine if waitBox should be updated
	var wtBxNode;  // node for "missing tile" ,td> in waitBox
	var imgStartTile = sldVw[arrI].tiStrtXId;  // first img in row
	var imgEndTile = sldVw[arrI].tiStrtXId + sldVw[arrI].tiMxNumX;  // image just past end of row
	var sldNode = sldVw[arrI].sldNode;  //link to hold slideView element
	var imgTileIdTxt = "";   // ID of image
	var imgTileNode;   // pointer to tile node
	
	// remove top row
	for (i = imgStartTile; i < imgEndTile; i++) {
		imgTileIdTxt = sldImgIdStr(sldVw[arrI],imgRowToRemove,i);
		imgTileNode = document.getElementById(imgTileIdTxt);
		if (imgTileNode == null) {
			alert('ScrollUp():  could not find: \"' + imgTileIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		if (sldNode.removeChild(imgTileNode) == null) {
			alert('ScrollUp():  could not remove: \"' + imgTileIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
			sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgTileIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
			if (glbIsWaitBxActive && sldImgNotLoaded) {
				wtBxNode = document.getElementById("wtMTile"+arrI);
				if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
				}
			sldPushCache(imgTileNode);  // push imgTile onto waitlist
			}	
		}
	// add new bottom row
	for (i = imgStartTile; i < imgEndTile; i++) {
		imgTileIdTxt = sldImgIdStr(sldVw[arrI],imgRowToAdd,i);
		imgTileNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgTileIdTxt,sldImgSrcStr(arrI,imgRowToAdd,i),arrI);
		sldNode.appendChild(imgTileNode);
		}
	return(1);
	
	}


function sldScrollRight(arrI,imgColToInsert,imgColToDelete) {
	var i;
	var sldImgNotLoaded = false;  // boolean set by sldWaitUnlist() to determine if waitBox should be updated
	var wtBxNode;  // node for "missing tile" ,td> in waitBox
	var imgCurBotRow;
	var imgEndRow = sldVw[arrI].tiStrtYId + sldVw[arrI].tiMxNumY - 1;
	var sldNode = sldVw[arrI].sldNode;  //link to hold slideView element
	if (sldNode == null) {
		alert('sldScrollRight():  could not find: \"SlideView\" - ABORTING SCROLL');
		return(0);
		}
	var imgOldIdTxt = "";   // id of image-tile being removed
	var imgNewIdTxt = "";   // id of image-tile being inserted
	var imgOldNode;			// node being removed
	var imgNewNode;			// node being inserted

	// First row:  add image at beginning of row
	// Use imgOldIdTxt & imgOldNode for slideView's 'old' firstChild before which new image will be added
	//   This may be safer than using slideView.firstChild, since it looked like slideView might have children I don't know about
	i = imgColToInsert + 1;
	imgOldIdTxt = sldImgIdStr(sldVw[arrI],sldVw[arrI].tiStrtYId,i);
	imgOldNode = document.getElementById(imgOldIdTxt);
	if (imgOldNode == null) {
		alert('sldScrollRight():  could not find firstChild: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}
	imgNewIdTxt = sldImgIdStr(sldVw[arrI],sldVw[arrI].tiStrtYId,imgColToInsert);
	imgNewNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgNewIdTxt,sldImgSrcStr(arrI,sldVw[arrI].tiStrtYId,imgColToInsert),arrI);
	if (sldNode.insertBefore(imgNewNode,imgOldNode) == null) {
		alert('ScrollRight():  could not find insert: \"' + imgNewIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}
 
 	// replace end tile of row i with new first tile of row i+1 = imgCurBotRow
 	for (i = sldVw[arrI].tiStrtYId; i < imgEndRow; i++) {
		imgCurBotRow = i + 1;
		imgNewIdTxt = sldImgIdStr(sldVw[arrI],imgCurBotRow,imgColToInsert);	
		imgNewNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgNewIdTxt,sldImgSrcStr(arrI,imgCurBotRow,imgColToInsert),arrI);
		imgOldIdTxt = sldImgIdStr(sldVw[arrI],i,imgColToDelete);
		imgOldNode = document.getElementById(imgOldIdTxt);
		if (imgOldNode == null) {
			alert('sldScrollRight():  could not find: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		if (sldNode.replaceChild(imgNewNode,imgOldNode) == null) {
			alert('sldScrollRight():  could not replace\"' + imgOldIdTxt + '\" with \"' + imgNewIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
			sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgOldIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
			if (glbIsWaitBxActive && sldImgNotLoaded) {
				wtBxNode = document.getElementById("wtMTile"+arrI);
				if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
				}
			sldPushCache(imgOldNode);   // push oldNode onto cache
			}	
		}
	// remove last tile in last row; at end of previous loop, imgCurBotRow points to last row
	imgOldIdTxt = sldImgIdStr(sldVw[arrI],imgCurBotRow,imgColToDelete);
	imgOldNode = document.getElementById(imgOldIdTxt);
	if (imgOldNode == null) {
		alert('sldScrollRight():  could not find: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}
	if (sldNode.removeChild(imgOldNode) == null) {
		alert('sldScrollRight():  could not remove: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}
	else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
		sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgOldIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
		if (glbIsWaitBxActive && sldImgNotLoaded) {
			wtBxNode = document.getElementById("wtMTile"+arrI);
			if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
			}
		sldPushCache(imgOldNode);   // push oldNode onto cache
		}	
	return(1);
}


function sldScrollLeft(arrI,imgColToDelete,imgColToInsert) {
	var i;
	var sldImgNotLoaded = false;  // boolean set by sldWaitUnlist() to determine if waitBox should be updated
	var wtBxNode;  // node for "missing tile" ,td> in waitBox
	var imgCurBotRow;
	var imgEndRow = sldVw[arrI].tiStrtYId + sldVw[arrI].tiMxNumY - 1;
	var sldNode = sldVw[arrI].sldNode;  //link to hold slideView element
	if (sldNode == null) {
		alert('ScrollLeft():  could not find: \"SlideView\" - aborting scroll');
		return(0);
		}
	var imgOldIdTxt = "";   // id of image-tile being removed
	var imgNewIdTxt = "";   // id of image-tile being inserted
	var imgOldNode;			// node being removed
	var imgNewNode;			// node being inserted

	// First row (i=0):  remove 1st (left-most) element
	imgOldIdTxt = sldImgIdStr(sldVw[arrI],sldVw[arrI].tiStrtYId,imgColToDelete);
	imgOldNode = document.getElementById(imgOldIdTxt);
	if (imgOldNode == null) {
		alert('ScrollLeft():  could not find: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}
	if (sldNode.removeChild(imgOldNode) == null) {
		alert('ScrollLeft():  could not remove: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
		return(0);
		}

	else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
		sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgOldIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
		if (glbIsWaitBxActive && sldImgNotLoaded) {
			wtBxNode = document.getElementById("wtMTile"+arrI);
			if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
			}
		sldPushCache(imgOldNode);   // push oldNode onto cache
		}	

	// i points to upper row - to which the new node belongs, imgCurBotRow (=i+1) points to row of node being removed
	for (i = sldVw[arrI].tiStrtYId; i < imgEndRow; i++) {
		imgCurBotRow = i + 1;
		imgOldIdTxt = sldImgIdStr(sldVw[arrI],imgCurBotRow,imgColToDelete);	
		imgOldNode = document.getElementById(imgOldIdTxt);
		if (imgOldNode == null) {
			alert('ScrollLeft():  could not find: \"' + imgOldIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}

		imgNewIdTxt = sldImgIdStr(sldVw[arrI],i,imgColToInsert);
		imgNewNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgNewIdTxt,sldImgSrcStr(arrI,i,imgColToInsert),arrI);
		if (sldNode.replaceChild(imgNewNode,imgOldNode) == null) {
			alert('ScrollLeft():  could not replace\"' + imgOldIdTxt + '\" with \"' + imgNewIdTxt + '\" - ABORTING SCROLL');
			return(0);
			}
		else {
					// use sldWaitUnlist() toremove nextNode from waitlist if img is not loaded
			sldImgNotLoaded = sldWaitUnlist(sldVw[arrI].sldWaitArr,imgOldIdTxt);
					// if waitBox is active and image was in waitlist, update waitbox
			if (glbIsWaitBxActive && sldImgNotLoaded) {
				wtBxNode = document.getElementById("wtMTile"+arrI);
				if (wtBxNode != null) { wtBxNode.innerHTML = sldVw[arrI].sldWaitArr.length; }
				}
			sldPushCache(imgOldNode);   // push oldNode onto cache
			}	
		}
	// at end of loop, imgCurBotRow points to last row; use it to append last image
	imgNewIdTxt = sldImgIdStr(sldVw[arrI],imgCurBotRow,imgColToInsert);				
	imgNewNode = sldGetNewImgNode(sldVw[arrI].sldWaitArr,imgNewIdTxt,sldImgSrcStr(arrI,imgCurBotRow,imgColToInsert),arrI);
	if (sldNode.appendChild(imgNewNode) == null) {
		alert('ScrollLeft():  could not add\"' + imgNewIdTxt + '\" to the image - ABORTING SCROLL');
		return(0);
		}
	return(1);
	}



//       **************************************************************
//       *********       slideView Move-Related FUNCTIONS   ***********
//       **************************************************************

	// gotoOpen() is called by the "GoTo" menu button
	//	The function clears previous entries and displays the gotoBox
function gotoOpen() {
			// don't do anything if slideView isn't initialize
	if (document.getElementById("sldBndBox").style.display != "block" ) {
		return;
		}
	if (glbWait) { return; }
			// empty X,Y input boxes of any previous entry
	document.getElementById("gotoX").value = "";
	document.getElementById("gotoY").value = "";
			// display the gotoBox
	infoBxInitPos("gotoBox");
	document.getElementById("gotoBox").style.display = "block";
	document.getElementById("gotoX").focus();
	return;
	}


function gotoVerify(axis,tstStr) {
	var alertTxt = "";
	var minVal;  // smallest pixel value visible at current f,z
	var maxVal;  // largest pixel value visible at current f,z
	var minTxt = "";  //"left" or "top depending on axis
	var maxTxt = "";  // 'right" or "bottom" depending on axis
	var inpNode = null;
	numVal = Number(tstStr);
			// get maximum & minimum pixel values and 'pointer' to input box for X or Y.
	if (axis == "X") {
		minVal = sldVw[sldVwI].dbStrtXId * glbTileSzX * sldVw[sldVwI].zMult;
		maxVal = ((sldVw[sldVwI].dbStrtXId + sldVw[sldVwI].dbMxNumX) * glbTileSzX * sldVw[sldVwI].zMult) - 1;
		minTxt = "left-side";
		maxTxt = "right-side";
		inpNode = document.getElementById("gotoX");
		}
	else if (axis == "Y") {
		minVal = sldVw[sldVwI].dbStrtYId * glbTileSzY * sldVw[sldVwI].zMult;
		maxVal = ((sldVw[sldVwI].dbStrtYId + sldVw[sldVwI].dbMxNumY) * glbTileSzY * sldVw[sldVwI].zMult) - 1;
		minTxt = "top";
		maxTxt = "bottom";
		inpNode = document.getElementById("gotoY");
		}
	else {
		alertTxt = 'gotoVerify():  the value for \"axis\" (\"' + axis;
		alertTxt += '\") is NOT valid.\n\n Cannot execute the \"Go To\" command.'
		alert(alertTxt);
		return(false);
		}
	if (!Number.isInteger(numVal)) {
		alertTxt = 'The value entered for the position on the ' + axis + '-axis (\"';
		alertTxt += tstStr + '\") is not an integer.';
		alertTxt += '\n  The position must be an integral number of pixels.';
		alertTxt +='\n\n  Please enter a valid number for the ' + axis + '-position.';
		alert(alertTxt);
		return(false);
		}
	if (numVal < minVal) {
		alertTxt = 'The value entered for the position on the ' + axis +'-axis (\"';
		alertTxt += numVal + '\")';
		alertTxt += '\n is less than the smallest ' + axis + '-position (\"';
		alertTxt += minVal + '\")';
		alertTxt += '\n visible at the current zoom-level.\n Do you want to set the ';
		alertTxt += axis + '-position to its minimum value?';
		alertTxt += '\n\nClick \"OK\" to set the ' + axis + '-position to its minimum value.';
		alertTxt += '\n  This will move your view to the ' + minTxt + ' of the slide.';
		alertTxt += '\nClick \"Cancel\" to leave the ' + axis + '-value unchanged.';
		if (confirm(alertTxt)) {
			inpNode.value = minVal;
			return(true);
			}
		else { return(false); }
		}
	if (numVal > maxVal) {
		alertTxt = 'The value entered for the position on the ' + axis +'-axis (\"';
		alertTxt += numVal + '\")';
		alertTxt += '\n is greater than the largest ' + axis + '-position (\"';
		alertTxt += maxVal + '\")';
		alertTxt += '\n visible at the current zoom-level.\n Do you want to set the ';
		alertTxt += axis + '-position to its maximum value?';
		alertTxt += '\n\nClick \"OK\" to set the ' + axis + '-position to its maximum value.';
		alertTxt += '\n  This will move your view to the ' + maxTxt + ' of the slide.';
		alertTxt += '\nClick \"Cancel\" to leave the ' + axis + '-value unchanged.';
		if (confirm(alertTxt)) {
			inpNode.value = maxVal;
			return(true);
			}
		else { return(false); }
		}
	return(true);
	}
			

function gotoMove(xStr,yStr) {
		// check validity of x,y positions
	if (!gotoVerify("X",xStr)) { return; }
	if (!gotoVerify("Y",yStr)) { return; }
		// goto x,y in current view plane
	var i;
	var xVal = Number(xStr);
	var yVal = Number(yStr);
	var numCol = sldVw[sldVwI].tiMxNumX;
	var numRow =sldVw[sldVwI].tiMxNumY;
	var tiObj = sldConvertSlideToScr(Number.NaN,Number.NaN,xVal,yVal,sldVwI,numCol,numRow);
	sldGoToView(sldVwI,tiObj.left,tiObj.strtCol,numCol,tiObj.top,tiObj.strtRow,numRow);
		// goto x,y for stack
	for (i = 0; i < sldVw.length; i++) {
		if (i == sldVwI) { continue; }  // already moved current view
		numCol = sldVw[i].tiMxNumX;
		numRow =sldVw[i].tiMxNumY;
		tiObj = sldConvertSlideToScr(Number.NaN,Number.NaN,xVal,yVal,i,numCol,numRow);
		sldGoToView(i,tiObj.left,tiObj.strtCol,numCol,tiObj.top,tiObj.strtRow,numRow);
		}
	glbVwFocX = xVal;  // set glbVwFocX,Y to new location
	glbVwFocY = yVal;  // set glbVwFocX,Y to new location
	document.getElementById("gotoBox").style.display = "none";	// close "Go To" box
	return;
	}
		
	
