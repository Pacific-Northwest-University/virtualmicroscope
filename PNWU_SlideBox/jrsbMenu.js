//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbMenu.js is part of the "slide box" portion of the "PNWU Virtual Microscope",
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

// jrsbMenu.js contains =>
//		initialization functions that are involved in managing the menus
//	this file was initially created on 6/03/20



//       ***************************************************************
//       ***************      list menu functions      *****************
//       ***************************************************************

//  functions building the list-menu are in jrsbList.js

	// menuBuildSrtBy() creates the drop-down items for the 'sort-by'
	//	items on the search-page drop-down menu
function menuBuildSrtBy() {
	var i;
	var chldNode
	var parNode = document.getElementById("menuDDSrtByContent");
	if (parNode == null) {
		alert("menuBuildSrtBy(): could not find \"content\" node for the \"sort-by\" "
					+ "drop-down menu.  Can\'t build the \"sort-by\" menu."
					+ "\n\n  Please report this error."); 
		return;
		}
	var nxtNode = document.getElementById("menuSrtByDivider");
	if (nxtNode == null) {
		alert("menuBuildSrtBy(): could not find child node (\"divider\") for the "
					+ "\"sort-by\" drop-down menu.  Can\'t build the \"sort-by\" menu."
					+ "\n\n  Please report this error."); 
		return;
		}
	var arrSz = glbMenuSrtByArr.length;
	for (i = 0; i < arrSz; i++) {
		chldNode = menuBuildSrtByItm(i);
		if (chldNode == null) { return; } // menuBuildSrtByItm() generates the error message
		parNode.insertBefore(chldNode,nxtNode);
		}
	return;
	}

	// menuBuildSrtByItm() builds a node for an item in glbMenuSrtByArr[].
	//	It returns the node.  On error, it returns null
function menuBuildSrtByItm(arrI) {
	if ((arrI < 0) || (arrI > glbMenuSrtByArr.length)){
		alert("menuBuildSrtByItm(): illegal value for index into glbMenuSrtBy[]." 
				+ "Can\'t build \"Sort-by\" menu item.\n\n  Please report this error.");
		return(null);
		}
	var itmNode = document.createElement("div");
	if (itmNode == null) {
		alert("menuBuildSrtByItm(): Can\'t create a node for the \"" 
				+ glbMenuSrtByArr[arrI].txtNm.toLowerCase() 
				+ "\" node in the menu.\n\n  Please report this error.");
		return(null);
		}
	itmNode.className = "menuDrpDwnSubItem menuDrpDwnShort menuClickable";
	itmNode.id = "menuSrtBy_" + glbMenuSrtByArr[arrI].id;
	itmNode.innerHTML = "&nbsp; &nbsp;" + glbMenuSrtByArr[arrI].txtNm;
	itmNode.onclick = function(){menuSetSrtByItm(this.id.slice(10));};
	itmNode.addEventListener("touchstart",function(){tchMenuClcked(this,event)});
	itmNode.addEventListener("touchend",function(){tchMenuClcked(this,event)});
	itmNode.addEventListener("touchcancel",function(){tchMenuClcked(this,event)});
	return(itmNode);
	}


	// menuSetSrtByItm() is called when user clicks on one of the field-options in the
	//	"Sort-by" drop-down menu on the search-page.  It sets the value of glbMenuSrtVar
	//	to the item clicked by the user and then calls menuWrtSrtByVal() to update the
	//	infoBox in the search-page menu.
function menuSetSrtByItm(itmId) {
	glbMenuSrtVar = itmId;
	menuWrtSrtByVal();
	return;
	}

function menuSetSrtByDir(srtDir) {
	glbMenuSrtDir = srtDir
	menuWrtSrtByVal();
	return;
	}

function menuWrtSrtByVal() {
	var txtStr;
	var arrI = menuGetSrtByArrI();
	if (Number.isNaN(arrI)) {
		document.getElementById("menuSrtByBox").innerHTML = "&nbsp;";
		return;
		}
	txtStr = glbMenuSrtByArr[arrI].txtNm.toLowerCase() + "&nbsp;";
	if (glbMenuSrtDir < 0) { txtStr += "&uarr;"; }
	else { txtStr += "&darr;"; }
	document.getElementById("menuSrtByBox").innerHTML = txtStr;
	return;
	}

	//menuGetSrtByArrI() loops through glbMenuSrtByArr[] to find element whose
	//	.id matches glbMenuSrtVar.  It returns the index (within glbMenuSrtByArr[])
	//	of the element.  On error, it returns NaN
