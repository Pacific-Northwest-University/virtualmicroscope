// jrscpChgSet.js
//	Copyright 2019  Pacific Northwest University of Health Sciences
    
//	jrscpChgSet.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpChgSet.js)
//		- four PHP files
//	jrscpChgSet.js contains javascript functions that allow the user to change the value of 
//		many of the program's global variables.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


// jrscpChgSet.js was extracted from jrscpMenu.js on 8/13/19

		//   **********************************************************
		//   *************    Change Settings FUNCTIONS   *************
		//   **********************************************************

		// data-handling when changing settings is incredibly awkward.  I can identify the
		//		items in the "chgSetting" infoBox by reference to the parent (or grandparent)
		//		of the spinner-button, but I'm missing a good way to tie the values in the
		//		chgSetting info box back to the original global variables.  For a number of
		//		reasons (execution speed, complexity of addressing values, and need to 
		//		re-write code), I do NOT want to put the original global variables into some
		//		sort of data array.
		//	The best plan I came-up with was to build a hard-wired array (chgSetData[]) of
		//		objects where each object contains a copy of the original (old) value of the
		//		global variable, the new value (or old value if the user hasn't changed it)
		//		of the variable, and (since it makes life easier) the id of DOM element in
		//		the chgSetting infoBox.  A 'switch' statement using the array index is used
		//		to get or assign values to the global variable, but using this 'switch'
		//		is inelegant, computationally awkward, and liable to generate bugs if items are
		//		added to or removed from the array.
		//	To avoid having to search chgSetData[].idx when changing values, the index of each
		//		element within the chgSetData[] array MUST equal that element's idx value.
		//		However, the array index (and idx value) do NOT have to correspond to the 
		//		item's location in the "Change Setting" infoBox
		//	varMin is an absolute minimum. varMax usually is only a suggested maximum
