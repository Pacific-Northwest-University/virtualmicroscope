// jrscpChgSet1.js
//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrscpChgSet1.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	The "PNWU Microscope" consists of two parts a Viewer and a SlideBox.  This file 
//		(jrscpChgSet1.js) is part of the Viewer.  Currently, the Viewer consists 
//		of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheets
//		- 11 javascript files (including jrscpChgSet1.js)
//		- three PHP files
//	jrscpChgSet1.js and jrscpChgSet2.js contain javascript functions that allow the user to change the value of 
//		many of the program's global variables.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

//  jrscpChgSet1.js was derived by splitting jrscpChgSet.js into two files on 4/28/20.  This was done
//		because the single file (jrscpChgSet.js) was becoming too large to work with easily.
//		After we've finished writing the "Change Setting" code, we should consider re-combining the
//		two files (jrscpChgSet1.js and jrscpChgSet2.js) back into a single file, since all of the
//		functions contained in these files are related
//	jrscpChgSet1.js contains the functions involved in initializing glbChgSetData[] and in building
//		"Change Setting" boxes.
//	jrscpChgSet2.js contains the functions involved in handling input of values for the various global
//		variables, including error-checking.


// jrscpChgSet.js, which was originally written in the summer/fall of 2019, 
//	was completely re-written, more-or-less "from scratch" in April 2020

	// glbChgSetData[] was moved to jrscpGlobal.js on 4/28/20

// items whose warnVals are contingent on other values and need to be updated when other value changes
//	cXYOffset - absMax is glbSldXYBuf; warnMax depends on glbSldXYBuf => need to check on value for warnMin
//	cFBuf - dependent on glbSldMaxF; this will be NaN when program initializes.  Need to set this when slide is loaded
//	cMaxF = dependent on dbMaxF, destArrayMaxNum => this may be handled when slide is loaded (CHECK!) 
//			- I think that this needs to be POSITIVE_INFINITY UNTIL SLIDE IS LOADED
//	cZFLim => dependent on dbMaxZ - think that this needs to be POSITIVE_INFINITY until slide is loaded
//	cZBuf => this will be NaN when program initializes.  Need to set this when slide is loaded
//	cFZBuf => absMax is min(ZBuf,FBuf) - this needs to be set dynamically
//	cMxDestArr => warnMin should be glbSldMaxF; warnMax should be dbMaxF + 2
//	cMvBtnStp:  warn if cMvBtnStp * cMvBtnMult > 256
//	cMvBtnMult:  warn if cMvBtnStp * cMvBtnMult > 256


// ******************************************************************
// ************                                          ************  
// ************        Initialize glbChgSetData[]        ************  
// ************                                          ************  
// ******************************************************************


	// 4/24/20: chgInitArr() creates & initializes several of the elements within the chgSetData objects
	//	in glbChgSetData[].  This function is called only once, in prgInitWnd().  This function was
	//	written to decrease the amount of typing (and possibility of errors) when adding additional
	//	objects to glbChgSetData[]; it does this by creating elements within the object that have 
	//	standardized values when the program loaded.  The values that are added are:
	//		.lcTxtId => lower-case version of .txtId (without initial "c". This is used when interpreting 
	//			command-line arguments.  Set to.txtId.slice(1,txtId.length).toLowerCase()
	//		.valPrev is the value of the global variable when the "ChangeSetting" box is opened.  This value is set by
	//			chgUpdateArr('update') from within chgBuildBox() immediately before creating <div id="chgContentBx">.
	//			It is initialized as: Number.NaN
	//		.valCur isthe current validated proposed setting-value while the "Change Setting" box is open
	//			This is NOT the value of the global varialble, but rather an interim value that the user may
	//			change multiple times before clicking "submit".  When the user clicks submit, the global variable
	//			is set to this value.  This element (.valCur) is initialized as: Number.NaN.
	//		.valNew holds the new value for the setting returned by chgTxtInput(), chgBtnClk(), or cmdLineRead()
	//			until this value (.valNew) is vetted by chgVerifyVal().  It is intialized as Number,NaN
	//		.warnSuppress indicates whether chgVerifyVal will pass "warnMin" and/or "warnMax" values to
	//			chgOpenUsrRespBox():  
	//				0 => pass all warning-generating values to chgOpenUsrRespBox()
	//				1 => do not pass "warnMin" values to chgOpenUsrRespBox() (but do pass "warnMax" values)
	//				2 => do not pass "warnMax" values to chgOpenUsrRespBox() (but do pass "warnMin" values)
	//				3 => do not pass any "warnMax" OR "warnMin" values to chgOpenUsrRespBox()
function chgInitArr() {
	var i;
	var txtId = "";
	var arrSz = glbChgSetData.length;
	for (i = 0; i < arrSz; i++) {
		txtId = glbChgSetData[i].txtId;
		glbChgSetData[i].lcTxtId = txtId.slice(1,txtId.length).toLowerCase();
		glbChgSetData[i].valPrev = Number.NaN;
		glbChgSetData[i].valCur = Number.NaN;
		glbChgSetData[i].valNew = Number.NaN;
		glbChgSetData[i].warnSuppress = 0;
		}
	return;
	}

		// NOTE:  ANY ADDITIONS TO glbChgSetData[] MUST BE ADDED TO THE SWITCH HERE AND in chgSetSubmit()
		// 4/09/20 chgUpdtArr() sets glbChgSetData.valPrev or .valInit to current values of global variables
		//	The function is passed a string that is used to determine whether to set .valInit or .valPrev
		//		(text is used here because true/false could be confusing when reading the code)
		//	If isInit == true, glbChgSetData[].valInit is set.
		//	otherwise (i.e., isInit == false) glbChgSetData[].valPrev is set
		//		This function is used to initialize glbChgSetData[] prior to displaying a 
		//		"Change Settings" box.
function chgUpdtArr(txtInit) {
	var isInit = false;
	if (txtInit.slice(0,4).toLowerCase() == "init") { isInit = true; }
	var i;
	var arrSz = glbChgSetData.length;
	var val;  // value to which .valPrev or .valInit  is set
	for (i = 0; i < arrSz; i++) {
		val = Number.NaN;
		switch (glbChgSetData[i].txtId) {
			case "cSQLTimOut" : val = glbAjxTimeOut; break;
			case "cWaitTimOut" : val = glbWaitTimeOut; break;
			case "cXYBuf"	 : val = glbSldXYBuf; break;
			case "cXYOff"	 : val = glbSldTileOff; break;
			case "cFBuf"	 : val = glbSldFBuf; break;
			case "cMaxF"	 : val = glbSldMaxF; break;
			case "cDefF"	 : val = glbSldFDef; break;
			case "cZFLim"	 : val = glbSldZFLim; break;
			case "cFTimr"	 : val = glbFCycInterval; break;
			case "cZBuf"	 : val = glbSldZBuf; break;
			case "cFZBuf"	 : val = glbSldFZBuf; break;
			case "cMxCache"	 : val = glbImgCacheMaxSz; break;
			case "cMxDstArr" : val = destArrayMaxNum; break;
			case "cDstArrTimr" : val = destTimeInterval; break;
			case "cMvBtnStp" : val = sldMvStepSz; break;
			case "cMvBtnMult" : val = sldMvStepMult; break;
			case "cMvBtnTimr" : val = sldMvStepInterval; break;
			case "cMusMxDeclVel" : val = sldMusSlwDwnMxVel; break;
			case "cMusDeclMult" : val = sldMusSlwDwn.decel; break;
			case "cMusDeclTimr" : val = sldMusSlwDwn.interval; break;
			case "cMusMxPause" : val = glbSlwDwnMxTime; break;
			case "cMusWhlWait" : val = glbPnchWhlWait; break;
			case "cPnchDist" : val = glbMinPnchDist; break;
			case "cPnchWait" : val = glbMaxPnchTime; break;
			case "cMagPrec" : val = glbMagPrec; break;
			case "cWarnDispTime" : val = warnDisplayTime; break;
			case "cWarnFadeTimr" : val = warnFadeTime; break;
			case "cWarnFadeAmt" : val = warnFadeAmt; break;
			case "cInfoBoxTop" : val = glbInfoBxDefTop; break;
			case "cInfoBoxBottom" : val = glbInfoBxBotBorder; break;
			case "cInfoBoxSide" : val = glbInfoBxSideBorder; break;
			case "cWaitClkTimr" : val = glbTchWaitClkInterval; break;
			default : alert("chgUpdtArr(): Could not set value for \"" + glbChgSetData[i].txtNm
							+ "\" (\"" + glbChgSetData[i].txtId +"\").\n\n  Please report this error.");
			}
		if (isInit) {glbChgSetData[i].valInit = val; }
					// set .valPrev, .valCur, and .valNew regardless of whether updating or initializing
		glbChgSetData[i].valPrev = val;
					// valCur == valPrev when "Change Settings" box is opened
					//	althoubh .valCur may be changed once the "Change Settings" box is opened
		glbChgSetData[i].valCur = val;
		glbChgSetData[i].valNew = Number.NaN;  // .valNew has not yet been set
		}
				// SET absMax
			// absMxArr[] contains variables whose absMax needs to be initialized
			//	id is txtId of variable; src is source of absMax
	chgSetAbsMax(0);
	chgSetWarnMax(0);
	chgSetAbsMin(0);
	chgSetWarnMin(0);
	}

	// chgSetAbsMax() sets .absMax for values of glbChgSetData[] whose values for .absMax are dependent on another
	//	variable.  doTest is an integer: doTest == 0 implies no testing of current variables; if doTest == 1, then
	//		.valCur is tested to make certain it is OK with new .absMax; if doTest == 2, then .valPrev AND .valCur
	//		are tested.  Function returns an array of indices to glbChtSetData[] whose values failed the test.
	//	absMxArr[] is the list of glbChgSetData[] elements whose absMax is dependent on global variables that may change.
	//	The function returns an array of indices whose .valCur or .valPrev are greater than the new absMax
	//		If doTest == 0, the array is empty.
