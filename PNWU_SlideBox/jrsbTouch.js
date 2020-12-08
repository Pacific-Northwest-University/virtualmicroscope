//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbTouch.js is part of the "slide box" portion of the "PNWU Virtual Microscope",
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

// jrsbTouch.js contains =>  Functions needed for to handle TouchEvents (for touch-screen devices) for 
//	the slide-box part of PNWU Virtual microscope.  This file was initially created on 6/07/20

// For time reasons, I'm hoping to keep this simple and to use as much mouse-emulation as possible.
//	In the future, it probably would be good to explicitly handle touchEvents as touchEvents.  Maybe
//		we can find someone with an undergraduate web-design course whose students would like to
//		tackle this problem

//  On the search-page, there are two types of drop-down menus:  1) the side menu's attached to the
//		criterion-boxes, and 2) drop-down sub-menus from the main menu.
//	I had hoped that I could use mouse-emulation to disply the drop-down/side menu's, but we may need
//		to handle this explicitly in order to keep track of which menu is displayed.

	// if a touchEvent occurs, adds mousedown eventListener to handle situation where mouse and touch-screen
	//		are both used.
function tchTestMus() {
	if (glbHasTch) { return; }
	document.addEventListener("mousedown",tchClrMenu);
	tchGlbClrInit();
	glbHasTch = true;
	return;
	}

	// tchGlbClrPrev() and tchGlbClrInit() were written on 11/28/20 to deal with the problem
	//	that touching anywhere on the screen except on a menu would not close a currently open menu.
	//	As usually is the case for TouchEvents, implementation was really buggy, and to try 
	//	to keep time commitment reasonable, we ended up improvising.
	// tchGlbClrInit() adds eventListeners to elements whose nameClass includes one of the
	//	text-strings in clsNmArr[].  I tried including the menu, and the menu drop-down containers
	//	stopped working even if I specifically trapped them and resent the tchMenuClcked() command ...
	//	so I dropped the menu from the list of elements that, if touched, would close an 
	//	open drop-down menu.  srchIntrClass didn't work until I added an ontouchend="..." to the 
	//	"startBtn" button in the *.htm files.  For now tchGlbClrInit() is called by  tchTestMus() 
	//	so the eventListeners are only after a touch-screen event has activated a menu.  This may
	//	cause bugs later, but seems to work right now.
	// BTW, adding the eventListener to "srchRightClass" did not seem to work, so I had to add the
	//	eventListeners to "srchInstrClass", and "srchLogoClass".  Bugs everywhere...

function tchGlbClrInit() {
	var nodeLst;  // holds nodeList array
	var clssNmArr = [
					"sbBkgrdClass",
					"srchPageTitleClass",
					"srchInstrClass",
					"srchLogoClass"
					];
	var i;
	var j;
	var lstSz
	for (i = 0; i < clssNmArr.length; i++) {
		nodeLst = document.getElementsByClassName(clssNmArr[i]);
		lstSz = nodeLst.length;
		for (j=0; j<lstSz; j++) {
			nodeLst[j].addEventListener("touchstart",function() {tchGlbClrPrev(this, event);},true);
			}
		}
	return;
	}

	// tchGlbClrPrev() is called by eventListners added to the background and right-side elements
	//	by tchGlbClrInit() ... see above.  If no menu is displayed, the function returns without
	//	doing anything.  If a menu is open, clicking on one of the "empty" (non-clickable) space
	//	to which tchGlbClrInit() had added an eventListener, causes tchGlbClrPrev() to call
	//	tsrchResetCntr() to close the open menu, and srchShowArrows() to re-display the criterion
	//	box arrows.
function tchGlbClrPrev(tnode,tevt) {
	tevt.preventDefault();
	if (glbTchMenuOpen == "") { return; }
	tsrchResetCntr("cur");  // close current menu
	srchShowArrows();
	return;
	}

	// tchClrMenu() is called when there is a mousedown event AFTER glbHasTch has been set to true
	//		and a mousedown eventlistner has been added to the document.  It clears any
	//		.style.display = "none" set on dropdown menus by a touchEvent.  This allows the
	//		:hover CSS command to work with the mouse cursor.
