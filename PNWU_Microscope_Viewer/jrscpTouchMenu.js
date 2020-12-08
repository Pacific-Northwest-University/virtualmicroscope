// jrscpTouchMenu.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpTouchMenu.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	The "PNWU Microscope" consists of two parts a Viewer and a SlideBox.  This file 
//		(jrscpTouchMenu.js) is part of the Viewer.  Currently, the Viewer consists 
//		of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheets
//		- 11 javascript files (including jrscpTouchMenu.js)
//		- three PHP files
//	jrscpTouchMenu.js contains javascript functions related to touch-screen actions on the 
//		menu and navigator.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//	On 12/02/19, I split jrscpTouch.js into jrscpTouchMenu.js and jrscpTouchMain.js because
//		jrscpTouch.js had gotten too large.

//		*************************************************************
//		*********           MENU Touch Functions          ***********
//		*********        NAVIGATOR Touch Functions        ***********
//		*************************************************************


	// On 12/22/19, I made the "cache settings", "view-plane settings", and "destruction array settings"
	//		side menus.  This should have required that I attach EventListener commands for touchevents
	//		to the newly created drop-down item elements.  However, these buttons seem to be behaving
	//		correctly with just the default touchscreen (click) actions ... so I have NOT yet
	//		added eventListeners to these objects.  In the future, IT MAY BE NECESSARY TO 
	//		WRITE CODE TO HANDLE touchEvents INVOLVING THE SIDE-MENU ITEMS.

	// I couldn't figure out how to get the background & text colors "clickable" menu items 
	//		to be well-behaved in response to touchEvents except by explicitly setting these
	//		colors.  Unfortunately, this overrides the :hover and :active behavior specified
	//		in the CSS (jrscpStyleMain.css) for mouse-actions related to these buttons.  This
	//		isn't a problem if (as will frequently be the case) the user is using only a mouse
	//		or only a touchscreen.  However, it will be a problem if both a mouse and touchscreen
	//		are used simultaneously:  clicks still work, but the buttons no longer respond to 
	//		the mouse hovering over the button. (since the interactive actions wrt to the mouse 
	//		are lost.
	//	To try to deal with this problem, I've created a variable (glbTchMenuFree) that is set 
	//		to false (by tchClkBtnDwn()) when there is a touchstart event (finger-down) on a 
	//		"clickable" menu item.  Any mouseup event on the document calls tchMenuUnblock().
	//		If glbTchMenuFree == false, tchMenuUnblock() sets the background & text color of 
	//		the listed "clickable" menu items to an empty string (""), which should restore the
	//		mouse :hover & :active behaviors specified by the CSS
	//	- On 1/01/20, tchMvBtn() now sets glbTchMenuFree = false on touchstart, and
	//		navBtnOver() & navBtnUp test for glbTchMenuFree before resetting the :hover color  
	//		on the navigator buttons because navBtnOver() seems to be called sometimes 
	//		(but not always) on a touchend event on a navigator button even though tchMvBtn() 
	//		has a touchevent.preventDefault statement.
function tchMenuUnblock() {
	if (glbTchMenuFree) { return; }
	var i;
	var btnNode;  // 'pointer' to button
	var btnLst = [
				"navMusWhlFBox",			// start of NAVIGATOR 'clickable' items
				"navMusWhlFxBx",
				"navMusWhlFRadio",	// this shouldn't need to be reset, but its safer this way
				"navMusWhlZBox",
				"navMusWhlZxBx",
				"navMusWhlZRadio",	// this shouldn't need to be reset, but its safer this way
				"menuSldNmMenuVis",			// start of VIEW MENU
				"menuSldNmVisCheckBx",	// this shouldn't need to be reset, but its safer this way
				"menuSldNmVisLbl",		// children of "menuFMenuVis"
				"menuFMenuVis",
				"menuFVisCheckBx",	// this shouldn't need to be reset, but its safer this way
				"menuFVisLbl",		// children of "menuFMenuVis"
				"menuZMenuVis",
				"menuZVisCheckBx",	// this shouldn't need to be reset, but its safer this way"
				"menuZVisLbl",	 	// children of "menuZMenuVis"
				"menuXYMenuVis",
				"menuXYVisCheckBx",	// this shouldn't need to be reset, but its safer this way
				"menuXYVisLbl", 	// children of "menuXYMenuVis"
				"menuMusWhlFBox",
				"menuMusWhlFRadio",	// this shouldn't need to be reset, but its safer this way
				"menuMusWhlFTxt",	// children of "menuMusWhlFBox"
				"menuMusWhlZBox",
				"menuMusWhlZRadio",	// this shouldn't need to be reset, but its safer this way
				"menuMusWhlZTxt",	// children of "menuMusWhlZBox"
				"menuFChgSet",			// start of SETTINGS MENU
				"menuEnDisableF",
				"menuDisEnableBell",
				"menuBellNote",		// children of "menuDisEnableBell"
				"menuBellOnOffTxt",	// children of "menuDisEnableBell"
				"menuMvArrowDir",
				"menuMvArrowTxt",	// child of "menuMvArrowDir"
				"menuResetTch",
				"menuCacheSz",
				"menuCacheList",
				"menuClearCache",
				"menuSldVwList",
				"menuShwTiles",
				"menuRestrictF",
				"menuClearDestArr",
				"menuChgSet",
				"menuAboutMicroscope",	// start of ABOUT MENU
				"menuAboutPNWU",
				"menuMorePNWU",
				"menuSponsors",
				"menuVirSlides",
				"menuScanSlides",
				"menuAboutMusCntrl",
				"menuAboutTchScr",
				"waitBoxMv",			// start of InfoBox move buttons
				"aboutBoxMv",
				"gotoBoxMv",
				"infoBoxCacheMv",
				"infoBoxSVwMv",
				"infoBoxChgSetMv"
				];
	var lstSz = btnLst.length;
				// reset background & text colors to ""
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(btnLst[i]);
		if (btnNode == null) {
			alert("tchClkBtnInit():  could find \"" + btnLst[i] + "\".\n   Could not reset text and background colors for this item.");
			continue;
			}
		btnNode.style.backgroundColor = "";
		btnNode.style.color = "";
		}
				// only reset text color
	var btnTxtOnlyLst = [  // these nodes have transparent background => only color needs to be reset
				"navMusWhlFTxt",
				"navMusWhlZTxt"
				];
	lstSz = btnTxtOnlyLst.length;
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(btnLst[i]);
		if (btnNode == null) {
			alert("tchClkBtnInit():  could find \"" + btnLst[i] + "\".\n   Could not reset text and background colors for this item.");
			continue;
			}
		btnNode.style.color = "";
		}
	glbTchMenuFree = true;
	glbNoTch = true;
	return;
	}


//			****************************************************
//			*********           move buttons         ***********
//			****************************************************