function menuGetSrtByArrI(){
	var i;
	var arrSz = glbMenuSrtByArr.length;
	for (i = 0; i < arrSz; i++){
		if (glbMenuSrtByArr[i].id == glbMenuSrtVar) { break; }
		}
	if (i < arrSz) {return(i);}
	alert("menuGetSrtByArrI():  Can\'t find \"" + glbMenuSrtVar 
				+ "\" in glbMenuSrtByArr[].  Can\'t sort list of slides."
				+ "\n\n  Please report this error.");
	return(Number.NaN);
	}







//       ***************************************************************
//       ***************       infoBox functions       *****************
//       ***************   general display functions   *****************
//       ***************************************************************



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
	aboutBoxInitPos();  // centers box
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

	// aboutBxInit() is called by the function that responds when the subItem in the "About" menu is clicked
	//  The function positions the "About" 
function aboutBoxInitPos() {
	var scrWidth = parseInt(window.innerWidth);  // width of screeen less 2px border
	var boxNode = document.getElementById("aboutBox");  // node of infoBox;
	var boxWdth = 700;
			// set position of infoBox
	var left = Math.round((scrWidth - boxWdth)/2);
	if (left < 0) { left = 10; }  // if left is off the screen, set left side of box to 10px
	boxNode.style.top = glbInfoBxDefTop + "px";
	boxNode.style.left = left + "px";
	return;
	}



//       ***************************************************************
//       ***************       infoBox functions       *****************
//       ***************      specific ABOUT boxes     *****************
//       ***************************************************************

	// called when user clicks "About PNWU Slide Box..." drop-down menu
	//	function opens the "About" info box with "About Slide box" content
