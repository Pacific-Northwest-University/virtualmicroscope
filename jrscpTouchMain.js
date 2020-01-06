// jrscpTouchMain.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpTouchMain.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpTouchMain.js)
//		- four PHP files
//	jrscpTouchMain.js contains javascript functions related to touch-screen actions on all elements
//		except the menu and navigator.  This file contains touch-event functions for slideView,
//		infoBoxes, etc.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA



//       *************************************************************
//       *********         infoBox Touch Functions         ***********
//       *********         warnBox Touch Functions         ***********
//       *************************************************************

	// prevents warnBox from fading while finger is on warnBox
function tchWarnBox(eventStr,tevt) {
	tevt.preventDefault();
	switch (eventStr) {
		case "touchstart" :
			warnBoxHold();
			break;
		case "touchend":
		case "touchcancel":
			warnBoxStrtFade();
			break;
		default :
			alert("tchWarnBox(): unknown TouchEvent (\"" + eventStr + "\")."
					+ "\n\n  This probably is a fatal error.  Please report this bug.");
		}
	return
	}


	// NOTE:  infoBxTchDwn(), infoBxTchMv(), infoBxTchUp() are in jrescpMenu.js

	// add eventListeners to infoBox move-buttons
function tchInfoBxMvInit() {
	var i;
	var btnNode;
	var lstSz = glbInfoBxLst.length;
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(glbInfoBxLst[i].btnId);
		if (btnNode == null) {
			alert("tchInfoBxMvInit():  could not find the move-button (\"" + glbInfoBxLst[i].btnId 
					+ "\") on the \"" + glbInfoBxLst[i].boxNm + "\" box.  No event handlers were attached.");
			continue;
			}
		btnNode.addEventListener("touchstart",function() {infoBxTchDwn(event,this);});	
		btnNode.addEventListener("touchmove",function() {infoBxTchMv(event);});
		btnNode.addEventListener("touchend",function() {infoBxTchUp(event,this);});
		btnNode.addEventListener("touchcancel",function() {infoBxTchUp(event,this);});	
		}
	return;
	}


//       ************************************************************
//       *********         slideView Touch Functions      ***********
//       *********           finger up/down & reset       ***********
//       ************************************************************


	// 1/02/20:  Because touchEvents on slideView sometimes have sldBndBox as the target and
	//		sometimes have a child of sldBndBox as the target, we can't use touchEvent.targetTouches
	//		to get the list of fingers touching slideView (sldBndBox).  instead we have to
	//		use touchEvent.touches as a list of all touches on the screen, but this generates
	//		errors if a finger is placed on some other element after touching slideView with another
	//		finger.  To fix this, we've created tchGetSvArr().
	//	tchGetSVArr() is passed a touchlist (usually touchEvent.touches).  The function reads through
	//		the array and pushes onto arrSV any touch elements whose target is sldBndBox, a child
	//		of sldBndBox, or (with a warning) a child of a slideView plane (i.e., className includes
	//		"grTileGrid").  I don't think that any grandchildren of sldBndBox are targets of the
	//		touchEvents, but I decided to put in the warnBox just in case.  If we never get any
	//		warnings, at some point we should delete the test for grandchildren.
function tchGetSVArr(totArr) {
	var arrSV = [];  // array of touch-points whose target is sldBndBox or child of sldBndBox
	var i;
	var nodeSldBndBox = document.getElementById("sldBndBox");
	var nodeCur;
	var nodePar;  // variable to hold parent of nodeCur;
	for (i = 0; i < totArr.length; i++){
		nodeCur = totArr[i].target;
		if (nodeCur == nodeSldBndBox) { arrSV.push(totArr[i]); }
		else {
			nodePar = nodeCur.parentNode;
			if (nodePar == nodeSldBndBox) { arrSV.push(totArr[i]); }
				// it looks like targets never are children of slideView, but just in case ...
			else if (nodePar.className.indexOf("grTileGrid") >= 0) {  // parent is a slideView plane
				arrSV.push(totArr[i]);
				warnBoxCall(false,"Child of slideView",
						"Target of touchEvent (id=\"" + nodeCur.id
						+ "\"; class=\"" + nodeCur.className 
						+ "\") is a child of a slideView plane (\""
						+ nodePar.id + "\")."
						+ "<br>&nbsp; Please report this issue.");
				}
			}
		}
	return(arrSV);
	}


		// tchRestArr() is called by tchSldVwStrt() and tchSldVwEnd() to set (or reset) glbSVTchLst[].
		// This function also handles the situation where glbSVTchLst[] doesn't match targetTouches[] (tchTot[])
		//	It first splices-out any elements in glbSVTchLst[] that are not in tchTot[], and then pushes
		//	onto glbSVTchLst[] any elements in tchTot[] that are not already in glbSVTchLst[].
		//	The function then resets glbSVTchPt to equal glbSVTchLst.length.
		// tchResetArr() also handles change of primary fingers.
