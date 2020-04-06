// jrscpProg.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpProg.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpProg.js)
//		- four PHP files
//	jrscpProg.js principally contains javascript functions that are involved in initialization
//		of the program when it loads, including communication with the server
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA



// jrscpProg.js contains the files the "main" files ... i.e.:
//	(1) those which are called prior to "initialization" of slideView
//	(2) those involved in communication with the server (e.g. Ajax functions)


//	  ********************************************************************************
//	  **************              Initialization FUNCTIONS               **************
//	  ********************************************************************************

	// On 12/15/19, the old "initialization" function, progLoadInit() was split into three separate
	//		functions:  prgInitWnd(), prgReInitWnd, and prgInitVar().
	//		that were sufficiently diverse to warrant splitting the old progLoadInit() function into
	//	The old function, progLoadInit(), had accreted multiple actions and it was becoming awkward to integrate
	//		these diverse actions into a single function (e.g., multiple "if" statements to determine if the
	//		the program had just been loaded or if we were returning from a "back to slide list" action).
	//		The old progLoadInit() was originally created (split from sldInitializeView())
	//		because FireFox doesn't reset all variables when the user click's FireFox's reload button,
	//		and on 8/21/19, I created progLoadInit() to initialize/ einitialize settings of variables that
	//		don't reset correctly when the program is reloaded.
	//		Between 9/12/19 - 10/29/19, this function was significantly modified to handle choosing slides
	//		from list, getting slide list from SQL database, handling command-line arguments, and
	//		re-initialization when a new slide was loaded after viewing a previous slide.
	//		Between 11/14/19 and 12/14/19, progLoadInit() also acquired the role of attaching EventListeners
	//		for touchevents to objects that needed to respond to a touchscreen.
	//	prgInitWnd():  this function andles when the program is first loaded.  These actions include:
	//		(1)	display of the copyright statement
	//		(2)	attaching EventListeners to existing HTML objects
	//		(3)	reading command-line:  NOTE: this change necessitated creating a separate function, prgReInitWnd()
	//				to handle re-initialization on "back to slide list" of some variables that also can be set by
	//				the command-line
	//		(4) calling either prgGetSldBasic() - if sldNum given on command line - or prgGetSldList().
	//	prgReInitWnd():  this function is called by sldClearSldVw() to reinitialize slide-specific variables that had been
	//		set for the previous slide and need to be reset before choosing the next slide.  Note that some settings
	//		(that are less slide-specific) will be inherited from the previous run.  It calls prgGetSldList() prior to exit.
	//	prgInitVar():  this function is called by both prgInitWnd() and prgReInitWnd() and sets/resets variables that
	//		need to be set by both functions.

	// prgInitWnd() initializes the program when the program is first loaded into the browser.
function prgInitWnd() {
	prgIntroResize();
		// display copryright box while everything else is loading
		// including borders cpyRtBox width = 455 & height = 230 ( + menu=36)
	document.getElementById("IntroPage").style.opacity = 0;  // intro page will fade-up under cpyRtBox
	var cpyRtBoxLeft = Math.round((parseInt(window.innerWidth) - 455)/2);
	var cpyRtBoxTop = Math.round((parseInt(window.innerHeight) - 266)/2);
	document.getElementById("cpyRtBox").style.left = cpyRtBoxLeft + "px";
	document.getElementById("cpyRtBox").style.top = cpyRtBoxTop + "px";
	document.getElementById("cpyRtBox").style.display ="block";
		// can assume glbCpyRtTimer is off when program is loaded
	glbCpyRtTimer.id = window.setInterval(prgCpyRtBxStrtFade,glbCpyRtDispTime);
			// add event listeners: global EventListners
	document.addEventListener("mouseup",tchMenuUnblock);
	document.addEventListener("touchstart",tchClrMenu);
			// add event listeners:  menu & navigator buttons
	tchMvBtnInit();
	tchWaitBtnInit();
	tchNoWaitBtnInit();
	tchClkBtnInit();
	tchMainMenuInit();
			// add event listeners:  warnBox
	document.getElementById("warnBox").addEventListener("touchstart",function() {tchWarnBox("touchstart",event);});
	document.getElementById("warnBox").addEventListener("touchend",function() {tchWarnBox("touchend",event);});
	document.getElementById("warnBox").addEventListener("touchcancel",function() {tchWarnBox("touchcancel",event);});
			// add event listeners:  infoBox move-buttons
	tchInfoBxMvInit();
		// initialize menu's etc.
	glbSldFBuf = 1;  // probably not necessary, but haven't tested on browser reload => inherited so not in prgInitVar() 
	glbSldFZBuf = 0;  // probably not necessary => inherited so not in prgInitVar()
		// display main menu items => inherited so not in prgInitVar()  => commented out on 12/19/19
//	document.getElementById("menuFP").style.display = "inline-block";
//	document.getElementById("menuZ").style.display = "inline-block";
//	document.getElementById("menuXPos").style.display = "inline-block";
//	document.getElementById("menuYPos").style.display = "inline-block";
			//NOTE: need to add menuMainSldNm here
		// set check boxes to match main-menu visibility => inherited, so not in prgInitVar()
	document.getElementById("menuSldNmVisCheckBx").checked = true;
	document.getElementById("menuFVisCheckBx").checked = true;
	document.getElementById("menuZVisCheckBx").checked = true;
	document.getElementById("menuXYVisCheckBx").checked = true;
			//NOTE: need to add menuSldNmVisCheckBx here
	prgInitVar();  // initialize slide-specific variables
			// adjust menu to fit screen 
			//	need to do this now in case there is a pause (e.g., error) while reading cmdLine
			//	will need to redo this after reading cmdLine in case sldNum or hide???? is in cmdLine
	prgMenuResize();
			// handle command-line arguments
	cmdLineRead();  // read command-line
			// if slide number has been specified (in command-line), don't display "back to slide list" on menu
			//		and skip to sldGetSldBasic().
			//		If (dbSldNum < 0),  cmdLineRead() generates an error message => so we don't need one here
			//	otherwise create & display list of available slides
	if ((Number.isInteger(dbSldNum)) && (dbSldNum > 0)) {
		document.getElementById("menuToSldList").style.display = "none";
		document.getElementById("sldSelBox").style.display = "none";
		prgGetSldBasic();
		}
	else {	// need to get slide number
			// need left border on "View" menu item if "Back to Slide List" menu item is present (but hidden)
		document.getElementById("menuViewDrpDwn").style.borderLeft="2px solid black";
		prgGetSldList();  // need to build slide list if 1st invocation and no sldNum given on command-line
		}
	prgMenuResize();  // need to check menu size after reading cmdline & adjusting "back to slide list"
			// NOTE:  NEED TO DEAL WITH HEIGHT OF INFO BOXES IF SCREEN IS < ~300px TALL
			//	NOTE:  glbInfoBxDefHt also is set by prgWindowResize:  NEED TO MOVE THIS TO SEPARATE FXN
	glbInfoBxDefHt = parseInt(window.innerHeight) - glbInfoBxDefTop - 6;  // default maximum height of infoBoxes
	return;
	}

	// When the user clicks the "back to slide list" button (<li id="menuToSldList">):
	//	(1)	First, sldClearSldVw() clears slideView by unloading the previous slide from sldVw[] (and sldBndBox)
	//			destroying any slideView planes in the destruction/purgatory arrays, and clearing the cache.
	//	(2)	Second prgReInitWnd() is called to re-initialize global slide-related variables and to reload IntroPage
	// prgReInitWnd() does NOT deal with slideView (this is done by sldClearSldVw()
	//	This function deals with settings that will be "inherited" by the new slide.
	//	The function calls prgInitVar() to handle (mainly slide-specific) variables that need to be reset now, 
	//		but that also are set when the program is first loaded.
function prgReInitWnd() {
			// display IntroPage
	if (!Number.isNaN(glbCpyRtTimer.id)) {  // timer should be off, but turn it off if it isn't;
		window.clearInterval(glbCpyRtTimer.id);
		glbCpyRtTimer.id = Number.NaN;
		}
	// IntroPage opacity is set in sldClearSldVw() before displaying IntroPage	
			// If a new (second) slide is loaded into viewer (using a call from <li id="menuToSldList">)
			//		most viewer settings (controlled by "Change Settings" box or command-line arguments)
			//		from previous slide are are retained (so user doesn't have to reload settings)  
			//	However if previous slide had only 1 focal plane, then the viewer would have automatically
			//		changed glbSldFBuf & glsSldFZBuf when disabliing focusing.  In this case, we need to
			//		reset these controls to the default values.
	if ((!Number.isNaN(dbMaxF)) && (dbMaxF <= 1)) {
		glbSldFBuf = 1;
		glbSldFZBuf = 0;
		}
			// similarly, if the "Back to Slide List" button is clicked while focusing is disabled
			//		then the values for glbSldFBuf & glbSldFZBuf are stored in glbOldFBuf & glbOldFZBuf
	else if ((!Number.isNaN(dbMaxF)) && (glbFDisabled)) {
		if (!Number.isNaN(glbOldFBuf)) { glbSldFBuf = glbOldFBuf; }
		else { glbSldFBuf = 1; }
		if (!Number.isNaN(glbOldFZBuf)) { glbSldFZBuf = glbOldFZBuf; }
		else { glbFZBuf = 0; }
		}
			// visibility of menuInfoItems on main menu are inherited unless the item
			//	had been automatically hidden because previous slide was a single focal plane
	if (Number.isNaN(dbMaxF) || (dbMaxF == 1)) {  // don't display if turned-off by user on previous slide
		document.getElementById("menuFP").style.display = "inline-block";
		document.getElementById("menuFVisCheckBx").checked = true;
		prgMenuResize();  // menu size might have changed
			// prgIntroResize() assumes menu is 2-lines so we don't need to recalculate
			//	IntroPage or infoBox sizes when menu is resized.
		}
		// "menuZ" & "menuZVisCheckBx" are inherited => don't reset
		// "menuXPos", "menuYPos", and "menuXYVisCheckBx" are inherited => don't reset
	prgInitVar();  // initialize slide-specific variables
		// "back to slide list" button is hidden when slide list is displayed
	document.getElementById("menuToSldList").style.visibility = "hidden";
		// prgGetSldList() tests whether list exists before Ajax call
	prgGetSldList();  // this will result in display of the slide list in sldSelBox.
	return;
	}


	// prgInitVar() initializes or re-initializes (mainly slide-specific) variables that are set by both
	//		prgInitWnd(), when program is first loaded by the browser, and by
	//		prgReInitWnd(), which is called when the "back to slide list" button is clicked
	//	NOTE:  this function must come BEFORE call to cmdLineRead()