var chgSetData = [ 
				{idx: 0, varName: "tile buffer", oldVal: glbSldXYBuf, newVal: Number.NaN, 
						valId:"chgTileBufVal", parId: "chgTileBuf", isInt: true, varMin: 0, varMax: 2},
				{idx: 1, varName: "tile buffer offset", oldVal: glbSldTileOff, newVal: Number.NaN, 
						valId:"chgTileOffVal", parId: "chgTileOff", isInt: false, varMin: 0, varMax: Number.NaN},
				{idx: 2, varName: "focal plane buffer", oldVal: glbSldFBuf, newVal: Number.NaN, 
						valId:"chgFBufVal", parId: "chgFBuf", isInt: true, varMin: 0, varMax: 2},
				{idx: 3, varName: "maximum focal planes loaded", oldVal: glbSldMaxF, newVal: Number.NaN, 
						valId:"chgMaxFVal", parId: "chgMaxF", isInt: true, varMin: 0, varMax: Number.NaN},
				{idx: 4, varName: "default focal plane", oldVal: glbSldFDef, newVal: Number.NaN, 
						valId:"chgDefFVal", parId: "chgDefF", isInt: true, varMin: 0, varMax: Number.NaN},
				{idx: 5, varName: "zoom-level limit for focusing", oldVal: glbSldZFLim, newVal: Number.NaN, 
						valId:"chgZFLimVal", parId: "chgZFLim", isInt: true, varMin: 0, varMax: Number.NaN},
				{idx: 6, varName: "time interval for focal plane cycling", oldVal: glbFCycInterval, newVal: Number.NaN, 
						valId:"chgFCycTimVal", parId: "chgFCycTim", isInt: true, varMin: 20, varMax: 1000},
				{idx: 7, varName: "zoom-level buffer", oldVal: glbSldZBuf, newVal: Number.NaN, 
						valId:"chgZBufVal", parId: "chgZBuf", isInt: true, varMin: 0, varMax: 2},
				{idx: 8, varName: "F x Z buffer", oldVal: glbSldFZBuf, newVal: Number.NaN, 
						valId:"chgFZBufVal", parId: "chgFZBuf", isInt: true, varMin: 0, varMax: 0},
				{idx: 9, varName: "maximum image cache size", oldVal: glbImgCacheMaxSz, newVal: Number.NaN, 
						valId:"chgMaxCacheVal", parId: "chgMaxCache", isInt: true, varMin: 0, varMax: Number.NaN},
				{idx: 10, varName: "maximum destruction-array size", oldVal: destArrayMaxNum, newVal: Number.NaN, 
						valId:"chgMaxDestArrVal", parId: "chgMaxDestArr", isInt: true, varMin: 5, varMax: Number.NaN},
				{idx: 11, varName: "interval for destruction-array timer", oldVal: destTimeInterval, newVal: Number.NaN, 
						valId:"chgDestArrIntervalVal", parId: "chgDestArrInterval", isInt: true, varMin: 5, varMax: 90},
				{idx: 12, varName: "move-button step size", oldVal: sldMvStepSz, newVal: Number.NaN, 
						valId:"chgMvBtnStpVal", parId: "chgMvBtnStp", isInt: true, varMin: 5, varMax: 40},
				{idx: 13, varName: "move-button step multiplier", oldVal: sldMvStepMult, newVal: Number.NaN, 
						valId:"chgMvBtnMultVal", parId: "chgMvBtnMult", isInt: true, varMin: 3, varMax: 20},
				{idx: 14, varName: "time interval for move-buttons", oldVal: sldMvStepInterval, newVal: Number.NaN, 
						valId:"chgMvStpIntVal", parId: "chgMvStpInt", isInt: true, varMin: 25, varMax: 750},
				{idx: 15, varName: "maximum velocity of mouse during deceleration", oldVal: sldMusSlwDwnMxVel, newVal: Number.NaN, 
						valId:"chgMusMaxVelVal", parId: "chgMusMaxVel", isInt: true, varMin: 3, varMax: 30},
				{idx: 16, varName: "mouse deceleration factor", oldVal: sldMusSlwDwn.decel, newVal: Number.NaN, 
						valId:"chgMusSlwDwnDecelVal", parId: "chgMusSlwDwnDecel", isInt: false, varMin: 0.5, varMax: 0.95},
				{idx: 17, varName: "mouse deceleration timer", oldVal: sldMusSlwDwn.interval, newVal: Number.NaN, 
						valId:"chgMusSlwDwnIntVal", parId: "chgMusSlwDwnInt", isInt: true, varMin: 5, varMax: 50},
				{idx: 18, varName: "height of cache-list box", oldVal: glbInfoBxDefHt, newVal: Number.NaN, 
						valId:"chgInfoBoxHtVal", parId: "chgInfoBoxHt", isInt: true, varMin: 350, varMax: 800},
				{idx: 19, varName: "warning box display time", oldVal: warnDisplayTime, newVal: Number.NaN, 
						valId:"chgWarnDispTimeVal", parId: "chgWarnDispTime", isInt: true, varMin: 300, varMax: 2000},
				{idx: 20, varName: "warning box fade amount", oldVal: warnFadeAmt, newVal: Number.NaN, 
						valId:"chgWarnFadeAmtVal", parId: "chgWarnFadeAmt", isInt: false, varMin: 0.03, varMax: 0.5},
				{idx: 21, varName: "warning box fade timer", oldVal: warnFadeTime, newVal: Number.NaN, 
						valId:"chgWarnFadeIntVal", parId: "chgWarnFadeInt", isInt: true, varMin: 5, varMax: 120},
				{idx: 22, varName: "minimum mouse-wheel interval", oldVal: glbPnchWhlWait, newVal: Number.NaN, 
						valId:"chgMusWhlTimeVal", parId: "chgMusWhlTime", isInt: true, varMin: 10, varMax: 500}
				];

var glbImgCacheMinSz = 1000;


	// chgSetOpen() updates chgSetData[] & *.innerHTML for the values displayed in the chgItems
	//		(.class = "chgInputBx") listed in the "Change Settings" infoBox, and then displays
	//		the "Change Settings" infoBox 
	//			(i.e., document.getElementById("chgSetting").style.display = "block")
