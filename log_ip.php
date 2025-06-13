<?php
$ip = $_SERVER['REMOTE_ADDR'];
$time = date("Y-m-d H:i:s");
file_put_contents("visitor_log.txt", "IP: $ip - Time: $time\n", FILE_APPEND);
?>
