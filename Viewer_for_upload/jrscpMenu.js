// jrscpMenu.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpMenu.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	The "PNWU Microscope" consists of two parts a Viewer and a SlideBox.  This file 
//		(jrscpMenu.js) is part of the Viewer.  Currently, the Viewer consists 
//		of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheets
//		- 11 javascript files (including jrscpMenu.js)
//		- three PHP files
//	jrscpMenu.js contains javascript functions that control the menu & navigator.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA



//   note:  sldBndBoxMusMv(), which reports (on the menu) the x,y location of the mouse, is in jrscpMove.js 

//       **************************************************************************
//       ***************        general-purpose functions         *****************
//       ***************      that have nowhere else to go        *****************
//       **************************************************************************

		// rather than adapting the menuBtn...() functions to work with the navigator
		//	I decided that it was easier (and probably faster during runtime) to create
		//	a separate, but nearly identical set of navBtn...() functions to control
		//	the color & cursor of navigator items that are disabled during a "wait" interrupt

		//	NOTE:  these navBtn...() functions DO NOT currently HANDLE THE CASE WHERE
		//		slideView is not initialized (sldBndBox.style.display = none) since
		//		the navigator is supposed to be hidden untile slideView is initialized.

function navBtnOver(btnNode) {
		  // button disabled => no hover effect
	if (glbWait) { // no :hover effect if slideView not initialized or waiting
		btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";  
		btnNode.style.color = "black";
		btnNode.style.cursor = "wait";
		}
	else if (glbTchMenuFree) { // button is alive => use :hover effects if not touchscreen
		btnNode.style.color = "black";
		btnNode.style.backgroundColor = "rgba(224,192,192,0.8)";  // :hover color for navigator
		btnNode.style.cursor = "pointer";
		}
	return;
	}

function navBtnDown(btnNode) {
		  // if button disabled => navBtnOver() values should be in effect
	if (!glbWait) { // button is alive
			// for now, do the same thing on BtnDown for both mouse & touch
		btnNode.style.backgroundColor = "rgba(224,160,160,0.8)";  // :active color for nav
		btnNode.style.color = "rgb(160,0,0)";
		// should have cursor = pointer from menuBtnOver
		}
	return;
	}

function navBtnUp(btnNode) {
			// if button disabled => navBtnOver() values should be in effect
			// moues is still over button, use :hover color for navigator
	if (!glbWait) { // button is alive
		if (!glbTchMenuFree) {  //touchevent => no hover if not mouse
			btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";
			}
		else {  // mouse => use :hover color
			btnNode.style.backgroundColor = "rgba(224,192,192,0.8)";
			}
		btnNode.style.color = "black";
		// should have cursor = pointer from navBtnOver()
		}
	return;
	}

function navBtnOut(btnNode) {
	btnNode.style.backgroundColor = "rgba(224,224,224,0.8)";  
	btnNode.style.color = "black";
	if (glbWait) { btnNode.style.cursor = "wait"; }
	else { btnNode.style.cursor = "pointer"; }
	return;
	}





//       ********************************************************************
//       ***************      general  menu functions       *****************
//       ********************************************************************


	// menuWhich() is used to determine which, if any drop-down menu the "target node" (tarNode) belongs.
	//	This function is used by tchClrMenu() to determine whether to hide the currently displayed menu.
	//	If the "target node" belongs to a drop-down menu, the function returns an object containing the 
	//		node of the main-menu item and the node of the drop-down menu's "menuDrpDwnContent" element.
	//	If the "target node" is not a drop-down menu, or a child of a drop-down menu, the function returns null.
	//	This function is passed an HTML element's node (tarNode).  The function checks to see if:
	//	(1) the element belongs to class "menuDrpDwnContent", in which case the function returns tarNode.
	//	(2)	the element belongs to class "menuDrpDwnItem", in shich case the function looks for (and returns)
	//		a sibling node belonging to class "menuDrpDwnContent"
	//	(3) has a parent or ancestor to the ancesNth degree belonging to class "menuDrpDwnContent", in which case
	//		the function returns the parent/ancestor
function menuWhich(tarNode) {
	var contClsNm = "menuDrpDwnContent";  // drop-down "content" class name that we are looking for
	var sibClsNm = "menuDrpDwnItem";	// sibling of drop-down "content" in menu
	var curClsNm = tarNode.className;  // reassigned below; className of current node
	var curNode;
	var nxtNode;
	var loopLim = 1000;  // limit for while loop
	var i;
	var ancesN = 6;  // number of generations that for-loop will look back for a "menuDrpDwnContent" ancestor
	var bodyNode = document.body;  // root (body) node, used as a break in for loop
			// if tarNode is the drop-down menu content element => return tarNode
	if (curClsNm.indexOf(contClsNm) >= 0) { 
		return({main: menuSibNode(tarNode,sibClsNm), cont: tarNode}); 
		}
			// if tarNode a drop-down menu item, look for "content" element among tarNode's siblings
	if (curClsNm.indexOf(sibClsNm) >= 0) {
		return({main: tarNode, cont: menuSibNode(tarNode,contClsNm)});
		}
			// look to see if tarNode is a child of a drop-down content element
	curNode = tarNode.parentNode;
	for (i = 0; i < ancesN; i++) {
		if ((curNode == bodyNode) || (curNode == null)) { break; }  // no more ancestors
		curClsNm = curNode.className;
		if (curClsNm.indexOf(contClsNm) >= 0) { 
			return({main: menuSibNode(curNode,sibClsNm), cont: curNode});
			}
		curNode = curNode.parentNode;
		}
	return({main: null, cont: null}); // not related to drop-down content element
	}

	// This function is passed an HTML node, and a className (as a text string).
	//	The function looks through the siblings of the node that was passed as an argument
	//		for a sibling whose class name matches the sibClsNm string.
	//	The function returns the first node that matches sibClsNm, or null if there isn't a match
function menuSibNode(argNode,sibClsNm) {
	var i;
	var loopLim = 1000;  // limit for while loop
	var curNode = argNode.parentNode.firstElementChild;  // reassigned below; siblings of argNode
	var curClsNm;  // class name of curNode
	i = 0;
	while ((curNode != null) && (i++ < loopLim)) {
		curClsNm = curNode.className;
		if (curClsNm.indexOf(sibClsNm) >= 0) { return(curNode); }
		curNode = curNode.nextElementSibling;
		}
	return(null);
	}


		// menuBtn...() functions handle color & cursor for menu items that are disabled
		//		before slideView initialization and during "wait" interrupts
function menuBtnOver(btnNode) {
	var notInit = false;  // set to true if sldBndBox is NOT displayed
	if (document.getElementById("sldBndBox").style.display != "block") { notInit = true; }
		  // button disabled => no hover effect
	if ((notInit) || (glbWait)) { // no :hover effect if slideView not initialized or waiting
		btnNode.style.backgroundColor = "rgb(224,224,224)";  
		btnNode.style.color = "black";
		if (notInit) { btnNode.style.cursor = "default"; }
		else { btnNode.style.cursor = "wait"; }
		}
	else { // button is alive => use :hover effects
		btnNode.style.color = "black";
		btnNode.style.backgroundColor = "rgb(208,208,224)";  // :hover color for menu
		btnNode.style.cursor = "pointer";
		}
	return;
	}

function menuBtnUp(btnNode) {
	var notInit = false;  // set to true if sldBndBox is NOT displayed
	if (document.getElementById("sldBndBox").style.display != "block") { notInit = true; }
		  // if button disabled => menuBtnOver() values should be in effect
	if ((!notInit) && (!glbWait)) { // button is alive
		btnNode.style.backgroundColor = "rgb(208,208,224)";
		btnNode.style.color = "black";
		// should have cursor = pointer from menuBtnOver
		}
	return;
	}

function menuBtnDown(btnNode) {
	var notInit = false;  // set to true if sldBndBox is NOT displayed
	if (document.getElementById("sldBndBox").style.display != "block") { notInit = true; }
		  // if button disabled => menuBtnOver() values should be in effect
	if ((!notInit) && (!glbWait)) { // button is alive
		btnNode.style.backgroundColor = "rgb(226,160,160)";  // :hover color for menu
		btnNode.style.color = "rgb(192,0,0)";
		// should have cursor = pointer from menuBtnOver
		}
	return;
	}

function menuBtnOut(btnNode) {
	btnNode.style.backgroundColor = "rgb(224,224,224)";  
	btnNode.style.color = "black";
	if (document.getElementById("sldBndBox").style.display != "block") { 
		btnNode.style.cursor = "default";
		}
	else if (glbWait) { btnNode.style.cursor = "wait"; }
	else { btnNode.style.cursor = "pointer"; }
	return;
	}


		// menuBtnNoWait...() functions handle color & cursor for the two menu items 
		//		("Show Navication Controls" and "Show slide source") that are disabled before
		//		slideView initialization, but are still active during "wait" interrupts
function menuBtnNoWaitOver(btnNode) {
	if (document.getElementById("sldBndBox").style.display != "block") { // button disabled => no hover effect
		btnNode.style.backgroundColor = "rgb(224,224,224)";  
		btnNode.style.color = "black";
		btnNode.style.cursor = "default";
		}
	else { // button is alive => use :hover effects
		btnNode.style.color = "black";
		btnNode.style.backgroundColor = "rgb(208,208,224)";  // :hover color for menu
		btnNode.style.cursor = "pointer";
		}
	return;
	}

function menuBtnNoWaitUp(btnNode) {
		  // if button disabled => menuBtnOver() values should be in effect
	if (document.getElementById("sldBndBox").style.display == "block") { 
		btnNode.style.backgroundColor = "rgb(208,208,224)"; 
		btnNode.style.color = "black";
		// should have cursor = pointer from menuBtnOver
		}
	return;
	}

function menuBtnNoWaitDown(btnNode) {
		  // if button disabled => menuBtnOver() values should be in effect
	if (document.getElementById("sldBndBox").style.display == "block") { 
		btnNode.style.backgroundColor = "rgb(226,160,160)";  // :hover color for menu
		btnNode.style.color = "rgb(192,0,0)";
		// should have cursor = pointer from menuBtnOver
		}
	return;
	}

function menuBtnNoWaitOut(btnNode) {
	btnNode.style.backgroundColor = "rgb(224,224,224)";  
	btnNode.style.color = "black";
	if (document.getElementById("sldBndBox").style.display != "block") { 
		btnNode.style.cursor = "default";
		}
	else { btnNode.style.cursor = "pointer"; }
	return;
	}


//       ********************************************************************
//       ***************      specific menu functions       *****************
//       ********************************************************************

	// menuReszTxt() uses style.fontsize = xx% to adjust the font size on overly long
	//	menuInfo item txt strings (obtained from the SQL database by prgGetSldInfo()) 
	//	so that thestring fits into the appropriate box in the Slide Info menu.
	// menuReszTxt() is called by sqlSldInfo(), it is passed the id of <div class="menuInfoWindow">
	// 	into which the txt will be inserted, and the text string.
	// The function uses <div id="txtwdthTestBox"> on IntroPage (which is displayed when 
	//	sqlSldBasics() or sqlSldInfo() returns) and node.offsetWidth to calculate the width of the text.
	// If the width of the text <= the value in wdArr[], the function returns the
	//	original string. Otherwise it returns the original string bracketed by a
	//	<span> that uses font-size:xx% to reduce the text size.
	
