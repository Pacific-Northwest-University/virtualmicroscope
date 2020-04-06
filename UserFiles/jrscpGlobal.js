// jrscpGlobal.js
//	Copyright 2019, 2020  Pacific Northwest University of Health Sciences
    
//	jrscpGlobal.js is part of "PNWU Microscope", which is an internet web-based program that
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
//		- nine javascript files (including jrscpGlobal.js)
//		- four PHP files
//	jrscpGlobal.js principally contains declarations of global variables that are used by 
//		other portions ofthe program
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA


// jrscpGlobal.js =>  Headers & Global variables

//  NOTE:  In order to try to decrease the chance that I accidentally would use the same name for both a global variable
//		and a local variable, on 10/13/19, I replaced many of "sld"  prefixes on global variables with a "glb" prefix.
//		I did NOT change "sld" to "glb" for sldVw[], sldVwI, or for the slide-movement global variables.
//		In addition, while changing "sld" to "glb" prefixes, I also changed a few variable names to try to normalize
//		variable-naming orthography.


// sldVw{} is an array of sldView objects, each of which will hold the information for a specfic view plane
//	sldVis is a boolean indicating if style.display = "block" (true) or style.display = "hidden" (false)
//		At any given time, only one layer (at most) can be displayed (i.e. sldVisible == true)
//	sldWait was added 11/01/19.  It is a boolean which is set to true if the viewer is waiting for this view-plane to be
//		completely loaded.  At most, only one view-plane may have this variable set to "true", and this view-plane will
//		become the visible view-plane as soon as all the tiles for this plane are loaded.
//	f is the focal plane level; the maximum and minimum levels for slide will need to be stored in a different structure
//	z is the zoom-level; maximum zoom level (mimimum always is 0?) needs to be stored in a different structure
//	tiStrtXId is the ID-number of the current left-most tiles in image.  ("ti" is short for "tile")
//		In earlier versions, this was the global variable "sldColStartId".
//	tiMxNumX is the number of tiles currently in each row; this changes if the window is resized
//		In earlier versions, this was the global variable "sldNumInRow"
//	tiStrtYId is the ID-number of the current top row.
//		In earlier versions, this was the global variable "sldRowStartId"
//	tiMxNumY is the number of rows in the current image; this changes if teh window is resized
//		In earlier versions, this was the global variable "sldNumRows"
//	sldNode is the pointer to the node in the DOM containing the slideView plane
//	sldWaitArr is an array holding the list of img tiles that have NOT yet been loaded
//	"db" is short for "database"; 
//		Originally the "db" variables were going to be in a separate object, but there isn't an advantage to this
//	dbStrtXId is the ID-number of the first tile (of each row) in the whole slide database (for this z-level)
//		In earlier versions, this was "dataFirstJpegInRow"
//	dbMxNumX is the number of tiles in each row of the whole slide database for this z-level
//		In earlier versions, this was "dataMaxTileInRow"
//	dbTileOffX was removed from the sldView definition on 11/01/19.  It was the number of blank tiles (not counting those
//		included in dbStrtXid) at the beginning of each row (for this z-level) in the image database.  If libvips centers
//		the image pyramid, then this value always was 0.
//	dbPixelOffX was removed from the sldView definition on 11/01/19.  It was supposed to be the number of blank pixels
//		on the left side of first tile that contains the actual image of the slide.  For the images pyramided
//		using libvips with centering turned on, this number always was 0.
//	dbStrtYId is the ID-number of the first row of tiles in the whole slide database (for this z-level)
//		In earlier versions, this variable was "dataFirstRow"
//	dbMxNumY is the number of rows of tiles (at this z-level) in the whole slide database
//		In earlier versions, this variable was "dataMaxRows"
//	dbTileOffY was removed from the sldView definition on 11/01/19. It was the number of rows of blank tiles
//		(not counting those included in dbStrtYId) at the top of the whole slide (at this Z-level).  For the images
//		pyramided using libvips with centering turned on, this number always was 0.  
//	dbPixelOffY was removed from the sldView definition on 11/01/19.  It was supposed to be the number of blank pixels
//		on the top of tiles in the first row of tiles containing the actual image of the slide.  For the images pyramided
//		using libvips with centering turned on, this number always was 0.
//	dbRoot is the first part of the "src" string for the tile "img" elements


	// sldVw constructor
