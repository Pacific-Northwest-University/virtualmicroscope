//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbList.js is part of the "slide box" portion of the "PNWU Virtual Microscope",
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

// jrsbList.js contains =>  functions related to the "list page", which displays the list of slides
//	this file was initially created on 5/25/20




function gotoViewer(nodeId,musEvt) {
	var isShftKey = musEvt.shiftKey;
	var isCntrlKey = musEvt.ctrlKey;
	var urlSldBox = "http://viewer.pnwu.edu/?sb";
	if ((nodeId.length > 4) && (nodeId.slice(0,4) == "sld_")) { // a sldItm box was clicked
		urlSldBox += "=" + nodeId.slice(4);
		}
	if (isShftKey) { window.open(urlSldBox,"_blank"); }
	else if (isCntrlKey) { window.location.assign(urlSldBox); }
	else { window.location.replace(urlSldBox); }
	return;
	}



// *********************************************************
// ******      functions for building slide-list      ******
// *********************************************************


	// lstWndBuild() is called by selMakeItmArr() just before selMakeItmArr() returns
	//		i.e., after glbSldItmArr[] has been created.  lstWndBuild() calls lstMenuBuild()
	//		to construct the menu, and then calls lstBoxBuild() to constrct the
	//		list window (lstWndClass)
function lstWndBuild() {
		// lstPage display must be "block" to calculate menu dimensions.
		//	srchPage must be out-of-the-way (.display = "none") before displaying lstPage
		//	keep lstPage hidden while building it
	lstPageNode = document.getElementById("lstPage");
	if (lstPageNode == null) {
		alert("lstWndBuild():  Can't get node for list-page; can't display list of slides."
					+ "\n\n  Please report this error.");
		return;
		}
	document.getElementById("srchPage").style.display = "none";
	lstPageNode.style.visibility = "hidden";
	lstPageNode.style.display = "block";
	lstPageNode.style.height = "100%";
			// set list-page width => assumes no vertical-scroll bar
	if (Number.isNaN(glbColNum)) {
		alert("lstWndBuild():  glbColNum has not yet been calculated.\n\n  Please report this error.");
		prgGetNumCol();   // calculate the number of columns 
		}
	var lstWndWdth = (glbSldItmWdth * glbColNum) + (glbSldItmHMrg * (glbColNum -1)) + 2;  // 1px border
	lstPageNode.style.width = lstWndWdth + "px";
	lstWndHCenter(lstWndWdth);  // center without scrollbar
			// set-up header
	var txtStr;
	var lstHdrNode = document.getElementById("lstPageHdr");
	if (lstHdrNode == null) {
		alert("lstWndBuild(): Can\'t get node for header.  This probably is a fatal error."
					+"\n\n  Please report this error.");
		return;
		}
	if (glbSldItmArr.length == 0) {
		lstHdrNode.innerHTML = "No slides matching your criteria were found.  Try creating a new list with fewer limits.";
		lstPageNode.style.visibility = "visible";
		lstPageNode.style.top = "20px";
		lstPageNode.style.height = (lstGetBoxTop() + 2) + "px";
		return;
		}
	else {  // need to reset lstPage top after a "no result" page (which sets lstPageNode.style.top = 20px)
		lstPageNode.style.top = "0px";
		}
	txtStr = "Click on the &quot;slide&quot; (<span style='font-size:75%'>box containing ";
	txtStr += "slide information (<span style='font-size:80%'>below</span>)</span>) "
	txtStr += "to view the slide in PNWU Virtual Microscope.";
	lstHdrNode.innerHTML = txtStr;
	lstMenuBuild();
	lstBoxBuild();
	return;
	}

function lstGetBoxTop() {
	var boxTop;
	var lstHdrNode = document.getElementById("lstPageHdr");
			// if can\'t get node for lstPageHdr, rather than generating a fatal error
			//		display error message and use default value
	if (lstHdrNode == null) {  // rather than generatinreturn, let the program try to build the list-page without lstHdr
		alert("lstGetBoxTop(): Can\'t get node for header.  This probably is a fatal error."
					+"\n\n  Please report this error.");
		boxTop = 83;  // use default value for boxTop
		}
	else {  // need now for "no slide" case, but recalculated by lstBuildMenu
		boxTop = lstHdrNode.offsetTop + lstHdrNode.offsetHeight;
		}
	return(boxTop);
	}

	// lstWndHCenter() is passed the width of the list-window (lstPage).  The function centers the
	//		lstPage horizontally
