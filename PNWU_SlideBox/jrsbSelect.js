//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbSelect.js is part of the "slide box" portion of the "PNWU Virtual Microscope",
//		which is an internet web-based program that displays digitally-scanned microscopic specimens.
//	The "PNWU Virtual Microscope" consists of two modules:
//		-- "SlideBox", which searches and displays a list of available slides
//		-- "Viewer" (the "Microscope") which displays the selected slide
//	Both components of the system:  the Viewer ("PNWU Microscope") and "PNWU Slide Box"
//		are free software:  you can redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Virtual Microscope" (the "Viewer" and "PNWU Slide Box") is distributed in the hope 
//		that it will be useful, but WITHOUT ANY WARRANTY; without even the 
//		implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	Currently, the "slide box" portion of the "PNWU Virtual Microscope" consists of 9 principal files 
//		(and other supplementary files):
//		- one HTML file.
//		- one cascading style sheet
//		- six javascript files (including this file).
//		- one PHP file.
//	Questions concerning "PNWU Virtual Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

// jrsbSelect.js contains =>
//		initialization functions that are called when the slide box is initialized or resized
//		functions involved in selecting subsets of slides to be included in the slide list
//	this file was initially created on 5/25/20


// *********************************************************
// ******           initialization functions          ******
// ******          build boxes for search page        ******
// *********************************************************
 

	// prgInitSldBox is called when the program is loaded.  It initializes variables
	//		and centers boxes.  It then calls initBuildLeft to build the left-side of the
	//		"slide selection" page
	//	Because we want to be able to re-enter the "slide selection" page from the 
	//		"slide display page" with initialization of selection criteria but without
	//		rebuilding the entire page, this initSldBox() calls initVar() to initialize 
	//		the left side of the slide of the page, rather than doing it itself
function prgInitSldBox() {
		//  if a touchevent occurs, a mousedown eventlistener is added to the document.
	document.addEventListener("touchstart",function(){tchTestMus()});
	tchInitMainMenu();  // adds touchEvent eventListeners to main menu
		// add touch events to "aboutBoxMv" button
		//	probably can clean this up ... derived from more general 'infoBox move' scenario in viewer
		//		and there is only one info box in SlideBox
	var btnNode = document.getElementById("aboutBoxMv");
	btnNode.addEventListener("touchstart",function() {aboutBxTchStrt(event,this);});	
	btnNode.addEventListener("touchmove",function() {aboutBxTchMv(event);});
	btnNode.addEventListener("touchend",function() {aboutBxTchUp(event,this);});
	btnNode.addEventListener("touchcancel",function() {aboutBxTchUp(event,this);});	
			// get window parameters
	prgGetScrlWdth();
	prgGetNumCol();
		// build left-side & menu of "search page"
	initBuildLeft();
	menuBuildSrtBy();
			// center box
	srchSldBoxCenter();
		// set-up logo => get top & height
	var sideHt = document.getElementById("srchPage").clientHeight 
					- document.getElementById("srchPageTitle").offsetHeight 
					- document.getElementById("srchMenu").offsetHeight;
	var logoTop = document.getElementById("srchInstr").offsetHeight;
	var logoHt = sideHt - logoTop;
	document.getElementById("srchLogo").style.top = logoTop + "px" ;
	document.getElementById("srchLogo").style.height = logoHt + "px" ;
		// set-up logo => set-up seal
	var imgSz = logoHt - 10; // img has 5px margin
 	var imgNode = document.getElementById("srchLogoImg");
	imgNode.style.height = imgSz + "px";
	imgNode.style.width = imgSz + "px";
	return;
	}

	// prgResizeSldBox() is called when the window receives an "onResize" event
function prgResizeSldBox() {
	var lstWdth;
	var wndHt;  // height of window
	var boxSpc;  // height of space in window that is available for lstBox
	var boxHt;  // height of lstBox
	var pageTop;  // top of lstPage
	var boxTop;  // offset of top of lstBox
	if (document.getElementById("lstPage").style.display == "block") {
				// center list-page horizontally but do NOT change number of columns
		lstWdth = (glbSldItmWdth * glbColNum) + (glbSldItmHMrg * (glbColNum -1)) + 2;
		if (glbIsLstVScrl && !Number.isNaN(glbScrlWdth)) { lstWdth += glbScrlWdth; }
		lstWndHCenter(lstWdth);
			// if no Y-axis scroll bar, the broswer provides the main window with
			//	a vertical scrollbar (if needed), and there is no need to adjust
			//	the list-box (lstWnd) within the list page (lstPage).  However,
			//	we need to handle situation where list-box has a vertical scroll-bar
		if (glbIsLstVScrl) {
			wndHt = window.innerHeight; 
			boxTop = lstGetBoxTop();
			boxSpc = wndHt - boxTop - 4;
			boxHt = lstBoxHt();
			if (boxHt > boxSpc) {  // list is bigger than space
				document.getElementById("lstPage").style.height = "100%";
				document.getElementById("lstWnd").style.height = boxSpc + "px";
				document.getElementById("lstPage").style.top = "0px";
				}
			else {  // more space than needed, shorten lstPage height
				document.getElementById("lstPage").style.height = (boxTop + boxHt) + "px";
				pageTop = boxSpc - boxHt;
				if (pageTop > 20) { pageTop = 20; }
				else if (pageTop < 0) { pageTop = 0; }
				document.getElementById("lstPage").style.top = pageTop + "px";
				}
			}  // end "if VScrl"
		}  // end "if lstPage displayed"
	else if (document.getElementById("srchPage").style.display != "none") {
		srchSldBoxCenter();
		prgGetNumCol();   // recalculate the number of columns
		}
	else {
		alert("prgResizeSldBox(): There doesn\'t seem to be anything displayed."
					+ "\n\n  Please report this error.");
		}
	return;
	}

	// scroll-width (glbScrlWth) is needed to calculate the number of columns, we only want
	//	to get the scroll-width once, since we need hide windows in order to get the scroll-width.
	//	prgGetScrlWdth() will be called on loading; srchPage will initially be hidden and will be
	//  	used to calculate scroll width. After saving scroll-width as a global variable,
	//		prgGetScrlWdth will set srchPage.style.visibility to "visible".