function sldViewC (sldVis,sldWait,f,z,zMult,tiStrtXId,tiMxNumX,tiStrtYId,tiMxNumY,sldNode,sldWaitArr,
		dbStrtXId,dbMxNumX,dbTileOffX,dbStrtYId,dbMxNumY,dbTileOffY,dbRoot) {
	this.sldVis = sldVis;
	this.sldWait = sldWait;
	this.f = f;
	this.z = z;
	this.zMult = zMult;
	this.tiStrtXId = tiStrtXId;
	this.tiMxNumX = tiMxNumX;
	this.tiStrtYId = tiStrtYId;
	this.tiMxNumY = tiMxNumY;
	this.sldNode = sldNode;
	this.sldWaitArr = sldWaitArr;
	this.dbStrtXId = dbStrtXId;
	this.dbMxNumX = dbMxNumX;
	this.dbStrtYId = dbStrtYId;
	this.dbMxNumY = dbMxNumY;
	this.dbRoot = dbRoot;
		}

var sldVw = [];   // sldVw is an array of "slideView"-like objects


		//	  ***************************************************************************************
		//	  ********************           GLOBAL DataBase VARIABLES           ********************
		//	  ***************************************************************************************


	// DataBase global variables either are:
	//	(1)	fixed values determined when the virtual slides are converted to GoogleMaps format, or
	//	(2)	virtual-slide specific values that eventually will be obtained from the server during initialization

	// glbTileSzX, glbTileSzY, & glbZoomStp are determined when scanned slide is converted into Maps format
	//  we probably will never change this, but if this makes it easy if the GoogleMaps tile size ever changes.
var glbTileSzX = 256;    //width of a tile in pixels
var glbTileSzY = 256;   //height of tile in pixels
var glbZoomStp = 2;     // multiplier used when changing zoom levels

var glbAjxTimer = Number.NaN;  // variable for Ajax or tile-loading timeout calls
var glbAjxTimeOut = 10000;  // time-out for Ajax/SQL server connection => THIS NEEDS TO BE ADDED TO CHANGE SETTINGS!
var glbWaitTimeOut = 10000;  // time-out for server to load iamge tiles => THIS NEEDS TO BE ADDED TO CHANGE SETTINGS!

	// if the slide number (e.g. specified on command-line) doesn't exist in database, sqlSldBasics() used to throw an
	//	error message and set "sldSelBox".style.display = "block".  However, this only works if the table in
	//	sldSelBox has been created prgCreateSldList(), which isn't the case for a command-line argument, but
	//	conceivably could be the case in other situations.  Since prgCreateSldList() creates and adds nodes to
	//	sldSelBox, the function may be called ONLY ONCE ... so we need an efficient and robust way to determine
	//	if prgCreateSldList() has created the table in sldSelBox.  A global boolean that is set to true by
	//	prgCreateSldList() and which prevents further calls to prgCreateSldList() seemed to be the safest way
	//	to handle the problem.  This variable (glbSldSelListExist) is set to true at the end of prgCreateSldList().
	// This variable (glbSldSelListExist) is tested at the beginning of prgGetSldList() - which generates the Ajax 
	//	request that calls prgCreateSldList(), and if true, prgGetSldList() sets "sldSelBox".style.display = "block"
	//	and returns without generating the Ajax request.  Thus, calls to prgGetSldList() now will result in the 
	//	display of "sldSelBox" regardless of previous history.  Note:  glbSldSelListExist is NOT reset
	//	if a second slide is viewed using "Back to Slide List" menu button, since the slide list would be the same
	//	second-time around.
var glbSldSelListExist = false;

var dbSldNum = Number.NaN;  // also set/reset by prgInitVar()
var dbSldName = "";  // also set/reset by prgInitVar()

	// eventually, this will need to be more complicated; there will be:
	//  maximum number of focal planes in the detabase (could be different for different Z-levels)
	//  maximum number of FP in slideView at any specific time (different for different Z-levls)
	//    this number can vary depending on whether FP or ZL has priority
	//  actual number of FP at each Z-level in slideView
	//  NOTE:  For both dbMaxF and dbMaxZ the minimum number is 0 (AND THIS MUST BE REFLECTED IN IMAGE DATABASE) 
	// NOTE: dbMaxF, dbRoot, dbLblPath, dbMaxZ, dbSldOwner, dbLicense, dbStdCredit also are set/reset
	//		by sqlSldBasics() and sqlSldInfo().
var dbMaxF = Number.NaN;  // maximum number of focal planes for slide - assigned "real" value (>0) by sldChooseSld()
		// All of the tiles for each focal plane are located in a separate set of z/y/x directories.
		//		dbRoot is the text that is placed DIRECTLY before the F-value to generate the path to
		//		the root directory for the z/y/x directories.