function menuReszTxt(idTxtBx,strTxt) {
			// check for valid values
	if ((idTxtBx == null) || (idTxtBx == "")){
		alert("menuReszTxt(): the id for the infoWindow box is empty or null.\n  Please report this error");
		if (strTxt != null) { return(strTxt); }
		else { return("error"); }
		}
	var boxArr = [
				{idTxt: "menuSldNumVal", nmTxt: "slide number", maxWdth: 148},
				{idTxt: "menuSldNameVal", nmTxt: "slide name", maxWdth: 162},
				{idTxt: "menuTissueVal", nmTxt: "tissue", maxWdth: 195},
				{idTxt: "menuSpeciesVal", nmTxt: "species", maxWdth: 185},
				{idTxt: "menuStainVal", nmTxt: "stain", maxWdth: 205},
				];
	var arrSz = boxArr.length;
	var arrI;
	for (arrI = 0; arrI < arrSz; arrI++) {
		if (boxArr[arrI].idTxt == idTxtBx) { break; }
		}
	if (arrI >= arrSz) {
		alert("menuReszTxt():  \"" + idTxtBx 
			+ "\" is not in the list of resizable text windows.\n  Please report this error.");
		if (strTxt != null) { return(strTxt); }
		else { return("error"); }
		}
	if (strTxt == null) {
		alert("menuReszTxt():  The value for \"" + boxArr[arrI].nmTxt 
			+ "\" is null.\n  Please report this error.");
		return("error");
		}
			// calculate the size of the text string
				// get test boxes
	var boxNode = document.getElementById("txtwdthTestBox");
	if (boxNode == null) {
		alert("menuReszTxt():  Can\'t find the test-box (\"txtwdthTestBox\")" 
			+ "\n  Please report this error.");
		return(strTxt);
		}			
	var txtNode = document.getElementById("txtwdthTxtBox");
	if (txtNode == null) {
		alert("menuReszTxt():  Can\'t find the box for holding the text (\"txtwdthTxtBox\")" 
			+ "\n  Please report this error.");
		return(strTxt);
		}			
				//insert text into test box and getsize of text
			// boxNode's visibility=hidden, so when display = block,
			//	box takes up space but cannot be seen
	boxNode.style.display = "block";
	txtNode.innerHTML = strTxt;
	var szRatio = boxArr[arrI].maxWdth/txtNode.offsetWidth;
	var strReSizd = strTxt;  // default is to return original string
				// clean-up test box
	txtNode.innerHTML = "";
	boxNode.style.display = "none";
				// test size of text and, if necessary, adjust font-size	
	if (szRatio < 1) {
		strReSizd = "<span style='font-size:" + (Math.floor(szRatio*100)) + "%'>" + strTxt + "</span>";
		}
	return(strReSizd);
	}

	// menuSetVisChkBx() was written on 8/21/19 to fix & replace:
	//		menuSetFMenuVis(), menuSetZMenuVis() & menuSetXYVis()
	// on 8/26/19 modified to also handle menuSetNavVis & sldCreditBox

function menuSetVisChkBx(clkEvent,chkBxId) {
	clkEvent.stopPropagation();
	var styleDisplay = "";  // text string for type of display when item is displayed
			// get 'pointer' to the menuInfoItem that is to be displayed/hidden
	var targetNode = null;
	var extTargetNode = null;  // two target windows for x,y menu item
			// behavior may depend sldView initialization status
	var isSldVwInit = false;
	if (document.getElementById("sldBndBox").style.display == "block") {
		isSldVwInit = true;
		}
	switch (chkBxId) {
		case "menuSldNmVisCheckBx" :
			targetNode = document.getElementById("menuMainSldNm");
			styleDisplay = "inline-block";
				// if automatically hidden => now is intentionally hidden
			if (prgIsMenuHidden(100)) { glbMenuAutoHide -= 100; }
			break;
		case "menuFVisCheckBx" :
			targetNode = document.getElementById("menuFP");
			styleDisplay = "inline-block";
				// if automatically hidden => now is intentionally hidden
			if (prgIsMenuHidden(10)) { glbMenuAutoHide -= 10; }
			break;
		case "menuZVisCheckBx" :
			targetNode = document.getElementById("menuZ");
			styleDisplay = "inline-block";
				// if automatically hidden => now is intentionally hidden
			if (prgIsMenuHidden(1)) { glbMenuAutoHide -= 1; }
			break;
		case "menuXYVisCheckBx" :
			targetNode = document.getElementById("menuXPos");
			extTargetNode = document.getElementById("menuYPos");
			styleDisplay = "inline-block";
			break;
		case "menuNavVisCheckBx":
			if (!isSldVwInit) { return; }
			targetNode = document.getElementById("sldNavigator");
			styleDisplay = "block";
			break;
		case "menuCreditCheckBx":
			if (!isSldVwInit) { return; }
			targetNode = document.getElementById("sldCreditBox");
			styleDisplay = "block";
			break;
		default:
			alert('menuSetVisChkBx(): Cannot find \"' + chkBxId + '\".  Item was NOT changed.');
			return;
		}
	if (targetNode.style.display == "none") { // menuInfoItem previously hidden => display it
		targetNode.style.display = styleDisplay;
		if (extTargetNode != null) {  // 2nd menuInfoItem also needs to be displayed
			extTargetNode.style.display = styleDisplay;
			}
		document.getElementById(chkBxId).checked = true;
		menuHtChange(chkBxId);		// if menu changed, need to resize menu
		}
	else {  // menuInfoItem previously displayed => hide it
		targetNode.style.display = "none";
		if (extTargetNode != null) {  // 2nd menuInfoItem also needs to be displayed
			extTargetNode.style.display = "none";
			}
		document.getElementById(chkBxId).checked = false;
		menuHtChange(chkBxId);		// if menu changed, need to resize menu
		}
	return;
	}

function menuHtChange(chkBxId) {
	switch (chkBxId) {  // only process if items are on menu
		case "menuSldNmVisCheckBx" :
		case "menuFVisCheckBx" :
		case "menuZVisCheckBx" :
		case "menuXYVisCheckBx" :
			break;
		default:  return;
		}
	if (prgMenuResize()) {  // menu height changed 
		if (document.getElementById("sldBndBox").style.display == "block") {
				// if sldBndBox initialized size of slideView needs to be changed
			sldResizeSldVw();
			}
		}
	return;
	}

	// menuUpdtSetttingDisplay() updates the info windows in the Settings sub-items 
	//   that are not automatically updated.
	//  This function is called onmouseover or onclick for the Slide Info tab on menu
function menuUpdtSettingDisplay() {
	document.getElementById("menuTileBufVal").innerHTML = glbSldXYBuf;
	document.getElementById("menuFBufVal").innerHTML = glbSldFBuf;
	if ( Number.isNaN(glbSldMaxF) || glbFDisabled) {
		document.getElementById("menuMaxFVal").innerHTML = "&nbsp;";
		}
	else { document.getElementById("menuMaxFVal").innerHTML = glbSldMaxF; }
	document.getElementById("menuZBufVal").innerHTML = glbSldZBuf;
	document.getElementById("menuFZBufVal").innerHTML = glbSldFZBuf;
	if (Number.isFinite(glbSldZFLim)) {
		document.getElementById("menuZFLimitVal").innerHTML = glbSldZFLim;
		}
	else { document.getElementById("menuZFLimitVal").innerHTML = "&nbsp;"; }
	if (Number.isNaN(glbSldFDef)) {
		document.getElementById("menuFDefVal").innerHTML = "&nbsp;";
		}
	else { document.getElementById("menuFDefVal").innerHTML = glbSldFDef; }
	menuUpdtCacheSz();
	document.getElementById("menuMaxCacheVal").innerHTML = glbImgCacheMaxSz;
	document.getElementById("menuSldVwSzVal").innerHTML = sldVw.length;
	document.getElementById("menuDestArrSzVal").innerHTML = destSldVw.length;
	document.getElementById("menuPurgArrSzVal").innerHTML = purgSldVw.length;
	return;
	}


	// menuUpdtSlideInfo() updates the info windows in the Slide Info sub-items that are not
	//   automatically updated.
	//  This function is called onmouseover or onclick for the Slide Info tab on menu
function menuUpdtSlideInfo() {
		// display values only after slideView has been initialized
	if (document.getElementById("sldBndBox").style.display == "block") { 
		document.getElementById("menuFocX").innerHTML = glbVwFocX;
		document.getElementById("menuFocY").innerHTML = glbVwFocY;
		}
			// Originally, I had an 'else' statment that set innerHTML to "&nbsp;"
			//	if sldBndBox wasn't displayed, but I don't think this is needed.
	return;
	}

	// menuWrtMxMag() expresses the maximum magnification (dbMaxMag) in pixels/µm,
	//	handles the problem of toPrecision using exponential notation if the number
	//		is greater than precision,
	//	and then writes the result to "<span id='menuMxMagVal'>
	//	This function was written 5/20/20 and is called by:
	//		sqlSldBasics() => when dbMaxMag is obtained from SQL database
	//		chgSetSubmit() => when precision is changed;
function menuWrtMxMag() {
	var maxMag = dbMaxMag/1000;
	var strMag = maxMag.toPrecision(glbMagPrec);
	if ((maxMag > 100) && (glbMagPrec == 2)) { strMag = (Math.round(maxMag/10) * 10).toFixed(0); }
	else if ((maxMag > 100) && (glbMagPrec == 1)) { strMag = (Math.round(maxMag/100) * 100).toFixed(0); }
	else if ((maxMag > 10) && (glbMagPrec == 1)) { strMag = (Math.round(maxMag/10) * 10).toFixed(0); }
	document.getElementById("menuMxMagVal").innerHTML = strMag;
	return;
	}

		// menuSetZMag() displays the current magnification.  This function:
		//	(1)	gets the current magnification (in pixels/mm) from dbSldData[]
		//	(2)	determines whether to express the units in mm or µm
		//	(3)	creates a formatted output string formatted to 3 digits
		//	(4)	writes the result to "menuDDZMagVal"
		//	(5)	sets the units in "menuDDunits"
		//	NOTE: in the future, consider making precision magnification a global
		//		variable that can be changed using "Change Settings"
function menuSetZMag(curZ) {
	var strMag = "";  // string containing rounded
	if (dbMaxMag == 0) { return; }  // magnification unknown & not displayed
	if (curZ != dbSldData[curZ].z) {  //  dbSldData[] not aligned correctly.
		alert("menuSetZMag(): index to ZYX array (" + curZ 
				+ ") does not match the array's zoom-level (" 
				+ dbSldData[curZ].z 
				+ ").\nThe slide probably will not display correctly.\n\nPlease report this error.");
		return;
		}
	var curMag = dbSldData[curZ].zMag;  //
	var strUnits = "<u>pixels</u><br>mm";
	if (curMag > 1000) {  // need to express magnification in pixels/µm
		curMag /= 1000;
		strUnits = "<u>pixels</u><br>&micro;m";
	}
			// set precision
	var curPrec = glbMagPrec;
	if (curPrec < 1) {
		alert("menuSetZMag(): the value for glbMagPrec (" + glbMagPrec + ") cannot be less than 1. " 
				+ " It is being reset to 3.\n\n  Please report this error.");
		curPrec = 3;
		}
	strMag = curMag.toPrecision(curPrec);
	if ((curMag > 100) && (curPrec == 2)) { strMag = (Math.round(curMag/10) * 10).toFixed(0); }
	else if ((curMag > 100) && (curPrec == 1)) { strMag = (Math.round(curMag/100) * 100).toFixed(0); }
	else if ((curMag > 10) && (curPrec == 1)) { strMag = (Math.round(curMag/10) * 10).toFixed(0); }
	document.getElementById("menuDDZMagVal").innerHTML = strMag;
	document.getElementById("menuDDunits").innerHTML = strUnits;
	return;
	}
	

	// menuUpdtCacheSz() writes the current cache size to the "cache size" siide info menu item
	//	and displays/hides "cache list ..." button on "Slide Info" menu
function menuUpdtCacheSz() {
	var szCache = glbImgCache.length;
	document.getElementById("menuCacheSzVal").innerHTML = szCache;
		// show "cache list ..." button?
	if (szCache > 0) { 
		document.getElementById("menuCacheList").style.display = "block";
		document.getElementById("menuClearCache").style.display = "block";
		}
	else { 
		document.getElementById("menuCacheList").style.display = "none";
		document.getElementById("menuClearCache").style.display = "none";
		}
	return;
	}


	// menuSetBell() toggles muting of the warnBoxBell
function menuSetBell() {
	var bellNode = document.getElementById("warnBell");
		// ideally, we should use the same node for all bells, but I'm not certain how to implement this
		//	for now (4/28/20) we'll use "warnBell" as the lead and assume that all the other bells are
		//	behaving equivalently
	var bellOff = bellNode.muted;
	var menuTxtNode = document.getElementById("menuBellOnOffTxt");
	var menuNoteNode = document.getElementById("menuBellNote");
	if (bellOff) {  // bell was off: turn bell ON
		bellNode.muted = false;
		menuTxtNode.innerHTML = "OFF";  // if bell is on, then btn will turn it off
		menuNoteNode.style.color = "black";
		}
	else {
		bellNode.muted = true;
		menuTxtNode.innerHTML = "ON";  // if bell is off, then btn will turn it on
		menuNoteNode.style.color = "rgb(160,160,160)";
		}
	return;
	}

	// toggles glbMvBtnDir between 1 (arrows move slide) and -1 (arrows move field-of-view)
	//		Because action changes function, the titles on the Setting's button is reversed
	//		from current action.	
function menuChgMvArrowDir() {
	glbMvBtnDir *= -1;
	menuSetMvArrowDir();
	return;
	}