function prgInitVar() {
	waitBoxClose();  // reinitialize waitBox
	if (sldVw.length > 0) {sldClearSldVw(); }  // just in case a browser does something stupid on reload
		//	If program had been in a "wait" interrupt, need to clear this interrupt.
		//	This unwinding of the "wait" interrupt is here because I'm not certain of what a 
		//		browser would do if the program was reloaded during a "wait" state
		//	Once sldVw[] has been destroyed any outstanding "onLoad" interrupts to sldImgLoaded()
		//		will return without generating a call to sldUnWait().  
	glbWait = false;
	glbWaitAct = "";
	if (!Number.isNaN(glbAjxTimer)) { // need to stop the "wait" timeout timer
		window.clearTimeout(glbAjxTimer);
		glbAjxTimer = Number.NaN;
		}
	if (!Number.isNaN(glbTchWaitMenuTimer.id)) { tchWaitMenuIconOff(); }
	if (!Number.isNaN(glbTchWaitIconTimer.id)) { tchClkIconEnd(); }
	glbTchMvArr.splice(0); // splice(0) removes entire array => next 2-finger movement becomes start of movement 
				// initialize mouse-wheel => need this; this misbehaved on browser reload
	glbMusWheelFZ = "z";
	sldMusWheelSelect(null,glbMusWheelFZ);  // initialize the mouse-wheel selection radio-boxes
			// initialize values for main menu
				//	display of main menu-items controlled by prgInitWnd() & prgReInitWnd()
	document.getElementById("menuMainSldNmTxt").innerHTML = "&nbsp;"
	document.getElementById("menuSldFP").innerHTML = "&nbsp;";
	document.getElementById("menuSldFPTot").innerHTML = '(<font size="-1">&nbsp;&nbsp;&nbsp;</font>)';
	document.getElementById("menuSldZ").innerHTML = "&nbsp;"
	document.getElementById("menuSldZTot").innerHTML = '(<font size="-1">&nbsp;&nbsp;&nbsp;</font>)';
			// initialize buttons/info boxes in "View menu.
				// "Show Focal Plane on Menu" is hidden if dbMax==1 on previous slide
	document.getElementById("menuFMenuVis").style.display = "block"; // must reset if previous dbMax==1
			// values for checkboxes for main-menu info boxes can be inherited; these must be handled
			//		by prgInitWnd() & prgReInitWnd()
			// navigator and creditbox are always visible when slideView loads
	document.getElementById("menuNavVisCheckBx").checked = true;
	document.getElementById("menuNavVisCheckBx").disabled = true;
	document.getElementById("menuCreditCheckBx").checked = true;
	document.getElementById("menuCreditCheckBx").disabled = true;
			// make sure that text for menu items involving move buttons are correctly set for
			//		current move direction (which is NOT reset when a new slide is chosen)
	menuSetMvArrowDir();
			// even though the following buttons probably are handled correctly on
			//	browser reload, we'll handle them here because they always should
			//	be turned-on when a new slide is loaded
	document.getElementById("menuViewFDiv1").style.display = "block";
	document.getElementById("menuMusWheelSel").style.display = "block";
	document.getElementById("menuNoF").style.display = "none";
	document.getElementById("menuFBtn12").style.display = "block";
	document.getElementById("menuFBtn22").style.display = "block";
			//sldClearSldVw() stops timer & resets menuFocStart/StopCycle
			//	but doesn't handle dbMaxF == 1 case
	document.getElementById("menuFocStartCycle").style.display = "block";
	document.getElementById("menuFocStopCycle").style.display = "none";
	document.getElementById("menuRealignFoc").style.display = "block";
	document.getElementById("menuViewFDiv2").style.display = "block";
			// "Slide Info" menu
		// If a second slide is loaded into viewer (using a call from <li id="menuToSldList">),
		//	then need to remove old contents of slideInfo menu info boxes in both drop-down menu,
		//	so the boxes appear empty until a new slide is loaded.  Also reset F-boxes hidden if dbMaxF == 1
	document.getElementById("menuSldNumVal").innerHTML = "&nbsp;";
	document.getElementById("menuSldNameVal").innerHTML = "&nbsp;";
	document.getElementById("menuTissueVal").innerHTML = "&nbsp;";
	document.getElementById("menuSpeciesVal").innerHTML = "&nbsp;";
	document.getElementById("menuStainVal").innerHTML = "&nbsp;";
	document.getElementById("menuDrpDwnFP").style.display = "block";  // needed if dbMaxF == 1 on previous slide
	document.getElementById("menuDrpDwnFPVal").innerHTML = "&nbsp;";
	document.getElementById("menuDrpDwnFPTot").innerHTML = '&nbsp;(<font size="-1">&nbsp;&nbsp;&nbsp;</font>)';
	document.getElementById("menuFStp").style.display = "block";  // needed if dbMaxF == 1 on previous slide
	document.getElementById("menuFStpVal").innerHTML = "&nbsp;";
	document.getElementById("menuDrpDwnZVal").innerHTML = "&nbsp;";
	document.getElementById("menuDrpDwnZTot").innerHTML = '&nbsp;(<font size="-1">&nbsp;&nbsp;&nbsp;</font>)';
	document.getElementById("menuDDZMagVal").innerHTML = "&nbsp;";
	document.getElementById("menuDDZMag").style.display = "block"; // can be hidden if magnification not defined
	document.getElementById("menuFocX").innerHTML = "&nbsp;";
	document.getElementById("menuFocY").innerHTML = "&nbsp;";
			// "Settings" menu
		// if a new slide is loaded into viewer (using a call from <li id="menuToSldList">) and previous
		//	slide had dbMaxF == 1 or focus disabled, then need to re-display focus controls
	document.getElementById("menuZFLiimit").style.display = "block";
	document.getElementById("menuFDef").style.display = "block";
	document.getElementById("menuFChgSet").style.display = "block";
	document.getElementById("menuEnDisableF").style.display = "block";
	document.getElementById("menuEnDisableF").innerHTML = "Disable focusing";  // see below for glbFDisabled = false
	document.getElementById("menuSetFDiv1").style.display = "block";
			// navigator is hidden until slideView is initialized in sldInitializeView()
			//	this is necessary if new slide is loaded into viewer (using a call from <li id="menuToSldList">)
			//		but it's safer to always do this
	document.getElementById("sldNavigator").style.display = "none";
			// initialize / re-initialize slide-specific values => probably only necessary for calls from
			//		<li id="menuToSldList"> but it isn't expensive, so it's safer to do it regardless
	if (sldVw.length > 0) {
		alert("  Warning:   progInitVar()" 
				+ "\nsldVw[] has length > 0 on initialization (length = "
				+ sldVw.length + ")."
				+ "\The virtual-microscope viewer probably will function correctly,"
				+ "\n  but please report this bug.");
		sldVw.splice(0);  // splice(0) removes entire array
		}
	sldVwI = Number.NaN;
		// set or reset slide-specific variables.
	dbSldNum = Number.NaN;
	dbSldName = "";
	dbMaxF = Number.NaN;
	dbRoot = "";
	dbLblPath = "";
	dbMaxZ = Number.NaN;
	glbVwFocX = Number.NaN;
	glbVwFocY = Number.NaN;
	glbSldStrtF = Number.NaN;
	glbOldFBuf = Number.NaN;
	glbSldMaxF = Number.NaN;
	glbFDisabled = false;
	glbOldFZBuf = Number.NaN;
	glbSldFDef = Number.NaN;
	glbOldFDef = Number.NaN;
	glbSldStrtZ = Number.NaN;
	glbSldZFLim = Number.NaN;
	glbOldZFLim = Number.NaN;
	if (glbFtoSV.length != 0) {glbFtoSV.splice(0); }  // splice(0) removes entire array
	if (glbZtoSV.length != 0) {glbZtoSV.splice(0); }  // splice(0) removes entire array
	return;
	}


	// prgIntroResize() adjusts the size of the elements on IntroPage to fit the user's screen
function prgIntroResize(){
	var pgNode = document.getElementById("IntroPage");
	var txtNode = document.getElementById("intPgTxt");
	txtNode.style.fontSize = "100px";
	var imgNode = document.getElementById("intPgSeal");
		// initial size of elements
	var menuHt = 68;  // 2 * height of single row of menu
			// it isn't clear to me why we need to subtract 8px from the window width
			//	but any pgWidth more than this gets a scroll bar
	var pgWidth = parseInt(window.innerWidth) - 8;
	var pgHeight = parseInt(window.innerHeight) - menuHt;
	pgNode.style.height = pgHeight + "px";
	pgNode.style.top = menuHt + "px";
	pgNode.style.width = pgWidth + "px";

	var txtHt = parseInt(txtNode.style.fontSize);  // "txtHt = txtNode.offsetHeight;" gave weird results
	var txtWd = txtNode.offsetWidth;
	var imgSz = 500;  // default size of image of seal is square: height = width
//	var imgSz = parseInt(imgNode.style.height);  // image of seal is square: height = width
		// There is a problem that "top = 0px" for txtNode places the text ~80-100px below the top of
		//	IntroPage.  This space decreases as font-size decreases, and it looks like (for reasons that are NOT
		//	clear to me) that this is space for an extra line above the line of text (txtNode).
		//	Thus, I think we can hold the minimum top of the text constant by setting "top = minTop - txtHt"
		//	where "minTop is the "true" minimum (~120px) position.
		// Extra vertical space (extSpc = pgHeight - (minTop + txtHt + imgHt) will be divided into four equal chunks:
		//		curMargin = extSpc/4; 
		//		one of these will be added to minTop to set top of txtNode: txtNode.top = (minTop - txtHt) + curMargin
		//		one will be added between txtNode and imgNode:  
		//			imgNode.top = bottom of txtNode + curMargin = top of txtNode + txtHt + curMargin
		//						= ((minTop - txtHt) + curMargin)) + txtHt + curMargin
		//						= minTop + 2*curMargin
		//		two will be added below seal:
		//			  totHt	= (minTop - txtHt) + txtHt + imgSz + (4*curMargin)
		//					= minTop + imgSz + (4*curMargin)

			// get horizontal spacing
	var dblHorMargin = 40;  // twice minimal horizontal margin of 20px
	var curMargin = 40;  // starting point for vertical spacing between elements
			// set width
	while (((txtWd + dblHorMargin) > pgWidth) && (txtHt >= 50)) {
		txtHt -= 10;  // 10 = 10% of 100px
		txtNode.style.fontSize = txtHt + "px";
		txtWd = txtNode.offsetWidth;
		imgSz -= 40;  // 50 = 10% of 500px
		curMargin -= 4;  // 4 = 10% of 40px
		}
			// check total height
	var minTop = 120;  
	var totHt = minTop + imgSz + (4 * curMargin);  // current height of page
	if (totHt < pgHeight) {  // screen too tall; increase vertical margins to fill total height
		curMargin = Math.floor((pgHeight - (minTop + imgSz))/4);
		}
	else if (totHt > pgHeight) {  // screen to short; decrease size of txt & img
		while ((totHt > pgHeight) && (txtHt >= 50)) {
			txtHt -= 10;  // 10 = 10% of 100px
			imgSz -= 40;  // 50 = 10% of 500px
			if (curMargin >= 20 ) { curMargin -= 4; }  // 4 = 10% of 40px
			totHt = minTop + imgSz + (4*curMargin);
			}
				// increase curMargin to re-center
		curMargin = Math.floor((pgHeight - (minTop + imgSz))/4);
		}
	txtNode.style.fontSize = txtHt + "px";
	txtWd = txtNode.offsetWidth;
	var curLeft = Math.round((pgWidth - txtWd)/2);
	txtNode.style.left = curLeft + "px";
	txtNode.style.top = (minTop - txtHt + curMargin) + "px";
	curLeft = Math.round((pgWidth - imgSz)/2);
	imgNode.style.height = imgSz + "px";
	imgNode.style.width = imgSz + "px";
	imgNode.style.left = curLeft + "px";
	imgNode.style.top = (minTop + (2*curMargin)) + "px";
	return;
	}



	// originally, sldResizeSldVw() handled window resizing => <body ... onResize="sldResizeSldVw()">
	//	but this isn't satisfactory once the menu can be multiline and we have a "back to IntroPage" option
	//	We want to keep sldResizeSldVw() as a separate free-standing function, because it also is called if the
	//	tile-buffer setting is changed (which changes the size of slideView planes without changing the size
	//	of anything else).  Thus, on 11/13/19, we created prgWindowResize() as an intermediary between changing
	//	window size (the onResize command) and the functions that adjust sldBndBox (sldResizeSldVw) and 
	//	IntroPage & other box (prgScrResize()) sizes.
