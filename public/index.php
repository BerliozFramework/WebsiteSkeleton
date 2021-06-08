<?php

// Load composer loaded
$loader = require_once __DIR__ . "/../vendor/autoload.php";

try {
    // CLI Server
    if (php_sapi_name() === 'cli-server') {
        if (is_file(__DIR__ . DIRECTORY_SEPARATOR . ltrim($_SERVER["REQUEST_URI"], '/'))) {
            return false;
        }
    }

    // App
    $app = new \Berlioz\Http\Core\App\HttpApp();
    $app->print($app->handle());
} catch (\Throwable $e) {
    print '<pre>' . $e . '</pre>';
}