function prgGetScrlWdth() {
	wndNode = document.getElementById("srchPage");
	if (wndNode == null) {
		alert("prgGetScrlWdth():  unable to get node for \"srchPage\".  This is a lethal error"
					+ "\n\n  Please report this error.");
		return;
		}
	wndNode.style.visibility = "hidden";
	wndNode.style.display = "block";
			// get width of scroll bar
	wndNode.style.overflowY = "hidden";
	glbScrlWdth = wndNode.clientWidth;
	wndNode.style.overflowY = "scroll";
	glbScrlWdth -= wndNode.clientWidth;
	wndNode.style.overflowY = "";
	wndNode.style.visibility = "visible";
	return;
	}

function prgGetNumCol(){
	var colWdth = glbSldItmWdth + glbSldItmHMrg;
	var wndWdth = window.innerWidth - glbScrlWdth - 4;  // assume scroll bar is present + margins are 2px
	glbColNum = Math.floor(wndWdth/colWdth);
	if (glbColNum <= 0) { glbColNum = 1; }
	return;	
	}

function srchSldBoxCenter() {
	var boxWdth = 860;  // width of "select slide" window defined in jrsbStyleMain.css
	var wndWdth = window.innerWidth;
	var wndHt = window.innerHeight;
	var boxHt = document.getElementById("srchPage").clientHeight;
	var boxTop = wndHt - boxHt - 40;
	if (boxTop > 20) { boxTop = 20; }
	else if (boxTop < 0) { boxTop = 0; }
	var boxLeft = Math.floor((wndWdth - boxWdth)/2);
	document.getElementById("srchPage").style.left = boxLeft + "px";
	document.getElementById("srchPage").style.top = boxTop + "px";
	return;	
	}

	// initBuildLeft() reiteratively calls initBuildCrtNode() to create crtMain boxes for each
	//	entry in glbSrchMainArr, and then inserts these nodes into the left side of the srch window
function initBuildLeft() {
	var i;
	var mainSz = glbSrchMainArr.length;
	var mainNode;
	var leftNode = document.getElementById("srchLeftSide");
	if (leftNode == null) {
		alert("initBuildLeft(): can\'t get node for left side.  Can\'t create \"selection\" part of window, "
					+ "so you can\'t limit what slides are displayed.\n\n  Please report this error.");
		return;
		}
	for (i = 0; i < mainSz; i++) {
		mainNode = initBuildCrtNode(i);
		if (mainNode == null) { return; }  // initBuildCrtNode() will generate error message
		leftNode.appendChild(mainNode);
		}
	return;
	}

	// initBuildCrtNode() creates a crtMain node using the data in glbSrchMainArr[arrI]
	//	It returns the newly created node.  On error, it returns null
function initBuildCrtNode(arrI) {
	if ((arrI < 0) || (arrI >= glbSrchMainArr.length)) {  // illegal value for arrI
		alert("initBuildCrtNode(): an index into glsSrchMainArr[] must be between 0 and "  
				+ (glbSrchMainArr.length -1) + ".  The value for arrI (\"" + arrI 
				+ "\") is illegal.  Can\'t create this \"limit search\" entry."
				+ "\n\n  Please report this error.");
		return(null);
		}
			// create main node (crtMainBoxClass)
	var mainNode = document.createElement("div");
	if (mainNode == null) {
		alert("initBuildCrtNode(): could not create a node for the \"" +  
				+ glbSrchMainArr[arrI].txtNm.toLowerCase() + "\" entry in the \"selection\" window, " 
				+ "so you can\'t limit what slides are displayed.\n\n  Please report this error.");
		return(null);
		}
	mainNode.className = "crtMainBoxClass";
	mainNode.id = glbSrchMainArr[arrI].txtId + "CrtMain";
	mainNode.addEventListener("touchstart",function() {tsrchCrtMainDwn(this,event)});
			// add first line & drop-down menu
	var tmpNode = initBuildContainer(arrI);
	if (tmpNode == null) { return(null); }  // error message created by initBuildContainer
	mainNode.appendChild(tmpNode);
			// add second line
	tmpNode = initBuildLineTwo(arrI);
	if (tmpNode == null) { return(null); }  // error message created by initBuildLineTwo
	mainNode.appendChild(tmpNode);

	return(mainNode);
	}

		// initBuildContainer() creates the first line of the "selection criteria" box, and (via
		//		a call to initBuildDrpDwn()) the associated menu.  The function is passed an
		//		an index into glbSrchMainArr[] indicating which selection-criterion is being built.
		//	Function returns node to drop-down container element.  On error, it returns null
function initBuildContainer(arrI){
	var i;
	var cntrNode = document.createElement("div");
	if (cntrNode == null) {
		alert("initBuildContainer(): could not create a node for drop-down container for the \"" +  
				+ glbSrchMainArr[arrI].txtNm.toLowerCase() + "\" entry in the \"selection\" window, " 
				+ "so you can\'t limit what slides are displayed.\n\n  Please report this error.");
		return(null);
		}
	cntrNode.className = "crtDrpDwnContainerClass";
		// tried to add cntrNode.onmouseover = srchHideArrows() & cntrNode.onmouseout=srchShowArrows()
		//	here, but the mouseout call on 1st line (cntrNode) conflicted with onmouseover call to the
		//	drop-down menu (crtSideContainerClass).  It would be complicated and not worthwhile to try
		//	make other criterion box arrows disappear before the mouse moves over the drop-down menu.
		//	11/21/20
			// create side-menu
	var tmpNode = initBuildDrpDwn(arrI);
	if (tmpNode == null) { return; } // intitBuildDrpDwn() or subsidiary fxn handle error message
	cntrNode.appendChild(tmpNode);
			// create name, arrow & shwVal nodes
	for (i=0; i < 3; i++) {
		tmpNode = document.createElement("div"); 
		if (tmpNode == null) {
			alert("initBuildContainer(): could not create one of the first-line nodes for the \"" +  
					+ glbSrchMainArr[arrI].txtNm.toLowerCase() 
					+ "\" entry in the \"selection\" window.\n\n  Please report this error");
			return(null);
			}
				// create name node
		if (i == 0) {
			tmpNode.className = "crtNameClass";
			tmpNode.innerHTML = glbSrchMainArr[arrI].txtNm + ":";
			}
				// create arrow node
		else if (i == 1) {
			tmpNode.className = "crtArrowClass";
			tmpNode.innerHTML = "&#10132;&#10148;&nbsp;&nbsp;&nbsp;&nbsp;";
			tmpNode.id = glbSrchMainArr[arrI].txtId + "Arrow";
			}
				// create shwVal node
		else if (i == 2) {
			tmpNode.className = "crtShwValClass";
			tmpNode.id = glbSrchMainArr[arrI].txtId + "ShwVal";
			tmpNode.innerHTML = "any slide";  // initial value for valStrg = "(-1,-1)"
			}
		else {
			alert("initBuildContainer(): illegal value (i = " + i 
					+ " in loop when creating the first-line of the \"" +  
					+ glbSrchMainArr[arrI].txtNm.toLowerCase() 
					+ "\" entry in the \"selection\" window.\n\n  Please report this error");
			return(null);
			}
		cntrNode.appendChild(tmpNode);
		}
	return(cntrNode);
	}

		// This function is passed an index to glbSrchMainArr[].  It builds a node (class=crtRowTwoClass) for 
		//		the criterion listed in glbSrchMainArr[arrI] (class=crtRowTwoClass) that contains the
		//		text-edit boxes for entering a specific range of values.  
		//	The function returns the node to the second-line of the criteria box.  On error it returns null