function lstWndHCenter(pgWdth) {
	var wndWidth = window.innerWidth;
		// 4 extra pixels for 2px border
	var pgLeft = Math.round((wndWidth - pgWdth - 4)/2);
	if (pgLeft < 0) { glbIsLstHScrl = true; }
	else { glbIsLstHScrl = false; }
	if (pgLeft < 0) { pgLeft = 0; }
	document.getElementById("lstPage").style.left = pgLeft + "px";
	return;
	}

	// eventually, lstMenuBuild() will create menu items for to regulate pages: a drop-down with
	//	Go to next, previous, first, and last pages and a text-edit window showing the 
	//	current page # and allowing the user to enter a page number.  However, this feature will
	//	wait until we have sufficient slides in the database to test it.
function lstMenuBuild() {
	var pageNode;  // node for lstPage => only need this if adding a new line to menu
	var mainNode;  // node to line of menu
		// because of the size of a criterion box, we are guaranteed that there will be space in
		//	the menu for the "Create new list" and "To Microscope without slide" buttons
		//	for all other elements, need to test for space. 
	var leftSide = document.getElementById("menuLstBackToSrch").offsetWidth;
	var rightSide = document.getElementById("menuLstToView").offsetLeft;
	var menuSpc = rightSide - leftSide;
	var menuItmNum = 0;
			// "Create new search" is first item (itmeNum = 0) in first row (row = 0)
	glbLstMenuArr.push({row: 0, itmNum: menuItmNum, id: "menuLstBackToSrch",wdth: leftSide}); 
	menuItmNum++;
	var curNode = lstMenuNumSldBuild();
	if (curNode == null) {  // lstMenuNumSldBuild() already displayed error message
		glbLstMenuArr.splice(0);
		return;
		}
	var nxtNode;
	var itmWdth;
	var marg;
			// normally, the "number of slides in list" menu-item has a width of 255px
	if (menuSpc > 255) {  // put "number of slides" on 1st row of menu
				// get node to menu (1st row), and node last element in 1st row of menu
		mainNode = document.getElementById("menuLst1");
		if (mainNode == null) {
			alert("lstMenuBuild(): can\'t get node for list-page menu; can\'t add "
					 + "\"Number of slides in list\" box to menu.\n\n  Please report this error.");
			glbLstMenuArr.splice(0);
			return;
			}
		nxtNode = document.getElementById("menuLstToView");
		if (nxtNode == null) {
			alert("lstMenuBuild(): can\'t get node for \"To Microscope\" button; can\'t add "
						+ "\"Number of slides in list\" box to menu.\n\n  Please report this error.");
			glbLstMenuArr.splice(0);
			return;
			}
		mainNode.insertBefore(curNode,nxtNode);
			// center "number of slides" box and enter it into glbLstMenuArr[]
		itmWdth = curNode.offsetWidth;
		marg = Math.round((menuSpc - itmWdth)/2);
		curNode.style.marginLeft = marg + "px";
		glbLstMenuArr.push({row: 0, itmNum: menuItmNum, id: "menuLstNumSld",wdth: itmWdth});
		menuItmNum++;
				// add "To Microscope" button to row 0 list in glbLstMenu
		itmWdth = nxtNode.offsetWidth;
		glbLstMenuArr.push({row: 0, itmNum: menuItmNum, id: "menuLstToView",wdth: itmWdth});
		}  // end "if it fits on 1st row

	else {	// new menu items go into 2nd row
			// add "To Microscope" btn to glbLstMenuArr[] before starting 2nd row
		itmWdth = document.getElementById("menuLstToView").offsetWidth;
		glbLstMenuArr.push({row: 0, itmNum: menuItmNum, id: "menuLstToView",wdth: itmWdth});
		menuItmNum = 0;
			// create new line of menu.
		pageNode = document.getElementById("lstPage");
		if (pageNode == null) {
			alert("lstMenuBuild(): can\'t get node for list-page; can\'t add "
						+ "\"Number of slides in list\" box to menu.\n\n  Please report this error.");
			glbLstMenuArr.splice(0);
			return;
			}
		mainNode = document.createElement("div");	
		if (mainNode == null) {
			alert("lstMenuBuild(): can\'t create node for second row of menu; can\'t add "
						+ "\"Number of slides in list\" box to menu.\n\n  Please report this error.");
			glbLstMenuArr.splice(0);
			return;
			}
		mainNode.className = "menuMainClass";
		mainNode.id = "menuLst2";
		nxtNode = document.getElementById("lstPageHdr");
		if (nxtNode == null) {
			alert("lstMenuBuild(): can\'t get node for list-page header.  "
						+ "Cannot add a new row to the menu, and cannot add "
						+ "\"Number of slides in list\" box to menu.\n\n  Please report this error.");
			glbLstMenuArr.splice(0);
			return;
			}
		pageNode.insertBefore(mainNode,nxtNode);
				// add "number of slides" box to 2nd row of menu and center it
		mainNode.appendChild(curNode);
		rightSide = mainNode.clientWidth;
		itmWdth = curNode.offsetWidth;
		marg = Math.round((rightSide - itmWdth)/2);
		curNode.style.marginLeft = marg + "px";
		glbLstMenuArr.push({row: 1, itmNum: menuItmNum, id: "menuLstNumSld",wdth: itmWdth});
		menuItmNum++;
		}  // end "else create new row of menu"


//alert("Menu width = " + menuWdth + "; lsftSide = " + leftSide + "; rightSide = " + rightSide + "; numSldLeft = " + sldNumLeft + "; numSldWdth = " + sldNumWdth);
//  TEMPORARY
//var i;
//var arrSz = glbLstMenuArr.length;
//var tmpStr = "glbLstMenuArr.length = " + arrSz;
//for (i = 0; i < arrSz; i++) {
//	tmpStr += "\n glbLstMenuArr[" + i + "].id = \"" + glbLstMenuArr[i].id + "\"; .wdth = " + glbLstMenuArr[i].wdth;
//	tmpStr += "; .row = " + glbLstMenuArr[i].row + "; .itmNum = " +  glbLstMenuArr[i].itmNum;
//	}
//alert(tmpStr);
// END TEMPORARY
//alert("Menu width = " + menuWdth + "; lsftSide = " + leftSide + "; rightSide = " + rightSide + "; hdrTop = " + hdrTop + "; hdrHt = " + hdrHt);
	
	
	return;
	}


	// Before returning from list-page to search-page, the list-page menu has to be restored to
	//	its initial state.  This involves removing any extra lines for the menu and removing any
	//	items that were added to  the 1st line of the menu