function chgSetOpen(idStr) {
	var i;
	var idx;
	var chgIsInit = false;
	if (document.getElementById("sldBndBox").style.display == "block") {
		chgIsInit = true;
		}
			// update chgSetData
	for (i = 0; i < chgSetData.length; i++) {
		idx = chgSetData[i].idx;
		switch (idx) {
			case 0:  // Tile buffer
				chgSetData[i].oldVal = glbSldXYBuf;
				chgSetData[i].newVal = glbSldXYBuf;
				break;
			case 1:  // Tile buffer offset
				chgSetData[i].oldVal = glbSldTileOff;
				chgSetData[i].newVal = glbSldTileOff;
				break;
			case 2:  // F buffer
				chgSetData[i].oldVal = glbSldFBuf;
				chgSetData[i].newVal = glbSldFBuf;
				break;
			case 3:  // max F => note:  glbSldMaxF is NaN before initialization
				chgSetData[i].oldVal = glbSldMaxF;
				chgSetData[i].newVal = glbSldMaxF;
				if (chgIsInit) { chgSetData[i].varMax = dbMaxF; }
				break;
			case 4:  // glbSldFDef (old sldStrtF) => note: glbSldFDef is NaN before initialization
				chgSetData[i].oldVal = glbSldFDef;
				chgSetData[i].newVal = glbSldFDef;
				if (chgIsInit) { chgSetData[i].varMax = dbMaxF-1; }
				if (idStr == "chgFSetting") {
					chgSetData[idx].valId = "fchgDefFVal";
					chgSetData[idx].parId = "fchgDefF";
					}
				else {
					chgSetData[idx].valId = "chgDefFVal";
					chgSetData[idx].parId = "chgDefF";
					}
				break;
			case 5:  // sldFZLimit => can be 1 greater than maximum zooom-level
				chgSetData[i].oldVal = glbSldZFLim;
				chgSetData[i].newVal = glbSldZFLim;
				if (chgIsInit) { chgSetData[i].varMax = dbMaxZ; }
				if (idStr == "chgFSetting") {
					chgSetData[idx].valId = "fchgZFLimVal";
					chgSetData[idx].parId = "fchgZFLim";
					}
				else {
					chgSetData[idx].valId = "chgZFLimVal";
					chgSetData[idx].parId = "chgZFLim";
					}
				break;
			case 6:  // F-cycle timer:  glbFCycInterval
				chgSetData[i].oldVal = glbFCycInterval;
				chgSetData[i].newVal = glbFCycInterval;
				if (idStr == "chgFSetting") {
					chgSetData[idx].valId = "fchgFCycTimVal";
					chgSetData[idx].parId = "fchgFCycTim";
					}
				else {
					chgSetData[idx].valId = "chgFCycTimVal";
					chgSetData[idx].parId = "chgFCycTim";
					}
				break;
			case 7:  // Z buffer
				chgSetData[i].oldVal = glbSldZBuf;
				chgSetData[i].newVal = glbSldZBuf;
				break;
			case 8:  // FZ buffer
				chgSetData[i].oldVal = glbSldFZBuf;
				chgSetData[i].newVal = glbSldFZBuf;
				break;
			case 9:  // Max cache size
				chgSetData[i].oldVal = glbImgCacheMaxSz;
				chgSetData[i].newVal = glbImgCacheMaxSz;
				break;
			case 10:  // Max destArr
				chgSetData[i].oldVal = destArrayMaxNum;
				chgSetData[i].newVal = destArrayMaxNum;
				break;
			case 11:  // destArr timer
				chgSetData[i].oldVal = destTimeInterval;
				chgSetData[i].newVal = destTimeInterval;
				break;
			case 12:  // move-button step size: sldMvStepSz
				chgSetData[i].oldVal = sldMvStepSz;
				chgSetData[i].newVal = sldMvStepSz;
				break;
			case 13:  // move-button step mulitplier: sldMvStepMult
				chgSetData[i].oldVal = sldMvStepMult;
				chgSetData[i].newVal = sldMvStepMult;
				break;
			case 14:  // move-button step timer interval: sldMvStepInterval
				chgSetData[i].oldVal = sldMvStepInterval;
				chgSetData[i].newVal = sldMvStepInterval;
				break;
			case 15:  // mouse maximum deceleration velocity: sldMusSlwDwnMxVel
				chgSetData[i].oldVal = sldMusSlwDwnMxVel;
				chgSetData[i].newVal = sldMusSlwDwnMxVel;
				break;
			case 16:  // mouse deceleration factor: sldMusSlwDwn.decel
				chgSetData[i].oldVal = sldMusSlwDwn.decel;
				chgSetData[i].newVal = sldMusSlwDwn.decel;
				break;
			case 17:  // mouse deceleration timer: sldMusSlwDwn.interval
				chgSetData[i].oldVal = sldMusSlwDwn.interval;
				chgSetData[i].newVal = sldMusSlwDwn.interval;
				break;
			case 18:  // height of infoBox: glbInfoBxDefHt
				chgSetData[i].oldVal = glbInfoBxDefHt;
				chgSetData[i].newVal = glbInfoBxDefHt;
				break;
			case 19:  // warning box display time: warnDisplayTime
				chgSetData[i].oldVal = warnDisplayTime;
				chgSetData[i].newVal = warnDisplayTime;
				break;
			case 20:  // warning box fade amount: warnFadeAmt
				chgSetData[i].oldVal = warnFadeAmt;
				chgSetData[i].newVal = warnFadeAmt;
				break;
			case 21:  // warning box fade timer interval: warnFadeTime
				chgSetData[i].oldVal = warnFadeTime;
				chgSetData[i].newVal = warnFadeTime;
				break;
			case 22:  // mouse-wheel speed governor: glbPnchWhlWait
				chgSetData[i].oldVal = glbPnchWhlWait;
				chgSetData[i].newVal = glbPnchWhlWait;
				break;
			default:
				alert('chgSetOpen(): no array element with idx value = ' + i + '.  Cannot open the \"Change Settings\" dialog box');
				return;
			}
		if (!Number.isFinite(chgSetData[i].newVal)) {
			document.getElementById(chgSetData[i].valId).value = ""; 
			}
		else {	
			document.getElementById(chgSetData[i].valId).value = chgSetData[i].newVal;
			if (chgSetData[i].newVal == chgSetData[i].oldVal) {
				document.getElementById(chgSetData[i].valId).style.color = "black";
				}
			else {
				document.getElementById(chgSetData[i].valId).style.color = "red";
				}
			}
		}
	infoBxInitPos(idStr);
	document.getElementById(idStr).style.display = "block";
	return;
	}

	// clicking the "X" box in the top-right hand corner of the chgSetting "infoBox" causes
	//		the chgSetting box to close, and any changes are lost.  Since the user might
	//		think that the box could be reopened with the old changes intact, 
	//		chgSetCloseConfirm() asks for confirmation before closing the window if any
	//		changes have been made.
	//	Clicking the "Cancel" button on this infoBox's menu causes the box to close WITHOUT
	//		requesting confirmation.
