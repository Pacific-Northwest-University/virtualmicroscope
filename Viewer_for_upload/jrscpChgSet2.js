// jrscpChgSet2.js
//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrscpChgSet2.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	The "PNWU Microscope" consists of two parts a Viewer and a SlideBox.  This file 
//		(jrscpChgSet2.js) is part of the Viewer.  Currently, the Viewer consists 
//		of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheets
//		- 11 javascript files (including jrscpChgSet2.js)
//		- three PHP files
//	jrscpChgSet2.js and jrscpChgSet1.js contain javascript functions that allow the user to change the value of 
//		many of the program's global variables.
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//  jrscpChgSet2.js was derived by splitting jrscpChgSet.js into two files on 4/28/20.  This was done
//		because the single file (jrscpChgSet.js) was becoming too large to work with easily.
//		After we've finished writing the "Change Setting" code, we should consider re-combining the
//		two files (jrscpChgSet1.js and jrscpChgSet2.js) back into a single file, since all of the
//		functions contained in these files are related
//	jrscpChgSet1.js contains the functions involved in initializing glbChgSetData[] and in building
//		"Change Setting" boxes.
//	jrscpChgSet2.js contains the functions involved in handling input of values for the various global
//		variables, including error-checking.



// **********************************************************************
// ************     Responding to value-changing input       ************  
// **********************************************************************


	// chgArrIndex() is passed a text string that should match one of the glbChgSetData[].txtId
	//	The function returns the index within glbChgSetData[] of the object whose .txtId matches
	//		the argument text string.
	//	The function returns NaN if no match is found.
function chgArrIndex(txtId) {
	var i;
	var arrSz = glbChgSetData.length;
	for (i = 0; i < arrSz; i++) {
		if (txtId ==  glbChgSetData[i].txtId) { break; }
		}
	if ( i < arrSz ) { return(i); }
	return(Number.NaN);
	}


function chgBtnClk(evt,btnNode) {
	if (evt != null) {
		evt.preventDefault();
		evt.stopPropagation();
		}
	var itmNode = btnNode.parentNode.parentNode;
	var txtId = itmNode.id.slice(7,itmNode.id.length);
	var arrI = chgArrIndex(txtId);  // index in glbChtSetData[] corresponding to inpNode
	if (Number.isNaN(arrI)) {
		alert("chgBtnClk(): Could not find \"" + txtId +"\" in glbChgDataSet[].  Can\'t change value."
				+ "\n\n  Please report this error.");
		return;
		}
	var valBtn = Number(btnNode.value);
	if (Number.isNaN(valBtn)) {
		alert("chgBtnClk(): Button value (\"" + txtId +"\") must be a number.  Can\'t change value."
				+ "\n\n  Please report this error.");
		return;
		}
	var valCur = glbChgSetData[arrI].valCur;
		// if "Change Settings" window has just been opened, then .valCur is NaN
	if (Number.isNaN(valCur)) {  // no current value (valCur is NaN)
		valCur = glbChgSetData[arrI].valPrev;  // use .valPrev as valCur 
		if (Number.isNaN(valCur)) { valCur = 0; }  // .valPrev not set (e.g., no slide)
		}
	glbChgSetData[arrI].valNew = valCur + valBtn;
	if (glbChgSetData[arrI].isInt) { glbChgSetData[arrI].valNew = valCur + valBtn; }
	else { glbChgSetData[arrI].valNew = (Math.round((valCur + valBtn) * 100000))/100000; }
	var srcStr = document.getElementById("chgTitleTxt").innerHTML.replace(/<br>/g," ");
	chgVerifyVal(arrI,("\"" + srcStr + "\" box"),0);
	return;
	}

	// 4/11/20  chgTxtInput() is called by an onchange event occurring in an text-edit input box
	//		that is a child of an item in a "Change Setting" box.  It is passed the node to the
	//		text-edit input box (NOT the parent node).
	//	Because we need to be able to write to the edit box (to change its displayed value), each
	//		change-setting text-edit box has its own id, which is "chgInp_" + cItmObj.txtId.  Thus,
	//		we can get the index into glbChgSetData[] without reference to the parrent node.
	//		However, as a check for bugs, we also compare inpNode.id with parentNode.id.
	//	The new value received from the onchange event is copied to glbChgSetData[].valNew.
	//	The function then passes the value to chgVerifyVal(), to check and (if necessary modify)
	//		the value.  The current function (chgTxtInput()) saves the value returned by chgVerifyVal()
	//		in glbChgSetData[].valCur, and calls chgWriteCur() to write this value to the edit box. 
function chgTxtInput(inpNode) {
		// test for valid node
	if (inpNode.id.slice(0,7) != "chgInp_") {
		alert("chgTxtInput(): node (\"" + inpNode.id 
				+ "\") is not a \"Change Setting\" text-edit input box.  Can\'t change value."
				+ "\n\n  Please report this error.");
		return;
		}
	var txtId = inpNode.id.slice(7,inpNode.id.length);
	var arrI = chgArrIndex(txtId);  // index in glbChtSetData[] corresponding to inpNode
	if (Number.isNaN(arrI)) {
		alert("chgTxtInput(): Could not find \"" + txtId +"\" in glbChgDataSet[].  Can\'t change value."
				+ "\n\n  Please report this error.");
		return;
		}
	var parNodeId = inpNode.parentNode.id;
	if (parNodeId.slice(7,parNodeId.length) != txtId) {
		alert("chgTxtInput(): \"Change Setting\" item (\"" + parNodeId 
				+ "\") does not match text-edit box (\"" + inpNode.id 
				+ "\").  The value will be changed, but this may be a fatal error."
				+ "\n\n  Please report this error.");
		}
		// get, check & write value
	glbChgSetData[arrI].valNew = inpNode.value;
	var srcStr = document.getElementById("chgTitleTxt").innerHTML.replace(/<br>/g," ");
	chgVerifyVal(arrI,("\"" + srcStr + "\" box"),0);
	return;
	}

	// chgWriteVal() writes .valCur into text-edit window in "Change Settings" box
function chgWriteVal(arrI) {
		// check for valid arrI
	if ((arrI < 0) || (arrI >= glbChgSetData.length)) {
		alert("chgWriteVal():  The index to glbChgSetData[] (\"" + arrI 
				+ "\") must be between 0 and " + (glbChgSetData.length - 1) 
				+ ".  Can\'t write value.\n\n Please report this error.");
		return;
		}
	var inpNode = document.getElementById("chgInp_" + glbChgSetData[arrI].txtId);
	if (inpNode == null) {
			// Command-line arguments can change settings without a "Change Settings" box 
			//	being open ... so inpNode can be null (without an error)
			//	 ... in this case, just return without doing anything.
		return;
		}
	var valCur = glbChgSetData[arrI].valCur;
	if (Number.isNaN(valCur)) { inpNode.value = ""; }
	else { inpNode.value = valCur; }
	if (valCur == glbChgSetData[arrI].valInit) { inpNode.style.color = "black"; }
	else if (valCur == glbChgSetData[arrI].valPrev) { inpNode.style.color = "blue"; }
	else { inpNode.style.color = "red"; }
	return;
	}

	// 5/07/20:  chgVerifyVal():  eliminate "else if" chain:  function now returns
	//		as soon as it opens chgUserRespBox
	// chgVerifyVal() checks the value of .valNew against .isInt, isCrossRef, .warnMin,
	//		.warnMax, .absMin, and .absMax.  If .valNew doesn't meet one of these criteria,
	//	 	The function calls chgOpenUsrRespBox() or chgCrossRef() (which calls chgOpenUsrRespBox()
	//		to let the user deal with bad value. 
	//	The function is passed:
	//	(1)	arrI => the index to glbChgSetData[] (obtained via chgArrIndex() or cmdChgArrIndex())
	//	(2) source => is the input that generated the call to chgVerifyVal.  It is either
	//			"URL" if the setting was being changed via a URL-command, or
	//			\"title-of-"chgSetBx"-box\" box
	//	(3) a value -1,0,1 used to suppress .warnMin (-1) or .warnMax(+1) testing when the function
	//			is being re-called by chgCrossRef().  Should be 0 except for calls by chgCrossRef()