function tchClrMenu() {
	if ((glbTchMenuOpen == "") && (glbTchPrevOpen == "")) {return;}
	if (glbTchMenuOpen != "") {tsrchResetCntr("cur");}
	if (glbTchPrevOpen != "") {tsrchResetCntr("prev");}
	return;	
	}


	// for the mouse main-menu drop-down menus are displayed through a CSS ;hover statement.
	//	For touchEvents, we have to add an eventListner.
	//	Similarly, "menuClickable" subItems need touchstart and touchend eventListeners
function tchInitMainMenu() {
	var i;
			// attach touchstart eventListener to main menu drop-down items
	var nodeLst = document.getElementsByClassName("menuDrpDwnItemClass");
	var lstSz = nodeLst.length;
	for (i = 0; i < lstSz; i++) {
		nodeLst[i].addEventListener("touchstart",function(){tchMenuMainDwn(this,event)});
		}
			// attach touchstart and touchend eventListeners to menuClickable items
	nodeLst = document.getElementsByClassName("menuClickable");
	lstSz = nodeLst.length;
	for (i = 0; i < lstSz; i++) {
		nodeLst[i].addEventListener("touchstart",function(){tchMenuClcked(this,event)});
		nodeLst[i].addEventListener("touchend",function(){tchMenuClcked(this,event)});
		nodeLst[i].addEventListener("touchcancel",function(){tchMenuClcked(this,event)});
		}
	return;
	}

	// tsrchCrtMainDwn() is called by a touchstart event on one of the criterion boxes.
	//	After using tsrchResetCntr() to clean-up any previously opened menus, the function
	//		sets the criterion-box background color to the :hover color, causes the 
	//		side menu to be displayed, and uses glbTchMenuOpen to mark the side menu as displayed.
	//	11/21/20 - it also calls srchHideArrows() to hide the arrows on other criterion boxes
function tsrchCrtMainDwn(tchdNode,tevt) {
	tevt.preventDefault();
	var mainNode = tchGetNodeByClass(tchdNode,"crtMainBoxClass");
	if (mainNode == null) { return; } // tchGetNodeByClass() already issued error message
	var mainIdTxt = mainNode.id.slice(0,3);  // mainNode.id = glbSrchMainArr[].txtId + "CrtMain";
	var cntrId = "crtSdCntr_" + mainIdTxt;  
			// if a menu was closed previously, reset .style.display = "" and 
			//		set parentNode.style.backgroundColor = ""
	if ((glbTchPrevOpen !="") && (glbTchPrevOpen != cntrId)) {  // if a menu was closed previously, reset to "none"
		tsrchResetCntr("prev");
		}
			// if a menu already is open => close it by setting .style.display = "none"
			//		and set parentNode.style.backgroundColor to non-:hover color defined by CSS
	if ((glbTchMenuOpen != "") && (glbTchMenuOpen != cntrId)) {
		tsrchResetCntr("cur");
		}
	mainNode.backgroundColor = "rgb(232,200,200)";
	document.getElementById(cntrId).style.display = "block";
	glbTchMenuOpen = cntrId;
		// 11/21/20 - hide arrows
	var mainI = srchIdToI(mainIdTxt,glbSrchMainArr);
	srchHideArrows(mainI);
	return;	
	}

	//	Once the drop-down menu (side-menu is displayed, 'clicking' (i.e., touchstart followed by touchend)
	//		an element in the drop-down menu should cause the menu to be closed (display = none).  
	//	- The touchstart event should be the same as the mouse-button-down (i.e. "active" CSS state)
	//		... the color of the element should change.