function aboutSlideBoxOpen(evt) {
			// variables used for email references
	var emailBug = "MicroscopeBugs";
	var emailComment = "Microscope";
	var emailRef = "";
			// title
	var abtTitle = "About PNWU Slide Box";
			// body of aboutBox
				// title
	var abtBodyTxt = "<p style='text-align: center; font-size:18px; line-height: 0.95'>";
	abtBodyTxt += "<b>PNWU Slide Box, version " + glbSldBoxVersion + ".</b>";
	abtBodyTxt += " (<span style='font-size: 16px'>" + glbSldBoxDate + "</span>)<span style='font-size: 12px'>";
	abtBodyTxt += "<br>&copy;&nbsp;" + glbSldBoxCpyRtDate + " &nbsp;Pacific Northwest University of Health Sciences</span></p>";
				//License => software license
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='text-indent: -10px; padding-top: 8px; border-top: 1px solid black'><b>Copyright &amp; Licenses:</b> ";
	abtBodyTxt += "&nbsp;  The computer software comprising the PNWU Slide Box, which is copyrighted (";
	abtBodyTxt +=  "<font style='font-size:12px'>" + glbSldBoxCpyRtDate + "</font>) by Pacific Northwest University of ";
	abtBodyTxt += "Health Sciences, is free software: you may redistribute it and/or modify it under the terms of the "; 
	abtBodyTxt += "<a href='https://www.gnu.org/licenses/gpl-3.0.html' target='_blank'>GNU General Public License</a>";
	abtBodyTxt += ", either version 3 of the GNU License, or any later version, as published by the ";
	abtBodyTxt += "<a href='https://www.gnu.org/licenses/licenses.html' target='_blank'>Free Software Foundation</a>. &nbsp;";
	abtBodyTxt += "This software is distributed WITHOUT ANY WARRANTY; without even the implied warranty of ";
	abtBodyTxt += "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.</span>";
				//License => image license
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='padding-bottom: 10px'>";
	abtBodyTxt += "The images of slide labels and the thumb-nail images of the specimens (";
	abtBodyTxt += "<span style='font-size:12px'>displayed after you click the \"Get list of slides\" button</span>";
	abtBodyTxt += ") may be copyrighted by the individual or institution providing that specific virtual slide.&nbsp; ";
	abtBodyTxt += "The source and licensing information for the images of a particular slide can be seen by ";
	abtBodyTxt += "loading the slide into the PNWU Microscope viewer ("
	abtBodyTxt += "<span style='font-size:12px'>by clicking on the box containing the slide information</span>).</span>";
				// authorship & credits
	abtBodyTxt += "<span class='aboutBodyTxtClass' style='text-indent: -10px; padding-top: 8px; border-top: 1px solid black'>";
	abtBodyTxt += "The computer code for the PNWU Slide Box was written by James Rhodes, PhD, ";
	abtBodyTxt += "as part of the PNWU Virtual Microscope Project, which is headed by James Rhodes, ";
	abtBodyTxt += "Associate Professor of Histology, and John&nbsp;DeVore, Director of Network Services, ";
	abtBodyTxt += "at Pacific Northwest University of Health Sciences in Yakima, Washington, U.S.A.</span>";
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
	
	// called when user clicks "About PNWU ..." drop-down menu
	//	function opens the "About" info box with "About PNWU" content
function aboutPNWUOpen() {
			// title of aboutBox
	var abtTitle = "About PNWU";
			// body of aboutBox
	var abtBodyTxt = "<img src='http://viewer.pnwu.edu/images/BHH.jpg' alt='' style='width: 698px; height: 210px; border-bottom: 5px solid rgb(224,128,128)'>";
	abtBodyTxt += "<div style='padding: 0px 10px 5px'>";
	abtBodyTxt += "<p>Founded in 2005 as a community-based initiative to address the shortage of physicians ";
	abtBodyTxt += "in the rural Pacific Northwest, <b>Pacific Northwest University of Health Sciences</b> ";
	abtBodyTxt += "(\"<b>PNWU</b>\") is a private non-profit osteopathic medical school whose mission is to ";
	abtBodyTxt += "\"<i>educate and train health care professionals, emphasizing service among rural and ";
	abtBodyTxt += "medically underserved communities throughout the Northwest</i>.\"&nbsp; During the first two ";
	abtBodyTxt += "years of the four-year Doctor of Osteopathy (\"DO\") program, instruction is provided ";
	abtBodyTxt += "primarily at PNWU's main campus in Yakima, Washington (U.S.A).&nbsp; Instruction during "
	abtBodyTxt += "the 3<sup style='font-size: 8px'>rd</sup> and 4<sup style='font-size: 8px'>th</sup> years of the DO program is primarily ";
	abtBodyTxt += "via clerkships at hospitals, clinics, and physician's offices located throughout the Pacific Northwest.</p>";
	abtBodyTxt += "<p>The Virtual Microscope and Slide Box that you are using were created for use in the histology ";
	abtBodyTxt += "laboratory sessions that are part of the first two years of the DO curriculum at PNWU.</p>"
	abtBodyTxt += "<p>More information regarding PNWU's College of Osteopathic Medicine can be found at the University's website:&nbsp; ";
	abtBodyTxt += "<a href='https://www.pnwu.edu/inside-pnwu/college-osteopathic-medicine/about-com' target='_blank'>www.pnwu.edu</a>.</p>";
	abtBodyTxt += "</div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}

function aboutVirSlidesOpen() {
			// title of aboutBox
	var abtTitle = "The virtual slides in the PNWU Slide Box";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";
	abtBodyTxt += "<div style='margin: 0px; padding: 0px 0px 8px 0px'>";
	abtBodyTxt += "Virtual slides are stored in digital databases that can be shared, and the virtual slides found ";
	abtBodyTxt += "in the PNWU Virtual Slide Box derive from several of these shared databases:";
	abtBodyTxt += "</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>PNWU:</b>&nbsp; Virtual slides are created in-house at Pacific Northwest University of ";
	abtBodyTxt += "Health Sciences (<font style='font-size:85%'>PNWU</font>).&nbsp; ";
	abtBodyTxt += "The origin of the \"real\" glass microscope slides used to create virtual slides at PNWU is described ";
	abtBodyTxt += "in \"About\" menu &rarr; \"About slides scanned at PNWU\".</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>University of Michigan:</b>&nbsp; PNWU received a copy of the University of Michigan\'s virtual slide ";
	abtBodyTxt += "database through the generosity of J.&nbsp;Matthew&nbsp;Velkey, PhD, ";
	abtBodyTxt += "and Michael&nbsp;Hortsch, PhD, University of Michigan Medical School.&nbsp; ";
	abtBodyTxt += "For more about this database, see:&nbsp; ";
	abtBodyTxt += "<a href='https://histology.medicine.umich.edu/full-slide-list' target='_blank' style='font-size:75%'>";
	abtBodyTxt += "https://histology.medicine.umich.edu/full-slide-list</a>.</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>VMD:</b>&nbsp; The American Association for Anatomy maintains the Virtual Microscopy Database, ";
	abtBodyTxt += "which is a is a repository containing virtual slides contributed by many universities world-wide.&nbsp; ";
	abtBodyTxt += "For more about this database, see:&nbsp; ";
	abtBodyTxt += "<a href='http://www.virtualmicroscopydatabase.org/' target='_blank' style='font-size:75%'>";
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
	abtBodyTxt += "The \"real\" (<font style='font-size:85%'>glass</font>) microscope slides that were scanned at ";
	abtBodyTxt +="PNWU to create \"virtual\" slides come from several sources:";
	abtBodyTxt += "</div>";
	abtBodyTxt += "<ul style='margin: 0px 0px 5px 18px; padding: 0px 5px 8px 8px'>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>UCSF:</b>&nbsp; Through the generosity of Steven Rosen, PhD, at the University of California, San Francisco ";
	abtBodyTxt += "(<font style='font-size:85%'>UCSF</font>), PNWU was given a partial set of UCSF\'s student slides when UCSF ";
	abtBodyTxt += "discarded their collection of glass teaching slides (<font style='font-size:85%'>which were no longer used after ";
	abtBodyTxt += "UCSF switched to using virtual slides for teaching</font>).</li>";
	abtBodyTxt += "<li style='margin-bottom: 5px'>";
	abtBodyTxt += "<b>UM:</b>&nbsp; Through the generosity of Michael Hortsch, PhD, at the University of Michigan, ";
	abtBodyTxt += "PNWU received several student slide sets when the University of Michigan Medical School discarded their collection ";
	abtBodyTxt += "of glass teaching slides (<font style='font-size:85%'>the University of Michigan now uses ";
	abtBodyTxt += "virtual slides for teaching histology</font>).&nbsp; ";
	abtBodyTxt += "In addition, Dr.&nbsp;Hortsch has graciously loaned additional slides from the University of Michigan collection ";
	abtBodyTxt += "for PNWU to scan.</li>";
	abtBodyTxt += "</ul></div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}


function aboutUsingSldBoxOpen() {
			// title
	var abtTitle = "Using PNWU\'s Virtual Slide Box";
			// body of aboutBox
	var abtBodyTxt = "<div style='margin-top: 4px; border-top: 1px solid black; padding: 10px 8px 8px 8px'>";
	abtBodyTxt += "The PNWU Slide Box consists of two \"pages\".  The first \"page\" is involved in defining ";
	abtBodyTxt += "the criteria used to search PNWU\'s virtual slide database, and the second \"page\" ";
	abtBodyTxt += "displays the results of that search.&nbsp;  ";
	abtBodyTxt += "Clicking the button labeled \"<span style='font-size:90%'>Get list of slides</span>\" ";
	abtBodyTxt += "(<span style='font-size:75%'>on the right side of the first \"page\"</span>) causes ";
	abtBodyTxt += "the database to be searched and Slide Box to switch to the second \"page\", which shows ";
	abtBodyTxt += "the resulting list of virtual slides.</div>";
	abtBodyTxt += "<div style='padding: 0px 5px 8px 8px''>";
	abtBodyTxt += "You probably will want to use the \"<span style='font-size:85%'><b>Limit Slides by:...</b></span>\" ";
	abtBodyTxt += "options on the left side of the first \"page\" to decrease the number of slides in the search results.&nbsp; ";
	abtBodyTxt += "A drop-down menu appears to the right of the each ";
	abtBodyTxt += "selection-criterion box (<span style='font-size:80%'>on the left side of the first ";
	abtBodyTxt += "\"page\"</span>) when the computer mouse is moved over this box ";
	abtBodyTxt += "(<span style='font-size:80%'>or when the box is touched on a touch-screen device</span>).&nbsp; ";
	abtBodyTxt += "Click on an option in the drop-down menu to apply that criterion to the slide search.&nbsp; ";
	abtBodyTxt += "Selection criteria can be combined.&nbsp; ";
	abtBodyTxt += "For instance, selecting \"<span style='font-size:80%'><i>Skeletal muscle</i></span>\" from ";
	abtBodyTxt += "\"<span style='font-size:85%'><b>Limit by: Organ systems</b></span>\" and selecting ";
	abtBodyTxt += "\"<span style='font-size:80%'><i>Iron hematoxylin</i></span>\" from ";
	abtBodyTxt += "\"<span style='font-size:85%'><b>Limit by: Stain</b></span>\" ";
	abtBodyTxt += "(<span style='font-size:80%'>and then clicking the ";
	abtBodyTxt += "\"<span style='font-size:90%'>Get list of slides</span>\" button</span>) will result in a "
	abtBodyTxt += "list of only slides of skeletal muscle stained with iron hematoxylin.&nbsp; More specific criteria ";
	abtBodyTxt += "can be applied using the \"<span style='font-size:95%'><i>specific range</i></span>\" option; see ";
	abtBodyTxt += "\"<span style='font-size:95%'>About</span>\" menu &rarr; ";
	abtBodyTxt += "\"<span style='font-size:95%'>Specific ranges for Organ Systems</span>\" and ";
	abtBodyTxt += "\"<span style='font-size:95%'>Specific ranges for Stains</span>\".</div>";
	abtBodyTxt += "<div style='padding: 0px 5px 8px 8px''>";
	abtBodyTxt += "When the list of slides is displayed, just clicking the computer mouse on the \"slide\" ";
	abtBodyTxt += "(<span style='font-size:80%'>or, for a touch-screen device, ";
	abtBodyTxt += "tapping the \"slide\" with your finger</span>) ";
	abtBodyTxt += "replaces the Slide Box with PNWU\'s Virtual Microscope viewer ";
	abtBodyTxt += "(<span style='font-size:80%'>which is displays the selected slide</span>).&nbsp; ";
	abtBodyTxt += "If the \<<span style='font-size:90%'>SHIFT</span>\> key is depressed when you click on the \"slide\", the Viewer, ";
	abtBodyTxt += "(<span style='font-size:80%'>displaying the selected slide</span>) is opened in a new browser tab or window ";
	abtBodyTxt += "(<span style='font-size:80%'>depending on your internet browser\'s settings</span>).&nbsp; ";
	abtBodyTxt += "If the \<<span style='font-size:90%'>CNTRL</span>\> key is depressed when you click on the slide, ";
	abtBodyTxt += "the Viewer opens in the same tab/window as Slide Box, but Slide Box remains in the tab\'s or window\'s history ";
	abtBodyTxt += "(<span style='font-size:80%'>so the browser\'s \"back\" button can return to Slide Box</span>).</div>";
	abtBodyTxt += "<div style='padding: 0px 5px 8px 8px''>";
	abtBodyTxt += "When the list of slides is displayed in Slide Box, clicking on the ";
	abtBodyTxt += "\"<span style='font-size:95%'>Create a new slide list</span>\" button ";
	abtBodyTxt += "(<span style='font-size:85%'>on the menu</span>) will take you back to Slide Box\'s first \"page\"; "
	abtBodyTxt += "if you just click on this button, the criteria from your previous search are maintained, ";
	abtBodyTxt += "so you can edit or refine that search.&nbsp;  ";
	abtBodyTxt += "If the \<<span style='font-size:90%'>SHIFT</span>\> key is depressed when you click on the ";
	abtBodyTxt += "\"<span style='font-size:95%'>Create a new slide list</span>\" button, the first page of ";
	abtBodyTxt += "Slide Box is displayed with all of the criteria (<span style='font-size:80%'>on the left side ";
	abtBodyTxt += "of the first \"page\"</span>) initalized, so you can start a new search from \'scratch\'.</div>";
			// display aboutBox
	aboutDispBx(abtTitle,abtBodyTxt);
	return;
	}


	

//       **************************************************************
//       ***************      aboutBox functions      *****************
//       ***************        MOVE functions        *****************
//       **************************************************************


	// aboutBxTchStrt() is called by a touchstart event on the move-button of an infoBox
	//	tchEvt is the TouchEvent object belong to this event
	//	mvBtnNode is the move-button that was touched.
	// aboutBxTchStrt() sets glbAboutBxVal.x/y and then calls aboutBxMvStrt() to finish setting-up
	//		glbAboutBxVal for the move
function aboutBxTchStrt(tchEvt,mvBtnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
			// check for another moving info box
	if (!Number.isNaN(glbAboutBxVal.x) 
			|| !Number.isNaN(glbAboutBxVal.y)) { // glbAboutBxVal is in use
		alert("aboutBxTchStrt(): Cannot move two info boxes simultaneously");
		return;
		}
			// check for valid touchevent
	if (tchEvt.target != mvBtnNode) {
		warnBoxCall(false,"Touch error","<b>aboutBxTchStrt():</b> &nbsp;The button being touched (\""
				+ tchEvt.target.id + "\") is different from the responding button (\""
				+ mvBtnNode.id + "\").<br> Please report this error.");
		}
	var tchTot = tchEvt.targetTouches;
	var tchTotSz = tchTot.length;
	if (tchTotSz < 1) {
		alert("aboutBxTchStrt(): Nothing is touching the infoBox move-button (\""
				+ mvBtnNode.id + "\").  Cannot move the box.");
		return;
		}
	if (tchTotSz > 1) {
		warnBoxCall(false,"Too many fingers","<b>aboutBxTchStrt():</b> &nbsp;More than one finger ("
				+ tchTotSz + ") is touching the move-button (\""
				+ mvBtnNode.id +"\").  This probably is an error.");
		}
			// set newX,Y
	glbAboutBxVal.x = tchTot[0].clientX;
	glbAboutBxVal.y = tchTot[0].clientY;
	mvBtnNode.innerHTML = "Drag finger to move";  
	aboutBxMvStrt(mvBtnNode);
	return;
	}

	// infoBoxMvDown() is called when the mouse is depressed on an info-box's move-button
	// It is passed the pointer to the button and the Event object.
	//	It sets glbAboutBxVal.x,y and then calls infoBxMvStrt() to finish setting-up
	//		glbAboutBxVal for the move 
function aboutBxMusDwn(mvBtnNode,musEvt) {
	musEvt.stopPropagation();
			// check for another moving info box
	if (!Number.isNaN(glbAboutBxVal.x) 
			|| !Number.isNaN(glbAboutBxVal.y)) { // glbAboutBxVal is in use
		alert("aboutBxMusDwn(): Cannot move two info boxes simultaneously");
		return;
		}
			// check that event and move-box are congruent
	if (musEvt.target != mvBtnNode) {
		warnBoxCall(false,"Wrong button",
				"<b>aboutBxMusDwn():</b> &nbsp;The button that the mouse is depressing  (\""
				+ musEvt.target.id + "\") is different from the responding button (\""
				+ mvBtnNode.id + "\").<br> Please report this error.");
		}
	mvBtnNode.style.cursor = "move";
	mvBtnNode.onmousemove = aboutBxMusMv;
	mvBtnNode.innerHTML = "Drag mouse to move";  // this isn't really appropriate for touchscreens
	glbAboutBxVal.x = musEvt.clientX;
	glbAboutBxVal.y = musEvt.clientY;
	aboutBxMvStrt(mvBtnNode);
	return;
	}

	// infoBxMvStrt() receives from aboutBxTchStrt() or aboutBxMusDwn() the move-button node 
	//		of the info box that is being moved.  Except for x,y (which are set by the 
	//		calling function), infoBxMvStrt populates glbAboutBxVal, sets color & text
	//		of the move-button, and positions the move-box.
function aboutBxMvStrt() {
	var mvBtnNode = document.getElementById("aboutBoxMv");
	var scrWidth = parseInt(window.innerWidth) - 4;  // width of screeen less 2px border
	var scrHeight = parseInt(window.innerHeight) - 10; // height of screen less bottom margin
	var boxNode = document.getElementById("aboutBox");  // node of infoBox;
			// set glbAboutBxVal values
	glbAboutBxVal.left = parseInt(boxNode.style.left);
	glbAboutBxVal.top = parseInt(boxNode.style.top);
			// set mvBtnNode properties
	mvBtnNode.style.backgroundColor = "rgb(128,128,192)";
	mvBtnNode.style.color = "white";
	return;
	}

	// aboutBxMusMv() is called by an onMouseMove event on an infoBox move-button
	//	it extracts clientX,Y from the event and calls aboutBxMv() to move the infoBox
function aboutBxMusMv(musEvt) {
	musEvt.stopPropagation();
	aboutBxMv(musEvt.clientX,musEvt.clientY);
	return;
	}

	// aboutBxTchMv() is called by a touchmove event on an infoBox move-button
	//	it extracts clientX,Y from the event and calls aboutBxMv() to move the infoBox
function aboutBxTchMv(tchEvt) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
	var tchTot = tchEvt.targetTouches;
	var tchTotSz = tchTot.length;
	var targetId = tchEvt.target.id
	if (tchTotSz < 1) {
		alert("aboutBxTchMv(): Nothing is touching the infoBox move-button (\""
				+ targetId + "\").  Cannot move the box.");
		return;
		}
	if (tchTotSz > 1) {
		warnBoxCall(false,"Too many fingers","<b>aboutBxTchMv():</b> &nbsp;More than one finger ("
				+ tchTotSz + ") is touching the move-button (\""
				+ targetId +"\").  This probably is an error.");
		}
	aboutBxMv(tchTot[0].clientX,tchTot[0].clientY);
	return;
	}


function aboutBxMv(newX,newY) {
			// check for validity of glbAboutBxVal object
	if (Number.isNaN(glbAboutBxVal.x) 
				|| Number.isNaN(glbAboutBxVal.y) 
				|| Number.isNaN(glbAboutBxVal.left) 
				|| Number.isNaN(glbAboutBxVal.top)) {   // mouse is NOT down
		alert("aboutBxMv():  glbAboutBxVal has not been initialized.\n Cannot move the infoBox");
		return; 
		}
	var boxNode = document.getElementById("aboutBox");
	var left = glbAboutBxVal.left;
	var top = glbAboutBxVal.top;
	left += newX - glbAboutBxVal.x;
	top += newY - glbAboutBxVal.y;
	boxNode.style.left = left + "px";
	boxNode.style.top = top + "px";
	glbAboutBxVal.x = newX;
	glbAboutBxVal.y = newY;
	glbAboutBxVal.left = left;
	glbAboutBxVal.top = top;
	return;
	}
	
	// aboutBxMusUp() is called & passed a pointer to the mouse event pointer
	//    if a mouse-button was released (button up) while on the infoMvBtn button
	// if the mouse-button had been depressed while on the infoMvBtn button,
	//   so glbAboutBxVal has been initialized (see infBoxMvBtnDown(), see above), then
	//   aboutBxMusUp() resets infoMvBtn style and sets glbAboutBxVal to null/NaN values.
function aboutBxMusUp(btnNode) {
			// reset glbAboutBxVal
	glbAboutBxVal.x = Number.NaN;
	glbAboutBxVal.y = Number.NaN;
	glbAboutBxVal.left = Number.NaN;
	glbAboutBxVal.top = Number.NaN;
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
	//		the function treats the mouse-out event as a mouse-up event and resets glbAboutBxVal (see
	//		aboutBxMusUp(), above).
	//	(2)	If the mouse is depressed & released on the infoMvBtn, the text in the infoMvBtn button is not
	//		automatically restored to the default value when the (now released) mouse moves off the button,
	//		so this function must explicitly reset the button's innerHTML contents.
function aboutBxMusOut(btnNode) {
			// reset glbAboutBxVal
	glbAboutBxVal.x = Number.NaN;
	glbAboutBxVal.y = Number.NaN;
	glbAboutBxVal.left = Number.NaN;
	glbAboutBxVal.top = Number.NaN;
			// reset move-button
	btnNode.onmousemove = "";
	btnNode.style.cursor = "";
	btnNode.style.backgroundColor = "";
	btnNode.style.color = "";
	btnNode.innerHTML = "Press here to move";
	return;
	}
	

function aboutBxTchUp(tchEvt,btnNode) {
	tchEvt.preventDefault();
	tchEvt.stopPropagation();
			// check for valid touchevent
	if (tchEvt.target != btnNode) {
		warnBoxCall(false,"Touch error","<b>aboutBxTchUp():</b> &nbsp;The button being touched (\""
				+ tchEvt.target.id + "\") is different from the responding button (\""
				+ btnNode.id + "\").<br> Please report this error.");
		}
			// reset glbAboutBxVal
	glbAboutBxVal.x = Number.NaN;
	glbAboutBxVal.y = Number.NaN;
	glbAboutBxVal.left = Number.NaN;
	glbAboutBxVal.top = Number.NaN;
			// reset move-button
	btnNode.style.backgroundColor = "rgb(232,232,248)";
	btnNode.style.color = "black";
	btnNode.innerHTML = "Press here to move";
	return;
	}