var dbRoot = "";  // text string specifying location of the focal-plane directory; assigned by prgChooseSlide()
var dbLblPath = "";
	// dbSldData[] contains, for each zoom-level (z):
	//	(1) numF: the number of focal planes.  This currently is the same for all zoom levels, but listing this
	//			value for each zoom-level makes it possible to add (at a later time) allowing for a different 
	//			number of focal planes (i.e., different depth-of-field at different magnifications).
	//			Implementation of this idea seems mind-boggling.
	//	(2) strtY: this is dbStrtYId in sldVw[].  This is the number (Id) of the 1st row in the database
	//			(at specified zoom-level).
	//	(3) numY; this is dbMxNumY in sldVw[].  This is the number of rows in the database (at specified z).
	//	(4) strtX: this is dbStrtXId in sldVw[].  This is the number (Id) of the 1st tile in each row of 
	//			the database (at specified zoom-level).
	//	(3) numX; this is dbMxNumX in sldVw[].  This is the number of tiles in each row in the database
	//			(at specified z).
	//	This array does NOT include the dbTileOffX,Y & dbPixelOffX,Y values because I think that these values
	//		will always be zero.  dbTileOffX,Y & dbPixelOffX,Y were removed from the slideView definition on 11/01/19.
var dbSldData = [];

var dbMaxZ = Number.NaN;	// maximum number of zoom-levels in database - from jrSQL_GetSldBasic.php
							// dbMaxZ === dbSldData.length
		// If magnification is not known (i.e., SQL database value is null) then dbMaxMag is set to 0.
		//	We do NOT use NaN here because this would require an extra test when zoom-level magnification (zMag)
		//		calculated by dividing magnificaiton by glbZoomStp in sqlSldZYX().
var dbMaxMag = 0;   // magnification in pixels/mm from database (jrSQL_GetSldBasic.php); 0 if unknown

		// dbOwher & dbLicense are the credit/license information for the slide
		//  if dbStdCredit is true: dbOwner & dbLicense are pasted into standard text, which is then displayed
		//	if dbStdCredit is false:  dbOwner string is displayed (without pasting other text).  This allows
		//		for non-standard credit information to be displayed
var dbOwner = "";   // assigned by progChooseSlide()
var dbLicense = "";   // assigned by progChooseSlide()
var dbStdCredit = false;  // assigned by sldChooseSld(), usually will be true, default value is false





	//	  ****************************************************************************************
	//	  ********************           GLOBAL slideView VARIABLES           ********************
	//	  ****************************************************************************************

glbMenuTotHt = 0;  // total height of menu; set by prgMenuResize()

//  for clarity, I'm not changing sldVw[] or sldVwI to "glb..." even though these are global variables
//			purgSldVw[] should be empty if the user can click on "Back to Slide List"
// NOTE:  many of these variables are reinitialized in prgInitVar(), which is called by prgInitWnd()
//			when the program loades and by prgReInitWnd() when

var sldVwI = Number.NaN;  // index pointing to element in sldVw that is visible

//  glbVwFocX,Y is the point of viewer's focus in actual slide's pixel coordinates (at max zoom).
//    If glbVwFocX,Y is NaN, then sldBuildSlideView will set this to be the center of the scanned slide.
//	  sldBuildSlideView() uses this value when rebuilding slideView after window is resized
//	NOTE:  THIS NEEDS TO BE REDONE ... ZOOMING IN/OUT USING MOUSE WHEEL OR DOUBLE-CLICK SHOULD USE MOUSE'S
//		CURRENT LOCATION AS glbViewFocX,Y
// double-clicking on slideView will reset sldVwFoc to the location of the double-click.
//    If no key is depressed double-clicking mouse will also increase zoom level (zoom-in) by one.
//    If shift-key is also depressed, double-clicking mouse will also decrease zoom level (zoom-out) by one.
//    If Cntrl-key is also depressed, double-clicking will move slideView so sldVwFoc is in center of slideView

var glbVwFocX = Number.NaN;
var glbVwFocY = Number.NaN;

var glbSldXYBuf = 1;  // Number of tiles outside of viewport - default will be 1?

		// glbSldTileOff is the amount (in tiles) that slideView needs to move off-center before instituting 
		//		a scrollLeft/Right/Up/Down move.  For instance, if scrolling left, a new tile will be added
		//		to the right side (and an old tile removed from the left side) and style.left updated when
		//		style.left = (glbSldTileOff + glbSldXYBuf) * glbTileSzX.
		//	These values are used only by sldMoveView().  These values are essentially constants and
		//		we may want to eventually replace them with a numeric value.  They do NOT need to be integers,
		//		but because sldMoveView() does not convert the result of glbSldTileOff * glbTileSzX,Y into an
		//		integer, these values have to be evenly divisible by glbTileSzX,Y