function tchResetArr(tchTot,curTime) {
	var errTxt = "";  // string for warnBoxCall error message
	var tchTotSz = tchTot.length;
	var oldLstSz = glbSVTchLst.length;  // original length of glbSVTchLst[] => don't change
	var curLstSz = oldLstSz;  // current length of glbSVTchLst[] => adjusted below
	var curTchObj;  // object to hold new glbSVTchLst objcet
	var i;
	var j;
	var chgCnt = 0;
	var isResetPrimTch = false;  // set to true if a primary finger is deleted from glbSVTchLst[]
			// a negative value of tchTotSz should be impossible since the length of an array cannot be less than 0.
			//	To be safe, we'll treat a negative array size as an empty array (length == 0).
	if (tchTotSz < 1) {  // no targetTouches, glbSVTchLst should be empty.
		glbSVTchLst.splice(0);
		glbSVTchPt = 0;
		return;
		}
			// remove 'extra' touches from glbSVTchLst[] => also updates rest of glbSVTchLst[]
	if (oldLstSz >= 1) { // can only remove elements from glbSVTchLst[] if glbSVTchLst contains elements
		for (i = oldLstSz - 1; i >= 0; i--) {
			for (j= tchTotSz - 1; j >= 0; j--) {
						// update glbSVTchLst elements that are in tchTot
				if (glbSVTchLst[i].tch.identifier == tchTot[j].identifier) {
					glbSVTchLst[i].tch = tchTot[j];
					glbSVTchLst[i].time = curTime;
					}
				}
			if (j < 0) {  // glbSVTchLst[i] not in tchTot
				glbSVTchLst.splice(i,1);  // remove glbSVTchLst[i]
				chgCnt--;
				if (i <= 1) { isResetPrimTch = true; }  // primary finger removed from glbSVTchLst
				}
			}
		curLstSz = glbSVTchLst.length;
		}
			// add 'missing' touches to glbSVTchLst
	for (j = 0; j < tchTotSz; j++) {
		for (i = 0; i < curLstSz; i++) {
			if (glbSVTchLst[i].tch.identifier == tchTot[j].identifier) { break; } // touch already in list
			}
		if (i >= curLstSz) { // tchTot[j] not in glbSVTchLst; i points to top of glbSVTchLst[]
			curTchObj = {tch: tchTot[j], time: curTime};
			glbSVTchLst.push(curTchObj);
			chgCnt++;
			curLstSz = glbSVTchLst.length;
			}
		}
	glbSVTchPt = glbSVTchLst.length;
	if (isResetPrimTch && (glbSVTchPt >= 2) && (oldLstSz >= 2)) {  // Reset glbTchMvArr[] if primary fingers changed
			// I considered pushing the new primary-finger data into glbTchMvArr[], but it
			//		seemed simpler to just leave glbTchMvArr[] empty, since the next 2-finger
			//		movement will cause sldTchTwoMv() to push the new finger data onto 
			//		glbTchMvArr[] (and return without slideView movement) if glbTchMvArr is empty.
		glbTchMvArr.splice(0);  // resets glbTchMvArr[]
			// warn user of change in fingers
		errTxt = "The fingers used to move the slide "
		if (glbMusWheelFZ == 'z') { errTxt += "and to zoom-in/out "; }
		else if (glbMusWheelFZ == 'f') { errTxt += "and to focus up-and-down "; }
		errTxt += "have been changed.";
			// TEMPORARILY DISABLE THIS warnBoxCall()
			//	the bug that hangs xoom-in/out & focus up/down causes the program to not call
			//	tchSldVwEnd(), so oldLstSz sometimes is >= 2 when all fingers are lifted,
			//	which generates an erroneous and confusing error message
//		warnBoxCall(false,"Fingers Changed",errTxt);
		}
	return;
	}

	// tchSldVwStrt() is called whenever a touchstart interrupt on sldBndBox is generated.
	// Since we don't know what's going to happen when a touch occurs, tchSldStrt() needs to record the touchevent.
	//	The default touchmove handler (loaded as an addEventListener() command by sldInitializeView(), is to
	//		call sldBndBoxTchMv() (see above), so tchSldVwStrt() doesn't need to do anything except record the
	//		event in the global array:  glbSVTchLst.
	//	If two fingers are down, either simultaneously or sequentially, and one or no fingers had been down 
	//		prior to this event, tchSldVwStrt() call sldTchTwoDwn() to initiate finger-directed slideView 
	//		 movement and zooming/focusing (finger pinch-or-spread).
	//	More than two fingers down generates a warning (warnBoxCall()), but is allowed. However, only the first
	//		two fingers are considered for finger-directed movements.  Change fingers will result in a call to
	//  - 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwStrt(tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	tchClrMenu(tevt);  // necessary because we stop propagation on touch events involving sldBndBox 
	var oldSVTchPt = glbSVTchPt;
	var tchTot = tchGetSVArr(tevt.touches);
	var curTime = Date.now();  // time in msec since 1/01/1970
			// update glbSVTchLst[]; this also adds new touches to end of glbSVTchLst
	tchResetArr(tchTot,curTime);  // update glbSVTchLst[]
			// warn about too many touches	
	if (glbSVTchPt > 2) {
		warnBoxCall(false,"Two Fingers","You have " + glbSVTchPt + " fingers touching the "
				+ "screen.&nbsp; Please do not touch the screen with more than TWO fingers.");
		}
				// TURN OFF MOUSE FUNCTIONS
		// Since a mouse-button could have been down when the screen was touched (although this is unlikely), we need
		//	to handle doing a graceful mouse-up-like event when we disable the mouse functions.
			// reset mouse-handling  => easier to "just do it" than to worry about how robust our test might be
	if ((oldSVTchPt < 1) && (glbSVTchPt >= 1)) { // only need to turn-off mouse functions if they haven't already been turned-off
		document.getElementById("sldBndBox").onmousemove = function(event){sldBndBoxMusMv(event)};
		if (document.getElementById("sldBndBox").style.cursor == "move") {
			warnBoxCall(false,"Mouse off","Touching the screen <b>disables</b> dragging slide by the <b>mouse</b>.");
			}
		document.getElementById("sldBndBox").style.cursor = "default";  // reset mouse cursor
			// Slow-down scrolling needs to be handled separately => see sldTchTwoDsn() below, so we specifically exclude it here.
			//	In all other cases, need to make certain that purgSldVw[] is empty and that the stack is aligned,
			//		just in case mouse down or move-button down when screen was touched
			// Since mouse could have been down, there might be slideView planes in purgSldVw[].
			//	If there is a 2-finger slideView move, then these slideView planes should go into destSldVw[], but 
			//		we don't yet know if the fingers will move slideView, so we'll use purgClrArr() to move them 
			//		either to destSldVw[] or to SldVw[].
		if (((sldMusSlwDwn.velX == 0) && (sldMusSlwDwn.velY == 0)) || Number.isNaN(sldMusSlwDwn.timer)) {
			if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
				sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
				}
			else { purgClrArray(); }
			}
		}
	if (glbSVTchPt == 1) {  // single touch reports touch location
		sldShwXYPos(tchTot[0].clientX, tchTot[0].clientY);
		}
	if ((oldSVTchPt < 2) && (glbSVTchPt >= 2)) { // just moved to two fingers down
		if (glbWait) { tchClkIconStrt(); }
		else { sldTchTwoDwn(); }	// set up finger-control of slideView movement/focusing/zooming
		}
	return;
	}


	// sldTchTwoDwn() is only called by tchSldVwStrt() and could have been incorporated into tchSldVwStrt()
	//	but it seemed easier to understand it as a separate function
	// sldTchTwoDwn() is called when going from 1 (or no) fingers down to 2 (or more) fingers down.
	//		NOTE that it is NOT called if glbWait == true (i.e., in a "wait"-interrupt state
	//	This function greacefully terminates any other slideView actions, and then initiates touch-directed
	//		(two-finger-directed actions (i.e. slideView movement or changing focus/zoom.