function chgSetAbsMax(doTest){
	var i;
	var val;
	var arrI;
	var valCur;
	var valPrev;
	var wndHt = parseInt(window.innerHeight);
	var wndWdth = parseInt(window.innerWidth);
	var errArr = [];
	errArr.splice(0);  // make sure that the array of erroneous indices is initially empty
	var absMxArr = ["cXYOff","cFBuf","cMaxF","cDefF","cZFLim","cZBuf",
						"cInfoBoxTop","cInfoBoxBottom","cInfoBoxSide"];
	var arrSz = absMxArr.length;
	for (i = 0; i < arrSz; i++) {
		val = Number.NaN;
		arrI = chgArrIndex(absMxArr[i]);
		if (Number.isNaN(arrI)) {
			alert("chgUpdtArr():  Could not find \"" + absMxArr[i] + "\" in glbChgSetData[]. "
					+ " Can't set .absMax.\n\n  Please report this error.");
			break;
			}
		switch(absMxArr[i]) {
			case "cFBuf" :  val = glbSldMaxF - 1;
					if (Number.isNaN(val)) { val = dbMaxF - 1; }
					if (val < 0) { val = 0; }
					break;
			case "cXYOff" :  val = glbSldXYBuf; break;
			case "cMaxF" :  val = dbMaxF; break;
			case "cDefF" :  val = dbMaxF - 1; 
					if (val < 0) { val = 0; }
					break;
			case "cZFLim" :
			case "cZBuf" :  val = dbMaxZ; break;
						// for "cInfoBoxTop", hdrHt ~45px + extra ~55px => ~100 extra pixels
			case "cInfoBoxTop": val = wndHt - (2*glbChgItmHt) - (2*glbChgBoxBorder) - 100;
					if (val < glbChgSetData[arrI].absMin) { val = glbChgSetData[arrI].absMin; }
					break;
			case "cInfoBoxBottom": val = wndHt - 250;
					if (val < glbChgSetData[arrI].absMin) { val = glbChgSetData[arrI].absMin; }
					break;
			case "cInfoBoxSide": val = Math.floor((wndWdth - 300)/2);
					if (val < glbChgSetData[arrI].absMin) { val = glbChgSetData[arrI].absMin; }
					break;
			default:  
					alert("chgUpdtArr():  Illegal value (\"" + absMxArr[arrI].src + "\") for \"source\" "
							+ "in absMaxArr[].src.\n\n  Please report this error.");
					break;
			}  // end switch
		if (Number.isNaN(val)) { val = Number.POSITIVE_INFINITY; }
		glbChgSetData[arrI].absMax = val;
		if (doTest > 0) {
			valCur = glbChgSetData[arrI].valCur;
			valPrev = glbChgSetData[arrI].valPrev;
			if ((doTest >= 2) && (!Number.isNaN(valPrev)) && (valPrev > val)) { errArr.push(arrI); }
			else if ((doTest >= 1) && (!Number.isNaN(valCur)) && (valCur > val)) { errArr.push(arrI); }
			}
		}  // end for loop
	return(errArr);
	}

	// chgSetWarnMax() is equivalent to chgSetAbsMax() except that it sets .warnMax rather than .absMzx
	//	For "cInfoBoxTop" and "cInfoBoxBottom", the calculation is based on assuming that a 3-column
	//		"Change Setting box has a height of ~560px and assuming that "Bottom" = 80px when 
	//		calculating "Top" and that "Top" = 120px when calculating "Bottom"
function chgSetWarnMax(doTest){
	var i;
	var val;
	var arrI;
	var valCur;
	var valPrev;
	var wndHt = parseInt(window.innerHeight);
	var errArr = [];
	errArr.splice(0);  // make sure that the array of erroneous indices is initially empty
	var warnMxArr = ["cXYOff","cMaxF","cZBuf","cInfoBoxTop","cInfoBoxBottom"];
	var arrSz = warnMxArr.length;
	for (i = 0; i < arrSz; i++) {
		val = Number.NaN;
		arrI = chgArrIndex(warnMxArr[i]);
		if (Number.isNaN(arrI)) {
			alert("chgSetWarnMax():  Could not find \"" + warnMxArr[i] + "\" in glbChgSetData[]. "
					+ " Can't set .warnMax.\n\n  Please report this error.");
			break;
			}
		switch(warnMxArr[i]) {
			case "cXYOff" :  val = glbSldXYBuf * 0.8; break;
			case "cMaxF" :  val = destArrayMaxNum; break;
			case "cZBuf" :  val = destArrayMaxNum; break;
			case "cInfoBoxTop": val = wndHt - 640;
					if (val < 120) { val = 120; }
					break;
			case "cInfoBoxBottom": val = wndHt - 680;
					if (val < 80) { val = 80; }
					break;
			default:  
					alert("chgSetWarnMax():  need to write code for \"" + warnMxArr[i] 
							+ "\".\n\n  Please report this error.");
					break;
			}  // end switch
		if (Number.isNaN(val)) { val = Number.POSITIVE_INFINITY; }
		glbChgSetData[arrI].warnMax = val;
		if (doTest > 0) {
			valCur = glbChgSetData[arrI].valCur;
			valPrev = glbChgSetData[arrI].valPrev;
			if ((doTest >= 2) && (!Number.isNaN(valPrev)) && (valPrev > val)) { errArr.push(arrI); }
			else if ((doTest >= 1) && (!Number.isNaN(valCur)) && (valCur > val)) { errArr.push(arrI); }
			}
		}  // end for loop
	return(errArr);
	}


function chgSetAbsMin(doTest){
	var i;
	var val;
	var arrI;
	var valCur;
	var valPrev;
	var errArr = [];
	errArr.splice(0);  // make sure that the array of erroneous indices is initially empty
	var absMinArr = ["cXYBuf", "cFBuf","cMaxF","cZBuf"];
	var arrSz = absMinArr.length;
	for (i = 0; i < arrSz; i++) {
		val = Number.NaN;
		arrI = chgArrIndex(absMinArr[i]);
		if (Number.isNaN(arrI)) {
			alert("chgSetAbsMin():  Could not find \"" + absMinArr[i] + "\" in glbChgSetData[]. "
					+ " Can't set .absMin.\n\n  Please report this error.");
			break;
			}
		switch (absMinArr[i]) {
			case "cXYBuf" : val = Math.ceil(glbSldTileOff); break;
			case "cFBuf" : val = glbSldFZBuf; break;
			case "cMaxF" : val = glbSldFBuf; break;
			case "cZBuf" : val = glbSldFZBuf; break;
			default: alert("chgSetAbsMin(): need to write code to handle \"" + absMinArr[i]
								+ "\".\n\n  Please report this error.");
			}  // end of switch
		if (Number.isNaN(val)) { continue; }
				// continue statement above ensures that val is not NaN
		glbChgSetData[arrI].absMin = val;
		if (doTest > 0) {
			valCur = glbChgSetData[arrI].valCur;
			valPrev = glbChgSetData[arrI].valPrev;
			if ((doTest >= 2) && (!Number.isNaN(valPrev)) && (valPrev < val)) {
				errArr.push(arrI);
				}
			else if ((doTest >= 1) && (!Number.isNaN(valCur)) && (valCur < val)) {
				errArr.push(arrI);
				}
			}  // end if do test
		}  // end for loop
	return(errArr);
	}


	// chgSetWarnMin() is equivalent to chgSetAbsMin() except that it sets .warnMin rather than .absMin
function chgSetWarnMin(doTest){
	var i;
	var val;  // value to which warnMin will be set
	var arrI;
	var valCur;  //glbChgSetData[].valCur => for doTest array
	var valPrev;  // glbChgSetData[].valPrev => for doTest array
	var errArr = [];  // doTest array => holds arrI of glbChgSetData[] elements that fail test
	errArr.splice(0);  // make sure that the array of erroneous indices is initially empty
	var warnMinArr = ["cMxDstArr"];
	var arrSz = warnMinArr.length;
	for (i = 0; i < arrSz; i++) {
		val = Number.NaN;
		arrI = chgArrIndex(warnMinArr[i]);
		if (Number.isNaN(arrI)) {
			alert("chgSetWarnMin():  Could not find \"" + warnMinArr[i] + "\" in glbChgSetData[]. "
					+ " Can't set .warnMin.\n\n  Please report this error.");
			break;
			}
		switch (warnMinArr[i]) {
			case "cMxDstArr" : 
					if (Number.isNaN(glbSldMaxF)) { val = glbSldZBuf; }
					else if (Number.isNaN(glbSldZBuf)) {val = glbSldMaxF; }
					else {val = Math.max(glbSldMaxF,glbSldZBuf); }
					break;
			default: alert("chgSetWarnMin(): need to write code to handle \"" + warnMinArr[i]
								+ "\".\n\n  Please report this error.");
			}  // end of switch
		if (Number.isNaN(val)) { continue; }
				// continue statement above ensures that val is not NaN
		glbChgSetData[arrI].warnMin = val;
		if (doTest > 0) {
			valCur = glbChgSetData[arrI].valCur;
			valPrev = glbChgSetData[arrI].valPrev;
			if ((doTest >= 2) && (!Number.isNaN(valPrev)) && (valPrev < val)) {
				errArr.push(arrI);
				}
			else if ((doTest >= 1) && (!Number.isNaN(valCur)) && (valCur < val)) {
				errArr.push(arrI);
				}
			}  // end if do test
		}  // end for loop
	return(errArr);
	}


	// chgSetSldInitVal() is called by sqlSldBasics().  It sets the .valInit field of glbChgSetData[] with the
	//		default value of corresponding variable.  NOTE:  if the variable was set using a command-line
	//		argument, it is NOT the current value of the variable, but rather the value the variable would
	//		have had if the user had not pre-empted it.
	//	Function is passed a string must match glbChgSetData[].txtId and the value to which glbChgSetData.valInit
	//		is set.
function chgSetInitVal(txtId,val) {
	var i;
	var arrI = chgArrIndex(txtId);
	if (Number.isNaN(arrI)) {
		alert("chgSetInitVal():  Could not find \"" + txtId + "\" in glbChgSetData[]. "
				+ " Can't set .valInit for this variable.\n\n  Please report this error.");
		}
	glbChgSetData[arrI].valInit = val;
	return;
	}


