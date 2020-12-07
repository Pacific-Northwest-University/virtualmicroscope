<?php

// jrSQL_GetSlideInfo.php
//	Copyright 2019  Pacific Northwest University of Health Sciences
    
//	jrSQL_GetSlideInfo.php is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you may redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	"PNWU Microscope" consists of two parts: a Viewer and a SlideBox.
//		This *.php file (jrSQL_GetSldInfo.php) is part of the Viewer.  Currently, the Viewer consists
//		 of 17 principal files and other supplementary files:
//		- one HTML file.
//		- two cascading style sheet 
//		- 11 javascript files
//		- three PHP files (including jrSQL_GetSlideInfo.php)
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

//	jrSQL_GetSlideInfo.php is passed a slide number (dbSldNum), queries the SQL database for the extra 
//		information (in addition to that provided by jrSQL_GetSlideBasic.php) related to that slide-number, 
//		and then returns the values to sqlSldInfo(), mainly for display in "Slide Info" menu
//		(1) sldOrgan => the tissue or organ from which the "real" slide was prepared
//		(2) sldSpecies => the species (animal, etc) from which the tissue or organ derived
//		(3) strStainAbbr => short version of the stain used in preparing the slide

// Note: to be compatible with javasript's alert() function, the error statements use
//		newline characters '\n' rather than HTML break codes "<br>" codes.  If/when
//		I write new alert & confirm boxes, we'll need to change the \n' to "<br>"

// If both a SQL result and error messages are generated (e.g., an error in closing the prepared
//		statement), the error meesage(s) is listed first and is surrounded on both sides by four
//		exclamation marks.  The client can tell if it is getting both an error message and the 
//		SQL result by testing for "!!!!", and can retrieve both the error and the SQL result
//		by splicing the returned string using the "!!!!" delimiters.

// Error messages all begin with "SQL "
// The client can identify an error by "SQL" and the type of error by the character at position 5.
//  If no match to the slide number is found, the error message begins with "SQL 0 ..."
//	If the number of rows (matches) is < 0 or >1, the error message begines "SQL returned ..."
//	For "true" SQL errors:  the error message begins with "SQL error: ..."
//	For error messages involving slide number on command line, the message begins with "SQL - ..."

// The body ("main") of this PHP file (at bottom of file) tests for a valid slide number.  If
//	slide number is an integer, it is passed to jrSQLQuery() which does the rest.


$slideId = $_REQUEST["slide"];

function jrSQLQuery($sldNum) {
	$jrResult = "";
	$jrError = "";
	$servername = "localhost";
	$username = "<UserNameGoesHere>"; //Need to replace <UserNameGoesHere> with username for SQL database
	$password = "<UserPasswordHere>"; //Need to replace <UserPasswordHere> with password for SQL database
	$dbname = "slideDataPNWU";
			// Create connection
	$conn = mysqli_connect($servername, $username, $password, $dbname);
			// Check connection
	if (!$conn) {
    	echo "SQL error: connection failed:  " . mysqli_connect_error() . "\n";
		return;
		}
			// create SQL query
	$sqlStr = "SELECT tabSldInfo.sldOrgan, tabSldInfo.sldSpecies, tabStains.strStainAbbr";
	$sqlStr .= " FROM tabSldInfo";
	$sqlStr .= " INNER JOIN tabStains ON tabSldInfo.stainID = tabStains.stainID";
	$sqlStr .= " WHERE tabSldInfo.sldNum = ?;";
			// prepare SQL statement
	$sqlStmt = mysqli_prepare($conn, $sqlStr);
	if (!$sqlStmt) {  
		$jrError = "SQL error: preparing statement failed:\n  " . mysqli_error($conn) . "\n";
		}
	else {  // need to close statement
		if (!mysqli_stmt_bind_param($sqlStmt,"i",$sldNum)) {
			$jrError = "SQL error: binding of prepared statement failed:\n  ". mysqli_stmt_error($sqlStmt) . "\n";
			}
		else if (!mysqli_stmt_execute($sqlStmt)) {
			$jrError = "SQL error: execution of prepared statement failed:\n  ". mysqli_stmt_error($sqlStmt) . "\n";
			}
		else {
			$sqlRes = mysqli_stmt_get_result($sqlStmt);
			if (!$sqlRes) {
				$jrError = "SQL error: get_result failed:  " . mysqli_stmt_error($sqlStmt) . "\n";
				}
			else {
				$jrRows = mysqli_num_rows($sqlRes);
				if ($jrRows < 0) { $jrError = "SQL returned < 0 rows(" . $jrRows . ").\n"; }
				else if ($jrRows == 0) { $jrError = "SQL 0 rows returned.\n"; }
				else if ($jrRows > 1) { $jrError = "SQL returned > 1 row (" . $jrRows . ").\n"; }
				else {
					$jrResult = mysqli_fetch_array($sqlRes,MYSQLI_ASSOC);
					}
				}
			}
		if (!mysqli_stmt_close($sqlStmt)) {
			$jrError .= "SQL error: unable to close prepared statement : " . mysqli_stmt_error($sqlStmt) . "\n";
			}
		}
	if (($jrError != "") && ($jrResult != "")) {
		echo "!!!!" . $jrError . "!!!!" . json_encode($jrResult);
		}
	else if ($jrResult != "") {	echo json_encode($jrResult); }
	else { echo $jrError; }
	mysqli_close($conn);
	return;
	}

if ($slideId == "") { echo "SQL - must specify a slide number\n"; }
else if (!filter_var($slideId,FILTER_VALIDATE_INT)) {
	echo "SQL - slide number must be an integer\n";
	}
else { jrSQLQuery($slideId); }
exit;
?>