function initBuildLineTwo(arrI) {
	var i;
	var lineNode = document.createElement("div");
	if (lineNode == null) {
		alert("initBuildLineTwo(): could not create a node for the second-line of the \"" +  
				+ glbSrchMainArr[arrI].txtNm.toLowerCase() + "\" entry in the \"selection\" window." 
				+ "\n\n  Please report this error.");
		return(null);
		}
	lineNode.className = "crtRowTwoClass";
	lineNode.id = glbSrchMainArr[arrI].txtId + "RowTwo";
	var tmpNode;
	for (i = 0; i < 4; i++) {
		if ((i%2) == 0) { tmpNode = document.createElement("span"); } // even-numbered elements are "span"
		else { tmpNode = document.createElement("input"); }  // text-input boxes
		if (tmpNode == null) {
			alert("initBuildLineTwo(): could not create one of the nodes for the second line of the \"" +  
					+ glbSrchMainArr[arrI].txtNm.toLowerCase() 
					+ "\" entry in the \"selection\" window.\n\n  Please report this error");
			return(null);
			}
		if (i == 0) { tmpNode.innerHTML = "start number:&nbsp;"; }  // fill-in first span
		else if (i == 2) { tmpNode.innerHTML = "&nbsp;&nbsp;end number:&nbsp;"; }  // fill-in 2nd span
				// create input
		else if ((i == 1) || (i ==3)) { // create text-input boxes
			tmpNode.setAttribute("type","text");
			tmpNode.className = "crtStEndValClass";
			if (i == 1) {
				tmpNode.id = glbSrchMainArr[arrI].txtId + "StrtVal";
				tmpNode.value = 0;
				}
			else {
				tmpNode.id = glbSrchMainArr[arrI].txtId + "EndVal";
				tmpNode.value = "maximum";
				}
			tmpNode.onchange = function(){srchTxtInp(this);};
			tmpNode.ontouchstart = function (){this.focus(); };
			}
		else {
			alert("initLineTwo(): illegal value (i = " + i 
					+ " in loop when creating the second-line of the \"" +  
					+ glbSrchMainArr[arrI].txtNm.toLowerCase() 
					+ "\" entry in the \"selection\" window.\n\n  Please report this error");
			return(null);
			}
		lineNode.appendChild(tmpNode);
		}
	return(lineNode);
	}

	// initBuildDrpDwn() builds the side menu for a criterion box on the srch ("selection") page.
	//	It is passed an index into glbSrchMainArr[] corresponding to the current criterion box.
	//	It returns a node to the newly created side-menu (including the side-container <div>).
	//		On error, it returns null.
function initBuildDrpDwn(mainI) {
	var i;
		// contNode is a container that holds the side-menu box.  It overlaps the right edge of the 
		//		left-side (i.e., the rest of the criterion box) to ensure that the side menu displays
		//		correctly when the mouse moves from hovering over the first-line of criterion box
		//		to hovering over side menu
	var contNode = document.createElement("div");
	if (contNode == null) {
		alert("initBuildDrpDwn(): could not create the container for the drop-down side-menu for \"" +  
				+ glbSrchMainArr[mainI].txtNm.toLowerCase() + "\" entry in the \"selection\" window." 
				+ "\n\n  Please report this error.");
		return(null);
		}
		// 11/21/20 added code for two columns
	var is2Col = false;
	if (glbSrchMainArr[mainI].numCol == 2) { is2Col = true; } 
	if (is2Col) {
		contNode.className = "crtSideContainerClass crt2ColSideContainerClass";
		}
	else {
		contNode.className = "crtSideContainerClass crt1ColSideContainerClass";
		}
	contNode.id = "crtSdCntr_"+ glbSrchMainArr[mainI].txtId;
		// added 11/21/20 => shows/hides other arrows
	contNode.onmouseover = function(){srchHideArrows(mainI)};
	contNode.onmouseover.bubbles = true;
	contNode.onmouseout = function(){srchShowArrows()};  // show ALL arrows; don't need mainI
	contNode.onmouseout.bubbles = true;
	
		// ddBoxNode is the side-menu box
	var ddBoxNode = document.createElement("div");
	if (ddBoxNode == null) {
		alert("initBuildDrpDwn(): could not create a node for the drop-down side-menu for \"" +  
				+ glbSrchMainArr[mainI].txtNm.toLowerCase() + "\" entry in the \"selection\" window." 
				+ "\n\n  Please report this error.");
		return(null);
		}
		// two parts to side-menu class; second part (width) depends on number of columns.
//	ddBoxNode.className = "crtDropDownBoxClass";
	if (is2Col) {
		ddBoxNode.className = "crtDropDownBoxClass crt2ColDropDownBoxClass";
		}
	else {
		ddBoxNode.className = "crtDropDownBoxClass crt1ColDropDownBoxClass";
		}
	contNode.appendChild(ddBoxNode);
		// get sidemenu array
	var sdArr;
	switch (glbSrchMainArr[mainI].txtId) {
		case "org":  sdArr = glbSrchArr_org; break;
		case "src":  sdArr = glbSrchArr_src; break;
		case "stn":  sdArr = glbSrchArr_stn; break;
		case "fmx":  sdArr = glbSrchArr_fmx; break;
		case "num":  sdArr = glbSrchArr_num; break;
		default:
			alert("initBuildDrpDwn():  could not find \"" + glbSrchMainArr[mainI].txtId
					+ "\" in glbSrchMain[].  Cannot build side-menu for the \""
					+ glbSrchMainArr[mainI].txtNm.toLowerCase() + "\" entry in the "
					+ "\"section\" window.\n\n  Please report this error.");
			return(null);
		}
	var sdArrSz = sdArr.length;
	var itmNode;  // node for holding single item in side menu
	var extNode;  // extra node to hold two columns
	var sdHalfArrSz = Math.floor((sdArrSz - 1)/2);
	var j = sdHalfArrSz;  // index for item in right column
	if (is2Col) {
		extNode = document.createElement("div");
		if (extNode == null) {
			alert("initBuildDrpDwn(): could not create the extra node for the two column "
				+ "drop-down side-menu for \"" + glbSrchMainArr[mainI].txtNm.toLowerCase() 
				+ "\" entry in the \"selection\" window." 
				+ "\n\n  Please report this error.");
			return(null);
			}
		for (i = 0; j < sdArrSz; i++) {
					// create node[i]
			itmNode = initAddSdItm(sdArr[i])
			if (itmNode == null) { return(null); } // initAddSdItm() already displayed error message
			j = i + sdHalfArrSz;
			if (i == 0) { extNode.appendChild(itmNode); }
			else if ((i > 0) && (j < sdArrSz)) {
					// add node[i] to left column
				itmNode.style.width = "50%";
				itmNode.style.cssFloat = "left";
				itmNode.style.borderRight = "1px solid black";
				extNode.appendChild(itmNode);
					// create node[j]  and add to right column
				itmNode = initAddSdItm(sdArr[j])
				if (itmNode == null) { return(null); } // initAddSdItm() already displayed error message
				itmNode.style.width = "50%";
				itmNode.style.cssFloat = "right";
				itmNode.style.borderLeft = "1px solid black";
				extNode.appendChild(itmNode);
				}
			else {  // node[sdArrSz-1] ("specific range") still left; add full width at bottom
				j = sdArrSz -1;
				itmNode = initAddSdItm(sdArr[j])
				if (itmNode == null) { return(null); } // initAddSdItm() already displayed error message
				extNode.appendChild(itmNode);
				}
			j++;
			}
		extNode.style.width = "100%"
		extNode.style.height = (i*28) + "px";
		ddBoxNode.appendChild(extNode);
		}
	else {  // choices are listed in order as a single column
		for (i=0; i < sdArrSz; i++) {
			itmNode = initAddSdItm(sdArr[i])
			if (itmNode == null) { return(null); } // initAddSdItm() already displayed error message
			ddBoxNode.appendChild(itmNode);
			}
		}
	return(contNode);
	}

	// initAddSdItm() is passed an object consisting of one entry from one of the global
	//		side array menus.
	//	The function builds the corresponding <div> for the side-menu.
	//	NOTE: the function currently does not deal with subsidiary side menus (e.g.,
	//		glbSrchArr_org[].isSub == true).  This will involve the function determining if
	//		the side array contains the ".isSub" field (by a test (if or switch) using last
	//		character in txtId), and then calling another function to build this subsidiary
	//		side-menu.
	//	The function returns the newly created side-item node.  On error, it returns null.		