// ******************************************************************
// ************                                          ************  
// ************       Close "Change Setting" boxes       ************  
// ************                                          ************  
// ******************************************************************



	// chgCloseConfirm() - recreated 4/14/20 (old version deleted on 4/07/29 with rest of old jrscpChgSet.js
	//	This function is called when the "x" box on a "Change Setting" box is clicke or if the user clicks on
	//		the "Setting" menu => "Change Settings" button(s) when a "Change Settings" box is open
	//	If there are any changes pending in glbChgSetData[], function calls a confirm box to see
	//		if user wants to save changes.
	//	If there are no changes pending, or if user doesn't want to submit current changes, then chgCloseConfirm()
	//		calls chgCloseBox() to remove chgExtBx & chgContentBx before hiding the "Change Setting" box.
	//	4/15/20 Function now returns true if "Change Setting" box is closed (i.e., chgCloseBox() is called)
	//		and returns false if box isn't closed
function chgCloseConfirm() {
	var mainNode = document.getElementById("chgSetBx");
	if (mainNode == null) {
		alert("chgCloseConfirm():  \"chgSetBx\" is null; can't close \"Change Settings\" box."
				+ "\n\n  Please report this error.");
		return(false);
		}
	var chgTitle = document.getElementById("chgTitleTxt").innerHTML;  // title of current "Change Setting" box
	var i;
	var arrSz = glbChgSetData.length;
			//	loop through glbChgSetData looking for .valCur that is different from .valPrev, or
			//		if .valPrev == NaN (e.g. slide hasn't been loaded yet), different from .valInit
	var valCur;
	var valPrev;
	for (i = 0; i < arrSz; i++) {
		valCur = glbChgSetData[i].valCur;
		valPrev = glbChgSetData[i].valPrev; 
		if (!Number.isNaN(valCur)) { // .valCur has been set & not cleared
			if (valCur == valPrev) { continue; }
			if ((Number.isNaN(valPrev)) && (valCur == glbChgSetData[i].valInit)) { continue; }
			break;
			}
		}
		// if settings have been changed and not submitted, AND chgSetBx is open => ask whether to submit or close
	if ((i < arrSz) && (mainNode.style.display == "block")) { 
		if (!confirm("The changes that you have made to the settings in the \"" 
					+ chgTitle + "\" box have not been saved."
					+ "\n\n  Click \"OK\" to close the \"" + chgTitle + "\" box without saving your changes."
					+ "\n  Click \"CANCEL\" to return to the \"" + chgTitle + "\" box.")
 				) { return(false); }
		}
	chgCloseBox();
	return(true);
	}

	// 4/15/20 - chgCloseBox() removes chgExtBx & chgContentBx (if they exist) from chgSetBx
	//		and then hides chgSetBx.  NOTE:  chgSetBx continues to exist, however, all of the
	//		children of chgExtBx and chgContentBx should be removed from memory (WORRY ABOUT MEMORY LEAK)
function chgCloseBox(){
	chgSetAbsMax(0);
	chgSetWarnMax(0);
	chgSetAbsMin(0);
	chgSetWarnMin(0);
	var mainBxNode = document.getElementById("chgSetBx");
	if (mainBxNode == null) {
		alert("chgCloseBox(): Can\'t find node for \"Change Settings\" box (\"chgSetBx\"), so we can't close this box."
				+ "\n\n  This is a FATAL error.  You should close or reload this internet-browser window."
				+ "\n  Please report this error.");
		return;
		}
	if (mainBxNode.style.display == "none") { return; }
	var txtTitle = document.getElementById("chgTitleTxt").innerHTML;
			// if it exists, remove node containing 'extra text' (the 'warning')
	var extraNode = document.getElementById("chgExtraBx");
	if (extraNode != null) {  // chgExtraBx exists in chgSetBx
		if (mainBxNode.removeChild(extraNode) != extraNode) {  // removal failed
			alert("chgCloseBox():  Attempt to remove \"extra text\" box from \"" + txtTitle
					+ "\" box failed.  This may result in other errors or a memory leak."
					+ "\n\n  Please report this error.");
			}
		extraNode = null;  // make certain that there no longer is a reference to chgExtraBx
		}
	var contentNode = document.getElementById("chgContentBx");
	if (contentNode != null) {  // found "chgContentBx"
		if (mainBxNode.removeChild(contentNode) != contentNode) {  // removal failed
			alert("chgCloseBox():  Attempt to remove \'change-setting\' items from \"" + txtTitle
					+ "\" box failed.  This may result in other errors or a memory leak."
					+ "\n\n  Please report this error.");
			}
		contentNode = null;  // make certain that there no longer is a reference to chgContentBx
		} 
	else {  // contentNode == null => failed to find <div> containing the items of "Change Setting" box
		alert("chgCloseBox():  Could not find \"chgContentBx\" in \"" + txtTitle
				+ "\" box.  Can\'t remove  \'change-setting\' items from \"" + txtTitle
				+ "\" box.  This may result in other errors or a memory leak."
				+ "\n\n  Please report this error.");
		}
	mainBxNode.style.display = "none";
	return;
	}




// **************************************************************
// ************          Build ChgSet Boxes          ************  
// **************************************************************



function chgBuildAllSetBox() {
	var extTxt = "<div style='text-align:center; font-size:16px; width: 100%'><b>Warning</b></div>";
	extTxt += "The parameters listed below can be adjusted to accommodate differences in ";
	extTxt += "computer capabilities, server response times, and personal preferences.&nbsp; ";
	extTxt +=  "However, changing some of these values can have a significant negative ";
	extTxt +=  "impact on the virtual microscope's performance, and you should use discretion ";
	extTxt +=  "if you change these parameters.";
	chgBuildBox("Change Settings",extTxt,0,glbChgSetData.length);
	}


function chgBuildSubSetBox(grpNum){
	var i;
	var strtI;
	var endI;
	var title = "";
	switch (grpNum) {
		case 2.5 : title = "Change Focus<br>Settings"; break;
		default :
				alert("chgBuidlSubSetBox(): no title for group #" + grpNum
						+ ".  Can\'t display \"Change [Group] Settings\" box."
						+ "\n\n  Please report this error.");
		}
	var arrSz = glbChgSetData.length
	for (i = 0; i < arrSz; i++) {
		if (glbChgSetData[i].grp == grpNum) { break; }
		}
	if (i < arrSz) { strtI =  i; }
	else {
		alert("chgBuidlFSetBox(): could not find start of group (grp = " + grpNum 
				+ ") in glbChgSetData[]. Can\'t " + title.toLowerCase()
				+ ".\n\n  Please report this error.");
		return;
		}
	for (i = strtI; i < arrSz; i++) {
		if (glbChgSetData[i].grp != grpNum) { break; }
		}
	endI = i;
	chgBuildBox(title,"",strtI,endI);
	return;
	}

	// 4/14/20 create chgBuildBox():
	//	The function is passed:
	//	(1) title:  a text-string containing the title that will be placed at the beginning of the box
	//	(2)	extTxt:  a text-string (including HTML formatting) that will be placed into the chgExtraBx
	//			if extTxt == "", then chgExtraBx is not created (and the increase in offsetY due to the
	//			chgExtraBx is 0
	//	(3)	indStrt:  an integer; the index in glbChgSetData[] of the first item to be included
	//			in chgContentBx; for a "Change Settings" box displaying all available settings indStrt = 0.
	//	(4)	indEnd: an integer; the index in glbChgSetData[] of the item AFTER the last item to be
	//			included in chgContentBx; for a box displaying all available setings, indEnd = glbChgSetData.length
	//	NOTE: I considered using an array listing (in the order-to-be-displayed) the glbChgSetData[].grp, instead
	//			of indStrt and indEnd.  However, this would have been more complicated (KISS) and this extra
	//			flexibility didn't seem necessary right now.  If we need to display multiple (but not all) grps
	//			in a discontinuous order, then we could consider rewriting the code so that the function is passed
	//			an array of grp numbers, rather than start-and-end indices.