function sldTchTwoDwn() {
				// if F-cycle timer is on => turn-off focal plane cycling
	if (Number.isNaN(glbFCycVal.timId) == false) { sldStopFCyc(); }
				// TURN OFF MOUSE FUNCTIONS
			// Since mouse slow-down occurs after the mouse-button is released, slow-down is allowed to continue
			//		if only 1-finger is touching the screen.  Mouse slow-down is NOT turned off by tchSldVwStrt()
			// However, 2-fingers down, like mouse-down should stop mouse slow-down
	if ((sldMusSlwDwn.velX != 0) || (sldMusSlwDwn.velY != 0) || (!Number.isNaN(sldMusSlwDwn.timer))) {
		sldMusSlwDwnTimerReset();
		sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);
		}
		 	// SET-UP FOR FINGER-BASED MOUSE MOVEMENTS
		// restrict F-planes if too many planes in sldVw[] - have to assume move rather than pinch
	sldRestrictFZ(true,true);  // since isMusMv == true, extra slideView planes go into purgSldVw
		// turn-off destruction array timer
			//	Do NOT alter destTimer.isOn since that will determine whether to turn it on
			//		later ... use of 'isOn' variable needs to be reviewed for utility/consistency
			//	turning off destTimer MUST come after (potential) call to sldRestrictFZ() since
			//		sldRestrictF turns on destruction timer
	if (Number.isNaN(destTimer.id) == false) {  // if destTimer is on = >turn it off
		window.clearInterval(destTimer.id);
		destTimer.id = Number.NaN;
		}
		// glbTchMvPos[] should be empty at the beginning of twoFinger action, but it's best to be safe
	if (glbTchMvArr.length > 0) { glbTchMvArr.splice(0); }
	if (glbSVTchLst.length < 2) {
		alert("sldTchTwoDwn():  Need at least two-touch points must be on screen to manipulate slide."
				+ "\n  Terminating touch-screen action.  Please report this bug.");
		return;
		}
	var curT0X = glbSVTchLst[0].tch.clientX;
	var curT0Y = glbSVTchLst[0].tch.clientY;
	var curT1X = glbSVTchLst[1].tch.clientX;
	var curT1Y = glbSVTchLst[1].tch.clientY;
	var curDistSq = ((curT0X - curT1X) * (curT0X - curT1X)) +  ((curT0Y - curT1Y) * (curT0Y - curT1Y));
	var tchMvPos = {t0X: curT0X, t0Y: curT0Y, t1X: curT1X, t1Y: curT1Y, distSq: curDistSq, time: glbSVTchLst[0].time};
	glbTchMvArr.push(tchMvPos);
	return;
	}

	// tchSldVwEnd() is called by a "touchend" or "touchcancel" event.  As of 11/23/19, this function  
	//		calls tchResetArr() to update glbSVTchLst[], rather than updating the array itself.  
	//		Note: tchResetArr() (and NOT tchSldVwEnd() handles resetting primary fingers in cases
	//		where primary fingers change but 2-finger-movement remains (e.g. when glbSVTchPt > 2
	//		and a primary finger goes 'UP'). 
	//  - 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwEnd(tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var tchTot = tchGetSVArr(tevt.touches);
	var curTime = Date.now();
	var oldSVTchPt = glbSVTchPt;
			// remove the fingers that are going 'UP' from glbSVTchLst[]
	tchResetArr(tchTot,curTime);  // update glbSVTchLst[]
			// going from 2-finger to 1-finger => move stack, reset interrupts, etc.
			//  All of these steps have been moved into sldTchTwoUp()
	if ((oldSVTchPt > 1) && (glbSVTchPt <= 1)) {
		if (glbWait) { tchClkIconEnd(); }
		else { sldTchTwoUp(curTime); }
		}
			// clear menu X,Y positions
	if (glbSVTchPt == 0 ) {
		document.getElementById("menuSldXPos").innerHTML = "&nbsp;";
		document.getElementById("menuSldYPos").innerHTML = "&nbsp;";
		}
	return;
	}


	// sldTchTwoUp() is only called by tchSldVwEnd() and could have been included within that function
	//	It was created as a separate function mainly for parallelism with sldTchTwoDwn()