function prgWindowResize() {
	prgMenuResize();  // resize menu
		// NEED TO WRITE FUNCTION TO ADJUST SIZE/LOCATION OF other BOXES & IntroPage items
			// NOTE:  NEED TO DEAL WITH HEIGHT OF INFO BOXES IF SCREEN IS < ~300px TALL
			//	NOTE:  glbInfoBxDefHt also is set by prgWindowResize:  NEED TO MOVE THIS TO SEPARATE FXN
	glbInfoBxDefHt = parseInt(window.innerHeight) - glbInfoBxDefTop - 6;  // default maximum height of infoBoxes
	if (document.getElementById("sldBndBox").style.display == "block") {
		sldResizeSldVw();
		}
	else { prgIntroResize(); }
	return;
	}

	// prgMenuResize() is called on initialization and whenever either the browswer window is resized or the
	//	elements on the menu are changed.  The program
	//	(1)	calculates the size of the menu, and compares this to the size of the window
	//	(2)	if necessary:
	//		(a) changes the menu to either one or two lines
	//		(b) changes glbMenuTotHt
	//	(3)	returns true if number of menu lines was changed, returns false if number of lines was unchanged
	// NOTE: the widths of most menu items are specified as min-width, so menu width calculation could be an
	//		underestimate ... hence the addition of wdthBuffer
function prgMenuResize() {
	var i;
	var oldMenuHt = glbMenuTotHt;  // height of menu before resize
	var newMenuHt;
	var htMenuLine = 32;	// height of a single menu line
	var wdthBuffer = 10;	// minimum separation between DrpDwn elements and inline info elements
	var wdthDrpDwn = 90;	// width of DrpDwn menu button
	var numDrpDwn = 4;		// number of DrpDwn menu buttons
	var mnuVarItm = [		// array of menu items that can be turned on/off
			{node: document.getElementById("menuToSldList"), wdth: 98},
			{node: document.getElementById("menuYPos"), wdth: 114},
			{node: document.getElementById("menuXPos"), wdth: 114},
			{node: document.getElementById("menuZ"), wdth: 184},
			{node: document.getElementById("menuFP"), wdth: 185},
			{node: document.getElementById("menuMainSldNm"), wdth: 162}
			];
			// if information menu window had been automatically hidden
			//	then reset display to empty string
	if (prgIsMenuHidden(100)) {  // slideName window hidden
		mnuVarItm[5].node.style.display = "";
		document.getElementById("menuSldNmVisCheckBx").checked = true;
		glbMenuAutoHide -= 100;
		}
	if (prgIsMenuHidden(10)) {  // F-window hidden
		mnuVarItm[4].node.style.display = ""; 
		document.getElementById("menuFVisCheckBx").checked = true;
		glbMenuAutoHide -= 10;
		}
	if (prgIsMenuHidden(1)) {  // Z-window hidden
		mnuVarItm[3].node.style.display = "";
		document.getElementById("menuZVisCheckBx").checked = true;
		glbMenuAutoHide -= 1;
		}
				// adjust width of "menuMainSldNm" box
	mnuVarItm[5].wdth += mnuVarItm[5].node.offsetWidth - mnuVarItm[5].wdth;
	var scrWidth = parseInt(window.innerWidth) - 4;  // width of screeen less 2px border
			// calculate width of menu
			//	prgInitWnd() sets display for all of items except "back to slide list
	var wdthMenu = (numDrpDwn * wdthDrpDwn) + wdthBuffer + 4;  // these items always are on menu
		// if Menu2 is wider than screen width, remove name, FP, Z to make it fit
	var actWdthMenu2 = 0;  // used to calculate actual width of menu2
	for (i = 0; i < mnuVarItm.length; i++) {
		if (mnuVarItm[i].node == null) {
			alert("prgMenuResize():  node for menu-item #" + i + " is NULL."
					+ "\n  Cannot set menu size.  This may be a fatal error."
					+ "\n  Please report this bug.");
			return;
			}
		if (mnuVarItm[i].node.style.display != "none" ) {
			wdthMenu += mnuVarItm[i].wdth;
			if (i > 0) { actWdthMenu2 += mnuVarItm[i].wdth; }
			}
		}
			// style.display == "" if menu item is being displayed by default
			// remove slide name from menu if menu is too large && not set by user
	if ((actWdthMenu2 > scrWidth) && (mnuVarItm[5].node.style.display == "")) {
		mnuVarItm[5].node.style.display = "none";
		actWdthMenu2 -= mnuVarItm[5].wdth;
		wdthMenu -= mnuVarItm[5].wdth;
		document.getElementById("menuSldNmVisCheckBx").checked = false;
		glbMenuAutoHide += 100;  // mark as automatically hidden
		}
			// remove focal plane from menu if menu is too large && not set by user
	if ((actWdthMenu2 > scrWidth) && (mnuVarItm[4].node.style.display == "")) {
		mnuVarItm[4].node.style.display = "none";
		actWdthMenu2 -= mnuVarItm[4].wdth;
		wdthMenu -= mnuVarItm[4].wdth;
		document.getElementById("menuFVisCheckBx").checked = false;
		glbMenuAutoHide += 10;  // mark as automatically hidden
		}
			// remove zoom level from menu if menu is too large && not set by user
	if ((actWdthMenu2 > scrWidth) && (mnuVarItm[3].node.style.display == "")) {
		mnuVarItm[3].node.style.display = "none";
		actWdthMenu2 -= mnuVarItm[3].wdth;
		wdthMenu -= mnuVarItm[3].wdth;
		document.getElementById("menuZVisCheckBx").checked = false;
		glbMenuAutoHide += 1;  // mark as automatically hidden
		}
			// calculate width of Menu1
	var wdthMenu1 = (numDrpDwn * wdthDrpDwn) + wdthBuffer + 2;  // width of 1st half of menu, without "back to slide list"
	if (mnuVarItm[0].node.style.display != "none") {
		wdthMenu1 += mnuVarItm[0].wdth;
		}
	var nodeMenu1 = document.getElementById("menuMain1");
	var nodeMenu2 = document.getElementById("menuMain2");
			// currently menu is EITHER 1 or 2 lines, have NOT adapted for screens < 600px
	if (scrWidth < wdthMenu) {  // menu is too big to fit on one line
		newMenuHt = (htMenuLine * 2) + 2; // menu is two lines + 2px for bottom border
			//reset menu1 (left side of menu)
		nodeMenu1.style.border = "2px solid black";
		nodeMenu1.style.width = "100%";
			// reset menu2 (right side of menu)
		nodeMenu2.style.border = "2px solid black";
		nodeMenu2.style.width = "100%";
		nodeMenu2.style.top = htMenuLine + "px";;
		nodeMenu2.style.left = "0px";;
		}
	else { // menu fits on one line
		newMenuHt = htMenuLine + 2; // 2px for bottom border
			//reset menu1 (left side of menu)
			document.getElementById("menuMain1").style.borderLeft
		nodeMenu1.style.borderRight = "0px";
		nodeMenu1.style.width = (wdthMenu1 + 2) + "px";
			// reset menu2 (right side of menu)
		nodeMenu2.style.borderLeft = "0px";
		nodeMenu2.style.width = (scrWidth - wdthMenu1 + 2) + "px";
		nodeMenu2.style.top = "0px";;
		nodeMenu2.style.left = (wdthMenu1 + 2) + "px";
		}
	glbMenuTotHt = newMenuHt;
	return(true);  // returns true if menu height was changed
	}
		
	//prgIsMenuAutoHide() deconvolutes glbMenuAutoHide to determine if one of the main-
	//		menu information windows was automatically hidden.  It returns true if 
	//		the window corresponding to wndInt was automatically hidden and returns
	//		false otherwise.  The values for wndInt are:
	//	100 => "menuMainSldNm" had been automatically hidden
	//	10 => "menuFP" had been automatically hidden
	//	1 => "menuZ" had beeb automatically hidden
function prgIsMenuHidden(wndInt) {
	if (glbMenuAutoHide == 0) {return(false);}  // no windows were automatically hidden
	var curVal = parseInt(glbMenuAutoHide/wndInt);
	curVal = parseInt(curVal - (parseInt(curVal/10) * 10));  
	if (curVal == 1) {
		return(true);
		}
	if (curVal != 0) {
		alert("prgIsMenuHidden():  calculated an illegal value (\"" + curVal 
				+ "\").  Only 0 or 1 are legal values.\n  Please report this error.");
		}
	return(false);
	}