function initAddSdItm(sdArrObj) {
	var itmNode = document.createElement("div");
	if (itmNode == null) {
		alert("initAddSdItm(): could not create node for an item in the side-menu item (id = \"" 
				+ sdArrObj.txtId + "\" for one of the \"Limit slides by ...\" boxes." 
				+ "\n\n  Please report this error.");
		return(null);
		}
	itmNode.className = "crtSideItmClass";
	itmNode.id = "sdItm_" + sdArrObj.txtId;
	itmNode.innerHTML = sdArrObj.txtNm;
	itmNode.onclick = function(){srchMenuInp(this.id);} ;
	itmNode.addEventListener("touchstart",function() {tsrchSdBtnDwn(this,event)});
	itmNode.addEventListener("touchend",function() {tsrchSdBtnUp(this,event)});
	itmNode.addEventListener("touchcancel",function() {tsrchSdBtnUp(this,event)});
	return(itmNode);
	}



// *********************************************************
// ******           initialization functions          ******
// ******    reset values on return from list page    ******
// *********************************************************


function srchBackFromLst(isShftKey) {
		// reinitialize search variables/boxes
	srchResetSel(isShftKey);
		// hide list-page & show search-page
	var lstNode = document.getElementById("lstPage");
	if (lstNode == null) {
		alert("srchBackFromLst(): Can\'t get node for list page.  "
					+ "This is a fatal error.\n\n  Please report this error.");
		return;
		}
	lstNode.style.display = "none";
	document.getElementById("srchPage").style.display = "block";
		// in case window-size changed need to re-center srchPage
		//		and need re-calculate number of columns for lstPage
	srchSldBoxCenter();
	prgGetNumCol();   // recalculate the number of columns
		// re-initialize list page
	lstResetMenu();  // reset list-page menu
	var chldNode;
	if (glbSldItmArr.length > 0) {
		chldNode = document.getElementById("lstWnd");
		if (chldNode == null) {
			alert("srchBackFromLst():  Cannot find node for list-window.  Cannot create a new search.  "
					+ " You can choose a slide from the old list of slides, but you will have to leave "
					+ "and restart the PNWU Slide Box to start a new search.\n\n  Please report this error.");
			return;
			}
			// remove list-box from list page
		if (lstNode.removeChild(chldNode) != chldNode) {
			alert("srchBackFromLst(): removal of the old search list failed. "
					+ " This probably is a fatal error, and probably should close and reopen the "
					+ "PNWU Slide Box if you want to do a new search.\n\n  Please report this error.");
			document.getElementById("srchPage").style.display = "none";
			lstNode.style.display = "block";
			}
		}
	document.getElementById("startBtn").style.visibility="visible" ;
	return;
	}