function lstResetMenu() {
	var isTwoRow = false;  // set to true if menu has a 2nd row
	var arrSz = glbLstMenuArr.length;
	if (arrSz <= 0) { return; }
	var i;
	var mainNode = document.getElementById("menuLst1");
	var chldNode;
	if (mainNode == null) {
		alert("lstResetMenu(): can't get node for list-page menu.  This probably is a fatal error."
					+ "\n\n  Please report this error.");
		return;
		}
	for (i = 0; i < arrSz; i++) {
			// skip 'permanent' 1st row buttons
		if (glbLstMenuArr[i].id == "menuLstBackToSrch") { continue; }
		if (glbLstMenuArr[i].id == "menuLstToView") { continue; }
		if (glbLstMenuArr[i].row > 0) {  // menuLst2 items will be removed after menuLst1 is reset
			isTwoRow = true;
			continue;
			}
		chldNode = document.getElementById(glbLstMenuArr[i].id);
		if (chldNode == null) {
			alert("lstResetMenu(): node for \"" + glbLstMenuArr[i].id + "\" is null.")
			continue;
			}
		mainNode.removeChild(chldNode);
		}
	if (isTwoRow) {  // need to remove entire row: mainNode is lstPage, chldNode is 2nd row of menu
		mainNode = document.getElementById("lstPage");
		if (mainNode == null) {
			alert("lstResetMenu(): can't get node for list-page.  This probably is a fatal error."
						+ "\n\n  Please report this error.");
			return;
			}
		chldNode = document.getElementById("menuLst2");
		if (chldNode == null) {
			alert("lstResetMenu(): can't get node for second line of menu.  This probably is a fatal error."
						+ "\n\n  Please report this error.");
			return;
			}
		mainNode.removeChild(chldNode);
		}
			// the list-page menu has been "cleared-out", so only the "permanent" items are left on the menu.
			// The "permanent" items in the menu are added to glbLstMenu[] when the "extra" items are 
			//	created (and added to glbLstMenu[]), to keep all items in order.  After removing the "extra"
			//	items from the list-page, glbLstMenuArr[] should be empty.
	glbLstMenuArr.splice(0);  // re-set glbLstMenuArr[]
	return;
	}


	// lstMenuNumSldBuild() creates the "number of slides in list" menu item.
	//	It returns the node for the item.  On error, it returns null