//	  ****************************************************************************
//	  **************             Command-line FUNCTIONS             **************
//	  ****************************************************************************

		// cmdReadCmdLine() parses any options listed on the command-line
		//	first option must be preceded by "?" (or %3f)
function cmdLineRead() {
	var i;
	var tgtNode;  // working variable to hold node that is the target of the command
	var errCnt = 0;   // index counting errors for alert() warning.  Make this alert() into a jrAlert
	var errStr = "The following errors were encountered when reading the command-line:";  // string for alert warning
			// All of the elements within cmdArg initially are set to NaN regardless
			//	of the actual type of variable (we can take advantage of javascript's
			//		loose handling of variable types here).
			//	Any element specified by the command-line will cease to be NaN, so we
			//		can test if the command-line chnaged an element with Number.isNan()
	var cmdArg = {  // array to hold results from reading command-line
			sldNum: Number.NaN, 
			f: Number.NaN, 
			z: Number.NaN,
			x: Number.NaN,
			y: Number.NaN,
			hideNav: Number.NaN,
			hideName: Number.NaN,
			hideF: Number.NaN,
			hideZ: Number.NaN,
			hideXY: Number.NaN,
			fDisabled: Number.NaN,
			muteBell: Number.NaN,
			hideLogo: Number.NaN
			};
	var cmdLine = document.URL.toLowerCase().replace(/%3f/g,"?"); // holds the unparsed command-line
	var cmdI = cmdLine.indexOf("?");
	if (cmdI <= 0) {  // no command-line arguments
		return;
		}
	cmdLine = cmdLine.slice(cmdI+1);  // remove 1st "?" and everything preceeding
	cmdLine = cmdLine.replace(/%23/g,"&");  // convert encoded "ampersands" to the real thing
	cmdLine = cmdLine.replace(/%5c/g,"\\");  // convert endcoded backslashes to the real thing.
	cmdLine = cmdLine.replace(/%3d/g,"=");  // convert endcoded backslashes to the real thing.
	cmdLine = cmdLine.replace(/%20/g," ");  // convert endcoded backslashes to the real thing.
			// to prevent treating an escaped backslash (two backslashes ="\\\\") 
			//		as part of an escaped "&" or "?", convert two backslashes into one "%5c"
	cmdLine = cmdLine.replace(/\\\\/g,"%5c");  // convert encoded backslashes to the real thing.
	cmdLine = cmdLine.replace(/\\&/g,"%23");  // convert escaped "\&" ("\\&") into "%23"
	cmdLine = cmdLine.replace(/\\\?/g,"%3f");  // convert escaped "\?" ("\\?") into "%3f"
	cmdLine = cmdLine.replace(/ /g,"");  // remove whitespace
			// command-line arguments should be separated by "&", but we've relaxed the requirement
			//		so that "?" also can separate the arguments.  Need to replace "?" with "&"
	cmdLine = cmdLine.replace(/\?/g,"&");  // Replace "?" with "&"
	cmdStrArr = cmdLine.split("&");
			// decode escaped characters
	for (i = 0; i < cmdStrArr.length; i++) {
		cmdStrArr[i] = cmdStrArr[i].replace(/%5c/g,"\\").replace(/%23/g,"&").replace(/%3f/g,"?");
		}
	var cmdStr = "";  //string to hold identifier part of commane-line argument
	var cmdVal = "";  //string to hold value part of commane-line argument
	var cmdInt;  // variable to hold cmdVal when converted into an integer
	for (i = 0; i < cmdStrArr.length; i++) {
		cmdI = cmdStrArr[i].indexOf("=");
		if (cmdI <= 0) {  // no "=" in string
			cmdStr = cmdStrArr[i];
			cmdVal = "";
			}
		else {
			cmdStr = cmdStrArr[i].slice(0,cmdI);
			cmdVal = cmdStrArr[i].slice(cmdI+1);
			}
		cmdInt = parseInt(cmdVal);
		if (cmdVal == "true") { cmdInt = 1; }
		else if (cmdVal == "false") { cmdInt = 0 };
			// for "slide initialization values", we don't know if the number is valid until
			//	basic slide data is retrieved (in sqlSldBasics() for dbSldNum, dbSldStrtF, and
			//	dbSldStrtZ, or until initializtion (in sldInitializeView() for glbVwFocX,Y.
			//	For these variables, the switch below checks for a positive integer, but the
			//	rest of the value-checking is deferred until later.
		switch (cmdStr) {
			case "slide" :  // specifies slide number
				if ((Number.isInteger(cmdInt)) && (cmdInt > 0)) {dbSldNum = cmdInt; }
				else { cmdArg.sldNum = cmdVal; }
				break;
			case "f" :   // specifies initial focal plane
				if ((Number.isInteger(cmdInt)) && (cmdInt >= 0)) {glbSldStrtF = cmdInt; }
				else { cmdArg.f = cmdVal; }
				break;
			case "z" :   // specifies intial zoom-levelt
				if ((Number.isInteger(cmdInt)) && (cmdInt >= 0)) {glbSldStrtZ = cmdInt; }
				else { cmdArg.z = cmdVal; }
				break;
						// specifies initial x,y (specimen) pixel-values for center of screen
			case "y" :
				if ((Number.isInteger(cmdInt)) && (cmdInt >= 0)) {glbVwFocY = cmdInt; }
				else { cmdArg.y = cmdVal; }
				break;
			case "x" :
				if ((Number.isInteger(cmdInt)) && (cmdInt >= 0)) {glbVwFocX = cmdInt; }
				else { cmdArg.x = cmdVal; }
				break;
					// for most display-commands, the command is to "hide" so 'true' means
					//	to hide and 'false' means to show ... which is opposite of whether
					//	the check-box is checked 
			case "hidenav" :   // hides navigator
			case "hidenavigator" :
						// since navigator is hidden until slideView is initialized
						//	can't use menuSetVisChkBx(); instead see extra code in sldInitializeView
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or HideNav == true
					document.getElementById("menuNavVisCheckBx").checked = false;
					}
				else if (cmdInt == 0) {
					document.getElementById("menuNavVisCheckBx").checked = true;
					}
				else { cmdArg.hideNav = cmdVal; }
				break;
			case "hidesldnm" :  // hides "slide name" info window on menu
			case "hideslidename" :  // hides "slide name" info window on menu
			case "hidenm" :  // hides "slide name" info window on menu
			case "hidename" :  // hides "slide name" info window on menu
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or HideName == true
					document.getElementById("menuSldNmVisCheckBx").checked = false;
					document.getElementById("menuMainSldNm").style.display = "none";
					}
				else if (cmdInt == 0) {
					document.getElementById("menuSldNmVisCheckBx").checked = true;
					document.getElementById("menuMainSldNm").style.display = "inline-block";
					}
				else { cmdArg.hideName = cmdVal; }
				break;
			case "hidef" :  // hides "focal plane" info window on menu
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or HideF == true
					document.getElementById("menuFVisCheckBx").checked = false;
					document.getElementById("menuFP").style.display = "none";
					}
				else if (cmdInt == 0) {
					document.getElementById("menuFVisCheckBx").checked = true;
					document.getElementById("menuFP").style.display = "inline-block";
					}
				else { cmdArg.hideF = cmdVal; }
				break;
			case "hidez" :
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or HideZ == true
					document.getElementById("menuZVisCheckBx").checked = false;
					document.getElementById("menuZ").style.display = "none";
					}
				else if (cmdInt == 0) {
					document.getElementById("menuZVisCheckBx").checked = true;
					document.getElementById("menuZ").style.display = "inline-block";
					}
				else { cmdArg.hideZ = cmdVal; }
				break;
			case "hidexy" :
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or HideXY== true
					document.getElementById("menuXYVisCheckBx").checked = false;
					document.getElementById("menuXPos").style.display = "none";
					document.getElementById("menuYPos").style.display = "none";
					}
				else if (cmdInt == 0) {
					document.getElementById("menuXYVisCheckBx").checked = true;
					document.getElementById("menuXPos").style.display = "inline-block";
					document.getElementById("menuYPos").style.display = "inline-block";
					}
				else { cmdArg.hideXY = cmdVal; }
				break;
			case "fdisable" :
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or fdisable == true
					glbFDisabled = true;
					document.getElementById("menuEnDisableF").innerHTML = "Enable focusing";
					}
				else if (cmdInt == 0) {
					glbFDisabled = false;
					document.getElementById("menuEnDisableF").innerHTML = "Disable focusing";
					}
				else { cmdArg.fDisabled = cmdVal; }
				break;

			case "mutebell" :
				if ((cmdI <= 0) || (cmdInt == 0) || (cmdInt == 1)) { // valid entry
					tgtNode = document.getElementById("warnBell");
						// menuSetBell() toggles bell
						//	to turn bell on, set mute=true (bell off) before calling menuSetBell() 
						//	to turn bell off, set mute=false (bell on) before calling menuSetBell() 
					if (cmdInt == 0) { tgtNode.muted = true; }
					else { tgtNode.muted = false; }
					menuSetBell();
					}
				else { cmdArg.muteBell = cmdVal; }
				break;
			case "hidelogo" :  // cuts short display of copyright box
				if ((cmdI <= 0) || (cmdInt == 1)) {  // either no modifier or fdisable == true
					prgCpyRtBxClose();
					}    // don't do anything if hidelogo false
				else if (cmdI != 0) {cmdArg.hideLogo = cmdVal};
				break;
			// NEED TO ADD CODE TO DEAL WITH chgSetting values HERE
			default :
					// test for slide number without anything else
				if (cmdI <= 0) { cmdInt = parseInt(cmdStr); }  // doesn't contain "=", try to make cmdStr into integer
				if ((cmdI <= 0) && (Number.isInteger(cmdInt)) && (cmdInt > 0)) {
					dbSldNum = cmdInt;
					}
				else {
					errCnt++;
					errStr += "\n " + errCnt + ":  Did not recognize the command \"" + cmdStr;
					if (cmdI > 0) {
						errStr += "\" in the command-line argument:  \"" + cmdStrArr[i] + "\".";
						}
					else { errStr += "\"."; }
					errStr += "\n       This command was ignored.";
					}
			}  // end switch
		}  // end for loop through cmdStrArr
	cmdErrors(cmdArg, errCnt, errStr);
	return;
	}

		//cmdErrors() is passed:
		//	(1) an object (cmdArg) a list of cmdStr variables; if !NaN, variable contains a string
		//			that couldn't be interpreted as  part of a valid command-line arguemnet
		//	(2) an integer (oldCnt) enumerating the number of command-line errors already encountered.
		//	(3)	a partially-completed string (oldStr) that contains the list of command-line errors
		//	Function reads through cmdArg and copies errors (if any) fromo cmdArg into a string (errStr) 
		//		and then calls alert() - NOTE: THIS SHOULD BE alertBoxCall - to display errors.