function srchResetSel(doInit) {
	var i;
	var arrSz = glbSrchMainArr.length;
	var subArr;
	var strtBxId;
	var endBxId;
	var bxId;
	var txtId;
	for (i = 0; i < arrSz; i++) {
		txtId = glbSrchMainArr[i].txtId;
		if (doInit) {  // re-iniitalize glbSrchMainArr[] if shift-key was down
			switch(txtId) {
				case "org":  subArr = glbSrchArr_org; break;
				case "src":  subArr = glbSrchArr_src; break;
				case "stn":  subArr = glbSrchArr_stn; break;
				case "fmx":  subArr = glbSrchArr_fmx; break;
				case "num":  subArr = glbSrchArr_num; break;
				default : 
						alert("srchResetSel():  Can\'t find an entry in glbSrchMainArr[] with a "
								+ ".txtId that matches = \"" + txtId
								+ "\".  Can\'t reset search values.\n\n  Please report this error.");
						returnl
				}  // subArr assignment switch;
					// reset glbSrchMainArr[] values
			glbSrchMainArr[i].valStrg = subArr[0].valStrg;
			glbSrchMainArr[i].valEnd = Number.NaN;
			glbSrchMainArr[i].valStrt = Number.NaN;
					// reset criterion box values
			bxId = txtId + "ShwVal";
			document.getElementById(bxId).innerHTML = subArr[0].txtNm;
			bxId = txtId + "RowTwo";
			document.getElementById(bxId).style.visibility = "hidden";
			}  // end of if(doInit)
				// reset values in "start number" & "end number" boxes
					// set "end number" boxes using .valEnd
		bxId = txtId + "EndVal";
		if (Number.isNaN(glbSrchMainArr[i].valEnd)) {
			document.getElementById(bxId).value = "maximum";
			}
		else { document.getElementById(bxId).value = glbSrchMainArr[i].valEnd; }
		document.getElementById(bxId).style.backgroundColor = "white";
					// set "start number" boxes using .valEnd
		bxId = txtId + "StrtVal";
		if (Number.isNaN(glbSrchMainArr[i].valStrt)) {
			document.getElementById(bxId).value = "0";
			}
		else { document.getElementById(bxId).value = glbSrchMainArr[i].valStrt; }
		document.getElementById(bxId).style.backgroundColor = "white";
		}  // end of for(items in glbSrchMainArr[]
	return;
	}

// ********************************************************************************
// ******       hide other arrows when mouse is over crtSideContainer        ******
// ******      show other arrows when mouse moves of  crtSideContainer       ******
// ********************************************************************************

	// for efficiency, names of arrows uses index into glbSrchMainArr[] rather than
	//	glbSrchMainArr[].txtId (and srchIdToI(txtId,curArr)).

	// srchHideArrow() is called on a mouseover event with arrI equal to the index
	//		in glbSrchMainArr[] of the container that mouse just moved over.
	//	The changes the visibility to "hide" of the arrows for all criterion boxes 
	//		except current box.	
function srchHideArrows(arrI) {
	var i;
	var idArrow;   // id of node containing arrow.
	var nodeArrow;
	for (i = 0; i < glbSrchMainArr.length; i++) {
		idArrow = glbSrchMainArr[i].txtId + "Arrow";
		nodeArrow = document.getElementById(idArrow);
		if (nodeArrow == null) {
			alert("srchHideArrow("+arrI+"): can't find arrow \"" + idArrow + "\" for criterion box #" + i + ".");
			continue;
			}
		if (i == arrI) { nodeArrow.style.visibility = "visible"; }
		else { nodeArrow.style.visibility = "hidden"; }
		}
	return;
	}

function srchShowArrows() {
	var i;
	var idArrow;   // id of node containing arrow.
	var nodeArrow;
	for (i = 0; i < glbSrchMainArr.length; i++) {
		idArrow = glbSrchMainArr[i].txtId + "Arrow";
		nodeArrow = document.getElementById(idArrow);
		if (nodeArrow == null) {
			alert("srchHideArrow(): can't find arrow \"" + idArrow + "\" for criterion box #" + i + ".");
			continue;
			}
		nodeArrow.style.visibility = "visible";
		}
	return;
	}

	

// *********************************************************
// ******       get values for search criteria        ******
// ******      from drop-down menu & edit boxes       ******
// *********************************************************

function srchMenuInp(btnId) {
		// get Id strings
	var endI = btnId.length;  // index to end of string
	var chId = btnId.slice(endI-1,endI);  // .charId for main-object in glbSrchMainArr[]
	var itmId = btnId.slice(6,endI);	// .txtId for side-object is sdArr[]
	var isSpc = false;  // "specific range" requires special handling => true if side-object = "spc?"
	if (itmId.slice(0,3) == "spc") isSpc = true;
		// get indices into arrays
	var mainI = srchChToI(chId);  // index for main-object in glbSrchMainArr[]
	if (Number.isNaN(mainI)) { return; }  // srchChToI() already issued an error message
	var mainTxtId = glbSrchMainArr[mainI].txtId;  // need this for node.id's
	var sdArr;
	switch (mainTxtId) {
		case "org":  sdArr = glbSrchArr_org; break;
		case "src":  sdArr = glbSrchArr_src; break;
		case "stn":  sdArr = glbSrchArr_stn; break;
		case "fmx":  sdArr = glbSrchArr_fmx; break;
		case "num":  sdArr = glbSrchArr_num; break;
		default:
			alert("srchMenuInp:  could not find \"" + mainTxtId
					+ "\" in glbSrchMain[].  Cannot use side-menu data for  \""
					+ glbSrchMainArr[mainI].txtNm.toLowerCase() 
					+ "\" to limit the number of slides that will be displayed."
					+ "\n\n  Please report this error.");
			return(null);
		}
	var sdI = srchIdToI(itmId,sdArr);  // index itno the side array
	if (Number.isNaN(sdI)) { return; } // srchIdToI() already issued error message
		// get id's for boxes' nodes
	var idShwVal = mainTxtId + "ShwVal"
	var idRowTwo = mainTxtId + "RowTwo";
	var idStrtInpBx = mainTxtId + "StrtVal";
	var idEndInpBx = mainTxtId + "EndVal";
	var valStrt;
	var valEnd;
		// assign values
	document.getElementById(idShwVal).innerHTML = sdArr[sdI].txtNm;
	document.getElementById(idStrtInpBx).style.backgroundColor = "";
	document.getElementById(idEndInpBx).style.backgroundColor = "";
	if (isSpc) {  // "specific range" selection requires special handling
				// use .valStrt & .valEnd, in case this already is the option
		document.getElementById(idRowTwo).style.visibility = "visible";
				// get old start,end values & set-up edit boxes
		valStrt = glbSrchMainArr[mainI].valStrt;
		if (Number.isNaN(valStrt)) {
			valStrt = -1;
			document.getElementById(idStrtInpBx).value = 0;
			}
		else {
			document.getElementById(idStrtInpBx).value = valStrt;
			}
		valEnd = glbSrchMainArr[mainI].valEnd;
		if (Number.isNaN(glbSrchMainArr[mainI].valEnd)) {
			valEnd = -1;
			document.getElementById(idEndInpBx).value = "maximum";
			}
		else {
			document.getElementById(idEndInpBx).value = valEnd;
			}
				// build current .valStrg
		glbSrchMainArr[mainI].valStrg = "(" + valStrt + "," + valEnd + ")";
		}
	else {  // not "specific range"
		glbSrchMainArr[mainI].valStrg = sdArr[sdI].valStrg;
		glbSrchMainArr[mainI].valStrt = Number.NaN;
		glbSrchMainArr[mainI].valEnd = Number.NaN;
		document.getElementById(idStrtInpBx).value = 0;
		document.getElementById(idEndInpBx).value = "maximum";
		document.getElementById(idRowTwo).style.visibility = "hidden";
		}

	return;
	}


	// srchTxtInp() is passed the node to a text-input box on an onChange event.
	//	The function identifies the text-box, tests whether the value is a valid
	//		integer, and if it is a valid integer, writes the value to glbSrchMainArr[].valStrt
	//		or glbSrchMainArr[].valEnd depending on the box into which the datum was entered.
	//	NOTE:  5/30/20: if the user enters an illegal value, I didn't want to delete that value from
	//		bxNode.value, so the user could edit the value.  I wanted to move the focus back to the
	//		box to ensure that the user re-edited the box, but for some reason bxNode.focus()
	//		doesn't seem to work.  I left bxNode.focus() in place in case it works on browsers other
	//		than FireFox, but I also made the background of edit-boxes with invalid values yellow