function lstMenuNumSldBuild() {
			// create menu-item node ("menuLstNumSld")
	var mainNode = document.createElement("div");
	if (mainNode == null) {
		alert("lstMenuNumSldBuild(): can\'t create a node for the "
					+ "\"number of slides in list\" box on the slide-list page's menu.  "
					+ "\n\n  Please report this error.");
		return(null);
		}
	mainNode.className = "menuInfoItemClass menuItmBothClass";
	mainNode.id = "menuLstNumSld";
	mainNode.style.cssFloat = "left";
			// create infoBox node
	var chldNode = document.createElement("div");
	if (chldNode == null) {
		alert("lstMenuNumSldBuild(): can\'t create a node for the data-field in the "
					+ "\"number of slides in list\" box on the slide-list page's menu.  "
					+ "Can\'t create the \"number of slides in list\" box on the menu."
					+ "\n\n  Please report this error.");
		return(null);
		}
	chldNode.className = "menuInfoBoxClass";
	chldNode.id = "menuLstNumSldVal";
	chldNode.innerHTML = glbSldItmArr.length;
	mainNode.appendChild(chldNode);
			// create text node
	chldNode = document.createElement("span");
	if (chldNode == null) {
		alert("lstMenuNumSldBuild(): can\'t create a node for the text-field in the "
					+ "\"number of slides in list\" box on the slide-list page's menu.  "
					+ "Can\'t create the \"number of slides in list\" box on the menu."
					+ "\n\n  Please report this error.");
		return(null);
		}
	chldNode.className = "menuInfoTxtClass";
	chldNode.innerHTML = "Number of slides in list:&nbsp;";
	mainNode.appendChild(chldNode);
	return(mainNode);
	}



function lstBoxHt() {
	var numRow = Math.ceil(glbSldItmArr.length/glbColNum);
		//height of list => there are no top & bottom borders on list
	var lstHt = ((numRow - 1) * (glbSldItmHt + glbItmVMrg)) + glbSldItmHt;
	return(lstHt);
	}


