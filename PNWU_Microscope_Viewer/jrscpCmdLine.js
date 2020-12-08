// jrscpCmdLine.js
//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrscpCmdLine.js is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	The "PNWU Microscope" consists of two parts a Viewer and a SlideBox.  This file 
//		(jrscpCmdLine.js) is part of the Viewer.  Currently, the Viewer consists 
//		of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheets
//		- 11 javascript files (including jrscpCmdLine.js)
//		- three PHP files
//	jrscpCmdLine.js principally contains javascript functions that are involved in reading command-line
//		arguments included after the"?" in the URL
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


//	  ****************************************************************************
//	  **************             Command-line FUNCTIONS             **************
//	  ****************************************************************************


	// cmdLineRead() interprets AND EXECUTES any command-line arguments that are included in the URL
	//	This function does NOT return a value
	//	The function:
	//	(1)	finds the first '?' (or %3f or %3F) and passes everything after this character to cmdParseURL
function cmdLineRead() {
		// find beginning of commandLine arguments
	var cmdLine = document.URL;
	var strtI = cmdLine.indexOf("?");
	var tmpI = cmdLine.toLowerCase().indexOf("%3f");  // tests lowerCase but cmdLine is NOT in lowerCase
	var isChgSet = false;  // set to true if a command-line argument began with"cs_"
	if ((tmpI >= 0) && (tmpI < strtI)) { strtI = tmpI; }
	if ((strtI < 0) || (strtI >= (cmdLine.length - 1))) { return; }  // no command-line arguments to execute
			// convert commandline arguments into processed array of arguments & values
	var i;
	var cmdArr = cmdParseURL(cmdLine.slice(strtI+1,cmdLine.length));
	var arrSz = cmdArr.length;
	for (i = 0; i < arrSz; i++) {
		if (cmdArr[i].cmd.slice(0,3) == "cs_") {
			if (!cmdMustVal(cmdArr[i])) {
				continue;
				}
			if (!isChgSet) { chgUpdtArr("update"); }  // set glbChgSetData[].valPrev
			cmdChgSet(cmdArr[i]);
			isChgSet = true;
			}
		else { cmdArgExec(cmdArr[i]); }
		}
	if (isChgSet) { chgSetSubmit(); }  // change global variables
	return;
	}


	// cmdParseURL is passed everything after the "?" in the URL
	//	it first finds all unescaped "&" or "?" (including %26 and %3f), converting "?" to "&", and then
	//	splits the string into an array using "&" as the separator.  The function repeatedly calls 
	//	cmdStrDecode() for each element in the array.  The returned string from cmdStrDecode() is stored
	//	as the .raw element of curObj.  After converting to lowerCase and remmoving whitespace, the function
	//	stores everything before the "=" as the .cmd element of curObj, and everything after the "=" as
	//	the .val element of curObj.  If there is no "=", everything (after converting to lowerCase & removing
	//	whitespace) is stored as .cmd and .val == ""
function cmdParseURL(trunURL) {
	var i;
	var tmpI;
	var strtI;
	var cmdArr = [];  // array of 'curObj'-like objects
	var curObj = {raw: "", cmd: "", val: ""};
	cmdArr.splice(0);  // make certain that array is empty
		// find beginning of each command
		// find "&", "?" and look to see if it is escaped.
			// first need to block escaped '\' "\\"
	var cmdLine = trunURL.replace(/%5C/g,"\\").replace(/%5c/g,"\\");
	cmdLine = cmdLine.replace(/\\\\/g,"%5c");  // convert escaped backslashes to code for single '\'
			// convert all %26 into '&' and then convert "\&" back into %26
	cmdLine = cmdLine.replace(/%26/g,"&");
	cmdLine = cmdLine.replace(/\\&/g,"%26");  // convert escaped "\&" ("\\&") into "%26"
		// convert unescaped "?" into "&"
	strtI = cmdLine.indexOf("?");
	while ((strtI >= 0) && (strtI <= (cmdLine.length - 1))) {
		if ((strtI == 0) || ((strtI == 1) && (cmdLine.charAt(0) == "\\"))) {
			cmdLine = cmdLine.slice(strtI+1,cmdLine.length);
			}
		else if (cmdLine.charAt(strtI-1) != "\\") {
			cmdLine = cmdLine.slice(0,strtI) + "&" + cmdLine.slice(strtI+1,cmdLine.length);
			}
		else {  // remove escape code => "\?" becomes "?"
			cmdLine = cmdLine.slice(0,strtI-1) + cmdLine.slice(strtI,cmdLine.length);
			}
		tmpI = cmdLine.slice(strtI,cmdLine.length).indexOf("?");
		if (tmpI < 0) { break; }
		strtI += tmpI;	
		}
		// convert unescaped "%3f" into "&" and escaped "%3f" into "?"
	strtI = cmdLine.toLowerCase().indexOf("%3f");
	while ((strtI >= 0) && (strtI <= (cmdLine.length - 1))) {
		if ((strtI == 0) || ((strtI == 1) && (cmdLine.charAt(0) == "\\"))) {
			cmdLine = cmdLine.slice(strtI+3,cmdLine.length);
			}
		else if (cmdLine.charAt(strtI-1) != "\\") {
			cmdLine = cmdLine.slice(0,strtI) + "&" + cmdLine.slice(strtI+3,cmdLine.length);
			}
		else {  // remove escape code => "\?" becomes "?"
			cmdLine = cmdLine.slice(0,strtI-1) + "?" + cmdLine.slice(strtI+3,cmdLine.length);
			}
		strtI = cmdLine.toLowerCase().indexOf("%3f");
		}
	var tmpArr = cmdLine.split("&");
	var arrSz = tmpArr.length;
	var curStr;
	for (i = 0; i < arrSz; i++) {
		curObj.raw = cmdStrDecode(tmpArr[i]);
		curStr = curObj.raw.toLowerCase().replace(/ /g,"");  // remove spaces
		curStr = curStr.replace(/	/g,"");  // remove tabs
		strtI = curStr.indexOf("=");
		if (strtI < 0) {
			curObj.cmd = curStr;
			curObj.val = "";
			}
		else {
			curObj.cmd = curStr.slice(0,strtI);
			curObj.val = curStr.slice(strtI+1,curStr.length);
			}
		cmdArr[i] = {raw: curObj.raw,cmd: curObj.cmd, val: curObj.val};
		}
	return(cmdArr);
	}

	// cmdStrDecode() is passed a string that may contain URL encoding or escaped characters
	//	URL encoding has the form: %??, where "??" is the hexadecimal number corresponding to
	//		to the UTF-8 character code for the characater.  Most of the time, the browser replaces
	//		spaces with "%20", and this converts them back to spaces.
	//	escaped characters have the form \?, where "?" is a character.  For ASCII escape characters,
	//		the function replaces the escape-sequence with the ASCII escape character (I probably
	//		shouldn't have done this, but I'm old-fashioned).  At lease for now, the test is
	//		case sensitive: "\n" is the newline character, "\N" is N" .  For "%", the escape-sequence 
	//		("\%") prevents conversion of %?? into a URL-encoded character, and the function strips the  
	//		backslash from the escape-sequence, so "\%41" is replaced in the final string with "%41"
	//		(without the escape sequence, "%41" would have been converted into "A").  For all other
	//		characters, the escape sequence is replaced by the character; i.e. "\Z" becomes "Z".
	//	Note:  most browsers convert double-quotes (\") to "%22" and single-quotes (\') to "%27".
	//		If the character is NOT escaped, cmdStrDecode() will conver the character back to its
	//		original double or single quote.  If the user tries to escape the character, then 
	//		cmdStrDecode() will leave the character as "%22" or "%27"; i.e., If the user types:
	//		'dblquote = "', the result is 'dblquote = "'.  If the user types:  'dblquote = \"'
	//		then the result is 'dblquote = %22'
	//	cmdStrDecode() returns the string that results from escaping characters and replacing URL-encoding