function chgVerifyVal(arrI,source,tmpWarnSuppress) {
		// check for valid arrI
	if ((arrI < 0) || (arrI >= glbChgSetData.length)) {
		alert("chgVerifyVal():  The index to glbChgSetData[] (\"" + arrI 
				+ "\") must be between 0 and " + (glbChgSetData.length - 1) 
				+ ".  Can\'t change value.\n\n Please report this error.");
		return;
		}
	var valNew = glbChgSetData[arrI].valNew.toString();
	if (valNew.replace(/ /g,"") == "") { valNew = Number.NaN; }
			// make valNew into a number
	valNew = Number(valNew);
		// deal with empty entries => this MUST be done before testing for integer
		//	requiring valPrev == NaN eliminates the possibility setting a variable to NaN
		//		after a slide has been loaded
	if (Number.isNaN(valNew) && Number.isNaN(glbChgSetData[arrI].valPrev)) {
		glbChgSetData[arrI].valCur = Number.NaN;
		glbChgSetData[arrI].valNew = Number.NaN;
		chgWriteVal(arrI);
		return;
		}
	var txtMsg;
	var warnSupVal = glbChgSetData[arrI].warnSuppress;
		// check for integers
	if (glbChgSetData[arrI].isInt && !Number.isInteger(valNew)) {
		chgOpenUsrRespBox("notInt",source,"",arrI);
		return;
		}
			// check for non-integer non-numbers
	if (Number.isNaN(valNew)) {
		chgOpenUsrRespBox("notNum",source,"",arrI);
		return;
		}
			// check for cross-ref
			//	glbChgReVerify is set to true when chgCrossRef() calls chgOpenUsrRespBox()
			//	if glbChgReVerify == true, chgCloseUsrRespBox() re-calls chgVerifyVal() when user clicks a
			//		button on the "chgUsrRespBx" box
			// chgCrossRef() returns false if the numbers do NOT conflict and chgOpenUsrRespBox() was NOT called
	if (glbChgReVerify) {  // if glbChgReVerify == true, skip chgCrossRef and go on to other tests
		glbChgReVerify = false;
		}
	else if (glbChgSetData[arrI].isCrossRef) {
		if (chgCrossRef(source,arrI)){ return; }
		}
			// NOTE (5/07/20): must have return after each call to chgOpenUsrRespBox()
	if (valNew < glbChgSetData[arrI].absMin) {
		chgOpenUsrRespBox("absMin",source,"",arrI);
		return;
		}
	if (valNew > glbChgSetData[arrI].absMax) {
		chgOpenUsrRespBox("absMax",source,"",arrI);
		return;
		}
		// if newVal < .warnMin AND warning not suppressed
	if ((valNew < glbChgSetData[arrI].warnMin) && (tmpWarnSuppress >= 0)
				&& (warnSupVal != 1) && (warnSupVal != 3)) {
		chgOpenUsrRespBox("warnMin",source,"",arrI);
		return;
		}
		// if newVal > .warnMax AND warning not suppressed
	if ((valNew > glbChgSetData[arrI].warnMax) && (tmpWarnSuppress <= 0)
				&& (warnSupVal != 2) && (warnSupVal != 3)) {
		chgOpenUsrRespBox("warnMax",source,"",arrI);
		return;
		}
		 // valNew is OK or warnings suppressed
	glbChgSetData[arrI].valCur = valNew;
	glbChgSetData[arrI].valNew = Number.NaN;
	if (glbChgSetData[arrI].isCrossRef) {
		chgCrsSetMax(arrI);
		chgCrsSetMin(arrI);
		}
	chgWriteVal(arrI);
	return;
	}


	// chgCrossRef() is called by chgVerifyVal() for global variables for which 
	//		glbChgSetData[].isCrossRef == true.
	//	The function tests whether the values of the two (or more) variables are compatible.
	//		If they are compatible (or if for some other reason this function declines
	//		to deal with the incompatibility), the function returns 'false'
	//	If the values for the cross-referenced variables are not compatible, the function:
	//	(1)	generates an error message
	//	(2)	sets glbChgReVerify = true;
	//	(3)	calls chgOpenUsrRespBox() to display the error message and response-options to the user
	//	(4)	returns 'true'
	//	This function was impossible to write and is even worse to read since many of the global 
	//		variables have two dependencies.  crs... are values for the first dependency while crs2...
	//		are values for the second dependency.
