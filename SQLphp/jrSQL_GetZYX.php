<?php

// jrSQL_GetZYX.php
//	Copyright 2019  Pacific Northwest University of Health Sciences
    
//	jrSQL_GetZYX.php is part of "PNWU Microscope", which is an internet web-based program that
//		displays digitally-scanned microscopic specimens.
//	"PNWU Microscope" is free software:  you may redistribute it and/or modify it under the terms of
//		the GNU General Public License as published by the Free Software Foundation, either version 3
//		of the License, or any later version.  See <https://www.gnu.org/licenses/gpl-3.0.html>
//	"PNWU Microscope" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//		without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//		See the GNU Public License for more details.
//	Currently, "PNWU Microscope" consists of 15 principal files and other supplementary files:
//		- one HTML file.
//		- one cascading style sheet 
//		- nine javascript files
//		- four PHP files (including jrSQL_GetZYX.php)
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

//	jrSQL_GetZYX.php is passed the number (dbSldNum) of the slide being displayed.
//		It returns an array containing the ZYX data that will be stored in dbSldData[].

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
	$jrArray = array();
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
	$sqlStr = "SELECT Z, numF, strtY, numY, strtX, numX";
	$sqlStr .= " FROM tabZYX";
	$sqlStr .= " WHERE sldNum = ?;";
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
				else {
					for ($i = 0; $i < $jrRows; $i++) {
						$jrResult = mysqli_fetch_array($sqlRes,MYSQLI_ASSOC);
						$jrArray[$i] = $jrResult;
						}
					}
				}
			}
		if (!mysqli_stmt_close($sqlStmt)) {
			$jrError .= "SQL error: unable to close prepared statement : " . mysqli_stmt_error($sqlStmt) . "\n";
			}
		}
	$jrResult = json_encode($jrArray);
	if (($jrError != "") && ($jrRows > 0)) {  // $jrArray == "[]" if empty; $jrRows > 0 if result exists
		echo "!!!!" . $jrError . "!!!!" . $jrResult;
		}
	else if ($jrRows > 0) { echo $jrResult; }
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