function chgBuildBox(title,extTxt,indStrt,indEnd) {
	var i;
	var mainBxNode = document.getElementById("chgSetBx");
	if (mainBxNode == null) {
		alert("chgBuildBox(): can\'t open \"Change Settings\" box (\"chgSetBx\").  Can\'t change settings."
				+ "\n\n  Please report this error.");
		return;
		}
		// check for existence of "chgContentBx"
	var contentNode = document.getElementById("chgContentBx");
	if (contentNode != null) {  // chgSetBx already has its children, and may be open
				//	if not yet updated, warn before closing old chgSetBx
		if (!chgCloseConfirm()) {  // chgSetBx still is open (by error or user choice) => can't build new box
			return;
			}
		contentNode = null;  // need this to ensure that chgContentBx is removed from memory
		} 
			// set extra-text node if extTxt != ""
	var extraNode = null;  // variable to hold node for "extra text" div
	if (extTxt != "") {  // there is extra text to include in "Change Setting" box
		extraNode = document.createElement("div");
		if (extraNode == null){
			alert("chgBuildBox(): Could not create node for \"extra text\" for the \"" + title +
						+ "\" box   There may be a warning that is not being displayed."
						+ "\n\n  Please report this error.");
			}
		else {  // extraNode is OK
			extraNode.className = "chgExtraBxClass";
			extraNode.id = "chgExtraBx";
			extraNode.innerHTML = extTxt;
			mainBxNode.appendChild(extraNode);
			}
		}
			// create contentNode => currently this is a <div> without a class
			// the call to chgCloseConfirm should have guaranteed that chgContentBx doesn't exist
			//		contentNode currently equals an invalid value
	chgUpdtArr("update");  // update glbChgSetData[].valPrev to reflect current status of all variables

	// TEMPORARY
//var tmpTxt = "chgBuildAllSetBox():  values for glbChgSetData.";
//var i;
//for (i = 0; i < glbChgSetData.length; i++){
//	tmpTxt += "\n [" + i + "]: .txtId = \"" + glbChgSetData[i].txtId;
//	tmpTxt += "\"; .lcTxtId = \"" + glbChgSetData[i].lcTxtId;
//	tmpTxt += "\"; .txtNm = \"" + glbChgSetData[i].txtNm;
//	tmpTxt += "\";\ngrp = " + glbChgSetData[i].grp;
//	tmpTxt += "; isInt = " + glbChgSetData[i].isInt;
//	tmpTxt += "\n  .valInit = " + glbChgSetData[i].valInit
//	tmpTxt += "; .valPrev = " + glbChgSetData[i].valPrev;
//	tmpTxt += "; .valCur = " + glbChgSetData[i].valCur + "; .valNew = " + glbChgSetData[i].valNew;
//	tmpTxt += "\n  .absMin = " + glbChgSetData[i].absMin;
//	tmpTxt += "; .absMax = " + glbChgSetData[i].absMax;
//	tmpTxt += "; .warnMin = " + glbChgSetData[i].warnMin;
//	tmpTxt += "; .warnMax = " + glbChgSetData[i].warnMax;
//	}
//alert(tmpTxt);
	// END TEMPORARY


	contentNode = document.createElement("div");
	if (contentNode == null) {
		alert("chgBuildBox(): Could not create node for items in \"" + title
						+ "\" box.  Cannot change these settings."
						+ "\n\n  Please report this error.");
		chgCloseBox();
		return;
		}
	contentNode.id = "chgContentBx";
	contentNode.className = "chgContentBxClass";
	mainBxNode.appendChild(contentNode);
			// calculate colNumMax
	var screenWdth = parseInt(window.innerWidth);
	var boxMxWdth = screenWdth - (2 * glbInfoBxSideBorder) - (2 * glbChgBoxBorder);
	var colNumMax = Math.floor(boxMxWdth / (glbChgColWidth + glbChgColBorder));
		// check validity of indStrt & indEnd;
	var iStrt = indStrt;
	var iEnd = indEnd;
	var chgArrSz = glbChgSetData.length;  // size of glbChgSetData[]
	if (indStrt > indEnd) {
		alert("chgBuildBox():  \"indStrt\" (" + iStrt + ") is greater than \"indEnd\" ("
				+ indEnd + "); indices will be flipped.\n\n  Please report this error.");
		iEnd = indStrt;
		iStrt = indEnd;
		}	
	if (iStrt < 0) {
		alert("chgBuildBox():  \"indStrt\" (" + iStrt + ") cannot be less than zero, "
					+ "and will be reset to zero.\n\n  Please report this error.");
		iStrt = 0;
		}
	if (iEnd > chgArrSz) {
		alert("chgBuildBox():  \"indEnd\" (" + iEnd + ") cannot be greater than the total "
					+ "number of all variables that can be set (" + chgArrSz
					+ "), and will be reset to " + chgArrSz 
					+ ".\n\n  Please report this error.");
		iEnd = chgArrSz;
		}
		// create grpInfo[], which divides relevant part of glbChgSetData[] by group
	var grpInfo = chgCalcGrpInfo(iStrt,iEnd);
		// apparently obj.offsetTop, .offsetHeight, etc. only work if display != "none
		//		To handle this, we set mainBxNode.style.visibility = "hidden" and .display = "block"
		//		before determining how to format the box
	mainBxNode.style.visibility = "hidden";  // un-comment this line after formatting code is worked out
	mainBxNode.style.display = "block";
		// CALCULATE NUMBER OF COLUMNS and allocate groups of glgChgSetData[] items into each oolumn
	var colInfo = chgCalcColInfo(colNumMax,grpInfo,iEnd-iStrt);
	if (colInfo == null) {
		alert("chgBuildBox():  object returnd by chgCalcColInfo() is \"null\".  "
				+  "Can\'t display the \"" + title + "\" box.\n\n  Please report this error.");
		chgCloseBox();
		return;
		}
	chgFitBox(colInfo,title);
	chgAddCols(colInfo,grpInfo);

//var tmpTxt = "After chgCalcColInfo() returns:  columns = " + colInfo.colTot + "; top = " + colInfo.top + "; fit = " + colInfo.fit;
//for (i = 0; i < colInfo.colTot; i++ ){
//	tmpTxt += "\n  >> column: " + colInfo.itmByCol[i].col + "; .strtGrp = " + colInfo.itmByCol[i].strtGrp + "; .endGrp = " + colInfo.itmByCol[i].endGrp 
//		+ "; htUsed = " + colInfo.itmByCol[i].htUsed; 
//	}
//alert(tmpTxt);

	mainBxNode.style.visibility = "visible";  // un-comment this line after formatting code is worked out
	return;
	}
	
	// chgFitBox() sets the final dimensions for "Change Settings" boxes.
	//	This function is passed a colInfo object containing the final column settings and a text-string 
	//		containinig the title. The elements in colInfo object are:
	//		-- .colTot	=> the number of columns in the contentBx
	//		-- .top 	=> the value (in px) for contentBx.style.top
	//		-- .ht		=> maximum ht for the content box
	//		-- .fit		=> a boolean indicating whether the entire contentBx will fit in the screen
	//						.fit == null implies that we have to add a vertical scroll bar
	//		-- .itmByCol => an array of data for each column
	//	The function first sets the mainBx width, then sets the title (including adjusting font-size, if
	//		necessary), then sets the position of the menu-buttons, and top, scrollbar, and max-height of
	//		contentBx.
	//	5/11/20 move creation of title to separate function (chgFitTitle()).  chgFitBox() no longer
	//		tests whether titleNode & titleDivNode are null.
function chgFitBox(colInfo,title) {
	var mvBtnWdth = 55;  // space needed for infoMvBtn (45px) + 10px margin
	var mainBxNode = document.getElementById("chgSetBx");
	var menuBtnNode1 = document.getElementById("chgBtnSubmit");
	var menuBtnNode2 = document.getElementById("chgBtnCancel");
	var contentNode = document.getElementById("chgContentBx");
	if ((mainBxNode == null) || (menuBtnNode1 == null) || (menuBtnNode2 == null) 
			|| (contentNode == null)) {
		alert("chgFitBox():  Can\'t display \"Change Settings\" box because nodes are null."
				+ "\n\n  Please report this error.");
		return(null);
		}
			// set contentNode overflow & get scrollwidth
	contentNode.style.overflowY = "hidden";
	var scrollWdth = contentNode.clientWidth;  // temporary value, see below
	if (!colInfo.fit) {	contentNode.style.overflowY = "scroll"; }
	scrollWdth -= contentNode.clientWidth;
			// set mainBxNode width and contentNode max-height
	var colTot = colInfo.colTot;
	var boxWdth = (colTot * glbChgColWidth) + ((colTot-1) * glbChgColBorder) + scrollWdth;
	mainBxNode.style.width = boxWdth + "px";
		// may need to set contentNode.style.top = colInfo.top +"px" here??
	contentNode.style.maxHeight = colInfo.ht + "px";
			// center mainBxNode
	var boxLeft = Math.round((window.innerWidth - boxWdth) / 2);
	mainBxNode.style.left = boxLeft + "px";
	mainBxNode.style.top = glbInfoBxDefTop + "px";
			// set title & adjust title's font-size to fit space
	chgFitTitle(title,boxWdth,mvBtnWdth);
// START HERE !!!

		//	set menu button postion & size
	var btnSpc = Math.round((boxWdth - 280)/3);
	if (colTot > 1) {  // for 2 or more columns, use 140px buttons spaced evenly
		menuBtnNode1.style.width = "140px";
		menuBtnNode1.style.left  = btnSpc +"px";
		menuBtnNode2.style.width = "140px";
		menuBtnNode2.style.right = btnSpc +"px";
		}
	else {  // spacing for buttons if only 1 column
		menuBtnNode1.style.width = "119px";
		menuBtnNode1.style.left  = "8px";
		menuBtnNode2.style.width = "119px";
		menuBtnNode2.style.right  = "8px";
		}
	return;
	}


function chgFitTitle(title,boxWdth,mvBtnWdth) {
	var titleFontSz = 32;  // starting size for fonts
	var titleNode = document.getElementById("chgTitleTxt");
	var titleDivNode = document.getElementById("chgTitleDiv");  // div that holds titleNode
	if ((titleNode == null) || (titleDivNode == null)) {
		alert("chgFitTitle():  node for title for \"" + title.replace(/<br>/g," ")
				+ "\" box is null.  Can\'t properly display box\'s title."
				+ "\n\n  Please report this error.");
		return;
		}
			// set font size and line-spacing
	titleDivNode.style.left = "";  // this needs to be default while offset values are calculated
	titleDivNode.style.width = ""; // this needs to be default while offset values are calculated
	titleNode.style.fontSize = titleFontSz + "px";
	titleNode.innerHTML = title;
	var titleSpc = boxWdth - (2 * mvBtnWdth);  // space (width) available for title
	var hdrHt = 41; //hdr height - 2x2px
	var titleWdth = titleNode.offsetWidth;
	var titleHt = titleNode.offsetHeight;
	if (title.search("<br>") >= 0) { titleNode.style.lineHeight = "0.9"; }
	else { titleNode.style.lineHeight = ""; }
		// look
	while ((titleFontSz > 14) && ((titleSpc < titleWdth) || (hdrHt < titleHt))) {
		titleFontSz -= 2;
		titleNode.style.fontSize = titleFontSz + "px";
		titleWdth = titleNode.offsetWidth;
		titleHt = titleNode.offsetHeight;
	}
		// Need to set left & width of <div> holding "title" <span> in order to get the
		//	title to be centered.  This must be done AFTER adjusting title font-size
		//	for titleNode.offsetWidth to work correctly (otherwise the title folds-up within
		//	the titleDivNode <div>
	titleDivNode.style.left = (mvBtnWdth - 5) + "px";
	titleDivNode.style.width = (boxWdth - (2 * mvBtnWdth) + 10) + "px";
	return;
	}

	// chgMaxColHt() loops through .itmByCol and returns the maximum .htUsed (for all columns in itmByCol)