function tchMvBtnInit() {
	var i;
	var btnNode;
	var mvBtnList = [
			{num: 16, id: "navMvBtn16", img: "navMvBtnImg16"},
			{num: 11, id: "navMvBtn11", img: "navMvBtnImg11"},
			{num: 21, id: "navMvBtn21", img: "navMvBtnImg21"},
			{num: 26, id: "navMvBtn26", img: "navMvBtnImg26"},
			{num: 36, id: "navMvBtn36", img: "navMvBtnImg36"},
			{num: 31, id: "navMvBtn31", img: "navMvBtnImg31"},
			{num: 41, id: "navMvBtn41", img: "navMvBtnImg41"},
			{num: 46, id: "navMvBtn46", img: "navMvBtnImg46"},
			{num: 12, id: "menuMvBtn12", img: ""},
			{num: 22, id: "menuMvBtn22", img: ""},
			{num: 32, id: "menuMvBtn32", img: ""},
			{num: 42, id: "menuMvBtn42", img: ""}
			];
	for (i= 0; i < mvBtnList.length; i++) {
		btnNode = document.getElementById(mvBtnList[i].id);
		if (btnNode == null) {
			alert("tchMvBtnInit():  Could not find node belonging to \"" + mvBtnList[i].id 
					+ "\".\n  Cannot install touch-screen eventListner for move buttons."
					+ "\n  This may be a fatal error.  Please report this bug.");
			return;
			}
		btnNode.addEventListener("touchstart",function() {tchMvBtn("touchstart",event,this);});	
		btnNode.addEventListener("touchmove",function() {tchWaitBtnMv(event);});
		btnNode.addEventListener("touchend",function() {tchMvBtn("touchend",event,this);});
		btnNode.addEventListener("touchcancel",function() {tchMvBtn("touchend",event,this);});
		if (mvBtnList[i].img == ""){ continue; }  // skip items without images
					// attach eventListener to images
				// thie was added on 12/01/19 to try to eliminate the touches that generate some sort
				//	of default action with gray or ;hover background color.  I'm not convinced that
				//	it did any good, but it also doesn't seem to have done any damage.
		btnNode = document.getElementById(mvBtnList[i].img);
		if (btnNode == null) {
			alert("tchMvBtnInit():  Could not find node belonging to image \"" + mvBtnList[i].img 
					+ "\".\n  Cannot install touch-screen eventListner for move buttons."
					+ "\n  This may be a fatal error.  Please report this bug.");
			return;
			}
		btnNode.addEventListener("touchstart",function() {tchMvBtn("touchstart",event,this.parentNode);});	
		btnNode.addEventListener("touchmove",function() {tchWaitBtnMv(event);});
		btnNode.addEventListener("touchend",function() {tchMvBtn("touchend",event,this.parentNode);});
		btnNode.addEventListener("touchcancel",function() {tchMvBtn("touchend",event,this.parentNode);});
		}
	return;
	}

	//	NOTE:  on 12/01/19, I explicitly set the background colors to the "normal values (not :hover or :active) 
	//		colors when in "wait" state (glbWait == true) because at apparently random instances,  
	//		the buttons assumed the :hover background colors when touched during a "wait" state.
	//	The there should also be a similar problem with the :hover colors before when these buttons 
	//		are inactive before slideView is initialize (sldBndBox.display != "block"), but this 
	//		does NOT seem to be the case ... so I am NOT (on 12/01/19) explicitly setting
	//		background colors in the isSVInit == false case.  If we later need explicitly set
	//		background colors for move buttons in the pre-sldView-initialized state:
	//		besides changing the "if (glbWait)" statement to ("if (glbWait !! !isSVInit)"
	//		we will also need to add an "if (glbWait)" statement to "tchWaitBtnSetup();" 
	//		since tchWaitBtnSetup() is only relevant for "wait"-state and should NOT be called
	//		prior to slideView initialization.
function tchMvBtn(eventStr,tevt,btnNode) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var btnId = btnNode.id;
	var isShift = tevt.shiftKey;
	var btnNum = parseInt(btnId.slice(btnId.indexOf("Btn") + 3));
	var btnDig1 = btnNum % 10;
	var tchX = parseInt(tevt.changedTouches[0].clientX);  // x,y coordinates of first touch point
	var tchY = parseInt(tevt.changedTouches[0].clientY);
	switch (eventStr) {
		case "touchstart" :
			glbNoTch = false;  // 4/06/20 => used to determine if touch-screen device is in use 
			sldMvBtnDown(btnNum,isShift,btnNode);
			if (glbWait) { 
						// 12/01/19 => try to eliminate :hover background by explicitly setting background
				if ((btnDig1 == 1) || (btnDig1 == 6)) { 
					btnNode.style.backgroundColor = "rgba(224,224,224,0.8)"; 
					}
				else if (btnDig1 == 2) { btnNode.style.backgroundColor = "rgb(224,224,224)";}
				else {
					alert("tchMvBtn(): button #" + btnNum + " is NOT a move button."
							+ "\n  Please report this bug.");
					}
						// display "wait" icons
				glbTchWaitMenuTimer.tchId = tevt.changedTouches[0].identifier;		
				tchWaitBtnSetup(tchX,tchY);  // display "wait" icons
				}
			else { // not in wait state ... make certain wait timer is off
				if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
				glbTchWaitMenuTimer.tchId = Number.NaN;
				}
			break;
		case "touchend":
		case "touchcancel":
			sldMvBtnUp(btnNum,btnNode);  // this sets background to :hover color
			if ((btnDig1 == 1) || (btnDig1 == 6)) {  // navigator "normal" background color
				btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";
				}
			else if (btnDig1 == 2) { 
				btnNode.style.backgroundColor = "rgb(224,224,224)";
				}
			else {
				alert("tchMvBtn(): button #" + btnNum + " is NOT a move button."
						+ "\n  Please report this bug.");
				}
					// 4/05/20; leave wait icons spinning until sldUnWait() is called
			if (glbWait) {   // in wait state => change glbTchWaitMenuTimer.tchId
				if (glbTchWaitMenuTimer.tchId == tevt.changedTouches[0].identifier) {
					glbTchWaitMenuTimer.tchId = Number.NaN;
					}
				}
					// tchWaitMenuIconOff() turns-off "wait"-icon, but doesn't reset glbTchWaitMenuTimer.tchId
					//	if move-button was down on "wait" state exit, need to reset glbTchWaitMenuTimer.tchId
			else {  // not in wait-state: check to make certain that "wait" icon is off
				if (!Number.isNaN(glbTchWaitMenuTimer.tchId)) { // exitted wait-state with button down 
					if (glbTchWaitMenuTimer.tchId != tevt.changedTouches[0].identifier) {
							warnBoxCall(false,"Too many fingers?","<b>tchMvBtn():</b> &nbsp;The finger was lifted off the menu "
								+ "or navigator is not the finger that had been touching the menu/navigator.");
						}
					glbTchWaitMenuTimer.tchId = Number.NaN;
					}
					// check to make certain timer is off
				if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
				}
			break;
		default :
			alert("tchMvBtn(): unknown TouchEvent (\"" + eventStr + "\")."
					+ "\n\n  This probably is a fatal error.  Please report this bug.");
		}
	return
	}


//			***********************************************************
//			*********        "wait navigator buttons        ***********
//			*********           "wait menu buttons          ***********
//			***********************************************************

	// load event handlers for navigator & menu buttons that are NOT move buttons but are
	//	inactive before slideView initialization and during the "wait" state.