var glbSldTileOff = .5;

	// because deletion/removal of discarded slideView planes is time consuming, when a slideView plane
	//		is removed from slideView, it is not destroyed immediately, but rather is moved from 
	//		sldVw[] to destSldVw[] and a timer is set to destroy the slideView plane 'in the background'
	//	To prevent the destruction of old slideView planes from intruding on user-functions, if the
	//		destruction timer is "on" (i.e. destTimer.isOn == true, functions that involve user-interaction,
	//		such as mouse moves, clear the timer & set destTimer.id to NaN, at the beginning of beginning
	//		of the operation, and reset the timer (if destTimer.isOn == true) when the user-interaction is
	//		completed
var destTimer = {isOn: false, id: Number.NaN};  // timer for destDeletePlane()
var destTimeInterval = 30;  // interval (in msec) between attempts to destroy discarded slideView planes 
var destArrayMaxNum = 33;  // maximum size of destSldVw[] + purgSldVw[] (~2000 tiles)
var destSldVw = [];		// array to hold slideView planes awaiting descruction
var purgSldVw = [];		// tempoary array to hold slideView planes before transfer to destSldVw[]



	//	  ******************************************************************************************
	//	  ********************           GLOBAL focal plane VARIABLES           ********************
	//	  ******************************************************************************************

// NOTE: prgInitVar() also sets/resets:  glbSldStrtF, glbSldMaxF, glbFDisabled, glbSldFDef, glbOldFDef, glbMusWheelFZ
//		progInitVar() does NOT set/reset:  glbSldFBuf, glbSldFZBuf, glbPnchWhlWait

var glbSldStrtF = Number.NaN;  // zoom-level at initialization.  This is global because it can be reset by command-line arguments
	// glbSldFBuff does NOT apply during focus operations (i.e. when only action is to change focal planes)
	// sldBuff is implemented (i.e. number of focal planes is reduced) when slideView is moved or zoomed
var glbSldFBuf = 1;  // number of focal planes above/below visible plane in slideView - default will be 1?
var glbOldFBuf = Number.NaN;  // old glbSldFBuf when focusing is disabled

	// glbSldMaxF is the maximum number of focal planes (at current zoom-level) loaded into slideView
	//		during focusing operations.  Prior to initialization, this value is NaN unless set by the
	//		user using the "Change Settings" box.  If the user sets this value to > dbMaxF, then glbSldMaxF
	//		is reset to dbMaxF during initialization, but this allows the user to decrease the number of 
	//		view-planes to less than dbMaxF during focusing.
var glbSldMaxF = Number.NaN;  // maximum number of focal planes loaded into slideView during focusing

var glbFDisabled = false;  // set to true if focusing has been disabled

	// glbSldFZBuf determines the number of focal planes allowed at zoom-levels different from displayed level.
	//	 for Z different from current Z, slideView will contain focal planes between
	//		curZ - glbSldFZBuf <= F-at-other-Z <= curZ + glbSldFZBuf
	//	and for F different from curF, slideView will contain zoom-levels at
	//		curF - glbSldFZBuf <= Z at other F <= curF + glbSldFZBuf
	//	NOTE: although I haven't tested it, I think sldRestrictFZ() and sldAddFZBuffer() may have issues
	//		if glbSldFZBuf > glbSldFBuf or glbSldFZBuf > glbSldZBuf
var glbSldFZBuf = 0;  // focal-plane buffer for 'other' zoom levels
var glbOldFZBuf = Number.NaN;  // old glbSldFZBuf when focusing is disabled

	// arrFtoSV[] is empty (length = 0) until populated by sldChangeF().  Then its length equals
	//		dbMaxF for the current zoom level.  It MUST be emptied (arr.splice(0,length) whenever
	//		a non-focusing operation (e.g., zoom level changes or slideView moves) occurs
	//	index of arrFtoSV[] is the F-level.
	//	value of arrFtoSV[f] is the index in sldVw[] of the plane with F-value = f.
	//		If value == -1, then the focal plane isn't in sldVw[]
var glbFtoSV = [];	// array containing ordered by F-values (at current zoom-level) containing sldVw[] indices

	// glbFCycVal is used when "cycle through focal planes" button has been pressed
	//	glbFCycVal.dir is the direction of cycling: values are 1 (cycling up) or -1 (cycling down)
	//	glbFCycVal.timId is the ID number assigned by window.setInterval; NaN implies timer is off
var glbFCycVal = { dir: 1, timId: Number.NaN };  // values needed for cycling through focal planes
var glbFCycInterval = 250;  // interval (in msec) between steps in focal-plane cycling

var glbSldFDef = Number.NaN;  // focal plane used if Z < glbSldZFLim.  Set by sldInitialize(), change from menu
var glbOldFDef = Number.NaN;  // old glbSldFDef when focusing disabled