function menuSetMvArrowDir() {
	if (glbMvBtnDir == 1) {
		document.getElementById("menuMvArrowTxt").innerHTML = "FOV";
		document.getElementById("menuShwArrDirTxt").innerHTML = "&nbsp;slide <span style='float:right'>&#8648;&nbsp; </span>";
		document.getElementById("menuMvBtn12").innerHTML = "<b>&uarr;</b>&nbsp;&nbsp;Move slide <b>UP</b>";
		document.getElementById("menuMvBtn22").innerHTML = "<b>&darr;</b>&nbsp;&nbsp;Move slide <b>DOWN</b>";
		document.getElementById("menuMvBtn32").innerHTML = "<b>&larr;</b>&nbsp;&nbsp;Move slide to the <b>LEFT</b>";
		document.getElementById("menuMvBtn42").innerHTML = "<b>&rarr;</b>&nbsp;&nbsp;Move slide to the <b>RIGHT</b>";
		}
	else if (glbMvBtnDir == -1) {
		document.getElementById("menuMvArrowTxt").innerHTML = "SLIDE";
		document.getElementById("menuShwArrDirTxt").innerHTML = "&nbsp;field-of-view<span style='float:right'>&#8645;&nbsp;</span>";
		document.getElementById("menuMvBtn12").innerHTML = "<b>&uarr;</b>&nbsp;&nbsp;Move field-of-view <b>UP</b>";
		document.getElementById("menuMvBtn22").innerHTML = "<b>&darr;</b>&nbsp;&nbsp;Move field-of-view <b>DOWN</b>";
		document.getElementById("menuMvBtn32").innerHTML = "<b>&larr;</b>&nbsp;&nbsp;Move field-of-view to the <b>LEFT</b>";
		document.getElementById("menuMvBtn42").innerHTML = "<b>&rarr;</b>&nbsp;&nbsp;Move field-of-view to the <b>RIGHT</b>";
		}
	else {
		document.getElementById("menuShwArrDirTxt").innerHTML = "&nbsp;";
		alert("menuChgMvArrowDir():  Illegal value (\"" + glbMvBtnDir 
				+ "\") for move-arrow direction.\n\nPlease report this error.");
		}
	return;
	}

	// 4/04/20  menuResetTch() resets glbSVTchLst[] and clears glbTchMvArr[]
	//  by making glbSVTchPt an illegal value, force next touch event to call tchResetArr()
function menuClearTchArr() {
	glbSVTchPt = Number.NaN;
	glbTchMvArr.splice(0);
	return;
	}


//       **************************************************************
//       ***************      warnBox functions       *****************
//       **************************************************************

	// warnBoxCall() is passed the text to display in the warning box.
	//	The function calculates the location & displays the warning box, beeps, and then sets the timer for
	//		the beginning of the fading-out of the warning box.  The function is passed:
	//	(1) shwBorder: a boolean indicating whether to include border between header and text
	//	(2)	txtHeading:  is a text string to print in header
	//	(3)	txtWarning: is a text string to print in body of warning
function warnBoxCall(shwBorder,txtHeader,txtWarning) {
			// if warning box is in use, save warning to queue & return
	if (document.getElementById("warnBox").style.display == "block") {
		warnBoxQ[warnBoxQ.length] = {shwBdr: shwBorder, txtHdr: txtHeader, txtWarn: txtWarning};
		return;
		}
			// if warning box not already in-use, set-up & show warning box
	var warnBoxWidth = 300;
			// put warning box in middle of screen
	var warnBoxLeft = Math.round((parseInt(document.getElementById("sldBndBox").style.width) - warnBoxWidth) / 2);
	var warnBoxTop = Math.round(parseInt(document.getElementById("sldBndBox").style.height) / 2 ) - 230;
	if (warnBoxTop < 80) { warnBoxTop = 80; }
			// reset box to "unfaded" state
	document.getElementById("warnBell").play();
	document.getElementById("warnBox").style.backgroundColor = "rgb(" + warnBoxBackgrdColor + ")";
	document.getElementById("warnBox").style.borderColor = "rgb(" + warnBoxBorderColor + ")";
	document.getElementById("warnBox").style.color = "rgb(" + warnBoxTxtColor + ")";
			// set-up & display warning box
	document.getElementById("warnBox").style.left = warnBoxLeft + "px";
	document.getElementById("warnBox").style.top = warnBoxTop + "px";
	document.getElementById("warnBox").style.width = warnBoxWidth +"px";
	if (shwBorder) {
		document.getElementById("warnBoxHdr").style.borderBottom = "1px solid black";
		}
	else {
		document.getElementById("warnBoxHdr").style.borderBottom = "0px";
		}
	document.getElementById("warnBoxHdrTxt").innerHTML = txtHeader;
	document.getElementById("warnBoxText").innerHTML = txtWarning;
	document.getElementById("warnBox").style.display = "block";
	
			// turn-on timer for starting fade
	warnTimer.id = window.setInterval(warnBoxStrtFade,warnDisplayTime);
	return;
	}


	// The timer set by warnBoxCall() determines the delay while the warning box is displayed.
	//		This delay is different from the step-size used during fading of the warning box,
	//		so the timer set by warnBoxCall() calls warnBoxStrtFade(), which only resets the warnTimer
	//		and points the warnTimer to call warnBoxFade()
	//	For simplicity, don't check queue for warning box until next cycle
function warnBoxStrtFade() {
		// warnTimer's interval had been set to warnDisplayTime => turn-off this timer
	if (Number.isNaN(warnTimer.id) == false) {
		window.clearInterval(warnTimer.id);
		}
 	warnTimer.id = window.setInterval(warnBoxFade,warnFadeTime);
	return;
	}

	// warnBoxFade() is called by warnTimer and gradually fades-out the warning box
function warnBoxFade() {
	var fadeVal = warnTimer.fade;
		// if another warning message is waiting close this box so another warning message can be sent
	if (warnBoxQ.length > 0) {
//alert("warnBoxQ = " + warnBoxQ.length);
		warnBoxClose();
		}
		// if no other message is waiting, fade-out this message	
	else if (fadeVal <= warnFadeAmt) {	// if warnBox has maximally faded
		warnBoxClose();				// close warning box
		}
	else { // fade warning box => warnTimer is still on
		fadeVal -= warnFadeAmt;
		warnTimer.fade = fadeVal;
		document.getElementById("warnBox").style.backgroundColor = "rgba(" + warnBoxBackgrdColor + "," + fadeVal + ")";
		document.getElementById("warnBox").style.borderColor = "rgba(" + warnBoxBorderColor + "," + fadeVal + ")";
		document.getElementById("warnBox").style.color = "rgba(" + warnBoxTxtColor + "," + fadeVal + ")";
		}
	return;
	}

	// moving the cursor over the warning box (onMouseOver) calls warnBoxHold().
	//	This function prevents the warning box from fading by restoring the colors to their
	//		default values and turning off the warnBox fading timer.
	//	Turning off the warnBox timer is OK because moving the mouse off the warning box (onMouseOut) 
	//		calls warnBoxClose(), which closes the warning box.
function warnBoxHold() {
			// turn-off warnBox fading if it is on
	if (Number.isNaN(warnTimer.id) == false) {
		window.clearInterval(warnTimer.id);
		}
	warnTimer.id = Number.NaN;
			// remove any fading of the box
	document.getElementById("warnBox").style.backgroundColor = "rgb(" + warnBoxBackgrdColor + ")";
	document.getElementById("warnBox").style.borderColor = "rgb(" + warnBoxBorderColor + ")";
	document.getElementById("warnBox").style.color = "rgb(" + warnBoxTxtColor + ")";
	return;
	}
		
	// warnBoxClose() stops warning-box timer & resets warning box.
	//	If other warning messages are waiting in the warning-box queue (warnBoxQ)
	//		warnBoxClose() calls warnBoxCall() with the next warning message.
function warnBoxClose() {
	var nxtMsg;
			// turn-off & reset warnBoxTimer
	if (Number.isNaN(warnTimer.id) == false) {
		window.clearInterval(warnTimer.id);
		}
	warnTimer.id = Number.NaN;
	warnTimer.fade = 1;
			//reset warning box
	document.getElementById("warnBox").style.display = "none";
	document.getElementById("warnBox").style.backgroundColor = "rgb(" + warnBoxBackgrdColor + ")";
	document.getElementById("warnBox").style.borderColor = "rgb(" + warnBoxBorderColor + ")";
	document.getElementById("warnBox").style.color = "rgb(" + warnBoxTxtColor + ")";
//	document.getElementById("warnBoxText").innerHTML = "";
	if (warnBoxQ.length > 0) {
		warnBoxCall(false,"",warnBoxCatStr());
		}
	return;
	}
	
	// warnBoxCatStr() returns a text string containing all of the warnings
	//		from warnBoxQ[] and those in warnBox.innerHTML
	//	These are used by warnBoxClose() to generate a new warning box containing
	//		all current warnning messages.
function warnBoxCatStr() {
	var spnHdr = '<span style="display: inline-block; width: 100%; text-align: center; font-size: 24px; padding-top: 2px; border-top: 1px solid black">';
	var warnTxt = "";
	var nxtMsg;
	while (warnBoxQ.length > 0) {
		nxtMsg = warnBoxQ.pop();
		warnTxt += spnHdr + nxtMsg.txtHdr + "</span>" + nxtMsg.txtWarn + "<br><br>";
		}
	warnTxt += spnHdr + document.getElementById("warnBoxHdrTxt").innerHTML + "</span>";
	warnTxt += document.getElementById("warnBoxText").innerHTML;
	return(warnTxt);
	}


//       **************************************************************
//       ***************      waitBox functions       *****************
//       **************************************************************
// waitBox probably is poorly named, since this box is only collaterally related to the "wait" state
//	For each slideView plane, this box dynamically displays the size of sldWaitArr[] ("missing tiles"),
//	as well as wait status.
// The table in waitBox needs to be re-created whenever the number (or order) of planes in sldVw[] changes.
//	To avoid overloading the system, a global boolean variable (glbIsWaitBxActive) is set to true if:
//		(1)	waitBox is visible (<div id="waitBox" style="block">), or
//		(2)	viewer is in "wait" state (glbWait == true)
//		and sldAddPlane() & sldRemovePlane() will only call waitMkBox if glbIsWaitBxActive == true
//	For each row in the table, "is visible" & "is waiting" will be reset (without rewriting table) by
//		functions that change visible view-plane or initiate a "wait" state (sldChangeF() & sldChangeZ()).
//		This is only done if glbIsWaitBxActive == true.
//	For each row in the table, the value displayed in "missing tiles" will be reset (withoug rewriting table)
//		by functions that add (sldGetNewImgNode()) or call sldWaitUnlist() to remove elements from sldVw[].sldWaitArr[]
//			The functions that call sldWaitUnlist() are:
//			 - sldImgLoaded()
//			 - sldScrollDown()
//			 - sldScrollUp()
//			 - sldScrollRight()
//			 - sldScrollLeft()
//			 - sldScrollDown()

	// waitMkBox() creates & writes the table to the waitBox