function tchWaitBtnInit() {
	var i;
	var btnNode;  // 'pointer' to button
	var btnLst = [
			"navFPbtn11",
			"navFPbtn21",
			"navFocStartCycle",
			"navZbtn11",
			"navZbtn21",
			"menuZBtn12",
			"menuZBtn22",
			"menuFBtn12",
			"menuFBtn22",
			"menuFocStartCycle",
			"menuRealignFoc",
			"menuGotoBtn"
			];
	var lstSz = btnLst.length;
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(btnLst[i]);
		if (btnNode == null) {
			alert("tchNavInit():  could find \"" + btnLst[i] + "\".  No event handlers were attached.");
			continue;
			}
		btnNode.addEventListener("touchstart",function() {tchWaitBtnDwn(event,this);});	
		btnNode.addEventListener("touchmove",function() {tchWaitBtnMv(event);});
		btnNode.addEventListener("touchend",function() {tchWaitBtnUp(event,this);});
		btnNode.addEventListener("touchcancel",function() {tchWaitBtnUp(event,this);});	
		}
	return;
	}

	//except for movment buttons, the navigator & menu buttons are "click" buttons:
	//	--	touching the button (touchstart) with a finger should change the color/background color of the button
	//	--	releasing the button (touchedn) should reset color/background color to default and should initiate a click
	//	However, the "wait" buttons are inactive during "wait" state, so touching (tchWaitBtnDwn()) doesn't change 
	//		button colors, but it does display the "wait" clock 'icons'
	//	There are three "tchWaitBtn" functions: 
	//	 >>	tchWaitBtnDwn() will be called on a touchstart event:
	//			if not "wait" state tcgWaitBtnDwn() only changes the button colors and returns
	//			if "wait" state, calls tchWaitBtnMv() to position clock-icons, & turn-on the clock-icons, and then returns
	//				(without changing button colors.
	//	 >>	tchWaitBtnMv() will be called on a touchmove event.  During a "wait" state, it adjusts the location of the clock
	//			icons.  If not "wait", it returns without doing anything.
	//	 >>	tchWaitBtnUp() will be called on a touchend event:
	//			if "wait" state, turns off the clock-icons, and then returns
	//				(without changing button colors.
	//			if not "wait" state, changes button colors and calls appropriate function to effect the "onClick" event
function tchWaitBtnDwn(tchEvt,btnNode) {
	tchEvt.preventDefault();
	glbNoTch = false;  // 4/06/20 => used to determine if touch-screen device is in use 
	var tchX = parseInt(tchEvt.changedTouches[0].clientX);  // x,y coordinates of first touch point
	var tchY = parseInt(tchEvt.changedTouches[0].clientY);
	var isNav = false;
	if (btnNode.id.slice(0,3) == "nav") {isNav = true; }
	var isSVInit = false;
	if (document.getElementById("sldBndBox").style.display == "block") { isSVInit = true;}
	if (glbWait || !isSVInit) {  // set button colors, wait-icon, and return without doing anything
			// for some reason, we sometimes seem to get the :hover colors
			//	12/01/19 => try force correct behavior by explicitly re-stating the colors
		if (isNav) { btnNode.style.backgroundColor = "rgba(224,224,224,0.8)"; }
		else { btnNode.style.backgroundColor = "rgb(224,224,224)"; }
			// 4/05/20: tchWaitBtnUp() no longer turns off "wait" icon; only turn on "wait" icon if not already on
		if (glbWait) {  // make tchId current touch; move wait icon
			glbTchWaitMenuTimer.tchId = tchEvt.changedTouches[0].identifier;
			tchWaitBtnSetup(tchX,tchY);
			}
		return; 
		}
	else {  // not in "wait" state; make certain timer is off 
		if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
		glbTchWaitMenuTimer.tchId = Number.NaN;
		}
	if (isNav) {
		btnNode.style.backgroundColor = "rgba(224,160,160,0.8)";
		btnNode.style.color = "rgb(160,0,0)";
		}
	else {
		btnNode.style.backgroundColor = "rgb(226,160,160)";
		btnNode.style.color = "rgb(192,0,0)";
		}
	return;
	}

	// 4/05/20 => added if !glbWait ... this function is called regardless of wait state
function tchWaitBtnMv(tchEvt) {
	tchEvt.preventDefault();
//	tchEvt.stopPropagation();  // 4/05/20 commented out, probably not needed
	if (!glbWait) { return; }
	if (tchEvt.changedTouches[0].identifier != glbTchWaitMenuTimer.tchId) { return; }
	var tchX = parseInt(tchEvt.changedTouches[0].clientX);  // x,y coordinates of first touch point
	var tchY = parseInt(tchEvt.changedTouches[0].clientY);
	tchWaitBtnSetup(tchX,tchY);
	return;
	}

	// 4/05/20:  rewrite tchWaitBtnSetup()
	//  Function is now passed only x,y coordinates of touchpoint
	//	calculates & sets coordinates for clk3 & clk4;
	//	if glbTchWaitMenuTimer.id == NaN => function starts timer
function tchWaitBtnSetup(tchX, tchY) {
	if (!glbWait) {
			// turn-off "wait" icon if it is on
		if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
		return;
		}
	var xOffset = 50;  // number of pixels between finger and clock
	var clkWid = 34;  // width of clock
	var margin = 4;  // number of pixels between clock and edge of window
	var scrWidth = parseInt(window.innerWidth);  // screen size minus 4px margin
	var clkEdge;
	var yPos = tchY - Math.round(clkWid/2);
			// set coordinates for clk3
	var xPos = tchX - xOffset - clkWid - margin;
	if (xPos > 0 ) {
		clkEdge = tchX - xOffset - clkWid;
		document.getElementById("tchWaitClk3").style.left = clkEdge + "px";
		document.getElementById("tchWaitClk3").style.top = yPos + "px";
		document.getElementById("tchWaitClk3").style.display = "block";
		}
	else { document.getElementById("tchWaitClk3").style.display = "none"; }
			// set coordinates for clk4
	xPos= tchX + xOffset + clkWid + margin;
	if (xPos < scrWidth ) {
		clkEdge = tchX + xOffset;
		document.getElementById("tchWaitClk4").style.left = clkEdge + "px";
		document.getElementById("tchWaitClk4").style.top = yPos + "px";
		document.getElementById("tchWaitClk4").style.display = "block";
		}
	else { document.getElementById("tchWaitClk4").style.display = "none"; }
			// if not open, start timer
	if (Number.isNaN(glbTchWaitMenuTimer.id)) {
		tchMenuClkAdvance();
		glbTchWaitMenuTimer.id = window.setInterval(tchMenuClkAdvance,glbTchWaitClkInterval);
		}
	return;
	}
	
	// advances clockface on menu/navigator "wait" timer
	//	Because of interference between timers, we need a function that is distinct
	//		from the function (tchClkIconAdv()) that advances the 2-finger wait-icon on slideView 
function tchMenuClkAdvance() {
	var curClk = glbTchWaitMenuTimer.clkNum + 1;  // old clock face from timer object and advance by 1
	if (curClk > 7) { curClk = 0; }  // if clock has made a revolution, reset clock face to 12:00
	var srcStr = "../images/wClk" + curClk + ".png";
	document.getElementById("tchWaitClk3").src = srcStr;
	document.getElementById("tchWaitClk4").src = srcStr;
	glbTchWaitMenuTimer.clkNum = curClk;
	return;
	}

	// tchWaitMenuIconOff() turns off the wait-icons associated with menu or navigator
	//	buttons that are inactive during a "wait" interval
function tchWaitMenuIconOff() {
		// turn-off timer
	var timerId = glbTchWaitMenuTimer.id;
	if (!Number.isNaN(timerId)) {
		window.clearInterval(timerId);
		glbTchWaitMenuTimer.id = Number.NaN;
		}
		// hide icons
	document.getElementById("tchWaitClk3").style.display = "none";
	document.getElementById("tchWaitClk4").style.display = "none";
		// reset clock face
	glbTchWaitMenuTimer.clkNum = 0;
		// 4/05/20 => glbTchWaitMenuTimer.tchId is NOT reset -> next touch event needs to reset it!
	return;
	}

	// isTchTarget() reads through tchArr[] comparing tchArr[].target with curNode.
	//	if tchId == NaN, returns true if a match is found;
	//	if tchId != NaN, returns true if match is found and tchId == tchArr[].identifier
function isTchTarget(tchArr,curNode,tchId) {
	var i;
	var arrSz = tchArr.length;
	for (i = 0; i < arrSz; i++) {
		if (tchArr[i].target = curNode) {
			if (Number.isNaN(tchId)) { return(true); }
			else if (tchArr[i].identifier == tchId) { return(true); }
			}
		}
	return(false);
	}
		
	