function chgMaxColHt(itmByCol) {
	var i;
	var maxHt = 0;
	var curHt;
	for (i=0; i < itmByCol.length; i++) {
		curHt = itmByCol[i].htUsed;
		if (curHt > maxHt) {maxHt = curHt;}
		}
	return(maxHt);
	}

	// chgAddCols() is called after the final calculations for the size of each column.
	//	The function is passed the colInfo object containing these final calculations 
	//		and the grpInfo object containing the number of items by group for those
	//		settings that will be displayed by the box.
	//	The function then loops through all columns (from 0 to colInfo.colTot),
	//		creating a new <div> for each column and calling chgBuildCol() to populate the
	//		new column.
function chgAddCols(colInfo,grpInfo) {
	var contentNode = document.getElementById("chgContentBx");
	if (contentNode == null) {
		alert("chgAddCols():  Can\'t display \"Change Settings\" box because nodes are null."
				+ "\n\n  Please report this error.");
		return(null);
		}
	var i;
	var colNode;  // variable to hold column node
	var colTot = colInfo.colTot;  // total number of columns
	var colMxHt = chgMaxColHt(colInfo.itmByCol);  // height of longest column
	var isFirst;  // boolean variable:  true if colNum = 0
	var isLast;  // boolean variable; true if last column (colNum = colTot - 1)
	var isLongest;  // if column has maximum length (colMxHt == .itmByCol[].htUse)
	var strtGrp;  // start group is obtained from colInfo.itmByCol
	var endGrp;  // end group is obtained from colInfo.itmByCol
	var strtItm;  // start item is obtained from grpInfo[] using group number from colInfo.itmeByCol
	var endItm;  // start item is obtained from grpInfo[] using group number from colInfo.itmeByCol
	contentNode.style.height = colInfo.ht;
	if (!colInfo.fit) { //if contentNode scrolls, top & bottom borders shouldn't scroll
		contentNode.style.borderBottom = "1px solid black";
		contentNode.style.borderTop = "1px solid black";
		}
	for (i = 0; i < colTot; i++) {
		colNode = document.createElement("div");
			if (colNode == null) {
			alert("chgBuildBox(): Could not create column #" + (i+1) + "for items in the \""
						+ title + "\" box.  This probably is a fatal error."
						+ "\n\n  Please report this error.");
			return;
			}
		colNode.className = "chgColumnClass";
		contentNode.appendChild(colNode);
		colNode.style.top = "0px";
			// column height is reduced by 1 pixel because last item in longest column doesn't have 
			//	a bottom border
		colNode.style.height = (colMxHt - 1) + "px";
		if (!colInfo.fit) { //if contentNode scrolls, top & bottom borders belong to chgContentBx
			colNode.style.borderBottom = "0px"; 
			colNode.style.borderTop = "0px";
			}
			// margins and divider require special handling for first & last columns
		if (i <= 0) {isFirst = true; }
		else { isFirst =  false; }
		if (i >= (colTot - 1)) { isLast = true; }
		else { isLast = false; }
		if (colInfo.itmByCol[i].htUsed == colMxHt) { isLongest = true; }
		else { isLongest = false; }
				// calculate first & last items in column
		strtGrp = colInfo.itmByCol[i].strtGrp;
		endGrp = (colInfo.itmByCol[i].endGrp) - 1; // .endGrp is group after the last group in column
		strtItm = grpInfo[strtGrp].strt;
		endItm = grpInfo[endGrp].strt + grpInfo[endGrp].numItm;
			// the default (chgColumnClass in jrspStyleInfo.css) is for the column to have a
			//		left margin of 5px and no margins on the other sides
		if (isFirst) { colNode.style.marginLeft = "0px"; } // 1st column doesn't have left margin
			// chgBuildCol() adds items to column
		chgBuildCol(strtItm,endItm,colNode,isFirst,isLast,isLongest);
		}
	return;
	}

		// chgCalcGrpInfo() creates the grpInfo[] array that divides the relevant part 
		//		of glbChgSetData[] into groups
		//	The function returns the array
function chgCalcGrpInfo(iStrt,iEnd) {
	var i;
		// count number of groups and number of items per group.
	var grpOld = parseInt(glbChgSetData[iStrt].grp);  // grp number of previous item; ignore subgroups
	var grpCur; // grp number of current item in for-loop
	var grpCnt = 0;  // number of items in current grp
	var grpStrt = iStrt;
	var grpI = 0;  // size of grpInfo[] (== number of groups
	var grpInfo = [];
		//read through relevant section of glbChgSetData[] to get number & size of grps
		//	this information is stored in the grpInfo[] array
	for (i = iStrt; i < iEnd; i++) {
		grpCur = parseInt(glbChgSetData[i].grp); 
		if (grpCur == grpOld) { grpCnt++; }
		else { // finished reading data for old grp => record and start new grp
			grpI = grpInfo.length;
			grpInfo[grpI] = {id: grpOld, strt: grpStrt, numItm: grpCnt};
			grpStrt = i;
			grpCnt = 1; // current item is 1st in new grp
			grpOld = grpCur;
			}
		}
	if (grpCnt > 0) {  // last group needs to be recorded
		grpI = grpInfo.length;
		grpInfo[grpI] = {id: grpOld, strt: grpStrt, numItm: grpCnt};
		}
	return(grpInfo);
	}

	// chgCalcByCol() builds and returns an .itmByCol object that starts with strtGrp
	//	and whose height does not exceed mxHt.  It is passed:
	//	- colNum is the number of the column, the function stores this as .col in the
	//		.itmByCol object, but does nothing else with it.
	//	- mxHt is the maximum number of pixels allowed in the column.  It is equivalent to
	//		contentHt in chgCalcColInfo()
	//	- stGrp is the value of the starting group for this column
	//	- grpInfo is the grpInfo object calculated by chgCalcGrpInfo()
	//	The function returns an .itmByCol object
function chgCalcByCol(colNum,mxHt,stGrp,grpInfo) {
	var grpI = stGrp;
	var grpTot = grpInfo.length;
	var colHt = 0;
	var grpHt = 0;
	while (grpI < grpTot) {
		colHt += grpHt;
		grpHt = glbChgItmHt * grpInfo[grpI].numItm;
		if (grpHt == 0) {
			alert("chgCalcByCol():  number of items in group #" + grpI 
					+ " is zero.\n\n  Please report this error.");
			}
		if (grpI > stGrp) { grpHt += glbChgdivdrHt; }
		if ((colHt + grpHt) > mxHt) { break; }
		grpI++;
		}
	if ((grpI >= grpTot) && ((colHt + grpHt) <= mxHt)) { colHt += grpHt; }
	return({col: colNum, strtGrp: stGrp, endGrp: grpI, htUsed: colHt});
	}


	// chgFillByCol() is called by chgCalcColInfo() when .fit is false
	//	It differs from chgCalcByCol() in that it uses number of items (itmMax) to 
	//		determine how many groups to put into each column
	//	- colNum is the number of the column being filled.  The function saves this
	//		value as the .col value, but doesn't use if for anything
	//	- itmMax is the maximum number of items that may be included in the oolumn
	//		for the last column, chgCalcByCol() changes this value to POSITIVE_INFINITY
	//	- stGrp is the first group (from grpInfo) to be included in the column.
	//	- grpInfo is the grpInfo object calculated by chgCalcGrpInfo()
	//	The function returns an .itmByCol object
function chgFillByCol(colNum,itmMax,stGrp,grpInfo) {
	var grpI = stGrp;
	var grpTot = grpInfo.length;
	var itmSum = 0;
	var itmNum;
	var colHt = 0;

	while (grpI < grpTot) {
		itmNum = grpInfo[grpI].numItm;
		if ((itmSum + itmNum) > itmMax) { break; }
		itmSum += itmNum;
		colHt += itmNum * glbChgItmHt;
		if (grpI > stGrp) { colHt += glbChgdivdrHt; }
		grpI++;
		}
	return({col: colNum, strtGrp: stGrp, endGrp: grpI, htUsed: colHt});
	}


	// chgCalcColInfo() returns an object containing the information about the number of
	//		columns that chgBuildBox() needs to build the chgContentBx
	//	To do this, the function builds an array (colData[]) of colInfo objects, with one
	//		colInfo object for each case of colNum <= colNumMax.  To do this the function
	//	(1) sets the width of the "Change Settings" box
	//	(2)	calculates the top and maximum height for chgContentBx
	//	(3)	calls chgCalcByCol() to build an itmByCol[] array containing the data for each column
	//			The itmByCol array is only valid if isFit == true (i.e., colInfo.fit == true)
	//	(4)	determines if all chgItems (by group, with dividers) will fit without scroll bars
	//	If the "Change Setting" items, organized by grp, won't fit on the screen 
	//		(i.e. colInfoObject.fit = false), the function calls chgFillByCol() to rebuild the
	//		.itmByCol array
	//	The function then returns the colInfo object for the minimum number of columns for which
	//		all the "Change Setting" items fit on the screen without scroll bars.
	//	  If all "Change Setting" items won't fit, then the function returns the colInfo object
	//		for colNumMax with .fit == false
		// The structure of the colInfo object is:
		//	 .colTot is number of columns
		//	 .top is value to set contentNode.style.top if this number of columns is used
		//	 .ht is maximum allowable height (in pixels) of contentNode 
		//			=> contentNode.style.height will be <= to this value
		//	 .fit is a boolean; true if this number of columns will fit on screen.
		//			if .fit == false, we either use more columns or a scrollbar
		//	 .itmByCol[] is an array  of objects in which the (1st-pass) by-column data 
		//		are stored:
		//		 .col is the column number
		//		 .strtGrp is the index of in grpInfo[] of the 1st group in this column
		//		 .endGrp is the index+1 of the last group in this column
		//		 .htUsed is the number of pixels needed to display the items 
		//				(and dividers) in this column 