function cmdStrDecode(cmdStr) {
	var argStr = cmdStr;
	var curI;
	var tmpI;
	var codeNum;
		// deal with escaped characters except "\%"
		// all escaped "\" have already been converted to %5c by cmdParseURL()
		//	so any '\' present in string are part of an escape-sequence.
	curI = argStr.lastIndexOf("\\");
	while (curI >= 0) {
		codeNum = Number.NaN;
		if (curI >= (argStr.length - 1)) {  // at end of argStr
			argStr = argStr.slice(0,curI);
			}
		else {
			switch (argStr.charAt(curI+1)) {
				case "a" : codeNum = 7; break;
				case "b" : codeNum = 8; break;
				case "t" : codeNum = 9; break;
				case "n" : codeNum = 10; break;
				case "v" : codeNum = 11; break;
				case "f" : codeNum = 12; break;
				case "r" : codeNum = 13; break;
				case "%" : break;  // this should leave escaped % ("\%") intact; see below
					// \" and \' reduce to default situation
				default: codeNum = argStr.charCodeAt(curI+1); break;
				}
			if (!Number.isNaN(codeNum)) {
				argStr = argStr.slice(0,curI) + String.fromCharCode(codeNum) + argStr.slice(curI+2,argStr.length);
				}
			} // end of "else not at end of argStr"
		curI = argStr.slice(0,curI).lastIndexOf("\\");
		}  // end of "while curI >= 0"
			// replace all unescaped "%num" with String.fromCharCode()
			// do reverse direction so converting escaped "\\" ("%5c") doesn't escape current "%..."
	curI = argStr.lastIndexOf("%");
	while (curI >=0) {
				// 1st term in "if" statment prevents trying to read a number beyond end of string
		if ((curI < (argStr.length-2)) && ((curI == 0) || (argStr.charAt(curI-1) != "\\"))) {
			codeNum = Number("0x" + argStr.slice(curI+1,curI+3));
			if (!Number.isNaN(codeNum)) {  // replace %nn with character
				argStr = argStr.slice(0,curI) + String.fromCharCode(codeNum) + argStr.slice(curI+3,argStr.length);
				} 
			}  // don't change string if not escaped and ?? in %?? is not a number
		else if (argStr.charAt(curI-1) == "\\") {  //escaped "\%" => remove "\\"
			curI--; // curI now points to "\\"
			argStr = argStr.slice(0,curI) + argStr.slice(curI+1,argStr.length);
			}
		curI = argStr.slice(0,curI).lastIndexOf("%");
		}
	return(argStr);
	}


		// cmdChgSet() is called if the URL-command begins with "cs_".  The function gets the index
		//		into glbChgSetData[], sets glbChgSetData[].newVal.  5/17/20:  because of the problem
		//		with asynchronous response from "chgUsrRespBx", the function does NOT call chgVerifyVal().
		//	The function calls cmdChgSetVerify() to check the values
function cmdChgSet(cmdObj) {
	var txtSz = cmdObj.cmd.length;
	var chgCmd = cmdObj.cmd.slice(3,cmdObj.cmd.length);
		// if we add aliases for some of the settings, the switch translating the aliases would go here
	var cmdI = cmdChgArrIndex(chgCmd);
	if (Number.isNaN(cmdI)) {
		alert("Could not find an entry in the list of accessible \'settings\' that matches the variable (\""
				+ cmdObj.cmd.slice(3,cmdObj.cmd.length) + "\") in the command \"" + cmdObj.raw 
				+ "\" that was entered as part of the URL.  "
				+ "This command (\""+ cmdObj.raw + "\") was not executed.  "
				+ "After the viewer has finished loading, the values of the viewer's settings can be "
				+ "changed using the menu (\"Settings\"" + String.fromCharCode(160,8594,160) 
				+ "\"Change Settings...\").  See the User Manual for more information.");
		return;
		}
		// already tested for cmdObj.val = "" in cmdLineRead(), so we don't need to do it here
	glbChgSetData[cmdI].valNew = cmdObj.val;
	cmdChgSetVerify(cmdI,cmdObj);
	return;
	}

		// cmdChgArrIndex() is passed a string that should match an entry in glbChgSetData[].lcTxtId
		//	The function loops through glbChgSetData[] looking for a match to .lcTxtId.  If a 
		//		match is found, the index to that entry in glbChgSetData[] is returned.
		//	If no match is found, NaN is returned.
		//	This function is the command-line equivalent of chgArrIndex()