var glbMusWheelFZ = "z";  // selects whether mouse wheel controls zooom ("z") or focus "f"
		// to prevent mouse wheel from scrolling too fast, 
		//		mouse-wheel will only advance if curTime-glbPnchWhlTime > glbPnchWhlWait
var glbPnchWhlWait = 200;  // minumum time (in msec) between mouse wheel steps
var glbPnchWhlTime = Number.NaN;   // holds time of previous mouse-wheel step



	//	  ***********************************************************************************
	//	  ********************           GLOBAL zoom VARIABLES           ********************
	//	  ***********************************************************************************

// NOTE: prgInitVar() sets/resets:  glbSldStrtZ, glbSldZFLim, glbOldZFLim
//		prgInitVar() does NOT set/reset:  glbSldZBuf


var glbSldStrtZ = Number.NaN;  // zoom-level at initialization.  This is global because it can be reset by command-line arguments
var glbSldZBuf = 1;  // number of zoom-levels above/below current Z that are loaded into slideView - default 1? 0?
var glbSldZFLim = Number.NaN;  // focusing turned-off for Z < glbSldZFLim; value set at initialization or by chgSetting
var glbOldZFLim = Number.NaN;  // old glbSldZFLim when focusing is disabled

var glbZtoSV = [];	// array containing ordered by Z-values (at current/default F) containing sldVw[] indices


	//	  ***********************************************************************************
	//	  ********************           GLOBAL wait VARIABLES           ********************
	//	  ***********************************************************************************

var glbWait = false;     // set to true if waiting for slideView plane to finish loading
		// glbWaitAct indicates the operation that was interupted because imgs in slideView plane weren't completely loaded
		//	"f" waiting to change focal planes in response to button or mouse
		//	"c" waiting to re-start focal-plane cycling
		//	"z" waiting to change zoom-level
var glbWaitAct = "";   // set to "f", "c", or "z" 
var glbWaitDir = 0;      // set to 1 if waiting to increase focal plane or zoom-level, set to -1 if waiting to decrease
var glbDivWaitArr = [];  // an array to hold <div>'s and their former cursors during a "wait" state
var glbIsWaitBxActive = false;  // set to true when waitBox should be kept updated (is visible or in "wait" state
var glbIsWaitBxOpen = false;	// set to true when user opens wait box from menu
var glbTchWaitIconTimer = {clkNum: 0, id: Number.NaN};  // timer for (2-finger) touch wait icon
var glbTchWaitClkInterval = 125;  // time between changing touch wait icon clock face
	// 4/05/20 add btnId to glbTchWaitMenuTimer => wait icon no longer turns off when finger goes up, need to know
	//		the button associated with the "wait" icon
	//  glbTchWaitMenuTimer.tchId => identifier of the touchpoint initiating the wait icon => set to NaN on finger-up
	//	NOT USED: glbTchWaitMenuTimer.btnId => id of btnNode associated with wait-icon; changes if button down during wait
	//	glbTchWaitMenuTimer.clkNum => number of currentlyl displayed clockface
	//	glbTchWaitMenuTimer.id => timer id => set to NaN when timer is off
var glbTchWaitMenuTimer = {tchId: Number.NaN, clkNum: 0, id: Number.NaN};  // timer for touch wait-icon on menu items

	//	  ************************************************************************************
	//	  ********************           GLOBAL cache VARIABLES           ********************
	//	  ************************************************************************************


var glbImgCache = [];  // array that holds previously used "img" tiles.
var glbImgCacheMaxSz = 2000; // maximum number of "img" tiles allowed in glbImgCache


//	  ***************************************************************************************
//	  ************         GLOBAL VARIABLES for slideView move functions         ************
//	  ************         GLOBAL VARIABLES for slideView touch functions        ************
//	  ***************************************************************************************

//  NOTE:  On 10/13/19, I did NOT replace "sld" with "glb" for slide-movement global variables

var glbSVTchPt = 0;  // counts number of fingers currently touching sldBndBox
var glbSVTchLst = []; // gldSVTchLst is an array of an object {tch: TouchObject, time: Date_in_msec}

	// tchMvPos object = {	t0X: x-position of 1st touch,
	//						t0Y: y-position of 1st touch,
	//						t1X; x-position of 2nd touch,
	//						t1Y: y-position of 1st touch,
	//						distSq:  square of distance between t0 & t1,
	//						dist:  this is until sldTchPnch() calculates it while loops through glbTchMvArr[] 
	//						time:  time when positions were recorded
	//						}