function sldTchTwoUp(curTime) {
			// sldTchTwoUp() is NOT called if slideView is in "wait" state
			//	following code can assume that we're NOT in "wait" state
	purgClrArray();  // if finger down/up without movement, restore slideView planes in purgSldVw[]
			// The last element in glbTchMvArr should be the last movement, so
			//		curTime - glbTchMvArr[top-element].time should be elapsed time
	var arrSz = glbTchMvArr.length;
	var elapsedTime;
	if (arrSz > 0) {  // no movement unless glbTchMvArr has elements in it (i.e. arrSz > 0 )
		elapsedTime = curTime - glbTchMvArr[glbTchMvArr.length - 1].time;
			// if  there was not a pause, releaae of fingers should initiate movement slow-down
			//		we may need to adjust to account for other actions (pinch/spread) which
			//		also are released by 2-fingers up.
		if (elapsedTime < glbSlwDwnMxTime ) {	// fingers UP shortly after moving stopped
			sldSetSlwDwnVel();		 			//	start mouse slow-down scrolling
			}
		else {      // finger-based movement of screen is done: update stack & set sldVwFoc
			sldMusSlwDwnTimerReset();
			sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
				// sldRestrictFZ() was called before the start of the movement
				// sldAddFZBuffer() was called when F-btn or Z-btn was clicked or when F-cycling was stopped 
			}
		glbTchMvArr.splice(0);  // touch move array not needed until next 2-finger down, clear it.
		}
	else {  // if glbTchMvArr[] is empty, then there shouldn't be anything to move, but check
		if ((sldMvDistX != 0) || (sldMvDistY != 0)) {
			warnBoxCall(false,"Empty Array","sldTchTwoUp(): glbTchMvArr.length = 0, but distance moved is: "
					+ sldMvDistX + "," + sldMvDistY + ".");
			sldMoveStack("sldBndBox",sldVwI,sldMvDistY,sldMvDistX);  // update slideView stack
			}
		}
			// re-start destruction timer
	if ((destSldVw.length + purgSldVw.length) > destArrayMaxNum) {
		alert('Destruction array sizes (destSldVw = ' + destSldVw.length + ' & purgSldVw = '
					+ purgSldVw.length + ') exceed maximum (\"' + destArrayMaxNum
					+ '\").  These arrays will be purged now.');
		destClearArr();
		}
			// if destruction array timer was turned off at beginning of 2-finger movement, turn it back on
	else if (destTimer.isOn && Number.isNaN(destTimer.id)) {
		destTimer.id = window.setInterval(destDeletePlane,destTimeInterval);
		}
	return;
	}