function chgCalcColInfo(colNumMax,grpInfo,itmTot){
	var i;
	var j;
			// calculate the maximum box height
	var wndHt = parseInt(window.innerHeight);
	var boxMxHt = wndHt - glbInfoBxDefTop - glbInfoBxBotBorder - (2*glbChgBoxBorder);
			// minimumb height for box is: hdrHt + menuHt + 3*itmHt + 2*border = 45 + 40 + 93 + 16 = 194
	if (boxMxHt < 200) {  // allowed height too small
			// try setting bottom to .absMin => i is used as a temporary variable
		i = chgArrIndex("cInfoBoxBottom");
	 	if (Number.isNaN(i)) {
			alert("chgCalcColInfo():  box too small, but can\'t find \"cInfoBoxBottom\" in glbChgSetData[]. "
					+ " Setting glbInfoBxBotBorder = 0.\n\n  Please report this error.");
			glbInfoBxBotBorder = 0;
			}
		else {
			glbInfoBxBotBorder = glbChgSetData[i].absMin;
			glbChgSetData[i].valPrev = glbInfoBxBotBorder;
			}
		boxMxHt = wndHt - glbInfoBxDefTop - glbInfoBxBotBorder - (2*glbChgBoxBorder);
		if (boxMxHt < 200) {  // box still too small, try setting glbInfoBxDefTop to .absMin
			i = chgArrIndex("cInfoBoxTop");
	 		if (Number.isNaN(i)) {
				alert("chgCalcColInfo():  box too small, but can\'t find \"cInfoBoxTop\" in glbChgSetData[]. "
						+ " Setting glbInfoBxDefTop = 0.\n\n  Please report this error.");
				glbInfoBxDefTop = 0;
				}
			else {
				glbInfoBxDefTop = glbChgSetData[i].absMin;
				glbChgSetData[i].valPrev = glbInfoBxDefTop;
				}
			boxMxHt = wndHt - glbInfoBxDefTop - glbInfoBxBotBorder - (2*glbChgBoxBorder);
			if (boxMxHt < 200) {  // box still to small after resetting both top and bottom.
				alert("\"Change Setting\" box won\'t fit even after setting box's top to \""
							+ glbInfoBxDefTop + "\" and setting box's bottom to \""
							+ glbInfoBxBotBorder +"\".  Box height is set to 600 pixels. "
							+ " You may want to increase the size of the viewer's window.");
				boxMxHt = 600;
				}
			else {  // box was > 200 pixels AFTER resetting both glbInfoBxDefTop and glbInfoBxBotBorder
				alert("Had to reset box's top to \"" + glbInfoBxDefTop + "\" and box's bottom to \""
						+ glbInfoBxBotBorder + "\" to get the \"Change Setting\" box to fit in the window.");
				}
			}
		else {  // box height > 200 pixels AFTER resetting glbInfoBxBotBorder
			alert("Had to reset box's bottom to \"" + glbInfoBxBotBorder 
					+ "\" to get the \"Change Setting\" box to fit in the window.");
			}
		}  // end if height < 200 pixels ... did not need to reset top or bottom
			// calculate number per column for colNum <= colMax
	var contentHt;  // height of content box => set below
	var contentTop;  // offsetTop of content box => calculated below
	var boxWidth;  // width of main box; calculated below
	var itmNum;  // number of items per column
	var colNum;  // number of current column; => this variable will be used multiple times
	var arrI;  // index for colData[]; when building colData[], i is used to count-down from colNumMax
					// arrI is the index of current colInfo object in colData
	var colHt;  // number of pixels used in column
	var isFit;  // set to false if chgSet itms don't fit onto screen
	var colData = [];  // the array of colInfo objects
	var colItmArr = [];  // the array within each colInfo object containing data about each column
			// get nodes to "Change Settings" box and its children
	var mainBxNode = document.getElementById("chgSetBx");
	var menuBtnNode1 = document.getElementById("chgBtnSubmit");
	var menuBtnNode2 = document.getElementById("chgBtnCancel");
	var contentNode = document.getElementById("chgContentBx");
	if ((mainBxNode == null) || (menuBtnNode1 == null) || (menuBtnNode2 == null) 
			|| (contentNode == null)) {
		alert("chgCalcColInfo():  Can\'t display \"Change Settings\" box because nodes are null."
				+ "\n\n  Please report this error.");
		return(null);
		}
			// temporarily set menu buttons for 1 column 
			//		NOTE => Need to reset this later (in chgBuildBox())
	menuBtnNode1.style.width = "119px";
	menuBtnNode1.style.left  = "8px";
	menuBtnNode2.style.width = "119px";
	menuBtnNode2.style.right  = "8px";
				// DETERMINE NUMBER OF COLUMNS TO USE
			// test possible numbers of columns to see if one fits entirely on screen
			//	results are stored in colData[]
	var grpI = 0;  // index for grpInfo
	var grpTot = grpInfo.length;  // total number of grps
	for (i = colNumMax; i > 0; i--) {
			// calculate contentHt
		boxWidth = (i * glbChgColWidth) + ((i-1) * glbChgColBorder);
		mainBxNode.style.width = boxWidth + "px";
		contentTop = contentNode.offsetTop;
		contentHt = boxMxHt - contentTop;  // need to check for negative value - see below
		arrI = colData.length
		colData[arrI] = {colTot: i, top: contentTop, ht: contentHt, fit: false, itmByCol: new Array()};
		if (contentHt < 100) {
			if (i == colNumMax) { contentHt = 100; } // box height is screwed-up, force 3 items to be visible
				// if contentHt is negative, .fit = false => use more columns
			continue; }
		grpI = 0;
		for (j = 0; j < i; j++){
			colData[arrI].itmByCol[j] = chgCalcByCol(j,contentHt,grpI,grpInfo);
			if (colData[arrI].itmByCol[j] == null) {
				alert(" chgCalcColInfo(): colData[].itmByCol[] is null.  The contents of the \"Change Settings\" "
							+ "box will be incomplete.\n\n  Please report this error.");
				break; 
				}
			grpI = colData[arrI].itmByCol[j].endGrp;
			if (grpI >= grpTot) {  // last grp fit into column
				colData[arrI].fit = true;
				break;
				}  // last grp fit into column
			}
		for (j = j+1; j < i; j++){  // need to fill out any empty columns
			colData[arrI].itmByCol[j] = {col: j,strtGrp: grpTot, endGrp: grpTot, htUsed: 0};
			}
		}
			// find smallest number of columns that fit on screen
			//	colData[] is sorted largest number of columns to smallest
	for (i = 0; i < colData.length; i++) {
		if (!(colData[i].fit)) {  // number of columns too few to fit on screen
			if (i > 0) {arrI = i - 1; }
			else {arrI = 0;}
			break;
			}
		}
			// BALANCE COLUMNS
			//	colInfoCur is the colInfo object that holds the "final" column data
	var colInfoCur = colData[arrI];  // object holding the information for the number of columns that will be used
		// if colInfoCur.fit == false, then .itmByCol is incomplete; use chgFillByCol() to get .itmByCol
	colNum = colInfoCur.colTot;
			// itmMax is the maximum number of items per column (except last column) if .fit == false
			//	colNum is the number of columns that will be in "Change Settings" box
	var itmMax = itmTot/colNum;
	if (!(colInfoCur.fit)) {
		grpI = 0;
		for (i = 0 ; i < colNum; i++) {
			if (i >= (colNum - 1)) { itmMax = Number.POSITIVE_INFINITY; }
			colInfoCur.itmByCol[i] = chgFillByCol(i,itmMax,grpI,grpInfo);
			if ((colInfoCur.itmByCol[i]) == null) {
				alert(" chgCalcColInfo(): colData[].itmByCol[] is null.  The contents of the \"Change Settings\" "
							+ "box will be incomplete.\n\n  Please report this error.");
				break; 
				}
			grpI = colInfoCur.itmByCol[i].endGrp;
			}
		}
		// number of columns has been determined above & all groups have been loaded into the columns, but the
		//	number of items in each columns is not balanced:  
		//		if .fit == true, the last column may contain too few items
		//		if .fit == false, the last column may contain too many items
		// chgBalanceCols() returns itmByCol[] array after balancing the number of items in each column
	if (colNum > 1) {
		colItmArr = chgBalanceBox(colInfoCur,grpInfo);
		if (colItmArr == null) {
			alert("chgCalcColInfo(): the size of the array returned by chgBalanceBox() is null.  "
						+ "Can\'t balance the columns.\n\n  Please report this error.");
			}
		else if (colItmArr.length != colNum) {
			alert("chgCalcColInfo(): the size of the array returned by chgBalanceBox() (\"" + colItmArr.length
						+ "\") does not match the number of columns (\"" + colNum + "\"). Can\'t balance the columns."
						+ "\n\n  Please report this error.");
			}
		else {
			for (i = 0; i < colNum ; i++) { colInfoCur.itmByCol[i] = colItmArr[i]; }
			}
		}
	return(colInfoCur);
	}

	// chgBalanceBox() is passed the "final" column info data (in the colInfoCur object
	//	It also is passed a copy of the grpInfo[] array (see cchgCalcGrpInfo(), above)
	//	The function reiteratively does a series of calls to chgBalanceCols() with each 
	//		series doing pairwise balancing of all contiguous columns and with the maximum 
	//		number of cycles being one-less than the number of columns (colTot - 1). 
	//	The first series runs 'backwards' => first balancing (colTot-1) and (colTot-2),
	//		then balancing (colTot-2) and (colTot-3), etc. to (column = 1) and (column = 0).
	//	The next series of balancing runs 'forward', starting with balancing columns 0 & 1,
	//		and ending by balancing columns colTot-2 and colTot-1.
	//	At this point, if tstRemain > 0, the function starts over with another 'backwards'
	//		series.  The function should be able to handle any number of columns, but it
	//		is unlikely that there would ever be more than four columns.
	//	The function returns an array of .itmByCol objects, with the size of the array equal
	//		to the number of columns.