var glbTchMvArr = []; // an array of tchMvPos objects
var glbMinPnchDist = 80;  // minimum movement required to fire a pinch/spread
var glbMaxPnchTime = 5000;  // maximum time in ms between start and end of a pinch
	// Since changing F/Z and X,Y-movement can occur more-or-less simultaneously, there
	//	is a problem on how to handle restrictFZ.  The solution that I think I've worked out is
	//	to have the boolean variable glbTchInChgFZ = true if the last action was a pinch/spread.
	//	and FZ is NOT restricted.  If XY-movement occurs and glbTchInChgFZ == true, sldRestrictFZ(true,true)
	//	is called (and glbTchInChgFZ = false) before the moving slideView is moved.  This variable also
	//	may be useful when we find the pinch/spread bug.
var glbTchInChgFZ = false;

	// sldMusPos.x,y are in screen-pixel coordinates
	//  this variable is used by mouse-move functions and is updated everytime sldMoveViewMus() is called
var sldMusPos = {x: 0, y: 0, eventTime: 0};

	//	sldMusSlwDwn holds variables for scrolling slideView after mouse is released (onmouseup)
	//	 velX & velY are the current velocity (pixels/ms) of slideView movement
	//	 avgPts + 1 is the number of mouse velocity movements that are averaged (by sldMoveViewMus() before is mouse released)
	//	 interval is time in ms between movements of slideView after mouse is released
	//	 decel is the rate at which the movement slows down
	//   timer is a pointer to the interval timer	
var sldMusSlwDwn = {velX: 0, velY: 0, avgPts: 8, interval: 15, decel: 0.9, timer: Number.NaN};

	// sldMusSlwDwnMxVel is used by sldSetSlwDwnVel() to limit the mouse slow-down velocity
	//	I think that the units are pixels/msec.
var sldMusSlwDwnMxVel = 10;  // absolute value of the maximum x- or y-mouse-slowdown-velocity 
var glbSlwDwnMxTime = 500;  // the maximum amount of time that the mouse/finger can pause and still have slow-down

	// slideView planes other than the current (visible) plane are moved after the current plane  
	//   has completed its move;  sldMvDistX,Y keeps a running count of the number of pixels moved in
	//   the current (visible) slideView since the other planes were updated.  sldMvDistX,Y are used
	//   by both sldMvCurView(), which responds to buttons, and sldMoveViewMus(), which handles 
	//   mouse-driven slideView moves.  sldMvDistX,Y are used by sldMoveView() to update the 
	//   non-visible slide-View planes.  
	// The function calling sldMoveView() MUST reset sldMvDistX,Y, after the 'for' loop that
	//   repetitively calls sldMoveView().
var sldMvDistX = 0;   // number of pixels moved in X-direction since non-visible planes were updated
var sldMvDistY = 0;   // number of pixels moved in Y-direction since non-visible planes were updated

	// sldMvStepSz, sldMvStepMult, & sldMvStepInterval regulate behavior of move-buttons
	//   these values can be changed by entries in "Settings" menu
var sldMvStepSz = 20;     // number of pixels moved each time a small-step move-button is depressed
var sldMvStepMult = 10;  // multiplier for large-step move-buttons
var sldMvStepInterval = 250  // interval (in msec) between move-steps when a move-button is depressed


	// when a slideView move button is depressed (onmousedown), sldMvBtnDown() sets a timer that
	//   repetitively calls sldMvCurView().  The timer is turned off by sldMvBtnUp(), which also
	//   uses sldMoveView to move the non-visible slideView planes.  These actions require the
	//   global variable (object) glbMvBtnObj.
	//  mvX,Y are the number (positive or negative) of screen-pixels (current zoom-level) that 
	//    the slideView is moved in each step.
	//  btnNum is an ID-number for the move-button that is depressed.  There is a coding scheme
	//     for numbering the buttons:  0 = no button, buttons whose 1st digit is between 1-5
	//     are small-step buttons, buttons with 1st digit between 6-9 have the large step-size  
	//     (step-size = sldMvStepSz * sldMvStepMult).  Buttons with odd-numbered 2nd-digits
	//     move in the negative direction (Up, Left) while buttons with even-numbered 2nd-digits
	//     move in the positive direction (Down, Right).  bthNum ID's are
	//	  0 = no button - used in glbMvBtnobj
	//   11 = navigator Up button
	//	 12 = menu Up button
	//   16 = navigator DblUp button
	//   21 = navigator Down button
	//	 22 = menu Down button
	//   26 = navigator DblDown button
	//   31 = navigator Left button
	//	 32 = menu Left button
	//   36 = navigator DblLeft button
	//   41 = navigator Right button
	//	 42 = menu Right button
	//   46 = navigator DblRight button
	//  timer is the system-assigned number (integer) fo the move-button timer.	
	//	NOTE: sldFPBtnClk() and sldZBtnClk() use a similar button code (but do NOT use glbMvBtnObj)
	//		These functions also use:
	//	 10 = exit from "wait" interrupt - zoom out/focus Up
	//	 20	= exit from "wait" interrupt - zoom in/focus Down
	//	 13 = mouse-wheel: zoom out/focus Up
	//	 23 = mouse-wheel: zoom in/focus Down
	//	 14 = double-click on sldBndBox with shift-key depressed => zoom-out
	//	 24 = double-click on sldBndBox => zoom-in