//       ************************************************************
//       *********         slideView Touch Functions      ***********
//       *********           finger-move functions        ***********
//       ************************************************************


	// Originally, we had two "touchmove" interrupts one for 1-finger & 2-finger+"wait", and the
	//	other for 2-finger slide movements.  While unsuccessfully hunting for the 'hanging-pinch bug",
	//	it occurred to me (11/21/19) that it would be cleaner and just as easy to have a single function
	//	handle all "touchmove" interrupts.  This function, after updating glbSVTchLst[], handles the
	//	1-finger-moves and calls separate functions to handle 2-finger moves during a "wait" interrupt, 
	//	and 2-finger slideView drags.
	//  - 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwMv(tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var i;
	var j;
			// get variables for new tchMvPos object (tchCurPos) +> assigned in if-statement below
	var curT0X;
	var curT0Y;
	var curT1X;
	var curT1Y;
	var curDistSq;
	var tchCurPos;  //tchMvArr object to hold current move data
			// variables for updating arrays
	var curTime = Date.now();
	var tchTot = tchGetSVArr(tevt.touches);
	var tchTotSz = tchTot.length;
			// Handling (tchTotSz < 1) may need to be changed if we use an initEvent command to generate 
			//		an artifactual "touchmove" when returning from "wait" state or "pinch"
	if (tchTotSz < 1) {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b> &nbsp;A \"touchmove\" interrupt "
				+ "was generated without any fingers touching the screen. "
				+ "&nbsp;This probably is a fatal error.<br>&nbsp; Please report this bug.");
		document.getElementById("menuSldXPos").innerHTML = "&nbsp;";
		document.getElementById("menuSldYPos").innerHTML = "&nbsp;";
		return;
		}
					// UPDATE glbSVTchLst
			// compare sizes of glbSVTchLst with tchTot
	if (glbSVTchPt != glbSVTchLst.length) {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b> &nbsp;glbSVTchPt ("
				+ glbSVTchPt + ") is not equal to the size of glbSVTchLst array ("
				+ glbSVTchLst.length + "). &nbsp;The array will be reset."
				+ "<br>&nbsp; Please report this bug.");
		tchResetArr(tchTot,curTime);
		}
	if (glbSVTchPt != tchTotSz) {
			// TEMPORARILY disabled the warningBoxCall() because if the pinch/spread
			//		hangs (because of the known but unidentified bug) and one finger
			//		at a time is alternately lifted and replaced (rather than raising
			//		both fingers), raising the second finger generates a warnBox error 
			//		message that glSVTchPt=2 and number of fingers=1.
			//	This warning box should be reinstated after we've found & fixed the bug.
//		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b>"
//				+ " &nbsp;The size of the glbSVTchLst array (" + glbSVTchPt 
//				+ ") is not equal number of fingers touching the screen ("
//				+ tchTotSz + "). &nbsp;The array will be reset."
//				+ "<br>&nbsp; Please report this bug.");
		tchResetArr(tchTot,curTime);
		}
			//	The double-for-loop is needed because we don't know that order of touch-points will be the 
			//		same in both lists, so we have to match by id.
	for (i = 0; i < glbSVTchPt; i++) {
		for (j = 0; j < tchTotSz; j++) {
			if (tchTot[j].identifier == glbSVTchLst[i].tch.identifier) {
				glbSVTchLst[i].tch = tchTot[j];
				glbSVTchLst[i].time = curTime;
				break;
				}
			}
		if (j >= tchTotSz) {
			warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b>"
					+ " &nbsp;Touch-point #" + i + " was not among the fingers "
					+ "touching the screeen. &nbsp;The array will be reset."
					+ "<br>&nbsp; Please report this bug.");
			tchResetArr(tchTot,curTime);  // tchResetArr() will handle change of primary fingers
			}
		}
					// DO MOVE ACTION
			// 1-finger reports x,y position; use tchTotSz just in case tchTotSz != glbSVTchPt
	if (tchTotSz == 1) { sldShwXYPos(tchTot[0].clientX, tchTot[0].clientY); }
			// during "wait" interrupt 2-fingers reports x,y position
	else if (glbWait && (glbSVTchPt > 1)) { sldWaitTchTwoMv(); } 
			// 2-finger "touch-move" causes call to sldTchTwoMv() to move slideView +/or change F/Z
	else if (glbSVTchPt > 1) {  // 2-finger move => NOT "wait"-state
			// get elements for new tchMvPos object (tchCurPos)
		curT0X = glbSVTchLst[0].tch.clientX;
		curT0Y = glbSVTchLst[0].tch.clientY;
		curT1X = glbSVTchLst[1].tch.clientX;
		curT1Y = glbSVTchLst[1].tch.clientY;
		curDistSq = ((curT0X - curT1X) * (curT0X - curT1X)) +  ((curT0Y - curT1Y) * (curT0Y - curT1Y));
		tchCurPos = {t0X: curT0X, t0Y: curT0Y, t1X: curT1X, t1Y: curT1Y, distSq: curDistSq, time: curTime};
		sldTchTwoMv(tchCurPos);
		}
	else {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b>"
				+ " &nbsp;Impossible value for glbSVTchPt (\" + glbSVTchPt"
				+ "\") &nbsp;This probably is a fatal error."
				+ "<br>&nbsp; Please report this bug.");
		}
	return;
	}


	// If 2-fingers move during a glbWait, slideView does NOT move, but glbSVTchLst[] must be updated
	//	so that the system can re-set when it leaves the wait state.  The position reported on the menu
	//	is the average of the locations of the two primary fingers.