function waitMkBox() {
	var i;
	var wdSmall = 39;  // width of "wtIsV" and "wtIsM" elements
	var wdBig = 60;  // width of index, F, Z, and "mTile" elements
	var topStr = '<div id="waitBxTopStr" class="waitTopClass">';
	topStr += 'Microscope waiting for tiles:&nbsp;&nbsp;<span id="waitBxWaitState" style="font-weight:bold">'
	topStr += glbWait + '</span></div>';
	var tabStr = '<table class="waitTab">';  // string holding HTML tags for creating table
			// make header
	tabStr += '<tr class="waitTab">';
			// "is visible"
	tabStr += '<th class="waitTab" style="width:' + wdSmall + 'px">';
		tabStr += 'is visible</th>';
			// "wait"
	tabStr += '<th class="waitTab" style="width:' + wdSmall + 'px">';
		tabStr += 'wait set</th>';
			// index
	tabStr += '<th class="waitTab" style="width:' + wdBig + 'px">';
		tabStr += 'index</th>';
			// F
	tabStr += '<th class="waitTab" style="width:' + wdBig + 'px">';
		tabStr += 'F<br>(<span style="font-size:10px">focal&nbsp;plane</span>)</th>';
			// Z
	tabStr += '<th class="waitTab" style="width:' + wdBig + 'px">';
		tabStr += 'Z<br>(<span style="font-size:10px">zoom&nbsp;level</span>)</th>';
			// missing tiles
	tabStr += '<th class="waitTab" style="width:' + wdBig + 'px">';
		tabStr += 'missing tiles</th>';
	tabStr += '</tr>';
			// make body of table
	for (i = 0; i < sldVw.length; i++) {
				// start row
		tabStr += '<tr class="waitTab">';
				// "is visible"
		tabStr += '<td class="waitTab waitSmTd" id="wtIsV' + i
				+ '" style="width:' + wdSmall + 'px">';
			if (sldVw[i].sldVis) { tabStr += '&#9745;'; }
			else { tabStr += '&#9744;'; }
			tabStr += '</td>';
				// "wait"
		tabStr += '<td class="waitTab waitSmTd" id="wtIsM' + i
				+ '" style="width:' + wdSmall + 'px">';
			if (sldVw[i].sldWait) { tabStr += '&#9745;'; }
			else { tabStr += '&#9744;'; }
			tabStr += '</td>';
				// index
		tabStr += '<td class="waitTab waitBigTd" style="width:' + wdBig + 'px">';
			tabStr += i + '</td>';
				// F
		tabStr += '<td class="waitTab waitBigTd" style="width:' + wdBig + 'px">';
			tabStr += sldVw[i].f + '</td>';
				// Z
		tabStr += '<td class="waitTab waitBigTd" style="width:' + wdBig + 'px">';
			tabStr += sldVw[i].z + '</td>';
				// missing tiles
		tabStr += '<td class="waitTab waitBigTd" id="wtMTile' + i
				+ '" style="padding: 0px 18px 0px 0px; width:' + wdBig + 'px">';
			tabStr += sldVw[i].sldWaitArr.length + '</td>';
		tabStr += '</tr>';
		}
	tabStr += '</table>';
	document.getElementById("waitBodyBox").innerHTML = topStr + tabStr;
	return;
	}


	// waitCloseBox() is called by the "close" buttons on waitBox
	//	sets glbIsWaitBxActive = false & hides waitBox
function waitBoxClose() {
	document.getElementById("waitBox").style.display = "none";
	glbIsWaitBxActive = false;
	glbIsWaitBxOpen = false;
	return;
	}

	// waitOpenBox() is called by "Show missing tiles..." menu button.
	//	This function initializes & displays waitBox.  It also activates automatic
	//		updating of box contents by setting glbIsWaitBxActive = true
	//	glbIsWaitBxOpen = true, so that box doesn't flicker during "wait" states
function waitBoxOpen() {
	waitMkBox();
	document.getElementById("waitBoxHdrTxt").innerHTML 
			= '<font style="font-size: 28px"><b>Missing Image Tiles</b></font>';
	infoBxInitPos("waitBox");
	document.getElementById("waitBox").style.display = "block";
	glbIsWaitBxActive = true;
	glbIsWaitBxOpen = true;
	return;
	}
	
	

//       **************************************************************
//       ***************      infoBox functions       *****************
//       ***************        MOVE functions        *****************
//       **************************************************************

	// infoBoxInitPos() is called when the infoBox is opened (by clicking on a menu button)
	//	It positions the box (except for "Go To" box) in the center of the window horizontally
	//		and glbInfoBxDefTop from the top of the window
	//		NOTE:  NEED TO ADD glbInfoBxDefTop TO ChangeSettings
function infoBxInitPos(boxId) {
	var idx;  // index of mvBtnNode in glbInfoBxLst
	var lstSz = glbInfoBxLst.length;
	var scrWidth = parseInt(window.innerWidth) - 4;  // width of screeen less 2px border
		// find box in glbInfoBxLst
	for (idx = 0; idx < lstSz; idx++) {
		if (boxId == glbInfoBxLst[idx].boxId) { break; }
		}
	if (idx >= lstSz) {  // couldn't find infoBox in list
		alert("infoBxInitPos(): Cannot find \"" + boxId 
				+ "\" in glbInfoBxLst.  Cannot set the position of the infoBox.");
		return;
		}
	var boxNode = document.getElementById(boxId);  // node of infoBox;
	if (boxNode == null) {
		alert("infoBxInitPos(): Cannot find \"" + glbInfoBxLst[idx].boxNm 
				+ "\" box (\"" + boxId + "\").\n  Cannot move the \""
				+ glbInfoBxLst[idx].boxNm + "\" box.");
		return;
		}
			// set position of infoBox
	var left = Math.round((scrWidth - glbInfoBxLst[idx].boxWd)/2);
	if (left < 4) { left = 10; }  // if left is off the screen, set left side of box to 10px
	else if (boxId == "gotoBox") { left = 300; } // don't center "Go To" box
	boxNode.style.top = glbInfoBxDefTop + "px";
	boxNode.style.left = left + "px";
	return;
	}

	// infoBxTchDwn() is called by a touchstart event on the move-button of an infoBox
	//	tchEvt is the TouchEvent object belong to this event
	//	mvBtnNode is the move-button that was touched.
	// infoBxTchDwn() sets glbInfoBxVal.x/y and then calls infoBxMvStrt() to finish setting-up
	//		glbInfoBxVal for the move
function infoBxTchDwn(tchEvt,mvBtnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
			// check for another moving info box
	if (!Number.isNaN(glbInfoBxVal.x) 
			|| !Number.isNaN(glbInfoBxVal.y) 
			|| (glbInfoBxVal.boxNode != null)) { // glbInfoBxVal is in use
		alert("infoBxTchDwn(): Cannot move two info boxes simultaneously");
		return;
		}
			// check for valid touchevent
	if (tchEvt.target != mvBtnNode) {
		warnBoxCall(false,"Touch error","<b>infoBxTchDwn():</b> &nbsp;The button being touched (\""
				+ tchEvt.target.id + "\") is different from the responding button (\""
				+ mvBtnNode.id + "\").<br> Please report this error.");
		}
	var tchTot = tchEvt.targetTouches;
	var tchTotSz = tchTot.length;
	if (tchTotSz < 1) {
		alert("infoBxTchDwn(): Nothing is touching the infoBox move-button (\""
				+ mvBtnNode.id + "\").  Cannot move the box.");
		return;
		}
	if (tchTotSz > 1) {
		warnBoxCall(false,"Too many fingers","<b>infoBxTchDwn():</b> &nbsp;More than one finger ("
				+ tchTotSz + ") is touching the move-button (\""
				+ mvBtnNode.id +"\").  This probably is an error.");
		}
			// set newX,Y
	glbInfoBxVal.x = tchTot[0].clientX;
	glbInfoBxVal.y = tchTot[0].clientY;
	mvBtnNode.innerHTML = "Drag finger to move";  
	infoBxMvStrt(mvBtnNode);
	return;
	}

	// infoBoxMvDown() is called when the mouse is depressed on an info-box's move-button
	// It is passed the pointer to the button and the Event object.
	//	It sets glbInfoBxVal.x,y and then calls infoBxMvStrt() to finish setting-up
	//		glbInfoBxVal for the move 
function infoBxMusDwn(mvBtnNode,musEvt) {
	musEvt.stopPropagation();
			// check for another moving info box
	if (!Number.isNaN(glbInfoBxVal.x) 
			|| !Number.isNaN(glbInfoBxVal.y) 
			|| (glbInfoBxVal.boxNode != null)) { // glbInfoBxVal is in use
		alert("infoBxMusDwn(): Cannot move two info boxes simultaneously");
		return;
		}
			// check that event and move-box are congruent
	if (musEvt.target != mvBtnNode) {
		warnBoxCall(false,"Wrong button",
				"<b>infoBxMusDwn():</b> &nbsp;The button that the mouse is depressing  (\""
				+ musEvt.target.id + "\") is different from the responding button (\""
				+ mvBtnNode.id + "\").<br> Please report this error.");
		}
	mvBtnNode.style.cursor = "move";
	mvBtnNode.onmousemove = infoBxMusMv;
	mvBtnNode.innerHTML = "Drag mouse to move";  // this isn't really appropriate for touchscreens
	glbInfoBxVal.x = musEvt.clientX;
	glbInfoBxVal.y = musEvt.clientY;
	infoBxMvStrt(mvBtnNode);
	return;
	}

	// infoBxMvStrt() receives from infoBxTchDwn() or infoBxMusDwn() the move-button node 
	//		of the info box that is being moved.  Except for x,y (which are set by the 
	//		calling function), infoBxMvStrt populates glbInfoBxVal, sets color & text
	//		of the move-button, and positions the move-box.
function infoBxMvStrt(mvBtnNode) {
	var idx;  // index of mvBtnNode in glbInfoBxLst
	var btnId = mvBtnNode.id;
	var lstSz = glbInfoBxLst.length;
	var scrWidth = parseInt(window.innerWidth) - 4;  // width of screeen less 2px border
	var scrHeight = parseInt(window.innerHeight) - 10; // height of screen less bottom margin
			// find btnId in glbInfoBxLst
	for (idx = 0; idx < lstSz; idx++) {
		if (btnId == glbInfoBxLst[idx].btnId) { break; }
		}
	if (idx >= lstSz) {  // couldn't find infoBox in list
		alert("infoBxMvStrt(): Cannot find \"" + btnId 
				+ "\" in glbInfoBxLst.  Cannot move the infoBox.");
		return;
		}
	var boxNode = document.getElementById(glbInfoBxLst[idx].boxId);  // node of infoBox;
	if (boxNode == null) {
		alert("infoBxMvStrt(): Cannot find \"" + glbInfoBxLst[idx].boxNm 
				+ "\" box (\"" + glbInfoBxLst[idx].boxId + "\").\n  Cannot move the \""
				+ glbInfoBxLst[idx].boxNm + "\" box.");
		return;
		}
			// set glbInfoBxVal values
	glbInfoBxVal.boxNode = boxNode;
	glbInfoBxVal.left = parseInt(boxNode.style.left);
	glbInfoBxVal.top = parseInt(boxNode.style.top);
	glbInfoBxVal.idx = idx;
			// set mvBtnNode properties
	mvBtnNode.style.backgroundColor = "rgb(128,128,192)";
	mvBtnNode.style.color = "white";
	return;
	}

	// infoBxMusMv() is called by an onMouseMove event on an infoBox move-button
	//	it extracts clientX,Y from the event and calls infoBxMv() to move the infoBox
function infoBxMusMv(musEvt) {
	musEvt.stopPropagation();
	infoBxMv(musEvt.clientX,musEvt.clientY);
	return;
	}

	// infoBxTchMv() is called by a touchmove event on an infoBox move-button
	//	it extracts clientX,Y from the event and calls infoBxMv() to move the infoBox
function infoBxTchMv(tchEvt) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
	var tchTot = tchEvt.targetTouches;
	var tchTotSz = tchTot.length;
	var targetId = tchEvt.target.id
	if (tchTotSz < 1) {
		alert("infoBxTchMv(): Nothing is touching the infoBox move-button (\""
				+ targetId + "\").  Cannot move the box.");
		return;
		}
	if (tchTotSz > 1) {
		warnBoxCall(false,"Too many fingers","<b>infoBxTchMv():</b> &nbsp;More than one finger ("
				+ tchTotSz + ") is touching the move-button (\""
				+ targetId +"\").  This probably is an error.");
		}
	infoBxMv(tchTot[0].clientX,tchTot[0].clientY);
	return;
	}


function infoBxMv(newX,newY) {
			// check for validity of glbInfoBxVal object
	if (Number.isNaN(glbInfoBxVal.x) 
				|| Number.isNaN(glbInfoBxVal.y) 
				|| Number.isNaN(glbInfoBxVal.left) 
				|| Number.isNaN(glbInfoBxVal.top) 
				|| (glbInfoBxVal.boxNode == null)) {   // mouse is NOT down
		alert("infoBxMv():  glbInfoBxVal has not been initialized.\n Cannot move the infoBox");
		return; 
		}
	var boxNode = glbInfoBxVal.boxNode;
	var left = glbInfoBxVal.left;
	var top = glbInfoBxVal.top;
	left += newX - glbInfoBxVal.x;
	top += newY - glbInfoBxVal.y;
	boxNode.style.left = left + "px";
	boxNode.style.top = top + "px";
	glbInfoBxVal.x = newX;
	glbInfoBxVal.y = newY;
	glbInfoBxVal.left = left;
	glbInfoBxVal.top = top;
	return;
	}
	
	// infoBxMusUp() is called & passed a pointer to the mouse event pointer
	//    if a mouse-button was released (button up) while on the infoMvBtn button
	// if the mouse-button had been depressed while on the infoMvBtn button,
	//   so glbInfoBxVal has been initialized (see infBoxMvBtnDown(), see above), then
	//   infoBxMusUp() resets infoMvBtn style and sets glbInfoBxVal to null/NaN values.