function tchWaitBtnUp(tchEvt,btnNode) {
	tchEvt.preventDefault();
		// reset button color regardless of wait state
	var isNav = false;
	if (btnNode.id.slice(0,3) == "nav") {isNav = true; }
	if (isNav) { btnNode.style.backgroundColor = "rgba(224,224,224,0.8)"; }
	else { btnNode.style.backgroundColor = "rgb(224,224,224)"; }
	btnNode.style.color = "black";
	
	var isTchBtn = isTchTarget(tchEvt.touches,btnNode,glbTchWaitMenuTimer.tchId);  // set to true if tchId belongs to btnNode
	var isTchId = false;
	if (tchEvt.changedTouches[0].identifier == glbTchWaitMenuTimer.tchId) { isTchId = true; }
			// 4/05/20 => if button-up during "wait", set tchId = NaN but leave wait-icon running
	if (glbWait) {
		if (isTchBtn || isTchId) {  // finger-up was wait-timer's tchId
			glbTchWaitMenuTimer.tchId = Number.NaN;
			}
		}
	else if (!Number.isNaN(glbTchWaitMenuTimer.tchId)) { // No longer in wait-state, but tchId not yet reset
		if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); } // timer should be off, but check
		glbTchWaitMenuTimer.tchId = Number.NaN;
		if (isTchBtn || isTchId) { return; }  // don't do any action if button was down during wait state, but came up after wait state ended
		}
	var btnId = btnNode.id
	switch (btnId) {
		case "navFPbtn11" : sldFPBtnClk(11);
			break;
		case "menuFBtn12" : sldFPBtnClk(12);
			break;
		case "navFPbtn21" : sldFPBtnClk(21);
			break;
		case "menuFBtn22" : sldFPBtnClk(22);
			break;
		case "navFocStartCycle"	: 
		case "menuFocStartCycle": sldStrtFCyc();
			break;
		case "menuRealignFoc" : sldRealignSldVw(sldVwI);
			break;
		case "navZbtn11" : sldZBtnClk(11);
			break;
		case "menuZBtn12": sldZBtnClk(12);
			break;
		case "navZbtn21" : sldZBtnClk(21);
			break;
		case "menuZBtn22": sldZBtnClk(22);
			break;
		case "menuGotoBtn" : gotoOpen();
			break;
		default : alert("tchWaitBtnUp(): could not identify button \"" + btnId + "\".\n  No action was taken.");
		}
	return;
	}



//			**************************************************************
//			*********        "NO wait navigator buttons        ***********
//			*********           "NO wait menu buttons          ***********
//			**************************************************************

		//  In addition to "move" and "wait" buttons which are inactive both prior to slideView initialization 
		//		and during a "wait" state, ere also are several menu and navigator buttons which are inactive
		//		prior to slideView initialization, but remain active during a "wait" state.  These button are the
		//		"noWait" buttons.  The "move" and "wait" buttons differ in that "move" buttons become active on 
		//		a mousedown or touchstart event, while the "wait" buttons respond to an onClick event (which 
		//		comes after the mouseUp event) or a touchend event.  The "noWait" buttons are similar to the
		//		"wait" buttons in they are activated by an onClick or touchend event.  For mouse actions,
		//		these buttons are handled by the "menuBtnNoWaitOver()", "menuBtnNoWaitUp()",
		//		"menuBtnNoWaitDown()", and "menuBtnNoWaitOut()" functions.
		//	For the mouse for "menuNavVis", "menuCreditVis", "navMusWhlFBox", & "navMusWhlZBox" I had to attach 
		//		the "onClick" command to both the <div> and the <input> boxes.  I've done the same here.
		//  NOTE:  "navMusWhlFBox" & "navMusWhlZBox" technically are clickable buttons.  However, since all the
		//		other clickable buttons are menu items, it saves having to test clickable items for navigator
		//		background colors if we include "navMusWhlFBox" & "navMusWhlZBox" here.  We can include them
		//		here because they are not visible before slideView intialization.
		//	For "navMusWhlFBox" & "navMusWhlZBox", there are theoretically four nodes that could generate an 
		//		onClick or Touch event:  "navMusWhl[F/Z]Box", "navMusWhl[F/Z]xBx", "navMusWhl[F/Z]Txt", and
		//		"navMusWhl[F/Z]Radio".  However, I've tried carefully clicking all over the "navMusWhl[F/Z]Box"
		//		the box and have not generated any "hits" on "navMusWhl[F/Z]xBx".  From earlier playing with 
		//		this, it looks like the signal from "navMusWhl[F/Z]xBx" comes after (bubbles up from) a "hit"
		//		on some other element (I think it was "navMusWhl[F/Z]Txt" or "navMusWhl[F/Z]Radio").  As a 
		//		result, I am NOT including "navMusWhl[F/Z]xBx" in the list of touch-targets
function tchNoWaitBtnInit() {
	var i;
	var btnNode;  // 'pointer' to button
	var btnLst = [
			"menuNavVis",
			"menuNavVisCheckBx",
			"menuNavVisLbl",
			"menuCreditVis",
			"menuCreditCheckBx",
			"menuCreditVisLbl",
			"menuFocStopCycle",
			"navFocStopCycle",
			"navMusWhlFBox",
			"navMusWhlFTxt",
			"navMusWhlFRadio",
			"navMusWhlZBox",
			"navMusWhlZTxt",
			"navMusWhlZRadio"
			];
	var lstSz = btnLst.length;
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(btnLst[i]);
		if (btnNode == null) {
			alert("tchNoWaitInit():  could find \"" + btnLst[i] + "\".  No event handlers were attached.");
			continue;
			}
		btnNode.addEventListener("touchstart",function() {tchNoWaitBtnDwn(event,this);});
		  // may need a touchmove event handler to prevent default touchmove from setting :hover colors
//		btnNode.addEventListener("touchmove",function() {tchNoWaitBtnDwn(event,this););
		btnNode.addEventListener("touchend",function() {tchNoWaitBtnUp(event,this);});
		btnNode.addEventListener("touchcancel",function() {tchNoWaitBtnUp(event,this);});	
		}
	return;
	}

	// tchNoWaitExtNode() finds the extra nodes associated tne NoWait button whose id is btnId.
	//		The function returns up to two nodes as an object {node1: , node2: }.  If fewer than
	//		two nodes are found, the empty nodes are returned as null.
	//	This function replaces an equivalent switch that was duplicated in tchNoWaitBtnDwn()
	//		and tchNoWaitBtnUp()