function cmdChgArrIndex(cmdId) {
	var i;
	var arrSz = glbChgSetData.length
	for (i = 0; i < arrSz; i++) {
		if (glbChgSetData[i].lcTxtId == cmdId) { break; }
		}
	if (i < arrSz) return(i);
	return(Number.NaN);
	}

		// cmdArgExec() executes a command-line arguments.  cmdLineRead() sequentially passes each command-line
		//		argument, EXCEPT for "Change Setting" ("cs_") arguments, to cmdArgExec() for execution.
		//	The function is passed an object containing the values for ONE command-line argument (cmdLineRead()
		//		passes the objects (elements in cmdArr[]_ one-at-a-time to cmdArgExec().
		//	The elements in this object are:
		//	(1) .raw = the entire argument, in both upper & lower case & with spaces intact,
		//			after translating escaped characters and URL-encoded (%??) characters.
		//	(2)	.cmd = the portion of the argument before the "=" (if it exists, otherwise the entire
		//			string) after converting to lowerCase and removing whitespace
		//	(3)	.val = portion of argument after the "=" after converting to lowerCase and removing whitespace
		//	cmdArgExec() assumes that an "Change Setting" commands ("cs_????=??") have been trapped previously
		//		The "Change Setting" commands are NOT handled by cmdArgExec().
		//	This function has no return value.
function cmdArgExec(cmdObj) {
	var tgtNode;  // working variable to hold node that is the target of the command
	var cmdStr = cmdObj.cmd;
	var valCur;
	var errStr = "";
	if (!Number.isNaN(Number(cmdStr))) { cmdStr = "cmdSldNum"; } // sldNum is .cmd
	else if ((cmdStr == "sb") && (cmdObj.val != "")) { cmdStr = "slide"; }  // sb=sldNum
	switch(cmdStr) {
		case "cmdSldNum" :  // .cmd is the slide number.
				valCur = Number(cmdObj.cmd);
				if ((Number.isInteger(valCur)) && (valCur >= 0)) {
					dbSldNum = valCur;
					if (Number.isNaN(glbShwSldSelBx)) { glbShwSldSelBx = false; }
					}
				else {
					errStr = "For the argument (in the URL), \"" + cmdObj.raw + "\", if the command (\"";
					errStr += cmdObj.cmd + "\") is a number, it corresponds to the slide number, and ";
					if (!Number.isInteger(valCur)) {
						errStr += "must be an integer.  Since \"" + cmdObj.cmd + "\" is not an integer, "
						}
					else {
						errStr += "must be greater than 0.  Since \"" + cmdObj.cmd + "\" is negative, ";
						}
					errStr += "the slide number was not set to " + cmdObj.cmd + "."; 
					alert(errStr);
					} 
				break;
					// cmdStr for sb=sldNum is set to "slide"
					// if sb command isn't given, then sldNum given in the command-line causes 
					//		glbShwSldSeBx = false and suppresses "Choose a slide" options
		case "slide" :  // specifies slide number; default is for dbSldNum to be NaN
				dbSldNum = cmdMustInt(cmdObj,0,Number.POSITIVE_INFINITY);
				if (cmdObj.cmd == "sb") { glbShwSldSelBx = true; }
						// if assignment of sldNum succeeded and 'sb' command not given
						//		then suppress "choose a slide" box
				if (Number.isInteger(dbSldNum) && Number.isNaN(glbShwSldSelBx)) {
					glbShwSldSelBx = false;
					}
				break;
					// sb=sldNum is treated as slide=sldNum, see above
		case "sb" :   // causes "Choose a slide" box to be available
				glbShwSldSelBx = true;
				break;
		case "f" :   // specifies initial focal plane; default for glbSldStrtF is NaN
				glbSldStrtF = cmdMustInt(cmdObj,0,Number.POSITIVE_INFINITY);
				break;
		case "z" :   // specifies intial zoom-level; default value is NaN
				glbSldStrtZ = cmdMustInt(cmdObj,0,Number.POSITIVE_INFINITY);
				break;
					// specifies initial x,y (specimen) pixel-values for center of screen; default NaN
		case "y" :
				glbVwFocY = cmdMustInt(cmdObj,0,Number.POSITIVE_INFINITY);
				break;
		case "x" :
				glbVwFocX = cmdMustInt(cmdObj,0,Number.POSITIVE_INFINITY);
				break;
					// for most display-commands, the command is to "hide" so 'true' means
					//	to hide and 'false' means to show ... which is opposite of whether
					//	the check-box is checked 
		case "hidenav" :   // hides navigator
		case "hidenavigator" :
						// since navigator is hidden until slideView is initialized
						//	can't use menuSetVisChkBx(); instead see extra code in sldInitializeView
				document.getElementById("menuNavVisCheckBx").checked = !cmdMustBool(cmdObj);
				break;
		case "hidesldnm" :  // hides "slide name" info window on menu
		case "hideslidename" :  // hides "slide name" info window on menu
		case "hidenm" :  // hides "slide name" info window on menu
		case "hidename" :  // hides "slide name" info window on menu
				if (cmdMustBool(cmdObj)) {  // either no modifier or HideName == true
					document.getElementById("menuSldNmVisCheckBx").checked = false;
					document.getElementById("menuMainSldNm").style.display = "none";
					}
				else {  // HideName == false, so slide name should be displayed on menu
					document.getElementById("menuSldNmVisCheckBx").checked = true;
					document.getElementById("menuMainSldNm").style.display = "inline-block";
					}
				break;
		case "hidef" :  // hides "focal plane" info window on menu
				if (cmdMustBool(cmdObj)) {  // either no modifier or HideF == true
					document.getElementById("menuFVisCheckBx").checked = false;
					document.getElementById("menuFP").style.display = "none";
					}
				else {  // HideF = false:  show focal plane on menu
					document.getElementById("menuFVisCheckBx").checked = true;
					document.getElementById("menuFP").style.display = "inline-block";
					}
				break;
		case "hidez" :  // hides zoom-level info window on menu
				if (cmdMustBool(cmdObj)) {  // either no modifier or HideZ == true
					document.getElementById("menuZVisCheckBx").checked = false;
					document.getElementById("menuZ").style.display = "none";
					}
				else {  // HideZ is false, show zoom-level on menu
					document.getElementById("menuZVisCheckBx").checked = true;
					document.getElementById("menuZ").style.display = "inline-block";
					}
				break;
		case "hidexy" :
				if (cmdMustBool(cmdObj)) {  // either no modifier or HideXY== true
					document.getElementById("menuXYVisCheckBx").checked = false;
					document.getElementById("menuXPos").style.display = "none";
					document.getElementById("menuYPos").style.display = "none";
					}
				else {
					document.getElementById("menuXYVisCheckBx").checked = true;
					document.getElementById("menuXPos").style.display = "inline-block";
					document.getElementById("menuYPos").style.display = "inline-block";
					}
				break;
		case "fdisable" :
				if (cmdMustBool(cmdObj)) {  // either no modifier or fdisable == true
					glbFDisabled = true;
					document.getElementById("menuEnDisableF").innerHTML = "Enable focusing";
					}
				else {
					glbFDisabled = false;
					document.getElementById("menuEnDisableF").innerHTML = "Disable focusing";
					}
				break;
		case "mutebell" :  	// menuSetBell() toggles bell
					//	to turn bell on, set mute=true (bell off) before calling menuSetBell() 
					//	to turn bell off, set mute=false (bell on) before calling menuSetBell() 
				document.getElementById("warnBell").muted = !cmdMustBool(cmdObj);
				menuSetBell();
				break;
					// on 9/20/20, set default for warnBell to muted.  As a result, need to add
					//	a new command-line argument UnmuteBell to turn on bell
		case "unmutebell" :  	// menuSetBell() toggles bell
		case "unmute":
					//	to turn bell on, set mute=true (bell off) before calling menuSetBell() 
					//	to turn bell off, set mute=false (bell on) before calling menuSetBell() 
				document.getElementById("warnBell").muted = cmdMustBool(cmdObj);
				menuSetBell();
				break;

		case "arrmvsld" :  	
		case "arrowmoveslide" :  	// menuChgMvArrowDir() toggles glbMvBtnDir
					//	so glbMvBtnDir should be set to the opposite of the desired direction
					//	before calling menuChgMvArrowDir() 
				if (cmdMustBool(cmdObj)) { glbMvBtnDir = -1; }
				else { glbMvBtnDir = 1; }
				menuChgMvArrowDir();
				break;
		case "hidelogo" :  // cuts short display of copyright box
				if (cmdMustBool(cmdObj)) {  // either no modifier or HideLogo == true
					prgCpyRtBxClose();
					}    // don't do anything if hidelogo false
				break;
		default :
				alert("The instruction (\"" + cmdObj.cmd + "\") in the command \"" + cmdObj.raw 
						+ "\" (in the URL), could not be interpreted.  This command will be ignored.");
		}  // end switch
	return;
	}

		// cmdMustVal() looks to see if cmdObj.val is an empty string.  It does not attempt any
		//		other check on .val => for instance .val == null probably will return "true"
		//	If cmdObj.val == "", the function displays an error message and returns false
		//		(which eventually should be a callAlertBox(), rather than alert()
		//	If cmdObj.val != "", the function returns true.