function infoBxMusUp(btnNode) {
			// reset glbInfoBxVal
	glbInfoBxVal.x = Number.NaN;
	glbInfoBxVal.y = Number.NaN;
	glbInfoBxVal.left = Number.NaN;
	glbInfoBxVal.top = Number.NaN;
	glbInfoBxVal.boxNode = null;
	glbInfoBxVal.idx = -1;
			// reset move-button
	btnNode.onmousemove = "";
	btnNode.style.cursor = "";
	btnNode.style.backgroundColor = "";
	btnNode.style.color = "";
	btnNode.innerHTML = "Mouse down to move";
	return;
	}

	// infoBoxMvBtnOut() is called whenever the mouse mouse off the the infoMvBtn button;
	//    it is passed a pointer to the infoMvBtn DOM node.
	// This function attempts to fix two 'bugs' in HTML.
	//	(1) Movement of the infoBox is so slow that it is possible for the depressed mouse to 'out-run'
	//		the infoMvBtn button, and thus move off of the infoBox while trying to move it.  In this case,
	//		the function treats the mouse-out event as a mouse-up event and resets glbInfoBxVal (see
	//		infoBxMusUp(), above).
	//	(2)	If the mouse is depressed & released on the infoMvBtn, the text in the infoMvBtn button is not
	//		automatically restored to the default value when the (now released) mouse moves off the button,
	//		so this function must explicitly reset the button's innerHTML contents.
function infoBxMusOut(btnNode) {
			// reset glbInfoBxVal
	glbInfoBxVal.x = Number.NaN;
	glbInfoBxVal.y = Number.NaN;
	glbInfoBxVal.left = Number.NaN;
	glbInfoBxVal.top = Number.NaN;
	glbInfoBxVal.boxNode = null;
	glbInfoBxVal.idx = -1;
			// reset move-button
	btnNode.onmousemove = "";
	btnNode.style.cursor = "";
	btnNode.style.backgroundColor = "";
	btnNode.style.color = "";
	btnNode.innerHTML = "Press here to move";
	return;
	}
	

function infoBxTchUp(tchEvt,btnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
			// check for valid touchevent
	if (tchEvt.target != btnNode) {
		warnBoxCall(false,"Touch error","<b>infoBxTchUp():</b> &nbsp;The button being touched (\""
				+ tchEvt.target.id + "\") is different from the responding button (\""
				+ btnNode.id + "\").<br> Please report this error.");
		}
			// reset glbInfoBxVal
	glbInfoBxVal.x = Number.NaN;
	glbInfoBxVal.y = Number.NaN;
	glbInfoBxVal.left = Number.NaN;
	glbInfoBxVal.top = Number.NaN;
	glbInfoBxVal.boxNode = null;
	glbInfoBxVal.idx = -1;
			// reset move-button
	btnNode.style.backgroundColor = "rgb(232,232,248)";
	btnNode.style.color = "black";
	btnNode.innerHTML = "Press here to move";
	return;
	}



//       *************************************************************
//       ***************      infoBox functions      *****************
//       ***************       TABLE functions       *****************
//       *************************************************************

	// infoBoxFlipOrder() uses the data in infoBoxList[] to flip the order of the data presented in an infoBox
	//   and to update the buttons on the infoBox
function infoBoxFlipOrder(indBoxLst) {
	var btnNode = document.getElementById(infoBoxList[indBoxLst].idSrtDir);
	var btnVal = btnNode.value;
	var colText = "";  // this will be the header for the column
//	var btnSrtById = infoBoxList[indBoxLst].idSrtBy;

		// indSrtBy is the index to the specific info??TabList[], i.e. infoBoxList[].btnArr, 
		//	that indicates the variable by which the table is sorted.
	var indSrtBy = document.getElementById(infoBoxList[indBoxLst].idSrtBy).value;
		// arrTabInfo points to the array ('info??TabList') containing the table's colId & header text
	var arrTabInfo = infoBoxList[indBoxLst].btnArr;  // pointer to array containg colId & colTxt

	var tmpArr = infoBoxList[indBoxLst].tmpArr;  // array of table-data from infoBoxList
		// funcMkTab is the function that will re-create the HTML table code
	var funcMkTab = infoBoxList[indBoxLst].funcMkTab;  // function from infoBoxList
	tmpArr.reverse();
	funcMkTab(tmpArr);  // display table with order reversed

		//  btnVal indicates whether sort is small-to-large (==1) or large-to-small (== -1)
	btnVal *= -1;  // btnVal flips sign because order is reversed;
	btnNode.value = btnVal;
	if (btnVal < 0) {
			//	array (and table) is now displayed large-to-small
		btnNode.innerHTML = "Sort small-to-large";  // clicking button will reverse order
		colText = "&uarr;"  // use up-arrow to indicate that largest values are at top
		}
	else if (btnVal > 0) {
			//	array (and table) is now displayed small-to-large
		btnNode.innerHTML = "Sort large-to-small";  // clicking button will reverse order
		colText = "&darr;"  // use down-arrow to indicate that largest values are at bottom
		}
	colText += arrTabInfo[indSrtBy].colTxt;  // add rest of header text to up/down arrow
	document.getElementById(arrTabInfo[indSrtBy].colId).innerHTML = colText;
	return;
	}

	// infoBoxSortBy() is invoked when the 'sort-by' button on the infoBox is clicked
	//	This function only works for dichotomous 'sort-by' functions.  In the future,
	//		it probably can be adapted to work for infoBoxes with more than two 'sort-by' choices
	//	It is passed the index (infoBxCI == 0) to the infoCacheBox in infoBoxList[]
	//	The function sorts tmpCacheArr either by index or by imageId depending on the value of
	//		the 'sort-by' button
	//	For simplicity, the initial order after resorting is small-to-large (this can be reversed 
	//		by clicking the 'Sort direction' button)
	//	If infoBoxSortBy() was only used for the cache info box (<div id="infoBoxCache">), then
	//		tabLst would always == infoCTabList, but code addresses div's/btn's, arrays, and functions
	//		through infoBoxList[] so this function can also be used with other infoBox's
function infoBoxSortBy(indBoxLst) {
	var i;
	var tabLst = infoBoxList[indBoxLst].btnArr;  // array containing columnId and column & button text
		//  srtDir == 1: sort small-to-large; srtDir == -1; sort large-to-small
	var srtBtnNode = document.getElementById(infoBoxList[indBoxLst].idSrtBy);   // pointer to 'Sort by' button
	var dirBtnNode = document.getElementById(infoBoxList[indBoxLst].idSrtDir);   // pointer to 'Sort direction' button
	var arrTmp= infoBoxList[indBoxLst].tmpArr;
	var prnTable = infoBoxList[indBoxLst].funcMkTab;  // function to print table from infoBoxList
	var srtBy = srtBtnNode.value;  // column to sort by

		// update srtBy value:  old srtBy value indicates column on which data had been sorted before
		//		the 'sort-by' button wsa clicked
		// Clicking 'sort-by' button changes the column on which the array (and data table) is sorted
		//	Besides re-sorting the tmpArr, clicking the sort-by button also 'walks-through' the 
		//		sort-by options by incrementing the value of srtBy
	srtBy++;
	if (srtBy >= tabLst.length) { srtBy = 0; }

		// re-sort array
		//	For all current infoBoxes, srtBy==0 implies sorting on arrTmp.index
	if (srtBy == 0) {  // sorting on index
		arrTmp.sort(function(a,b){return (a.index - b.index)});
		}
		// for srtBy values > 0, the sorting order depends on the specific infoBox
		//		i.e., on the value of indBoxLst
	else if (indBoxLst == infoBxCI) { // infoBox is infoBoxCache
			// 2 options for infoBoxCache:  sort by index or FZYX values of imgID
		if (srtBy == 1) {  // sorting on FZYX
			arrTmp.sort(function(a,b){if ((a.f - b.f) != 0) {return(a.f - b.f);}
										if ((a.z - b.z) !=0) {return (a.z - b.z);}
										if ((a.y - b.y) !=0) {return (a.y - b.y);}
										if ((a.x - b.x) !=0) {return (a.x - b.x);}
										return(0);
										}); 
			}
		else { 
			alert('infoBoxSortBy(): illegal sort-by value (\"srtBy = ' + srtBy +'\") for cache infoBox'); 
			return;
			}
		}
	else if (indBoxLst == infoBxSVI) { // infoBox is infoBoxSldVw
			// 3 options for infoBoxCache:  index, FZ, or ZF
		if (srtBy == 1) {  // sorting on FZ
			arrTmp.sort(function(a,b){if ((a.f - b.f) != 0) {return(a.f - b.f);}
										if ((a.z - b.z) !=0) {return (a.z - b.z);}
										return(0);
										}); 
			}
		else if (srtBy == 2) {  // sorting on ZF
			arrTmp.sort(function(a,b){if ((a.z - b.z) != 0) {return(a.z - b.z);}
										if ((a.f - b.f) !=0) {return (a.f - b.f);}
										return(0);
										}); 
			}
		else { 
			alert('infoBoxSortBy(): illegal sort-by value (\"srtBy = ' + srtBy +'\") for slideView infoBox'); 
			return;
			}
		}
	else {
		alert('infoBoxSortBy(): illegal infoBox index (\"' + indBoxLst +'\")'); 
		return;
		}

		// update 'sort-by' button
	srtBtnNode.value = srtBy;
	srtBtnNode.innerHTML = tabLst[srtBy].btnTxt;
		// update "sort direction" button
	dirBtnNode.value = 1;
	dirBtnNode.innerHTML = "Sort large-to-small";
		// update column headings & reprint array
	infoBoxUpdtColHead(tabLst,srtBy); // update column headings
	prnTable(arrTmp);  // reprint array
	return;
	}

	//infoBoxUpdtColHead() writes the column heading text to the infoBox belonging to tabLst
	//	tabLst is the infoBox-specific array of column headings (e.g. infoCTabList or infoSVwTabList)
	//	sortBy is the value of the infoBox sortBy button
function infoBoxUpdtColHead(tabLst,srtBy) {
	var i;
	for (i = 0; i < tabLst.length; i++) {
		if (i == srtBy) {
			document.getElementById(tabLst[i].colId).innerHTML = "&darr;" + tabLst[i].colTxt;
			}
		else {document.getElementById(tabLst[i].colId).innerHTML = "&nbsp;" + tabLst[i].colTxt; }
		}
	return;
	}


	// infoBoxClose() cleans-up the data associated with an infoBox and hides the box
	//	indBoxLst is the index corresponding to this infoBox in infoBoxLst[]
function infoBoxClose(indBoxLst) {
	var i;
	var tmpArr = infoBoxList[indBoxLst].tmpArr;
	var btnSrtDir = document.getElementById(infoBoxList[indBoxLst].idSrtDir);
	var btnSrtBy = document.getElementById(infoBoxList[indBoxLst].idSrtBy);
	var btnArr = infoBoxList[indBoxLst].btnArr;
	var infoBoxNode = document.getElementById(infoBoxList[indBoxLst].idBox);
	if (tmpArr.length > 0) { tmpArr.splice(0);}  // remove elements from tmpArr; splice(0) removes entire array

		// re-set sort-by and sort large/small buttons;
	btnSrtDir.value = 1;  // default is to sort small-to-large
	btnSrtDir.innerHTML = "Sort large-to-small";  // clicking button reverses sort direction
	btnSrtBy.value = 0;  // default value for sort-by button
	btnSrtBy.innerHTML = btnArr[0].btnTxt;
		// reset heading for default column - sort small-to-large on default column
	document.getElementById(btnArr[0].colId).innerHTML = "&darr;" + btnArr[0].colTxt;
		// reset headings for other columns
	for (i = i; i < btnArr.length; i++) {
		document.getElementById(btnArr[i].colId).innerHTML = btnArr[i].colTxt;
		}
		// reset infoBox 
	infoBoxNode.style.height = "initial";
	infoBoxNode.style.display = "none";
	return;
	}



	// menuShowCacheList():
	//	* populates tmpCacheArr[] with cache list: index, image.id, F,Z,Y,X
	//	* calls menuCacheTable() to create a table containing the cache list
