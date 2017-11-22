var currentJson;
var currentJsonType;

jQuery(document).ready(function ()
{
    var redaxo = redaxo || {};
    redaxo.SDataGroup = redaxo.SDataGroup || (function (jQuery)
    {
        var SDataGroup = function (initValues)
        {
            var jGroup = initValues.jGroup;
            var key = initValues.key;
            var parentInstance = initValues.parentInstance;
            var jGroupHeading = jGroup.find(".group-headline").first();

            jQuery.extend(true, this,
            {
                jGroup: jGroup,
                jGroupHeading: jGroupHeading,
                key: key,
                parentInstance: parentInstance
            });

            init.call(this);
        };
        SDataGroup.STATE_ACTIVE = 0x01;
        SDataGroup.STATE_INACTIVE = 0x02;

        var init = function init()
        {
            this.state = SDataGroup.STATE_ACTIVE;
            setQueryArray.call(this);
            setGroupObject.call(this);
            setEvents.call(this);
        };

        var setQueryArray = function setQueryArray()
        {
            var that = this;
            var jParents = that.jGroup.parents("ul");
            var qryArray = [];
            var parentArray = [];

            for (var i = 0; i < jParents.length; i++)
            {
                var jParent = jQuery(jParents[i]);
                var group = jParent.data("key");

                if (typeof group !== "undefined")
                {
                    parentArray.push(group);
                    qryArray.push(group);
                }
            }

            parentArray = parentArray.reverse();
            that.parentsArray = parentArray;

            qryArray = qryArray.reverse();
            qryArray.push(that.key);
            that.qryArray = qryArray;
        };

        var setEvents = function setEvents()
        {
            var that = this;

            that.jGroupHeading.on("click", function ()
            {
                var jGroup = that.jGroup;
                var jIcon = jGroup.find("i.rex-icon").first();
                var obj = {};

                obj["key"] = that.key;
                obj["parents"] = that.parentsArray;
                obj["object"] = that.groupObject;

//                    var obj = that.key[that.groupObject];
                that.jGroup.toggleClass('active inactive');
                jIcon.toggleClass('fa-eye fa-eye-slash');

                if (that.state === SDataGroup.STATE_ACTIVE)
                {
                    that.state = SDataGroup.STATE_INACTIVE;
                    redaxo.SData.prototype.updateObjByArray.call(that.parentInstance, currentJson, that.qryArray, "");
                }
                else
                {
                    that.state = SDataGroup.STATE_ACTIVE;
                    redaxo.SData.prototype.updateObjByArray.call(that.parentInstance, currentJson, that.parentsArray, obj);
                }
            });
        };

        var setGroupObject = function setGroupObject()
        {
            var qryArray = this.qryArray;
            var obj = currentJson;

            for (var i = 0; i < qryArray.length; i++)
            {
                obj = obj[qryArray[i]];
            }

            this.groupObject = obj;
        };

        return SDataGroup;
    }(jQuery));

    var redaxo = redaxo || {};
    redaxo.SDataEditable = redaxo.SDataEditable || (function (jQuery)
    {
        var SDataEditable = function (initValues)
        {
            var jElement = initValues.jElement;
            var type = initValues.type;
            var key = initValues.key;
            var parentInstance = initValues.parentInstance;
            var jPhpArrayBtn = jQuery("#update-php-array");

            jQuery.extend(true, this,
            {
                jElement: jElement,
                type: type,
                key: key,
                parentInstance: parentInstance,
                jPhpArrayBtn: jPhpArrayBtn,
                parents: null
            });

            init.call(this);
        };

        var init = function init()
        {
            setParents.call(this);
            initEdiable.call(this);
            getPhpArray.call(this);
            setEvents.call(this);
        };

        var getParents = function getParents(jAnchor)
        {
            var jParents = jAnchor.parents("ul");
            var parentArray = [];

            for (var i = 0; i < jParents.length; i++)
            {
                var jParent = jQuery(jParents[i]);
                var group = jParent.data("key");

                if (typeof group !== "undefined")
                {
                    parentArray.push(group);
                }
            }

            return parentArray;
        };

        var setParents = function setParents()
        {
            var that = this;
            that.parents = getParents(that.jElement).reverse();

            that.jElement.attr("data-parents", that.parents);
        };

        var initEdiable = function initEdiable()
        {
            var that = this;
            that.jElement.editable(
            {
                type: that.type,
                emptytext: 'leer',
                success: function (response, newValue)
                {
                    var jThis = jQuery(this);
                    var key = that.key;
                    var parents = getParents(jThis).reverse();
                    var searchArray = parents;

                    searchArray.push(key);

                    redaxo.SData.prototype.updateObjByArray.call(that.parentInstance, currentJson, searchArray, newValue);
                }
            });
        };

        var getPhpArray = function getPhpArray()
        {
            jQuery.ajax(
            {
                type: "POST",
                url: sDataUrl,
                data: {getPhpArray: true, json: currentJson},
                success: function (data)
                {
                    jQuery("#php-array").val(data.replace(/ +(?= )/g, ''));
                },
                error: function (xhr, type, exception)
                {
                    console.error("ajax error response xhr, type, exception ", xhr, type, exception);
                }
            });
        };

        var setEvents = function setEvents()
        {
            var that = this;

            that.jPhpArrayBtn.on("click", function (event)
            {
                event.preventDefault();

                getPhpArray.call(that);
            });
        };

        return SDataEditable;
    }(jQuery));


    var redaxo = redaxo || {};
    redaxo.SData = redaxo.SData || (function (jQuery)
    {
        var SData = function (initValues)
        {
            var jJsonPreview = jQuery("#json-preview");
            var jJsonEditor = jQuery("#json-editor");
            var jInlineEditElements = jQuery('.inline-edit');
            var groupInstances = [];

            jQuery.extend(true, this,
            {
                jJsonPreview: jJsonPreview,
                jJsonEditor: jJsonEditor,
                groupInstances: groupInstances,
                jInlineEditElements: jInlineEditElements
            });

            init.call(this);
        };

        var init = function init()
        {
            //initial update json-preview
            clearContainer.call(this);
            updateJsonView.call(this);
            buildHtml.call(this, currentJson);
            setEvents.call(this);
            initGroups.call(this);
        };

        var clearContainer = function clearContainer()
        {
            this.jJsonEditor.empty();
        };

        var escapeHtml = function escapeHtml(string)
        {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return string.replace(/[&<>"']/g, function (m)
            {
                return map[m];
            });
        };

        var updateJsonView = function updateJsonVIew()
        {
            this.jJsonPreview.jJsonViewer(currentJson);
        };

        SData.prototype.updateObjByArray = function updateObjByArray(obj, array, updateValue)
        {
//                if (!array.length)
//                {
//                    return obj;                   
//                }

            var prop;

            for (var i = 0, len = array.length - 1; i < len; i++)
            {
                prop = array[i];

                var candidate = obj[prop];
                if (candidate !== undefined)
                {
                    obj = candidate;
                }
                else
                {
                    break;
                }
            }

            if (updateValue === "")
            {
                delete obj[array[i]];
            }
            else if (typeof updateValue === "object")
            {
                if (updateValue.parents.length > 1)
                {
                    console.log("for loop");
                }
                else if (updateValue.parents.length === 1)
                {
                    obj[updateValue.parents][updateValue.key] = updateValue.object;
                }
                else
                {
                    obj[updateValue.key] = updateValue.object;
                }
            }
            else
            {
                obj[array[i]] = updateValue;
            }

            updateJsonView.call(this);
        };

        var buildHtml = function buildHtml(jsonObj)
        {
            var jMainContain = jQuery('<ul></ul>');
            var d = d || 0;
            function iterateThrough(obj, jElement)
            {
                Object.keys(obj).forEach(function (curKey)
                {
                    if (typeof obj[curKey] === 'object')
                    {
                        var jListEntry = jQuery("<li class='active group' data-key='" + curKey + "'><span class='group-headline' data-key='" + curKey + "'>" + curKey + " <i class='rex-icon fa-eye'></i></span></li>");
                        var jList = jQuery("<ul data-key='" + curKey + "'></ul>");
                        jListEntry.append(jList);
                        jElement.append(jListEntry);
                        iterateThrough(obj[curKey], jList);
                    }
                    else
                    {
                        var jListEntry = jQuery("<li></li>");
                        var anchor;
                        var value = escapeHtml(obj[curKey]);

                        if (/@/.test(curKey))
                        {
                            anchor = "<strong>" + curKey + "</strong>: <span>" + value + "</span>";
                        }
                        else
                        {
                            anchor = "<strong>" + curKey + "</strong>: <a class='inline-edit' href='' data-value='" + value + "' data-key='" + curKey + "'>" + value + "</a>";
                        }

                        jListEntry.html(anchor);
                        jElement.append(jListEntry);
                    }
                });
            }
            iterateThrough(jsonObj, jMainContain);
            this.jMainContain = jMainContain;
            this.jJsonEditor.append(jMainContain);
            this.jJsonEditor.prepend("<h3 class='type-name'>" + currentJsonType + "</h3>");
        };

        var initGroups = function initGroups()
        {
            var that = this;
            var jGroupWrappers = that.jMainContain.find("li.group");

            for (var i = 0; i < jGroupWrappers.length; i++)
            {
                var jGroup = jQuery(jGroupWrappers[i]);
                var key = jGroup.data("key");

                var group = new redaxo.SDataGroup(
                {
                    parentInstance: that,
                    jGroup: jGroup,
                    key: key
                });

                that.groupInstances.push(group);
            }
        };

        var setEvents = function setEvents()
        {
            var that = this;
            var jElements = jQuery('.inline-edit');
            for (var i = 0; i < jElements.length; i++)
            {
                var jElement = jQuery(jElements[i]);
                var key = jElement.data("key");
                var type = (key === "description") ? "textarea" : "text";

                new redaxo.SDataEditable(
                {
                    parentInstance: that,
                    jElement: jElement,
                    key: key,
                    type: type
                });
            }
        };

        return SData;
    }(jQuery));


    var redaxo = redaxo || {};
    redaxo.SDataApp = redaxo.SDataApp || (function (jQuery)
    {
        var SDataApp = function (initValues)
        {
            var jJsonSelect = jQuery("#json-select");

            jQuery.extend(true, this,
            {
                jJsonSelect: jJsonSelect
            });

            init.call(this);
        };

        var init = function init()
        {
            setEvents.call(this);
            getJson.call(this);
        };

        var setEvents = function setEvents()
        {
            var that = this;

            that.jJsonSelect.on('change', function ()
            {
                getJson.call(that);
            });
        };

        var getJson = function getJson()
        {
            var that = this;
            var jSelected = that.jJsonSelect.find(":selected");
            var url = jSelected.val();
            var type = jSelected.text();

            jQuery.getJSON(url, function (data)
            {
                currentJson = data;
                currentJsonType = type;
                initEditor();
            }).fail(function (jqXHR, textStatus, errorThrown)
            {
                console.error(jqXHR, textStatus, errorThrown);
            });

        };

        var initEditor = function initEditor()
        {
            new redaxo.SData();
        };

        return SDataApp;
    }(jQuery));

    new redaxo.SDataApp();

});