function cmdMustVal(cmdObj) {
	if (cmdObj.val == "") {
		alert("The command \"" + cmdObj.raw + "\" (included in the URL) should (but does not) consist of "
					+ "an \'=\' sign followed by a value.  As a result, this command could not be executed.  "
					+ "See the User Manual for more information.");
		return(false);
		}
	return(true);
	}

		// cmdMustInt() first test whether cmdObj.val is an integer.  If not, it displays an error 
		//		message and returns NaN
		//	The function then tests whether valMin < cmdObj.val < valMax.  If not, it displays an error
		//		an error message and returns NaN
		//	Otherwise, the function returns the integer.
function cmdMustInt(cmdObj,valMin,valMax) {
	if (!cmdMustVal(cmdObj)) { return(Number.NaN); }  // Number() evaluates an empty string as 0
	var valNum = Number(cmdObj.val);
	if (Number.isNaN(valNum)) {
		alert("For the command (included in the URL), \"" + cmdObj.raw 
					+ "\", there should be a number after the \'=\' sign, but \"" + cmdObj.val
					+ "\" is not a number.  As a result, this command could not be executed.  "
					+ "See the User Manual for more information.");
		return(Number.NaN);
		}
	if (!Number.isInteger(valNum)) {
		alert("For the command (included in the URL), \"" + cmdObj.raw 
					+ "\", the number after the \'=\' sign must be an integer, but \"" + cmdObj.val
					+ "\" is not an integer.  As a result, this command could not be executed.  "
					+ "See the User Manual for more information.");
		return(Number.NaN);
		}
	if (valNum < valMin) {
		alert("For the command (included in the URL), \"" + cmdObj.raw 
					+ "\", the number (" + cmdObj.val + ") after the \'=\' sign is too small; " 
					+ " its value must be greater than or equal to " + valMin
					+ ".  As a result, this command could not be executed.  "
					+ "See the User Manual for more information.");
		return(Number.NaN);
		}
	if (valNum > valMax) {
		alert("For the command (included in the URL), \"" + cmdObj.raw 
					+ "\", the number (" + cmdObj.val + ") after the \'=\' sign is too large; " 
					+ " its value must be less than or equal to " + valMax
					+ ".  As a result, this command could not be executed.  "
					+ "See the User Manual for more information.");
		return(Number.NaN);
		}
	return(valNum);
	}

		// cmdMustBool() evaluates cmdObj.val.  
		//	If cmdObj.val =="", "1", "t", or "true", the function returns true.
		//	If cmdObj.val == "0", "f", or "false", the function returns false.
		//	In all other cases, the function displays a warning and returns false.   
		//		Boolean command-line arguments are designed so that the default value 
		//		(if the command-line argument were not present) is false.
		//	cmdParseURL() ensures that cmdObj.val will be in lowerCase
function cmdMustBool(cmdObj) {
	var cmdVal = cmdObj.val;
	if (cmdVal == "") { return(true); }
	if ((cmdVal == 1) || (cmdVal == "true") || (cmdVal == "t")){ return(true); }
	if ((cmdVal == 0) || (cmdVal == "false") || (cmdVal == "f")){ return(false); }
	alert("For the command (included in the URL), \"" + cmdObj.raw 
				+ "\", the value after the \'=\' sign must be either \"true\" or \"false\".  " 
				+ "The value following the \'=\' sign (\"" + cmdObj.val
				+ "\") could not be interpreted, and is assumed to be \"false\".  "
				+ "See the User Manual for more information.");
	return(false);
	}



	// cmdChgSetVerify() is passed the index in glbChgSetData[] to the current "cs_" comand
	//		and the command-object containing the current "cs_" command
	//	The function uses glbChgSetData[].valNew to hold the proposed value for the global 
	//		variable while confirming that the value is valid.
	//	If the valNew is NOT a valid value, .valNew is set to NaN and the function returns;
	//	If valNew passes all of the tests, .valCur is set to .valNew (and .valNew set to NaN)
	//		and the function returns;  after the entire command-line has been read,
	//		cmdLineRead() calls chgSetSubmit() to change the values of the global variables.