function menuShowCacheList() {
	var i;
	var imgIdTxt ="";	// string holding current imgId during 'for' loop
	var tmpTxt = "";	// string after "img" is sliced out of imgIdTxt
	var arrImgIdVal = [];  // array holding text strings extracode from tmpTxt
	var imgF = -1;
	var imgZ = -1;
	var imgY = -1;
	var imgX= -1;
	var htInfoBox = glbInfoBxDefHt;  // default height of infoBox
	var htBoxHeader = 85;  // height of title and buttons in pixels in infoBox
	var htTableHeader = 23; // height of infoCacheSubHead including borders
	var htTableMax = htInfoBox - htBoxHeader - htTableHeader; 
	var htRow = 21;  // height of a table row in pixels including bottom border
	var htTable = (glbImgCache.length * htRow) + 4;  // height of table in pixels including 1st row offset
//	var htTable = (30 * htRow) + 4;  // temporary to test short list
		// enter cache size into data-box in infoBox header
	document.getElementById("infoBoxCacheSzVal").innerHTML = glbImgCache.length;
		// create temporary array holding text for cache data
	if (tmpCacheArr.length > 0) { tmpCacheArr.splice(0);}  // innitialize tmpCacheArr[]; splice(0) removes entire array
	for (i = 0; i < glbImgCache.length; i++) {  // populate tmpCacheArr[]
//	for (i = 0; i < 30; i++) {  // populate tmpCacheArr[]  // temporary to test short list
		imgIdTxt = glbImgCache[i].id;
		tmpTxt = imgIdTxt.slice(3,imgIdTxt.length);  // strip "img" from tmpTxt;
		arrImgIdVal = tmpTxt.split("_");
		imgF = parseInt(arrImgIdVal[0]);
		imgZ = parseInt(arrImgIdVal[1]);
		imgY = parseInt(arrImgIdVal[2]);
		imgX = parseInt(arrImgIdVal[3]);
		tmpCacheArr[i] = {index: i, imgId: imgIdTxt, f: imgF, z: imgZ, y: imgY, x: imgX } ;
		}
		// adjust size of infoBox
	if (htTable > htTableMax) { 
		document.getElementById("infoCacheSubBody").style.height = htTableMax + "px";
		document.getElementById("infoCacheSubBody").style.width = "225px";  // includes width of scrollbar
		document.getElementById("infoBoxCache").style.height = htInfoBox + "px";
		}
	else {
		document.getElementById("infoCacheSubBody").style.height = htTable + "px";
		document.getElementById("infoCacheSubBody").style.width = "208px";  // width without scrollbar
		document.getElementById("infoCacheSubBody").style.borderRight = "hidden";
		document.getElementById("infoBoxCache").style.height = htTable + htTableHeader + htBoxHeader + "px";
		}
	infoBoxUpdtColHead(infoCTabList,0);  // update columns in case table had been used previously
	infoMakeCacheTable(tmpCacheArr);
	infoBxInitPos("infoBoxCache");
	document.getElementById("infoBoxCache").style.display = "block";  //show infoBox
	return;
	}

	// infoMakeCacheTable() creates a text string containing the HTML code (with data) to display
	//		the cache-list infoBox table.  Note that this function does NOT create the table header
	//		(the table header is created by hard-code in the *.htm file).
	//	infoMakeCacheTable() is passed a pointer to the tmpArr containing the data to be displayed
	//		in the table.  This probably will always be tmpCacheArr, but passing the pointer gives
	//		us flexibility to use multiple tmpArr's containing cache data if that becaomes useful later.
function infoMakeCacheTable(dataArr) {
	var i;
	var subDivNode = document.getElementById("infoCacheSubBody");
	var tabTxt = '<table class="tabCache">';
	tabTxt += '<tr class="tabCache"><td class="tabCache" style="width: 49px; height: 3px"></td>';
	tabTxt += '<td class="tabCache" style="width: 139px; height: 3px"></td></tr>';
	for (i = 0; i < dataArr.length ; i++ ) {
		tabTxt += "<tr class='tabCache'><td class='tabCache'>" + tmpCacheArr[i].index;
		tabTxt += "</td><td class='tabCache'>" + tmpCacheArr[i].imgId + "</td></tr>";
		}
	tabTxt += '</table>';
	subDivNode.innerHTML = tabTxt;
	subDivNode.scrollTop = 0;
	return;
	}

	// menuShowSldVwList() is called when the "Show view-plane list" button ("menuSldVwList")
	//		in the "Slide Info" menu is clicked
function menuShowSldVwList() {
	var i;
		//widthInfoBox is the default width of this infoBox; in the unlikely event that
		//		the height of the table exceeds the infoBox maximum height, the width
		//		of the box will be increased to accommodate scroll bar (see below)
	var widthScrollBar = 17;
	var htInfoBox = glbInfoBxDefHt;  // default height of infoBox
	var htBoxHeader = 85;  // height of title and buttons in pixels in infoBox
	var htTableHeader = 51; // height of <thead> = 3 lines - (space for 2-line header: tdHeight - fontSize) - 1?
	var htTableMax = htInfoBox - htBoxHeader - htTableHeader; 
	var htRow = 21;  // height of a table row in pixels including bottom border
	var htTable = sldVw.length * htRow;  // height in pixels of table body
//	var htTable = (30 * htRow) + 4;  // temporary to test short list

		// enter sldVw[] size into data-box in infoBox header
	document.getElementById("infoBoxSVwSzVal").innerHTML = sldVw.length;

		// tmpSldVwLstArr is a temporary array that holds data about sldVw[] 
	if (tmpSldVwLstArr.length > 0) {   // re-initialize if tmpSldVwLstArr already contains data 
		tmpSldVwLstArr.splice(0);  // remove data from array; splice(0) removes entire array
		}
		// populate tmpSldVwLstArr[] with data from sldVw[]
	for (i = 0; i < sldVw.length; i++) {  // copy data from each slideView-plane in sldVw[]
		tmpSldVwLstArr[i] = {
				index: i,
				f: sldVw[i].f,
				z: sldVw[i].z,
				vis: sldVw[i].sldVis,
				zMult: sldVw[i].zMult,
				tiStrtX: sldVw[i].tiStrtXId,
				tiNumX: sldVw[i].tiMxNumX,
				tiStrtY: sldVw[i].tiStrtYId,
				tiNumY: sldVw[i].tiMxNumY,
				left: parseInt(sldVw[i].sldNode.style.left),
				top: parseInt(sldVw[i].sldNode.style.top),
				dbStrtX: sldVw[i].dbStrtXId,
				dbNumX: sldVw[i].dbMxNumX,
				dbStrtY: sldVw[i].dbStrtYId,
				dbNumY: sldVw[i].dbMxNumY
				};
		}
		// set height & width of infoBox (<div id="infoBoxSldVw">)
	if (htTable > htTableMax) { 
			// it is exceptionally unlikely that the height of the slideView infoBox table will every exceed
			//		maximum height of the infoBox contents (data from ~24 slideView planes), but if this ever
			//		happens, we'll increase the width of the infoBox to accommodate the scroll bar
		document.getElementById("infoBoxSldVw").style.width = widthSldVwInfoBoxDefault + widthScrollBar +"px";
		document.getElementById("infoBoxSldVw").style.height = htInfoBox +"px";
		}
	else {   // set infoBox height to match table + header height
		document.getElementById("infoBoxSldVw").style.width = widthSldVwInfoBoxDefault +"px";
		document.getElementById("infoBoxSldVw").style.height = htTable + htTableHeader + htBoxHeader + "px";
		}

		// update table header, create table body & display box
	infoBoxUpdtColHead(infoSVwTabList,0);
	infoMakeSldVwTable(tmpSldVwLstArr);
	infoBxInitPos("infoBoxSldVw");
	document.getElementById("infoBoxSldVw").style.display = "block";  //show infoBox
	return;
	}


	// infoMakeSldVwTable() creates a text string containing the HTML code (with data) to display
	//		the slideView infoBox table.  
	//	Note that this function only writes the code for the table body.  It does NOT create 
	//		the table header (the table header is created by hard-code in the *.htm file).
	//	The function writes the table string to the contents of <tbody id="infoSVwLstSubBody">
	//	The function is passed a pointer to the tmpArr containing the data to be displayed
	//		in the table.  This array probably will always be tmpSldVwLstArr, but passing the pointer gives
	//		us flexibility to use multiple tmpArr's containing cache data if that becaomes useful later.
	//		The array MUST have the same format as tmpSldVwLstArr (see menuShowSldVwList(), above).
function infoMakeSldVwTable(dataArr) {
	var i;
	var tabTxt = "";   // string holding table HTML code
	for (i = 0; i < dataArr.length; i++) {
		tabTxt += '<tr class="tabSVw">';
				// use checkboxes for "is visible" cell
			tabTxt += '<td class="tabSVw" style="width: 26px; font-size: 15px; padding: 0px; text-align: center">';
				if (dataArr[i].vis) { tabTxt += "&#9745;"; }
				else { tabTxt += "&#9744;"; }
				tabTxt += '</td>';
					// index
			tabTxt += '<td class="tabSVw" style="width: 58px; padding-right: 25px">';
				tabTxt += dataArr[i].index;
				tabTxt += '</td>';
					// F (focal plane)
			tabTxt += '<td class="tabSVw" style="width: 58px; padding-right: 25px">';
				tabTxt += dataArr[i].f;
				tabTxt += '</td>';
					// Z (zoom level)
			tabTxt += '<td class="tabSVw" style="width: 58px; padding-right: 25px">';
				tabTxt += dataArr[i].z;
				tabTxt += '</td>';
					// zMult (zoom multiplier)
			tabTxt += '<td class="tabSVw" style="width: 58px; padding-right: 8px">';
				tabTxt += dataArr[i].zMult;
				tabTxt += '</td>';
					// tiStrtXId
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].tiStrtX;
				tabTxt += '</td>';
					// tiMxNumX
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].tiNumX;
				tabTxt += '</td>';
					// tiStrtYId
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].tiStrtY;
				tabTxt += '</td>';
					// tiMxNumY
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].tiNumY;
				tabTxt += '</td>';
					// left
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].left;
				tabTxt += '</td>';
					// top
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].top;
				tabTxt += '</td>';
					// dbStrtXId
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].dbStrtX;
				tabTxt += '</td>';
					// dbMxNumX
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].dbNumX;
				tabTxt += '</td>';
					// dbStrtYId
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].dbStrtY;
				tabTxt += '</td>';
					// dbMxNumY
			tabTxt += '<td class="tabSVw" style="width: 86px">';
				tabTxt += dataArr[i].dbNumY;
				tabTxt += '</td>';
		tabTxt += '</tr>';
		}

	document.getElementById("infoSVwLstSubBody").innerHTML = tabTxt; //write text to table
	document.getElementById("infoSVwContent").scrollTop = 0;  //reset scroll to top of table
	return;
	}


	// NOTE: infoBoxList[] is a global varialble, but it has to be listed after the functions addressed by funcPrn are defined.
	//		Thus it is listed at the end of jrscpMenu.js, rather than in jrscpGlobal.js
	//infoBoxList[] is an array used by infoBoxFlipOrder(), which is invoked by the 'btnSortOrder' buttons on infoBoxes
	//		See list of variables corresponding to the indices of this array in jrscpGlobal.js
	//	idSrtBy is the id of the infoBox's 'btnSortBy' button.  The value of this button is used to determine
	//		the column on which the tmpArr is sorted.
	//	idSrtDir is the id of the infoBox's 'sort small-to-large/large-to-small button
	//	tmpArr is a pointer to the tmpArr used by the infoBox's table
	//	btnArr is a pointer to the (infoBox-specific) array that lists id's & text for column headings,
	//		and the text for the corresponding sort-by button.
	//		The index for this array is the VALUE OF THE sort-by button!
	//	funcMkTab is the (infoBox-specific) function that is invoked to create the infoBox's table