function chgCrossRef(source,arrI) {
	var txtId = glbChgSetData[arrI].txtId;
	var valNew = glbChgSetData[arrI].valNew;
	var valCur = glbChgSetData[arrI].valCur;
	var valPrev = glbChgSetData[arrI].valPrev;
	var valInit = glbChgSetData[arrI].valInit;
	var txtNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var txtErrId = "crossRef";
	var crsId;  // .txtId of first cross-referenced variable
	var crs2Id = "";  //.txtId of second cross-referenced variable
	var txtMsg = "";
			// 5/11/20 => need node for "use valNew, not recommended" button
			//	value of this button is used by chgCloseUsrRespBox() to determine
			//	whether to temporarily suppress chgVerifyVal() warning
	var btnNoRecNode = document.getElementById("chgValNewNoRecBtn");
	if (btnNoRecNode == null) {
		alert("chgCrossRef(): could not find \"use new value - not recomended\" button.  "
					+ "Can\'t check cross-references for \"" + txtNm 
					+ "\".\n\n  Please report this error.");
		return(false);
		}
	btnNoRecNode.value = 0;  // default is for valNew-noRec button to have value of 0
		// get cross-referenced txtId's
	switch(txtId) {
		case "cXYBuf" : crsId = "cXYOff"; break;
		case "cXYOff" : crsId = "cXYBuf"; break;
		case "cFBuf" : crsId = "cMaxF";
				crs2Id = "cFZBuf"; break;
		case "cMaxF" : crsId = "cFBuf";
				crs2Id = "cMxDstArr"; break;
		case "cMxDstArr" : crsId = "cMaxF";
				crs2Id = "cZBuf"; break;
		case "cFZBuf" : crsId = "cFBuf";
				crs2Id = "cZBuf"; break;
		case "cZBuf" : crsId = "cFZBuf";
				crs2Id = "cMxDstArr"; break;
		case "cMvBtnStp": crsId = "cMvBtnMult"; break
		case "cMvBtnMult": crsId = "cMvBtnStp"; break
		case "cInfoBoxTop": crsId = "cInfoBoxBottom"; break
		case "cInfoBoxBottom": crsId = "cInfoBoxTop"; break
		default : alert("chgCrossRef():  need to write code for \"" + txtId + "\".");
			return(false);
		}
		// get cross-referenced indices
	var crsArrI = chgArrIndex(crsId); // index of cross-referenced variable
	if (Number.isNaN(crsArrI)) {
		alert("chgCrossRef(): Could not find cross-reference ID (\"" + crsId +"\") in glbChgDataSet[]. "
				+ " Can\'t check \"" + txtId +"\" for cross-reference errors."
				+ "\n\n  Please report this error.");
		return(false);
		}
	var crsVal = glbChgSetData[crsArrI].valCur;  // .valCur of cross-referenced variable
	var crsNm = glbChgSetData[crsArrI].txtNm.toLowerCase();
	var crs2ArrI = Number.NaN;
	var crs2Val = Number.NaN;
	var crs2Nm = "";
	var valExtra;
	var valCalc;  // a 2nd "extra" variable for use in building strings
	if (crs2Id != "") { // there is a second cross-reference that needs to be checked
		crs2ArrI = chgArrIndex(crs2Id); // index of cross-referenced variable
		if (Number.isNaN(crs2ArrI)) {
			alert("chgCrossRef(): Could not find second cross-reference ID (\"" + crs2Id 
					+ "\") in glbChgDataSet[].  Can\'t check \"" + txtId 
					+ "\" for cross-reference errors.\n\n  Please report this error.");
			return(false);
			}
		crs2Val = glbChgSetData[crs2ArrI].valCur;  // .valCur of cross-referenced variable
		crs2Nm = glbChgSetData[crs2ArrI].txtNm.toLowerCase();
		}
		// check for cross-reference errors => this is variable specific.
	switch(txtId) {
		case "cXYBuf" :  // must be >= "cXYOff"; crsVal = "cXYOff".valCur
				if (valNew >= crsVal) { return(false); }
				if (valNew < 0) { return(false); } // should be handled as illegal value rather than crossRef
				txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,1,true);
				if (Number.isNaN(valInit) || (valInit >= crsVal)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev >= crsVal)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cXYOff" :  // must be <+ "cXYBuf"; crsVal = "cXYBuf.valCur
				if (valNew <= crsVal) { return(false); }
				txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,-1,true);
				if (Number.isNaN(valInit) || (valInit <= crsVal)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev <= crsVal)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cFBuf" :  // 2 variables: crsId: "cFBuf" < "cMaxF" AND crs2Id "cFBuf" >= "cFZBuf"
				if ((Number.isNaN(valNew)) || (valNew < 0)) { return(false); }  // handle this as an absolute error
				if ((Number.isNaN(crsVal) || (valNew < crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew >= crs2Val))) {
					 return(false);
					 }
				if ((valNew >= crsVal) && (valNew < crs2Val)) {
					txtMsg = chgCrsRef2Msg(source,txtNm,newVal,crsNm,crsVal,"less",crs2Nm,crs2Val,"equal to or greater",true);
					if (Number.isNaN(valInit) || ((valInit < crsVal) && (valInit >= crs2Val))) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || ((valPrev < crsVal) && (valPrev >= crs2Val))) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
					}
				else if (valNew >= crsVal) {
					txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,-2,true);
					if (Number.isNaN(valInit) || (valInit < crsVal)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev < crsVal)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
					}
				else if (valNew < crs2Val) {
					txtMsg = chgCrsRefMsg(source,txtNm,crs2Nm,valNew,crs2Val,1,true);
					if (Number.isNaN(valInit) || (valInit >= crs2Val)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev >= crs2Val)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
					}
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cMaxF" :  // 2 variables: must be > "cFBuf (crsId); since this is absolute, do this first
						// warning if <= cMsDstArr (crs2Id)
				if ((Number.isNaN(valNew)) || (valNew < 0)) { return(false); }  // handle this as an absolute error
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew <= crs2Val))) {
					return(false);
					}
				if (valNew < crsVal) {
					txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,1,true);
					if (Number.isNaN(valInit) || (valInit >= crsVal)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev >= crsVal)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
					}
				else if (valNew > crs2Val) {  //crs2Id = "cMxDstArr"
					txtMsg = "The new value (\"" + valNew +"\") that was entered for \"" + txtNm 
					txtMsg += "\" in the " + source + " is larger than the current value for \"";
					txtMsg += crs2Nm + "\" (\"" + crs2Val + "\").&nbsp; The viewer may encounter difficulties ";
					txtMsg += "if the number of focal planes loaded into the viewer exceeds the maximum ";
					txtMsg += "allowed size of the destruction array.&nbsp; It probably would be best if ";
					txtMsg += "you chose a smaller value for \"" + txtNm + "\" or a larger value for \"";
					txtMsg += crs2Nm + "\".";
							// test previous values against cFBuf, but not against cMxDxtArr
					if (Number.isNaN(valInit) || (valInit <= crs2Val)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev <= crs2Val)) { txtErrId += "P"; }
					btnNoRecNode.value = 10;  // suppress warnMax on chgVerifyVal reentry
					txtErrId += "R";  // valNew is allowed, but not recommended
					}
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cMxDstArr" : // 2 variables > cMaxF and cZBuf: crsId = "cMaxF"; crs2Id = "cZBuf"
				if ((Number.isNaN(valNew)) || (valNew < 0)) { return(false); }  // handle this as an absolute error
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) || (valNew >= crs2Val))) { // cMxDstArr >= both values
					return(false);
					}
				if ((!Number.isNaN(crsVal)) && (!Number.isNaN(crsVal)) 
							&& (valNew < crsVal) && (valNew < crs2Val)) {  // both cMaxF & cZBuf > cMxDstArr
					valExtra = Math.max(crsVal,crs2Val);
					txtMsg = chgCrsRef2Msg(source,txtNm,newVal,crsNm,crsVal,"equal to or greater",crs2Nm,crs2Val,"equal to or greater",false);
					}
				else if (Number.isNaN(crs2Val) || (valNew >= crs2Val)) {  // cMaxF must be > cMxDstArr
					valExtra = crsVal;
					txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,1,false);
					}
				else if (Number.isNaN(crsVal) || (valNew >= crsVal)) {  // cZBuf must be > cMxDstArr
					valExtra = crs2Val;
					txtMsg = chgCrsRefMsg(source,txtNm,crs2Nm,valNew,crs2Val,1,false);
					}
				else {
					txtMsg = "Error in cross-referencing values for \"" + txtNm;
					txtMsg += "\", which must be equal to or greater than the values for \"";
					txtMsg += crsNm + "\" and  \"" + crs2Nm + "\".&nbsp; Please report this error.";
					valExtra = 0;
					}
				if (Number.isNaN(valInit) || (valInit >= valExtra)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev >= valExtra)) { txtErrId += "P"; }
				btnNoRecNode.value = -10;  // suppress warnMin on chgVerifyVal reentry
				txtErrId += "R";  // valNew is allowed, but not recommended
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cFZBuf" :  // must be <= cFBuf AND <= cZBuf: crsId = "cFBuf"; crs2Id = "cZBuf"
				if ((Number.isNaN(valNew)) || (valNew < 0)) { return(false); }  // handle this as an absolute error
				if ((Number.isNaN(crsVal) || (valNew <= crsVal)) 
							&& (Number.isNaN(crs2Val) || (valNew <= crs2Val))) { // cFZBuf < both variables
					return(false);
					}
				if ((!Number.isNaN(crsVal)) && (!Number.isNaN(crsVal)) 
							&& (valNew > crsVal) && (valNew > crs2Val)) {  // both both cFBuf & cZBuf < cFZBuf
					valExtra = Math.min(crsVal,crs2Val);
					txtMsg = chgCrsRef2Msg(source,txtNm,valNew,crsNm,crsVal,"equal to or less",crs2Nm,crs2Val,"equal to or less",true);
					}
				else if (Number.isNaN(crs2Val) || (valNew <= crs2Val)) {  // cFBuf must be < cFZBuf
					valExtra = crsVal;
					txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,-1,true);
					}
				else if (Number.isNaN(crsVal) || (valNew >= crsVal)) {  // cZBuf must be < cFZBuf
					valExtra = crs2Val;
					txtMsg = chgCrsRefMsg(source,txtNm,crs2Nm,valNew,crs2Val,-1,true);
					}
				else {
					txtMsg = "Error in cross-referencing values for \"" + txtNm;
					txtMsg += "\", which must be equal to or greater than the values for \"";
					txtMsg += crsNm + "\" and  \"" + crs2Nm + "\".&nbsp; Please report this error.";
					valExtra = 0;
					}
				if (Number.isNaN(valInit) || (valInit <= valExtra)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev <= valExtra)) { txtErrId += "P"; }
						// absolute error .valNew is not allowed
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cZBuf" :  // 2 variables: crsId = "cFZBuf"; crs2Id = "cMxDstArr"
						// must be > "cFZBuf (crsId); since this is absolute, do this first
						// warning if <= cMsDstArr (crs2Id)  // 2 variables
				if ((Number.isNaN(valNew)) || (valNew < 0)) { return(false); }  // handle this as an absolute error
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew <= crs2Val))) {
					return(false);
					}
				if (valNew < crsVal) {
					txtMsg = chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,1,true);
					if (Number.isNaN(valInit) || (valInit >= crsVal)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev >= crsVal)) { txtErrId += "P"; }
						// this is an absError, valNew is not allowed
					}
				else if (valNew > crs2Val) {
					txtMsg = "The new value (\"" + valNew +"\") that was entered for \"" + txtNm 
					txtMsg += "\" in the " + source + " is larger than the current value for \"";
					txtMsg += crs2Nm + "\" (\"" + crs2Val + "\").&nbsp; The viewer may encounter difficulties ";
					txtMsg += "if the number of view-planes loaded into the viewer exceeds the maximum ";
					txtMsg += "allowed size of the destruction array.&nbsp; It probably would be best if ";
					txtMsg += "you chose a smaller value for \"" + txtNm + "\" or a larger value for \"";
					txtMsg += crs2Nm + "\".";
							// test previous values against cFBuf, but not against cMxDxtArr
					if (Number.isNaN(valInit) || (valInit <= crs2Val)) { txtErrId += "I"; }
					if (Number.isNaN(valPrev) || (valPrev <= crs2Val)) { txtErrId += "P"; }
					btnNoRecNode.value = 10;  // suppress warnMax on chgVerifyVal reentry
					txtErrId += "R";  // valNew is allowed, but not recommended
					}
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cMvBtnStp": // warn if MvBtnStp * MvBtnMult >= tileSz; crsId = "cMvBtnMult"
		case "cMvBtnMult": // warn if MvBtnStp * MvBtnMult >= tileSz; crsId = "cMvBtnStp"
				valExtra = Math.min(glbTileSzX,glbTileSzY);  // tile-size
				valCalc = Math.floor(valExtra/valNew);
				if (Number.isNaN(valNew) || Number.isNaN(crsVal)) { return(false); }
				if ((valNew < glbChgSetData[arrI].warnMin) || (valNew > glbChgSetData[arrI].warnMax)) {
					return (false);  // let warnMin/warnMax handle this
					}
				if ((valNew * crsVal) <= valExtra) { return(false); } // cross-ref is OK
				txtMsg = "It is best if \"" + txtNm + "\"&nbsp;&times;&nbsp;\"" + crsNm + "\" is less "
				txtMsg += "than the size of an image-tile (" + valExtra + ").&nbsp; ";
				txtMsg += "The value for \"" + crsNm + "\" is:&nbsp;" + crsVal;
				txtMsg += ", so the new value for \"" + txtNm + "\" (\"" + valNew;
				txtMsg += "\") that was entered in the " + source + " is too large: &nbsp;";
				txtMsg += valNew + "&nbsp;&times;&nbsp;" + crsVal + "&nbsp;=&nbsp;" + (valNew*crsVal);
				txtMsg += " (which is more than " + valExtra + ").&nbsp;  If \"";
				txtMsg += crsNm + "\" is&nbsp;" + crsVal + ", then \"" + txtNm;
				txtMsg += "\" should be &le;&nbsp;" + Math.floor(valExtra/crsVal);
				txtMsg += ".&nbsp; If you want the value of \"" + txtNm + "\" to be&nbsp;";
				txtMsg += valNew + ", then \"" + crsNm + "\" should be &le;&nbsp;" + valCalc;
				txtMsg += ".&nbsp;  In the meantime, please choose one of the following values for \"";
				txtMsg += txtNm + "\".";
							// test previous values to see if they are OK
				if (Number.isNaN(valInit) || (valInit <= valCalc)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev <= valCalc)) { txtErrId += "P"; }
				txtErrId += "R";  // valNew is allowed, but not recommended
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		case "cInfoBoxTop": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxBottom"
		case "cInfoBoxBottom": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxTop"
				valExtra = parseInt(window.innerHeight);  // wndHt
				valCalc = valExtra - 370 - crsVal;
				if (Number.isNaN(valNew) || Number.isNaN(crsVal)) { return(false); }
				if (valNew <= valCalc) { return(false); } // values are OK
				if ((valNew < glbChgSetData[arrI].absMin) || (valNew > glbChgSetData[arrI].absMax)) {
					return(false);  // let chgVerifyVal() deal with these out-of-range values.
					}
				txtMsg = "For the current window height (" + valExtra + "px) and the current value for \"";
				txtMsg += crsNm + "\" (\"" + crsVal +"\"), it is "
				if (valCalc < glbChgSetData[arrI].absMin) { // crsVal too large for window => no newVal will work
					txtMsg += "unlikely that any value for \"" + txtNm + "\, including the new value (\"";
					txtMsg += valNew + "\") that was entered in the " + source + ", would be satisfactory.&nbsp; ";
					if ((valExtra - 370 - valNew) > glbChgSetData[crsArrI].absMin) { // valNew could work with smaller crsVal
						txtMsg += "If you want to use " + valNew + " as the value for \"" + txtNm;
						txtMsg += "\", then you will need to set \"" + crsNm + "\" to a value less than:&nbsp;";
						txtMst += (valExtra - 370 - valNew) + ".&nbsp; ";
						}
					 else {
						txtMsg += "You will need to choose smaller values for <i>both</i> \"" + txtNm;
						txtMsg += "\" <i>and</i> \"" + crsNm + "\".&nbsp; ";
						}
					}
				else {  // can choose value txtId that would work with crsVal
					txtMsg += "the value for \"" + txtNm + "\" should be equal to or less than:&nbsp;";
					txtMsg += valCalc + ".&nbsp; The new value (\"" + valNew + "\") for \"" + txtNm;
					txtMsg += "\" that was entered in the " + source + " is too large.&nbsp; ";
					txtMsg += "If you want to use this value (\"" + valNew + "\") for \"" + txtNm;
					txtMsg += ", then you will need to decrease the value of \"" + crsNm + "\".&nbsp; ";
					}
				txtMsg += "In the meantime, please chose one of the following values for \"" + txtNm + "\".";			
							// test previous values absMax
				valCalc = glbChgSetData[arrI].absMax;
				if (Number.isNaN(valInit) || (valInit <= valCalc)) { txtErrId += "I"; }
				if (Number.isNaN(valPrev) || (valPrev <= valCalc)) { txtErrId += "P"; }
				txtErrId += "R";  // valNew is allowed, but not recommended
				glbChgReVerify = true;
				chgOpenUsrRespBox(txtErrId,source,txtMsg,arrI);
				return(true);
				break;
		default : alert("chgCrossRef():  need to write code for \"" + txtId + "\".");
			return(false);
		}
	return(false);
	}

	// chgCrsRefMsg() generates a 'default' cross-reference error message for a variable that
	//	has only one cross-reference.
	//	- source is the string identifying the box or URL (command-line) where the global 
	//		variable was changed.
	//	- txtNm is glbChgSetData[].txtNm for the current variable
	//	- crsNm is glbChgSetData[].txtNm for the cross-referenced variable
	//	- valNew is the new value (glbChgSetData[].valNew) of the current variable
	//	- crsVal is glbChgSetData[].valCur for the cross-referenced variable
	//	- dir is an integer indicating the direction of the inequality
	//	- isAbs is a boolean indicating whether the error is generating a warning
	//		or is an 'absolute' error.
	//	The function returns the error string.