function cmdChgSetVerify(arrI,cmdObj) {
	var txtMsg = "";
	var txtExtra;
	var txtIneq;
	var txtValSz;
	var txtMMSz;
	var valMaxMin;
	var absMaxMin;
		// cmdLineRead() has already has set glbChgSetData[arrI].valNew = cmdObj.val
		//	and assured that cmdObj.val !=""
	var valNew = Number(glbChgSetData[arrI].valNew);  // convert .valNew (a string) into a number
	var endMsgPt1 = "After the window has finished loading, the value for \"";
	var endMsgPt2 = "\" can be changed using the \"Settings\"" + String.fromCharCode(160,8594,160)
						+ "\"Change Settings ...\" menu.";
			// if valNew isn't a number, try to parse a number
	if (Number.isNaN(valNew) || ((!Number.isInteger(valNew)) && (glbChgSetData[arrI].isInt))) {
		if (glbChgSetData[arrI].isInt) {
			valNew = parseInt(glbChgSetData[arrI].valNew);
			txtExtra = "an integer";
			}
		else {
			valNew = parseFloat(glbChgSetData[arrI].valNew);
			txtExtra = "a number";
			}
					// couldn't parse a number / integer
		if ((Number.isNaN(valNew)) || ((!Number.isInteger(valNew)) && (glbChgSetData[arrI].isInt))) {
			txtMsg = "The text after the \'=\' sign (\"" + cmdObj.val + "\") in the command, \"";
			txtMsg += cmdObj.raw + "\" (in the URL) is not " + txtExtra + ".  The value for \"";
			txtMsg += glbChgSetData[arrI].txtNm.toLowerCase() + "\" must be " + txtExtra;
			txtMsg += ",so the URL-command \"" + cmdObj.raw +"\" was ignored.  ";
			txtMsg += endMsgPt1 + glbChgSetData[arrI].txtNm.toLowerCase() + endMsgPt2;
			alert(txtMsg);
			glbChgSetData[arrI].valNew = Number.NaN;
			return;
			}
		else {  // number could be parsed.
			txtMsg = "The value for \"" + glbChgSetData[arrI].txtNm.toLowerCase();
			txtMsg += "\" must be " + txtExtra + ".  ";
			txtMsg += "Although the text after the \'=\' sign (\"" + cmdObj.val + "\") in the command \"";
			txtMsg += cmdObj.raw + "\" (in the URL) is not " + txtExtra + ", " + txtExtra;
			txtMsg += " (" + valNew + ") could be extracted from this text.\n\n  Click \"OK\" if you want to use ";
			txtMsg += valNew + " as the value for \"" + glbChgSetData[arrI].txtNm.toLowerCase();
			txtMsg += ".\n  Click \"Cancel\" if you don\'t want to use this value.\n\n";
			txtMsg += endMsgPt1 + glbChgSetData[arrI].txtNm.toLowerCase() + endMsgPt2;
			if (confirm(txtMsg)) { glbChgSetData[arrI].valNew = valNew; }  // use parsed value
			else {  // don't use parsed value
				glbChgSetData[arrI].valNew = Number.NaN;
				return;
				}
			}  // end else number could be parsed
		}  // end if NaN
			// above or below absolute MaxMin
	if ((valNew < glbChgSetData[arrI].absMin) || (valNew > glbChgSetData[arrI].absMax)) {
		if (valNew < glbChgSetData[arrI].absMin){
			txtIneq = "greater";
			txtValSz = "small";
			valMaxMin = glbChgSetData[arrI].absMin;
			}
		else{
			txtIneq = "less";
			txtValSz = "large";
			valMaxMin = glbChgSetData[arrI].absMax;
			}
		txtMsg = "The value for \"" + glbChgSetData[arrI].txtNm.toLowerCase() + "\" must be " + txtIneq;
		txtMsg += " than or equal to " + valMaxMin + ".  The value (" + valNew + ") entered in the command \"";
		txtMsg += cmdObj.raw + "\" (in the URL) is too " + txtValSz + ", and this command will be ignored.  ";
		txtMsg += endMsgPt1 + glbChgSetData[arrI].txtNm.toLowerCase() + endMsgPt2;
		alert(txtMsg);
		glbChgSetData[arrI].valNew = Number.NaN;
		return;
		}
	if ((valNew < glbChgSetData[arrI].warnMin) || (valNew > glbChgSetData[arrI].warnMax)) {
		if (valNew < glbChgSetData[arrI].warnMin){
			txtIneq = "greater";
			txtMMSz = "small";
			txtValSz = "smaller"
			valMaxMin = glbChgSetData[arrI].warnMin;
			absMaxMin = glbChgSetData[arrI].absMin;
			}
		else{
			txtIneq = "less";
			txtMMSz = "large";
			txtValSz = "larger"
			valMaxMin = glbChgSetData[arrI].warnMax;
			absMaxMin = glbChgSetData[arrI].absMax;
			}
		txtMsg = "Although the value for \"" + glbChgSetData[arrI].txtNm.toLowerCase() + "\" can be as " + txtMMSz;
		txtMsg += " as " + absMaxMin + ", the viewer probably will perform better if the value for \"";
		txtMsg += glbChgSetData[arrI].txtNm.toLowerCase() + "\" was " + txtIneq + " than or equal to ";
		txtMsg += valMaxMin + ".  The value (" + valNew + ") entered in the command, \"" + cmdObj.raw;
		txtMsg += "\" (in the URL) is " + txtValSz + " than recommended.\n\n  Click \"OK\" if you want to use ";
		txtMsg += valNew + " as the value for \"" + glbChgSetData[arrI].txtNm.toLowerCase();
		txtMsg += " (not recommended).\n  Click \"Cancel\" if you don\'t want to use this value.\n\n";
		txtMsg += endMsgPt1 + glbChgSetData[arrI].txtNm.toLowerCase() + endMsgPt2;
		if (confirm(txtMsg)) { glbChgSetData[arrI].valNew = valNew; }  // use parsed value
		else {  // don't use parsed value
			glbChgSetData[arrI].valNew = Number.NaN;
			return;
			}
		}
	if (glbChgSetData[arrI].isCrossRef) {
		if (cmdCrossRef(arrI,cmdObj)) {  // keep newVal:  cross-ref OK or user clicked "OK" in confirm() box
			glbChgSetData[arrI].valNew = valNew;
			}
		else {  // absolute error in crossRef or user clicked "Cancel" in confirm() box warning
			glbChgSetData[arrI].valNew = Number.NaN
			return;
			}
		}
	if (Number.isNaN(glbChgSetData[arrI].valNew)) {
		alert("cmdChgSetVerify(): for the URL-comnand \"" + cmdObj.raw 
				+ "\", .valNew should NOT be NaN if we reach the end of cmdChgSetVerify()."
				+ "\n glbChgSetData[" + arrI + "].txtId = \"" + glbChgSetData[arrI].txtId
				+ "\"\n glbChgSetData[" + arrI + "].valNew = " + glbChgSetData[arrI].valNew
				+ "\n glbChgSetData[" + arrI + "].valCur = " + glbChgSetData[arrI].valCur
				+ "\n valNew = " + valNew + "\n\nPlease report this error.");
		return;  // .valCur is unchanged.
		}
	if (glbChgSetData[arrI].valNew != valNew) {
		alert("cmdChgSetVerify():  for the URL-comnand \"" + cmdObj.raw + "\", glbChgSetData[" 
				+ arrI + "].valNew should be equal to valNew at the end of cmdChgSetVerify()."
				+ "\n glbChgSetData[" + arrI + "].txtId = \"" + glbChgSetData[arrI].txtId
				+ "\"\n glbChgSetData[" + arrI + "].valNew = " + glbChgSetData[arrI].valNew
				+ "\n glbChgSetData[" + arrI + "].valCur = " + glbChgSetData[arrI].valCur
				+ "\n valNew = " + valNew + "\n\nPlease report this error.");
		}
			// already returned if valNew == NaN
	glbChgSetData[arrI].valCur = glbChgSetData[arrI].valNew;
	glbChgSetData[arrI].valNew = Number.NaN; 
	if (glbChgSetData[arrI].isCrossRef){
		chgCrsSetMax(arrI);
		chgCrsSetMin(arrI);
		}
	return;
	}


	// cmdCrossRef(): if a variable being set by a command-line argument (URL?...&cs_xxxxx&...)
	//		is a cross-referenced global variable (glbChgSetData[].isCrossRef == true), 
	//		then the proposed value (glbChgSetData[].valNew) is checked by cmdCrossRef()
	//	If the value of the variable is within the cross-ref limits, cmdCrossRef() returns true
	//	If the value of the variable is outside of absolute cross-ref limits, the function
	//		displays an alert() message and returns false.
	//	If the value of the variable is within absolute cross-ref limits but outside cross-ref
	//		warn limits, the function displays a confirm() message, and returns true if the
	//		user selects "OK" or false if the user selects "Cancel"
	//	NOTE:  the return value on error usually is true since cross-referencing a variable should
	//		be optional.
	//	5/18/20:  Most of this function is lifted verbatim from chgCrossRef() in jrscpChgSet2.
	//		I had intended on using chgCrossRef() rather than writing a separate function, but
	//		I couldn't figure out how to suspend processing of the "for" loop until the user
	//		clicked a choice in the "User Response Box" (<div id="chgUsrRespBx">) ... so I had to
	//		create a mirror'd function that used alert() and confirm() boxes instead of "chgUsrRespBx"