function cmdErrors(cmdArg, oldCnt, oldStr) {
	var errStr = oldStr;
	var errCnt = oldCnt
	if (!Number.isNaN(cmdArg.sldNum)) {
		errCnt++;
		errStr += cmdErrInt(false, errCnt, "slide", cmdArg.sldNum);
		}
	if (!Number.isNaN(cmdArg.f)) {
		errCnt++;
		errStr += cmdErrInt(true, errCnt, "f", cmdArg.f);
		}
	if (!Number.isNaN(cmdArg.z)) {
		errCnt++;
		errStr += cmdErrInt(true, errCnt, "z", cmdArg.z);
		}
	if (!Number.isNaN(cmdArg.y)) {
		errCnt++;
		errStr += cmdErrInt(true, errCnt, "y", cmdArg.y);
		}
	if (!Number.isNaN(cmdArg.x)) {
		errCnt++;
		errStr += cmdErrInt(true, errCnt, "x", cmdArg.x);
		}
	if (!Number.isNaN(cmdArg.hideName)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "hideName", cmdArg.hideName);
		}
	if (!Number.isNaN(cmdArg.hideNav)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "hideNavigator", cmdArg.hideNav);
		}
	if (!Number.isNaN(cmdArg.hideF)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "hideF", cmdArg.hideF);
		}
	if (!Number.isNaN(cmdArg.hideXY)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "hideXY", cmdArg.hideXY);
		}
	if (!Number.isNaN(cmdArg.fDisabled)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "FDisable", cmdArg.fDisabled);
		}
	if (!Number.isNaN(cmdArg.muteBell)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "muteBell", cmdArg.muteBell);
		}
	if (!Number.isNaN(cmdArg.hideLogo)) {
		errCnt++;
		errStr += cmdErrBool(errCnt, "hideLogo", cmdArg.hideLogo);
		}
	if (errCnt > 0) { alert(errStr);  } // NOTE THIS SHOULD BE MY alertBoxCall()
	return;
	}


function cmdErrInt(zeroOK, errNum, cmdStr, cmdVal) {
	var outStr = "\n " + errNum + ":  The command \"" + cmdStr + "=\"";
	outStr += " was followed by an illegal value (\"" + cmdVal +"\"). ";
	outStr += "The value should have been a ";
	if (zeroOK) { outStr += "non-negative"; }
	else {outStr += "positive"; }
	outStr += " integer.";
	outStr += "\n      This command was ignored.";
	return(outStr);
	}

function cmdErrBool(errNum,cmdStr,cmdVal) {
	var outStr = "\n " + errNum + ":  The command \"" + cmdStr + "=\"";
	outStr += " was followed by an illegal value (\"" + cmdVal +"\").";
	outStr += "\n      The value following \"" + cmdStr + "=\" must be";
	outStr += " \"true\" (\"1\") or \"false\" (\"0\").";
	outStr += "\n      This command was ignored.";
	return(outStr);
	}
		

//	  *********************************************************************************
//	  **************               Copyright Box FUNCTIONS               **************
//	  *********************************************************************************

	//prgCpyRtBxStrtFade() is called by timer set by prgInitWnd(). It starts the timer that causes 
	//	the copyright box to fade
function prgCpyRtBxStrtFade() {
		// stop timer
	if (!Number.isNaN(glbCpyRtTimer.id)) {  // timer should be off, but turn it off if it isn't;
		window.clearInterval(glbCpyRtTimer.id);
		glbCpyRtTimer.id = Number.NaN;
		}
	glbCpyRtTimer.id = window.setInterval(prgCpyRtBxFade,glbCpyRtFadeTime);
	}

	//prgCpyRtBxFade() is called repetitively by timer set by prgCpyRtBxStrtFade().  This
	//		function was rewritten on 11/11/19 with introduction of glbCpyRtExtFade.
	// glbCpyRtExtFade determines the overlap between fade-down of cpyRtBox and fade-up
	//		of IntroPage: 1-glbCpyRtExtFade is the opacity of cpyRtBox when IntroPage
	//		starts to fade-up.
	// At each cycle, this function:
	//	(1) checks to see if this is the last fade step ... if so it calls prgCpyRtBxClose()
	//		to stop timer, remove copyright box (display = none), and sets IntroPage opacity
	//	(2)	If opacity of cpyRtBx will be >0, fades copyright box by glbCpyRtFadeAmt.
	//		If cpyRtBox is completely faded, checks to see if IntroPage is displayed.
	//		If IntroPage is not displayed, then calls prgCpyRtBxClose() to terminate timer
	//	(3) If glbCpyRtTimer.fade (which includes extra fade time: glbCpyRtExtFade) < 1
	//			and IntroPage is displayed, then fade-up IntroPage. 
	//	(4)	Decrease  glbCpyRtTimer.fade by glbCpyRtFadeAmt
function prgCpyRtBxFade() {
	var curFade = glbCpyRtTimer.fade - glbCpyRtFadeAmt;  // new value for glbCpyRtTimer.fade
	if (curFade < (glbCpyRtFadeAmt/2)) { 
		prgCpyRtBxClose();
		return;
		}
			// fade-down cpyRtBox
	var cpyRtFade = curFade - glbCpyRtExtFade;  // value for cpyRtBx opacity
	if ((cpyRtFade >= 0) && (cpyRtFade <= 1)) {
		document.getElementById("cpyRtBox").style.opacity = cpyRtFade;
		}
	else if (cpyRtFade > 1) {
		alert("prgCprRtBxFade():  Illegal value (\"" + cpyRtFade 
				+ "\") for cpyRtFade.\n  Please report this bug.");
		document.getElementById("cpyRtBox").style.opacity = 1;
		}
		 // end cpyrRt fading if cpyRtBox completely faded & IntroPage not displayed
	else {
		if (document.getElementById("sldBndBox").style.display == "block")	{
			prgCpyRtBxClose();
			return;
			}
			// on first cycle with cpyRtFade < 0, set cpyRtBox opacity to 0
		if ((cpyRtFade + glbCpyRtFadeAmt) > 0) {
			document.getElementById("cpyRtBox").style.opacity = 0;
			}
		}
			// fade-up IntroPage
	var introFade = 1 - curFade;  // curFade includes glbCpyRtExtFade so this can be < 0
	var introPgOp = document.getElementById("IntroPage").style.opacity;
	if (document.getElementById("sldBndBox").style.display != "block") {
		if (introFade > introPgOp) {  // don't decrease opacity of IntroPage
			document.getElementById("IntroPage").style.opacity = introFade;
			}
		}
	glbCpyRtTimer.fade = curFade;
	return;
	}

	//prgCpyRtBxClose() closes cpyRtBox, makes IntroPage fully opaque, and kills timer
function prgCpyRtBxClose() {
	if (!Number.isNaN(glbCpyRtTimer.id)) { 
		window.clearInterval(glbCpyRtTimer.id);
		glbCpyRtTimer.id = Number.NaN;
		}
	glbCpyRtTimer.fade = 1 + glbCpyRtExtFade;
	document.getElementById("IntroPage").style.opacity = 1;
	document.getElementById("cpyRtBox").style.display = "none";
	document.getElementById("cpyRtBox").style.opacity = 1;
	return;	
	}

	// prgCpyRtBxStopFade() is called if the mouse is moved over cpyRtBox
	//	it stops timer and resets cpyRtBox opacity and glbCpyRtTimer.fade.  
	//	It does NOT change IntroPage opacity
function prgCpyRtBxStopFade() {
	if (!Number.isNaN(glbCpyRtTimer.id)) {  // turn-off timer
		window.clearInterval(glbCpyRtTimer.id);
		glbCpyRtTimer.id = Number.NaN;
		}
	document.getElementById("cpyRtBox").style.opacity = 1;
	glbCpyRtTimer.fade = 1;
	}
		

//	  *********************************************************************************
//	  **************              Get slide data FUNCTIONS               **************
//	  *********************************************************************************

		// if (glbSldSelListExists == false), prgGetSldList() generates the Ajax call to jrSQL_GetSldList.php,
		//		 which will return (to prgCreateSldList()) an array of slides currently in the database.
		//	if (glbSldSelListExists == true, which means that prgGetSldList()/prgCreateSldList() have already
		//		been called) then prgGetSldList() displays sldSelBox and returns without generating the
		//		Ajax request.
function prgGetSldList() {
	if (glbSldSelListExist) {
		document.getElementById("sldSelBox").style.display = "block";
		return;
		}
		// use Ajax to get slide list from server
	sldSetWaitCurs(); // set all cursors to "wait"
	glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
	var ajxReq = new XMLHttpRequest();
	ajxReq.onreadystatechange = function () {
		if ((this.readyState == 4) && (this.status == 200)) {
			sldResetWaitCurs();  // restore cursors to previous state
			window.clearTimeout(glbAjxTimer);
			glbAjxTimer = Number.NaN;
			prgCreateSldList(this);
			}
		}
	ajxReq.open("GET","../SQLphp/jrSQL_GetSldList.php",true);	
	ajxReq.send();
	return
	}

		// prgCreateSldList() is used by versions of the microscope viewer that display a list of slides 
		//		from which the user chooses the slide that will be displayed.  
		//	(1)	The function uses an array of slide-ID numbers (integers) listed in dbSldList to query the 
		//		server for the slide data.  These data are stored in a local array of java-script objects.
		//	(2)	The function then uses the data in the array to add rows to the table id="sldSelList".  
		//		The id's for each row begin with the slide-ID number, which can then be retrieved 
		//		by prgChooseSlide().