function tsrchSdBtnDwn(tchdNode,tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var itmNode = tchGetNodeByClass(tchdNode,"crtSideItmClass");
	if (itmNode == null) { return; } // tchGetNodeByClass() already issued error message
	var cntrNode = tchGetNodeByClass(itmNode,"crtSideContainerClass");
	if (cntrNode == null) { return; }  //tsrchGetSdItmNode() already issued error message
		// if a previous container has .style.display == "none" =>
		//		clear the "none"
	if ((glbTchPrevOpen !="") && (glbTchPrevOpen != cntrNode.id)) { 
		tsrchResetCntr("prev");
		}
		// if a differnt container is open, close it and set glbTchPrevOpen
		//		so the .style.display = "none" can be cleared
	if ((glbTchMenuOpen !="") && (glbTchMenuOpen != cntrNode.id)) {
		tsrchResetCntr("cur");
		}
	glbTchMenuOpen = cntrNode.id;  // set MenuOpen to container-node
		// cntrNode.style.display already is "block" if tchdNode was touched
		// set itmNode to CSS :active state
	itmNode.style.backgroundColor = "rgb(200,200,232)";
	return;
	}


	//	Once the drop-down menu (side-menu is displayed, 'clicking' (i.e., touchstart followed by touchend)
	//		an element in the drop-down menu should cause the menu to be closed (display = none).  
	//	- The touchend (or touchcancel) event should be the same as a mouse-click:
	//		1) the drop-down menu should disappear.  For a mouse-event, this involves first going to :hover,
	//			and then the menu disappearing when the mouse moves off the container; however, the finger
	//			lifting off the object is the same as moving off the container
	//		  11/21/20 - this also should restore other criterion box arrows - I think that the call to 
	//			srchShowArrows() should go in this function (and in tchMenuMainDwn) rather than in tsrchResetCntr()
	//		2) the action specified by the button should be done
function tsrchSdBtnUp(tchdNode,tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var itmNode = tchGetNodeByClass(tchdNode,"crtSideItmClass");
	if (itmNode == null) { return; } //tsrchGetSdItmNode() already issued error message
	var cntrNode = tchGetNodeByClass(itmNode,"crtSideContainerClass");
	if (cntrNode == null) { return; }  //tsrchGetSdItmNode() already issued error message
		// if a previous container has .style.display == "none" =>
		//		reset container to "" values
	if ((glbTchPrevOpen !="") && (glbTchPrevOpen != cntrNode.id)) { 
		tsrchResetCntr("prev");
		}
	if (glbTchMenuOpen == "") {  // this should never happen since the corresponding touchstart event 
					//  should have set glbTchMenuOpen, but we should check
		alert("tsrchSdBtnUp() the menu (\"" + cntrNode.id + "\") for the \'click\' on \"" + itmNode.id 
					+ "\" is NOT reported as open (glbTchMenuOpen = \"" + glbTchMenuOpen + "\")."
					+ "\".\n\n  Please report this error.");
		}
	if (glbTchMenuOpen != cntrNode.id) {  // this should never happen since the corresponding touchstart event 
					//  should have set glbTchMenuOpen, but we should check
		alert("tsrchSdBtnUp() the \'finger-up\' event (touchend) does not match the \'finger-down\' (touchstart) "
					+ "for the \'click\' on \"" + itmNode.id + "\".\n\n  Please report this error.");
		tsrchResetCntr("cur");
		glbTchMenuOpen = cntrNode.id;
		}
	srchShowArrows();
	srchMenuInp(itmNode.id);  // call the \"onclick\" function
	itmNode.style.backgroundColor = "";
	tsrchResetCntr("cur");
	return;
	}

	//	6/8/20: I combined tsrchGetSdItmNode() and tsrchGetSdContr() into a single function:  
	//		tchGetNodeByClass().
	//	This function is passed a node(itmNode) and a string containing a className (clssNm).  
	//	The function looks at the className for the node and for up-to six generations of parent nodes 
	//		looking for a node whose className matches clssNm
	// Experience with the viewer indicated that the touchEvent sometimes occurs on a child of the
	//		expected node (e.g. <span> or <b> element).  If the touched-node (tchdNode) is not
	//		of the correct type (className == "crtSideItmClass"), tsrchGetSdItmNode() hunts through
	//		the parents up-to the 6th generation, looking for a parent with the correct className.
	//	The function returns the node whose className includes clssNm  It returns null on error.