function chgCrsRefMsg(source,txtNm,crsNm,valNew,crsVal,dir,isAbs) {
	var txtAW = "should";
	if (isAbs) { txtAW = "must"; }
	var txtIneq;
	var crsSize;
	var crsChg;
	if (dir > 0) {
		if (dir >= 2) { txtIneq = "greater"; }
		else { txtIneq = "equal to or greater"; }
		crsSize = "small";
		crsChg = "decrease";
		}
	if (dir < 0) {
		if (dir <= -2) { txtIneq = "less"; }
		else { txtIneq = "equal to or less"; }
		crsSize = "large";
		crsChg = "increase";
		}
	var txtMsg = "The value for \"" + txtNm + "\" "+ txtAW +" be " + txtIneq + " than the value of \"";
	txtMsg += crsNm + "\", which currently is set to:&nbsp;" + crsVal + ".&nbsp; ";
	txtMsg += "The new value that was entered in the " + source + " for \"" + txtNm + "\" (\"" + valNew;
	txtMsg += "\") is <b><i>too " + crsSize + "</i></b>.&nbsp; You " + txtAW + " " + crsChg + " the value of \"";
	txtMsg += crsNm + "\" if you want to use " + valNew + " as the value for \"" + txtNm;
	txtMsg += "\".&nbsp; In the meantime, you " + txtAW + " use a different value for \"" + txtNm + "\".";
	return(txtMsg)
	}

	// chgCrsRef2Msg() generates a 'default' cross-reference error message for a global variable with 
	//	two dependencies.
	//	- source is the string identifying the box or URL (command-line) where the global 
	//		variable was changed.
	//	- txtNm is glbChgSetData[].txtNm for the current variable
	//	- valNew is the new value (glbChgSetData[].valNew) of the current variable
	//	- crsNm is glbChgSetData[].txtNm for the first cross-referenced variable
	//	- crsVal is glbChgSetData[].valCur for the first cross-referenced variable
	//	- crsIneq is a string indicating the inequality for the first cross-reference, i.e.,
	//		"equal to or greater", 'greater", "equal to or less", or "less".
	//	- crs2Nm is glbChgSetData[].txtNm for the second cross-referenced variable
	//	- crs2Val is glbChgSetData[].valCur for the second cross-referenced variable
	//	- crs2Ineq is a string indicating the inequality for the second cross-reference
	//	- isAbs is a boolean indicating whether the error is generating a warning
	//		or is an 'absolute' error.
	//	The function returns the error string.
function chgCrsRef2Msg(source,txtNm,valNew,crsNm,crsVal,crsIneq,crs2Nm,crs2Val,crs2Ineq,isAbs) {
	var txtAW = "should";
	if (isAbs) { txtAW = "must"; }
	var txtMsg = "The value for \"" + txtNm + "\" " + txtAW + " be " + crsIneq + " than the value for \"";
	txtMsg += crsNm + "\" (\"" + crsVal + "\") AND " + crs2Ineq + " than the value for \"" + crs2Nm;
	txtMsg += "\" (\"" + crs2Val + "\").&nbsp; The new value that was entered in the " + source;
	txtMsg += " for \"" + txtNm + "\" (\"" + valNew + "\") does not meet these criteria.&nbsp; ";
	txtMsg += "You " + txtAW + " change the values for <i>both</i> \"" + crsNm + "\" and \"";
	txtMsg += crs2Nm + "\" if you want to use " + valNew + " as the value for \"" + txtNm + "\".&nbsp; ";
	txtMsg += "In the meantime, you " + txtAW + " use a different value for \"" + txtNm + "\".";
	return(txtMsg);
	}


	// chgCrsSetMax() is called chgVerifyVal() if the valNew is OK or by chgCloseUsrRespBox() if valNew is reset
	//	The function updates glbChgSetData[].absMax for cross-referenced variables.
	//	Note that there is a 'sister' function chgCrsSetMin() to update glbChgSetData[].absMin 