function chgSetCloseConfirm(idStr) {
	var i;
	var txtStr = 'None of the changes that you have made to the settings will be saved.\n\n';
	txtStr += 'Click \"OK\" to close the \"Change Setting\" box.\n';
	txtStr += 'Click \"Cancel\" to return to the \"Change Setting\" box.'
			// look to see if any of the settings have been changed.
			//	Only query user with confirm box if data has been changed
	for (i=0; i< chgSetData.length ; i++) {
		if ( !(Number.isNaN(chgSetData[i].oldVal) && Number.isNaN(chgSetData[i].oldVal))
					&& (chgSetData[i].oldVal != chgSetData[i].newVal)) {  // query user
			if (confirm(txtStr)) {
				document.getElementById(idStr).style.display = "none";
				}
			return;
		 	}
		}
	document.getElementById(idStr).style.display = "none";
	return;
 	}

	// chgInput() is called when an onchange event occurs in one of the chgSetting
	//		text boxes.  The function is passed:
	//	(1) chgNode:  a 'pointer' to the box that was changed, and
	//	(2) idx:  the index in chgSetData[] corresponding to that box
	//	The function tests whether the entered value is a number.  If it is a number
	//		the function passes the value and idx to chgVerifyVal() ... a separate 
	//		function is used for verifying the validity of the input value because
	//		the input value can also be set by the spinner buttons.
function chgInput(chgNode,idx) {
	var txtAlert = "";
			// check for alignment of idx
	if (chgNode.id != chgSetData[idx].valId) { // idx does NOT match chgItem; this shouldn't happen
				// get name (text in box) for parent node
		var parentNodeName = chgNode.parentNode.firstChild.nodeValue;
		var txtParName = parentNodeName.toString();
		var endC = txtParName.indexOf(":");
				//build string displayed in alert box
		var txtAlert = 'ERROR:  chgInput():\n\nThe setting being changed (\"' + txtParName.substring(4,endC);
		txtAlert += '\")\ndoes not match the ID number (' + idx  + ' = \"' + chgSetData[idx].varName;
		txtAlert += '\").\nThe setting could not be changed.  Please report this bug.';
				// show alert message & exit.
		alert(txtAlert);
		chgSetCloseConfirm();
		return;
		}
			// check to see if entered value is a number
	var entVal = Number(chgNode.value);   // entered value
	var newVal = chgSetData[idx].newVal;  //'new' value in chgSetData[]
	if (Number.isNaN(entVal)) {
		txtAlert = 'The value (\"' + chgNode.value +'\") entered for \"' + chgSetData[idx].varName
						+ '\" must be a number.';
		if (Number.isNaN(chgSetData[idx].newVal)) {  // newVal is NaN, make input field blank
			alert(txtAlert);
			chgNode.value = "";
			}
		else {
			txtAlert += '\n The previous value (\"' + newVal + '\") is being retained.';
			alert(txtAlert);
			chgNode.value = chgSetData[idx].newVal;
			}
		return;
		}
	chgVerifyVal(entVal,idx);  // verify value & write to chgSetting box & chgSetData[].newVal
	return;
	}

	// chgClkBtn() is called by an onclick event involving one of the spinner buttons on the chgSetting 'infoBox'
	//	The function is passed:
	//	(1)	btnNode: a 'pointer' to the button that was clicked.
	//	(2)	idx:  the index of the entry in chgSetData[] corresponding to the item that was clicked.
	//	The function checks to make certain that idx and btnNode correspond to the same chgItem element,
	//		and then adds the value of the button to the chgSetData[].newVal.  The resulting value, calVal,
	//		and the index (idx) are passed to chbVerifyVal(), which will check the validity of calVal and
	//		update chgSetData[].newVal and the 'chgInputBx'.	