function sldWaitTchTwoMv() {
	var arrSz = glbSVTchLst.length;
	if (arrSz < 2) {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchWaitTchTwoMv():<b>"
				+ " &nbsp;Too few fingers (\""+ arrSz + "\") touching the screen. "
				+ "&nbsp;This function should only have been called when two or more fingers "
				+ "were touching the screen.<br>&nbsp; Please report this bug.");
		return;
		}
	if (!glbWait) {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchWaitTchTwoMv():<b>"
				+ " &nbsp;This function should only have been called if the viewer "
				+ "was in a \"wait\"-state.<br>&nbsp; Please report this bug.");
		return;
		}
	var t0X = glbSVTchLst[0].tch.clientX; // clientX of 1st primary touch
	var t0Y= glbSVTchLst[0].tch.clientY; // clientY of 1st primary touch
	var t1X = glbSVTchLst[1].tch.clientX; // clientX of 2nd primary touch
	var t1Y= glbSVTchLst[1].tch.clientY; // clientY of 2nd primary touch
	sldShwXYPos(((t0X+t1X)/2),((t0Y+t1Y)/2));
			// move "wait"-clock icons
	if (t0X == t1X) { // offset if x-positions overlap
		t0X -= 100;
		t1X += 100;
		}
	document.getElementById("tchWaitClk1").style.left = t0X + "px";
	document.getElementById("tchWaitClk2").style.left = t1X + "px";
	if (t0Y == t1Y) { // offset if y-positions overlap
		t0Y -= 100;
		t1Y += 100;
		}
	document.getElementById("tchWaitClk1").style.top = (t1Y - glbMenuTotHt) + "px";
	document.getElementById("tchWaitClk2").style.top = (t0Y - glbMenuTotHt) + "px";
	return;
	}

	// sldTchTwoMv() is passed tchMvArr object containing the coordinates of the primary
	//	fingers for the current "touchmove" event.  The function first handles any move
	//	in the x,y direction and then 