function srchTxtInp(bxNode) {
			// get parameters from bxNode
	var errStr;
	var bxCode = bxNode.id.slice(0,3);  // three letter code indicating criterion
	var bxStE = bxNode.id.slice(3,6);  // "Str" or "End" indicating which box is being edited
	var bxTxt = bxNode.value;
	var arrI = srchIdToI(bxCode,glbSrchMainArr);  // get index into glbSrchMainArr[] corresponding to box
	if (Number.isNaN(arrI)) { return; }  // error message generated by srchIdToI()
			// check to make certain that bxStE is valid
	if ((bxStE != "Str") && (bxStE != "End")) {
		errStr = "srchTxtInp():  illegal ID (\"" + bxStE + "\" in \"" + bxNode.id;
		errStr += "\").  Can\'t use edit-box to enter limit for \"";
		errStr += glbSrchMainArr[arrI].txtNm.toLowerCase() + "\".\n\n  Please report this error.";
		alert(errStr);
		return;
		}
			// check to see if entry is an integer
	var bxVal = Number(bxTxt);
	if (Number.isNaN(bxVal)) { // entry is not a number
			// check for "max" or "min" text
		if (bxTxt.replace(/ /g,"") == "") { bxVal = -1; } // user emptied string
		else if ((bxStE == "Str") && (bxTxt.slice(0,3).toLowerCase() == "min")) { // user entered "minimum"
			bxVal = -1;
			}
		else if ((bxStE == "End") && (bxTxt.slice(0,3).toLowerCase() == "max")) { // user entered "minimum"
			bxVal = -1;
			}
		else {  // try to extract an integer from the string
					// build common stem for error string
			errStr = "The value entered into the ";
			if (bxStE == "Str") { errStr += "\"start number\" "; }
			else if (bxStE == "End") { errStr += "\"end number\" "; }
			errStr += "text-edit box for using \"" + glbSrchMainArr[arrI].txtNm.toLowerCase();
			errStr += "\" to limit selected slides must be a number.  ";
					// try to parse-out an integer
			bxVal = parseInt(bxTxt);
			if (Number.isNaN(bxVal)) {
				errStr += "The value entered into the edit box (\"" + bxTxt;
				errStr += "\") is not a number.  Please enter an integer into the edit-box or ";
				errStr += "use a different option on the side-menu if you want to use \""
				errStr += glbSrchMainArr[arrI].txtNm.toLowerCase();
				errStr += "\" to limit the number of slides that will be displayed.";
				alert(errStr);
				if (bxStE == "Str") { glbSrchMainArr[arrI].valStrt = Number.NaN; }
				if (bxStE == "End") { glbSrchMainArr[arrI].valEnd = Number.NaN; }
				bxNode.focus();
				bxNode.style.backgroundColor = "yellow";
				return;
				}
			else {  // could parse an integer out of bxTxt
				errStr += "Although the value entered into the edit box (\"" + bxTxt;
				errStr += "\") is not a number, it was possible to extract a number (\"" + bxVal; 
				errStr += "\") from the entered text (\"" + bxTxt;
				errStr += "\").\n\n  Click \"OK\" if you want to use " + bxVal + " as the ";
				if (bxStE == "Str") { errStr += "\"start"; }
				else if (bxStE == "End") { errStr += "\"end"; }
				errStr += "\" number when using \"" +  glbSrchMainArr[arrI].txtNm.toLowerCase();
				errStr += "\" to limit the number of slides that will be displayed.";
				errStr += "\n  Click \"Cancel\" if you want to enter a different number.";
				if (!confirm(errStr)) {
					if (bxStE == "Str") { glbSrchMainArr[arrI].valStrt = Number.NaN; }
					if (bxStE == "End") { glbSrchMainArr[arrI].valEnd = Number.NaN; }
					bxNode.focus();
					bxNode.style.backgroundColor = "yellow";
					return;
					}
				}  // end else parseInt is a number
			} // end else not "max"/"min"/""
		} // end bxVal not a number.
			// check to see if bxVal is an integer
	if (!Number.isInteger(bxVal)) {
		errStr = "The value entered into the ";
		if (bxStE == "Str") { errStr += "\"start number\" "; }
		else if (bxStE == "End") { errStr += "\"end number\" "; }
		errStr += "edit-box for \"" + glbSrchMainArr[arrI].txtNm.toLowerCase();
		errStr += "\" (\"" + bxTxt + "\") must be an integer.  ";
		bxVal = parseInt(bxVal);
		if (!Number.isInteger(bxVal)) {  // this case should never happen, but check anyway
			errStr += "This value,\"" + bxTxt + "\", is not be an integer.  Please enter ";
			errStr += "an integer into the edit-box or use a different option on the ";
			errStr += "side-menu if you want to use \"" + glbSrchMainArr[arrI].txtNm.toLowerCase();
			errstr += "\" to limit the number of slides that will be displayed.";
			alert(errStr);
			if (bxStE == "Str") { glbSrchMainArr[arrI].valStrt = Number.NaN; }
			if (bxStE == "End") { glbSrchMainArr[arrI].valEnd = Number.NaN; }
			bxNode.focus();
			bxNode.style.backgroundColor = "yellow";
			return;
			}
		else {
			errStr += "Although the value entered into the edit box (\"" + bxTxt;
			errStr += "\") is not an integer, it was possible to extract an integer (\""; 
			errStr += bxVal + "\") from the entered text (\"" + bxTxt;
			errStr += "\").\n\n  Click \"OK\" if you want to use " + bxVal + " as the ";
			if (bxStE == "Str") { errStr += "\"start"; }
			else if (bxStE == "End") { errStr += "\"end"; }
			errStr += " number\" when using \"" +  glbSrchMainArr[arrI].txtNm.toLowerCase();
			errStr += "\" to limit the number of slides that will be displayed.";
			errStr += "\n  Click \"Cancel\" if you want to enter a different number.";
			if (!confirm(errStr)) {
				if (bxStE == "Str") { glbSrchMainArr[arrI].valStrt = Number.NaN; }
				if (bxStE == "End") { glbSrchMainArr[arrI].valEnd = Number.NaN; }
				bxNode.focus();
				bxNode.style.backgroundColor = "yellow";
				return;
				}
			}
		}
				// bxVal is an integer => enter values into glbSrchMainArr[] & edit box
	if (bxVal <= 0) {
		bxVal = -1;
		if (bxStE == "Str") {
			glbSrchMainArr[arrI].valStrt = -1;
			bxNode.value = 0;
			}
		else {
			glbSrchMainArr[arrI].valEnd = -1;
			bxNode.value = "maximum";
			}
		}
	else {
		if (bxStE == "Str") {
					// probably don't need to test for .valEnd == NaN because the inequality
					//		(.valEnd > 0) should be false if .valEnd == NaN?
			if ((glbSrchMainArr[arrI].valEnd > 0) && (bxVal > glbSrchMainArr[arrI].valEnd)) {
				alert("The \"start number\" cannot be greater than the \"end number\" (\"" 
							+ glbSrchMainArr[arrI].valEnd + "\").  The value (\"" + bxVal
							+ "\") that was entered for the \"start number\" for \"" 
							+ glbSrchMainArr[arrI].txtNm.toLowerCase() + "\") is too large.  "
							+ "\n\n  Please enter a smaller value for the \"start number\".");
				glbSrchMainArr[arrI].valStrt = Number.NaN;
				bxNode.focus();
				bxNode.style.backgroundColor = "yellow";
				return;
				}
			glbSrchMainArr[arrI].valStrt = bxVal;
			}
		else {
			if (bxVal < glbSrchMainArr[arrI].valStrt) {
				alert("The \"end number\" cannot be less than the \"start number\" (\"" 
							+ glbSrchMainArr[arrI].valStrt + "\").  The value (\"" + bxVal
							+ "\") that was entered for the \"end number\" for \"" 
							+ glbSrchMainArr[arrI].txtNm.toLowerCase() + "\") is too small.  "
							+ "\n\n  Please enter a larger value for the \"end number\".");
				glbSrchMainArr[arrI].valEnd = Number.NaN;
				bxNode.focus();
				bxNode.style.backgroundColor = "yellow";
				return;
				}
			glbSrchMainArr[arrI].valEnd = bxVal;
			}
		bxNode.value = bxVal;
		}
			// set glbSrchMainArr[].valStrg
	if (bxStE == "Str") {
		if (Number.isNaN(glbSrchMainArr[arrI].valEnd)) {
			glbSrchMainArr[arrI].valStrg = "(" + bxVal + ",-1)";
			}
		else {
			glbSrchMainArr[arrI].valStrg = "(" + bxVal + "," + glbSrchMainArr[arrI].valEnd + ")";
			}
		}
	else {
		if (Number.isNaN(glbSrchMainArr[arrI].valStrt)) {
			glbSrchMainArr[arrI].valStrg = "(-1," + bxVal + ")";
			}
		else {
			glbSrchMainArr[arrI].valStrg = "(" + glbSrchMainArr[arrI].valStrt + "," + bxVal + ")";
			}
		}
	bxNode.style.backgroundColor = "";
	return;
	}

	// srchIdToI() is passed a text-code (text string) and an array.  The text-code that should 
	//		match an entry in .txtId field of the array.
	//	If a match is found, the function returns the index to that entry.  If no match is found,
	//		the function returns NaN.