var glbMvBtnObj = {mvX: 0, mvY: 0, btnNum: 0, timer: Number.NaN};

	//  added 1/29/20:  determines whether the move buttons on navigator & menu cause slideView to move 
	//		in the direction indicated by the arrows (glbMvBtnDir = 1; i.e., the slide moves) or in the
	//		opposite direction (glbMvBtnDir = -1; i.e., the field-of-view moves).
var glbMvBtnDir = -1;



//	  *******************************************************************************
//	  ************     GLOBAL VARIABLES for menu & infoBox functions     ************
//	  ************       including warnBox and copyright box             ************
//	  *******************************************************************************

var viewerVersion = "2.11";
var viewerDate = "January, 2020";
var viewerCopyrightDate = "2019, 2020";

	// for touchscreen computers, we can't hover over main menu items, so toudhing the 
	//	Main menu item causes the item's drop-down content to be visible (i.e. node.style.display = "block")
	//	The node of the visible drop-down content is stored as a glbVisMenuDrpDwnNode, so that it can be
	//	hidden (i.e. node.style.display = "none") when the user touches some other part of the screen.
	//		main: is node of main mendu element ("menuDrpDwnItem")
	//		cont: is node of drop-down content <div> ""menuDrpDwnContent")
var glbVisMenuNode = {main: null, cont: null} ;  // node of menu drop-down content that currently is displayed, 

	// touchEvents on "clickable" menu & navigator items result the background and text colors of these items
	//		being explicitly specified by node.style.backgroundColor or node.style.color commands.  This
	//		overrides the :hover & :active behavior of "clickable" items specified in jrscpMainStyle.css.
	//	An eventListener for a mouseup event is attached to the document which calls tchMenuUnblock().
	//		If glbTchMenuFree == false, tchMenuUnblock sets style.backgroundColor = "" and style.color ==""
	//		for all "clickable" menu items, thus restoring the :hover and :active actions specified in the CSS
var glbTchMenuFree = true;  // if false, a mouseup event will call tchMenuUnblock() 

var glbCpyRtDispTime = 750;  // delay time before copyright box starts to fade
var	glbCpyRtFadeTime = 15;  // interval between fading steps for copyright box
var glbCpyRtFadeAmt = 0.012;	// amount opacity decreases for each step during copyright box fade
var glbCpyRtExtFade = 0.9;   // detemines overlab between fading-down of cpyRtBox and fading-up of IntroPage
var glbCpyRtTimer = {fade: 1 + glbCpyRtExtFade, id: Number.NaN};  // timer id and opacity value for copyright box

var	glbMenuAutoHide = 0;

	// the warning box needs a timer to handle fading-away
	//	fade is the value of 'a' in rgba
	//	id is the timer id
var warnTimer = {fade: 1, id: Number.NaN};

	// warnDisplayTime is the interval that the warning box is displayed before fading
	// warnFadeTime is the interval between fading steps ad the warning box fades away
	// warnFadeAmt is the amount that warnTimer.fade decreases at each step
var warnDisplayTime = 1200;
var warnFadeTime = 30;
var warnFadeAmt = 0.1;
var warnBoxTxtColor = "0,0,0";
var warnBoxBackgrdColor = "255,232,232";
var warnBoxBorderColor = "208,0,0";
var warnBoxQ = [];  // holds warnings waiting to be displayed by warnBoxCall()


	// functions that handle infoBoxes need indices to access the infoBoxList array
	//		(which is a global variable stored in jrscpMenu.js).  Originally, I was 
	//		hard-coding these indices (passing an integer in the arguments to the function)
	//		but the code became obscure because the assignment of these integers was
	//		more-or-less arbitrary (i.e., the order of the data objects in the array is
	//		arbitrary).  As a result, I decided to create a variable for each index (technicially,
	//		these should be declarded as constants, but Javascript's implementation of the 
	//		'const' declaration is a bit awkward (and relatively recent), so I'm declaring
	//		them as variables, even though their values will never change.
	
			//  ***********************************************  
			//  ******   infoBoxList index 'variables'   ******  
			//  ***********************************************  

	// infoBoxes are pop-up divs that transiently display data
	//    (frequently tabular) that is too large to display on the menu.