function tchGetNodeByClass(itmNode,clssNm) {
	if (itmNode == null) {
		alert("tchGetNodeByClass(): node for item is null.  "
				+ "This probably is a fatal error.\n\n  Please report this error.");
		return(null);
		}
	if (itmNode.className.includes(clssNm)) { return(itmNode); }
	var i;
	var parNode = itmNode.parentNode;
	for (i = 0; i < 6; i++) {
		if (parNode == null) { break; }
		if (parNode.className.includes(clssNm)) { return(parNode); } 
		parNode = parNode.parentNode;
		}
	alert("tchGetNodeByClass(): could not find the node whose className = \"" + clssNm
			+ "\" that is associated with current node (id = \"" + itmNode.id 
			+ "\", class = \"" + itmNode.className + "\").\n\n  Please report this error.");
	return(null);
	}


	// tsrchResetCntr() handles resetting drop-down & side containers in response to touchEvents.
	//	There are two global variables related to this function:  
	//	 -	glbTchMenuOpen holds the .id string of the .style.display = "none"/"block" object that currently is
	//			displayed.  For the criterion-box side containers this is the "crtSideContainerClass" object.
	//			For the main menu, this is the "menuDrpDwnContentClass".  Calling tsrchResetCntr() with any
	//			argument except "prev" will cause hide this object by setting .style.display = "none" for this object.
	//		  Because of mouse-emulation issues, we can't set .style.display = "".  Hence glbTchPrevOpen.
	//	 -	glbTchPrevOpen is the .id string for the container whose .style.display == "none" from a previous call
	//			to tsrchResetCntr().  Once another object has been activated, the display can be reset to
	//			.style.display = "" (so mouse :hover & :active work again).  Whenever, tsrchResetCntr() is called, the
	//			display of the object whose .id == glbTchPrevOpen is set to "".
	//	tsrchResetCntr() also resets background color of "parent" (or equivalent) window ... for glbTchMenuOpen to 
	//		color listed in CSS; for glbTchPrevOpen to "".	