function srchIdToI(txtId,curArr) {
	var i;
	var arrSz = curArr.length;
	for (i = 0; i < arrSz ; i++) {
		if (curArr[i].txtId == txtId) { break; }
		}
	if (i < arrSz) return(i);
	alert("srchIdToI(): could not find an entry in glbSrchMainArr[] whose txtId matched \""
			+ txtId + "\".  Can\'t use the value entered into the text-edit box."
			+ "\n\n  Please report this error.");
	return(Number.NaN);
	}

	// srchChToI() is similar to srchIdToI() except that it searches for a match on the 
	//		one-character code: glbSrchMainArr[].charId
	//	If a match is found, the function returns the index to that entry.  If no match is found,
	//		the function returns NaN.
function srchChToI(chId) {
	var i;
	var arrSz = glbSrchMainArr.length;
	for (i = 0; i < arrSz ; i++) {
		if (glbSrchMainArr[i].charId == chId) { break; }
		}
	if (i < arrSz) return(i);
	alert("srchChToI(): could not find an entry in glbSrchMainArr[] whose .charId matched \""
			+ chId + "\".  Can\'t use the value entered into the text-edit box."
			+ "\n\n  Please report this error.");
	return(Number.NaN);
	}



// *********************************************************
// ******          slide-selection functions          ******
// ******        Ajax call & return functions         ******
// *********************************************************


	// selMakeSrchStr() uses glbSrchMainArr[].valStrg to build a the string that will follow "?"
	//		in the URL that calls jrSB_GetSldLst.php.  The function returns the string.  There
	//		string is "" if no search criteria are listed in glbSrchMainArr[]
function selMakeSrchStr() {
	var i;
	var arrSz = glbSrchMainArr.length;
	var srchStrg = "";
	for (i = 0; i < arrSz; i++){
		if (glbSrchMainArr[i].valStrg == "(-1,-1)") { continue; }
		if (srchStrg == "") { srchStrg += "?"; }
		else { srchStrg += "&"; }
		srchStrg += glbSrchMainArr[i].txtId + "=" + glbSrchMainArr[i].valStrg;
		}
	return(srchStrg);
	}


