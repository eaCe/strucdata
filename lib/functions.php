<?php

function getJsonLD($array)
{
    echo '<script type="application/ld+json">';
    echo json_encode($array);
    echo '</script>';   
}