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
	// 4/01/20 tchGetSVArr() should work with changedTouches
	//	tchGetSVArr() is passed a touchlist (usually touchEvent.touches).  The function reads through
	//		the array and pushes onto arrSV any touch elements whose target is sldBndBox, a child
	//		of sldBndBox, or (with a warning) a child of a slideView plane (i.e., className includes
	//		"grTileGrid").  I don't think that any grandchildren of sldBndBox are targets of the
	//		touchEvents, but I decided to put in the warnBox just in case.  If we never get any
	//		warnings, at some point we should delete the test for grandchildren.
function tchGetSVArr(tchArr) {
	var arrSV = [];  // array of touch-points whose target is sldBndBox or child of sldBndBox
	var i;
	var nodeSldBndBox = document.getElementById("sldBndBox");
	var nodeCur;
	var nodePar;  // variable to hold parent of nodeCur;
	for (i = 0; i < tchArr.length; i++){
		nodeCur = tchArr[i].target;
		if (nodeCur == nodeSldBndBox) {
			arrSV.push(tchArr[i]);
			}
		else {
			nodePar = nodeCur.parentNode;
			if (nodePar == nodeSldBndBox) {
				arrSV.push(tchArr[i]); 
				}
				// it looks like targets never are children of slideView, but just in case ...
			else if (nodePar.className.indexOf("grTileGrid") >= 0) {  // parent is a slideView plane
				arrSV.push(tchArr[i]);
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
			//	the bug that hangs zoom-in/out & focus up/down causes the program to not call
			//	tchSldVwEnd(), so oldLstSz sometimes is >= 2 when all fingers are lifted,
			//	which generates an erroneous and confusing error message
//		warnBoxCall(false,"Fingers Changed",errTxt);
		}
	return;
	}

	// tchUpdtArr() was added on 4/02/20
	// unlike tchResetArr(), which is passed the complete set of SVtouches, tchUpdtArr() is passed the
	//  changedTouches array.  Depending on the value of act, it appends, splices-out, or modifies the entry
	//	in glbSVTchLst[]
	//	values for act are:
	//		"+" appends touch object to glbSVTchLst => called by tchSldVwStrt()
	//		"-" deletes touch object from glbSVTchLst => called by tchSldVwEnd()
	//		"m" modifies touch object in glbSVTchLst => called by tchSldVwMv(tevt)
	//  tchUpdtArr() returns true if new value for glbSVTchPt == new glbSVTchLst.length, and
	//		returns false if glbSvTchPt != glbSVTchLst.length, or an error occurred
function tchUpdtArr(act,chgArr,chgTime) {
	if (!((act == "+") || (act == '-') || (act == "m"))) {
		warnBoxCall(false,"Illegal value",
				"<b>tchUpdtArr():</b>&nbsp; Action (\"" + act 
						+ "\") must be \"+\", \"-\", or \"m\"."
						+ "<br>&nbsp; Please report error.");
		return(false);
		}
	var oldLstSz = glbSVTchLst.length;
			// if glbSVTchPt doesn't match glbSVTchLst.length => calling function needs to reset glbSVTchLst[]
	if (glbSVTchPt != oldLstSz) { 
		if (!Number.isNaN(glbSVTchPt)) { // menuResetTch() sets glbSVTchPt = NaN
			warnBoxCall(false,"Touch-point mismatch",
				"<b>tchUpdtArr():</b>&nbsp; Original number of touch-points (\"" + glbSVTchPt 
					+ "\") does not match size of touch-point list (\"" + oldLstSz 
					+ "\").&nbsp; glbSVTchLst[] will be reset.<br>&nbsp;&nbsp;Please report this error.");
					}
		return(false);
		}
	var errStr = "";
	var i;  // index for chgArr
	var chgSz = chgArr.length;
	var j;  // index for glbSVTchLst
	var isResetPrimTch = false;  // set to true if a primary finger is deleted from glbSVTchLst[]
	var curTch;  // current element within chgArr
	var tchId;  // identifier of current touch object
	var curLstSz = oldLstSz;  // current length of glbSVTchLst[] => adjusted below
	var curTchObj;  // object to hold new glbSVTchLst object
	for (i = 0; i < chgSz ; i++) {
		curTch = chgArr[i];
		tchId = curTch.identifier;
		for (j = 0; j < oldLstSz; j++) {
			if (tchId == glbSVTchLst[j].tch.identifier) {
				if (act == "+") { // error => can't already have touch in glbSVLst at touchstart
					glbSVTchPt = curLstSz;
					warnBoxCall(false,"Touch-point duplication",
							"<b>tchUpdtArr():</b>&nbsp; New touch-point (\"" + tchId + "\") already exists."
								+ "<br>&nbsp; Please report error.");
					return(false);
					}
				else if (act == "-") {
					glbSVTchLst.splice(j,1);
					curLstSz--;
					if ((j==0) || (j==1)) { isResetPrimTch = true; }
					break;
					}
				else {  // act == "m" => already tested for a legal value of act
					glbSVTchLst[j].tch = curTch;
					glbSVTchLst[j].time = chgTime;
					break;
					}
				}  // if id's don't match, keep looping through glbSVTchLst
			}  // end loop through glbSVTchLst
		if (j >= oldLstSz) { // curTch not already in glbSVTchLst
			if (act == "+") { // append new touch element to end of glbSVTchLst
				curTchObj = {tch: curTch, time: chgTime};
				glbSVTchLst.push(curTchObj);
				curLstSz++;
				}
			else {  // error if act == "-" or "m" and can't find touchpoint
				if (act == "-") { errStr = "delete" ; }
				else { errStr = "modify"; }
				warnBoxCall(false,"Missing touch-point",
							"<b>tchUpdtArr():</b>&nbsp; Cannot " + errStr + "touch-point (\"" 
								+ tchId + "\") because it is not in glbSVTchLst[]"
								+ "<br>&nbsp; Please report error.");
				if ((isResetPrimTch) && (glbSVTchPt >= 2)){ glbTchMvArr.splice(0); } // resets glbTchMvArr[]
				glbSVTchPt = curLstSz;
				return(false);
				}
			}  // end if j > loop
		}  // end loop through chgArr
			// test for 			
	if (curLstSz != glbSVTchLst.length) {
		warnBoxCall(false,"Touch-point mismatch",
				"<b>tchUpdtArr():</b>&nbsp; New number of touch-points (\"" + glbSVTchPt 
					+ "\") does not match size of touch-point list (\"" + oldLstSz 
					+ "\").<br>&nbsp; Please report error.");
		if ((isResetPrimTch) && (glbSVTchPt >= 2)){ glbTchMvArr.splice(0); } // resets glbTchMvArr[]
		return(false);
		}
	else {
		if ((isResetPrimTch) && (glbSVTchPt >= 2) && (curLstSz >= 2)){
				// rather than pushing new primary fingers onto glbTchMvArr[], it was easier to just
				//		just empty glbTchMvArr[] and let the next finger movement repopulate the array
				//  if curLstSz < 2, sldTchTwoUp() will reset glbTchMvArr[];
				//	if old glbSVTchPt < 2 (haven't reset glbSVTchPt yet) then glbTchMvArr[] already is empty
			glbTchMvArr.splice(0);
				// NEED WARNING ABOUT CHANGING PRIMARY FINGERS; see tchResetArr()
			} 
		glbSVTchPt = curLstSz;
		return(true);
		}
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
	//		two fingers are considered for finger-directed movements.  Change fingers will result in a call
	//	4/02/20:  renamed tchTot to tchArr; use tchArr = tevt.changedTouches and call tchUpdtArr() rather than
	//		tchResetArr() ... if tchUpdtArr() fails, then use tevt.touches and tchResetArr() to reset the array.
	//		I don't thing tevt.stopPropagation is doing anything useful.  I've commented it out for now.
	//  --- 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwStrt(tevt) {
	tevt.preventDefault();
//	tevt.stopPropagation();
//	tchClrMenu(tevt);  // necessary because we stop propagation on touch events involving sldBndBox 
	var oldSVTchPt = glbSVTchPt;
	var tchArr = tchGetSVArr(tevt.changedTouches);
	var curTime = Date.now();  // time in msec since 1/01/1970
		// if a pinch/spread hangs (probably because the touch 'belongs' to a sldView plane that no longer exists)
		//		the touchend event is not received.  This generates errors because glbSVTchPt is too large.
		//	The if-statement below is a 'kludge' to deal with this problem until I an figure-out how to attach the
		//		touches to sldBndBox rather than the viewplane.
	if ((tevt.touches.length == tevt.changedTouches.length) && (glbSVTchPt > 0)) {
		glbSVTchLst.splice(0);
		glbSVTchPt = 0;
		tchArr = tchGetSVArr(tevt.touches);
		tchResetArr(tchArr,curTime);  // reset glbSVTchLst[]
		}
			// "else if" statement below should be "if" statement if we fix the bug
	else if (!tchUpdtArr("+",tchArr,curTime)) {  // updating glbSVTchLst[] failed => reset glbSVTchLst
		tchArr = tchGetSVArr(tevt.touches);
		tchResetArr(tchArr,curTime);  // reset glbSVTchLst[]
		}
			// warn about too many touches	
			//	This should not need to do another glbSVTchLst[] reset, but even with the 'kludge' above, we still
			//		get the wrong count on fingers if, after a pinch/spread hang, only one of the two fingers is
			//		lifted off the 
	if (glbSVTchPt > 2) {
		tchArr = tchGetSVArr(tevt.touches);
		tchResetArr(tchArr,curTime);  // reset glbSVTchLst[]
		if (glbSVTchPt > 2) {
			warnBoxCall(false,"Two Fingers","You have " + glbSVTchPt + " fingers touching the "
					+ "screen.&nbsp; Please do not touch the screen with more than TWO fingers.");
			}
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
		sldShwXYPos(tchArr[0].clientX, tchArr[0].clientY);
		}
	if ((oldSVTchPt < 2) && (glbSVTchPt >= 2)) { // just moved to two fingers down
		if (glbWait) { tchClkIconStrt(); }  // if wait-clock-icon already on => tchClkIconStrt() will turn it off & restart
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
	if (!Number.isNaN(glbFCycVal.timId)) { sldStopFCyc(); }
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
	tchPushMvArr();
	return;
	}


	// 4/03/20:  split tchPushMvArr() from sldTchTwoDwn()
	//	This function creates a MvArr object from the current SVTchLst and pushes it onto glbTchMvArr[]
	//		Uses sqrt() function to calculate distance
function tchPushMvArr() {
	if (glbSVTchLst.length < 2) { return; }
	var curT0X = glbSVTchLst[0].tch.clientX;
	var curT0Y = glbSVTchLst[0].tch.clientY;
	var curT1X = glbSVTchLst[1].tch.clientX;
	var curT1Y = glbSVTchLst[1].tch.clientY;
	var difX = curT0X - curT1X;
	var difY = curT0Y - curT1Y;
	var curDist = Math.sqrt((difX * difX) + (difY * difY));
	var curTime = Math.max(glbSVTchLst[0].time,glbSVTchLst[1].time);  // use whichever finger's time is most recent
	var tchMvPos = {t0X: curT0X, t0Y: curT0Y, t1X: curT1X, t1Y: curT1Y, dist: curDist, time: curTime};
	glbTchMvArr.push(tchMvPos);
	return;
	}

	// tchSldVwEnd() is called by a "touchend" or "touchcancel" event.  As of 11/23/19, this function  
	//		calls tchResetArr() to update glbSVTchLst[], rather than updating the array itself.  
	//		Note: tchResetArr() (and NOT tchSldVwEnd() handles resetting primary fingers in cases
	//		where primary fingers change but 2-finger-movement remains (e.g. when glbSVTchPt > 2
	//		and a primary finger goes 'UP'). 
	//	4/02/20:  renamed tchTot to tchArr; use tchArr = tevt.changedTouches and call tchUpdtArr() rather than
	//		tchResetArr() ... if tchUpdtArr() fails, then use tevt.touches and tchResetArr() to reset the array.
	//		I don't thing tevt.stopPropagation is doing anything useful.  I've commented it out for now.
	//  - 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwEnd(tevt) {
	tevt.preventDefault();
//	tevt.stopPropagation();
	var oldSVTchPt = glbSVTchPt;
	var tchArr = tchGetSVArr(tevt.changedTouches);
	var curTime = Date.now();  // time in msec since 1/01/1970
	if (!tchUpdtArr("-",tchArr,curTime)) {  // updating glbSVTchLst[] failed => reset glbSVTchLst
		tchArr = tchGetSVArr(tevt.touches);
		tchResetArr(tchArr,curTime);  // reset glbSVTchLst[]
		}
			// going from 2-finger to 1-finger => move stack, reset interrupts, etc.
			//  All of these steps have been moved into sldTchTwoUp()
	if ((oldSVTchPt > 1) && (glbSVTchPt <= 1)) {
			// 4/06/20 removed if glbWait call to tchClkIconEnd()
		if (!glbWait) { sldTchTwoUp(curTime); }
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
	//	4/03/20:  renamed tchTot to tchArr; use tchArr = tevt.changedTouches and call tchUpdtArr() rather than
	//		tchResetArr() ... if tchUpdtArr() fails, then use tevt.touches and tchResetArr() to reset the array.
	//		I don't thing tevt.stopPropagation is doing anything useful.  I've commented it out for now.
	//  -- 1/02/20:  changed tchTot = tevt.targetTouches to tchTot = tevt.touches, and reinstated tevt.stopPropagatin
	//		because target sometimes is sldBndBox and sometimes is one of the slideView planes (children of sldBndBox)
	//		and even with propagation "on" sldBndBox doesn't seem to always get the event message
function tchSldVwMv(tevt) {
	tevt.preventDefault();
//	tevt.stopPropagation();
	var i;
	var j;
	if ((glbSVTchPt >= 2) && (glbTchMvArr.length == 0)) {  // initialize move array if move array is empty & 2 fingers are down
		tchPushMvArr(); 
		}
			// get variables for new tchMvPos object (tchCurPos) +> assigned in if-statement below
	var curT0X;
	var curT0Y;
	var curT1X;
	var curT1Y;
	var tchCurPos;  //tchMvArr object to hold current move data
			// variables for updating arrays
	var tchArr = tchGetSVArr(tevt.changedTouches);
	var curTime = Date.now();  // time in msec since 1/01/1970
	if (!tchUpdtArr("m",tchArr,curTime)) {  // updating glbSVTchLst[] failed => reset glbSVTchLst
		tchArr = tchGetSVArr(tevt.touches);
		tchResetArr(tchArr,curTime);  // reset glbSVTchLst[]
		}

	if (tchArr.length < 1) {
		warnBoxCall(false,"<b>Touch-point Error</b>","<b>tchSldVwMv():<b> &nbsp;A \"touchmove\" interrupt "
				+ "was generated without any fingers touching the specimen. "
				+ "&nbsp;This probably is a fatal error.<br>&nbsp; Please report this bug.");
		document.getElementById("menuSldXPos").innerHTML = "&nbsp;";
		document.getElementById("menuSldYPos").innerHTML = "&nbsp;";
		return;
		}
					// DO MOVE ACTION
	if (glbSVTchPt == 1) { sldShwXYPos(glbSVTchLst[0].tch.clientX, glbSVTchLst[0].tch.clientY); }
			// during "wait" interrupt 2-fingers reports x,y position
	else if (glbWait && (glbSVTchPt > 1)) { sldWaitTchTwoMv(); } 
			// 2-finger "touch-move" causes call to sldTchTwoMv() to move slideView +/or change F/Z
	else if (glbSVTchPt > 1) {  // 2-finger move => NOT "wait"-state
//document.getElementById("jrTest").innerHTML += "tchSldVwMv() - glbSVTchPt = " + glbSVTchPt + ".<br>";
		sldTchTwoMv();  // handle two-finger move
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

	// sldTchTwoMv() two-finger movements; it handles movement in x,y direction and
	//		calls sldTchPnch() to handle pinching/spreading.  sldTchTwoMv() assumes
	//		that the system is NOT in a "wait" state.  The calling function MUST
	//		assure that this is the case
function sldTchTwoMv() {
	var i;
					// UPDATE glbTchMvArr[]
	tchPushMvArr(); // push new tchMvPos object onto array
	var arrSz = glbTchMvArr.length;
			//oldI is the index of the element that previously had been top-of-glbTchMvArr
			// 	tchCurPos already has been pushed onto glbTchMvArr, so oldI is 2 less than the size of array
			//	The amount moved is the difference between tchCurPos and glbTchMvArr[oldI]
	var curI = arrSz - 1;  // current element in gblTchMvArr
	var oldI = arrSz - 2;  // index of penultimate element in glbTchMvArr
			// check to make certain that current element isn't first element in glbTchMvArr[]
			//	If glbTchMvArr[] was empty before tchCurPos was pushed onto the array, then
			//		no movement occurs, but the coordinates of tchCurPos becomes the start point 
			//		for the next movement.  This happens, for instance, when exiting a "wait" state
	if (oldI < 0)  { return; }	// can't move unless there are at least two elements in glbTchMvArr[]
		// if already in pinch/spread sequence, check for pinch/spread BEFORE moving slide,
		//		otherwise, check for pinch/spread occurs AFTER moving slide.
	if (glbTchInChgFZ) { // last action was a pinch/spread induced change in FZ
		if (sldTchPnch()) {		// if tchPinch() returns true (pinch/spread occurred),
			return;				// then return AFTER changing zoom/focus, without moving specimen
			}
		}
					// MOVE current slideView
			// calculate move distance
		//	NOTE:  since move is calculated from mid-point between primary fingers (touch-points),
		//		it is possible for a touchmove to have mvX & mvY both == 0.
	var curX = Math.round((glbTchMvArr[curI].t0X + glbTchMvArr[curI].t1X)/2);
	var curY = Math.round((glbTchMvArr[curI].t0Y + glbTchMvArr[curI].t1Y)/2);
	var oldX = Math.round((glbTchMvArr[oldI].t0X + glbTchMvArr[oldI].t1X)/2); 
	var oldY = Math.round((glbTchMvArr[oldI].t0Y + glbTchMvArr[oldI].t1Y)/2);
	var mvX = curX - oldX;
	var mvY = curY - oldY;
	var curTime = glbTchMvArr[curI].time;
		// declare variables for slow-down velocity => do calculation after moving viewPlane
	var elapsedTime = curTime - glbTchMvArr[oldI].time;
	var curVelX;
	var curVelY;
	var avgPts;
			// move current view-plane & track movements for other sldVw planes
			//	and update velocity for slow-down scrolling
	if ((mvX != 0) || (mvY != 0)) {
			// since fingers don't have to come up & down between pinch and move,
			//	if last action focused up & down (i.e. glbTchInChgFZ == true)
			//	could have multiple focal-planes loaded; and may need to restrictFZ()
			//	BEFORE moving slideView.
			//	glbTchInChgFZ is reset after determining whether to call sldTchPnch()=> see below
		if (glbTchInChgFZ) {  // movement following FZ change => need to restrictFZ
			sldRestrictFZ(false,true);
			}
			// move current slideView and update 	
		sldMoveView("sldBndBox", sldVwI, mvY, mvX);  // move sldView
		sldMvDistX += mvX;  // update sldMove values for other sldVw planes
		sldMvDistY += mvY;  
		curVelX = mvX/elapsedTime;
		curVelY = mvY/elapsedTime;
		avgPts = sldMusSlwDwn.avgPts;
				// update sldMusSlwDwn velocity values
		if (Number.isFinite(curVelX) && Number.isFinite(curVelY)) {
			sldMusSlwDwn.velX = ((sldMusSlwDwn.velX * avgPts) + curVelX)/(avgPts + 1);
			sldMusSlwDwn.velY = ((sldMusSlwDwn.velY * avgPts) + curVelY)/(avgPts + 1);
			}
		}
			// if not already changing F or Z => need to check for pinch after moving slideView
			//		this also truncates glbTchMvArr[]
	if (!glbTchInChgFZ) {
		glbTchInChgFZ = sldTchPnch();
		}
	return;
	}
		

	// sldTchPnch() was re-written on 4/03/20.  It assumes (so calling function MUST test for these) that:
	//	- that it is NOT in a "wait" state
	//	- that glbTchMvArr.length >= 2
	//	After setting up variables that don't change in the loop, the function loops through glbTchMvArr[] to:
	//	1)	test if pinch distance is sufficent for a F or Z change, if yes, then:
	//	1a)	set glbTchInChgFZ = true => this will cause next touchmove to check for pinch / spread before
	//			moving specimen ... which prevents restrictFZ() from destroying view-planes during focus up-and-down
	//	1b)	if sufficient time has elapsed: 
	//			=> calls sldPnchWhlScrl()
	//			=> truncates glbTchMvArr[] (delete element being compared to current and all older elements)
	//			=> sets glbPnchWhlTime to current time ... so another glbPnchWhlTime must elapse before the next FZ change
	//	 		=> return true
	//	1c)	returns true
	//	2) test if previous TchMv element is older than time limit 
	//			=> truncate glbTchMvArr[] if element is older than time limit & return false;
	//			=> do NOT adjust glbTchInChgFZ
	//	3) returns false (unless pinch/spread occurred ... see 1c)
	//	if pinch has caused an FZ change within the prior glbPnchWhlWait time (200 msec) => isTmeElapsed = false
	//		in this case, if a pinch occurs (i.e., absolute difference in distance > glbMinPnchDist)
	//		=> glbTchInChgFZ = true, sldTchPnch() does NOT call sldPnchWhlScrl, does NOT truncate glbTchMvArr[],
	//		but does return true.  This will cause sldTchTwoMv() to return without moving specimen and will cause
	//		the next touchmove to do a pinch/spread (assuming that its been at least 250 msec since previous FZ change).
	// NOTE: if pinch occurs, sldPnchWhlScr() calls sldFBtnClk() or sldZBtnClk() which handle
	//		updating sldView stack by calling sldMoveStack() & terminating slowdown scrolling
		// tmeLim = curTime - glbMaxPnchTime:  is the time in msec-since-1972 of the earliest entry
		//		allowed to remain in glbTchMvArr[].  Besides looking for a pinch/spread occurrence, 
		//		the for-loop removes all entries in glbTchMvArr[] that are older than tmeLim.
		// For a pinch/spread incident to have occurred, the absolute difference between the distance-between-
		//		primary-fingers for the current touchmove and another entry in the glbTchMvArr[] array. 
		//		must exdeed glbMinPnchDist (this excludes any movements with a time earlier than tmeLim).
		//		Originally, we used the absolute difference between the distances-squared, but the 
		//		the difference in distance squared is non-linear (wrt pinch-distance) and the responsiveness
		//		of pinches to this non-linear function seemed unnatural and confusing to the user, 
		//		so (on 11/23/19) we bit-the-bullet and added used the SQRT(distance-squared) when calculating
		//		the pinch distance.
		// The elements in glbTchMvArr[] are arranged in chronological sequence, so we "walk backwards
		//		in time" if we start the loop at the top (oldI) and loop down towards 0.
function sldTchPnch() {
	var i;
	var curI = glbTchMvArr.length - 1;  // index of current TchMv element in glbTchMvArr[]
	var curTime = glbTchMvArr[curI].time;
	var curDist = glbTchMvArr[curI].dist;
	var tmeLim = curTime - glbMaxPnchTime;  // minimum time for elements in glbTchMvArr[]
	var pnchAmt;
	var isTmeElapsed = true;  // sufficient time has elapsed since previous pinch for next pinch to occur
	if ((!Number.isNaN(glbPnchWhlTime)) && ((curTime - glbPnchWhlTime) < glbPnchWhlWait)) {
		 isTmeElapsed = false;  // need more time before next pinch/scroll to be effective
		 }
		// loop through glbTchMvArr[] looking for pinchable distance or expired time
	for (i = curI - 1; i >= 0; i--) {
		pnchAmt = glbTchMvArr[i].dist - curDist;
		if (Math.abs(pnchAmt) > glbMinPnchDist) {  // pinch/spread is big enough to change F or Z
			glbTchInChgFZ = true;
			if (isTmeElapsed) {  // sufficient time since last F or Z change to allow next to occur
				sldPnchWhlScrl(pnchAmt);  // change F or Z => see note on updating slideView stack above
				glbPnchWhlTime = curTime;  // set time of last FZ change to current time
				glbTchMvArr.splice(0,i+1);  // truncate glbTchMvArr[]
				}
					// if pinch was sufficient but isTmeElapsed is false, still return true 
					//	(with glbTchInChgFZ == true), so next touchmove will result in an FZ change
			return(true);
			}
		else if (glbTchMvArr[i].time < tmeLim) {
			glbTchMvArr.splice(0,i+1);
			break;
			}
		}
	return(false);
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
		