function chgClkBtn(btnNode,idx) {
	var txtAlert = "";
	var newVal = chgSetData[idx].newVal;
	if (Number.isNaN(newVal)) { newVal = 0; }  // if newVal has not been initialized, assume it is 0
	var grParNode = btnNode.parentNode.parentNode;
	if (grParNode.id != chgSetData[idx].parId) {  // idx does NOT match chgItem; this shouldn't happen
		var grParName = grParNode.firstChild.nodeValue;
		var txtGrParName = grParName.toString();
		var endC = txtGrParName.indexOf(":");
				//build string displayed in alert box
		var txtAlert = 'ERROR:  chgClkBtn():\n\nThe setting being changed (\"' + txtGrParName.substring(4,endC);
		txtAlert += '\")\ndoes not match the ID number (' + idx  + ' = \"' + chgSetData[idx].varName;
		txtAlert += '\").\nThe setting could not be changed.  Please report this bug.';
				// show alert message & exit.
		alert(txtAlert);
		chgSetCloseConfirm();
		return;
		}
			// increment old 'newVal' by the value of btnNode
	var calVal = Number(newVal) + Number(btnNode.value);
	if (Number.isNaN(calVal)) {
		txtAlert = 'ERROR:  chgClkBtn():\n\nIncrementing the value of \"' + chgSetData[idx].varName + '\",';
		txtAlert += '\n by the button value (\"' + btnNode.value + '\") resulted in an illegal value (\"NaN\").';
		if (Number.isNaN(chgSetData[idx].newVal)) {
			alert(txtAlert);
			document.getElementById(chgSetData[idx].valId).value = "";
			}
		else {
			txtAlert += '\n The previous value (\"' + chgSetData[idx].newVal + '\") is being retained.';
			alert(txtAlert);
			document.getElementById(chgSetData[idx].valId).value = chgSetData[idx].newVal;
			}
		return;
		}
	chgVerifyVal(calVal,idx); // verify value & write to chgSetting box & chgSetData[].newVal
	return;
	}

	//chgVerifyVal is passed a number obtained from the chgSetting 'infoBox' (see chgInput() and chgClkBtn())
	//	and the index to chgSetData[] corresponding to the variable being changed.
	//	The function checks the value for its validity, and then sets the appropriate chgSetData[].newVal and chgInputBx
	//	with the updated variable.