function sldTchTwoMv(tchCurPos) {
	var i;
					// UPDATE glbTchMvArr[]
	glbTchMvArr.push(tchCurPos); // push new tchMvPos object onto array
	var arrSz = glbTchMvArr.length;
			//oldI is the index of the element that previously had been top-of-glbTchMvArr
			// 	tchCurPos already has been pushed onto glbTchMvArr, so oldI is 2 less than the size of array
			//	The amount moved is the difference between tchCurPos and glbTchMvArr[oldI]
	var oldI = arrSz - 2;  // index of penultimate element in glbTchMvArr
			// check to make certain that current element isn't first element in glbTchMvArr[]
			//	If glbTchMvArr[] was empty before tchCurPos was pushed onto the array, then
			//		no movement occurs, but the coordinates of tchCurPos becomes the start point 
			//		for the next movement.  This happens, for instance, when exiting a "wait" state
	if (oldI < 0)  { return; }	
					// MOVE current slideView
			// calculate move distance
		//	NOTE:  since move is calculated from mid-point between primary fingers (touch-points),
		//		it is possible for a touchmove to have mvX & mvY both == 0.
		//		After moving slideView, check for pinch/spread event
	var curX = Math.round((tchCurPos.t0X + tchCurPos.t1X)/2);
	var curY = Math.round((tchCurPos.t0Y + tchCurPos.t1Y)/2);
	var oldX = Math.round((glbTchMvArr[oldI].t0X + glbTchMvArr[oldI].t1X)/2); 
	var oldY = Math.round((glbTchMvArr[oldI].t0Y + glbTchMvArr[oldI].t1Y)/2);
	var mvX = curX - oldX;
	var mvY = curY - oldY;
	var curTime = tchCurPos.time;
	var curDist = Math.sqrt(tchCurPos.distSq);
		// declare variables for slow-down velocity => do calculation after moving viewPlane
	var elapsedTime;
	var curVelX;
	var curVelY;
	var avgPts;
			// move current view-plane & track movements for other sldVw planes
			//	and update velocity for slow-down scrolling
	if ((mvX != 0) || (mvY != 0)) {
		sldMoveView("sldBndBox", sldVwI, mvY, mvX);  // move sldView
		sldMvDistX += mvX;  // update sldMove values for other sldVw planes
		sldMvDistY += mvY;  
		elapsedTime = curTime - glbTchMvArr[oldI].time;
		if (glbTchInChgFZ) {  // movement following FZ change => need to restrictFZ
			sldRestrictFZ(false,true);
			glbTchInChgFZ = false;
			}
		curVelX = mvX/elapsedTime;
		curVelY = mvY/elapsedTime;
		avgPts = sldMusSlwDwn.avgPts;
				// update sldMusSlwDwn velocity values
		if (Number.isFinite(curVelX) && Number.isFinite(curVelY)) {
			sldMusSlwDwn.velX = ((sldMusSlwDwn.velX * avgPts) + curVelX)/(avgPts + 1);
			sldMusSlwDwn.velY = ((sldMusSlwDwn.velY * avgPts) + curVelY)/(avgPts + 1);
			}
		}
				// LOOK FOR PINCH/SPREAD EVENT & TRIM glbTchMvArr[]
		// tmeLim = curTime - glbMaxPnchTime:  is the time in msec-since-1972 of the earliest entry
		//		allowed to remain in glbTchMvArr[].  Besides looking for a pinch/spread occurrence, 
		//		the following for-loop removes all entries into glbTchMvArr[] that are older than tmeLim.
		// For a pinch/spread incident to have occurred, absolute difference between the distance-between-
		//		primary-fingers for the current touchmove and another entry in the glbTchMvArr[] array. 
		//		must exdeed glbMinPnchDist (this excludes any movements with a time earlier than tmeLim).
		//		Originally, we used the absoluted difference between the distances-squared, but the 
		//		the difference in distance squared is non-linear (wrt pinch-distance) and the responsiveness
		//		of pinches to this non-linear function seemed unnatural and confusing to the user, 
		//		so (on 11/23/19) we bit-the-bullet and added used the SQRT(distance-squared) when calculating
		//		the pinch distance.
		// The elements in glbTchMvArr[] are arranged in chronological sequence, so we "walk backwards
		//		in time" if we start the loop at the top (oldI) and loop down towards 0.
		//	chkForPnch is a boolean variable that indicates whether sldTchPnch() returned false.
		//		Originally, if the pinch distance (i.e., absolute value of the difference between current
		//		and some element in glbTchMvArr[]'s distance-between-primary-fingers) exceeded the limit
		//		value (i.e., glbMinPnchDist) not only was sldTchPnch() called but ALSO arrLimI was set and
		//		the "for" loop was broken.  Problem was that sldTchPnch() returns 'false' without doing anything
		//		if slideView is in a "wait" state or if the interval between this 'pinch' and the previous
		//		pinch is less than glbPnchWhlWait.  Removing all of the elements in glbTchMvArr[] prior to a 
		//		pinch non-event (i.e., sldTchPnch() returns false withot doing anything) reduced responsiveness,
		//		since this wiped-out older entries in glbTchMvArr[] that could have tripped a pinch once the
		//		"wait" state or glbPnchWhlWait interval expired.  Now, if sldTchPnch() returns false, then
		//		chkForPnch is set to false, and the loop continues (without checking the pinch value) and 
		//		removes only those elements of glbTchMvArr[] that are earlier than tmeLim.
	var pnchAmt;  // the change in distance between primary fingers; see below
	var arrLimI = 0;  // index of earliest array element preserved when glbTchMvArr[] is trimmed => adjusted below
	var chkForPnch = true;  // turns off checking for pinch if sldTchPnch() returns false
	var tmeLim = curTime - glbMaxPnchTime;
	for (i = oldI; i >=0 ; i-- ) {
		if (chkForPnch)  { // look for a pinch/spread event
			pnchAmt = curDist - Math.sqrt(glbTchMvArr[i].distSq);
			if (Math.abs(pnchAmt) > glbMinPnchDist) { // pinch/spread  event occurred
				if (purgSldVw.length > 0) { purgClrArray(); }  // deal with any slideView planes in purgatory
				chkForPnch = sldTchPnch(pnchAmt,curTime);  // zoom/focus in response to pinch/spread event
						// remove all elements from glbTchMvArr[] that are as old or older
						//	than the element tchMvArr[i] that generated the pinch
				if (chkForPnch) { // only trim glbTchMvArr[] if sldTchPnch() called sldPnchWhlScrl()
					arrLimI = i + 1;  // index of element that will become glbTchMvArr[0] after splice
					glbTchInChgFZ = true;  // pinch/spread-induced change in F or Z is in progress
					break;
					}
				}
			}
			// find index of most recent element in glbTchMvArr with time > tmeLim (curTime - glbMaxPnchTime)
		if (glbTchMvArr[i].time < tmeLim) {
			arrLimI = i + 1;
			break;
			}
		}
	if ((arrLimI > 0) && (arrLimI < arrSz)) {   // trim glbTchMvArr[]
		glbTchMvArr.splice(0,arrLimI); 
		}  // trim glbTchMvArr[]
	return;
	}

	// sldTchPnch() causes slideView to zoom-in/out or focus-up/down in response to
	//		a pinch/spread event on a touch screen.
	//	This function is the touch-equivalent to sldMusWhlScroll(), which is called when a 
	//		mouse-wheel event occurs.  As of 11/17/19, most of the functionality of 
	//		sldMusWhlScroll() was moved to sldPnchWhlScrl() which is called by both
	//		sldMusWhlScroll() and by sldTchPnch().  
	//	For the most-part, only the event handling or other aspects that are unique to
	//		mouse-wheel movement or 2-finger pinch/spread gestures in a touchmove event 
	//		are retained in the functions that are called by event-interrupt.
	//	sldTchPnch() returns true if it calls sldPnchWhlScrl()
	//	sldTchPnch() returns false if it does NOT call sldPnchWhlScrl() - either because
	//		of a "wait" interrupt or because the interval between the current time and 
	//		the time of the last successful pinch is less than glbPnchWhlWait.
	//		This return value can be used to determine how much of glbTchMvArr[] will be
	//		trimmed-off by sldTchTwoMv() ... this will affect how responsive the system
	//		is to pinch-spread events ...