function cmdCrossRef(arrI,cmdObj) {
	var txtId = glbChgSetData[arrI].txtId;
	var valNew = glbChgSetData[arrI].valNew;
	var crsId;  // .txtId of first cross-referenced variable
	var crs2Id = "";  //.txtId of second cross-referenced variable
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
		default : alert("cmdCrossRef():  need to write code for \"" + txtId 
					+ "\".\n\n  Please report this error");
			return(true);
		}
		// get cross-referenced indices
	var crsArrI = chgArrIndex(crsId); // index of cross-referenced variable
	if (Number.isNaN(crsArrI)) {
		alert("cmdCrossRef(): Could not find cross-reference ID (\"" + crsId +"\") in glbChgDataSet[]. "
				+ " Can\'t check \"" + txtId +"\" for cross-reference errors."
				+ "\n\n  Please report this error.");
		return(true);
		}
	var crsVal = glbChgSetData[crsArrI].valCur;  // .valCur of cross-referenced variable
	var crs2ArrI = Number.NaN;
	var crs2Val = Number.NaN;
	if (crs2Id != "") { // there is a second cross-reference that needs to be checked
		crs2ArrI = chgArrIndex(crs2Id); // index of cross-referenced variable
		if (Number.isNaN(crs2ArrI)) {
			alert("cmdCrossRef(): Could not find second cross-reference ID (\"" + crs2Id 
					+ "\") in glbChgDataSet[].  Can\'t check \"" + txtId 
					+ "\" for cross-reference errors.\n\n  Please report this error.");
			return(true);
			}
		crs2Val = glbChgSetData[crs2ArrI].valCur;  // .valCur of cross-referenced variable
		}
	var txtMsg = "";  // string for alert() or confirm() box
	var valExtra;  // variable for holding calculated values within switch
		// check for cross-reference errors => this is variable specific.
	switch(txtId) {
		case "cXYBuf" :  // must be >= "cXYOff"; crsVal = "cXYOff".valCur
				if (Number.isNaN(crsVal) || (valNew >= crsVal))  { return(true); }
				alert(cmdCRAbsErrTxt(arrI,crsArrI,cmdObj.raw,1));  // >= error absErr message
				return(false);
				break;
		case "cXYOff" :  // must be <+ "cXYBuf"; crsVal = "cXYBuf.valCur
				if (Number.isNaN(crsVal) || (valNew <= crsVal))  { return(true); }
				alert(cmdCRAbsErrTxt(arrI,crsArrI,cmdObj.raw,-1));  // <= error absErr message
				return(false);
				break;
		case "cFBuf" :  // 2 variables: crsId: "cFBuf" < "cMaxF" AND crs2Id "cFBuf" >= "cFZBuf"
				if ((Number.isNaN(crsVal) || (valNew < crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew >= crs2Val))) {
					 return(true);
					 }
				if (valNew >= crsVal) {
					alert(cmdCRAbsErrTxt(arrI,crsArrI,cmdObj.raw,-2));  // < error absErr message
					return(false);
					}
				if (valNew < crs2Val) { // FBuf < FZBuv
					alert(cmdCRAbsErrTxt(arrI,crs2ArrI,cmdObj.raw,1));  // >= error absErr message
					return(false);
					}
				break;
		case "cMaxF" :  // 2 variables: must be >= "cFBuf (crsId); since this is absolute, do this first
						// warning if <= cMsDstArr (crs2Id)
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew <= crs2Val))) {
					return(true);
					}
				if (valNew < crsVal) {
					alert(cmdCRAbsErrTxt(arrI,crsArrI,cmdObj.raw,1));  // >= error absErr message
					return(false);
					}
				if (valNew > crs2Val) {  //crs2Id = "cMxDstArr"; MaxF > MxDstArr
					if (confirm(cmdCRWarnErrTxt(arrI,crs2ArrI,cmdObj.raw,-1))) {
						return(true); }
					return(false);
					}
				break;
		case "cMxDstArr" : // 2 variables > cMaxF and cZBuf: crsId = "cMaxF"; crs2Id = "cZBuf"; must be >= to both values
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) || (valNew >= crs2Val))) { // cMxDstArr >= both values
					return(true);
					}
						// use the larger of crsVal and crs2Val
				if (crsVal > crs2Val) { txtMsg = cmdCRWarnErrTxt(arrI,crsArrI,cmdObj.raw,1); }
				else { txtMsg = cmdCRWarnErrTxt(arrI,crs2ArrI,cmdObj.raw,1); }
				if (confirm(txtMsg)) { return(true); }
				return(false);
				break;
		case "cFZBuf" :  // must be <= cFBuf AND <= cZBuf: crsId = "cFBuf"; crs2Id = "cZBuf"
				if ((Number.isNaN(crsVal) || (valNew <= crsVal)) 
							&& (Number.isNaN(crs2Val) || (valNew <= crs2Val))) { // cFZBuf < both variables
					return(true);
					}
						// use the smaller  of crsVal and crs2Val
				if (crsVal < crs2Val) { txtMsg = cmdCRAbsErrTxt(arrI,crsArrI,cmdObj.raw,-1); }
				else { txtMsg = cmdCRAbsErrTxt(arrI,crs2ArrI,cmdObj.raw,-1); }
				if (confirm(txtMsg)) { return(true); }
				return(false);
		case "cZBuf" :  // 2 variables: crsId = "cFZBuf"; crs2Id = "cMxDstArr"
						// must be > "cFZBuf (crsId); since this is absolute, do this first
						// warning if <= cMsDstArr (crs2Id)  // 2 variables
				if ((Number.isNaN(crsVal) || (valNew >= crsVal)) 
							&& (Number.isNaN(crs2Val) ||(valNew <= crs2Val))) {
					return(true);
					}
				if (valNew < crsVal) {  // ZBuf < FZBuf
					alert(cmdCRAbsErrTxt(arrI,crs2ArrI,cmdObj.raw,1));  // >= error absErr message
					return(false);
					}
				if (valNew > crs2Val) {  // ZBuf > MxDstArr
					if (confirm(cmdCRWarnErrTxt(arrI,crs2ArrI,cmdObj.raw,-1))) {
						return(true); }
					return(false);
					}
				break;
		case "cMvBtnStp": // warn if MvBtnStp * MvBtnMult >= tileSz; crsId = "cMvBtnMult"
		case "cMvBtnMult": // warn if MvBtnStp * MvBtnMult >= tileSz; crsId = "cMvBtnStp"
				valExtra = Math.min(glbTileSzX,glbTileSzY);  // tile-size
				if (Number.isNaN(valNew) || Number.isNaN(crsVal)) { return(true); }
				if ((valNew * crsVal) <= valExtra) { return(true); } // cross-ref is OK
				if (confirm(cmdCrsRefMvBtn(arrI,crsArrI,cmdObj.raw))) {
					return(true); }
				return(false);
				break;
		case "cInfoBoxTop": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxBottom"
		case "cInfoBoxBottom": // warn if top + bottom > wndHt - 370; crsId = "cInfoBoxTop"
				valExtra = parseInt(window.innerHeight) - 370;  // wndHt
				if (Number.isNaN(valNew) || Number.isNaN(crsVal)) { return(true); }
				if (confirm(cmdCrsRefInfoBx(arrI,crsArrI,cmdObj.raw))) {
					return(true); }
				return(false);
				break;
				if (valNew <= (valExtra - crsVal)) { return(true); } // values are OK
		default : alert("cmdCrossRef():  need to write code for \"" + txtId 
					+ "\".\n\n  Please report this error");
			return(true);
		}
	alert("cmdCrossRef():  missing return for \"" + txtId + "\".\n\n  Please report this error.");
	return(false);
	}

	// cmdCRAbsErrTxt() creates the error message for a cross-reference absolute error:
	//	arrI & crsI are the indices into glbChgSetData[] for the value being tested and the cross-reference value
	//	cmdStr is .raw URL-command.
	//	errId:  if > 0 valNew is too small (must be >= crsVal),
	//		if < 0 the value is too large (must be <= crsVal).
	//		if 1 or -1, valNew can equal crsVal
	//		if 2 or -2, valNew must be > or < crsVal
	//	The function returns the error message