function tchNoWaitExtNode(btnId) {
	var extNode1 = null;
	var extNode2 = null;
		// for checkboxes, have to explicitly change colors of box, label, and checkbox
	switch (btnId) {
		case "menuNavVisCheckBx" : 
				extNode1 = document.getElementById("menuNavVisLbl");
				extNode2 = document.getElementById("menuNavVis");
				break;
		case "menuNavVisLbl" : 
//				extNode1 = document.getElementById("menuNavVisCheckBx");
				extNode2 = document.getElementById("menuNavVis");
				break;
		case "menuNavVis" :
//				extNode1 = document.getElementById("menuNavVisCheckBx");
				extNode2 = document.getElementById("menuNavVisLbl");
				break;
		case "menuCreditCheckBx" : 
				extNode1 = document.getElementById("menuCreditVisLbl");
				extNode2 = document.getElementById("menuCreditVis");
				break;
		case "menuCreditVisLbl" : 
//				extNode1 = document.getElementById("menuCreditCheckBx");
				extNode2 = document.getElementById("menuCreditVis");
				break;
		case "menuCreditVis" :
//				extNode1 = document.getElementById("menuCreditCheckBx");
				extNode2 = document.getElementById("menuCreditVisLbl");
				break;
		case "navMusWhlFRadio" :
				extNode1 = document.getElementById("navMusWhlFxBx");
				extNode2 = document.getElementById("navMusWhlFBox");
				break;
		case "navMusWhlFTxt" :
//				extNode1 = document.getElementById("navMusWhlFRadio");
				extNode2 = document.getElementById("navMusWhlFBox");
				break;
		case "navMusWhlFBox" :
				extNode1 = document.getElementById("navMusWhlFxBx");
//				extNode2 = document.getElementById("navMusWhlFRadio");
				break;
		case "navMusWhlZRadio" :
				extNode1 = document.getElementById("navMusWhlZxBx");
				extNode2 = document.getElementById("navMusWhlFBox");
				break;
		case "navMusWhlZTxt" :
//				extNode1 = document.getElementById("navMusWhlZRadio");
				extNode2 = document.getElementById("navMusWhlZBox");
				break;
		case "navMusWhlZBox" :
				extNode1 = document.getElementById("navMusWhlZxBx");
//				extNode2 = document.getElementById("navMusWhlZRadio");
				break;
		}
	var extraObj = {node1: extNode1, node2: extNode2};
	return(extraObj);
	}

	//	NOTE: the background color of "navMusWhl[F/Z]Txt" is "transparent", changes to
	//		background color probably need to be done to "navMusWhl[F/Z]xBx"
function tchNoWaitBtnDwn(tchEvt,btnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
	glbNoTch = false;  // 4/06/20 => used to determine if touch-screen device is in use 
	var btnId = btnNode.id;
	var extraN = tchNoWaitExtNode(btnId);  // returns object containing two extra nodes: {node1: , node2:}
	var isNav = false;
	if (btnId.slice(0,3) == "nav") {isNav = true; }
	var isSVInit = false;
	if (document.getElementById("sldBndBox").style.display == "block") { isSVInit = true;}
	if (!isSVInit) { 
			// sometimes get the :hover colors => explicitly state colors to force correct behavior
		if (isNav) { return; } // navigator is hidden, don't waste effort changing colors
		else {
			if ((btnNode.tagName.toLowerCase() == "input") 
					&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
					|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
				btnNode.style.backgroundColor = "";
				}
			else { btnNode.style.backgroundColor = "rgb(224,224,224)"; }
			if (extraN.node1 != null) { extraN.node1.style.backgroundColor = "rgb(224,224,224)"; }
			if (extraN.node2 != null) { extraN.node2.style.backgroundColor = "rgb(224,224,224)"; }
			}
		return; 
		}
	if (isNav) {
				// "navMusWhl[F/Z]Txt" is transparent background, change "navMusWhl[F/Z]xBx" instead
		if (btnId == "navMusWhlFTxt") {
			document.getElementById("navMusWhlFxBx").style.backgroundColor = "rgba(224,160,160,0.8)";
			}
		else if (btnId == "navMusWhlZTxt") {
			document.getElementById("navMusWhlZxBx").style.backgroundColor = "rgba(224,160,160,0.8)";
			}
		else if ((btnNode.tagName.toLowerCase() == "input") 
					&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
					|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
			btnNode.style.backgroundColor = "";
			}
		else { btnNode.style.backgroundColor = "rgba(224,160,160,0.8)"; }
		btnNode.style.color = "rgb(160,0,0)";
		if (extraN.node1 != null) {
			extraN.node1.style.backgroundColor = "rgba(224,160,160,0.8)";
			extraN.node1.style.color = "rgb(160,0,0)"; 
			}
		if (extraN.node2 != null) {
			extraN.node2.style.backgroundColor = "rgba(224,160,160,0.8)";
			extraN.node2.style.color = "rgb(160,0,0)"; 
			}
		}
	else { 
		if ((btnNode.tagName.toLowerCase() == "input") 
					&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
					|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
			btnNode.style.backgroundColor = "";
			}
		else { btnNode.style.backgroundColor = "rgb(226,160,160)"; }
		btnNode.style.color = "rgb(192,0,0)";
		if (extraN.node1 != null) {
			extraN.node1.style.backgroundColor = "rgb(226,160,160)";
			extraN.node1.style.color = "rgb(192,0,0)";
			}
		if (extraN.node2 != null) {
			extraN.node2.style.backgroundColor = "rgb(226,160,160)";
			extraN.node2.style.color = "rgb(192,0,0)";
			}
		}
	return;
	}
	
function tchNoWaitBtnUp(tchEvt,btnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
	var btnId = btnNode.id;
	var extraN = tchNoWaitExtNode(btnId);  // returns object containing two extra nodes: {node1: , node2:}
	var isNav = false;
	if (btnId.slice(0,3) == "nav") {isNav = true; }
			// change colors
	if (isNav) {
				// "navMusWhl[F/Z]Txt" is transparent background, change "navMusWhl[F/Z]xBx" instead
		if (btnId == "navMusWhlFTxt") {
			document.getElementById("navMusWhlFxBx").style.backgroundColor = "rgba(224,224,224,0.8)";
			}
		else if (btnId == "navMusWhlZTxt") {
			document.getElementById("navMusWhlZxBx").style.backgroundColor = "rgba(224,224,224,0.8)";
			}
		else if ((btnNode.tagName.toLowerCase() == "input") 
					&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
					|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
			btnNode.style.backgroundColor = "";
			}
		else { btnNode.style.backgroundColor = "rgba(224,224,224,0.8)"; }
		if (extraN.node1 != null) { extraN.node1.style.backgroundColor = "rgba(224,224,224,0.8)"; }
		if (extraN.node2 != null) { extraN.node2.style.backgroundColor = "rgba(224,224,224,0.8)"; }
		}
	else {
		if ((btnNode.tagName.toLowerCase() == "input") 
					&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
					|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
			btnNode.style.backgroundColor = "";
			}
		else { btnNode.style.backgroundColor = "rgb(224,224,224)"; }
		if (extraN.node1 != null) { extraN.node1.style.backgroundColor = "rgb(224,224,224)"; }
		if (extraN.node2 != null) { extraN.node2.style.backgroundColor = "rgb(224,224,224)"; }
		}
	btnNode.style.color = "black";
	if (extraN.node1 != null) { extraN.node1.style.color = "black"; }
	if (extraN.node2 != null) { extraN.node2.style.color = "black"; }
			// call "onClick" effector functions
	switch (btnId) {
		case "menuNavVisCheckBx" : 
		case "menuNavVisLbl" : 
		case "menuNavVis" : menuSetVisChkBx(tchEvt,'menuNavVisCheckBx');
			break;
		case "menuCreditCheckBx" : 
		case "menuCreditVisLbl" : 
		case "menuCreditVis" : menuSetVisChkBx(tchEvt,'menuCreditCheckBx');
			break;
		case "menuFocStopCycle": 
		case "navFocStopCycle" : sldStopFCyc();
			break;
		case "navMusWhlFRadio" : 
		case "navMusWhlFTxt" : 
		case "navMusWhlFBox" : sldMusWheelSelect(tchEvt,'f');
			break;
		case "navMusWhlZRadio" : 
		case "navMusWhlZTxt" : 
		case "navMusWhlZBox" : sldMusWheelSelect(tchEvt,'z');
			break;
		default : alert("tchNoWaitBtnUp: could not identify button \"" + btnId + "\".\n  No action was taken.");
		}
	return;
	}



//			*********************************************************
//			*********       clickable menu buttons        ***********
//			*********************************************************
		// "clicable" buttons (class = "menuClickable", are always activatable, and respond to
		//		mouse actions via an "onClick" event.
		//	The colors of these buttons are defined by the 'normal', :hover, and :active pseudo-classes 
		//		defined in jrscp.StyleMain.css.  As a result, the "UP" state (touchend) of a touch-event
		//		should reset the text color and backgroundColor to an empty string, for situations where
		//		the user has a mouse and a touch-screen. 