function chgVerifyVal(strtVal,idx) {
	var tmpTxt = "";
	var txtAlert = "";  // temporary string used by 'alert' and 'confirm' boxes.
	var curVal = strtVal;  // the new value => it may be modified - see below
	var newVal = chgSetData[idx].newVal;  // this is the 'newVal in chgSetData[], it is NOT the curVal being tested
	var varMin = chgSetData[idx].varMin;
	var varName = chgSetData[idx].varName;
	var refIdx;  // integer used as index to cross-reference setting-values
	var maxVal = chgSetData[idx].varMax;  // maximum suggested/allowable value
	var tmpVal;  // a holder for temporary values
	
			// check general characteristics: integer values
	if ((chgSetData[idx].isInt) && !Number.isInteger(curVal)) {
		txtAlert = 'The new value \"' + curVal + '\" is not an integer and the \"' ;
		txtAlert += varName + '\" value must be an integer.';
		txtAlert += '\n Click \"OK\" to round the value to \"' + Math.round(curVal) + '\".';
		txtAlert += '\n Click \"Cancel\" to keep the previous value (\"' + newVal + '\").';
		if (confirm(txtAlert)) { curVal = Math.round(curVal); }
		else { curVal = newVal; }
		}
			// check general characteristics => minimum value
	if (Number.isFinite(varMin) && (curVal < varMin)) {
		if (!chgSetData[idx].isInt) { curVal = Math.round(curVal * 1000)/1000; }
		txtAlert = 'The value for \"' + varName + '\" must be greater than or equal to \"' + varMin + '\".';
		txtAlert += '\n The new value (\"' + curVal + '\") is less than the minimum allowable value (\"' + varMin +'\").';
		txtAlert += '\n\n Click \"OK\" to set the \"' + varName + '\" value to the minimum allowable value (\"' + varMin +'\").';
		txtAlert += '\n Click \"Cancel\" to keep the previous value (\"' + newVal + '\").'; 
		if (confirm(txtAlert)) { curVal = varMin; }
		else { curVal = newVal; }
		}
			// check spedific characteristics
	switch (chgSetData[idx].idx) {
		case 0:		// Tile buffer: glbSldXYBuf
		case 2:		// Focal plane buffer: glbSldFBuf
		case 7:		// Zoom buffer: glbSldZBuf
			if (curVal > maxVal) {
				txtAlert = 'Warning:  the new value (\"' + curVal +'\") for \"' + varName +'\" is greater than recommended.';
				txtAlert += '\n\nAlthough values for \"' + varName +'\" greater than \"' + maxVal + '\" are allowed,';
				txtAlert += '\n   the performance of the microscope viewer may become erratic with larger';
				txtAlert += '\n   values for \"' + varName +'\".';
				alert(txtAlert);
				}
			break;
		case 15:
		case 18:
		case 19:
			if (curVal > maxVal) {
				txtAlert = 'Warning:  the new value (\"' + curVal +'\") for \"' + varName +'\" is greater than recommended.';
				alert(txtAlert);
				}
			break;
		case 16:
		case 17:
		case 20:
			if (!chgSetData[idx].isInt) {curVal = Math.round(curVal * 1000)/1000; }
			if (curVal > maxVal) {
				txtAlert = 'The value of \"' + varName +'\" (\"' + curVal + '\") is greater than the maximum allowed (\"' + maxVal + '\").';
				txtAlert += '\n\n  Click \"OK\" to set \"' + varName +'\" to its maximum value (\"' + maxVal + '\").';
				txtAlert += '\n  Click \"Cancel\" to retain previous value (\"' + newVal + '\") for \"' + varName +'\".';
				if (confirm(txtAlert)) { curVal = maxVal; }
				else { curVal = newVal; }
				}
			break;
		case 1:    // Tile buffer offset
			refIdx = 0;
			maxVal = chgSetData[refIdx].newVal;
			if (curVal > maxVal) {
				txtAlert = 'The new \"' + varName +'\" value (\"' + curVal + '\") for \"' + varName + '\" is too large.';
				txtAlert += '\n The viewer will not function properly if the \"' + varName + '\" value is greater than the \"' + chgSetData[refIdx].varName + '\" value (\"' + maxVal +'\").';
				txtAlert += '\n A better value for \"' + varName + '\" probably is: 0.5 x ' + maxVal + ', or ';
				tmpVal = Math.round((maxVal/2) * 100)/100;
				txtAlert += tmpVal + '.';
				txtAlert += '\n\n  Click \"OK\" to set \"' + varName +'\" to \"' + tmpVal + '\".';
				txtAlert += '\n  Click \"Cancel\" to retain previous value (\"' + newVal + '\") for \"' + varName +'\".';
				if (confirm(txtAlert)) { curVal = tmpVal; }
				else { curVal = newVal; }
				}
					// truncate rounding errors
			curVal = Math.round(curVal * 100)/100;
			break;
		case 3:  //maxF
		case 4:  //default F
		case 5:  // glbSldZFLim
			if ((Number.isFinite(maxVal)) && (curVal > maxVal)) {
				txtAlert = '\"' + varName + '\" cannot be greater than the ';
				if (chgSetData[idx].idx == 5) { txtAlert += 'the number of zoom-levels'; }
				else if (chgSetData[idx].idx == 4) { txtAlert += 'the highest focal plane'; }
				else {txtAlert += 'total number of focal planes'; }
				txtAlert += ' (\"' + maxVal + '\").';
				txtAlert += '\n  The value entered (\"' + curVal + '\") is too large and will be re-set to \"' + maxVal + '\").';
				alert(txtAlert);
				curVal = maxVal;
				}
			tmpVal = (2 * chgSetData[2].newVal) + 1;  
			if ((idx == 3) && (curVal < tmpVal)) {
				txtAlert = 'The ' + varName + '(\"' + curVal +'\") should at least the minimum number of'
				txtAlert += '\n  of focal planes loaded, which is:  1 + (2 x \"focal plane buffer\") = ' + tmpVal + '.';
				txtAlert += '\n\n  Click \"OK\" to set \"' + varName +'\" to \"' + tmpVal + '\".';
				txtAlert += '\n  Click \"Cancel\" to retain previous value (\"' + newVal + '\") for \"' + varName +'\".';
				if (confirm(txtAlert)) { curVal = tmpVal; }
				else { curVal = newVal; }
				}
			break;
		case 6: 
		case 11:
		case 14:
		case 21:
		case 22:
			if (curVal > maxVal) {
				txtAlert = 'While allowed, the new value (\"' + curVal +'\") chosen for the';
				txtAlert += '\n   ' + varName + ' will result in a '
				if (idx == 22) {
					txtAlert += '\n  slow mouse-wheel response time (';
					}
				else { 
					txtAlert += '\n  very slow cycling time ('
					}
				txtAlert += (Math.round(curVal)/1000) + ' seconds).';
				if (idx == 11) {
					txtAlert += '\n\n  This may result in accumulation of view-planes within';
					txtAlert += '\n   the destruction-array, and decreased or unstable';
					txtAlert += '\n   performanceof the microscope viewer';
					}
				txtAlert += '\n\nA smaller value probably will be more satisfactory.';
				alert(txtAlert);
				}
			break;
		case 8:		// F x Z buffer: glbSldFZBuf 
			if ( curVal > chgSetData[2].newVal ) { // glbSldFZBuf > glbSldFBuf
				txtAlert = 'Warning:  the new value for \"' + varName + '\" (\"' + curVal +'\") is greater than';
				txtAlert += '\n  the value of \"' + chgSetData[2].varName + '\" (\"' + chgSetData[2].newVal + '\").';
				txtAlert += '\n  This may result in unusual or erratic behavior of the microscope viewer.';
				alert(txtAlert);
				}
			if ( curVal > chgSetData[7].newVal ) { // glbSldFZBuf > glbSldZBuf
				txtAlert = 'Warning:  the new value for \"' + varName + '\" (\"' + curVal +'\") is greater than';
				txtAlert += '\n  the value of \"' + chgSetData[7].varName + '\" (\"' + chgSetData[7].newVal + '\").';
				txtAlert += '\n  This may result in unusual or erratic behavior of the microscope viewer.';
				alert(txtAlert);
				}
			if (curVal > maxVal) {
				txtAlert = 'Warning:  Although values for \"' + varName +'\" greater than \"' + maxVal + '\" are allowed,';
				txtAlert += '\n  values of \"' + varName + '\" greater than \"' + maxVal + '\" will have a significant detrimental effect on the performance';
				txtAlert += "\n  of the microscope viewer and the viewer's performance may become erratic with values for ";
				txtAlert += '\n  \"' + varName +'\" greater than zero.  It is STRONGLY recommended that you SET THIS VALUE TO ZERO.';
				txtAlert += '\n\nClick \"OK\" to retain the new value (\"' + curVal + '\") for \"' + varName +'\".';
				txtAlert += '\nClick \"Cancel\" to re-set \"' + varName +'\" to zero';
				if (!confirm(txtAlert)) { curVal = 0;}
				}
			break;
		case 9:
			if (curVal < glbImgCacheMinSz) {
				txtAlert = 'The microscope viewer uses the \"image cache\" to decrease the number of requests made to the';
				txtAlert += '\n  microscope server.  While extremely large values for the \"' + varName + '\" may strain';
				txtAlert += '\n  your computer\'s memory, small values for the \"' + varName + '\", such as \"' + curVal + ' \",';
				txtAlert += '\n  will greatly increase the demands on the microscope server and will degrade the performance of the';
				txtAlert += '\n  microscope viewer.  You should consider increasing the value of  \"' + varName + '\"';
				txtAlert += '\n  to (much) more than \"' + glbImgCacheMinSz +'\".';
				alert(txtAlert);
				}
			break;
		case 12:
			if (curVal > maxVal) {
				txtAlert = 'The value chosen for the \"' + varName + '\" (\"' + curVal + '\") is larger than recommended.';
				txtAlert += '\n  Large movements of the microscope stage can be disorienting.';
				txtAlert += '\n  A smaller value (e.g., "20") might be better.';
				alert(txtAlert);
				}
			tmpVal = chgSetData[13].newVal;
			if (curVal * tmpVal > Math.min(glbTileSzX, glbTileSzY)) {
				txtAlert = 'It works best if the product of:';
				txtAlert += '\n    \"' + varName + '\" x \"' + chgSetData[13].varName +'\" < tile-size.';
				txtAlert += '\nSince:  ' + curVal +' x ' + tmpVal +' > ' + Math.min(glbTileSzX, glbTileSzY);
				txtAlert += '\n  You may want to decrease the values of one (or both) of: ';
				txtAlert += '\n  \"' + varName + '\" or \"' + chgSetData[13].varName +'\".';
				alert(txtAlert);
				}
			break;
		case 13:
			if (curVal > maxVal) {
				txtAlert = 'The value chosen for the \"' + varName + '\" (\"' + curVal + '\") is larger than recommended.';
				txtAlert += '\n  Large movements of the microscope stage can be disorienting.';
				txtAlert += '\n  A smaller value (e.g., "10") might be better.';
				alert(txtAlert);
				}
			tmpVal = chgSetData[12].newVal;
			if (curVal * tmpVal > Math.min(glbTileSzX, glbTileSzY)) {
				txtAlert = 'It works best if the product of:';
				txtAlert += '\n    \"' + chgSetData[12].varName + '\" x \"' + varName +'\" < tile-size.';
				txtAlert += '\nSince:  ' + tmpVal +' x ' + curVal +' > ' + Math.min(glbTileSzX, glbTileSzY);
				txtAlert += '\n  You may want to decrease the values of one (or both) of: ';
				txtAlert += '\n  \"' + chgSetData[12].varName + '\" or \"' + varName + '\".';
				alert(txtAlert);
				}
			break;
		default:
			break;
		}  // end switch
	chgSetData[idx].newVal = curVal;
	if (Number.isFinite(curVal)) {
		document.getElementById(chgSetData[idx].valId).value = curVal;
		}
	else {
		document.getElementById(chgSetData[idx].valId).value = "";
		}
	if (curVal == chgSetData[idx].oldVal) {
		document.getElementById(chgSetData[idx].valId).style.color = "black";
		}
	else {
		document.getElementById(chgSetData[idx].valId).style.color = "rgb(232,0,0)";
		}
	return;
	}