function selStrpShwVal(srchId) {
	var bxId = srchId + "ShwVal";  //id of ShwVal box
	var strtStr = document.getElementById(bxId).innerHTML;
	var retStr = strtStr.replace(/&amp;/g,"&"); // replace "&amp;" with "&"
	var curI = retStr.indexOf("<");
	var endI = retStr.indexOf(">");
			// slice-out any formating commands
	while ((curI > 0) && (endI > 0)) {
		if (endI <= curI) { break; }
		retStr = retStr.slice(0,curI) + retStr.slice(endI+1,retStr.length);
		curI = retStr.indexOf("<");
		endI = retStr.indexOf(">"); 
		}
	retStr = retStr.toLowerCase();
	return(retStr);	
	}

function selMakeItmArr(ajxReq) {
	var ajxRespTxt = ajxReq.responseText;
	if (ajxRespTxt.slice(0,3) == "SQL") {  // error messages from jrSQL_GetSldList.php begine with "SQL"
		alert("Unable to get list of slides from server due to database error!\n  " + ajxRespTxt);
		return;
		}
	else if (ajxRespTxt.slice(0,4) == "NONE") {
		glbSldItmArr.splice(0);
		lstWndBuild();
		return;
		}
	var sldDataArr = JSON.parse(ajxRespTxt);
	var arrSz = sldDataArr.length;
	var sldItmObj;
	var sldThmbPath;
	var i;
	for (i = 0; i < arrSz; i++) {
		if ((sldDataArr[i].sldRoot == null) || (sldDataArr[i].sldRoot == "")) {
			sldThmbPath = "";
			}
		else if (sldDataArr[i].maxF > 1) {
			sldThmbPath = sldDataArr[i].sldRoot + Math.floor((sldDataArr[i].maxF - 1)/2) + "\/0\/0\/0.jpg";
			}
		else { sldThmbPath = sldDataArr[i].sldRoot + "0\/0\/0.jpg"; }  // no F-level
		if (sldDataArr[i].lblPathName == null) {sldDataArr[i].lblPathName = ""; }
		if (sldDataArr[i].sldSpecies == null) {sldDataArr[i].sldSpecies = ""; }
		if (sldDataArr[i].sldOrgan == null) {sldDataArr[i].sldOrgan = ""; }
		sldItmObj = {
						num: sldDataArr[i].sldNum,
						txtNm: sldDataArr[i].sldName,
						tis: sldDataArr[i].sldOrgan,
						spc: sldDataArr[i].sldSpecies,
						stn: sldDataArr[i].strStainAbbr,
						maxF: sldDataArr[i].maxF,
						lblPath: sldDataArr[i].lblPathName,
						thmbPath: sldThmbPath
						};
		glbSldItmArr.push(sldItmObj);
		}
	selSortItmArr();
	lstWndBuild();
	return;
	}

function selSortItmArr() {
	var arrI = menuGetSrtByArrI();
	if (Number.isNaN(arrI)) { return; }  // menuGetSrtByArrI() issued error message
	switch (glbMenuSrtByArr[arrI].id) {
		case "num": 
			glbSldItmArr.sort(function(a,b){return(glbMenuSrtDir * (a.num - b.num))});
			break;
		case "name": 
			glbSldItmArr.sort(function(a,b){return(selStrSort(a.txtNm,b.txtNm))});
			break;
		case "tis": 
			glbSldItmArr.sort(function(a,b){return(selStrSort(a.tis,b.tis))});
			break;
		case "maxF": 
			glbSldItmArr.sort(function(a,b){return(glbMenuSrtDir * (a.maxF - b.maxF))});
			break;
		case "stn": 
			glbSldItmArr.sort(function(a,b){return(selStrSort(a.stn,b.stn))});
			break;
		case "spc": 
			glbSldItmArr.sort(function(a,b){return(selStrSort(a.spc,b.spc))});
			break;
		default: 
			alert("selSortItmArr():  Could not find \"" + glbMenuSrtByArr[arrI].id 
						+ "\" in sort list.  Could not sort the list of slides."
						+ "\n\n  Please report this error.");
		}
	return;
	}

	// selStrSort() is a comparison function used by the array[].sort() routine.  It is called
	//		by selSortItmArr() when sorting on text-string elements within the array of slide-
	//		information objects.
	//	The function strips out "<...>" HTML formatting strings, converts &...; HTML characters
	//		(currently only "&amp;" and "&nbsp;") into their ASCII equivalents, converts the 
	//		string to lowerCase, uses strA.localeCompare(strB) to compare the string, and returns
	//		that value (after multiplying by glbMenuSrtDir.
function selStrSort(a,b) {
	var aStr = a;
	var bStr = b;
	var str = [aStr,bStr];
		// remove formatting characters
	var i;
	var strtI;
	var endI;
	for (i = 0; i < 2; i++) {
			// remove < ... > formatting strings
		strtI = str[i].indexOf("<");
		while (strtI >=0) {
			endI = str[i].indexOf(">")
			if (endI < strtI) {
				break;
				}  // <> pair mismatch
			str[i] = str[i].slice(0,strtI) + str[i].slice(endI+1);
			strtI = str[i].indexOf("<");
			}
			// replace special characters
		str[i] = str[i].replace(/&nbsp;/g," ");
		str[i] = str[i].replace(/&amp;/g,"&");
		str[i] = str[i].toLowerCase();
		}
	var retVal = str[0].localeCompare(str[1]);
	retVal *= glbMenuSrtDir;
	return(retVal);
	}

		// Handles time-out failures when connecting to server
function ajxConnectFail() {
	glbAjxTimer = Number.NaN;
	var timeOutSec = glbAjxTimeOut/1000;
	var timeOutStr = timeOutSec.toPrecision(2);
	var txtStr = "Timed-out while trying to connect with the server!"
	txtStr += "\n  The PNWU Slide Box will not function without a server connection.";
	txtStr += "\n\n  Click \"OK\" if you want to wait another " + timeOutStr + " seconds";
	txtStr += "\n      	to see if a server connection can be established.";
	txtStr += "\n  Click \"Cancel\" if you want to quit.";
	if (confirm(txtStr)) {
		glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
		}
	else {
			// srchPage currently is displayed, but "Get slide list" button is hidden 
			//		srchPage is not hidden until lstBuildWnd() is ready to display lstPage
		document.getElementById("startBtn").style.visibility = "visible";
		document.body.style.cursor = "";  // this should restore the cursor

		}
	return;
	}


