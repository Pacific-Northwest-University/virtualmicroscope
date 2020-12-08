// jrsbRegAjax.js
//	Copyright 2020  Pacific Northwest University of Health Sciences
    
//	jrsbRegAjax.js is part of the "slide box" portion of the "PNWU Virtual Microscope",
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


// *********************************************************
// ******          slide-selection functions          ******
// ******        Ajax call & return functions         ******
// *********************************************************

	// sbGetSldList() clears glbSldItmArr[] and then generates
	//	an Ajax call to jrSB_GetSldLst.php
	
function selGetSldList() {
	var strURL = "jrSB_GetSldLst.php" + selMakeSrchStr();
	if (glbSldItmArr.length > 0) glbSldItmArr.splice(0);
		// start timer & set cursor to "wait"
		//	hide "Get slide list" button (so user can't click it again
	glbAjxTimer = window.setTimeout(ajxConnectFail,glbAjxTimeOut);
	document.body.style.cursor = "wait";  // this puts the "wait" cursor on the entire window
	document.getElementById("startBtn").style.visibility="hidden" ;
		// use Ajax to get slide list from server
	var ajxReq = new XMLHttpRequest();
	ajxReq.onreadystatechange = function () {
		if ((this.readyState == 4) && (this.status == 200)) {
			document.body.style.cursor = "";  // restore cursors to previous state
			window.clearTimeout(glbAjxTimer);
			glbAjxTimer = Number.NaN;
			selMakeItmArr(this);
			}
		}
	ajxReq.open("GET",strURL,true);	
	ajxReq.send();
	return;
	}