function chgSetSubmit(idStr) {
	var i;
	var doResize = false;
	var doChgF = false;
	var indFDef = 4;   // index in chgSetData[] for glbSldFDef => this is a constant
	var indZFLim = 5;  // index in chgSetData[] for glbSldZFLim => this is a constant
	
	for (i= 0; i < chgSetData.length; i++) {
		if (chgSetData[i].newVal != chgSetData[i].oldVal) {
		switch (chgSetData[i].idx) {
			case 0:  // Tile buffer
				glbSldXYBuf = chgSetData[i].newVal;
				doResize = true;  // need to run sldResizeSldVw() if glbSldXYBuf changes
				break;
			case 1:  // Tile buffer offset
				glbSldTileOff = chgSetData[i].newVal;
				break;
			case 2:  // F buffer
				glbSldFBuf = chgSetData[i].newVal;
				break;
			case 3:  // max F => note:  glbSldMaxF is NaN before initialization
				glbSldMaxF = chgSetData[i].newVal;
				break;
			case 4:  // glbSldFDef (old sldStrtF) => note: glbSldFDef is NaN before initialization
				glbSldFDef = chgSetData[i].newVal;
				doChgF = true;  // may need to change focus
				break;
			case 5:  // sldZLimit => can be 1 greater than maximum zooom-level
				glbSldZFLim = chgSetData[i].newVal;
				doChgF = true;  // may need to change focus parameters
				break;
			case 6:  // F-cycle time:  glbFCycInterval
				glbFCycInterval = chgSetData[i].newVal;
				break;
			case 7:  // Z buffer
				glbSldZBuf = chgSetData[i].newVal;
				break;
			case 8:  // FZ buffer
				glbSldFZBuf = chgSetData[i].newVal;
				break;
			case 9:  // Max cache size
				glbImgCacheMaxSz = chgSetData[i].newVal;
				break;
			case 10:  // Max destArr
				destArrayMaxNum = chgSetData[i].newVal;
				break;
			case 11:  // destArr timer
				destTimeInterval = chgSetData[i].newVal;
				break;
			case 12:  // move-button step size: sldMvStepSz
				sldMvStepSz = chgSetData[i].newVal;
				break;
			case 13:  // move-button step mulitplier: sldMvStepMult
				sldMvStepMult = chgSetData[i].newVal;
				break;
			case 14:  // move-button step timer interval: sldMvStepInterval
				sldMvStepInterval = chgSetData[i].newVal;
				break;
			case 15:  // mouse maximum deceleration velocity: sldMusSlwDwnMxVel
				sldMusSlwDwnMxVel = chgSetData[i].newVal;
				break;
			case 16:  // mouse deceleration factor: sldMusSlwDwn.decel
				sldMusSlwDwn.decel = chgSetData[i].newVal;
				break;
			case 17:  // mouse deceleration timer: sldMusSlwDwn.interval
				sldMusSlwDwn.interval = chgSetData[i].newVal;
				break;
			case 18:  // height of infoBox: glbInfoBxDefHt
				glbInfoBxDefHt = chgSetData[i].newVal;
				break;
			case 19:  // warning box display time: warnDisplayTime
				warnDisplayTime = chgSetData[i].newVal;
				break;
			case 20:  // warning box fade amount: warnFadeAmt
				warnFadeAmt = chgSetData[i].newVal;
				break;
			case 21:  // warning box fade timer interval: warnFadeTime
				warnFadeTime = chgSetData[i].newVal;
				break;
			case 22:  // mouse-wheel speed governor: glbPnchWhlWait
				glbPnchWhlWait = chgSetData[i].newVal;
				break;
			default:
				alert('chgSetOpen(): no array element with idx value = ' + i + '.  Cannot update the \"Change Settings\" dialog box');
				break;
				}
			}
		}
	if (document.getElementById("sldBndBox").style.display == "block") {  // viewer is initialized
		if (doResize) { sldResizeSldVw(); }  // need to re-size sldView if glbSldXYBuf changes
		if (doChgF) {   // may need to update visible plane, buffer planes, or focus controls.
			sldChgFDefVal(chgSetData[indFDef].oldVal,chgSetData[indZFLim].oldVal);
			}
		}
	document.getElementById(idStr).style.display = "none";
	return;
	}

