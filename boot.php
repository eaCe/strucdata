<?php
include_once('lib/functions.php');

if (rex::isBackend())
{
    rex_view::addCssFile($this->getAssetsUrl('css/bootstrap-editable.css'));
    rex_view::addCssFile($this->getAssetsUrl('css/jjsonviewer.css'));
    rex_view::addJsFile($this->getAssetsUrl('js/bootstrap-editable.min.js'));
    rex_view::addJsFile($this->getAssetsUrl('js/jjsonviewer.js'));
    rex_view::addJsFile($this->getAssetsUrl('js/app.js'));
}