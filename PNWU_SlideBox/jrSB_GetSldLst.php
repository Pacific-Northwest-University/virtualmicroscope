<?php 

//	jrSB_GetSldLst.php is part of the "PNWU Virtual Slide Box" portion of "PNWU Virtual Microscope",
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
//	Currently, the "slide box" part of "PNWU Microscope" consists of 9 principal files 
//		(and other supplementary files):
//		- one HTML file.
//		- one cascading style sheet
//		- six javascript files
//		- one PHP file (this file).
//	Questions concerning "PNWU Virtual Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

		// This file returns a list of sldNum, sldName, sldOrgan, sldSpecies, maxF, strStainAbbr,
		//		and the paths to the image root and label image.  These will be used by 
		//		selMakeItmArr() & lstBuildWnd() to create the "Choose a slide" slide list.
		//	The SQL call is encoded as a function (jrGetSQLList()) with the body of the PHP file 
		//		calling the function

 jrReadCmdLine();
//jrGetSQLList();

		//jrReadCmdLine() parses the URL for _REQUEST that match the options available from SlideBox.htm
		//	and constructs part of a SQL query string from those requests.  It passes the query string to
		//	jrGetSQLList() for appending to the SQL statement
function jrReadCmdLine() {
//$jrStr = "";
	$jrCurStr = "";
	$jrReqLst = array(  // list of possible limiting parameters
					array("org","",array(),"tabOrgan.orgNum"),
					array("src","",array(),"tabSldList.srcID"),
					array("stn","",array(),"tabSldInfo.stainID"),
					array("fmx","",array(),"tabSldList.maxF"),
					array("num","",array(),"tabSldList.sldNum")
					); 
	$jrValArr = array();
	for ($i = 0; $i < count($jrReqLst); $i++) {
		$jrReqLst[$i][1] = $_REQUEST[$jrReqLst[$i][0]];
		if ($jrReqLst[$i][1] == "") { continue; }
		$jrReqLst[$i][2] = explode(")",$jrReqLst[$i][1]);
				// last element in array is empty because _REQUEST ends with ")"
		array_splice($jrReqLst[$i][2],(count($jrReqLst[$i][2])-1));
		for ($j = 0; $j < count($jrReqLst[$i][2]); $j++) {
					// strip out everything before (and including) "("
			$strtI = strpos($jrReqLst[$i][2][$j],"(") + 1;
			$jrReqLst[$i][2][$j] = substr($jrReqLst[$i][2][$j],$strtI);
			}
// different from jrSB_SupSldLst.php
		$jrCurStr .= " AND (";
// end different from jrSB_SupSldLst.php 
		$jrCurArrSz = count($jrReqLst[$i][2]);
		if ($jrCurArrSz > 1) { $jrCurStr .= "("; } // need extra parenthesis for OR statements
		for ($j = 0; $j < $jrCurArrSz; $j++){
			$jrValArr = explode(",",$jrReqLst[$i][2][$j]);
			$jrValArr[0] = intval($jrValArr[0]);
			$jrValArr[1] = intval($jrValArr[1]);
			if (count($jrValArr) != 2) {
				echo "SQL error: two (and only two) values are allowed in \"" . $jrReqLst[$i][0] . "= ". $jrReqLst[$i][1] . "\".";
				return;
				}
			if (($jrValArr[0] == 0) || ($jrValArr[1] == 0)) {
				echo "SQL error: illegal value in \"".$jrReqLst[$i][0] . "=" . $jrReqLst[$i][1] . "\".";
				return;
				}
			if (($jrValArr[0] < 0) && ($jrValArr[1] < 0)) {
				echo "SQL error: only one (at most) of the values in \"" . $jrReqLst[$i][0] . "=" . $jrReqLst[$i][1] . "\" should be negative.";
				return;
				}
			if ($jrValArr[0] < 0) { $jrCurStr .= $jrReqLst[$i][3] . " <= " . $jrValArr[1] . ")"; }
			else if ($jrValArr[1] < 0) { $jrCurStr .= $jrReqLst[$i][3] . " >= " . $jrValArr[0] . ")"; }
			else if ($jrValArr[0] == $jrValArr[1]) { $jrCurStr .= $jrReqLst[$i][3] . " = " . $jrValArr[0] . ")"; }
			else { $jrCurStr .= $jrReqLst[$i][3] . " BETWEEN " . $jrValArr[0] . " AND " . $jrValArr[1] . ")"; }
			if ($j < $jrCurArrSz - 1 ) { $jrCurStr .= " OR ("; }
			}
		if ($jrCurArrSz > 1) { $jrCurStr .= ")"; } // need extra parenthesis for OR statements
		}
	jrGetSQLList($jrCurStr);
	return;
	}


function jrGetSQLList($jrExtSrchStr) {
	$servername = "localhost";
	$username = "<UserNameGoesHere>"; //Need to replace <UserNameGoesHere> with username for SQL database
	$password = "<UserPasswordHere>"; //Need to replace <UserPasswordHere> with password for SQL database
	$dbname = "slideDataPNWU";
	$jrResult ="";
		// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);
		// Check connection
	if (!$conn) {
    	die("SQL connection failed: " . mysqli_connect_error());
		}
		// Select data
	$sqlStr = "SELECT DISTINCT tabSldList.sldNum, tabSldList.sldName, tabSldInfo.sldOrgan, tabSldInfo.sldSpecies,";
	$sqlStr .= " tabSldList.maxF, tabStains.strStainAbbr, tabSldList.sldRoot, tabSldList.lblPathName";
	$sqlStr .= " FROM tabSldList";
	$sqlStr .= " INNER JOIN tabSldInfo ON tabSldList.sldNum = tabSldInfo.sldNum";
	$sqlStr .= " INNER JOIN tabStains ON tabSldInfo.stainID = tabStains.stainID";
	$sqlStr .= " INNER JOIN tabOrgan ON tabSldList.sldNum = tabOrgan.sldNum";
	$sqlStr .= " WHERE (tabSldList.isRstrctd = 0)" . $jrExtSrchStr;
	$sqlStr .= ";";
	$sqlVal = mysqli_query($conn, $sqlStr);
	if (mysqli_num_rows($sqlVal) > 0) {
		$jrResult = mysqli_fetch_all($sqlVal,MYSQLI_ASSOC);
		echo json_encode($jrResult);
		}
	else if (mysqli_num_rows($sqlVal) == 0) {
		echo "NONE";
		}
	else {
		echo "SQL call failed";
		}
	mysqli_close($conn);
	return;
	}

exit;
?>