function sldTchPnch(pnchAmt,curTime) {
	if (glbWait) { return(false); }
	if ((!Number.isNaN(glbPnchWhlTime)) && ((curTime - glbPnchWhlTime) < glbPnchWhlWait)) {
		return(false);
		}
			// NOTE:  the following assumes that the function has already returned in the case of
			//		ALL situations where Z or F can't change (otherwise, need an "else" statment)
	glbPnchWhlTime = curTime;
		// pinching, which is a negative pnchAmt, = zoom-out, 
		//	but zoom-out as interpreted by sldPnchWhlScrl() is a positive value for scrlAmt
	sldPnchWhlScrl(-1*pnchAmt);
	return(true);
	}




//       ************************************************************
//       *********         slideView Touch Functions      ***********
//       *********              wait functions            ***********
//       ************************************************************

	//function sldWaitTchTwoMv() is listed under finger-move functions, above

	// if a "wait" interrupt is ininiated on a touch screen, we need to display an icon to
	//	indicate that finger-actions have been interrupted.  To do this, we use two copies 
	//	of a "clock"-like image (<img id="tchWaitClk1"> and  <img id="tchWaitClk2">) that
	//	use a timer (glbTchWaitIconTimer) to cycle through 8 variations of the clock image.
	//	The two images are displayed at opposite corners of the the rectangle defined by the
	//		primary fingers
function tchClkIconStrt() {
	var arrLength = glbSVTchLst.length;
	if (arrLength < 2) { // test for two fingers in glbTchMvArr[]
		warnBoxCall(false,"Wait Icon","tchClkIconStrt():  Only " + arrLength 
				+ " finger on screen, can't start \"wait\" clock-icon.");
		return;
		}
		// check status of timer for touch "wait-icon" and reset
	var timerId = glbTchWaitIconTimer.id;
	if (!Number.isNaN(timerId)) {  // "tchWaitIcon" timer already on => turn it off
		window.clearInterval(timerId);
		glbTchWaitIconTimer.id = Number.NaN;
			// should I bother with a warnBoxCall here?
		}
	timerId = window.setInterval(tchClkIconAdv,glbTchWaitClkInterval);
	glbTchWaitIconTimer.id = timerId;
			// set "touch-wait" icons location (opposite primary fingers
			// set-up clock positions
	var curT0X = glbSVTchLst[0].tch.clientX;
	var curT0Y = glbSVTchLst[0].tch.clientY - glbMenuTotHt;
	var curT1X = glbSVTchLst[1].tch.clientX;
	var curT1Y = glbSVTchLst[1].tch.clientY - glbMenuTotHt;
			// move "wait"-clock icons
	if (curT0X == curT1X) { // offset if x-positions overlap
		curT0X -= 100;
		curT1X += 100;
		}
	document.getElementById("tchWaitClk1").style.left = curT0X + "px";
	document.getElementById("tchWaitClk2").style.left = curT1X + "px";
	if (curT0Y == curT1Y) { // offset if y-positions overlap
		curT0Y -= 100;
		curT1Y += 100;
		}
	document.getElementById("tchWaitClk1").style.top = curT1Y + "px";
	document.getElementById("tchWaitClk2").style.top = curT0Y + "px";
			// display "touch-wait" icons
	document.getElementById("tchWaitClk1").style.display = "block";
	document.getElementById("tchWaitClk2").style.display = "block";
	return;	
	}


	// tchClkIconAdv() moves the hand on the touch "wait-icon" by one position
function tchClkIconAdv() {
	var curClk = glbTchWaitIconTimer.clkNum + 1;  // old clock face from timer object and advance by 1
	if (curClk > 7) { curClk = 0; }  // if clock has made a revolution, reset clock face to 12:00
	var srcStr = "../images/wClk" + curClk + ".png";
	document.getElementById("tchWaitClk1").src = srcStr;
	document.getElementById("tchWaitClk2").src = srcStr;
	glbTchWaitIconTimer.clkNum = curClk;
	return;
	}

	// tchClkIconEnd() is called when glbSVTchPt < 2 or glbWait == false
	//	This function "turns-off" the "wait" clock-icon displayed during a 2-finger-down "wait" interrupt
function tchClkIconEnd() {
			// turn-of timer
	var timerId = glbTchWaitIconTimer.id;
	if (Number.isNaN(timerId)) {  // timer already off
		warnBoxCall(false,"Wait Icon","tchClkIconEnd():  \"wait\" clock-icon already off.");
		}
	else {
		window.clearInterval(timerId);
		glbTchWaitIconTimer.id = Number.NaN;
		}
			// reset touch "wait" icons
	glbTchWaitIconTimer.clkNum = 0;
	var srcStr = "../images/wClk0.png";
	document.getElementById("tchWaitClk1").src = srcStr;
	document.getElementById("tchWaitClk2").src = srcStr;
			// hide "touch-wait" icons
	document.getElementById("tchWaitClk1").style.display = "none";
	document.getElementById("tchWaitClk2").style.display = "none";
	return;
	}
		

