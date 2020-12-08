//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbGlobal.js is part of the "slide box" portion of "PNWU Virtual Microscope",
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

// jrsbGlobal.js contains =>  Headers & Global variables for the slide-box part of PNWU Virtual microscope
//	this file was initially created on 5/25/20

//	NOTE global variables for infoBoxes are at the bottom of this file

var glbAjxTimer = Number.NaN;  // variable for Ajax timeout calls
var glbAjxTimeOut = 10000;  // time-out for Ajax/SQL server connection

var glbColNum = Number.NaN;
var glbScrlWdth = Number.NaN;

var glbSldItmHt = 144;  // slide-item height is 128px + 2x8px border
var glbSldItmWdth = 536 // slide-item width is 520px + 8xpx border
var glbSldItmHMrg = 1;  // space between columns of sldItms
var glbItmVMrg = 1;  // space between rows of sldItms
		// because we don't initially know if there will be a scroll-bar, the width of
		//	the list page is initially indeterminate.  The menu is constructed on the 
		//	assumption that the scroll-bar is not present, and the elements in the
		//	menu later need to be re-centered.  glbLstMenuArr[] is used to re-center the elements
var glbLstMenuArr = [];  // listing of elements in list-page menu

var glbIsLstVScrl = false;  // set to true if list-window has Y-axis scroll bar
		// if lstPage is wider than screen, it automatically gets a X-scroll bar
		//		calculations as to whether the lstWnd needs a Y-scroll bar need
		//		to take this into account
var glbIsLstHScrl = false;  // set to true if list-page wider than screen

var glbSldItmArr = [];  // an array to hold the slide-information from server database


// ***************************************************** *
// *******    criterion box side-menu globals    ******* *
// ***************************************************** *

	// until 11/21/20, the side-menus for the criterion boxes were a single column
	//	and all of the formatting was done using the style-sheet (jrsbStyleMain.css)
	//	If we make the number of columns variable, then we may need to set the
	//	box dimensions using global variables.

// ******************************************** *
// *******    search variable arrays    ******* *
// ******************************************** *

	//valStrg is a text string consisting of pairs of integers enclosed in parentheses and
	//	separated by commas.  For each pair the first integer is the lowest value for the
	//	variable and the second integer is the highest value.  A negative integer causes 
	//	the value to be left out of the comparison.  For instance, if valStrg for
	//		if valStrg for num was valStrg: "(3001, 3005)" the SQL search would be:
	//			 "WHERE (tabSldList.sldNum BETWEEN 3001 AND 3005)"
	//		if valStrg for num was valStrg: "(3001, -1)" the SQL search would be:
	//			 "WHERE (tabSldList.sldNum >= 3001)"
	//		if valStrg for num was valStrg: "(-1, 3005)" the SQL search would be:
	//			 "WHERE (tabSldList.sldNum <= 3005)"
	//		if both values are negative, the comparison is not included the SQL search
	//		otherwise if the values are identical, then equality is tested, e.g.,
	//		if valStrg for num was valStrg: "(3005, 3005)" the SQL search would be:
	//			 "WHERE (tabSldList.sldNum = 3005)"
	//	multiple pairs are connected by OR statements, e.g.
	//		if valStrg for num was valStrg: "(3001, 3005),(770,770)" the SQL search would be:
	//			 "WHERE (tabSldList.sldNum BETWEEN 3001 AND 3005) OR (tabSldList.sldNum = 770)"
	//	NOTE:  txtId MUST be 3 characters.
	//  11/21/20:  added mechanism for making multiple columns in drop-down lists.
	//	  The program will attempt to fit the drop-down lists to computer screen.
	//	  maxCol:  this is the maximum number of columns that will be created.
	//		if maxCol == 0, a single column drop-down box is created without attempting to fit
	//			the computer screen.
	//		if maxCol > 0 AND the drop-down menu is bigger than computer screen, the program will
	//			attempt to shift the dropdown menu (so it starts above the 1st line of crtNode.
	
var glbSrchMainArr = [
			{ txtId: "org", charId: "O", txtNm: "Organ system", 
						valStrt: Number.NaN, valEnd: Number.NaN, valStrg: "(-1,-1)",
						maxCol: 2, numCol: 1 },
			{ txtId: "src", charId: "R", txtNm: "Source",
						valStrt: Number.NaN, valEnd: Number.NaN, valStrg: "(-1,-1)",
						maxCol: 2, numCol: 2 },
			{ txtId: "stn", charId: "S", txtNm: "Stain",
						valStrt: Number.NaN, valEnd: Number.NaN, valStrg: "(-1,-1)",
						maxCol: 2, numCol:1 },
			{ txtId: "fmx", charId: "F", txtNm: "Number of focal planes", 
						valStrt: Number.NaN, valEnd: Number.NaN, valStrg: "(-1,-1)",
						maxCol: 0, numCol: 1 },
			{ txtId: "num", charId: "N", txtNm: "Slide number",
						valStrt: Number.NaN, valEnd: Number.NaN, valStrg: "(-1,-1)",
						maxCol: 0, numCol: 1 },
			];
			