function tsrchResetCntr(doCurPrev){
	var cntrStrId;  // .id of container from glbTchPrevOpen or glbTchMenuOpen
	var isPrev; // true if resetting glbTchPrevOpen
	var cntrStrVarNm;
	if (doCurPrev == "prev") {
		isPrev = true;
		cntrStrId = glbTchPrevOpen;
		cntrStrVarNm = "glbTchPrevOpen";
		bkgClr = "";
		}
	else { // doCurPrev == "cur" (currently being closed menu) or "both" close cur and then re-close it as prev
		isPrev = false;
		cntrStrId = glbTchMenuOpen;
		cntrStrVarNm = "glbTchMenuOpen";
		if (cntrStrId.slice(0,3) == "crt") {
			bkgClr = "rgb(240,224,224)";
			}
		else if (cntrStrId.slice(0,4) == "menu") {
			bkgClr = "rgb(128,128,192)";
			}
		else {
			alert("tsrchResetCntr() Need background color for \"" + cntrStrId 
						+ "\".\n\n  Please report this error.");
			}
		}
	if (cntrStrId == "") {  // this should never happen, but check
		alert("tsrchResetCntr() was called when \'"  +  cntrStrVarNm 
					+ "\' was an empty string.\n\n  Please report this error.");
		return;
		}
	var assocStr;  // used to get main criterion box
	var assocNode; //  node for main-line item on menu
	var strI;  // index into string
	if (isPrev) { document.getElementById(cntrStrId).style.display = ""; }
	else { document.getElementById(cntrStrId).style.display = "none"; }
		// reset background color for "main" boxes
			// reset background color of criterion boxes
	if (cntrStrId.slice(0,3) == "crt") { // container being reset is a criterion side-menu
		strI =  cntrStrId.indexOf("_");
		strI++;
		if (strI <= 0) {// couldn't find "_" in container name (should be "crtSdCntr_???")
			alert("tsrchResetCntr(): could not find \'_\' in " + cntrStrVarNm + " (\"" + cntrSrtId 
					+ "\"). Can't reset background color on criterion box.\n\n  Please report this error.");
			}
		else if (strI != cntrStrId.length - 3)  {
			alert("tsrchResetCntr(): there must be three characters after the \'_\' in " + cntrStrVarNm 
					+ " (\"" + cntrStrId + "\"). Can't reset background color on criterion box."
					+ "\n\n  Please report this error.");
			}
		else {
			assocStr = cntrStrId.slice(strI) + "CrtMain";
			document.getElementById(assocStr).style.backgroundColor = bkgClr; 
			}
		}  // end if "crt" => need to reset xxxCrtMain.backgroundColor
			// reset background color of main-menu items
	else if (cntrStrId.slice(0,4) == "menu") {
		assocNode = tchMenuItmFromCntr(document.getElementById(cntrStrId).parentNode,"menuDrpDwnItemClass");
		if (assocNode == null) {
			alert("tsrchResetCntr(): can\'t find the main-menu item (\"menuDrpDwnItemClass\") corresponding "
						+ "to the \"" + cntrStrId + "\" content box. Can't reset the menu background color."
						+ "\n\n  Please report this error.");
			}
		else { assocNode.style.backgroundColor = bkgClr; }
		}
				// set glbTchPrevOpen & glbTchMenuOpen to new values
	if (isPrev) { glbTchPrevOpen = ""; }
	else {
		if ((glbTchPrevOpen != "") && (glbTchPrevOpen != glbTchMenuOpen)) {
			tsrchResetCntr("prev");
			}
		glbTchPrevOpen = glbTchMenuOpen;
		glbTchMenuOpen = "";
		}
	if ((doCurPrev == "both") && (glbTchPrevOpen != "")) { tsrchResetCntr("prev"); }
	return;
	}

	// tchMenuDwn() is called when a touchstart event occurs on a main menu item