function chgCrsSetMax(arrI) {
	var txtId = glbChgSetData[arrI].txtId;
	var crsId;  // .txtId of cross-referenced variable
	var crs2Id = "";
	var valCur = glbChgSetData[arrI].valCur;
	if (Number.isNaN(valCur)) { return; }  // can't set absMin if NaN
	var valExtra; 
		// get cross-referenced txtId's
	switch(txtId) {
		case "cXYOff" :  // set absMin: crsId = "cXYBuf", but no abs/warnMax changes 
		case "cMvBtnStp":  // no changes .warnMin/Max,.absMin/Max
		case "cMvBtnMult":  // no changes .warnMin/Max,.absMin/Max
		case "cInfoBoxTop": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxBottom"
		case "cInfoBoxBottom": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxTop"
				return;
		case "cXYBuf" : crsId = "cXYOff"; break;
		case "cFBuf" : crsId = "cFZBuf";  // set absMin for cMaxF
				crs2Id = "cZBuf";  // need cZBuf.curVal to calculate cFZBuf.max
				break;  
		case "cMaxF" : crsId = "cFBuf"; // warnMin for crs2Id = "cMxDstArr";
				break;
		case "cMxDstArr" : crsId = "cMaxF";  // cMaxF & cZBuf are warnMax
				crs2Id = "cZBuf";  // 
				break;  
		case "cFZBuf" : return; // absMin for crsId = "cFBuf" & crs2Id = "cZBuf"; 
				break;
		case "cZBuf" : crsId = "cFZBuf"; 
				crs2Id = "cFBuf";  // need cFBuf.curVal to calculate cFZBuf.max
				break;
		default : alert("chgCrsSetMax():  need to write code for \"" + txtId + "\".");
			return;
		}
		// get cross-referenced indices
	var crsArrI = chgArrIndex(crsId); // index of cross-referenced variable
	if (Number.isNaN(crsArrI)) {
		alert("chgCrsSetMax(): Could not find cross-reference ID (\"" + crsId +"\") in glbChgDataSet[]. "
				+ " Can\'t set cross-reference maximum for \"" + txtId 
				+ "\".\n\n  Please report this error.");
		return;
		}
	var crs2ArrI;
	if (crs2Id != "") {
		crs2ArrI = chgArrIndex(crs2Id); // index of second cross-referenced variable
		if (Number.isNaN(crs2ArrI)) {
			alert("chgCrsSetMax(): Could not find cross-reference ID (\"" + crs2Id 
				+ "\") in glbChgDataSet[].  Can\'t set cross-refence maximum for \"" + txtId 
				+ "\".\n\n  Please report this error.");
			return;
			}
		}
		// set [crsId].absMax & [crsId].warnMax
	switch(txtId) {
		case "cXYBuf" :  //crsId = "cXYOff"
				glbChgSetData[crsArrI].absMax = valCur;
				glbChgSetData[crsArrI].warnMax = valCur * 0.8;
				return;
		case "cFBuf" : // crsId = "cFZBuf"; crs2Id = cZBuf; want minimum of cFBuf & cZBuf
		case "cZBuf" : // crsId = "cFZBuf"; crs2Id = dFBuf; want minimum of cFBuf & cZBuf
				valExtra = glbChgSetData[crs2ArrI].valCur;
				if (Number.isNaN(valExtra)) { glbChgSetData[crsArrI].absMax = valCur; }
				else { glbChgSetData[crsArrI].absMax = Math.min(valCur,valExtra); }
				return;
		case "cMaxF" :  // warn if cFBuf > cMaxF
				glbChgSetData[crsArrI].warnMax = valCur;
				return;
		case "cMxDstArr" : 
				glbChgSetData[crsArrI].warnMax = valCur;
				glbChgSetData[crs2ArrI].warnMax = valCur;
				return;
		default : alert("chgCrsSetMax():  need to write code for \"" + txtId + "\".");
			return;
		}
	return;
	}


	// chgCrsSetMin() is called chgVerifyVal() if the valNew is OK or by chgCloseUsrRespBox() if valNew is reset
	//	The function updates glbChgSetData[].absMin for cross-referenced variables.
	//	Note that there is a 'sister' function chgCrsSetMax() to update glbChgSetData[].absMax 
function chgCrsSetMin(arrI) {
	var txtId = glbChgSetData[arrI].txtId;
	var crsId;  // .txtId of cross-referenced variable
	var crs2Id = "";
	var valCur = glbChgSetData[arrI].valCur;
	if (Number.isNaN(valCur)) { return; }  // can't set absMin if NaN
	var valExtra; 
		// get cross-referenced txtId's
	switch(txtId) {
		case "cXYBuf" :  // set absMax crsId = "cXYOff", but no minimum cross-ref;
		case "cMxDstArr" :  // set warnMax for crsId = "cMaxF", cZBuf; but no minimum
		case "cMvBtnStp":  // no changes .warnMin/Max,.absMin/Max
		case "cMvBtnMult":  // no changes .warnMin/Max,.absMin/Max
		case "cInfoBoxTop": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxBottom"
		case "cInfoBoxBottom": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxTop"
				return;
				break;
		case "cXYOff" : crsId = "cXYBuf"; 
				break;
		case "cFBuf" : crsId = "cMaxF";  // set absMax for cFZBuf
				break;  
		case "cMaxF" : crsId = "cMxDstArr"; //this is a warnMin
				crs2Id = "cZBuf";  // need to calculate warnMin on cMxDstArr
				break;
		case "cFZBuf" : crsId = "cFBuf";
				crs2Id = "cZBuf"; 
				break;
		case "cZBuf" : crsId = "cMxDstArr";   // this is a warnMin
				crs2Id = "cFBuf";  // need to calculate cMxDstArr.warnMax
				break;
		default : alert("chgCrsSetMin():  need to write code for \"" + txtId + "\".");
			return;
		}
		// get cross-referenced indices
	var crsArrI = chgArrIndex(crsId); // index of cross-referenced variable
	if (Number.isNaN(crsArrI)) {
		alert("chgCrsSetMin(): Could not find cross-reference ID (\"" + crsId +"\") in glbChgDataSet[]. "
				+ " Can\'t set cross-refence minimum for \"" + txtId +"\".\n\n  Please report this error.");
		return;
		}
	var crs2ArrI;
	if (crs2Id != "") {
		crs2ArrI = chgArrIndex(crs2Id); // index of second cross-referenced variable
		if (Number.isNaN(crs2ArrI)) {
			alert("chgCrsSetMin(): Could not find cross-reference ID (\"" + crs2Id 
				+ "\") in glbChgDataSet[].  Can\'t set cross-reference minimum for \"" + txtId 
				+ "\".\n\n  Please report this error.");
			return;
			}
		}
		// set [crsId].absMax & [crsId].warnMax
	switch(txtId) {
		case "cXYOff" :  // minimum value for "cXYBuf"
		case "cFBuf" :  // minimum value for "cMaxF"
				glbChgSetData[crsArrI].absMin = valCur;
				return;
		case "cMaxF" : // warnMin for crsId = "cMxDstArr"; valExtra,crs2Id = "cZBuf"
		case "cZBuf" : // warnMin for crsId = "cMxDstArr"; valExtra,crs2Id = "cMaxF"
				valExtra = glbChgSetData[crs2ArrI].valCur;
				if (Number.isNaN(valExtra)) { glbChgSetData[crsArrI].warnMin = valCur; }
				else { glbChgSetData[crsArrI].warnMin = Math.max(valCur,valExtra); }
				return;
		case "cFZBuf" : // set .absMin for crsId = "cFBuf"; crs2Id = "cZBuf";
				glbChgSetData[crsArrI].absMin = valCur;
				glbChgSetData[crs2ArrI].absMin = valCur;
				return;
		default : alert("chgCrsSetMin():  need to write code for \"" + txtId + "\".");
			return;
		}
	return;
	}

	
	// 4/26/28:  chgOpenUsrRespBox() formats <div id= "chgUsrRespBx"> and then displays this box.
	//	chgVerifyVal() only calls this box if there is more than one option for the value that 
	//	could be chosen for glbChgSetData[].valCur.  If .valCur == .valPrev == .valInit AND
	//	.valNew is illegal ("absMin" || "absMax"). Then an error box, rather than chgUsrRespBx is
	//	used.