function cmdCRAbsErrTxt(arrI,crsI,cmdStr,errId) {
	var valNew = glbChgSetData[arrI].valNew;
	var txtNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var crsVal = glbChgSetData[crsI].valCur;  // .valCur of cross-referenced variable
	var crsNm = glbChgSetData[crsI].txtNm.toLowerCase();
		// these are the values for errId = +1 => see below for changes 
	var valSz = "small";
	var txtInEq = "greater than or equal to";
	if (errId > 1) { txtInEq = "greater than"; }
	if (errId < 0) {
		valSz = "large";
		txtInEq = "less than or equal to";
		}
	if ( errId < -1 ) { txtInEq = "less than"; }
	var txtMsg = "The value entered in the URL-command, \"" + cmdStr + "\" for \"" + txtNm;
	txtMsg += "\" (" + valNew + "\" is too " + valSz + "; the value of this variable must ";
	txtMsg += "be " + txtInEq + " the value for \'" + crsNm + "\" (" + crsVal;
	txtMsg += ").  This URL-command (\"" + cmdStr + "\") was ignored.  ";
	txtMsg += "After the window has finished loading, the value for \"" + txtNm;
	txtMsg += "\" can be changed using the \"Settings\"";
	txtMsg += String.fromCharCode(160,8594,160) + "\"Change Settings ...\" menu.";
	return(txtMsg);
	}

	// cmdCRWarnErrTxt() creates the warning message for a cross-reference warning error:
	//		This txt string will be used in a confirm() box
	//	arrI & crsI are the indices into glbChgSetData[] for the value being tested and the cross-reference value
	//	cmdStr is .raw URL-command.
	//	errId:  if > 0 valNew is too small (must be >= crsVal),
	//		if < 0 the value is too large (must be <= crsVal).
	//		if 1 or -1, valNew can equal crsVal
	//		if 2 or -2, valNew must be > or < crsVal
	//	The function returns the warning message