var infoBoxList = [
			{idBox: "infoBoxCache", idSrtBy: "infoCacheBtnSortBy", idSrtDir: "infoCacheBtnSortDir",
					tmpArr: tmpCacheArr, btnArr: infoCTabList, funcMkTab: infoMakeCacheTable },
			{idBox: "infoBoxSldVw", idSrtBy: "infoSVwBtnSortBy", idSrtDir: "infoSVwBtnSortDir",
					tmpArr: tmpSldVwLstArr, btnArr: infoSVwTabList, funcMkTab: infoMakeSldVwTable }
//				, 
//			{idBox: "", idSrtBy: "", idSrtDir: "", tmpArr: null, btnArr: null, funcPrn: null}
			];


	//  aboutBox is a generic infoBox used to display various information relative to the probram & project.
	//		Each menu element that utilizes this box generates the title and body text, and then passes
	//		these formatted strings to aboutDispBx(), formats the box abd inserts the title & body texts
	//		into the box.
	//	(1)	adjusts the width, top, & left of this box.  If not specified, default values are used.
	//	(2)	by default the box utilizes a "min-height = 150px" statement to set the height of this
	//			"postiion: fixed" box.  This meains that the height of the box will automatically increase
	//			to adjust to the amount of text in the body of the box.  If a lot of text is included
	//			(e.g., possibly "About our sponsors", the style of the box should be adjusted to a fixed 
	//			amount and display should be set to "auto".  NOTE:  this means that all other functions that
	//			open the box should specify "height: initial" to avoid uncexpected results if the aboutBox is
	//			is used multiple times during a session.
	//	(3)	give the title of the box, in a text string containing standard HTML code as innerHTML for 
	//			"aboutBoxHdrTitle" (which is a <span> element).  This section was rewritten (with an ugly
	//			set of nested <span> elements on 12/20/19 to allow for adjusting size of text so that 
	//			the title fits even if Arial is used (by the iPad) rather than Calibri for the title font
	//	(4)	enter into innerHTML for "aboutBoxText" (which is a <div> element) the contents of the body of 
	//			the aboutBox as a string containing standard HTML code.

	// aboutDispBx() was written on 12/20/19 to handle the steps in formatting & displaying the aboutBox
	//		that are common to all aboutBoxes.  This function is called by the aboutXXXXOpen() functions
	//		that now just create the title and body formatted text strings.
function aboutDispBx(abtTitle,abtBody) {
	var txtTrans = "";
	var boxWidth = parseInt(document.getElementById("aboutBox").style.width);
	var btnWidth = 140;
	var btnLeft = (boxWidth - btnWidth)/2;
	document.getElementById("aboutCloseBtn").style.left = btnLeft +"px";
	document.getElementById("aboutCloseDiv").style.width = boxWidth - 2 + "px";
			// set text in Header & Body
	var titleNode = document.getElementById("aboutBoxHdrTitle");
	titleNode.innerHTML = abtTitle;  // set header
	document.getElementById("aboutBoxText").innerHTML = abtBody;     // set body
			// display aboutBox
	infoBxInitPos("aboutBox");
	document.getElementById("aboutBox").style.display = "block";
			// check for title fitting => must do after displaying box
	var mvBtnWdth = 45;  // width of infoMvBtn
	var titleMarg = 10;   // extra margin between move button and title
	var titleWdth = titleNode.offsetWidth;
	var txtRatio =  (boxWidth - (2 * (mvBtnWdth + titleMarg))) / titleWdth;
		// tried to use the "transform:scale(x,y)" style statement, but it wouldn't work
		//	so I decreased font size instead.
	if (txtRatio < 1) {  // decrease character width to fit
		txtTrans = "font-size: " + Math.round((txtRatio * 32)) + "px";
		titleNode.innerHTML = "<span style='" + txtTrans + "'>" + abtTitle + "</span>";
		}
		// at some point, may also want/need to test offsetHeight on "aboutBoxText" and
		//	use a scroll-bar if the body of the text extends past the bottom of the window
	return;
	}