function chgOpenUsrRespBox(txtErrorId,txtSrc,txtExplan,arrI) {
	var boxLeft = Math.round((window.innerWidth - 390)/2);
	if (boxLeft < 0) { boxLeft = 0; }
	var boxNode;  // node to hold chgUsrRespBx (main box)
	var noVal = "\"<font style='font-size: 10px'>not set</font>\"";
	var valNew = Number(glbChgSetData[arrI].valNew);
	var valCur = glbChgSetData[arrI].valCur;
	var valPrev = glbChgSetData[arrI].valPrev;
	var valInit = glbChgSetData[arrI].valInit;
	var setNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var txtErrId = txtErrorId;  // error Id ... this can be changed for isNotNum
	var valLimit;  // the test-value that has been exceeded
	var valAbs;  // for warnings, the absolute max/min value
	var txtInequal = "";  // text string: "greater" or "less"
	var txtLimit = "";  // forw warnings text "as small as" or "as large as"
	var isAbsErr = false;  // set to true if .newVal exceeds the absolute limits
	var isWarnErr = false; // set to true if .newVal is generating a warning
	var isNotInt = false;
	var isNotNum = false;
	var isIllegal = false;  // suppress valNew choice
	var isCrossRef = false;
	var useValNewOK = false;
	var useValNewNoRec = false;
	var useValInit = true;
	var useValPrev = true;
			// determine type of error
			// 5/07/20:  for "crossRef", txtErrId encodes what variables to display
			//	in this case, the first 8 characters of txtErrorId == "crossRef", and the rest of the string may contain
			//		"IPNR" indicating the values for isIllegal, useValNewOK, useValNewNoRec, useValInit, and useValPrev.
	switch (txtErrId.slice(0,8)) {  // at this point, txtErrId (a local variable) == txtErrorId (argument passed to function)
		case "absMin" : 
		case "absMax" : isAbsErr = true;
						isIllegal = true;
						break;
		case "warnMin" :
		case "warnMax" : isWarnErr = true;
						break;
		case "crossRef": isCrossRef = true;
						break;
		case "notInt":  isNotInt = true;
						break;
		case "notNum":  isNotNum = true;
						break;
			// no default action
		}
	var txtErrMsg = txtExplan;  // text string that will hold the error message.
			// if error message not passed as an argument, build it here
	if (txtErrMsg == "") {  // use default error message.
				// if isNotNum, try to extract a number before dealing with error message
				//	4/29/20 - added isNotNum code here
				//		NOTE:  isNotInt (for .isInt == true) and extracting integers is 
				//		handled separately below; this includes separate error messages.
				//		In the future consider trying to move isNotInt before switch(txtErrId)
				//		to combine error message generation in manner similar to isNotNu
		if (isNotNum) {
			valNew = glbChgSetData[arrI].valNew.toString();
			if (valNew.replace(/ /g,"") == "") { valNew = Number.NaN; }
			else { valNew = parseFloat(valNew); }
			if (Number.isNaN(valNew)) {
				txtErrMsg = "The value \"" + setNm + "\" must be a number, but the value that was "
				txtErrMsg += "entered in the " + txtSrc + " for this variable (\"";
				txtErrMsg += glbChgSetData[arrI].valNew + "\") is not a number.";
				isIllegal = true;
				}
			else {  // could parse a float from entry - check for valid values
				txtErrMsg = "The value \"" + setNm + " that was entered in the " + txtSrc;
				txtErrMsg += " (\"" + glbChgSetData[arrI].valNew + "\") is not a number, but a ";
				txtErrMsg += "number could be extracted from this entry:&nbsp;" + valNew + ".&nbsp; "; 
				if (valNew < glbChgSetData[arrI].absMin) {
					txtErrId = "absMin";
					isAbsErr = true;  // needed to get into if(isAbsErr)
					}
				else if (valNew > glbChgSetData[arrI].absMax) {
					txtErrId = "absMax";
					isAbsErr = true;  // needed to get into if(isAbsErr)
					}
				else if (valNew < glbChgSetData[arrI].warnMin) {
					txtErrId = "warnMin";
					isWarnErr = true;  // needed to get into if(isWarnErr)
					useValNewNoRec = true;  // valNew button with "not recommended" without suppression
					}
				else if (valNew > glbChgSetData[arrI].warnMax) {
					txtErrId = "warnMax";
					isWarnErr = true;  // needed to get into if(isWarnErr)
					useValNewNoRec = true;  // valNew button with "not recommended" without suppression
					}
				else { useValNewOK = true; }
				glbChgSetData[arrI].valNew = valNew;
				}
			}
		switch (txtErrId) {
			case "absMin" : 
				valLimit = glbChgSetData[arrI].absMin;
				txtInequal = "less";
				break;
			case "absMax" :
				valLimit = glbChgSetData[arrI].absMax;
				txtInequal = "greater";
				break;
			case "warnMin" : 
				valLimit = glbChgSetData[arrI].warnMin;
				valAbs = glbChgSetData[arrI].absMin;
				txtInequal = "less";
				txtLimit = "small";
				break;
			case "warnMax" :
				valLimit = glbChgSetData[arrI].warnMax;
				valAbs = glbChgSetData[arrI].absMax;
				txtInequal = "greater";
				txtLimit = "large";
				break;
			// no test for crossRef ==> always has txtErrMsg != ""
			// no test for notInt ==> see below
			// no default
			}
		if (isAbsErr) {
			txtErrMsg += "The value for \"" + setNm + "\" cannot be " + txtInequal + " than " + valLimit + ".&nbsp; ";
			if (isNotNum) { txtErrMsg += "However, the new value (\"" + valNew;
				}
			else {
				txtErrMsg += "The new value that was entered in the " + txtSrc + " for this variable (\"" + valNew;
				}
			txtErrMsg += "\") is illegal since it is " + txtInequal + " than " + valLimit + ".";
			isIllegal = true;
			}
		else if (isWarnErr) {
			if (Number.isFinite(valAbs)) {
				txtErrMsg += "Although the value for \"" + setNm + "\" can be as " + txtLimit;
				txtErrMsg += " as " + valAbs + ", values";
				}
			else {
				txtErrMsg = "Values for \"" + setNm;
				}
			txtErrMsg += " that are " + txtInequal + " than " + valLimit;
			txtErrMsg += " probably will result in the Virtual Microscope performing poorly.&nbsp; The new value (\"";
			if (isNotNum) { txtErrMsg += valNew + "\") for this variable is ";
				}
			else {
				txtErrMsg += valNew + "\") for this variable that was entered in the " + txtSrc + " is ";
				}
			txtErrMsg += txtInequal + " than " + valLimit;
			txtErrMsg += ", and it is recommended that you chose a different value that is not so " + txtLimit + "."
			if (isNotNum) { useValNewNoRec = true; }  // no suppress warning if valNew was derived
			}
		else if(isNotInt) {  // not an integer: valLimit, valAbs, txtLimit, txtInequal have not been set yet
			txtErrMsg = "The value \"" + setNm + "\" must be an integer";
			valNew = glbChgSetData[arrI].valNew;
			if (valNew.replace(/ /g,"") == "") { valNew = Number.NaN; }
			else { valNew = parseInt(valNew); }
			if (Number.isNaN(valNew)) { 
				txtErrMsg += ", but the value that was entered in the " + txtSrc + " for this variable (\"";
				txtErrMsg += glbChgSetData[arrI].valNew + "\") cannot be converted into an integer.";
				isIllegal = true;
				}
						// truncated integer, illegal value
			else { // could get a truncated integer
				txtErrMsg += ".&nbsp; Although not an integer, the value that was entered in the " + txtSrc;
				txtErrMsg += " for this variable (\"" + glbChgSetData[arrI].valNew + "\") could be truncated to ";
				txtErrMsg += "form an integer.&nbsp; The new (truncated) value is:&nbsp;" + valNew + "."; 
							// truncated integer is illegal
				if ((valNew < glbChgSetData[arrI].absMin) || (valNew > glbChgSetData[arrI].absMax)) {
					isIllegal = true;
					if (valNew < glbChgSetData[arrI].absMin) {
						valLimit = glbChgSetData[arrI].absMin;
						txtInequal = "less";
						txtLimit = "minimum";
						}
					else {
						valLimit = glbChgSetData[arrI].absMax;
						txtInequal = "greater";
						txtLimit = "maximum";
						}
					txtErrMsg += "&nbsp; Unfortunately, this truncated new value is " + txtInequal;
					txtErrMsg += " than the " + txtLimit + " permissible value, " + valLimit + ", and cannot be used.";
					isIllegal = true;
					}  // end if truncated illegal
						// truncated integer generates a warning
				else if ((valNew < glbChgSetData[arrI].warnMin) || (valNew > glbChgSetData[arrI].warnMax)) {
					isWarnErr = true;
					if (valNew < glbChgSetData[arrI].warnMin){
						valLimit = glbChgSetData[arrI].warnMin;
						txtInequal = "less";
						txtLimit = "small";
						}
					else {  // truncated value generates warnMax
						valLimit = glbChgSetData[arrI].warnMax;
						txtInequal = "greater";
						txtLimit = "large";
						}
					txtErrMsg += "&nbsp; However, values for \"" + setNm + "\" that are " + txtInequal;
					txtErrMsg += " than " + valLimit + " probably will result in the Virtual Microscope ";
					txtErrMsg += "performing poorly.&nbsp; The truncated new value for this variable (";
					txtErrMsg += valNew + ") is " + txtInequal + " than " + valLimit + ", and it ";
					txtErrMsg += "is recommended that you chose a different value that is not so " + txtLimit + ".";
					useValNewNoRec = true;
					}  // end truncated integer generates warning
				else { useValNewOK = true; }  // use newVal button without warning or suppression
				glbChgSetData[arrI].valNew = valNew;   // set glbChgSetData[].valNew to truncated integer
				}  // end got truncated integer
			}  // end isNotInt
		}  // end of "if no error-message" => build error message
			// deal with crossRef cases  
			//  The last part of the txtErrId string is extracted as crossRefStr and specifies the choices that
			//	 chgUsrRespBx displays;  if crossRefStr :
			//		contains "N" => valNew (without a warning) is an option => useValNewOK = true
			//		contains "R" => valNew (with "Not recommended") warning is an option => useValNewNoRec = true
			//		does NOT contain "N" or "R", newVal is not an option => isIllegal = true
			//		does NOT contain "I" then valInit is not an option => useValInit = false
			//		does NOT contain "P" then valPreve is not an option => useValPrev = false
	var crossRefStr;
	if (isCrossRef) {
				// crossRef errors ALWAYS supplyt their own error message
				//		check to make sure that there is an error message
		if (txtErrMsg == "") {
			alert("chgOpenUsrRespBox(): a \"Cross-Reference\" error was supplies without an error message"
						+ "\n\n Please report this error.");
			}
		crossRefStr = txtErrId.slice(8);
		if (crossRefStr.search("N") >= 0) { useValNewOK = true; }
		else if (crossRefStr.search("R") >= 0) { useValNewNoRec = true; }
		else { isIllegal = true;}
		if (crossRefStr.search("P") >= 0) { useValPrev = true; }
		else { useValPrev = false; }
		if (crossRefStr.search("I") >= 0) { useValInit = true; }
		else { useValInit = false; }
		}  // end of setting-up crossRef box 

	boxNode = document.getElementById("chgUsrRespBx");
				// check for valid glbChgSetDataI
	if (!Number.isNaN(glbChgSetDataI) || (boxNode == null)) {  // can't use the chgUsrRespBx
		txtErrMsg = "chgOpenUsrRespBox():\n\n" + txtErrMsg.replace(/&nbsp;/g, " ");
		if (!Number.isNaN(glbChgSetDataI)) {
			txtErrMsg += "\n\nThe \"Change Settings\" User-Response Box already is open ";
			txtErrMsg += "(i.e., glbChgSetDataI == NaN). Two User-Response Boxes cannot be open at the same time.";
			}
		if (boxNode == null) {
			txtErrMsg += "\n\nCan\'t open the \"Change Settings\" User-Response Box (i.e. node == null).";
			}
		txtErrMsg += "\n\n  Please report this error.";
		alert(txtErrMsg);
		chgWriteVal(arrI);
		glbChgSetData[arrI].valNew = Number.NaN;
		return;
		}
			// set-up & open "chgUsrRespBx"
	document.getElementById("warnBell").play();
	boxNode.style.left = boxLeft + "px";  // set chgUsrRespBx position
	glbChgSetDataI = arrI;  // glbChgSetDataI will be used when chgUserRespBx closes
			// set title
	if (isCrossRef) { document.getElementById("chgUsrRespTitle").innerHTML = "Cross-referencing Settings"; }
	else if (isIllegal) { document.getElementById("chgUsrRespTitle").innerHTML = "Illegal Value for Setting"; }
	else if (isWarnErr) { document.getElementById("chgUsrRespTitle").innerHTML = "Dangerous Value for Setting"; }
	else if (isNotInt) { document.getElementById("chgUsrRespTitle").innerHTML = "Need Integer for Setting"; } 
	else if (isNotNum) { document.getElementById("chgUsrRespTitle").innerHTML = "Need Number for Setting"; } 
	else { document.getElementById("chgUsrRespTitle").innerHTML = "Bad Value for Setting"; }
			// finish last line of txtErrMsg & copy to chgUsrRespBx
	if (!(isNotInt || isNotNum) || isIllegal || isWarnErr) {
		txtErrMsg += "&nbsp; See the User's Manual for more information.";
		}
	txtErrMsg += "<br><br>Please select an appropriate value for the \"" + setNm + "\".";
	document.getElementById("chgUsrRespExpl").innerHTML = txtErrMsg;
			// set-up value choice options
			// value-choice options could have been turned-off by a previous call to chgOpenUsrRespBox()
				// valCur => always an option
	document.getElementById("chgUsrRespCur").style.display = "block";
	document.getElementById("chgUsrRespCur").style.borderBottom = "1px solid black";
	if (Number.isNaN(valCur)) { document.getElementById("chgUsrRespValCur").innerHTML = noVal; }
	else { document.getElementById("chgUsrRespValCur").innerHTML = valCur; }
				// valPrev is listed below valCur => can be turned-off in crossRef
	if (useValPrev) { // display valPrev as an option
		document.getElementById("chgUsrRespPrev").style.display = "block";
		document.getElementById("chgUsrRespPrev").style.borderBottom = "1px solid black";
		}
	else {document.getElementById("chgUsrRespPrev").style.display = "none"; }
	if (Number.isNaN(valPrev)) { document.getElementById("chgUsrRespValPrev").innerHTML = noVal; }
	else { document.getElementById("chgUsrRespValPrev").innerHTML = valPrev; }
				// valInit is listed below valCur & valPrev => can be turned-off in crossRef
	if (useValInit) { // display valInit as an option 	
		document.getElementById("chgUsrRespInit").style.display = "block";
		document.getElementById("chgUsrRespInit").style.borderBottom = "1px solid black";}
	else { document.getElementById("chgUsrRespInit").style.display = "none"; }
	if (Number.isNaN(valInit)) { document.getElementById("chgUsrRespValInit").innerHTML = noVal; }
	else { document.getElementById("chgUsrRespValInit").innerHTML = valInit; }
				// valNew options => turn-off valNew by default
		//	the default for the "newVal" choice boxes is .style.display = "none"
		//	valNew without warning suppression is shown for some crossRef or for isNotInt errors
	document.getElementById("chgUsrRespNewSuppress").style.display = "none";
	document.getElementById("chgUsrRespNewNoRec").style.display = "none";
	document.getElementById("chgUsrRespNew").style.display = "none";
	if (Number.isNaN(valNew)) {
		document.getElementById("chgUsrRespValNewSuppress").innerHTML = noVal;
		document.getElementById("chgUsrRespValNewNoRec").innerHTML = noVal;
		document.getElementById("chgUsrRespValNew").innerHTML = noVal;
		}
	else {
		document.getElementById("chgUsrRespValNewSuppress").innerHTML = valNew;
		document.getElementById("chgUsrRespValNewNoRec").innerHTML = valNew;
		document.getElementById("chgUsrRespValNew").innerHTML = valNew;
		}
		// the "Use new value & suppress warning button is assigned values that
		//		are used by chgCloseUsrRespBox().
	var supBtnNode = document.getElementById("chgUsrSupWarnBtn");
			// turn on appropriate valNew options
	if (isIllegal){  // don't show any "newVal" box, as a result, chgUsrRespInit is the bottom box
		if (useValInit) { document.getElementById("chgUsrRespInit").style.borderBottom = "0px"; }
		else if (useValPrev) { document.getElementById("chgUsrRespPrev").style.borderBottom = "0px"; }
		else { document.getElementById("chgUsrRespCur").style.borderBottom = "0px"; }
		}
	else if (useValNewOK) { document.getElementById("chgUsrRespNew").style.display = "block"; }
	else if (useValNewNoRec) { document.getElementById("chgUsrRespNewNoRec").style.display = "block"; }
	else {
		document.getElementById("chgUsrRespNewSuppress").style.display = "block";
				// use value of supBtnNode to set 
		if (txtErrId == "warnMin") { supBtnNode.value = -1; }
		else if (txtErrId == "warnMax") { supBtnNode.value = 1; }
		else { supBtnNode.value = 0; }
		}
			// display "Change Settings" User-Response Box
	boxNode.style.display = "block";
	document.getElementById("infoOverlay").style.display = "block";
	return;
	}

	// chgCloseUsrRespBox() is called by clicking a button in chgUsrRespBx ("Change Settings" User Response Box)
	//	it is passed a value for glbChgSetData[glbChgSetDataI].valNew and a value indicating whether to change
	//	.warnSuppress (and if so, how this value should be changed.
	//	 -	warnSupChg == 0	 => did not click on "suppress warning button'.
	//	 -	warnSupChg == -1 => clicked on "suppress warning button" for "warnMin" value
	//	 -	warnSupChg == 1  => clicked on "suppress warning button" for "warnMax" value
	//	 -  warnSupChg == -10 => during cross-reference (chgCrossRef(), user clicked on the use valNew-not recommended
	//			button for a number that is less than the current .warnMin for the variable (so that chgVerifyVal() 
	//			would generate a second .warnMin message when the cross-referenced value is re-verified).  This 	
	//			should be a situation that will cause chgSetWarnMin() to reset .warnMin for that variable
	//	 -  warnSupChg == 10 => during cross-reference (chgCrossRef(), user clicked on the use valNew-not recommended
	//			button for a number that is greater than the current .warnMax for the variable (so that chgVerifyVal() 
	//			would generate a second .warnMax message when the cross-referenced value is re-verified).  This 	
	//			should be a situation that will cause chgSetWarnMax() to reset .warnMin for that variable