function tchMenuMainDwn(tchdNode,tevt) {
	tevt.preventDefault();
	var itmNode = null;  // node of object (menu item: "menuDrpDwnItemClass") on main menu
	var bigNode = null;  // node of menu container object ("menuDrpDwnContnrClass"
		// get nodes for menu
		// tchdNode could be the "big" container for the drop-down menu, the menu item, or
		//		a child of the menu item
	if (tchdNode.className.includes("menuDrpDwnContnrClass")) { bigNode = tchdNode; }

	else { itmNode = tchGetNodeByClass(tchdNode,"menuDrpDwnItemClass"); }
	if ((bigNode == null) && (itmNode == null)) {  // tchdNode is not a useable node
		alert("tchMenuMainDwn(): touched-element (id = \"" + tchdNode.id + "\"; class = \"" 
					+ tchdNode.className + "\") could not be identified.  No action taken."
					+ "\n\n  Please report this error.");
		return;
		}
			// if touchEvent occurred on the menu item (or a child, need to get container
	if (bigNode == null) { // tchdNode was the menu item (or a child) => container node is null
		bigNode = itmNode.parentNode;
		if (bigNode == null) {
			alert("tchMenuMainDwn(): could not find the parentNode of the menu item (id = \"" 
					+ itmNode.id + "\"; class = \"" + itmNode.className + "\").  "
					+ "Could not display the drop-down menu.\n\n  Please report this error.");
			return;
			}
		if (!bigNode.className.includes("menuDrpDwnContnrClass")) {
			alert("tchMenuMainDwn(): the parentNode (class = \"" + bigNode.className 
					+ "\") of the menu item (id = \"" +itmNode.id + "\"; class = \"" 
					+ itmNode.className + "\") is not the container for the menu item.  "
					+ "Could not display the drop-down menu.\n\n  Please report this error.");
			return;
			}
		}  // end "if bigNode == null"
	if (itmNode == null) {  // touchEvent occurred on the container, need to get item node from bigNode
		itmNode = tchMenuItmFromCntr(bigNode,"menuDrpDwnItemClass");
		if (itmNode == null) { return; } // error message already provided by tchMenuItmFromCntr()
		}
			// get drop-down menu content node
	var contNode = tchMenuItmFromCntr(bigNode,"menuDrpDwnContentClass");
	if (contNode == null) { return; } // error message already provided by tchMenuItmFromCntr()
	var contId = contNode.id;
	if (contId == "") {
		alert("tchMenuMainDwn(): the content-node for the drop-down menu must have an .id assigned to it.  "
					+ "Could not display the drop-down menu.\n\n  Please report this error.");
		return;
		}
			// if a menu was closed previously, reset .style.display = "" and 
			//		set parentNode.style.backgroundColor = ""
	if ((glbTchPrevOpen !="") && (glbTchPrevOpen != contId)) {  // if a menu was closed previously, reset to "none"
		tsrchResetCntr("prev");
		}
			// if a menu already is open => close it by setting .style.display = "none"
			//		and set parentNode.style.backgroundColor to non-:hover color defined by CSS
	if ((glbTchMenuOpen != "") && (glbTchMenuOpen != contId)) {
		tsrchResetCntr("cur");
		}
	itmNode.backgroundColor = "rgb(80,80,114";
	contNode.style.display = "block";
	glbTchMenuOpen = contId;
	srchShowArrows();
	return;	
	}

	// tchMenuItmFromCntr() is passed the parentNode (cntrNode), presumably a menu container 
	//		(class = "menuDrpDwnContnrClass"), and a text-string (clssNm) that is a className.  
	//	The function gets the node-list of children whose className matches clssNm, checks to
	//		make certain that there is only one element in the list, and then returns the
	//		node that the first element in the node-list.  It returns null if the number of
	//		nodes in the list is not 1.
function tchMenuItmFromCntr(cntrNode,clssNm) {
	var nodeLst = cntrNode.getElementsByClassName(clssNm);
	var lstSz = nodeLst.length;
	if (lstSz <= 0) {
		alert("tchMenuItmFromCntr(): could not find a child-node of the menu container-node (id = \"" 
					+ cntrNode.id + "\", class = \"" + cntrNode.className + "\") whose className = \"" 
					+ clssNm + "\".\n\n  Please report this error.");
		return(null);
		}
	else if (lstSz > 1) {
	alert("tchMenuItmFromCntr(): There should be ONLY ONE child-node of the menu container-node (id = \"" 
				+ cntrNode.id + "\", class = \"" + cntrNode.className + "\") whose className = \"" 
				+ clssNm + "\".  We found " + lstSz + " nodes of this class.\n\n  Please report this error.");
		return(null);
		}
	return(nodeLst[0]);	
	}

	//	6/10/20:  because the extensive coding to get nodes and check global variables is identical for
	//		both touchstart and touchend events on a menu subItem.  I combined the functions handling
	//		all touchEvents on these objects into a single function, with "if tevt.type == ?" at the 
	//		end of the function to handle the different actions for different events.
	// tchMenuItmDwn() is called by a touchEvent on an item on one of the drop-down menus.
	//	The function first gets the relevant nodes and checks to make certain that glbTchMenuOpen matches 
	//		the .id of the content <div> for the drop-down menu.
	//		It also calls tsrchResetCntr() if glbTchPrevOpen != ""
	//	If the event was a touchstart , the function sets the itmNode to the :hover values.