function tchClkBtnInit() {
	var i;
	var btnNode;  // 'pointer' to button
	var btnLst = [
				"menuSldNmMenuVis",		// start of VIEW MENU
				"menuSldNmVisCheckBx",	// children of "menuSldNmMenuVis" => same issues as for NoWait buttons
				"menuSldNmVisLbl",		// children of "menuSldNmMenuVis" => same issues as for NoWait buttons
				"menuFMenuVis",	
				"menuFVisCheckBx",	// children of "menuFMenuVis" => same issues as for NoWait buttons
				"menuFVisLbl",		// children of "menuFMenuVis" => same issues as for NoWait buttons
				"menuZMenuVis",
				"menuZVisCheckBx",	// children of "menuZMenuVis"
				"menuZVisLbl",	 	// children of "menuZMenuVis"
				"menuXYMenuVis",
				"menuXYVisCheckBx",	// children of "menuXYMenuVis"
				"menuXYVisLbl", 	// children of "menuXYMenuVis"
				"menuMusWhlFBox",
				"menuMusWhlFRadio",	// children of "menuMusWhlFBox"
				"menuMusWhlFTxt",	// children of "menuMusWhlFBox"
				"menuMusWhlZBox",
				"menuMusWhlZRadio",	// children of "menuMusWhlZBox"
				"menuMusWhlZTxt",	// children of "menuMusWhlZBox"
				"menuFChgSet",			// start of SETTINGS MENU
				"menuEnDisableF",
				"menuDisEnableBell",
				"menuBellNote",		// children of "menuDisEnableBell"
				"menuBellOnOffTxt",	// children of "menuDisEnableBell"
				"menuMvArrowDir",
				"menuMvArrowTxt",	// child of "menuMvArrowDir"
				"menuResetTch",
				"menuCacheSz",
				"menuCacheList",
				"menuClearCache",
				"menuSldVwList",
				"menuShwTiles",
				"menuRestrictF",
				"menuClearDestArr",
				"menuChgSet",
				"menuAboutMicroscope",	// start of ABOUT MENU
				"menuAboutPNWU",
				"menuMorePNWU",
				"menuSponsors",
				"menuVirSlides",
				"menuScanSlides",
				"menuAboutMusCntrl",
				"menuAboutTchScr"
				];
	var lstSz = btnLst.length;
	for (i = 0; i < lstSz; i++ ) {
		btnNode = document.getElementById(btnLst[i]);
		if (btnNode == null) {
			alert("tchClkBtnInit():  could find \"" + btnLst[i] + "\".  No event handlers were attached.");
			continue;
			}
		btnNode.addEventListener("touchstart",tchClkBtnDwn);
		btnNode.addEventListener("touchend",tchClkBtnUp);
		btnNode.addEventListener("touchcancel",tchClkBtnUp);	
		}
	return;
	}


	// tchClkExtNode() finds the extra nodes associated tne 'clickable' button whose id is btnId.
	//		The function returns up to two nodes as an object {node1: , node2: }.  If fewer than
	//		two nodes are found, the empty nodes are returned as null.
	//	This function obviates the need to have this very long switch in both the "Dwn" and "Up"
	//		functions
function tchClkExtNode(btnId) {
	var extNode1 = null;
	var extNode2 = null;
	switch (btnId) {
		case "menuSldNmMenuVis" : 
				extNode1 = document.getElementById("menuSldNmVisLbl");
				break;
		case "menuSldNmVisCheckBx" : 
				extNode1 = document.getElementById("menuSldNmVisLbl");
				extNode2 = document.getElementById("menuSldNmMenuVis");
				break;
		case "menuSldNmVisLbl" : 
				extNode1 = document.getElementById("menuSldNmMenuVis");
				break;
		case "menuFMenuVis" : 
				extNode1 = document.getElementById("menuFVisLbl");
				break;
		case "menuFVisCheckBx" : 
				extNode1 = document.getElementById("menuFVisLbl");
				extNode2 = document.getElementById("menuFMenuVis");
				break;
		case "menuFVisLbl" : 
				extNode1 = document.getElementById("menuFMenuVis");
				break;
		case "menuZMenuVis" : 
				extNode1 = document.getElementById("menuZVisLbl");
				break;
		case "menuZVisCheckBx" : 
				extNode1 = document.getElementById("menuZVisLbl");
				extNode2 = document.getElementById("menuZMenuVis");
				break;
		case "menuZVisLbl" : 
				extNode1 = document.getElementById("menuZMenuVis");
				break;
		case "menuXYMenuVis" : 
				extNode1 = document.getElementById("menuXYVisLbl");
				break;
		case "menuXYVisCheckBx" : 
				extNode1 = document.getElementById("menuXYVisLbl");
				extNode2 = document.getElementById("menuXYMenuVis");
				break;
		case "menuXYVisLbl" : 
				extNode1 = document.getElementById("menuXYMenuVis");
				break;
		case "menuMusWhlFBox" : 
//				extNode1 = document.getElementById("menuMusWhlFRadio");
				extNode2 = document.getElementById("menuMusWhlFTxt");
				break;
		case "menuMusWhlFRadio" : 
				extNode1 = document.getElementById("menuMusWhlFTxt");
				extNode2 = document.getElementById("menuMusWhlFBox");
				break;
		case "menuMusWhlFTxt" : 
//				extNode1 = document.getElementById("menuMusWhlFRadio");
				extNode2 = document.getElementById("menuMusWhlFBox");
				break;
		case "menuMusWhlZBox" : 
//				extNode1 = document.getElementById("menuMusWhlZRadio");
				extNode2 = document.getElementById("menuMusWhlZTxt");
				break;
		case "menuMusWhlZRadio" : 
				extNode1 = document.getElementById("menuMusWhlZTxt");
				extNode2 = document.getElementById("menuMusWhlZBox");
				break;
		case "menuMusWhlZTxt" : 
//				extNode1 = document.getElementById("menuMusWhlZRadio");
				extNode2 = document.getElementById("menuMusWhlZBox");
				break;
		case "menuDisEnableBell" : 
				extNode1 = document.getElementById("menuBellNote");
				extNode2 = document.getElementById("menuBellOnOffTxt");
				break;
		case "menuBellNote" : 
				extNode1 = document.getElementById("menuDisEnableBell");
				extNode2 = document.getElementById("menuBellOnOffTxt");
				break;
		case "menuBellOnOffTxt" : 
				extNode1 = document.getElementById("menuDisEnableBell");
				extNode2 = document.getElementById("menuBellNote");
				break;
		case "menuMvArrowDir" : 
				extNode1 = document.getElementById("menuMvArrowTxt");
				break;
		case "menuMvArrowTxt" : 
				extNode1 = document.getElementById("menuMvArrowDir");
				break;
		}
	var extraObj = {node1: extNode1, node2: extNode2};
	return(extraObj);
	}

	// tchClkBtnDwn() handles a touchstart event on a "clickable" menu item.  Since the "onClick" event occurs
	//		after mouseUp/touchend, tchClkBtnDwn() only changes the color of the button.