var glbSrchArr_num = [	
			{ txtId: "anyN", txtNm: "any slide", valStrg: "(-1,-1)" },
			{ txtId: "spcN", txtNm: "specific range", valStrg: Number.NaN }
			];
			
var glbSrchArr_fmx = [	
			{ txtId: "anyF", txtNm: "any slide", valStrg: "(-1,-1)" },
			{ txtId: "singF", txtNm: "single focal plane", valStrg: "(1,1)" },
			{ txtId: "multiF", txtNm: "multiple focal planes", valStrg: "(2,-1)" },
			{ txtId: "spcF", txtNm: "specific range", valStrg: Number.NaN }
			];

var glbSrchArr_src =[
			{ txtId: "anyR", txtNm: "any slide", valStrg: "(-1,-1)" },
			{ txtId: "pnwuR", txtNm: "PNWU", valStrg: "(11,99)" },
			{ txtId: "drexR", txtNm: "Drexel University", valStrg: "(121,126)" },
			{ txtId: "ubcR", txtNm: "University of British Columbia", valStrg: "(331,336)" },
			{ txtId: "ubuckR", txtNm: "University of Buckingham", valStrg: "(361,366)" },
			{ txtId: "ucsfR", txtNm: "UCSF", valStrg: "(117,120)" },
			{ txtId: "ucinnR", txtNm: "University of Cincinnati", valStrg: "(371,376)" },
			{ txtId: "ucolR", txtNm: "University of Colorado", valStrg: "(381,386)" },
			{ txtId: "uiowaR", txtNm: "University of Iowa", valStrg: "(401,499)" },
			{ txtId: "umR", txtNm: "University of Michigan", valStrg: "(101,115)" },
			{ txtId: "umissR", txtNm: "<span style='font-size:80%'>University of Mississippi Medical Center</span>", valStrg: "(321,330)" },
			{ txtId: "uneR", txtNm: "University of New England", valStrg: "(351,356)" },
			{ txtId: "usdR", txtNm: "University of South Dakota", valStrg: "(391,396)" },
			{ txtId: "utasR", txtNm: "University of Tasmania", valStrg: "(341,346)" },
			{ txtId: "uvaR", txtNm: "University of Virginia", valStrg: "(271,276)" },
			{ txtId: "vacmwR", txtNm: "<span style='font-size:95%'>Virginia Commonwealth University</span>", valStrg: "(291,296)" },
			{ txtId: "spcR", txtNm: "specific range", valStrg: Number.NaN }
			];

var glbSrchArr_stn = [	
			{ txtId: "anyS", txtNm: "any slide", valStrg: "(-1,-1)" },
			{ txtId: "heS", txtNm: "H&amp;E and similar", valStrg: "(10,29)" },
			{ txtId: "hemS", txtNm: "Hematoxylin (<span style='font-size:80%'>alum</span>) - not eosin", 
						valStrg: "(30,39)" },
			{ txtId: "irheS", txtNm: "Iron hematoxylin", valStrg: "(40,59)" },
			{ txtId: "cvlS", txtNm: "Cresyl violet (<span style='font-size:70%'>including Luxol fast-blue</span>)", valStrg: "(60,69)" },
			{ txtId: "triS", txtNm: "Trichrome (<span style='font-size:80%'>&amp; tetrachrome</span>)", 
						valStrg: "(100,169),(350,369)" },
			{ txtId: "pasS", txtNm: "PAS-based stains", valStrg: "(200,209)" },
			{ txtId: "elasS", txtNm: "Elastin stains", valStrg: "(300,369)" },
			{ txtId: "silS", txtNm: "Silver stains", valStrg: "(260,299)" },
			{ txtId: "grdS", txtNm: "Ground section (<span style='font-size:80%'>hard tissue</span>)", valStrg: "(8,8)" },
			{ txtId: "unkS", txtNm: "Unknown stain", valStrg: "(1,1)" },
			{ txtId: "spcS", txtNm: "specific range", valStrg: Number.NaN }
			];

		// if isSub==true; box is a container for a second-side menu