function cmdCRWarnErrTxt(arrI,crsI,cmdStr,errId) {
	var valNew = glbChgSetData[arrI].valNew;
	var txtNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var crsVal = glbChgSetData[crsI].valCur;  // .valCur of cross-referenced variable
	var crsNm = glbChgSetData[crsI].txtNm.toLowerCase();
		// these are the values for errId = +1 => see below for changes
	var valSz = "larger than ";
	var txtInEq = "greater than or equal to";
	if (errId > 1) { txtInEq = "greater than"; }
	if (errId < 0) {
		valSz = "smaller than ";
		txtInEq = "less than or equal to";
		}
	if ( errId < -1 ) { txtInEq = "less than"; }
			// format string for confirm() box
	var txtMsg = "Although the value for \"" + txtNm + "\" (" + valNew;
	txtMsg += ") that was entered in the URL-command, \"" + cmdStr;
	txtMsg += "\" can be used, the viewer probably will perform better if the value for \"" + txtNm;
	txtMsg += "\" was " + txtInEq + " the value of \"" + crsNm + "\" (" + crsVal;
	txtMsg += ").  Thus, it probably would be better to set \"" + txtNm + "\" to a value " + valSz;
	txtMsg += valNew + ".  After the window has finished loading, the value for \"" + txtNm;
	txtMsg += "\" can be changed using the \"Settings\"" + String.fromCharCode(160,8594,160);
	txtMsg += "\"Change Settings ...\" menu." + "\n\n  Click \"OK\" to use ";
	txtMsg += valNew + " as the value for \"" + txtNm + "\" (not recommended).";
	txtMsg += "\n  Click \"Cancel\" if you don\'t want to use this value.";
	return(txtMsg);
	}

	// cmdCrsRefMvBtn returns an error message string that is specific for the case of:
	//		 MvBtnStp x MvBtnMult >= tileSz
function cmdCrsRefMvBtn(arrI,crsI,cmdStr) {
	var valNew = glbChgSetData[arrI].valNew;
	var txtNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var crsVal = glbChgSetData[crsI].valCur;  // .valCur of cross-referenced variable
	var crsNm = glbChgSetData[crsI].txtNm.toLowerCase();
	var tileSz = Math.min(glbTileSzX,glbTileSzY);
	var valMax = Math.floor(tileSz/valNew);
	var txtMsg = "The value in the URL-command, \"" + cmdStr + "\" for \"" + txtNm + "\" (" + valNew;
	txtMsg += ") is larger than recommended, since the value for \"" + crsNm + "\" is " + crsVal;
	txtMsg += ".  The viewer will function better if the product of \"" + txtNm + "\"";
	txtMsg += String.fromCharCode(160,215,160) + "\"" + crsNm + "\" is less than " + tileSz;
	txtMsg += ", so it would be better if the value for \"" + txtNm + "\" was less than ";
	txtMsg += valMax + ".  After the window has finished loading, the value for \"" + txtNm;
	txtMsg += "\" can be changed using the \"Settings\"" + String.fromCharCode(160,8594,160);
	txtMsg += "\"Change Settings ...\" menu." + "\n\n  Click \"OK\" to use ";
	txtMsg += valNew + " as the value for \"" + txtNm + "\" (not recommended).";
	txtMsg += "\n  Click \"Cancel\" if you don\'t want to use this value.";
	return(txtMsg);
	}

	// cmdCrsRefInfoBx() returns an error message specific for infoBoxTop/infoBoxBot errors
function cmdCrsRefInfoBx(arrI,crsI,cmdStr) {
	var valNew = glbChgSetData[arrI].valNew;
	var txtNm = glbChgSetData[arrI].txtNm.toLowerCase();
	var crsVal = glbChgSetData[crsI].valCur;  // .valCur of cross-referenced variable
	var crsNm = glbChgSetData[crsI].txtNm.toLowerCase();
	var wndSz = parseInt(window.innerHeight);
	var valMax = wndSz - 370 - crsVal;
	txtMsg = "The value for \"" + txtNm + "\" (" + valNew + ") in the URL-command, \"";
	txtMsg += cmdStr + "\" probably is too large, since the viewer\'s window size is ";
	txtMsg += wndSz + " and the value for \"" + crsNm + "\" is " + crsVal;
	txtMsg += ".  Some of the viewer\'s boxes may not display correctly ";
	if (valMax >= 0) {
		txtMsg += "with the value of \"" + txtNm + "\" set to more than " + valMax;
		}
	else { txtMsg += "with this combination of settings"; }
	txtMsg += ".  After the window has finished loading, the value for \"" + txtNm;
	txtMsg += "\" can be changed using the \"Settings\"" + String.fromCharCode(160,8594,160);
	txtMsg += "\"Change Settings ...\" menu." + "\n\n  Click \"OK\" to use ";
	txtMsg += valNew + " as the value for \"" + txtNm + "\" (not recommended).";
	txtMsg += "\n  Click \"Cancel\" if you don\'t want to use this value.";
	return(txtMsg);
	}