var infoBxCI = 0;  // index in infoBoxList of cache infoBox (<div id="infoBoxCache">)
var infoBxSVI = 1; // index in infoBoxList of slideView infoBox (<div id="infoBoxSldVw">)
var glbInfoBxDefHt = 700;  // default height of infoBox; reset during program initialization
var glbInfoBxDefTop = 80  // position of top of infoBoxes
var widthSldVwInfoBoxDefault = 1200; //default width of infoBoxSldVw

	// glbInfoBxLst contains a list of all of the info boxes.
	//	btnId is the id of the move btn
	//	boxId is the id of the infoBox
	//	boxNm is the title of the infoBox
	//	boxWd is the width of the infoBox
var glbInfoBxLst = [
		{btnId: "waitBoxMv",  boxId: "waitBox",  boxNm: "Missing Tiles", boxWd: 332},
		{btnId: "aboutBoxMv", boxId: "aboutBox", boxNm: "About", boxWd: 700},
		{btnId: "gotoBoxMv",  boxId: "gotoBox",  boxNm: "Go To", boxWd: 290},
		{btnId: "infoBoxCacheMv", boxId: "infoBoxCache", boxNm: "Cache List", boxWd: 570},
		{btnId: "infoBoxSVwMv", boxId: "infoBoxSldVw", boxNm: "View-plane List", boxWd: 1200},
		{btnId: "infoBoxChgFSetMv", boxId: "chgFSetting", boxNm: "Change Focus Settings", boxWd: 272},
		{btnId: "infoBoxChgSetMv", boxId: "chgSetting", boxNm: "Change Settings", boxWd: 550}
		];


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
var glbInfoBxVal = {x: Number.NaN, y: Number.NaN, left: Number.NaN, top: Number.NaN, boxNode: null, idx: -1};

	// tmpCacheArr[] is a variable used by menu functions to hold an array of text-containing
	//   objects when displaying information about the cache.
	//	index is the index in the cache of the img-object (<img> node) 
	//	imgId is the ID of the img-object (<img id=??>)
	//	f,z,y,x were added 7/18/19 ... these are used when sorting the tmpArr by imgId
	//	   they are set to -1 until/unless the tmpArr is sorted by imgId, when the are set to 
	//	   the f,z,y,x values specified by the imgId.
var tmpCacheArr = [];

	// tmpSldVwLstArr[] is used a (temporary) array used by menu functions when displaying 
	//		information about slideView.
	//	We cannot use sldVw[] directly as the source for the data displayed by "infoBoxSldVw"
	//		because the menu functions re-sort the array of infoBox data (and re-sorting
	//		sldVw[] would cause havoc).  As a result, menuShowSldVwList() copies the relevant
	//		data from sldVw[] into this temporary array, which is then used by the infoBox
	//		menu display functions.
	//	index is the index of the plane in slideView.
	//	f is focal plane == sldVw[].f
	//	z is the zoom-level == sldVw[].z
	//	see menuShowSldVwList() for list of other variables in this array
var tmpSldVwLstArr = [];

	//  NOTE:  THERE WAS A PROBLEM WITH HOISTING DECLARATIONS OF FUNCTIONS THAT REQURES THAT
	//		REQUIRES THAT THE ARRAY: infoBoxList[], which references a function in jrsccpMenu.js,
	//		be defined at the END of jrscpMenu.js, even thouth it is a global variable 
//var infoBoxList = [];

	// infoCTabList is the btnArr[] array containing column & button info for the infoCacheBox				
var infoCTabList = [
					{colId: "tabCacheHdInd", colTxt: "index", btnTxt: "Sort by image-ID"},
					{colId: "tabCacheHdImg", colTxt: "image ID", btnTxt: "Sort by index"}
					];

	// infoSldVwList[] os tje btmArr[] containing columne & button info for the infoSldVwBox
	//	There are more than two possible sorting options, so the btnTxt indicates the NEXT
	//		sorting option.  Clicking multiple times walks through the sorting options.	
var infoSVwTabList = [
					{colId: "tabSVwHdInd", colTxt: "index", btnTxt: "Sort by F then Z"},
					{colId: "tabSVwHdF", colTxt: "F<br>(<span style='font-size:10px'>focal&nbsp;plane", btnTxt: "Sort by Z then F"},
					{colId: "tabSVwHdZ", colTxt: "Z<br>(<span style='font-size:10px'>zoom&nbsp;level", btnTxt: "Sort by index"}
					];
					