function tchMenuClcked(tchdNode,tevt) {
	tevt.preventDefault();
	tevt.stopPropagation();
	var itmNode = tchGetNodeByClass(tchdNode,"menuDrpDwnSubItem");
	if (itmNode ==  null) { return; } // error message by tchGetNodeByClass()
	var itmId = itmNode.id;  // need this at end of function, can use it sooner
	if (itmId == "") {
		alert("tchMenuClcked(): the item (class = \"" + itmNode.className 
				+ "\") on the drop-down menu that was touched must have an \".id\"."
				+ "\n\n  Please report this error.");
		return;
		}
	var contNode = tchGetNodeByClass(itmNode,"menuDrpDwnContentClass");
	if (contNode == null) { return; }  // error message by tchGetNodeByClass()
	var contId =  contNode.id;
	if (contId == "") {
		alert("tchMenuClcked(): the contents of the menu containing the item (id = \"" 
				+ itmId + "\", class = \"" + itmNode.className 
				+ "\") that was touched needs an \".id\".\n\n  Please report this error.");
		return;
		}
			// reset glbTchMenuPrev
	if ((glbTchPrevOpen != "") && (glbTchPrevOpen != contId)) {
		tsrchResetCntr("prev");
		}
			// check glbTchMenuOpen
	if (glbTchMenuOpen == "") {
		alert("tchMenuClcked(): No record of menu being displayed (glbTchMenuOpen = null), even though\"" 
					+ contId + "\" must be open.\n\n  Please report this error.");
		}
	else if (glbTchMenuOpen != contId) {
		alert("tchMenuClcked(): wrong menu is open: glbTchMenuOpen (= \"" + glbTchMenuOpen 
					+ "\") should be \"" + contId + "\".\n\n  Please report this error.");
		tsrchResetCntr("cur");
		}
	glbTchMenuOpen = contId;  // should already be set, but this is fast as testing it.
			// set itmNode ("menuDrpDwnSubItem") to :active state
	var evtType =  tevt.type;
	if (evtType == "touchstart") {
		itmNode.backgroundColor = "rgb(226,160,160)"; 
		itmNode.color = "rgb(192,0,0)";
		}
	else if ((evtType == "touchend") || (evtType == "touchcancel")) {
				// execute button's function
		if (itmId.slice(0,10) == "menuSrtBy_") { menuSetSrtByItm(itmId.slice(10)); }
		else {
			switch(itmId) {
				case "menuSrtOrdAsc" : menuSetSrtByDir(1); break;
				case "menuSrtOrdDec" : menuSetSrtByDir(-1); break;
				case "menuAboutSlideBox" : aboutSlideBoxOpen(); break;
				case "menuAboutPNWU" : aboutPNWUOpen(); break;
				case "menuMorePNWU" : 
						window.open('https://www.pnwu.edu/inside-pnwu/about-us','_blank');
						break;
				case "menuVirSlides" : aboutVirSlidesOpen(); break;
				case "menuScanSlides": aboutScanSlidesOpen(); break;
				case "menuUsingSldBox": aboutUsingSldBoxOpen(); break;
				case "menuSpcRangeOrg" : 
						window.open('http://viewer.pnwu.edu/docs/SlideBox_Specific_ranges-Organs.pdf','_blank');
						break;
				case "menuSpcRangeStn" : 
						window.open('http://viewer.pnwu.edu/docs/SlideBox_Specific_ranges-Stains.pdf','_blank');
						break;
				default :
						alert("tchMenuClcked():  cannot perform the action requested because \"" 
									+ itmId + "\" is not recognized.\n\n  Please report this error.");
						break;
				}  // end of switch on non-sortBy actions
			}  // end of onClick actions
				// reset itmNode to normal CSS state; close (.display = none) & reset contentNode
		itmNode.backgroundColor = ""; 
		itmNode.color = "";
		tsrchResetCntr("cur");
		}
	else {
		alert("tchMenuClcked(): need to define actions for \"" + evtType 
					+ "\" events.\n\n  Please report this error.");
		}
	return;
	}