function chgBalanceBox(colInfoCur,grpInfo){
	var i;
	var colTot = colInfoCur.colTot;
	var colTotArr = []; // array containing all of the .itmByCol elements of colInfoCur
	for (i = 0; i < colTot; i++) { colTotArr[i] = colInfoCur.itmByCol[i]; }
	colTotArr.sort(function(a, b){return a.col - b.col});  // make certain that columns are sorted by .col
	
	var mvGrpNum;  // number of [i].endGrp & [i+1].strtGrp
	var colGrpArr = [];  // an array to hold [].itmByCol returned by chgBalanceCols()
	var tstRemain = colTot - 1;  // number of loops through data needed
	var isChgd = true;  // true if at least 1 comparison changed during loop
	var colMx = colTot - 1;
	while ((tstRemain > 0) && isChgd) {
		isChgd = false;
			// backwards "for" loop => balance from maximum col to minimum column
		for (i = colMx; i > 0; i-- ) {
			if (colTotArr[i-1].endGrp != colTotArr[i].strtGrp) {
				alert("chgBalanceBox(): end of column #" + (i-1) + " (group = " + colTotArr[i-1].endGrp
						+ ") doesn't match start of column #" + i + " (group = " + colTotArr[i].strtGrp 
						+ ").  Can\'t balance columns.\n\n  Please report this error.");
				break;
				}
			colGrpArr = chgBalanceCols(colTotArr[i-1],colTotArr[i],grpInfo);
			if (colGrpArr.length != 2) {
				alert("chgBalanceBox(): size of array (\"" + colGrpArr.length 
						+ "\") returned by chgBalanceCols() is NOT \"2\".  "
						+ "Can\'t balance columns.\n\n  Please report this error.");
				isChgd = false;  // this forces chgBalanceBox() to exit
				break;
				}
			if (colGrpArr[1].strtGrp != colTotArr[i].strtGrp) {
				isChgd = true;
				colTotArr[i-1] = colGrpArr[0];
				colTotArr[i] = colGrpArr[1];
				}
			}
		tstRemain--;
		if (tstRemain <= 0) { break; }
		if (!isChgd) { break; }
		isChgd = false;
			// forwards "for" loop => balance from minimu col to maximum column
		for (i = 0; i < colMx; i++ ) {
			if (colTotArr[i].endGrp != colTotArr[i+1].strtGrp) {
				alert("chgBalanceBox(): end of column #" + i + " (group = " + colTotArr[i].endGrp
						+ ") doesn't match start of column #" + (i+1) + " (group = " + colTotArr[i+1].strtGrp 
						+ ").  Can\'t balance columns.\n\n  Please report this error.");
				break;
				}
			colGrpArr = chgBalanceCols(colTotArr[i],colTotArr[i+1],grpInfo);
			if (colGrpArr.length != 2) {
				alert("chgBalanceBox(): size of array (\"" + colGrpArr.length 
						+ "\") returned by chgBalanceCols() is NOT \"2\".  "
						+ "Can\'t balance columns.\n\n  Please report this error.");
				isChgd = false;  // this forces chgBalanceBox() to exit
				break;
				}
			if (colGrpArr[0].endGrp != colTotArr[i].endGrp) {
				isChgd = true;
				colTotArr[i] = colGrpArr[0];
				colTotArr[i+1] = colGrpArr[1];
				}
			}
		tstRemain--;
		}  // end of while loop
	return(colTotArr);
	}


	//chgBalanceCols() is passed two .itmByCol objects (where col0 & col1 are contiguous).
	//	The function also is passed a copy of the grpInfo[] array.
	//	Within the constraints that all items within a group must be kept in the same column,
	//		the function 'balances' the columns so that the heights of the columns are equal.
	//		Thus, If [0].htUsed < [1].htUsed move strtGrp from [1] to endGrp [0]; mvDir = 1
	//		Conversely if [0].htUsed > [1].htUsed; mvDir = -1 and groups are moved from column
	//			column [0] to column [1].
	//	The object colGrp is the same object that is an element in the .itmByCol[] array
	//	 => .col is the column number
	//	 => .strtGrp is the index of in grpInfo[] of the 1st group in this column
	//	 => .endGrp is the index+1 of the last group in this column
	//	 => .htUsed is the number of pixels needed to display the items 
	//	object colGrp = {
function chgBalanceCols(colGrp0,colGrp1,grpInfo) {
	var i;
	var j;
	var colGrpArr = [];
	colGrpArr[0] = {col: colGrp0.col, strtGrp: colGrp0.strtGrp, endGrp: colGrp0.endGrp, htUsed: colGrp0.htUsed};
	colGrpArr[1] = {col: colGrp1.col, strtGrp: colGrp1.strtGrp, endGrp: colGrp1.endGrp, htUsed: colGrp1.htUsed};
	colGrpArr.sort(function(a, b){return a.col - b.col});  // make certain that columns are sorted by .col
	if (colGrpArr[0].endGrp != colGrpArr[1].strtGrp) {
		alert("chgBalanceCols():  Columns must be contigous to in order to be balanced.  End group ("
				+ colGrpArr[0].endGrp + "\") for column \"" + colGrpArr[0].col 
				+ "\" does not equal start group (\"" + colGrpArr[0].strtGrp + "\") for column \""
				+ colGrpArr[1].col + "\".  Cannot balance these columns.\n\n  Please report this error.");
		return(null);
		}
	var oldDif = colGrpArr[1].htUsed - colGrpArr[0].htUsed;
	var newDif;
	var brkGrpNum;  // number of [0].endGrp and [1].strtGrp
			// mvGrpNum is index in grpInfo[] of group that will BE MOVED
			//	=> if (mvDir > 0) mvGrpNum == brkGrpNum	=> if (mvDir < 0) mvGrpNum == brkGrpNum - 1 (!!!!)
	var mvGrpNum;   // this will change if mvDir < 0
	var mvGrpHt;  // height (including divider) in pixels of group that will be moved
		// we can combine oldDif > 0 and oldDif < 0 by using mvDir = 1 (oldDif > 0) or -1 ((oldDif < 0
	var mvDir;  // == +1 if oldDif > 0 (i.e. [1] bigger than [0]; == -1 if oldDif < 0 (i.e. [0] bigger tha [1]
	var grpLim;  // number of groups remaining in the column which is decreasing in size
	if (oldDif != 0) {
		brkGrpNum = colGrpArr[0].endGrp;
				// if mvDir == -1 move grp from [0] to [1] => mvGrpNum = [0].endGrp - 1
				// if mvDir == +1 move grp from [1] tp [0] => mvGrpNum = [1].strtGrp = [0].endGrp
		if (oldDif < 0) {
			mvDir = -1;
			mvGrpNum = brkGrpNum -1;  // grp being moved is [0].end - 1
			grpLim = colGrpArr[0].endGrp - colGrpArr[0].strtGrp;
			}
		else {
			mvDir = 1;
			mvGrpNum = brkGrpNum;
			grpLim = colGrpArr[1].endGrp - colGrpArr[1].strtGrp;
			}
		mvGrpHt = (grpInfo[mvGrpNum].numItm * glbChgItmHt) + glbChgdivdrHt;
		newDif = oldDif - (2 * mvDir * mvGrpHt);
		while ((Math.abs(oldDif) > Math.abs(newDif)) && (grpLim > 0)) {
			oldDif = newDif;
			mvGrpNum += mvDir;

			brkGrpNum = mvGrpNum;
			if (mvDir < 0) { brkGrpNum++; }
			colGrpArr[0].endGrp = brkGrpNum;
			colGrpArr[1].strtGrp = brkGrpNum;

			mvGrpHt = (grpInfo[mvGrpNum].numItm * glbChgItmHt) + glbChgdivdrHt;
			newDif = oldDif - (2 * mvDir * mvGrpHt);
			if (mvDir < 0) { grpLim = colGrpArr[0].endGrp - colGrpArr[0].strtGrp; }
			else { grpLim = colGrpArr[1].endGrp - colGrpArr[1].strtGrp; }
			if (mvGrpHt = 0) {
				alert("chgBalanceCols(): \"Change Setting\" group #" + mvGrpNum 
						+ " has a height of 0 pixels.\n\n  Please report this error.");
				break;
				}
			}
		}
			// recalculate htUsed
	var htTot = 0;
	for (i = 0; i < 2; i++ ) {  // loop through two columns
		htTot = 0;
		for (j = colGrpArr[i].strtGrp; j < colGrpArr[i].endGrp; j++) {
			if (htTot > 0) {htTot += glbChgdivdrHt; }
			htTot += (grpInfo[j].numItm * glbChgItmHt);
			}
		colGrpArr[i].htUsed = htTot;
		}
	return(colGrpArr);
	}
	
	// Unlike earlier versions, the boxes that is displayed when the user changes the settings are
	//	NOT hard-wired in Microscope.htm.  Instead they are created de novo here.
	//  NOTE:  stepper sizes should be given from large to small:  the first stepper has right=16px,
	//		the second stepper has right = 0px.
	//  when testing glbChgSetData[].grp, use parseInt() to get big group number.
	//		Decimals in .grp used to select subsets for small "Change Specific Settings" boxes