function prgCreateSldList(ajxReq) {
	
	var ajxRespTxt = ajxReq.responseText;
	if (ajxRespTxt.slice(0,3) == "SQL") {  // error messages from jrSQL_GetSldList.php begine with "SQL"
		alert("Unable to get list of slides from server!\n  " + ajxRespTxt);
		return;
		}
	var sldDataArr = JSON.parse(ajxRespTxt);
	var i;
	var j;
	var tabNode = document.getElementById("sldSelList");
	var rowNode;  //  "pointer" to 'tr' node (child of sldSelList) of current row
	var itmNode;  // "pointer" to 'td' node (child of rowNode) of current item

	for (i = 0; i < sldDataArr.length; i++) {  // create row for each slide in sldDataArr
		rowNode = null;
		rowNode = document.createElement("tr");
		if ((rowNode == null) || (rowNode.tagName.toLowerCase() == "htmlunknownelement")) {
			alert("prgCreateSldList():  Couldn't create node for row #" + i);
			break;
			}
		rowNode.id = sldDataArr[i].sldNum + "_sldSelRowID";
		rowNode.className = "sldSelTabRow";
		rowNode.addEventListener("click",function() {prgChooseSlide(this.id)});
				// add <td>" items to row
		for (j = 0; j < 3; j++) { // create 3 <td>'s for each row
			itmNode = null;
			itmNode = document.createElement("td");
			if ((itmNode == null) || (itmNode.tagName.toLowerCase() == "htmlunknownelement")) {
				alert("prgCreateSldList():  Couldn't create item node #" + j + " for row #" 
						+ i + ". Table will be corrupted");
				break;
				}
			switch (j) {
				case 0:  // slide ID number
					itmNode.className = "sldSelTabSldNum";
					itmNode.innerHTML = sldDataArr[i].sldNum;
					break;
				case 1:  // slide name & organ
					itmNode.className = "sldSelTabName";
					itmNode.innerHTML = sldDataArr[i].sldName + ":&nbsp;&nbsp;" + sldDataArr[i].sldOrgan;
					break;
				case 2:  // number of focal planes
					itmNode.className = "sldSelTabFP";
					itmNode.innerHTML = sldDataArr[i].maxF;
					break;
				default:
					alert("prgCreateSldlist():  illegal value for \"j\" (\"" 
							+ j + "\") in row #" + i + ".  Table will be corrupted.");
					break;
				}
			if (rowNode.appendChild(itmNode) != itmNode) {
				alert("prgCreateSldList():  could not add item #" + j + " (\"" 
						+ itmNode.innerHTML + "\") to row #" + i + " (\"" + rowNode.id 
						+ "\").  Table will be corrupted.");
				break;
				}
			}
		if (tabNode.appendChild(rowNode) != rowNode) {
			alert("prgCreateSldList():  could not add row #" + i + " (\"" + rowNode.id 
						+ "\") to slide-list table.  Terminating additions to table.");
			break;
			}
		}
	glbSldSelListExist = true;
	document.getElementById("sldSelBox").style.display = "block";
	return;
	}


		// prgChooseSlide() handles selection of a slide usting the "Choose a slide" box
		//	Like the command-line arguments, this function calls prgGetSldInfo() to query the
		//		SQL database for information about the slide
function prgChooseSlide(prgSldId) {
	dbSldNum = parseInt(prgSldId);
	if (Number.isNaN(dbSldNum)) {
		alert('prgChooseSlide():  Cannot find the slide number for \"' + prgSldId +'\".  Slide selection failed.');
		return;
		}
	document.getElementById("sldSelBox").style.display = "none";
	document.getElementById("menuToSldList").style.visibility = "visible";
	prgGetSldBasic();
	return;
	}

		// prgGetSldBasic() generates an Ajax call that passes dbSldNum to a PHP file
		//		that queries the SQL database for basic information: slide name, root
		//		maxF, fStp, maxZ, maxMag, and sldCreditBox info.
		//	If the Ajax request is successful, sqlSldBasics() is called to read the data