function chgCloseUsrRespBox(valNew,btnVal) {
	var warnSupChg = btnVal;
	var btnNoRecNode;  // node for use newVal-not recommended button
	var tmpSupWarn = 0;  // passed to chgVerifyVal() to suppress warnings 2nd pass
		// close User-Response box and release overlay-block on user actions
	document.getElementById("infoOverlay").style.display = "none";
	document.getElementById("chgUsrRespBx").style.display = "none";
			// check for "not recommended" value from cross-reference
	if (Math.abs(warnSupChg) >= 10 ) {  // cross-reference && "use valNew-notRec" clicked
			// reset button value;
		btnNoRecNode = document.getElementById("chgValNewNoRecBtn");
		if (btnNoRecNode == null) {
			alert("chgCloseUserRspBox(): could not find \"use new value - not recomended\" button.  "
					+ "Can\'t reset the value of this button..\n\n  Please report this error.");
			}
		else { btnNoRecNode.value = 0; }
		if ( warnSupChg < 0 ) { tmpSupWarn = -1; }
		else if ( warnSupChg > 0 ) { tmpSupWarn = 1; }
		warnSupChg = 0;  // if valNew-noRec button clicked, valNew-supWarn button could not have been clicked
		}
	var arrI = glbChgSetDataI;  // need to reset glbChgSetDataI before exit
	glbChgSetDataI = Number.NaN;
		// check for valid glbChgSetDataI
	if (Number.isNaN(arrI)) {
		alert("chgCloseUsrRespBox():  \"Change Settings\" User-Response Box appears to be closed. "
				+ "(\"glbChgSetDataI == NaN).  Can't change settings.\n\n  Please report this error.");
		return;
		}
	else if ((arrI < 0) || (arrI >= glbChgSetData.length)) {
		alert("chgCloseUsrRespBox():  Illegal value (" + arrI + ") for glbChgSetDataI "
				+ "(-1 < glbChgSetDataI < " + glbChgSetData.length + ").  Can't change settings."
				+ "\n\n  Please report this error.");
		return;
		}
		// set glbChgSetData[].warnSuppress
	var oldWarnSupVal;
	if (warnSupChg != 0) {
		oldWarnSupVal = glbChgSetData[arrI].warnSuppress;
			// oldWarnSupVal == 0 => no prior suppression; set to 1 (for warnMin) or 2 (for warnMax)
			// oldWarnSubVal == 1 => already suppressing warnMin; set to 3 if warnSubChg is warnMax
			//						do nothing if warnSubChg is warnMin
			// oldWarnSubVal == 2 => already suppressing warnMax; set to 3 if warnSubChg is warnMin
			//						do nothing if warnSubChg is warnMax
		if (warnSupChg < 0) {  // suppress warning for "warnMin"
			if (oldWarnSupVal == 0) { glbChgSetData[arrI].warnSuppress = 1; }
			else if (oldWarnSupVal == 2) { glbChgSetData[arrI].warnSuppress = 3; }
			}
		if (warnSupChg > 0) {  // suppress warning for "warnMax"
			if (oldWarnSupVal == 0) { glbChgSetData[arrI].warnSuppress = 2; }
			else if (oldWarnSupVal == 1) { glbChgSetData[arrI].warnSuppress = 3; }
			}
		}
		// set .valCur (or .valNew if re-verifying
	var usrBoxTitle;  // text string to hold txtSrc that is passed back to chgVerifyVal
	if (glbChgReVerify) { // re-call chgVerifyVal() to check valNew
		glbChgSetData[arrI].valNew = Number(valNew);
		usrBoxTitle = "\"" + document.getElementById("chgUsrRespTitle").innerHTML + "\" box";
		chgVerifyVal(arrI,usrBoxTitle,tmpSupWarn);
		}
	else {
		glbChgSetData[arrI].valCur = Number(valNew);
		glbChgSetData[arrI].valNew = Number.NaN;
		chgWriteVal(arrI);
		}
	if (glbChgSetData[arrI].isCrossRef) {
		chgCrsSetMax(arrI);
		chgCrsSetMin(arrI);
		}
	return;	
	}

	// chgSetSubmit() is called by an onClick event on the "Submit" button on the "Change Settings"
	//		box.  The function loops through all of the elements in glbChgSetData[] and if
	//		.valPrev != .valCur, the function calls chgSetVal() to set the value of the corresponding
	//		global variable to .valCur.
	//	The function calls chgCloseBox() to close "chgSetBx" (after deleting its children).  Because
	//		chgCloseBox() tests for the "content" child of chgSetBx, chgSetSubmnit is not appropriate
	//		for setting global variables from command-line arguments (use chgSetVal() directly).