function lstBoxBuild() {
	var lstWndBorder = 2;  // 2 * number of pixels on SIDES of lstBox (lstWnd)
	var lstPageBorder = 4;  // 2 * number of pixels in page border
	var colWdth = glbSldItmWdth + glbSldItmHMrg;
	var wndNode = document.getElementById("lstPage");  // node to everything except menu
	if (wndNode == null) {
		alert("lstBoxBuild():  unable to get node for \"lstPage\".  This is a lethal error"
					+ "\n\n  Please report this error.");
		document.getElementById("srchPage").style.display = "block";
		return;
		}
		// calculate number of rows
	var arrSz = glbSldItmArr.length; 	// get slide data from database
	var wndHt = window.innerHeight - lstGetBoxTop() - lstPageBorder; // height of visible part of list-window
	if (glbIsLstHScrl) {   // need space for horizontal scroll bar if lstPage wider than window
		wndHt -= glbScrlWdth;
		}
		// lstWdth is the width of all columns: box-sizing: border-box so nothing for 1px border
	var lstWdth = ((glbColNum-1) * colWdth) + glbSldItmWdth;  // width all cols
	var lstHt = lstBoxHt(); // height of list
	if (wndHt < lstHt) {
		lstWdth += glbScrlWdth;
		lstWndHCenter(lstWdth + lstWndBorder);  // re-center now that scrollbar is present
		glbIsLstVScrl = true;
		}  // won't fit on screen; add scroll bars
	else {
		// lstWndHCenter() already was called by lstMenuBuild() with assumption of no scrollbar
		wndHt = lstHt;
		glbIsLstVScrl = false;
		} // set list-window height to fit list
			// make wndNode visible
	wndNode.style.width = (lstWdth + lstWndBorder + 4) + "px";
	wndNode.style.overflowY = "hidden";
	wndNode.style.visibility = "visible";  // why are we making it visible here?
			// calculate margins
	var colFirstLeft = 0;
	var lstNode =  document.createElement("div");
	if (lstNode == null) {
		alert("lstBuildWnd(): Could not create node for list of slides.  This is a fatal error."
						+ "\n\n  Please report this error.");
		return;
		}
	lstNode.id = "lstWnd";
	lstNode.className = "lstWndClass";
	wndNode.appendChild(lstNode);
		// set lstNode paramenters
	if (glbIsLstVScrl) { lstNode.style.overflowY = "scroll"; }
	else { lstNode.style.overflowY = "auto"; }  // auto is safer than hidden
	lstNode.style.height = wndHt + "px";
	lstNode.style.left = colFirstLeft + "px";
	lstNode.style.width = lstWdth + "px";
			// lstBuildLst() returns false on failure => 
			//	if failure, remove lstNode ("lstWnd") to avoid memory leac
	var retVal = lstBuildLst(lstNode,0,arrSz,glbColNum);
	if (!lstBuildLst(lstNode,0,arrSz,glbColNum)) {  // start & end values will need to be adjusted when we add pages
		wndNode.removeChild(lstNode);
		} 
	if (wndHt == lstHt) { // list fits on one page
		wndHt += lstNode.offsetTop + 4;
		wndNode.style.height = wndHt + "px";
		}
	return;
	}

	// lstBuildLst() is passed the node for "lstWnd",
	//		the starting and ending (exclusive) indices into glbSldItmArr[]
	//		abd the number of columns
	//	The function adds sldItmEntry boxes to "lstWnd" for strtI <= arrI < endI
	//	The function returns true if no errors
	//	The function returns false on error.
function lstBuildLst(mainNode,strtI,endI,totCol) {
			// get limits for for i,j loop
	var arrLim = glbSldItmArr.length;
	if (arrLim > endI) { arrLim = endI; }
	var numRow = Math.ceil(arrLim/totCol);
	var arrI = strtI; //  index into glbSldItmArr
	var i;  // counter for rows
	var j;	// counter for columns
	var elm;  // counter of elements 
	var itmNode;
	var itmWdth = glbSldItmWdth + glbSldItmHMrg;
	var itmHt = glbSldItmHt + glbItmVMrg;
	var chldNode;
	var txtElm;  // text containing child's name for error messages
			// create each slide-entry item; i counts over rows, j counts over columns
	for (i = 0; (i < numRow) && (arrI < arrLim); i++) {
		for (j=0; (j < totCol) && (arrI < arrLim); j++) {
				// create itmNode
			itmNode =  document.createElement("div");
			if (itmNode == null) {
				alert("lstBuildLst(): Could not create entry for slide #"
						+ glbSldItmArr[arrI].num + " (\"" + glbSldItmArr[arrI].txtNm 
						+ "\").  Can\'t display slide list.\n\n  Please report this error.");
				return(false);
				}
			itmNode.id = "sld_" + glbSldItmArr[arrI].num;
			itmNode.className = "sldItmEntry";
			mainNode.appendChild(itmNode);
			itmNode.onclick = function(){gotoViewer(this.id,event)};
			itmNode.style.top = (i * itmHt) + "px";
			itmNode.style.left = (j * itmWdth) + "px";
			mainNode.appendChild(itmNode);
			for (elm = 0; elm < 3; elm++) {  // this loop creates the 3 children of itmNode
				if (elm == 0) { chldNode = lstBuildSldTxt(arrI); }
				else if (elm == 1){ chldNode = lstBuildSldImg(arrI,"thumbnail"); }
				else if (elm == 2){ chldNode = lstBuildSldImg(arrI,"label"); }
				else {
					alert("lstBuildLst(): illegal value for \"elm\" (" + elm 
						+ ") when creating entry for slide #"
						+ glbSldItmArr[arrI].num + " (\"" + glbSldItmArr[arrI].txtNm 
						+ "\").  Can\'t display slide list.\n\n  Please report this error.");
					return(false);
					}
				itmNode.appendChild(chldNode);
				}
					// increment arrI to point to next entry in glbSldItmArr[]	
			arrI++;
			}   // end 'for j' loop through columns
		}   // end 'for i' loop through rows
	return (true);
	}