function tchClkBtnDwn(tchEvt) {
	tchEvt.preventDefault();
//	tchEvt.stopPropagation();
	var btnNode = tchEvt.target;
		// if clicked on <b> (bold font) tag, use parent 
	if ((btnNode.id == "") && (btnNode.tagName.toLowerCase() == "b")) {
		btnNode = btnNode.parentNode;
		}
	var btnId = btnNode.id;
	var btnType = "";
	var extraN = tchClkExtNode(btnId);  // returns object {node1:, node2: } containing extra nodes
		// use default background if actual 'checkbox' or 'radio' icon-tag
	if ((btnNode.tagName.toLowerCase() == "input") 
			&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
			|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
		btnNode.style.backgroundColor = "";
		}
	else { btnNode.style.backgroundColor = "rgb(226,160,160)"; }
	btnNode.style.color = "rgb(192,0,0)";
	if (extraN.node1 != null) {
		extraN.node1.style.backgroundColor = "rgb(226,160,160)";
		extraN.node1.style.color = "rgb(192,0,0)";
		}
	if (extraN.node2 != null) {
		extraN.node2.style.backgroundColor = "rgb(226,160,160)";
		extraN.node2.style.color = "rgb(192,0,0)";
		}
	glbTchMenuFree = false;
	return;
	}

	// A "click" is a combination of a mousedown & mouseup event and is sent after the mouseup event.
	//	The 'touchend' event is the touchscreen equivalent to 'mouseup' and is the closest we get to
	//		a touchscreen 'click'.  tchClkBtnUp() executes at touchscreen 'click' on "clickable" menu
	//		items (class="menuClickable").
function tchClkBtnUp(tchEvt) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
	var btnNode = tchEvt.target;
	while ((btnNode.id == "") && (btnNode.tagName.toLowerCase() == "b")) {
		btnNode = btnNode.parentNode;
		}
	var btnId = btnNode.id;
	var extraN = tchClkExtNode(btnId);  // returns object {node1:, node2: } containing extra nodes
				// reset colors.
		// use default background if actual 'checkbox' or 'radio' icon-tag
	if ((btnNode.tagName.toLowerCase() == "input")
			&& ((btnNode.getAttribute("type").toLowerCase() == "checkbox")
			|| (btnNode.getAttribute("type").toLowerCase() == "radio"))) {
		btnNode.style.backgroundColor = "";
		}
	else { btnNode.style.backgroundColor = "rgb(224,224,224)"; }  // force default color
	btnNode.style.color = "black";
	if (extraN.node1 != null) {
		extraN.node1.style.backgroundColor = "rgb(224,224,224)";
		extraN.node1.style.color = "black";
		}
	if (extraN.node2 != null) {
		extraN.node2.style.backgroundColor = "rgb(224,224,224)";
		extraN.node2.style.color = "black";
		}
			// call "onClick" effector functions
	switch (btnId) {
		case "menuSldNmVisCheckBx" : 
		case "menuSldNmVisLbl" : 
		case "menuSldNmMenuVis" : menuSetVisChkBx(tchEvt,'menuSldNmVisCheckBx');
			break;
		case "menuFVisCheckBx" : 
		case "menuFVisLbl" : 
		case "menuFMenuVis" : menuSetVisChkBx(tchEvt,'menuFVisCheckBx');
			break;
		case "menuZVisCheckBx" : 
		case "menuZVisLbl" : 
		case "menuZMenuVis" : menuSetVisChkBx(tchEvt,'menuZVisCheckBx');
			break;
		case "menuXYVisCheckBx" : 
		case "menuXYVisLbl" : 
		case "menuXYMenuVis" : menuSetVisChkBx(tchEvt,'menuXYVisCheckBx');
			break;
		case "menuMusWhlFRadio" : 
		case "menuMusWhlFTxt" : 
		case "menuMusWhlFBox" : sldMusWheelSelect(tchEvt,'f');
			break;
		case "menuMusWhlZRadio" : 
		case "menuMusWhlZTxt" : 
		case "menuMusWhlZBox" : sldMusWheelSelect(tchEvt,'z');
			break;
		case "menuFChgSet" : chgBuildSubSetBox(2.5);
			break;
		case "menuEnDisableF" : sldEnDisableF();
			break;
		case "menuDisEnableBell" :
		case "menuBellNote":
		case "menuBellOnOffTxt" : menuSetBell();
			break;
		case "menuMvArrowDir":
		case "menuMvArrowTxt" : menuChgMvArrowDir();
			break;
		case "menuResetTch": menuClearTchArr();
			break;
		case "menuCacheSz" : menuUpdtCacheSz();
			break;
		case "menuCacheList" : menuShowCacheList();
			break;
		case "menuClearCache" : sldClearCache();
			break;
		case "menuSldVwList" : menuShowSldVwList();
			break;
		case "menuShwTiles" : waitBoxOpen();
			break;
		case "menuRestrictF" : sldRestrictFZ(false,true);
			break;
		case "menuClearDestArr" : destClearArr();
			break;
		case "menuChgSet": chgBuildAllSetBox();
			break;
		case "menuAboutMicroscope" : aboutMicroscopeOpen();
			break;
		case "menuAboutPNWU" : aboutPNWUOpen();
			break;
		case "menuMorePNWU" : window.open('https://www.pnwu.edu/inside-pnwu/about-us','_blank');
			break;
		case "menuSponsors" : aboutSponsorOpen();
			break;
		case "menuVirSlides" : aboutVirSlidesOpen();
			break;
		case "menuScanSlides" : aboutScanSlidesOpen();
			break;
		case "menuAboutMusCntrl" : aboutMusCntrlOpen();
			break;
		case "menuAboutTchScr" : aboutTchScrOpen();
			break;
		default : alert("tchClkBtnUp: could not identify button \"" + btnId + "\" (parent = \"" + btnNode.parentNode.id + "\"; tagName = \"" + btnNode.tagName + "\").\n  No action was taken.");
		}
	return;
	}



//			*****************************************************
//			*********        main menu buttons        ***********
//			*****************************************************

	// tchClrMenu() is passed a "touchstart" TouchEvent object whenever a finger touches anywhere on the DOM.
	//	It looks to see if the HTML object being touched is on the currently open menu:
	//		If a finger is on the open menu, the function returns without doing anything
	//		If none of the fingers touched the open menu, the open menu is closed and glbVisMenuNode is reset
function tchClrMenu(tchEvt) {
	tchEvt.preventDefault();
			// return if menu isn't open
	if ((glbVisMenuNode.main == null) && (glbVisMenuNode.cont == null)) {return;} // no menu open
	if ((glbVisMenuNode.main == null) || (glbVisMenuNode.cont == null)) { // both should either be null or not-null
		warnBoxCall(false,"Open-menu Error","<b>tchClrMenu():</b> &nbsp;Cannot close menu because "
				+ "only one element of glbVisMenuNode is null.<br> &nbsp;Please report this error.");
		return;
		}
	var i;
	var visMenuObj;  // will hold obhect returned from menuWhich()
	var tchTot = tchEvt.targetTouches;
			// look to see if any fingers are touching the open menu
	for (i = 0; i < tchTot.length; i++) {
		visMenuObj = menuWhich(tchTot[i].target);
			// don't do anything if finger is on open menu
			//	Both main-menu item and "container" elements should match; warn but do not close menu if only one matches
		if ((visMenuObj.main == glbVisMenuNode.main) && (visMenObj.cont == glbVisMenuNode.cont)) { return; }
		if (visMenuObj.main == glbVisMenuNode.main) {
			warnBoxCall(false,"Open-menu Error","<b>tchClrMenu():</b> &nbsp;Only matched main-menu item returned by "
					+ " menuWhich(); \"content\" of drop-down menu did NOT match.<br> &nbsp;Please report this error.");
			return;
			}
		if (visMenuObj.cont == glbVisMenuNode.cont) {
			warnBoxCall(false,"Open-menu Error","<b>tchClrMenu():</b> &nbsp;Only drop-down \"content element\" returned by "
					+ " menuWhich(); main-menu item did NOT match.<br> &nbsp;Please report this error.");
			return;
			}
		}
			// finger not on open menu => close open menu
	glbVisMenuNode.cont.style.display = "none";
	glbVisMenuNode.cont = null;
	glbVisMenuNode.main.style.backgroundColor = "";
	glbVisMenuNode.main = null;
	return;
	}


	// tchMainMenuInit() attaches an "addEventListener" to the main-menu "drop-down" items