function aboutMicroscopeOpen() {
			// variables used for email references
	var emailBug = "MicroscopeBugs";
	var emailComment = "Microscope";
	var emailRef = "";
			// title
	var abtTitle = "About PNWU Virtual Microscope";
			// body of aboutBox
				// title
	var abtBodyTxt = "<p style='text-align: center; font-size:18px; line-height: 0.95'>";
	abtBodyTxt += "<b>PNWU Microscope Viewer, version " + viewerVersion + ".</b>";
	abtBodyTxt += " (<span style='font-size: 16px'>" + viewerDate + "</span>)<span style='font-size: 12px'>";
	abtBodyTxt += "<br>&copy;&nbsp;" + viewerCopyrightDate + " &nbsp;Pacific Northwest University of Health Sciences</span></p>";
				//License => software license
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='text-indent: -10px; padding-top: 8px; border-top: 1px solid black'><b>Copyright &amp; Licenses:</b> ";
	abtBodyTxt += "&nbsp;  The computer software comprising the PNWU Virtual Microscope, which is copyrighted (";
	abtBodyTxt +=  "<font style='font-size:12px'>" + viewerCopyrightDate + "</font>) by Pacific Northwest University of ";
	abtBodyTxt += "Health Sciences, is free software: you may redistribute it and/or modify it under the terms of the "; 
	abtBodyTxt += "<a href='https://www.gnu.org/licenses/gpl-3.0.html' target='_blank'>GNU General Public License</a>";
	abtBodyTxt += ", either version 3 of the GNU License, or any later version, as published by the ";
	abtBodyTxt += "<a href='https://www.gnu.org/licenses/licenses.html' target='_blank'>Free Software Foundation</a>. &nbsp;";
	abtBodyTxt += "This software is distributed WITHOUT ANY WARRANTY; without even the implied warranty of ";
	abtBodyTxt += "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.</span>";
				//License => image license
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='padding-bottom: 10px'>";
	abtBodyTxt += "The images of microscope specimens displayed by the PNWU Virtual Microscope ";
	abtBodyTxt += "may be copyrighted by the individual or institution providing that specific virtual slide.&nbsp; ";
	abtBodyTxt += "However, unless indicated otherwise, these images are free and may be downloaded &amp; used under a ";
	abtBodyTxt += "<a href='http://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank'>";
	abtBodyTxt += "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>. &nbsp;";
	abtBodyTxt += "When a virtual slide is loaded into this viewer, you can use the ";
	abtBodyTxt += "\"<font style='font-size:12px'>View</font>\"&rarr;";
	abtBodyTxt += "\"<font style='font-size:12px'>Show slide source...</font>\" button on the menu ";
	abtBodyTxt += "to see the slide's source and licensing information.</span>";
				// authorship & credits
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='text-indent: -10px; padding-top: 8px; border-top: 1px solid black'>";
	abtBodyTxt += "The computer code for this virtual microscope vierwer was written by James Rhodes, PhD, ";
	abtBodyTxt += "as part of the PNWU Virtual Microscope Project, which is headed by James Rhodes, ";
	abtBodyTxt += "Associate Professor of Histology, and John DeVore, Director of Network Services, ";
	abtBodyTxt += "at Pacific Northwest University of Health Sciences in Yakima, Washington, U.S.A.</span>";

	abtBodyTxt += "<span class='aboutBodyTxtClass' style='padding-bottom: 8px'>";
	abtBodyTxt += "This virtual microscope uses an image-tile architecture ";
	abtBodyTxt += "similar to that used by the Google Maps API.&nbsp; Virtual microscopes using this tiling ";
	abtBodyTxt += "architecture have been described previously (<span style='font-size: 12px'>Triola&nbsp;MM, "
	abtBodyTxt += "Holloway&nbsp;WJ. (2011) \"<i>Enhanced virtual microscopy for collaborative education</i>\" "
	abtBodyTxt += "<u>BMC Med Educ</u>. 11:4:</span> <span style='font-size: 10px; font-stretch: condensed'>"
	abtBodyTxt += "<a href='http://www.biomedcentral.com/1472-6920/11/4' target='_blank'>";
	abtBodyTxt +=  "http://www.biomedcentral.com/1472-6920/11/4</a></span>).</span>";
			// email info
	emailRef = "mailto: " + emailBug + "@pnwu.edu";
	abtBodyTxt += "<div style='padding: 0px 10px 20px'>Please report any programming errors (\"bugs\") to:  "; 
	abtBodyTxt += "<a href='" + emailRef + "'>" + emailBug + "@pnwu.edu</a>.<br>" 
	emailRef = "mailto: " + emailComment + "@pnwu.edu";
	abtBodyTxt += "Comments or questions regarding the PNWU Microscope should be directed to:  ";
	abtBodyTxt += "<a href='" + emailRef + "'>"; 
	abtBodyTxt += emailComment + "@pnwu.edu</a>.</div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}
	

function aboutTchScrOpen() {
			// title
	var abtTitle = "PNWU Microscope with a Touchscreen";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";;
	abtBodyTxt += "The PNWU Microscope can be used with a touchscreen device, although it ";
	abtBodyTxt += "seems to work better with a computer mouse ";
	abtBodyTxt += "(<font style='font-size: 12px'>because the mouse's cursor is more precise ";
	abtBodyTxt += "and obscures less of the field than a finger</font>).</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>X,Y coordinates:</b> &nbsp;<b>ONE</b> finger on the slide will display the x,y coordinates ";
	abtBodyTxt += "of the finger\'s location in the appropriate boxes on the menu.&nbsp; "; 
	abtBodyTxt += "This is equivalent to moving the computer's mouse-cursor across the specimen ";
	abtBodyTxt += "without depreessing the buttons on the mouse.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Dragging the specimen:</b> &nbsp;moving <b>TWO</b> fingers in unison on the slide will drag ";
	abtBodyTxt += "the specimen across the field-of-view.  This is equivalent to depressing the left button ";
	abtBodyTxt += "on the mouse, and then using the mouse to drag the specimen across the field of view.&nbsp; ";
	abtBodyTxt += "It is recommended that you do not touch the screen with more than two fingers.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Changing zoom level or focal plane:</b> &nbsp;pinching or spreading <b>TWO</b> fingers ";
	abtBodyTxt += "on the slide will change the magnification or focus ";
	abtBodyTxt += "(<font style='font-size: 12px'>depending on whether the \"mouse wheel\" is set to control ";
	abtBodyTxt += "the zoom level or focal plane</font>). ";
	abtBodyTxt += "Pinching two fingers together zooms-out or focuses up.&nbsp; ";
	abtBodyTxt += "Conversely, spreading two fingers apart zooms-in or focuses down.&nbsp; ";
	abtBodyTxt += "This is equvalent to rotating the mouse-wheel to change magnification or focus.&nbsp; "
	abtBodyTxt += "Because of a computer-bug that we haven\'t yet been able to exterminate, ";
	abtBodyTxt += "pinching or spreading your fingers usually will only change one or two zoom levels or ";
	abtBodyTxt += "focal planes; you then must lift BOTH of your fingers off of the screen before proceeding ";
	abtBodyTxt += "(<font style='font-size: 12px'>e.g., placing both fingers back on the screen for another ";
	abtBodyTxt += "pinch or spread</font>).</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Moving the slide with buttons:</b> &nbsp;placing a finger on one of the Up/Down/Left/Right ";
	abtBodyTxt += "buttons (<font style='font-size: 12px'>on the \"View\" menu or navigator</font>) will cause the ";
	abtBodyTxt += "field-of-view to move repetitively (<font style='font-size: 12px'>in the ";
	abtBodyTxt += "indicated direction</font>) until the finger is lifted.&nbsp; ";
	abtBodyTxt += "This is equivalent to depressing the mouse-button on these controls.&nbsp; ";
	abtBodyTxt += "The \"Settings\" menu &rarr; \"Make arrows MOVE SLIDE\" button can be used ";
	abtBodyTxt += "to change the direction of motion, so that depressing the arrow button causes ";
	abtBodyTxt += "the slide to \'step\' (<font style='font-size: 12px'>in the direction indicated ";
	abtBodyTxt += "by the arrow</font>) across the \'fixed\' field-of-view ";
	abtBodyTxt += "(<font style='font-size: 12px'>instead of the field-of-view moving across the ";
	abtBodyTxt += "slide</font>).</li>"
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Other menu or navigator buttons:</b> &nbsp;the other controls on the menu and navigator ";
	abtBodyTxt += "respond to a \'click\':&nbsp; touching the control \'cocks\' the button and raising your ";
	abtBodyTxt += "finger causes the indicated action to occur.&nbsp; ";
	abtBodyTxt += "This is equivalent to clicking the mouse-button on the control.</li>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}

function aboutMusCntrlOpen() {
			// title
	var abtTitle = "PNWU Microscope with a Computer Mouse";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";;
	abtBodyTxt += "The PNWU Microscope was designed to be controlled by a computer mouse.</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>X,Y coordinates:</b>&nbsp; the location of an object within ";
	abtBodyTxt += "the specimen can be determined by moving the computer's mouse ";
	abtBodyTxt += "(<font style='font-size: 12px'>without depressing the mouse\'s buttons</font>) ";
	abtBodyTxt += "so that the mouse cursor is positioned over the object of interest.&nbsp; ";
	abtBodyTxt += "The coordinates of the mouse cursor (<font style='font-size: 12px'>";
	abtBodyTxt += "in pixels at the highest zoom-level</font>) relative to the upper-left ";
	abtBodyTxt += "corner of the specimen is displayed in the appropiate boxes on the menu.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Dragging the specimen:</b>&nbsp; the slide can be moved by using buttons ";
	abtBodyTxt += "on the navigator &amp; menu (<font style='font-size: 12px'>see below</font>) ";
	abtBodyTxt += "or by dragging the specimen using the computer mouse.&nbsp;	";
	abtBodyTxt += "To drag the specimen, position the mouse\'s cursor over the slide, depress the ";
	abtBodyTxt += "mouse\'s left button, and then move the mouse (<font style='font-size: 12px'>";
	abtBodyTxt += "with the mouse\'s left button depressed</font>).&nbsp; ";
	abtBodyTxt += "The specimen will be moved (<font style='font-size: 12px'>";
	abtBodyTxt += "dragged</font>) with the mouse cursor as the mouse moves across the field-of-view.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Changing zoom level or focal plane:</b>&nbsp; the magnification or focus ";
	abtBodyTxt += "(<font style='font-size: 12px'>for multifocal-plane specimens</font>) ";
	abtBodyTxt += "of the specimen can be changed using the mouse\'s wheel ";
	abtBodyTxt += "(<font style='font-size: 12px'>or by by \'clicking\' buttons on the \"View\" ";
	abtBodyTxt += "menu &amp; navigator</font>).&nbsp; ";
	abtBodyTxt += "The \"mouse-wheel control\" selector ";
	abtBodyTxt += "(<font style='font-size: 12px'>on the \"View\" menu &amp; navigator</font>) ";
	abtBodyTxt += "determines whether rolling the mouse wheel changes the zoom level or focal plane.&nbsp; ";
	abtBodyTxt += "Rolling the mouse wheel forward (<font style='font-size: 12px'>away from the ";
	abtBodyTxt += "user</font>) zooms-in or focuses down; rolling the mouse wheel ";
	abtBodyTxt += "backwards (<font style='font-size: 12px'>towards from the user</font>) ";
	abtBodyTxt += "zooms-out or focuses up.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Moving the slide with buttons:</b>&nbsp; in addition to dragging the specimen ";
	abtBodyTxt += "(<font style='font-size: 12px'>see above</font>), ";
	abtBodyTxt += "the slide also can be moved using the Up/Down/Left/Right buttons ";
	abtBodyTxt += "(<font style='font-size: 12px'>arrows</font>) on the";
	abtBodyTxt += "\"View\" menu and navigator.&nbsp; ";
	abtBodyTxt += "Depressing the button on the computer\'s mouse while the mouse cursor is ";
	abtBodyTxt += "located over one of these controls will cause the field-of-view to move ";
	abtBodyTxt += "repetitively (<font style='font-size: 12px'>in the direction indicated by "
	abtBodyTxt += "the arrow</font>) until the mouse\'s button is released.&nbsp; ";
	abtBodyTxt += "The buttons on the \"View\" menu and the single-arrow buttons on the ";
	abtBodyTxt += "navigator move the slide in smaller steps, while the triple-arrow buttons on the ";
	abtBodyTxt += "navigator move the slide in larger steps.&nbsp; ";
	abtBodyTxt += "If the &laquo;shift&raquo; key is depressed before depressing the mouse ";
	abtBodyTxt += "button, the size of each \'step\' is increased.&nbsp; ";
	abtBodyTxt += "The \"Settings\" menu &rarr; \"Make arrows MOVE SLIDE\" button can be used ";
	abtBodyTxt += "to change the direction of motion, so that depressing the arrow button causes ";
	abtBodyTxt += "the slide to \'step\' (<font style='font-size: 12px'>in the direction indicated ";
	abtBodyTxt += "by the arrow</font>) across the \'fixed\' field-of-view ";
	abtBodyTxt += "(<font style='font-size: 12px'>instead of the field-of-view moving across the ";
	abtBodyTxt += "slide</font>).</li>"
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>Other menu or navigator buttons:</b>&nbsp; except for the Up/Down/Left/Right ";
	abtBodyTxt += "buttons (<font style='font-size: 12px'>see above</font>), the controls ";
	abtBodyTxt += "(<font style='font-size: 12px'>buttons</font>) on the menu and navigator respond ";
	abtBodyTxt += "when the mouse button is \'clicked\' on one of these controls.&nbsp; ";
	abtBodyTxt += "Depressing the mouse button when the mouse cursor is positioned over a ";
	abtBodyTxt += "menu or navigator control \'cocks\' the menu/navigator button, ";
	abtBodyTxt += "and releasing the mouse button actuates the \'click\' that causes ";
	abtBodyTxt += "the indicated action to occur.</li>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}


function aboutPNWUOpen() {
			// title of aboutBox
	var abtTitle = "About PNWU";
			// body of aboutBox
	var abtBodyTxt = "<img src='../images/BHH.jpg' alt='' style='width: 698px; height: 210px; border-bottom: 5px solid rgb(224,128,128)'>";
	abtBodyTxt += "<div style='padding: 0px 10px 5px'>";
	abtBodyTxt += "<p>Founded in 2005 as a community-based initiative to address the shortage of physicians ";
	abtBodyTxt += "in the rural Pacific Northwest, <b>Pacific Northwest University of Health Sciences</b> ";
	abtBodyTxt += "(\"<b>PNWU</b>\") is a private non-profit osteopathic medical school whose mission is to ";
	abtBodyTxt += "\"<i>educate and train health care professionals, emphasizing service among rural and ";
	abtBodyTxt += "medically underserved communities throughout the Northwest</i>.\"&nbsp; During the first two ";
	abtBodyTxt += "years of the four-year Doctor of Osteopathy (\"DO\") program, instruction is provided ";
	abtBodyTxt += "primarily at PNWU's main campus in Yakima, Washington (U.S.A).&nbsp; Instruction during "
	abtBodyTxt += "the 3<sup style='font-size: 8px'>rd</sup> and 4<sup style='font-size: 8px'>th</sup> years of the DO program is primarily via ";
	abtBodyTxt += "clerkships at hospitals, clinics, and physician's offices located throughout the Pacific Northwest.</p>";
	abtBodyTxt += "<p>The PNWU Virtual Microscope that you are using was created for use in the histology laboratory sessions ";
	abtBodyTxt += "that are part of the first two years of the DO curriculum at PNWU.</p>"
	abtBodyTxt += "<p>More information regarding PNWU's College of Osteopathic Medicine can be found at the University's website:&nbsp; ";
	abtBodyTxt += "<a href='https://www.pnwu.edu/inside-pnwu/college-osteopathic-medicine/about-com' target='_blank'>www.pnwu.edu</a>.</p>";
	abtBodyTxt += "</div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}


function aboutSponsorOpen() {
			// title of aboutBox
	var abtTitle = "Financial Support";
			// body of aboutBox
	var abtBodyTxt = "<div style='padding: 0px 10px 5px'>";
	abtBodyTxt += "<p>The development and maintenance of PNWU's virtual microscope has been made possible through the ";
	abtBodyTxt += "generous financial support of the individuals and organizations listed below.&nbsp; Medical education ";
	abtBodyTxt += "is a \'team\' effort, and we are grateful that those listed below have joined us in this effort.</p>"
	abtBodyTxt += "<p style='text-align: center; font-size:20px'><b>This menu box will exist only if we receive extramural funding.</b></p>";
	abtBodyTxt += "<p>If/when we have funding, this space will contain a list of our sponsors ";
	abtBodyTxt += "which would be developed in collaboration with the Development Office and could involve input from the ";
	abtBodyTxt += "donors.  This space can contain images and internet-links, in addition to text, which could ";
	abtBodyTxt += "make making a gift more attractive to the donors.&nbsp; ";
	abtBodyTxt += "The list could be organized by size/date of gift.</p>";
	abtBodyTxt += "</div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}


function aboutVirSlidesOpen() {
			// title of aboutBox
	var abtTitle = "Virtual slides used by the PNWU Microscope";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";
	abtBodyTxt += "<div style='margin: 0px; padding: 0px 0px 5px 0px'>";
	abtBodyTxt += "Virtual slides normally are created by using a (<font style='font-size: 12px'>\"real\"</font>) microscope ";
	abtBodyTxt += "to digitally scan actual (<font style='font-size: 12px'>\"real\"</font>) specimens that usually are sections ";
	abtBodyTxt += "of tissue mounted on glass microscope slides.&nbsp; ";
	abtBodyTxt += "The digital image (<font style='font-size: 12px'>i.e., the virtual slide</font>) normally is owned by ";
	abtBodyTxt += "the person or organization that scanned the \"real\" slide, and may be protected by copyright.&nbsp; ";
	abtBodyTxt += "When the PNWU Virtual Microscope displays a virtual slide, the person and organization that provided ";
	abtBodyTxt += "the virtual slide normally is shown in the upper-right corner of the window; ";
	abtBodyTxt += "use \"View\" menu &rarr; \"Show slide source\" to see this information.";
	abtBodyTxt += "</div>";
	abtBodyTxt += "<div style='margin: 0px; padding: 0px 0px 8px 0px'>";
	abtBodyTxt += "Virtual slides are stored in databases that can be shared, and the virtual slides used ";
	abtBodyTxt += "by the PNWU Virtual Microscope derive from several of these shared databases:";
	abtBodyTxt += "</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>PNWU:</b>&nbsp; Virtual slides are created in-house at Pacific Northwest University of ";
	abtBodyTxt += "Health Sciences (<font style='font-size: 12px'>PNWU</font>).&nbsp; ";
	abtBodyTxt += "The origin of the \"real\" glass microscope slides used to create virtual slides at PNWU is described ";
	abtBodyTxt += "in \"About\" menu &rarr; \"About slides scanned at PNWU\".</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>University of Michigan:</b>&nbsp; PNWU received a copy of the University of Michigan virtual slide database through the generosity of ";
	abtBodyTxt += "J.&nbsp;Matthew&nbsp;Velkey, PhD, and Michael&nbsp;Hortsch, PhD, University of Michigan Medical School.&nbsp; ";
	abtBodyTxt += "For more about this database of virtual slides, see:&nbsp; ";
	abtBodyTxt += "<a href='https://histology.medicine.umich.edu/full-slide-list' target='_blank' style='font-size: 12px'>";
	abtBodyTxt += "https://histology.medicine.umich.edu/full-slide-list</a>.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>VMD:</b>&nbsp; The American Association for Anatomy maintains the Virtual Microscopy Database, ";
	abtBodyTxt += "which is a is a repository containing virtual slides contributed by many universities world-wide.&nbsp; ";
	abtBodyTxt += "For more about this database, see:&nbsp; ";
	abtBodyTxt += "<a href='http://www.virtualmicroscopydatabase.org/' target='_blank' style='font-size: 12px'>";
	abtBodyTxt += "http://www.virtualmicroscopydatabase.org/</a>.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>University of Iowa:</b>&nbsp; PNWU obtained a copy of the University of Iowa's virtual slide database ";
	abtBodyTxt += "through the assistance of Fred R Dee, MD, University of Iowa.</li>"
	abtBodyTxt += "</ul></div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}

function aboutScanSlidesOpen() {
			// title of aboutBox
	var abtTitle = "Slides scanned at PNWU";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";
	abtBodyTxt += "<div style='margin: 0px; padding: 0px 0px 8px 0px'>";
	abtBodyTxt += "The \"real\" (<font style='font-size: 12px'>glass</font>) microscope slides that were scanned at ";
	abtBodyTxt +="PNWU to create \"virtual\" slides come from several sources:";
	abtBodyTxt += "</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>UCSF:</b>&nbsp; Through the generosity of Steven Rosen, PhD, at the University of California, San Francisco ";
	abtBodyTxt += "(<font style='font-size: 12px'>UCSF</font>), PNWU was given a partial set of UCSF\'s student slides when UCSF ";
	abtBodyTxt += "discarded their collection of glass teaching slides (<font style='font-size: 12px'>which were no longer used after ";
	abtBodyTxt += "UCSF switched to using virtual slides for teaching</font>).</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>UM:</b>&nbsp; Through the generosity of Michael Hortsch, PhD, at the University of Michigan, ";
	abtBodyTxt += "PNWU received several student slide sets when the University of Michigan Medical School discarded their collection ";
	abtBodyTxt += "of glass teaching slides (<font style='font-size: 12px'>the University of Michigan now uses ";
	abtBodyTxt += "virtual slides for teaching histology</font>).&nbsp; ";
	abtBodyTxt += "In addition, Dr.&nbsp;Hortsch has graciously loaned additional slides from the University of Michigan collection ";
	abtBodyTxt += "for PNWU to scan.</li>";
	abtBodyTxt += "</ul></div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}