var glbSrchArr_org = [	
			{ txtId: "anyO", txtNm: "any slide", isSub: false, valStrg: "(-1,-1)" },
			{ txtId: "ctO", txtNm: "Connective tissue (<span style='font-size:12px'>skeletal system</span>)", 
						isSub: false, valStrg: "(1000,1999)" },
				// skip 'incidental' skeletal muscle (2601) and 'incidental' myotendinous jxn (2651)
			{ txtId: "skmusO", txtNm: "Skeletal muscle", isSub: false, valStrg: "(2610,2649),(2653,2699)" },
				// includes encapsulated receptors (5000-5099) and special senses (5100-5999)
			{ txtId: "nerveO", txtNm: "Nervous system", isSub: false, valStrg: "(4000,5999)" },
			{ txtId: "bloodO", txtNm: "Blood &amp; bone marrow", isSub: false, valStrg: "(900,999)" },
			{ txtId: "lympO", txtNm: "Lymphoid organs", isSub: false, valStrg: "(7000,7999)" },
			{ txtId: "cardiO", txtNm: "Cardiovascular system", isSub: false, valStrg: "(8000,8999)" },
			{ txtId: "integO", txtNm: "Integumentary system", isSub: false, valStrg: "(10000,10999)" },
			{ txtId: "alimO", txtNm: "GI - alimentary canal", isSub: false, valStrg: "(11000,11999)" },
			{ txtId: "glandO", txtNm: "GI - extramural glands", isSub: false, valStrg: "(12000,12999)" },
			{ txtId: "respO", txtNm: "Respiratory system", isSub: false, valStrg: "(13000,13999)" },
			{ txtId: "endoO", txtNm: "Endocrine organs", isSub: false, valStrg: "(15000,15999)" },
			{ txtId: "urinO", txtNm: "Urinary system", isSub: false, valStrg: "(16000,16999)" },
			{ txtId: "maleO", txtNm: "Male reproductive system", isSub: false, valStrg: "(17000,17999)" },
			{ txtId: "femO", txtNm: "Female reproductive system", isSub: false, valStrg: "(18000,18999),(10530,10549)" },
			{ txtId: "embrO", txtNm: "Placenta &amp; embryology", isSub: false, valStrg: "(20000,22999)" },
			{ txtId: "spcO", txtNm: "specific range", isSub: false, valStrg: Number.NaN }
			];


// ************************************************ *
// *******       menu global variables      ******* *
// *******    touchEvent global variables   ******* *
// ************************************************ *


		// menuSrtByArr[] is used to construct the "sort-by" menu item.
var glbMenuSrtByArr = [
					{id: "num", txtNm: "Slide number"},
					{id: "name", txtNm: "Slide name"},
					{id: "tis", txtNm: "Tissue"},
					{id: "maxF", txtNm: "# of focal planes"},
					{id: "stn", txtNm: "Stain"},
					{id: "spc", txtNm: "Species"}					
					];
var glbMenuSrtVar = "num";  // the variable used to sort glbSldItmArr[] 
var glbMenuSrtDir = 1;  // the direction (ascending vs. descending) for sorting glbSldItmArr[]

		// if there are both touchEvents and mouseEvents, there is an issue with the touchEvent setting a 
		//	display to "none", which over-rides the CSS :hover statement.  If a touchEvent occurs on a criterion box
		//	or menu, glbHasTch = true and an event-listener for mousedown is added to the document.
var glbHasTch = false;  // if a touchEvent occurs, glbHasTch = true and a mousedown eventlistner is added to document

var glbTchMenuOpen = "";  // contains .id of ContentClass of open menu; empty string if no menu is open
var glbTchPrevOpen = "";  // contains .id of ContentClass of last menu to have been opened; needs to have .style.display reset

// ******************************************** *
// *******   infoBox global variables   ******* *
// ******************************************** *

var glbSldBoxVersion = "2.00";
var glbSldBoxDate = "November, 2020";
var glbSldBoxCpyRtDate = "2020";
var glbInfoBxDefTop = 110;

	// glbInfoBxVal is an object that holds values needed to move an infoBox
	// glbInfoBxVal.x is the x-coordinate (integer) of the mouse prior to the current move interval
	// glbInfoBxVal.y is the y-coordinate (integer) of the mouse prior to the current move interval
	// glbInfoBxVal.left & .top are the coordinates of top/left corner of the infoBox
	//	  prior to the current move
	// glbInfoBxVal.boxNode is a pointer to the infoBox (not the infoMvBtn)
	// glbInfoBxVal.idx is the index of in glbInfoBxLst of the box being moved
	// left, top. & boxNode were added because box movements were jerky & unsatisfactory, so
	//    we tried to decrease the time infoBxMusMv() needs to 'think'
	//  x,y,left,top == NaN, boxNode == null, & idx == -1 whenever none of the info boxes
	//		have their move-button depressed
var glbAboutBxVal = {x: Number.NaN, y: Number.NaN, left: Number.NaN, top: Number.NaN};

	// glbInfoBxLst contains a list of all of the info boxes.
	//	btnId is the id of the move btn
	//	boxId is the id of the infoBox
	//	boxNm is the title of the infoBox
	//	boxWd is the width of the infoBox
var glbInfoBxLst = [
		{btnId: "aboutBoxMv", boxId: "aboutBox", boxNm: "About", boxWd: 700},
		];