function lstBuildSldTxt(arrI) {
	var divNode =  document.createElement("div");
	if (divNode == null) {
		alert("lstBuildSldTxt(): Could not create node for text-box for slide #"
				+ glbSldItmArr[arrI].num + " (\"" + glbSldItmArr[arrI].txtNm 
				+ "\").  Can\'t display slide list.\n\n  Please report this error.");
		return(null);
		}
	divNode.className = "sldItmTxt";
	var	txtStr = "Slide number:&nbsp; " + glbSldItmArr[arrI].num + "<br>"
	txtStr += "Slide name:&nbsp; " + glbSldItmArr[arrI].txtNm + "<br>"
	txtStr += "Tissue:&nbsp; " + glbSldItmArr[arrI].tis + "<br>"
	txtStr += "Species:&nbsp; " + glbSldItmArr[arrI].spc + "<br>"
	txtStr += "Stain:&nbsp; " + glbSldItmArr[arrI].stn + "<br>"
	txtStr += "Number of focal planes:&nbsp; " + glbSldItmArr[arrI].maxF;
	divNode.innerHTML = txtStr;
	return(divNode);
	}

	// lstBuildSldImg() is passed the index to glbSldItmArr[] and a string indicating whether
	//	the function is supposed to build the label image or the thumbnail.
	//		This string MUST be either "label" or "thumbnail"
	// Function returns the newly created node; returns null on error
function lstBuildSldImg(arrI,imgType) {
		// determine whether this is a label or thumbnail
	var isLbl;
	if (imgType == "label") { isLbl = true; }
	else if (imgType == "thumbnail") { isLbl = false; }
	else {
		alert("lstBuildSldImg(): Could not interpret imgType = \"" + imgType 
				+ "\" for slide #" + glbSldItmArr[arrI].num + " (\"" + glbSldItmArr[arrI].txtNm 
				+ "\").  Can\'t display slide list.\n\n  Please report this error.");
		return(null);
		}
		// create error string for missing image
	var txtStr = "<br><br>No " + imgType + "<br>for slide #" + glbSldItmArr[arrI].num;
	txtStr += "<br>\"" + glbSldItmArr[arrI].txtNm + "\"";
		// get path to image
	var imgPath = glbSldItmArr[arrI].thmbPath;
	if (isLbl) {imgPath = glbSldItmArr[arrI].lblPath; }
	var isImg = true;
	if ((imgPath == null) || (imgPath == "")) { isImg = false; }
		// create new node
	var imgNode;
	if (!isImg) { imgNode = document.createElement("div"); } // no image; use div
	else { imgNode = document.createElement("img"); }
	if (imgNode == null) {
		alert("lstBuildSldImg(): Could not create node for " + imgType + " for slide #"
				+ glbSldItmArr[arrI].num + " (\"" + glbSldItmArr[arrI].txtNm 
				+ "\").  Can\'t display slide list.\n\n  Please report this error.");
		return(null);
		}
	imgNode.className = "sldItmImg";
	if (!isImg) {  // no image
		imgNode.innerHTML = txtStr;
		}
	else {  // node is "img" => set src & alt
		imgNode.src = imgPath;
		imgNode.alt = txtStr;
		}
	return(imgNode);
	}
