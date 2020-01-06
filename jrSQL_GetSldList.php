<?php 

// jrSQL_GetSldList.php
//	Copyright 2019  Pacific Northwest University of Health Sciences
    
//	jrSQL_GetSldList.php is part of "PNWU Microscope", which is an internet web-based program that
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
//		- four PHP files (including jrSQL_GetSldList.php)
//	Questions concerning "PNWU Microscope" may be directed to:
//		James Rhodes, PhD
//		Pacific Northwest Univesity of Health Sciences
//		200 University Parkway
//		Yakima WA 98901 USA

//	jrSQL_GetSldList.php currently returns a list of all of the slides in the SQL database.
//		This list is used prgCreateSldList() to create a drop-down menu from which the
//		user may choose the slide to be displayed.


jrGetSQLList();

		// This file returns a list of sldNum, sldName, sldOrgan, and maxF which will be used
		//		to create the "Choose a slide" slide list.
		//	Eventually, we may want to pass the file an array of slides to include in the list,
		//		but for now, we will display all of the slides in the database.
		//	Because we may want deal with an array later, the SQL call is encoded as a function 
		//		(jrGetSQLList()) with the body of the PHP file calling the function


function jrGetSQLList() {
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
	$sqlStr = "SELECT tabSldList.sldNum, tabSldList.sldName, tabSldInfo.sldOrgan, tabSldList.maxF";
	$sqlStr .= " FROM tabSldList";
	$sqlStr .= " INNER JOIN tabSldInfo ON tabSldList.sldNum = tabSldInfo.sldNum";
	$sqlStr .= ";";
	$sqlVal = mysqli_query($conn, $sqlStr);
	if (mysqli_num_rows($sqlVal) > 0) {
		$jrResult = mysqli_fetch_all($sqlVal,MYSQLI_ASSOC);
		echo json_encode($jrResult);
		}
	else {
		echo "SQL call failed";
		}
	mysqli_close($conn);
	return;
	}

exit;
?>