function chgSetSubmit() {
	var i;
	var valCur;
	var txtId;
	var doResize = false;
	var doChgF = false;
	var updtPrecision = false;
	var oldFZLim = glbSldZFLim;  //  not updated in loop
	var oldFDef = glbSldFDef;  // not updated in loop
	var arrSz = glbChgSetData.length;
	for (i = 0; i < arrSz; i++) {  // loop through glbChgSetData[]
		txtId = glbChgSetData[i].txtId;
		if (glbChgSetData[i].valCur != glbChgSetData[i].valPrev) {
			chgSetVal(i);  // set global veriables
				// special handling for changes in some global variables
			switch (txtId) {
				case "cXYBuf": doResize = true; break;
				case "cDefF": 
				case "cZFLim": 
						doChgF = true;
						break;
				case "cMagPrec" : updtPrecision = true; break;
					// no default action
				}  // end switch
			}  // end variable changed
		}  // end for loop through glbChgSetData[]
	if (document.getElementById("sldBndBox").style.display == "block") {
		if (doResize) { sldResizeSldVw(); }
		if (doChgF) {
			sldChgFDefVal(oldFDef,oldFZLim);
			}
		if (updtPrecision && !Number.isNaN(sldVwI)) {
			menuSetZMag(sldVw[sldVwI].z);	// writes current magnification using new precision
			menuWrtMxMag();  // writes maximum magnification using new precision
			}
		}			
	chgCloseBox();
	return;
	}

	// chgSetVal() is passed an index an element in the glbChgSetData[] array.
	//	The function sets the value of the global variable corresponding to that element
	//		to .valCur
function chgSetVal(arrI) {
	valCur = glbChgSetData[arrI].valCur;
	switch (glbChgSetData[arrI].txtId) {
		case "cSQLTimOut" : glbAjxTimeOut = valCur; break;
		case "cWaitTimOut" : glbWaitTimeOut = valCur; break;
		case "cXYBuf"	 : glbSldXYBuf = valCur; break;
		case "cXYOff"	 : glbSldTileOff = valCur; break;
		case "cFBuf"	 : glbSldFBuf = valCur; break;
		case "cMaxF"	 : glbSldMaxF = valCur; break;
		case "cDefF"	 : glbSldFDef = valCur; break;
		case "cZFLim"	 : glbSldZFLim = valCur; break;
		case "cFTimr"	 : glbFCycInterval = valCur; break;
		case "cZBuf"	 : glbSldZBuf = valCur; break;
		case "cFZBuf"	 : glbSldFZBuf = valCur; break;
		case "cMxCache"	 : glbImgCacheMaxSz = valCur; break;
		case "cMxDstArr" : destArrayMaxNum = valCur; break;
		case "cDstArrTimr" : destTimeInterval = valCur; break;
		case "cMvBtnStp" : sldMvStepSz = valCur; break;
		case "cMvBtnMult" : sldMvStepMult = valCur; break;
		case "cMvBtnTimr" : sldMvStepInterval = valCur; break;
		case "cMusMxDeclVel" : sldMusSlwDwnMxVel = valCur; break;
		case "cMusDeclMult" : sldMusSlwDwn.decel = valCur; break;
		case "cMusDeclTimr" : sldMusSlwDwn.interval = valCur; break;
		case "cMusMxPause" : glbSlwDwnMxTime = valCur; break;
		case "cMusWhlWait" : glbPnchWhlWait = valCur; break;
		case "cPnchDist" : glbMinPnchDist = valCur; break;
		case "cPnchWait" : glbMaxPnchTime = valCur; break;
		case "cMagPrec" : glbMagPrec = valCur; break;
		case "cWarnDispTime" : warnDisplayTime = valCur; break;
		case "cWarnFadeTimr" : warnFadeTime = valCur; break;
		case "cWarnFadeAmt" : warnFadeAmt = valCur; break;
		case "cInfoBoxTop" : glbInfoBxDefTop = valCur; break;
		case "cInfoBoxBottom" : glbInfoBxBotBorder = valCur; break;
		case "cInfoBoxSide" : glbInfoBxSideBorder = valCur; break;
		case "cWaitClkTimr" : glbTchWaitClkInterval = valCur; break;
		default : alert("chgSetVal(): Could not set value for \"" + glbChgSetData[arrI].txtNm
							+ "\" (\"" + glbChgSetData[arrI] +"\").\n\n  Please report this error.");
		}  // end switch
	return;
	}




