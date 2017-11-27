<?php
include_once rex_path::addon('strucdata', 'lib/functions.php');

if (rex_post('getPhpArray') == "true")
{
    ob_end_clean();
    $json = json_encode(rex_post("json"));
    var_export(json_decode($json, true));
    exit;
}
?>

<style>
    #sdata-wrapper .group-headline
    {
        font-weight: bold;
        font-style: italic;
    }

    #sdata-wrapper ul
    {
        list-style: none;
        padding-left: 20px;
    }

    #sdata-wrapper ul li
    {
        padding: 3px 0;
    }

    #sdata-wrapper ul li.active
    {
    }

    #sdata-wrapper ul li .group-headline
    {
        cursor: pointer;
    }

    #sdata-wrapper ul li.inactive, #sdata-wrapper ul li.inactive a
    {
        color: #DFE3E9;
        border-color: #DFE3E9;
    }

    #sdata-wrapper ul li.inactive >ul *
    {
        pointer-events: none;
        cursor: default;
    }
    
    h3.app-headline
    {
        margin-bottom: 0px;
        margin-top: 8px;
    }
    
    h3.type-name
    {
        margin-top: 10px;
    }
</style>

<section class="rex-page-section">

    <div class="panel panel-primary">
        <div class="panel-heading"><strong><?= $this->i18n('further_informations') ?></strong></div>
        <div class="panel-body">
            <p>
                <a href="https://developers.google.com/search/docs/guides/intro-structured-data" target="_blank" rel="noopener noreferrer">Einleitung strukturierte Daten von Google <i class="rex-icon fa-external-link"></i></a>
            </p>
            <p>
                <a href="https://search.google.com/structured-data/testing-tool" target="_blank" rel="noopener noreferrer">Test-Tool für strukturierte Daten <i class="rex-icon fa-external-link"></i></a>
            </p>
            <p>
                <a href="http://schema.org/docs/schemas.html" target="_blank" rel="noopener noreferrer">Übersicht auf schema.org <i class="rex-icon fa-external-link"></i></a>
            </p>
        </div>
    </div>

    <div class="panel panel-default ">
        <div class="panel-heading">
            <div class="row">
                <div class="col-sm-8">
                    <h3 class="app-headline"><?= $this->i18n('app_headline') ?></h3>
                </div>
                <div class="col-sm-4">
                    <div class="form-inline text-right">
                        <div class="form-group ">
                            <label for="json-select"><?= $this->i18n('type_selection') ?>: </label>
                            <select class="form-control" id="json-select">
                                <?php
                                $jsonFolder;
                                if ($jsonFolder = opendir(rex_url::addonAssets('strucdata', 'json')))
                                {
                                    while (false !== ($entry = readdir($jsonFolder)))
                                    {
                                        if ($entry != "." && $entry != "..")
                                        {
                                            $path = rex_url::addonAssets('strucdata', 'json/' .$entry);
                                            $path_parts = pathinfo($path);

                                            echo "<option value='".$path."'>". $path_parts['filename'] ."</option>";
                                        }
                                    }

                                    closedir($jsonFolder);
                                }
                                ?>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        <div class="panel-body">
            <div id="sdata-wrapper">
                <div class="row">
                    <div class="col-md-6">
                        <div id="json-editor"></div>
                    </div>
                    <div class="col-md-6">
                        <br><br>
                        <div id="json-preview"></div> 
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <br>
                            <p>
                                <strong><?= $this->i18n('php_array') ?></strong>                            
                            </p>
                            <input type="text" class="form-control php-array" id="php-array">
                            <br>
                            <a href="" class="btn btn-primary" id="update-php-array">PHP Array aktualisieren</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="panel panel-success">
        <div class="panel-heading"><strong><?= $this->i18n('usage') ?></strong></div>
        <div class="panel-body">
            <p><strong><?= $this->i18n('input') ?></strong></p>
            <pre>$array = array('@context' => 'http://www.schema.org', ... );
getJsonLD($array);</pre>
            <br>
            <p><strong><?= $this->i18n('output') ?></strong></p>
            <pre>&lt;script type="application/ld+json"&gt;
{
   "@context":"http://www.schema.org",
   "@type":"Event",
    ...
}
&lt;/script&gt;</pre>
        </div>
    </div>
</section>

<script>
    var sDataUrl = "<?= rex_url::currentBackendPage() ?>";
    
    jQuery(document).ready(function ()
    {
        try
        {
            new redaxo.SDataApp();
        }
        catch (e)
        {
            console.error("SDataApp: ", e);
        }
    });
</script>