function prgGetSldBasic() {
	if (!Number.isInteger(dbSldNum)) {
		alert("The slide number (\"" + dbSldNum 
				+ "\") is not an integer.  Slide numbers must be integers.\n  Please select a slide.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
		// use Ajax to get query SQL database for slide data
	sldSetWaitCurs(); // set all cursors to "wait"
	if (!Number.isNaN(glbAjxTimer)){
		alert("prgGetSldBasic():  Timer for server connection already running.  Reset timer.");
		window.clearTimeout(glbAjxTimer);
		}
	glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
	var ajxReq = new XMLHttpRequest();
	ajxReq.onreadystatechange = function () {
		if ((this.readyState == 4) && (this.status == 200)) {
			sldResetWaitCurs();  // restore cursors to previous state
			window.clearTimeout(glbAjxTimer);
			glbAjxTimer = Number.NaN;
			sqlSldBasics(this);
			}
		}
	ajxReq.open("GET","../SQLphp/jrSQL_GetSldBasic.php?slide=" + dbSldNum,true);	
	ajxReq.send();
	return;
	}

		// prgGetSldInfo() generates an Ajax call that passes dbSldNum to a PHP file that
		//		queries the SQL database for background information about the slide:
		//		tissue, species, stain.
		//	If the Ajax request is successful, sqlSldInfo() is called to read the data
function prgGetSldInfo() {
			// at this point in the process, dbSldNum always be an integer, since prgGetSldBasic()
			//	also does this check, but it only costs a couple of clock cycles to be safe
	if (!Number.isInteger(dbSldNum)) {
		alert("The slide number (\"" + dbSldNum 
				+ "\") is not an integer.  Slide numbers must be integers.\n  Please select a slide.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
		// use Ajax to get query SQL database for slide data
	sldSetWaitCurs(); // set all cursors to "wait"
	if (!Number.isNaN(glbAjxTimer)){
		alert("prgGetSldBasic():  Timer for server connection already running.  Reset timer.");
		window.clearTimeout(glbAjxTimer);
		}
	glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
	var ajxReq = new XMLHttpRequest();
	ajxReq.onreadystatechange = function () {
		if ((this.readyState == 4) && (this.status == 200)) {
			sldResetWaitCurs();  // restore cursors to previous state
			window.clearTimeout(glbAjxTimer);
			glbAjxTimer = Number.NaN;
			sqlSldInfo(this);
			}
		}
	ajxReq.open("GET","../SQLphp/jrSQL_GetSldInfo.php?slide=" + dbSldNum,true);	
	ajxReq.send();
	return;
	}

		// prgGetSldZYX() generates an Ajax call that passes dbSldNum to a PHP file that
		//		queries the SQL database to retrieves dbSldData[] info from tabZYX.
		//	If the Ajax request is successful, sqlSldZYX() is called to populate dbSldData[]
function prgGetZYX() {
			// at this point in the process, dbSldNum always be an integer, since prgGetSldBasic()
			//	and prgGetSldInfo() also do this check, but it only costs a couple of clock cycles to be safe
	if (!Number.isInteger(dbSldNum)) {
		alert("The slide number (\"" + dbSldNum 
				+ "\") is not an integer.  Slide numbers must be integers.\n  Please select a slide.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
		// use Ajax to get query SQL database for slide data
	sldSetWaitCurs(); // set all cursors to "wait"
	if (!Number.isNaN(glbAjxTimer)){
		alert("prgGetSldBasic():  Timer for server connection already running.  Reset timer.");
		window.clearTimeout(glbAjxTimer);
		}
	glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
	var ajxReq = new XMLHttpRequest();
	ajxReq.onreadystatechange = function () {
		if ((this.readyState == 4) && (this.status == 200)) {
			sldResetWaitCurs();  // restore cursors to previous state
			window.clearTimeout(glbAjxTimer);
			glbAjxTimer = Number.NaN;
			sqlSldZYX(this);
			}
		}
	ajxReq.open("GET","../SQLphp/jrSQL_GetZYX.php?slide=" + dbSldNum,true);	
	ajxReq.send();
	return;
	}


	//sqlSldBasics() reads & integrates the data returned from the server in response to the Ajax call
	//	from prgGetSldBasic().  The data read by this function are:
	//	(1) dbSldName (SQL tabSldList.sldName)
	//	(2) dbRoot	(SQL tabSldList.sldRoot)
	//	(3) dbLblPath (SQL tabSldList.lblPathName) => need to write code to display labal
	//	(4) dbMaxZ	(SQL tabSldList.maxZ)
	//			This includes setting glbSldZFLim
	//	(5) dbMaxF	(SQL tabSldList.maxF)
	//			This includes setting glbSldFDef
	//	(6)	dbMaxMag (SQL tabSrc.sldMagnification)
	//			=> need to write code to display magnification
	//			=> need to write code to create & display scale bar
	//	(7)	(SQL tabSldList.fStp) => displayed in menuFStp.innerHTML
	//	The following are read by this function and passed to prgMkCredit():
	//	(8)	(SQL tabSrc.stdCredit)
	//	(9)	(SQL tabSrc.strOwner)
	//	(10)	(SQL tabSrc.strInstitute)
	//	(11)(SQL tabSrc.License)

function sqlSldBasics(ajxReq) {
			// handle Ajax/SQL errors
	var ajxData = ajxError("sqlSldBasics()", ajxReq.responseText);
	if (ajxData.length == 0) { return; }  // error occurred; error message handled by ajxError()
	if (ajxData.indexOf("SQL 0") == 0) {
		alert("There is no slide numbered \"" + dbSldNum 
					+ "\" in the database.\n  Choose a different slide number.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
	document.getElementById("menuSldNumVal").innerHTML = dbSldNum;
			// ajxData contains json-encoded SQL data
	var sldData = JSON.parse(ajxData);
	dbSldName = sldData.sldName;
	document.getElementById("menuSldNameVal").innerHTML = dbSldName;
	document.getElementById("menuMainSldNmTxt").innerHTML = dbSldName;
	if (sldData.sldRoot == null) {
		alert("sqlSldBasics():  Unable to get location of slide from server.\n  Please close PNWU virtual microscope viewer, and report the problem.");
		return;
		}
	dbRoot = sldData.sldRoot;
	if (sldData.lblPathName == null) {
			// NOTE:  NEED TO ADD CODE TO HIDE MENU "Show slide label" <div>
		dbLblPath = "";
		}
	else {
				// NOTE:  NEED TO WRITE CODE TO DISPLAY SLIDE LABELS
				//	NEED TO ADD SLIDE LABEL jpeg TO DATABASE
		 dbLblPath = sldData.lblPathName;
		}
			// set zoom-level & zoom-level controls
	dbMaxZ = sldData.maxZ;
	if (Number.isNaN(glbSldStrtZ)) { // glbSldStrtZ not set on command-line, use default
		if (dbMaxZ < 3) {glbSldStrtZ = dbMaxZ - 1; }
		else { glbSldStrtZ = 2; }
		}
	else if (glbSldStrtZ >= dbMaxZ) {
		warnBoxCall(true,"Initial Zoom-level",'The initial zoom-level (\"' + glbSldStrtZ 
				+ '\") was set to a value greater than the highest zoom-level (\"' + (dbMaxZ - 1)
				+ '\").  It has been reset to be highest zoom-level in this specimen.');
		glbSldStrtZ = dbMaxZ-1;
		}
		    // initialize the Z menu windows
	document.getElementById("menuSldZTot").innerHTML = '(<font size="-1">0-' + (dbMaxZ-1) + '</font>)';
	document.getElementById("menuSldZ").innerHTML = glbSldStrtZ;
	document.getElementById("menuDrpDwnZTot").innerHTML = '&nbsp;&nbsp;(<font size="-1">0-' + (dbMaxZ-1) + '</font>)';
	document.getElementById("menuDrpDwnZVal").innerHTML = glbSldStrtZ;	

			// set glbSldZFLim
	if (Number.isNaN(glbSldZFLim)) {  //glbSldZFLim not yet set
		glbSldZFLim = dbMaxZ-4;  // focusing disabled for Z < glbSldZFLim
		}
	else if (glbSldZFLim > dbMaxZ) { // glbSldZFLim was incorrectly set by chgSetFocus() before initialization
		warnBoxCall(true,"Focusing Limit",'The zoom-level limit for focusing (\"' + glbSldZFLim 
				+ '\") was set to greater than the number of zoom-levels (\"' + dbMaxZ
				+ '\").  It has been set to the maximum zoom-level + 1.');
		glbSldZFLim = dbMaxZ;
		}
	if (glbSldZFLim < 0) { glbSldZFLim = 0; }		

		    // initialize the FP menu windows & FP navigator controls
	dbMaxF = sldData.maxF;
		// if glbStrtF is set on command-line, it needs to be checked before setting glbSldFDef
		//	However, if glbStrtF is not set on command-line, it will be set to glbSldFDef, in which
		//		case glbStrtF must be set after glbSldFDef
	if ((!Number.isNaN(glbSldStrtF)) && (glbSldStrtF >= dbMaxF)) {
		warnBoxCall(true,"Initial Focal Plane",'The initial focal plane (\"' + glbSldStrtF 
				+ '\") was set to a value greater than the highest focal plane (\"' + (dbMaxF - 1)
				+ '\").  It has been reset to be highest focal plane in this specimen.');
		glbSldStrtF = dbMaxF-1;
		}
			// Set glbSldFDef 
		// 	glbSldFDef is the focal plane used at zoom-levels for which focusing is not allowed.
		//	Prior to initialization, glbSldFDef == NaN unless set by chgSetting or a command-line argument.
		//	If not specified previously (i.e. if glbSldFDef == NaN), this value now is set to the
		//		middle focal plane, unless the glbSldStrtF (the starting focal plane) was set by a
		//		command-line argument.  If glbSldStrtF was set on the command-line and is 
		//		less than glbSldZFLim, then glbSldFDef = glbSldStrtF
	if (Number.isNaN(glbSldFDef)) {  // glbSldFDef not yet set
		if ((!Number.isNaN(glbSldStrtF)) && (glbSldStrtZ < glbSldZFLim)) {
			glbSldFDef = glbSldStrtF;
			}
		else { glbSldFDef = Math.floor(dbMaxF/2); }
		}
	else if (glbSldFDef >= dbMaxF) {  // if chgSetting set glbSldFDef too high, adjust it down to the maximum value
		warnBoxCall(true,"Default Focal Plane",'The default focal plane (\"' + glbSldFDef 
				+ '\") was set to a value greater than the highest focal plane (\"' + (dbMaxF - 1)
				+ '\").  It has been reset to be highest focal plane in this specimen.');
		glbSldFDef = dbMaxF-1;
		}
			// if the starting focal plane(glbSldStrtF) has not yet been set (i.e., glbSldStrtF = NaN)
			//		then glbSldStrtF is set to glbSldFDef
	if (Number.isNaN(glbSldStrtF)) { glbSldStrtF = glbSldFDef; }

				// Set focal-plane controls
			// resetting focal plane controls when dbMaxF == 1 is done here, rather than in prgChooseSlide(),
			//		because eventually it will be possible to choose the slide choice by a command-line
			//		argument, so this may be the first place where the slide is definietly known.
	if (dbMaxF == 1) {  // hide focus controls if only one focal plane
				// hide display of focal-plane number & focal-plane step-size
		document.getElementById("menuFP").style.display = "none";
		document.getElementById("menuFMenuVis").style.display = "none";
		document.getElementById("menuDrpDwnFP").style.display = "none";
		document.getElementById("menuFStp").style.display = "none";
				// change navigator settings => in sldHideFCntrl()
				// hide focal plane controls => in sldHideFCntrl()
				// hide mouse-wheel controls => in sldHideFCntrl()
				// hide focus-related setting changes => in sldHideFCntrl()
				// sldHideFCntrl() is called in sldInitializeView
				//	hiding divider not in sldHideFCntrl() because
				//		"enable/disable focus" button remains if F is disabled
		document.getElementById("menuSetFDiv1").style.display = "none";  // for dbMaxF == 1 only
		document.getElementById("menuEnDisableF").style.display = "none";  // for dbMaxF == 1 only
		}
	else {
		document.getElementById("menuSldFPTot").innerHTML = '(<font size="-1">0-' + (dbMaxF-1) + '</font>)';
		document.getElementById("menuSldFP").innerHTML = glbSldStrtF;
		document.getElementById("menuDrpDwnFPTot").innerHTML = '&nbsp;&nbsp;(<font size="-1">0-' + (dbMaxF-1) + '</font>)';
		document.getElementById("menuDrpDwnFPVal").innerHTML = glbSldStrtF;
		document.getElementById("navNoFocusTxtBx").innerHTML = "Focusing not available for zoom-levels < " + glbSldZFLim;
		document.getElementById("menuNoF").innerHTML = "No focusing for zoom-levels < " + glbSldZFLim;
				// sldRestFocusControls() uses sldVw[].z, so focus controls cannot be set until sldInitializeView()
				// for multiple focal-planes, need to hide fStp display if fStp isn't defined
		if (sldData.fStp == null) { document.getElementById("menuFStp").style.display = "none"; }
		else { document.getElementById("menuFStpVal").innerHTML = sldData.fStp.toFixed(3); }
		}
			// set-up glbSldMaxF and focal-plane buffering
			//	glbSldMaxF is the maximum number of focal planes loaded during focal-plane cycling.
			//	glbSldMaxF is different from dbMaxF, which is the total number of focal planes in the specimen
	if (dbMaxF <= 1) {  // if only 1 focal plane => turn-off focal plane buffering
		glbSldFBuf = 0;
		glbSldFZBuf = 0;
		}
	if (Number.isNaN(glbSldMaxF)) { // glbSldMaxF not set previously
		glbSldMaxF = dbMaxF;
		}
	else if (glbSldMaxF > dbMaxF) {  // glbSldMaxF already set to too large value by user; warn & reset to dbMaxF
		warnBoxCall(true,"Maximum Focal Planes",'The value set for the maximum number of focal planes (\"' + glbSldMaxF 
				+ '\") is too large and is being re-set to the actual number of focal planes (\"' + dbMaxF + '\").');
		glbSldMaxF = dbMaxF;
		}
	else if (glbSldMaxF < ((2 * glbSldFBuf) + 1)) {
		warnBoxCall(true,"Maximum Focal Planes",'The value set for the maximum number of focal planes (\"' + glbSldMaxF 
				+ '\") is too small and is being re-set to the focal-plane buffer value (\"' + ((2 * glbSldFBuf) + 1) + '\").');
		glbSldMaxF = (2 * glbSldFBuf) + 1;
		}
				// set dbMaxMag
	if (sldData.sldMagnification != null) {
		dbMaxMag = sldData.sldMagnification;
 		}
			// dbMagMax == 0 if magnification is not known; 
			//	NaN would generate an error when we divide by glbZoomStp in sqlSldZYX()
	else {  // magnification unknown; do not display maginification in "Slide Info" menu
		dbMagMax = 0; // this is redundant since dbMaxMag is initialized as 0, but better safe than sorry
		document.getElementById("menuDDZMag").style.display = "none";
		}  
	prgMkCreditStr(sldData.stdCredit, sldData.strOwner, sldData.strInstitute, sldData.strLicense);
	prgMenuResize();  // need to check menu size: may have removed "menuFP" from main menu and may need to adjust for filename
	prgGetSldInfo();  // do next SQL call
	return;
	}


	// prgMkCreditStr() uses data (obtained from database by sqlSldBasics()) to build
	//	and display the credit string.  It limits line length to approximately maxLine 
	//	(there is some fudging in this calculation, and line could be as much as 116 
	//	characters long), and each line has a length of at least minLine characters.  
	//	If stdCredit format is NOT used then the three strings ("owner", "institution",
	//	and "license" are separated by a space or line-break without any other punctuation.
	//	For stdCredit format, "owner" is preceded by "Slide provided by ", the three strings
	//	are separated by a comma & space, the license string is preceded by "under a", and
	//	the license string is followed by "license.".  For stdCredit format, if a license
	//	is not given (i.e. sqlLicense == null), the "standard" Creative Commons license is 
	//	used.
	// The function copies the string to <div id=sldCreditBox>.  If the is no string
	//	(i.e., all three strings are null), sldCreditBox is hidden (display="none").
function prgMkCreditStr(stdCredit, sqlOwner, sqlInstitute, sqlLicense) {
	var maxLine = 80;
	var minLine = 15;
	var strFinal = "Slide provided ";
	var strOwner = "";
	var strInst = "";
	var strLic = "";
	if (sqlOwner != null) { strOwner = sqlOwner; }
	if (sqlInstitute != null) { strInst = sqlInstitute; }
	if (sqlLicense != null) { strLic = sqlLicense; }
	var lenOwner = strOwner.length;
	var lenInst = strInst.length;
	var lenLic = strLic.length;
	if ((lenOwner + lenInst + lenLic) == 0) {  // no credit to display
		document.getElementById("sldCreditBox").style.display = "none";
		document.getElementById("menuCreditVis").style.display = "none";
		return;
		}
			// stdCredit should be a Boolean, but json converts it to 1 or 0	
	if (stdCredit == 1) {  // use standard combination of owner, institution, & license
		if ((lenOwner + lenInst) == 0) {  // only a (possibly non-standard) license displayed
			strFinal += "under a " + strLic + " license.";
			document.getElementById("sldCreditBox").innerHTML = strFinal;
			return;
			}
		strFinal += " by";
		if (lenOwner > 0) { strFinal += " " + strOwner + ","; }
		if ((lenOwner > minLine) && (lenInst > minLine) && ((lenOwner + lenInst) > maxLine)) {
			strFinal += "<br>" + strInst + ",";
			}
		else if (lenInst > 0) { strFinal += " " + strInst + "," }
		strFinal += "<br>under a ";
		if (lenLic > 0) { strFinal += strLic + " license."; }
		else { strFinal += "Creative Commons Attribution-NonCommercial-ShareAlike license." }
		document.getElementById("sldCreditBox").innerHTML = strFinal;
		return;
		}
			  // non-standard credits
			  		// with owner string
	if (lenOwner > 0) { 
		strFinal = strOwner; 
		if (lenInst > 0) {
			if (((lenOwner + lenInst) < maxLine) || (lenOwner < minLine)
					|| ((lenInst < minLine) && ((lenInst + lenLic) > maxLine))) { 
								// put strInst on 1st line
				strFinal += " " + strInst;
				if ((lenLic > 0) 
						&& (((lenOwner + lenInst + lenLic) < maxLine) || (lenLic < minLine))) {
								// put all three strings on 1st line
					strFinal += " " + strLic;
					}
				}
			else {	// strInst starts new line
				strFinal += "<br>" + strInst;
				if ((lenInst < minLine) || (lenLic < minLine) || ((lenInst + lenLic) < maxLine)) {
							// strInst & strLic on same line
					if (lenLic > 0) { strFinal += " " + strLic; }
					}
				else if (lenLic > 0) {  // strLic goes on 3rd line
					strFinal += "<br>" + strLic;
					}
				}
			}
		else if (lenLic > 0) {  // credit is owner & license (no institute); owner is on 1st line.
			if ((lenOwner < minLine) || (lenLic < minline) || ((lenOwner + lenInst) < maxLine)) {
						// owner & license on same line
				strFinal += " " + strLic;
				}
			else { strFinal += "<br>" + strLic; }
			}
		document.getElementById("sldCreditBox").innerHTML = strFinal;
		return;
		}
			  		// without owner string, but sith institution string
	if (lenInst > 0) {
		strFinal = strInst;
		if ((lenInst < minLine) || (lenLic < minLine) || ((lenInst + lenLic) < maxLine)) {
					// institution & license on same line (no Owner)
			strFinal += " " + strLic;
			}
		else if (lenLic > 0) {  // license goes on separate line (no Owner)
			strFinal += "<br>" + strLic;
			}
		document.getElementById("sldCreditBox").innerHTML = strFinal;
		return;
		}
			  		// without owner or institution string, but with institution string
	if (lenLic > 0) {
		document.getElementById("sldCreditBox").innerHTML = strLic;
		return;
		}
	}
			

	//sqlSldInfo() reads & integrates the data returned from the server in response to the Ajax call
	//	from prgGetSldInfo().  The data read by this function are:
	//	(1)  (SQL tabSldInfo.sldOrgan) => on menu
	//	(1)  (SQL tabSldInfo.sldSpecies) => on menu
	//	(1)  (SQL tabStains.strStainAbbr) => on menu
function sqlSldInfo(ajxReq) {
			// handle Ajax/SQL errors
	var ajxData = ajxError("sqlSldBasics()", ajxReq.responseText);
	if (ajxData.length == 0) { return; }  // error occurred; error message handled by ajxError()
	if (ajxData.indexOf("SQL 0") == 0) {
		alert("There is no slide numbered \"" + dbSldNum 
					+ "\" in the database.\n  Choose a different slide number.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
			// ajxData contains json-encoded SQL data
	var sldData = JSON.parse(ajxData);
	if (sldData.sldOrgan == null){
		document.getElementById("menuTissue").style.display = "none";
		}
	else {
		document.getElementById("menuTissueVal").innerHTML = sldData.sldOrgan;
		}
	if (sldData.sldSpecies == null){
		document.getElementById("menuSpecies").style.display = "none";
		}
	else {
		document.getElementById("menuSpeciesVal").innerHTML = sldData.sldSpecies;
		}
	if (sldData.strStainAbbr == null){
		document.getElementById("menuStain").style.display = "none";
		}
	else {
		if (sldData.strStainAbbr.length > 22) {
			document.getElementById("menuStainVal").style.fontSize = "14px";
			document.getElementById("menuStainVal").style.paddingTop = "2px";
			}
		document.getElementById("menuStainVal").innerHTML = sldData.strStainAbbr;
		}
	prgGetZYX();  // after getting slide information, next step is to populate dbSldData[]
	return;
	}


function sqlSldZYX(ajxReq) {
	var i;
	var locMult = 1;
	var locMag = dbMaxMag;

	var errStr = "";  // text string for error messages
			// handle Ajax/SQL errors
	var ajxData = ajxError("sqlSldBasics()", ajxReq.responseText);
	if (ajxData.length == 0) { return; }  // error occurred; error message handled by ajxError()
	if (ajxData.indexOf("SQL 0") == 0) {
		alert("There is no slide numbered \"" + dbSldNum 
					+ "\" in the database.\n  Choose a different slide number.");
		prgGetSldList();  // this will result in display of the slide list in sldSelBox.
		return;
		}
			// ajxData contains json-encoded SQL data
	var sqlDataArr = JSON.parse(ajxData);
	if (sqlDataArr.length != dbMaxZ) {
		errStr = "sqlSldZYX(): ZYX array size (" + sqlDataArr.length;
		errStr += ") does not equal dbMaxZ (" + dbMaxZ + ").";
		errStr += "\nPlease report this error (which may cause problems viewing the slide).";
		errStr += "\n\n  Click \"OK\" to continue or \"Cancel\" to select a different slide.";
		if (confirm(errStr)) {
			dbMaxZ = sqlDataArr.length;
			}
		else {
			dbSldNum = Number.NaN;
			prgGetSldList();  // this will result in display of the slide list in sldSelBox.
			return;
			}
		}
	for (i = dbMaxZ - 1; i>= 0; i-- ) {
		dbSldData[i] = {z: sqlDataArr[i].Z,
						numF: sqlDataArr[i].numF,
						zMult: locMult,
						zMag: locMag,
						strtY: sqlDataArr[i].strtY,
						numY: sqlDataArr[i].numY,
						strtX: sqlDataArr[i].strtX,
						numX: sqlDataArr[i].numX};
		locMult *= glbZoomStp;
		locMag /= glbZoomStp;
		}
	sldInitializeView();					
	return;
	}
	

		// Handles time-out failures when connecting to server
function ajxConnectFail() {
	glbAjxTimer = Number.NaN;
	var timeOutSec = glbAjxTimeOut/1000;
	var timeOutStr = timeOutSec.toPrecision(2);
	var txtStr = "Timed-out while trying to connect with the server!"
	txtStr += "\n  The PNWU Virtual Micrsocope will not function without a server connection.";
	txtStr += "\n\n  Click \"OK\" if you want to wait another " + timeOutStr + " seconds";
	txtStr += "\n      	to see if a server connection can be established.";
	txtStr += "\n  Click \"Cancel\" if you want to quit.";
	if (confirm(txtStr)) {
		glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
		}
	else {
		sldResetWaitCurs();  // restore cursors to previous state
		}
	return;
	}

// In anticipation of several Ajax/SQL calls generating the same (or similar) sets of error messages that will be handled in
//		the same of simlar ways, I pulled handling of these messages out of prgSldBasics() and put them into a separate 
//		function:  ajxError().  This function is passed:
//	(1)	funcStr which is a string identifying the function that encountered the error (for display in the alert or confirm
//			messages.
//	(2)	the responseText string from the Ajax object, which may or may not contain error messages.  Error messages will
//			begin with "SQL ".  If the responseText contains both errors and data (e.g., if the prepared statement couldn't
//			be closed after execution of the prepared SQL statement), then the error messages will be preceded and followed
//			by four exclamation points "!!!!"; in this case ajxError will separate the error string from the data (and
//			strip-out the "!!!!").
//	ajxError() handles display of any errors (if there are errors) and returns the data string (if there is a data string).
//		A correct SQL call that returned no data (e.g., because no slide exists with the indicated slide number) technically
//		is an Ajax/SQL error, but it needs to be handled differently from a "true" error; in this case the return string is:
//		"SQL 0"/

function ajxError(funcStr, ajxStr) {
	var ajxError = "";  // text string containing error messages
	var ajxData = "";   // text string containing data
	var extStr = "";	// "extra" text string used as an intermediate during string processing.
	var strI;			// integer that is an index for text string manipulations.
	var strJ;
			// check for error messages
	strI = ajxStr.indexOf("!!!!");
	if (strI == 0) { // ajxStr begins with "!!!!" - message includes both errors & data
		strJ = ajxStr.indexOf("!!!!",4);
		if (strJ < 4) {   // missing end of combined error & data string
			alert(funcStr + ":  Data from server is corrupted (error messages not set-off by \"!!!!\").\n\n  Please close PNWU microscope viewer and report the error.");
			return ("");
			}
		ajxData = ajxStr.slice(strJ+4);  // data begins after the 2nd "!!!!"
		ajxError = extStr.slice(4,strJ);  // error message between 1st & 2nd "!!!!"
		}
	else if (ajxStr.indexOf("SQL") == 0) {  // string begins with "SQL" => only error message, no data
		ajxError = ajxStr;
		}
	else { // only data and no error message
		ajxData = ajxStr;
		}
			// if no error, return data string
	if (ajxError.length == 0) {
		return(ajxData); 
		}
			// special handling for "SQL 0" case
	strI = ajxError.indexOf("SQL 0");
	strJ = -1;
	if (strI == 0) { // "SQL 0" is 1st error message
		strJ = ajxError.indexOf("SQL",5);
		if (strJ < 0) {  // only error is "SQL 0" => "SQL 0" implies no data string
			return("SQL 0");
			}
		}
	if ((strI > 0) || ((strI == 0) && (strJ > 0))) {
		alert(funcStr + ": Errors encountered in getting data from server:\n\n" + ajxError);
		return ("SQL 0");
		}

			// for all errors except SQL 0
	strI = ajxError.indexOf("SQL",4);
	if (strI > 0) {  // more than one error
		extStr = funcStr + ": the following errors occured when retrieving data from the server:\n\n";
		}
	else {
		extStr = funcStr + ": an error occured when retrieving data from the server:\n\n";
		}
	extStr += ajxError;
	if (ajxData.length != 0) {  // data as well as errors
		extStr += "\n\nHowever, in addition to the errors, the server also sent data.";
		extStr += "\n  Do you want to continue (Click \"OK\"), or";
		extStr += "\n  do you want to end session (Click \"Cancel\").";
		if (confirm(extStr)) { return(ajxData);	}
		else { return(""); }
		}
	else {   // no data
		extStr += "\n\nPlease close PNWU microscope viewer and report the problem.";
		alert(extStr);
		return("");
		}
	}