function chgBuildCol(strtInd,endInd,colNode,isFirstCol,isLastCol,isLongestCol) {
	if (colNode == null) {
		alert("chgBuildCol(): colNode is null.  Can't build column.\n\n  Please report this error.");
		return;
		}
	var i;
	var strtI = 0;
	if (strtInd < 0) {  // passed start-index value (strtInd) value illegal; must be >= 0
		alert("chgBuildCol(): illegal value for strtInd (\"" + strtInd + "\"); reset to: \"" + strtI 
				+ "\".\n\n  Please report this error.");
		}
	else { strtI = strtInd; }
	var endI = glbChgSetData.length;
	if ( endInd > endI ) {  // passed end-index value greater than array size
		alert("chgBuildCol(): endInd (\"" + endInd + "\") greater than glbChgSetData[] size (\"" + endI 
				+ "\"); reset to array size.\".\n\n  Please report this error.");
		}
	else { endI = endInd; }
	var grpOld = parseInt(glbChgSetData[strtI].grp);  // used to determine whether to insert a divider
	var grpCur = Number.NaN;  // set to glbChgSetData.grp; used to determine whether to insert a divider
	var itmNode = null;
	var inpNodeId = "";  //  id of input-text box.
	var inpNode = null;  // node for input-text box.
	var dividerNode = null;  // node for divider
	var dividerWdth;
	var isFirstItm = false;  // == true for first item in each group except for first group
		// add elements to colNode
	for (i = strtI; i < endI; i++) {
		dividerWdth = glbChgColWidth - 2;
		grpCur = parseInt(glbChgSetData[i].grp);
		if (grpOld != grpCur) {
			dividerNode = document.createElement("div");
			if (dividerNode == null) {
				alert("chgBuildCol(): node for divider is null.\n\n  Please report this error.");
				}
			else {
				dividerNode.className = "chgDivider";
				colNode.appendChild(dividerNode);
				if (!isLastCol) {
					dividerWdth += 2;
					dividerNode.style.width = dividerWdth + "px";
					}
				if (!isFirstCol) {
					dividerWdth +=2;
					dividerNode.style.width = dividerWdth + "px";
					dividerNode.style.left = "-2px";
				}
				}
			isFirstItm = true;
			grpOld = grpCur;
			}
		itmNode = chgBuildItem(glbChgSetData[i]);
		if (itmNode == null) {
			alert("chgBuildCol():  node for \"" + glbChgSetData[i].txtNm
					+ "\" is null; this variable cannot be updated.\n\n  Please report this error.");
			}
		else {  // item node is valid => set edit box text to valPrev
			colNode.appendChild(itmNode);
			if (isFirstItm) { itmNode.style.borderTop = "1px solid black"; } 
			if (isLongestCol && (i >= (endI - 1))) { itmNode.style.borderBottom = "0px"; }
			inpNodeId = "chgInp_" + glbChgSetData[i].txtId;
			inpNode = document.getElementById(inpNodeId);
			if (inpNode == null) {
				alert("chgBuildCol():  node for edit-box for \"" + glbChgSetData[i].txtNm
					+ "\" is null; this variable cannot be updated.\n\n  Please report this error.");
				}
			else if (Number.isNaN(glbChgSetData[i].valPrev)) { inpNode.value = ""; }
			else { 
				inpNode.value = glbChgSetData[i].valPrev;
						// if valPrev is initial value, text color is green; otherwise it's black 
				if (glbChgSetData[i].valInit == glbChgSetData[i].valPrev) { inpNode.style.color = "black"; }
				else { inpNode.style.color = "blue"; }
				}
			}  // end "else item node valid
		isFirstItm = false;
		}  // end "for loop through glbChgSetData[]
	return;
	}


	// 4/08/20  chgBuildItem is passed an element (cItmObj) from glbChgSetData[]
	//	It creates a node (<div>) to contain the item when displayed in a "Change Settings" Box.
	//		NOTE:  this div is named "chgItm_" txtId => this is to assure that node.id is unique.
	//			txtId can be retrieved using:  txtId = node.id.slice(7,node.id.length).
	//	Most errors are not fatal and result in an alert() but still return a non-null item-node
	//		The function does NOT issue a warning if the number of steppers is > 2; instead,
	//		it moves the input text box to make room for extra steppers.
function chgBuildItem(cItmObj) {
	var i;
	var stpWdth = 16;  // width of stepper; this is a static but it is easy to change button width this way
	var txtRght = 35;  // right side of input text box
	var itmNode = document.createElement("div");  // node for item;
	if (itmNode == null) {
		alert("chgBuildItem(): unable to create new node.  This may be a fatal error."
				+ "\n\n  Please report this error.");
		return(null);
		}
	itmNode.className = "chgItem";
	itmNode.id = "chgItm_" + cItmObj.txtId;
			// trap touchevents
			//	=> theoretically there should be no mouse=emulation if the user's finger touches any part
			//		of a "change box" item except the stepper buttons and the edit-box.  Unfortunately,
			//		this doesn't seem to be the case, so on 4/11/20, I added tchChgItm() to prevent
			//		touchevents on "change box" items from being translated into mouse events.
	itmNode.addEventListener("touchstart",function() {tchChgItm(event,this);},false);
	itmNode.addEventListener("touchend",function() {tchChgItm(event,this);},false);
	itmNode.addEventListener("touchmove",function() {tchChgItm(event,this);},false);
	itmNode.addEventListener("touchcancel",function() {tchChgItm(event,this);},false);
			// add text
	itmTxt = document.createTextNode(cItmObj.txtNm + ":");
	if (itmTxt == null) {
		alert("chgBuildItem(): unable to create text node (\"" + cItmObj.txtNm 
				+ "\").  This may be a fatal error.\n\n  Please report this error.");
		}
	else { itmNode.appendChild(itmTxt); }
			// add edit box
			//  edit box id is "chgInp_????" where ???? is object's txtId
	txtBxNode = document.createElement("input");
	if (txtBxNode != null) {
		txtBxNode.setAttribute("type","text");
		txtBxNode.className = "chgInputBx";
		txtBxNode.id = "chgInp_" + cItmObj.txtId;
		txtBxNode.onchange = function(){chgTxtInput(this)};
		itmNode.appendChild(txtBxNode);
			// need to have touch event set focus and cursor position
		txtBxNode.addEventListener("touchstart",function() {tchChgTxtBx(event,this);},true);
		txtBxNode.addEventListener("touchend",function() {tchChgTxtBx(event,this);},true);
		txtBxNode.addEventListener("touchmove",function() {tchChgTxtBx(event,this);},true);
		txtBxNode.addEventListener("touchcancel",function() {tchChgTxtBx(event,this);},true);
		}
	else { // invalid node
		alert("chgBuildItem(): unable to create input node for \"" + cItmObj.txtId 
				+ "\".  This may be a fatal error.\n\n  Please report this error.");
		}
			// add steppers
	var stpNode = null;  // current stepper's node
	var btnVal = cItmObj.btnVal;  // will sort btnVal by size
	btnVal.sort(function(a, b){return b - a});  // sorted largest to smallest
	var btnNum = btnVal.length;
	var posRght = stpWdth;  // value for .style.right for stepper assuming default of 2 steppers
	if (btnNum > 2) {  // need to move everything for more than 2 steppers
		txtRght += stpWdth * (btnNum - 2);
		txtBxNode.style.right = txtRght + "px";
		posRght = stpWdth * (btnNum - 1);
		}
	for (i = 0; i < btnNum; i++) {
		stpNode = chgBuildStepper(btnVal[i])
		if (stpNode == null) {
			alert("chgBuildItem(): stepper with value = " + btnVal[i] + " for \""
					+ cItmObj.txtNm + "\" is null.\ean\n  Please report this error.");
			break;
			}
		stpNode.style.right = posRght + "px";
		itmNode.appendChild(stpNode);
		posRght -= stpWdth;
		}
	return(itmNode);
	}

	// 4/08/20:  chgBuildStepper() creates a node(<div>) that holds a set of stepper buttons.
	//	It is passed the absolute value for the set of steppers: it will create two buttons with
	//		values +/- the passed value.
	//	It returns the node if successful (even if chgBuildStpBtn() fails); returns null on error.
function chgBuildStepper(value) {
	var i;
	var btnVal = value
	var btnNode = null;  // variable for stepper-btns returned by chgBuildStpBtn
	var stpNode = document.createElement("div");
	if (stpNode == null) {
		alert("chgBuildStepper(): unable to create new node.  This may be a fatal error.\n\n  Please report this error.");
		return(null);
		}
	stpNode.className = "chgStepper";
	for (i = 0; i < 2; i++) {
		btnNode = chgBuildStpBtn(btnVal);
		if (btnNode != null) { stpNode.appendChild(btnNode);}
		else { alert("chgBuildStepper(): btnNode (value = \"" + btnVal +"\") is null.\n\n  Please report this error."); }
		btnVal *= -1;
		}
	return(stpNode);
	}
	
	// 4/08/20 chgBuildStpBtn() creates a node containing a stepper button for a "Change Settings" box
	// 	This function also sets the value of the button and aligns the button at the top of its parent
	//		if value is > 0, or at the bottom of its parent if value is < 0
	//	It returns the node that it created.
	//	4/13/20:  For touch-screen devices, there was the problem that touching the button caused a "mouseup"
	//		emulation that (besides activating the button) caused tchMenuUnblock() to set glbTchMenuFree = free
	//		(and reset all of the clickable menu items).  I added EventListeners touchevents to prevent
	//		the touchevents from emulating a mouse, but trapping of the touch events was very erratic
	//		(maybe 2/3 touches resulted in a touchevent, while the other 1/3 were emulated as a mouseclick).
	//		Replacing "btnNode.onclick()" with an EventListner("click",...,false), improved trapping, but still 
	//		wasn't very effective.  Eventually, I hit-on using a "mouseup" EventListener: > ~29/30 touchevents were
	//		now trapped as touchEvents, and the few touchEvents that 'leaked' through and were emulated as a mouseup
	//		event seem to be trapped by chgBtnClk() and do not activate tchMenuUnblock().
function chgBuildStpBtn(value) {
	var btnNode = document.createElement("button");
	if (btnNode == null) {
		alert("chgBuildStpBtn(): unable to create new node.\n  This may be a fatal error.  Please report this error.");
		return(null);
		}
	btnNode.setAttribute("type","button");
	btnNode.className = "chgStepperBtn";
	btnNode.value = value;
	if (value < 0) {
		btnNode.innerHTML = "&#9660;";  // down-pointing triangle
		btnNode.style.bottom = "0px";
		}
	else if (value > 0) {
		btnNode.innerHTML = "&#9650;";  // up-pointing triangle
		btnNode.style.top = "0px";
		}
	else {
		alert("chbBuildStpBtn():  Illegal value (\"" + value + "\") for value.\n\nStepper button won't work.");
		}
	btnNode.addEventListener("mouseup", function(){chgBtnClk(event,this),false});
	btnNode.addEventListener("touchstart",function() {tchChgBtn(event,this);},true);
	btnNode.addEventListener("touchmove",function() {tchChgBtn(event,this);},true);
	btnNode.addEventListener("touchend",function() {tchChgBtn(event,this);},true);
	btnNode.addEventListener("touchcancel",function() {tchChgBtn(event,this);},true);
	return(btnNode);
	}
	