function tchMainMenuInit() {
	var i;
	var menuMainLst = document.getElementsByClassName("menuDrpDwnItem"); // list of nodes of all main menu drop-down items
	for (i = 0; i < menuMainLst.length; i++) {
		menuMainLst[i].addEventListener("touchstart",function() {tchMainMenuDwn(event,this);});
		}
	return;
	}


	// touching (with a finger) a non-clickable non-info main menu button should have the same effect as 
	//	hovering over it with the mouse, with the exception that display of the class="menuDrpDwnContent" item
	//	persists until another touchstart event occurs (see tchClrMenu() above for resetting the drop-down menu.
function tchMainMenuDwn(tchEvt,mainMenuNode) {
	tchEvt.preventDefault();
	var i;
	var mainNodeId = mainMenuNode.id;		
					// GET DROP-DOWN CONTENT NODE (contNode)
			// parent of mainMenuNode is the class="menuDrpDwnContainer" 'container' item
			// each class="menuDrpDwnContainer" item should have ONE & ONLY ONE class="menuDrpDwnContent" item
	var cntrNode = mainMenuNode.parentNode;
	var contNode;  // will hold the node of the "menuDrpDwnContent" item that is a sibling of mainMenuNode
	if (cntrNode == null) {
		alert("tchMainMenuDwn():  Could not get the parent-node of main menu item (\"" + mainMenuNode.id 
					+ "\").\n &nbsp;Cannot display menu items.  Please report this fatal error.");
		return;
		}
	var cntrChildLst = cntrNode.childNodes;
	var cntrChildLstSz = cntrChildLst.length;
	for (i = 0; i < cntrChildLstSz; i++) {
		if ( cntrChildLst[i].className == "menuDrpDwnContent" ) {
			contNode = cntrChildLst[i];  // contNode is the node for the drop-down content
			break;
			}
		}
	if (i >= cntrChildLstSz) { // read through list of container's child nodes without finding content node
		alert("tchMainMenuDwn():  Could not find the drop-down content of main menu item (\"" + mainMenuNode.id 
					+ "\").\n &nbsp;Cannot display menu items.  Please report this fatal error.");
		return;
		}
	if (contNode == null) {
		alert("tchMainMenuDwn(): The node for the drop-down content of main menu item (\"" + mainMenuNode.id 
					+ "\") is NULL.\n &nbsp;Cannot display menu items.  Please report this fatal error.");
		return;
		}
			// update the menu if it is supposed to be updated before being displayed.
	if ( mainNodeId == "menuSldInfoDrpDwn") { menuUpdtSlideInfo(); }
	else if ( mainNodeId == "menuSettingDrpDwn") { menuUpdtSettingDisplay(); }
			// if a different menu is displayed, hide it.
	var oldMainNode = glbVisMenuNode.main;
	if ((oldMainNode!= null) && (oldMainNode != mainMenuNode)) {
		oldMainNode.style.backgroundColor = "initial";
		if (glbVisMenuNode.cont != null) { glbVisMenuNode.cont.style.display = "none"; }
		}
			// set background color to :hover
	mainMenuNode.style.backgroundColor = "rgb(64,64,128)";
	contNode.style.display = "block";
	glbVisMenuNode.cont = contNode;
	glbVisMenuNode.main = mainMenuNode;
	return;
	}




//	**********************************************************
//	*********     "Change Setting" box buttons     ***********
//	**********************************************************


	// tchChgBtn() emulates a mouse 'onclick' action on a "Change Settings" stepper button.
	//	This is necessary because mouse-emulation forces a tchMenuUnblock() resetting of all 
	//		clickable menu items.
function tchChgBtn(tevt,btnNode) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var txtAct = tevt.type;
	if (btnNode == null) { alert("tchChgBtn(): button node is null!"); return; }
	if (tevt.target != btnNode) {
		alert("tchChgBtn()\n tevt.target (type = " + tevt.target.nodeType 
				+ ") different from btnNode (type = " + btnNode.nodeType + ")."); 
		}
	switch (txtAct) {
		case "touchstart" :
		case "touchmove":
					// set button colors to active
				btnNode.style.backgroundColor = "rgb(216,168,168)";
				btnNode.style.color = "rgb(184,0,0)";
				btnNode.style.borderColor = "rgb(192,160,160)";
				btnNode.style.borderStyle = "inset";
					// SHOULD I TO SET glbTchMenuFree = false?
				break;
		case "touchend" :
		case "touchcancel" :
					// set button colors to default
				btnNode.style.backgroundColor = "rgb(232,232,232)";
				btnNode.style.color = "black";
				btnNode.style.borderColor = "rgb(192,192,192)";
				btnNode.style.borderStyle = "outset";
					//  I tried re-setting the colors to "" after setting to the defaults
					//		but this didn't seem to work, and the lifetime of the "Change Setting"
					//		windows is so short, that combined mouse & touch use is unlikely.
				chgBtnClk(null,btnNode);
				break;
		default :  warnBoxCall(false,"tchChgBtn()","Undefined action (\"" + txtAct
							+ "\") on \"" + btnNode.id 
							+ "\".<br>&nbsp;&nbsp;Please report this error.");
				break;
		}
	return;
	}	

	// tchChgItm() is intended to prevent any touchevents on the "Change Setting" boxes from
	//		being translated into mouse actions.
function tchChgItm(tevt,itmNode) {
	tevt.preventDefault();
	tevt.stopPropagation();
	itmNode.style.backgroundColor = "rgb(255,240,240)";
	return;
	}

		// tchChgTxtBx() sets the focus to the text-edit box that the user touched
		//	This function is necessary because tchChgItm() traps the touchevent and prevents mouse emulation
		//		(which would have set the focus).  Setting the focus makes the text-edit box active.  On the
		//		iPad, this causes the screen-keyboard to appear.
		//	Since the iPad doesn't seem to have a way to reliably position the cursor within the text-box,
		//		tchChgTxtBx also positions the cursor at the end of the 'text' within the textbox, so the iPad's
		//		backspace key can be used to erase the contents of the box.  It would be better to write code
		//		to move the cursor, but we don't want this project to balloon out-of-control.
		//		We could write code that would allow the keyboard (e.g.,'>' & '<') or touchmove events
		//		to move the cursor within the text-box, but I'll leave that for someone else.
		//	The function currently doesn't distinguish between different types of touchevents.  This could be
		//		done using tevt.type, but it doesn't hurt to setfocus and position cursor twice (touchstart &
		//		touchend) or more every time the user touches the textbox.
function tchChgTxtBx(tevt,inpNode) {
	tevt.preventDefault();
	tevt.stopPropagation();
	if (inpNode == null) {
		alert("tchChgTxtBx(): The node for the text-edit box is null; can\'t select this this box."
				+ "\n\n  Please report this error.");
		return;
		}
	if (tevt.target != inpNode) {
		alert("tchChgTxtBx(): The touchevent target (\"" + tevt.target.id 
				+ "\") is different from the text-edit box (\"" 
				+ inpNode.id + "\").\n\n  Please report this error.");
		}
	inpNode.focus();
	var valStr = inpNode.value.toString();
	var lenStr = valStr.length
	if (lenStr < 0) {
		alert("tchChgTxtBx(): The length (" + lenStr + ") of edit-box value (\"" + valStr 
				+ "\") cannot be less than zero.  Can\'t position the cursor."
				+ "\n\n  Please report this error.");
		return;
		}
	inpNode.setSelectionRange(lenStr,lenStr);
	return;
	}