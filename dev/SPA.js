/** @license SPAjs | (c) Kumararaja <sucom.kumar@gmail.com> | License (MIT) */
/* ===========================================================================
 * SPAjs is the collection of javascript functions which simplifies
 * the interfaces for Single Page Application (SPA) development.
 *
 * Dependency: (hard)
 * 1. jQuery: http://jquery.com/
 * 2. lodash: https://lodash.com/
 *
 // * Optional
 * {backbone}     : http://backbonejs.org/
 * {handlebars}   : http://handlebarsjs.com/ || https://github.com/wycats/handlebars.js/
 * {mustache}     : http://mustache.github.io/ || https://github.com/janl/mustache.js
 *
 * {i18n}         : https://code.google.com/p/jquery-i18n-properties/
 *
 * THIS CODE LICENSE: The MIT License (MIT)

 Copyright (c) 2003 <Kumararaja: sucom.kumar@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 * ===========================================================================
 */

/* Avoid 'console' errors in browsers that lack a console*/
(function() {
  var method;
  var noop = function(){};
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});
  while (length--) {
    method = methods[length];
    //Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

/*Flag for URL Hash Routing*/
var isSpaHashRouteOn=false;

/* SPA begins */
(function() {

  /* Establish the win object, `window` in the browser */
  var win = this;
  //var doc = win.document; //Unused
  //var loc = win.document.location;

  /* Create a safe reference to the spa object for use below. */
  var spa = function (obj) {
    if (obj instanceof spa) { return obj; }
    if (!(this instanceof spa)) { return new spa(obj); }
  };

  /* Expose spa to window */
  win.spa = spa;

  /* Current version. */
  spa.VERSION = '1.0.0';

  /* isIE or isNonIE */
  var isById = (document.getElementById)
    , isByName = (document.all);
  spa.isIE = (isByName) ? true : false;
  spa.isNonIE = (isById && !isByName) ? true : false;

  /*No Operation: a dummy function*/
  spa.noop = function(){};

  spa.debug = false;
  spa.debugger = {
      on:function(){ spa.debug = true; }
    , off:function(){ spa.debug = false; }
    , toggle:function() { spa.debug = !spa.debug; }
  };
  /*Internal console out*/
  spa.cOut = function(consoleType, o){
    if (spa.debug && console[consoleType]) console[consoleType](o);
  };
  spa['console'] = {
      'clear'         : function(){ console['clear'](); }
    , 'assert'        : function(o){ spa.cOut('assert', o); }
    , 'count'         : function(o){ spa.cOut('count', o); }
    , 'debug'         : function(o){ spa.cOut('debug', o); }
    , 'dir'           : function(o){ spa.cOut('dir', o); }
    , 'dirxml'        : function(o){ spa.cOut('dirxml', o); }
    , 'error'         : function(o){ spa.cOut('error', o); }
    , 'exception'     : function(o){ spa.cOut('exception', o); }
    , 'group'         : function(o){ spa.cOut('group', o); }
    , 'groupCollapsed': function(o){ spa.cOut('groupCollapsed', o); }
    , 'groupEnd'      : function(o){ spa.cOut('groupEnd', o); }
    , 'info'          : function(o){ spa.cOut('info', o); }
    , 'log'           : function(o){ spa.cOut('log', o); }
    , 'markTimeline'  : function(o){ spa.cOut('markTimeline', o); }
    , 'profile'       : function(o){ spa.cOut('profile', o); }
    , 'profileEnd'    : function(o){ spa.cOut('profileEnd', o); }
    , 'table'         : function(o){ spa.cOut('table', o); }
    , 'time'          : function(o){ spa.cOut('time', o); }
    , 'timeEnd'       : function(o){ spa.cOut('timeEnd', o); }
    , 'timeStamp'     : function(o){ spa.cOut('timeStamp', o); }
    , 'trace'         : function(o){ spa.cOut('trace', o); }
    , 'warn'          : function(o){ spa.cOut('warn', o); }
  };

  spa._initWindowOnHashChange = function(){
    if ('onhashchange' in window) {
      isSpaHashRouteOn = true;
      spa.console.info("Registering HashRouting Listener");
      window.onhashchange = function (ocEvent) {
        /* ocEvent
         .oldURL : "http://dev.semantic-test.com/ui/home.html#user/changePassword"
         .newURL : "http://dev.semantic-test.com/ui/home.html#user/profile"
         .timeStamp : 1443191735330
         .type:"hashchange"
         */
        if (window.location.hash) { spa.route(window.location.hash); }
      };
    }
  };
  spa._stopWindowOnHashChange = function(){
    window.onhashchange = undefined;
  };

  /* ********************************************************* */
  /*NEW String Methods trim, normalize, beginsWith, endsWith
   var str                    = " I am a      string ";

   str.trim()                 = "I am a      string";
   str.isBlank()           = false;
   str.isNumber()             = false;
   str.normalize()            = "I am a string";
   str.beginsWith("I am")     = "true";
   str.beginsWith("i am")     = "false";
   str.beginsWith("i am","i") = "true"; // case insensitive
   str.endsWith("ing")        = "true";
   str.endsWith("iNg")        = "false";
   str.endsWith("InG","i")    = "true"; // case insensitive
   ("     ").ifBlank(str)     = " I am a      string ";
   ("     ").ifBlank()        = "";
   (str).ifBlank()            = "I am a      string";
   */
  if (!(String).trim) {
    String.prototype.trim = function (tStr) {
      tStr = (tStr || "\\s+");
      return (this.replace(new RegExp(("^" + tStr + "|" + tStr + "$"), "g"), ""))
    };
  }

  if (!(String).trimLeft) {
    String.prototype.trimLeft = function (tStr) {
      return (this.replace(new RegExp("^" + (tStr || "\\s+"), "g"), ""));
    };
  }

  if (!(String).trimRight) {
    String.prototype.trimRight = function (tStr) {
      return (this.replace(new RegExp((tStr || "\\s+") + "$", "g"), ""));
    };
  }

  if (!(String).isBlank) {
    String.prototype.isBlank = function () {
      return (this.trim() == "");
    };
  }

  if (!(String).ifBlank) {
    String.prototype.ifBlank = function (forNullStr) {
      forNullStr = forNullStr || "";
      return (this.isBlank() ? (("" + forNullStr).trim()) : (this.trim()));
    };
  }

  if (!(String).isNumber) {
    String.prototype.isNumber = function () {
      return (((("" + this).replace(/[0-9.]/g, "")).trim()).length == 0);
    };
  }

  if (!(String).normalizeStr) {
    String.prototype.normalizeStr = function () {
      return (this).trim().replace(/\s+/g, ' ');
    };
  }

  if (!(String).beginsWith) {
    String.prototype.beginsWith = function (str, i) {
      i = (i) ? 'i' : '';
      var re = new RegExp('^' + str, i);
      return ((this).normalizeStr().match(re)) ? true : false;
    };
  }

  if (!(String).endsWith) {
    String.prototype.endsWith = function (str, i) {
      i = (i) ? 'gi' : 'g';
      var re = new RegExp(str + '$', i);
      return ((this).normalizeStr().match(re)) ? true : false;
    };
  }

  if (!(String).contains) {
    String.prototype.contains = function (str, i) {
      i = (i) ? 'gi' : 'g';
      var re = new RegExp('' + str, i);
      return ((re).test(this));
    };
  }

  if (!(String).equals) {
    String.prototype.equals = function (arg) {
      return (this == arg);
    };
  }

  if (!(String).equalsIgnoreCase) {
    String.prototype.equalsIgnoreCase = function (arg) {
      return ((String(this.toLowerCase()) == (String(arg)).toLowerCase()));
    };
  }

  if (!(String).toProperCase) {
    String.prototype.toProperCase = function (normalize) {
      return ( (((typeof normalize == "undefined") ||  normalize)? ((this).normalizeStr()) : (this)).toLowerCase().replace(/^(.)|\s(.)/g, function ($1) {
        return $1.toUpperCase();
      }));
    };
  }

  spa.toJSON = function (str) {
    var thisStr;
    if (_.isString(str)) {
      thisStr = str.trim();
      if (thisStr.contains(":") && !thisStr.contains(",") && thisStr.contains(";")) {
        thisStr = thisStr.replace(/\;/g,',');
      }
      if (!(thisStr.beginsWith("{") || thisStr.beginsWith("\\["))) {
        if (thisStr.contains(":")) {
          thisStr = "{"+thisStr+"}"
        } else if (thisStr.contains("=")) {
          thisStr = "{"+thisStr.replace(/=/g,':')+"}";
        } else {
          thisStr = "["+thisStr+"]";
        }
      } else if (thisStr.beginsWith("{") && !thisStr.contains(":") && thisStr.contains("=")) {
        thisStr = ""+thisStr.replace(/=/g,':')+"";
      }
    }
    return (!_.isString(str) && _.isObject(str)) ? str : ( spa.isBlank(str) ? null : (eval("(" + thisStr + ")")) );
  };
  if (!(String).toJSON) {
    String.prototype.toJSON = function () {
      return spa.toJSON(this);
    };
  }

  if (!(String).toBoolean) {
    String.prototype.toBoolean = function () {
      var retValue = true;
      switch (("" + this).trim().toLowerCase()) {
        case          "":
        case         "0":
        case        "-0":
        case       "nan":
        case      "null":
        case     "false":
        case "undefined":
          retValue = false;
          break;
      }

      if (retValue) retValue = (!("" + this).trim().beginsWith("-"));
      return ( retValue );
    };
  }

  if (!(Boolean).toValue) {
    Boolean.prototype.toValue = function (tValue, fValue) {
      if (typeof tValue == "undefined") tValue = true;
      if (typeof fValue == "undefined") fValue = false;
      return ((this.valueOf()) ? (tValue) : (fValue));
    };
  }

  if (!(Boolean).toHtml) {
    Boolean.prototype.toHtml = function (tElId, fElId) {
      return $((this.valueOf()) ? tElId : fElId).html();
    };
  }

  /*
   * String.pad(length: Integer, [padString: String = " "], [type: Integer = 0]): String
   * Returns: the string with a padString padded on the left, right or both sides.
   * length: amount of characters that the string must have
   * padString: string that will be concatenated
   * type: specifies the side where the concatenation will happen, where: 0 = left, 1 = right and 2 = both sides
   */
  if (!(String).pad) {
    String.prototype.pad = function (l, s, t) {
      for (var ps = "", i = 0; i < l; i++) {
        ps += s;
      }
      return (((t === 0 || t === 2) ? ps : "") + this + ((t === 1 || t === 2) ? ps : ""));
    };
  }

  spa.lastSplitResult = [];
  spa.getOnSplit = function (str, delimiter, pickIndex) {
    spa.lastSplitResult = str.split(delimiter);
    return (spa.getOnLastSplit(pickIndex));
  };
  spa.getOnLastSplit = function (pickIndex) {
    return ((pickIndex < 0) ? (_.last(spa.lastSplitResult)) : (spa.lastSplitResult[pickIndex]));
  };

  /* isBlank / isEmpty */
  spa.isBlank = spa.isEmpty = function (src) {
    var retValue = true;
    if (src) {
      switch (true) {
        case (_.isString(src)):
          retValue = ((src).trim().length == 0);
          break;
        case (_.isArray(src)) :
        case (_.isObject(src)):
          retValue = _.isEmpty(src);
          break;
      }
    }
    return retValue;
  };

  spa.isNumber = function (str) {
    return (((("" + str).replace(/[0-9.]/g, "")).trim()).length == 0);
  };

  spa.toBoolean = function (str) {
    var retValue = true;
    switch (("" + str).trim().toLowerCase()) {
      case          "":
      case         "0":
      case        "-0":
      case       "nan":
      case      "null":
      case     "false":
      case "undefined":
        retValue = false;
        break;
    }
    return ( retValue );
  };

  spa.toInt = function (str) {
    str = ("" + str).replace(/[^+-0123456789.]/g, "");
    str = spa.isBlank(str) ? "0" : ((str.indexOf(".") >= 0) ? str.substring(0, str.indexOf(".")) : str);
    return (parseInt(str * 1, 10));
  };

  spa.toFloat = function (str) {
    str = ("" + str).replace(/[^+-0123456789.]/g, "");
    str = spa.isBlank(str) ? "0" : str;
    return (parseFloat(str * (1.0)));
  };

  /*Tobe Removed: replaced with toStr*/
  //spa.toString = function (obj) {
  //  spa.console.warn("spa.toString is deprecated. use spa.toStr instead.");
  //  var retValue = "" + obj;
  //  if (_.isObject(obj)) {
  //    retValue = JSON.stringify(obj);
  //  }
  //  return (retValue);
  //};

  spa.toStr = function (obj) {
    var retValue = "" + obj;
    if (_.isObject(obj)) {
      retValue = JSON.stringify(obj);
    }
    return (retValue);
  };

  spa.dotToX = function (dottedName, X) {
    return ((dottedName).replace(/\./g, X));
  };
  spa.dotToCamelCase = function (dottedName) {
    var newName = (dottedName).replace(/\./g, " ").toProperCase().replace(/ /g, "");
    return (newName[0].toLowerCase() + newName.substring(1));
  };
  spa.dotToTitleCase = function (dottedName) {
    return ((dottedName).replace(/\./g, " ").toProperCase().replace(/ /g, ""));
  };

  spa.ifBlank = spa.ifEmpty = spa.ifNull = function (src, replaceWithIfBlank) {
    replaceWithIfBlank = ("" + (replaceWithIfBlank || "")).trim();
    return ( spa.isBlank(src) ? (replaceWithIfBlank) : (("" + src).trim()) );
  };

  /* now: Browser's current timestamp */
  spa.now = function () {
    return ("" + ((new Date()).getTime()));
  };

  /* year: Browser's current year +/- N */
  spa.year = function (n) {
    n = n || 0;
    return ((new Date()).getFullYear() + (spa.toInt(n)));
  };

  /*String to Array; spa.range("N1..N2:STEP")
   * y-N..y+N : y=CurrentYear*/
  spa.range = function (rangeSpec) {
    var rSpec = (rangeSpec.toUpperCase()).split("..")
      , rangeB = "" + rSpec[0]
      , rangeE = "" + rSpec[1]
      , rStep = "1";
    if (rangeE.indexOf(":") > 0) {
      rangeE = "" + (rSpec[1].split(":"))[0];
      rStep = "" + (rSpec[1].split(":"))[1];
    }
    if (rangeB.indexOf("Y") >= 0) {
      rangeB = spa.year((rangeB.split(/[^0-9+-]/))[1]);
    }
    if (rangeE.indexOf("Y") >= 0) {
      rangeE = spa.year((rangeE.split(/[^0-9+-]/))[1]);
    }
    var rB = spa.toInt(rangeB)
      , rE = spa.toInt(rangeE)
      , rS = spa.toInt(rStep);
    return (rangeB > rangeE) ? ((_.range(rE, (rB) + 1, rS)).reverse()) : (_.range(rB, (rE) + 1, rS));
  };

  spa.checkAndPreventKey = function (e, disableKeys) {
    if (!disableKeys) disableKeys = "";
    var withShiftKey = (disableKeys.indexOf("+shift") >= 0)
      , keyCode  = ""+e.keyCode
      , retValue = (( ((disableKeys.pad(1, ',', 2)).indexOf(keyCode.pad(1, ',', 2)) >= 0) && (withShiftKey ? ((e.shiftKey) ? true : false) : ((!e.shiftKey)? true : false))));
    if (retValue) {
      e.preventDefault();
      spa.console.info("Key [" + keyCode + (withShiftKey ? "+Shift" : "") + "] has been disabled in this element.");
    }
    return retValue;
  };

  spa._trackAndControlKey = function (e) {
    var keyElement = e.currentTarget
      , disableKeys = (""+$(keyElement).data("disableKeys")).toLowerCase();
      //, keyCode = ""+e.keyCode, withShiftKey = (disableKeys.indexOf("+shift") >= 0);
    spa.checkAndPreventKey(e, disableKeys);

    var changeFocusNext = (!spa.isBlank(("" + $(keyElement).data("focusNext")).replace(/undefined/, "").toLowerCase()));
    var changeFocusPrev = (!spa.isBlank(("" + $(keyElement).data("focusBack")).replace(/undefined/, "").toLowerCase()));
    if (changeFocusNext && (spa.checkAndPreventKey(e, "9"))) {
      $($(keyElement).data("focusNext")).get(0).focus();
    }
    if (changeFocusPrev && (spa.checkAndPreventKey(e, "9,+shift"))) {
      $($(keyElement).data("focusBack")).get(0).focus();
    }
  };

  spa.initKeyTracking = function () {
    var elementsToTrackKeys = (arguments.length) ? arguments[0] : "[data-disable-keys],[data-focus-next],[data-focus-back]";
    spa.console.info("Finding Key-Tracking for element(s): " + elementsToTrackKeys);
    $(elementsToTrackKeys).each(function (index, element) {
      $(element).keydown(spa._trackAndControlKey);
      spa.console.info("spa is tracking keys on element:");
      spa.console.info(element);
    });
  };

  spa.getDocObj = function (objId) {
    var jqSelector = ((typeof objId) == "object") ? objId : ((objId.beginsWith("#") ? "" : "#") + objId);
    return ( $(jqSelector).get(0) );
  };
  spa.getDocObjs = function (objId) {
    var jqSelector = (objId.beginsWith("#") ? "" : "#") + objId;
    return ( $(jqSelector).get() );
  };

  /* setFocus: */
  spa.setFocus = function (objId, isSelect) {
    var oFocus = spa.getDocObj(objId);
    if (oFocus) {
      oFocus.focus();
      if (isSelect) oFocus.select();
    }
  };

  /* Check DOM has requested element */
  spa.isElementExist = function (elSelector) {
    return (!$.isEmptyObject($(elSelector).get()));
  };

  spa.swapObjClass = function (objIDs, removeClass, addClass) {
    $(objIDs).removeClass(removeClass);
    $(objIDs).addClass(addClass);
  };

  /* docObjValue: returns oldValue; sets newValue if provided */
  spa.docObjValue = function (objId, newValue) {
    var reqObj = spa.getDocObj(objId);
    var retValue = "";
    if (reqObj) {
      retValue = reqObj.value;
      if (arguments.length === 2) {
        reqObj.value = newValue;
      }
    }
    return (retValue);
  };

  /* <select> tag related */
  /* get options Selected Index : Get / Set by Index*/
  spa.optionSelectedIndex = function (objId, newSelIdx) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      retValue = oLstObj.selectedIndex;
      if (arguments.length === 2) {
        oLstObj.selectedIndex = newSelIdx;
      }
    }
    return (retValue);
  };
  /* get options Index : for value */
  spa.optionIndexOfValue = function (objId, optValue) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        if (("" + optValue).equalsIgnoreCase(oLstObj.options[i].value)) {
          retValue = i;
          break;
        }
      }
    }
    return (retValue);
  };
  /* get options Index : for Text */
  spa.optionIndexOfText = function (objId, optText) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        if (optText.equalsIgnoreCase(oLstObj.options[i].text)) {
          retValue = i;
          break;
        }
      }
    }
    return (retValue);
  };
  /* get options Index : for value begins with */
  spa.optionIndexOfValueBeginsWith = function (objId, optValue) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        if ((oLstObj.options[i].value).beginsWith(optValue, "i")) {
          retValue = i;
          break;
        }
      }
    }
    return (retValue);
  };

  /*Get Value / Text for selected Index*/
  spa.optionsSelectedValues = function (objId, delimiter) {
    objId = (objId.beginsWith("#") ? "" : "#") + objId;
    delimiter = delimiter || ",";
    return ($.map(($(objId + " option:selected")), function (option) {
      return (option.value);
    }).join(delimiter));
  };
  spa.optionsSelectedTexts = function (objId, delimiter) {
    objId = (objId.beginsWith("#") ? "" : "#") + objId;
    delimiter = delimiter || ",";
    return ($.map(($(objId + " option:selected")), function (option) {
      return (option.text);
    }).join(delimiter));
  };

  /*Get Value / Text for given Index*/
  spa.optionValueOfIndex = function (objId, sIndex) {
    var retValue = "";
    var oLstObj = spa.getDocObj(objId);
    if ((oLstObj) && (sIndex >= 0) && (sIndex < oLstObj.length)) {
      retValue = oLstObj.options[sIndex].value;
    }
    return (retValue);
  };
  spa.optionTextOfIndex = function (objId, sIndex) {
    var retValue = "";
    var oLstObj = spa.getDocObj(objId);
    if ((oLstObj) && (sIndex >= 0) && (sIndex < oLstObj.length)) {
      retValue = oLstObj.options[sIndex].text;
    }
    return (retValue);
  };

  /*Set Selected options for Value*/
  spa.selectOptionForValue = function (objId, selValue) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      retValue = spa.optionIndexOfValue(objId, selValue);
      oLstObj.selectedIndex = retValue;
    }
    return (retValue);
  };
  spa.selectOptionForValueBeginsWith = function (objId, selValue) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      retValue = spa.optionIndexOfValueBeginsWith(objId, selValue);
      oLstObj.selectedIndex = retValue;
    }
    return (retValue);
  };
  spa.selectOptionsForValues = function (objId, selValues, valDelimitChar) {
    valDelimitChar = valDelimitChar || ",";
    selValues = (valDelimitChar + selValues + valDelimitChar).toLowerCase();
    var oLstObj = spa.getDocObj(objId), optValue;
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        optValue = (valDelimitChar + (oLstObj.options[i].value) + valDelimitChar).toLowerCase();
        oLstObj.options[i].selected = (selValues.indexOf(optValue) >= 0);
      }
    }
  };
  spa.selectOptionForText = function (objId, selText) {
    var retValue = -1;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      retValue = spa.optionIndexOfText(objId, selText);
      oLstObj.selectedIndex = retValue;
    }
    return (retValue);
  };
  spa.selectOptionsAll = function (objId) {
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        oLstObj.options[i].selected = true;
      }
    }
  };
  spa.selectOptionsNone = function (objId) {
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      for (var i = 0; i < oLstObj.length; i++) {
        oLstObj.options[i].selected = false;
      }
    }
  };
  /*Add / Remove Options*/
  spa.optionsReduceToLength = function (objID, nLen) {
    nLen = nLen || 0;
    var oSelOptList = spa.getDocObj(objID);
    if (oSelOptList) {
      spa.selectOptionsNone(objID);
      oSelOptList.length = nLen;
    }
  };
  spa.optionsRemoveAll = function (objID) {
    spa.optionsReduceToLength(objID, 0);
  };
  spa.optionRemoveForIndex = function (objId, optIndex) {
    objId = (objId.beginsWith("#") ? "" : "#") + objId;
    var oLstObj = spa.getDocObj(objId);
    if (oLstObj) {
      if (("" + optIndex).equalsIgnoreCase("first")) optIndex = 0;
      if (("" + optIndex).equalsIgnoreCase("last")) optIndex = (oLstObj.length - 1);
      oLstObj.remove(optIndex);
    }
  };
  spa.optionRemoveForValue = function (objId, optValue) {
    spa.optionRemoveForIndex(objId, spa.optionIndexOfValue(objId, optValue));
  };
  spa.optionRemoveForText = function (objId, optText) {
    spa.optionRemoveForIndex(objId, spa.optionIndexOfText(objId, optText));
  };
  spa.optionRemoveForValueBeginsWith = function (objId, optValueBeginsWith) {
    spa.optionRemoveForIndex(objId, spa.optionIndexOfValueBeginsWith(objId, optValueBeginsWith));
  };

  spa.optionAppend = function (objID, optValue, optText, appendAtIndex) {
    var retValue = -1;
    var oSelOptList = spa.getDocObj(objID);
    if (oSelOptList) {
      if (typeof appendAtIndex == "undefined") {
        var nOptPos = oSelOptList.length;
        oSelOptList.length = nOptPos + 1;
        oSelOptList.options[nOptPos].value = optValue;
        oSelOptList.options[nOptPos].text = optText;
        retValue = nOptPos;
      }
      else {
        $(oSelOptList).find("option").eq(appendAtIndex).before('<option value="' + optValue + '">' + optText + '</option>');
        retValue = appendAtIndex;
      }
    }
    return (retValue);
  };

  /*
   * Usage: spa.optionsLoad(elSelector, list, beginsAt, sortBy)
   * elSelector = "#SelectElementID"; //jQuery selector by ID
   * list = [ 0, 1, ... ]; //Number Array
   * list = ["optValue0", "optValue1", ... ]; //String Array
   * list = {"optValue0":"optText0", "optValue1":"optText1", "optValue2":"optText2", ... }; //Object with Key Value Pair
   * beginsAt = -1 => Add to existing list; 0=> reset to 0; n=> reset to n; before Load
   * sortBy = 0=> NO Sort; 1=> SortBy Key; 2=> SortBy Text;
   */
  spa.optionsLoad = function (elSelector, list, beginsAt, sortBy) {
    var sortByAttr = ["", "key", "value"];
    beginsAt = beginsAt || 0;
    sortBy = sortBy || 0;
    if ((_.isString(list)) && (list.indexOf("..") > 0)) {
      list = spa.range(list);
    }
    if (beginsAt >= 0) {
      spa.optionsReduceToLength(elSelector, beginsAt);
    }
    if (_.isArray(list)) {
      _.each(list, function (opt) {
        spa.optionAppend(elSelector, opt, opt);
      });
    }
    else {
      if (sortBy > 0) {
        var listArray = [];
        for (var key in list) {
          listArray.push({key: key, value: list[key]});
        }
        var listSorted = _.sortBy(listArray, sortByAttr[sortBy]);
        _.each(listSorted, function (opt) {
          spa.optionAppend(elSelector, opt.key, opt.value);
        });
      }
      else {
        _.each(list, function (value, key) {
          spa.optionAppend(elSelector, key, value);
        });
      }
    }
  };

  /* Radio & Checkbox related */
  /* checkedState: returns old Checked State {true|false}; sets newState {true | false} if provided */
  spa.checkedState = function (objId, newState) {
    var retValue = false
      , objChk = spa.getDocObj(objId);
    if (objChk) {
      retValue = objChk.checked;
      if (arguments.length === 2) {
        objChk.checked = newState;
      }
    }
    return (retValue);
  };
  spa.isChecked = function (formId, eName) {
    return (($("input[name=" + eName + "]:checked", formId).length) > 0);
  };
  spa.radioSelectedValue = function (formId, rName) {
    var retValue = ($("input[name=" + rName + "]:checked", formId).val());
    return (retValue ? retValue : "");
  };
  spa.radioClearSelection = function (formId, rName) {
    ($("input[name=" + rName + "]:checked", formId).attr("checked", false));
  };
  spa.radioSelectForValue = function (formId, rName, sValue) {
    $("input[name=" + rName + "]:radio", formId).each(function(el) {
      el.checked = ((el.value).equalsIgnoreCase(sValue));
    });
  };
  spa.checkboxCheckedValues = function (formId, cbName, delimiter) {
    delimiter = delimiter || ",";
    return ($("input[name=" + cbName + "]:checked", formId).map(function () {
      return this.value;
    }).get().join(delimiter));
  };

  spa.sleep = function (sec) {
    var dt = new Date();
    dt.setTime(dt.getTime() + (sec * 1000));
    while (new Date().getTime() < dt.getTime());
  };

  /*Tobe removed; use _.filter*/
  spa.filterJSON = function (jsonData, xFilter) {
    return $(jsonData).filter(function (index, item) {
      for (var i in xFilter) {
        if (!item[i].toString().match(xFilter[i])) return null;
      }
      return item;
    });
  };

  /* randomPassword: Random Password for requested length */
  spa.randomPassword = function (passLen) {
    var chars = "9a8b77C8D9E8F7G6H5I4J3c6d5e4f32L3M4N5P6Qg2h3i4j5kV6W5X4Y3Z26m7n8p9q8r7s6t5u4v3w2x3y4z5A6BK7R8S9T8U7";
    var pass = "";
    for (var x = 0; x < passLen; x++) {
      var i = Math.floor(Math.random() * (chars).length);
      pass += chars.charAt(i);
    }
    return pass;
  };

  /* rand: Random number between min - max */
  spa.rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  spa.htmlEncode = function (value) {
    return $('<div/>').text(value).html();
  };
  spa.htmlDecode = function (value) {
    return $('<div/>').html(value).text();
  };

  spa.parseKeyStr = function (keyName, changeToLowerCase) {
    return ((changeToLowerCase ? keyName.toLowerCase() : keyName).replace(/[^_0-9A-Za-z]/g, ""));
  };
  spa.setObjProperty = function (obj, keyNameStr, propValue, keyToLowerCase) {
    keyNameStr = ('' + keyNameStr);
    keyToLowerCase = keyToLowerCase || false;
    var xObj = obj, oKey;
    var oKeys = keyNameStr.split(/(?=[A-Z])/);
    /*Default: camelCase | TitleCase*/
    var keyIdentifier = $.trim(keyNameStr.replace(/[0-9A-Za-z]/g, ""));
    if (keyIdentifier && (keyIdentifier != "")) {
      oKeys = keyNameStr.split(keyIdentifier[0]);
    }
    while (oKeys.length > 1) {
      oKey = spa.parseKeyStr(oKeys.shift(), keyToLowerCase);
      if ($.trim(oKey) != "") {
        if (typeof xObj[oKey] == "undefined") xObj[oKey] = {};
        xObj = xObj[oKey];
      }
    }
    oKey = spa.parseKeyStr(oKeys.shift(), keyToLowerCase);
    xObj[oKey] = propValue;

    return obj;
  };

  spa.getElValue = function (el) {
    el = $(el).get(0);
    var elValue, unchkvalue;
    switch ((el.tagName).toUpperCase()) {
      case "INPUT":
        switch ((el.type).toLowerCase()) {
          case "checkbox":
            unchkvalue = $(el).data("unchecked");
            elValue = el.checked ? (el.value) : ((typeof unchkvalue === 'undefined') ? '' : unchkvalue);
            break;
          case "radio":
            elValue = el.checked ? (el.value) : "";
            break;
          default:
            elValue = $(el).val();
            break;
        }
        break;

      case "SELECT":
        elValue = $.map(($(el).find("option:selected")), function (option) {
          return (option.value);
        }).join(",");
        break;

      case "TEXTAREA":
        elValue = $(el).val();
        break;

      default:
        elValue = $(el).html();
        break;
    }
    return elValue;
  };

  spa.serializeDisabled = function (formSelector) {
    var retValue = "";
    $(formSelector).find("[disabled][name]").each(function () {
      retValue += ((retValue) ? '&' : '') + $(this).attr('name') + '=' + spa.getElValue(this);
    });
    return retValue;
  };

  /*
   * spa.serializeForms(formSelector, includeDisabledElements)
   * @formSelector {string} jQuery form selector #Form1,#Form2...
   * @includeDisabledElements {boolean} true | false [default:false]
   * @returns {string} param1=value1&param2=value2...
   */
  spa.serializeForms = function (formSelector, includeDisabledElements) {
    var disabledElementsKeyValues, unchkvalue, retValue = $(formSelector).serialize();

    //include unchecked checkboxes
    $(formSelector).find("input:checkbox:enabled:not(:checked)[name]").each(function () {
      unchkvalue = $(this).data("unchecked");
      retValue += ((retValue) ? '&' : '') + $(this).attr('name') + '=' + ((typeof unchkvalue === 'undefined') ? '' : unchkvalue);
    });

    if (includeDisabledElements) {
      disabledElementsKeyValues = spa.serializeDisabled(formSelector);
      retValue += ((retValue && disabledElementsKeyValues) ? '&' : '') + disabledElementsKeyValues;
    }
    return retValue;
  };

  spa.queryStringToJson = function (qStr) {
    var retValue = {}, qStringWithParams = (qStr || location.search), qIndex = ('' + qStringWithParams).indexOf('?'), ampIndex = ('' + qStringWithParams).indexOf('&');
    if (qStringWithParams && (qStringWithParams.length > 0) && (qIndex >= 0) && ((qIndex == 0) || (ampIndex > qIndex))) {
      qStringWithParams = qStringWithParams.substring(qIndex + 1);
    }
    _.each((qStringWithParams.split('&')), function (nvp) {
      nvp = nvp.split('=');
      if (nvp[0]) {
        if (_.has(retValue, nvp[0])) {
          if (!_.isArray(retValue[nvp[0]])) {
            retValue[nvp[0]] = [retValue[nvp[0]]];
          }
          retValue[nvp[0]].push(decodeURIComponent(nvp[1] || ''));
        } else {
          retValue[nvp[0]] = decodeURIComponent(nvp[1] || '');
        }
      }
    });
    return retValue;
  };

  $.fn.serializeUncheckedCheckboxes = function (appendTo) {
    var $chkBox, unchkvalue, keyName, keyValue
      , toJSON = (typeof appendTo == "object")
      , retObj = (toJSON) ? appendTo : {}
      , retStr = (toJSON && !appendTo) ? ('') : (appendTo);

    $(this).find("input:checkbox:enabled:not(:checked)[name]").each(function (index, el) {
      $chkBox = $(el);
      keyName = $chkBox.attr('name');
      unchkvalue = $chkBox.data("unchecked");
      keyValue = ((typeof unchkvalue === 'undefined') ? '' : unchkvalue);
      if (toJSON) {
        if (_.has(retObj, keyName)) {
          if (!_.isArray(retObj[keyName])) {
            retObj[keyName] = [retObj[keyName]];
          }
          retObj[keyName].push(keyValue);
        } else {
          retObj[keyName] = keyValue;
        }
      }
      else {
        retStr += ((retStr) ? '&' : '') + keyName + '=' + keyValue;
      }
    });
    return ((toJSON) ? retObj : retStr);
  };
  spa.serializeUncheckedCheckboxes = function (formSelector, appendTo) {
    return $(formSelector).serializeUncheckedCheckboxes(appendTo);
  };

  /* Serialize form elements to Json Object
   * $("#formId").serializeFormToJson(obj, keyNameToLowerCase);
   * keyNameToLowerCase: converts form element names to its correponding lowercase obj's attribute
   * obj: Optional; creates/returns new JSON if not provided; overwrite & append attributes on the given obj if provided
   * */
  $.fn.serializeFormToJSON = $.fn.serializeFormToObject = function (obj, keyNameToLowerCase, strPrefixToIgnore) {
    var a = this.serializeArray()
      , o = (typeof obj === "object") ? obj : {}
      , c = (typeof obj === "boolean") ? obj : (keyNameToLowerCase || false)
      , kParse = $(this).data("serializeIgnorePrefix")
      , oKeyName, oKeyValue;
    if (strPrefixToIgnore) kParse = strPrefixToIgnore;
    $.each(a, function () {
      oKeyName = (kParse) ? (this.name).replace(kParse, "") : this.name;
      o = spa.setObjProperty(o, oKeyName, this.value, c);
    });

    //include unchecked checkboxes
    $(this).find("input:checkbox:enabled:not(:checked)").each(function () {
      oKeyName = $(this).attr('name');
      if (oKeyName) {
        oKeyValue = $(this).data("unchecked");

        if (kParse) {
          oKeyName = (oKeyName).replace(kParse, "");
        }
        oKeyValue = '' + ((typeof oKeyValue == 'undefined') ? '' : oKeyValue);

        o = spa.setObjProperty(o, oKeyName, oKeyValue, c);
      }
    });

    return o;
  };

  $.fn.serializeFormToSimpleJSON = $.fn.serializeFormToSimpleObject = function (obj, includeDisabledElements) {
    var a = this.serializeArray()
      , o = (typeof obj === "object") ? obj : {}
      , c = (typeof obj === "boolean") ? obj : (includeDisabledElements || false)
      , oKeyStr, oGrpStr
      , oKeyName, oKeyValue;

    $.each(a, function () {
      o[this.name] = this.value;
    });
    if (c) {
      $(this).find("[disabled][name]").each(function () {
        o[this.name] = spa.getElValue(this);
      });
    }
    //include unchecked checkboxes
    $(this).find("input:checkbox:enabled:not(:checked)[name]").each(function () {
      oKeyName = $(this).attr('name');
      oKeyValue = $(this).data("unchecked");
      oKeyValue = '' + ((typeof oKeyValue == 'undefined') ? '' : oKeyValue);
      o[oKeyName] = oKeyValue;
    });

    $(this).find("[data-to-json-group][name]").each(function () {
      oKeyStr = this.name;
      oGrpStr = $(this).data("toJsonGroup");
      if (oGrpStr) {
        if (!o[oGrpStr]) o[oGrpStr] = {};
        o[oGrpStr][oKeyStr] = spa.getElValue(this);
      }
    });
    return o;
  };
  spa.serializeFormToSimpleJSON = spa.serializeFormToSimpleObject = function (formSelector, obj, includeDisabledElements) {
    return $(formSelector).serializeFormToSimpleJSON(obj, includeDisabledElements);
  };

  spa.serializeFormToJSON = spa.serializeFormToObject = function (formSelector, obj, keyNameToLowerCase, strPrefixToIgnore) {
    return $(formSelector).serializeFormToJSON(obj, keyNameToLowerCase, strPrefixToIgnore);
  };

  /* find(jsonObject, 'key1.key2.key3[0].key4'); */
  spa.find = spa.locate = function (obj, path) {
    var tObj = obj, retValue;
    if (typeof eval("tObj." + path) != "undefined") retValue = eval("tObj." + path);
    return retValue;
  };

  spa.findSafe = spa.locateSafe = spa.valueOfKeyPath = function (obj, pathStr, def) {
    for (var i = 0, path = pathStr.replace(/(\[)|(\]\[)|(\])|(\\)|(\/)|(\,)/g, '.').trimRight('\\.').split('.'), len = path.length; i < len; i++) {
      if (!obj || typeof obj == "undefined") return def;
      obj = obj[path[i]];
    }
    if (typeof obj == "undefined") return def;
    return obj;
  };

  spa.has = spa.hasKey = function (obj, path) {
    var tObj = obj;
    return (typeof eval("tObj." + path) != "undefined");
  };

  /*Get All keys like X-Path with dot and [] notations */
  spa.keysDotted = function (a) {
    a = a || {};
    var list = [], xConnectorB, xConnectorE, curKey;
    (function (o, r) {
      r = r || '';
      if (typeof o != 'object') {
        return true;
      }
      for (var c in o) {
        curKey = r.substring(1);
        xConnectorB = (spa.isNumber(c)) ? "[" : ".";
        xConnectorE = (((curKey) && (xConnectorB == "[")) ? "]" : "");
        if (arguments.callee(o[c], r + xConnectorB + c + xConnectorE)) {
          list.push((curKey) + (((curKey) ? xConnectorB : "")) + c + (xConnectorE));
        }
      }
      return false;
    })(a);
    return list;
  };

  spa.keysCamelCase = function (a) {
    return (_.map(spa.keysDotted(a), function (name) {
      var newName = (name).replace(/\./g, " ").toProperCase().replace(/ /g, "");
      return (newName[0].toLowerCase() + newName.substring(1));
    }));
  };

  spa.keysTitleCase = function (a) {
    return (_.map(spa.keysDotted(a), function (name) {
      return ((name).replace(/\./g, " ").toProperCase().replace(/ /g, ""));
    }));
  };

  spa.keys_ = function (a) {
    return (_.map(spa.keysDotted(a), function (name) {
      return ((name).replace(/\./g, "_"));
    }));
  };

  $.cachedScript = function (url, options) {
    /* allow user to set any option except for dataType, cache, and url */
    options = $.extend(options || {}, {
      dataType: "script",
      cache: true,
      url: url
    });
    spa.console.info("$.cachedScript('" + url + "')");
    /* Use $.ajax() since it is more flexible than $.getScript
     * Return the jqXHR object so we can chain callbacks
     */
    return $.ajax(options);
  };

  $.cachedStyle = function (styleId, url, options) {
    /* allow user to set any option except for dataType, cache, and url */
    options = $.extend(options || {}, {
      dataType: "text",
      cache: true,
      url: url,
      success: function (cssStyles) {
        $("head").append("<style id='" + (styleId) + "' type='text/css'>" + cssStyles + "<\/style>");
      }
    });
    spa.console.info("$.cachedScript('" + url + "')");
    /* Use $.ajax() since it is more flexible than $.getScript
     * Return the jqXHR object so we can chain callbacks
     */
    return $.ajax(options);
  };

  /* Add Script Tag */
  spa.addScript = function (scriptId, scriptSrc) {
    scriptId = scriptId.replace(/#/, "");
    spa.console.group("spaAddScript");
    if (!spa.isElementExist("#spaScriptsCotainer")) {
      spa.console.info("#spaScriptsCotainer NOT Found! Creating one...");
      $('body').append("<div id='spaScriptsCotainer' style='display:none' rel='Dynamic Scripts Container'></div>");
    }
    if (spa.isElementExist("#" + scriptId)) {
      spa.console.info("script [" + scriptId + "] already found in local.");
    }
    else {
      spa.console.info("script [" + scriptId + "] NOT found. Added script tag with src [" + scriptSrc + "]");
      $("#spaScriptsCotainer").append("<script id='" + (scriptId) + "' type='text/javascript' src='" + scriptSrc + "'><\/script>");
    }
    spa.console.groupEnd("spaAddScript");
  };

  /* Add Style Tag */
  spa.addStyle = function (styleId, styleSrc) {
    styleId = styleId.replace(/#/, "");
    spa.console.group("spaAddStyle");
    if (!spa.isElementExist("#spaStylesCotainer")) {
      spa.console.info("#spaStylesCotainer NOT Found! Creating one...");
      $('body').append("<div id='spaStylesCotainer' style='display:none' rel='Dynamic Styles Container'></div>");
    }
    if (spa.isElementExist("#" + styleId)) {
      spa.console.info("style [" + styleId + "] already found in local.");
    }
    else {
      spa.console.info("style [" + styleId + "] NOT found. Added link tag with href [" + styleSrc + "]");
      $("#spaStylesCotainer").append("<link id='" + (styleId) + "' rel='stylesheet' type='text/css' href='" + styleSrc + "'\/>");
    }
    spa.console.groupEnd("spaAddStyle");
  };

  /* Loading script */
  spa.loadScript = function (scriptId, scriptPath, useScriptTag, tAjaxRequests) {
    scriptId = scriptId.replace(/#/, "");
    useScriptTag = useScriptTag || false;
    tAjaxRequests = tAjaxRequests || [];
    spa.console.group("spaScriptsLoad");
    if (spa.isBlank(scriptPath)) {
      spa.console.error("script path [" + scriptPath + "] for [" + scriptId + "] NOT defined.");
    }
    else {
      if (useScriptTag) {
        spa.addScript(scriptId, scriptPath);
      }
      else { /* load script script-URL */
        tAjaxRequests.push(
          $.cachedScript(scriptPath).done(function (script, textStatus) {
            spa.console.info("Loaded script [" + scriptId + "] from [" + scriptPath + "]. STATUS: " + textStatus);
          })
        );
      }
    }
    spa.console.groupEnd("spaScriptsLoad");
    return (tAjaxRequests);
  };

  /* Loading style */
  spa.loadStyle = function (styleId, stylePath, useStyleTag, tAjaxRequests) {
    styleId = styleId.replace(/#/, "");
    useStyleTag = useStyleTag || false;
    tAjaxRequests = tAjaxRequests || [];
    spa.console.group("spaStylesLoad");
    if (spa.isBlank(stylePath)) {
      spa.console.error("style path [" + stylePath + "] for [" + styleId + "] NOT defined.");
    }
    else {
      if (useStyleTag) {
        spa.addStyle(styleId, stylePath);
      }
      else { /* load style style-URL */
        tAjaxRequests.push(
          $.cachedStyle(styleId, stylePath).done(function (style, textStatus) {
            spa.console.info("Loaded style [" + styleId + "] from [" + stylePath + "]. STATUS: " + textStatus);
          })
        );
      }
    }
    spa.console.groupEnd("spaStylesLoad");
    return (tAjaxRequests);
  };

  /* Add Template script to BODY */
  spa.addTemplateScript = function (tmplId, tmplBody, tmplType) {
    tmplId = tmplId.replace(/#/, "");
    if (!spa.isElementExist("#spaViewTemplateCotainer")) {
      spa.console.info("#spaViewTemplateCotainer NOT Found! Creating one...");
      $('body').append("<div id='spaViewTemplateCotainer' style='display:none' rel='Template Container'></div>");
    }
    spa.console.info("Adding <script id='" + (tmplId) + "' type='text/" + tmplType + "'>");
    $("#spaViewTemplateCotainer").append("<script id='" + (tmplId) + "' type='text/" + tmplType + "'>" + tmplBody + "<\/script>");
  };

  /* Load external template content as template script */
  spa.loadTemplate = function (tmplId, tmplPath, templateType, viewContainderId, tAjaxRequests, tmplReload) {
    tmplId = tmplId.replace(/#/, "");
    tmplPath = (tmplPath.ifBlank("inline")).trim();
    templateType = templateType || "x-template";
    viewContainderId = viewContainderId || "#DummyInlineTemplateContainer";
    tAjaxRequests = tAjaxRequests || [];
    spa.console.group("spaTemplateAjaxQue");
    if (!spa.isElementExist("#"+tmplId)) {
      spa.console.info("Template[" + tmplId + "] of [" + templateType + "] NOT found. Source [" + tmplPath + "]");
      if ((tmplPath.equalsIgnoreCase("inline") || tmplPath.beginsWith("#"))) { /* load from viewTargetContainer or local container ID given in tmplPath */
        var localTemplateSrcContainerId = tmplPath.equalsIgnoreCase("inline")? viewContainderId : tmplPath;
        var $localTemplateSrcContainer = $(localTemplateSrcContainerId);
        var inlineTemplateHTML = $localTemplateSrcContainer.html();
        if (spa.isBlank(inlineTemplateHTML)) {
          spa.console.error("Template[" + tmplId + "] of [" + templateType + "] NOT defined inline in ["+localTemplateSrcContainerId+"].");
        }
        else {
          spa.addTemplateScript(tmplId, inlineTemplateHTML, templateType);
          if (tmplPath.equalsIgnoreCase("inline")) $localTemplateSrcContainer.html("");
        }
      }
      else if (tmplPath.equalsIgnoreCase("none")) {
        spa.console.warn("Template[" + tmplId + "] of [" + templateType + "] defined as NONE. Ignoring template.");
      }
      else if (!tmplPath.equalsIgnoreCase("script")) { /* load from templdate-URL */
        var axTemplateRequest;
        if (tmplReload) {
          spa.console.warn(">>>>>>>>>> Making New Template Request");
          axTemplateRequest = $.ajax({
            url: tmplPath,
            cache: false,
            dataType: "html",
            success: function (template) {
              spa.addTemplateScript(tmplId, template, templateType);
              spa.console.info("Loaded Template[" + tmplId + "] of [" + templateType + "] from [" + tmplPath + "]");
            },
            error: function (jqXHR, textStatus, errorThrown) {
              spa.console.error("Failed Loading Template[" + tmplId + "] of [" + templateType + "] from [" + tmplPath + "]. [" + textStatus + ":" + errorThrown + "]");
            }
          });
        } else {
          axTemplateRequest = $.get(tmplPath, function (template) {
            spa.addTemplateScript(tmplId, template, templateType);
            spa.console.info("Loaded Template[" + tmplId + "] of [" + templateType + "] from [" + tmplPath + "]");
          });
        }
        tAjaxRequests.push(axTemplateRequest);
      } else {
        spa.console.error("Template[" + tmplId + "] of [" + templateType + "] NOT defined in <script>.");
      }
    }
    else {
      var $tmplId = $("#"+tmplId);
      if (tmplReload) {
        spa.console.warn("Reload Template[" + tmplId + "] of [" + templateType + "]");
        $tmplId.remove();
        tAjaxRequests = spa.loadTemplate(tmplId, tmplPath, templateType, viewContainderId, tAjaxRequests, tmplReload);
      } else if (spa.isBlank(($tmplId.html()))) {
        spa.console.warn("Template[" + tmplId + "] of [" + templateType + "] script found EMPTY!");
        var externalPath = "" + $tmplId.attr("path");
        if (!spa.isBlank((externalPath))) {
          templateType = ((($tmplId.attr("type")).ifBlank(templateType)).toLowerCase()).replace(/text\//gi, "");
          spa.console.info("prepare/remove to re-load Template[" + tmplId + "]  of [" + templateType + "] from external path: [" + externalPath + "]");
          $tmplId.remove();
          tAjaxRequests = spa.loadTemplate(tmplId, externalPath, templateType, viewContainderId, tAjaxRequests, tmplReload);
        }
      } else {
        spa.console.info("Template[" + tmplId + "]  of [" + templateType + "] already found in local.");
      }
    }
    spa.console.groupEnd("spaTemplateAjaxQue");

    return (tAjaxRequests);
  };

  spa.loadTemplatesCollection = function (templateCollectionId, dataTemplatesCollectionUrl) {
    templateCollectionId = (templateCollectionId.beginsWith("#") ? "" : "#") + templateCollectionId;
    var retValue = {};
    if (!spa.isElementExist(templateCollectionId)) {
      spa.console.info(templateCollectionId + " NOT Found! Creating one...");
      if (!spa.isElementExist("#spaViewTemplateCotainer")) {
        spa.console.info("#spaViewTemplateCotainer NOT Found! Creating one...");
        $('body').append("<div id='spaViewTemplateCotainer' style='display:none' rel='Template Container'></div>");
      }
      $("#spaViewTemplateCotainer").append("<div id='" + (templateCollectionId.substring(1)) + "' style='display:none' rel='Template Collection Container'></div>");

      /*$.ajaxSetup({async: false});*/
      /*wait till this template collection loads*/
      $.ajax({
        url: dataTemplatesCollectionUrl,
        cache: true,
        dataType: "html",
        async: false,
        success: function (result) {
          /*$.ajaxSetup({async: true});*/
          $(templateCollectionId).html(result);
          spa.console.info("Loaded Template Collection [" + templateCollectionId + "] from [" + dataTemplatesCollectionUrl + "]");

          /* Read all script id(s) in collection */
          spa.console.info("Found following templates in Template Collection.");
          $(templateCollectionId + " script").each(function (index, element) {
            retValue[$(element).attr("id")] = 'script';
          });
          spa.console.info({o: retValue});
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /*$.ajaxSetup({async: true});*/
          spa.console.error("Failed Loading Template Collection [" + templateCollectionId + "] from [" + dataTemplatesCollectionUrl + "]. [" + textStatus + ":" + errorThrown + "]");
        }
      });
    }
    else {
      spa.console.info(templateCollectionId + " Found! skip template collection load from " + dataTemplatesCollectionUrl);
    }
    return (retValue);
  };


  /*Get URL Parameters as Object
   * if url = http://xyz.com/page?param0=value0&param1=value1&paramX=valueA&paramX=valueB
   * spa.urlParams() => {param0: "value0", param1:"value1", paramX:["valueA", "valueB"]}
   * spa.urlParams()["param0"] => "value0"
   * spa.urlParams().param0    => "value0"
   * spa.urlParams().paramX    => ["valueA", "valueB"]
   * spa.urlParams().paramZ    => undefined
   * */
  spa.urlParams = function (urlQuery) {
    urlQuery = (urlQuery || window.location.search || "");
    urlQuery = (urlQuery.beginsWith("\\?") || urlQuery.indexOf("//") < 7) ? urlQuery.substr(urlQuery.indexOf("?") + 1) : urlQuery;
    var qParams = {};
    urlQuery.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
      (qParams[key] = qParams[key] || []).push(decodeURIComponent(value));
    });
    _.each(qParams, function (value, key) {
      qParams[key] = (_.isArray(value) && value.length == 1) ? value[0] : value;
    });
    return qParams;
  };
  /*Get URL Parameter value
   * if url = http://xyz.com/page?param0=value0&param1=value1&paramX=valueA&paramX=valueB
   * spa.urlParam("param0") => "value0"
   * spa.urlParam("paramX") => ["valueA", "valueB"]
   * spa.urlParam("paramZ") => undefined
   * */
  spa.urlParam = function (name, queryString) {
    return (spa.urlParams(queryString)[name]);
  };

  /*Get URL Hash value
   * current window location = http://xyz.com/page#/hash0/hash1/hash2
   * spa.getLocHash()   => "#/hash0/hash1/hash2"
   * */
  spa.getLocHash = function(){
    return window.location.hash || "";
  };
  /*Get URL Hash value
   * if url = http://xyz.com/page#/hash0/hash1/hash2
   * spa.urlHash()   => "/hash0/hash1/hash2"
   * spa.urlHash(1)  => "hash1"
   * spa.urlHash([]) => ["hash0", "hash1", "hash2"]
   * spa.urlHash(["key0", "key1", "key3"]) => {"key0":"hash0", "key1":"hash1", "key2":"hash2"}
   * */
  spa.urlHash = function (returnOf, hashDelimiter) {
    var retValue = (spa.getLocHash() || "#").substring(1);
    if (returnOf) {
      hashDelimiter = hashDelimiter || "/";
      retValue = retValue.beginsWith(hashDelimiter) ? retValue.substring(retValue.indexOf(hashDelimiter) + (hashDelimiter.length)) : retValue;
      var hashArray = retValue.split(hashDelimiter);
      if (_.isNumber(returnOf)) {
        retValue = (hashArray && hashArray.length > returnOf) ? hashArray[returnOf] : "";
      }
      else if (_.isArray(returnOf)) {
        retValue = (returnOf.length === 0) ? hashArray : _.object(returnOf, hashArray);
      } else if (_.isString(returnOf) && returnOf == "?") {
        retValue = (retValue.contains("\\?"))? spa.getOnSplit(retValue, "?", 1) : "";
      }
    }
    return retValue;
  };
  /*Similar to spa.urlParam on HashParams*/
  spa.hashParam = function (name) {
    var retValue = (''+spa.urlHash('?'));
    if (typeof name !== "undefined" && !spa.isBlank(retValue)) {
      retValue = spa.urlParam((''+name), retValue);
    }
    return (retValue);
  };

  /*
   spa.routeMatch("#url-path/:param1/:param2?id=:param3", "#url-path/serviceName/actionName?id=Something")
   ==>
   {   hkeys: [':param1', ':param2', ':param3']
   , params: {'param1':'serviceName','param2':'actionName','param3':'Something'}
   }
   *
   * */
  spa.routeMatch = function (routePattern, urlHash) {
    var rxParamMatcher = new RegExp(":[a-zA-Z0-9\\_\\-]+", "g")
      , routeMatcher = new RegExp(routePattern.replace(rxParamMatcher, '([\\w\\+\\-\\|\\.\\?]+)'))
      , _keysSrc = routePattern.match(rxParamMatcher)
      , _values  = urlHash.match(routeMatcher)
      , _matchResult = (_values && !_.isEmpty(_values))? _values.shift() : ""
      , _keys   = (_keysSrc && !_.isEmpty(_keysSrc))? _keysSrc.join(',').replace(/:/g,'').split(',') : []
      , _values = (_values && !_.isEmpty(_values))? _values.join(',').replace(/\?/g, '').split(',') : []
      , retValue = undefined;
    if (_matchResult) {
      retValue = {
        hkeys: _keysSrc
        , params: _.zipObject(_keys, _values)
      }
    }
    return (retValue);
  };


  /* i18n support */
  spa.i18n = {};
  spa.i18n.loaded = false;
  spa.i18n.settings = {
    name: 'Language',
    path: 'language/',
    encoding: 'UTF-8',
    cache: true,
    mode: 'map',
    callback: null
  };
  spa.i18n.setLanguage = function (lang, i18nSettings) {
    if ($.i18n) {
      lang = lang || ($.i18n.browserLang()).replace(/-/g, "_");
      i18nSettings = $.extend(spa.i18n.settings, i18nSettings);
      $.i18n.properties({
        name: i18nSettings.name,
        language: lang,
        path: i18nSettings.path,
        encoding: i18nSettings.encoding,
        cache: i18nSettings.cache,
        mode: i18nSettings.mode,
        callback: function () {
          $.i18n.loaded = (typeof $.i18n.loaded == "undefined") ? (!$.isEmptyObject($.i18n.map)) : $.i18n.loaded;
          spa.i18n.loaded = spa.i18n.loaded || $.i18n.loaded;
          if ((lang.length > 1) && (!$.i18n.loaded)) {
            spa.console.warn("Error Loading Language File [" + lang + "]. Loading default.");
            spa.i18n.setLanguage("_", i18nSettings);
          }
          spa.i18n.apply();
          if (i18nSettings.callback) {
            i18nSettings.callback($.i18n.loaded);
          }
        }
      });
    }
  };

  spa.i18n.text = function (i18nKey, data) {
    var dMessage = $.i18n.prop(i18nKey);
    if (data) {
      var msgParamValue = "";
      _.each(_.keys(data), function (key) {
        msgParamValue = "" + data[key];
        if (msgParamValue && msgParamValue.beginsWith("i18n:", "i")) msgParamValue = $.i18n.prop(msgParamValue.replace(/i18n:/gi, ""));
        dMessage = dMessage.replace(new RegExp("{" + key + "}", "gi"), msgParamValue);
      });
    }
    return dMessage;
  };

  spa.i18n.apply = spa.i18n.render = function (contextRoot, elSelector) {
    if (spa.i18n.loaded) {
      contextRoot = contextRoot || "body";
      elSelector = elSelector || "";
      $(elSelector + "[data-i18n]", contextRoot).each(function (indes, el) {
        var i18nSpec = spa.toJSON($(el).data("i18n") || "{}");
        var i18nData = i18nSpec['i18ndata'];
        if (i18nData) delete i18nSpec['i18ndata'];
        if (i18nSpec && !$.isEmptyObject(i18nSpec)) {
          _.each(_.keys(i18nSpec), function (attrSpec) {
            var i18nKey = i18nSpec[attrSpec];
            var i18nValue = spa.i18n.text(i18nKey, i18nData); //$.i18n.prop(i18nKey);
            _.each(attrSpec.split("_"), function (attribute) {
              switch (attribute.toLowerCase()) {
                case "html":
                  $(el).html(i18nValue);
                  break;
                case "text":
                  $(el).text(i18nValue);
                  break;
                default:
                  $(el).attr(attribute, i18nValue);
                  break;
              }
            });
          });
        }
      });
    }
  };

  /* Backbone.Model extended for CRUD specific URLs support
   * urlRoot: URL or {default:URL, create:URL, read:URL, update:URL, delete:URL, patch:URL}
   *
   * URL: String with optional template-variables
   * {crud} ==> create|read|update|delete|patch
   * {model keys}
   *
   * example:
   *
   * urlRoot: "/api/member.json?action={crud}&id={memid}"
   *
   * */
  spa.extendBackbone = function () {
    if (window.Backbone) {
      spa.console.info("Found Backbone. Extending ...");
      // override the Model prototype for CRUD specific URLs.
      _.extend(Backbone.Model.prototype, Backbone.Events, {

        activeCRUD: "",

        diffAttributes: function (dOptions) {
          return (window.jsondiffpatch) ? jsondiffpatch.diff(this.previousAttributes(), this.toJSON(), dOptions) : this.changedAttributes();
        },

        sync: function () {
          this.activeCRUD = arguments[0];
          return Backbone.sync.apply(this, arguments);
        },

        url: function () {
          var baseURL, ajaxURL, qryParams, spaURLs, paramName;
          var urlRoot = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
          if (urlRoot) {
            spaURLs = (typeof urlRoot === "object") ? urlRoot : {'defaulturl': urlRoot};
            spaURLs['patch'] = spaURLs['patch'] || spaURLs['update'];

            baseURL = _.result(spaURLs, this.activeCRUD.toLowerCase() + "url") || _.result(spaURLs, 'defaulturl') || urlError();
            ajaxURL = (baseURL.replace(/\{crud\}/gi, this.activeCRUD.toUpperCase()).replace(/\{now\}/gi, spa.now()))
              + ((this.isNew() || (baseURL.indexOf("?") > 0)) ? '' : ((((baseURL.charAt(baseURL.length - 1) === '/') ? '' : '/') + encodeURIComponent(this.id))));
            while ((qryParams = ajaxURL.match(/{([\s\S]*?)}/g)) && qryParams && qryParams[0]) {
              paramName = qryParams[0].replace(/[{}]/g, '');
              ajaxURL = ajaxURL.replace(new RegExp(qryParams[0], "g"), ((paramName.indexOf(".") >= 0) ? spa.find(this.toJSON(), paramName) : this.get(paramName)) || "");
            }
          }
          spa.console.info("Backbone Sync Url: " + ajaxURL);
          return (ajaxURL);
        }
      });
    }
    else {
      spa.console.warn("Backbone not found. NOT extending...");
    }
  };

  /*Load Backbone Model Class from a remote location*/
  spa.loadBackboneModelClass = function (bbModelClassUrl, options) {
    options || (options = {});
    var retValue = {url: bbModelClassUrl, bbclass: Backbone.Model.extend({'defaults': {}}), success: false};
    /*$.ajaxSetup({async: false});*/
    /*wait till this data loads*/
    $.ajax({
      url: retValue.url,
      dataType: "text",
      async: false,
      success: function (result) {
        /*$.ajaxSetup({async: true});*/
        result = result.substring(result.indexOf('{'));
        retValue.bbclass = Backbone.Model.extend(spa.toJSON(result));
        retValue.success = true;
        if (options.success) options.success(result);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        /*$.ajaxSetup({async: true});*/
        spa.console.error("Failed loading backbone class from [" + (retValue.url) + "]. [" + textStatus + ":" + errorThrown + "]");
        if (options.fail) options.fail(retValue.url, jqXHR, textStatus, errorThrown);
      }
    });
    return (retValue);
  };

  spa.getModifiedElement = function (elSelector) {
    var modified, modifiedEl=undefined;
    var $elements = $(elSelector || "form:not([data-ignore-change]) :input:not(:disabled,:button,[data-ignore-change])");
    //$elements.each(function(index, element) //jQuery each does not break the loop
    _.every($elements, function (element) //lo-dash breaks the loop when condition not satisified
    { if (!modified) {
        if ((element.tagName.match(/^(select|textarea)$/i)) && (element.value != element.defaultValue)) {
          modified = true;
        }
        else if (element.tagName.match(/^input$/i)) {
          if (element.type.match(/^(checkbox|radio)$/i) && element.checked != element.defaultChecked) {
            modified = true;
          } else if (element.type.match(/^(text|password|hidden|color|email|month|number|tel|time|url|range|date|datetime|datetime-local)$/i) && element.value != element.defaultValue) {
            modified = true;
          }
        }
        if (modified) {
          modifiedEl = element;
        }
      }
      return (!modified);
    });
    return (modifiedEl);
  };
  spa.getModifiedElements = function (elSelector) {
    var modified, modifiedEls = [];
    var $elements = $(elSelector || "form:not([data-ignore-change]) :input:not(:disabled,:button,[data-ignore-change])");
    $elements.each(function (index, element) {
      modified = false;
      if ((element.tagName.match(/^(select|textarea)$/i)) && (element.value != element.defaultValue)) {
        modified = true;
      }
      else if (element.tagName.match(/^input$/i)) {
        if (element.type.match(/^(checkbox|radio)$/i) && element.checked != element.defaultChecked) {
          modified = true;
        } else if (element.type.match(/^(text|password|hidden|color|email|month|number|tel|time|url|range|date|datetime|datetime-local)$/i) && element.value != element.defaultValue) {
          modified = true;
        }
      }
      if (modified) {
        modifiedEls.push(element);
      }
    });
    return (modifiedEls);
  };

  spa.initTrackElValueChanges = spa.resetElementsDefaultValue = function (elSelector) {
    $(elSelector || "form :input:not(:disabled)").each(function (index, element) {
      element.defaultValue = element.value;
      if ((element.tagName.match(/^input$/i)) && (element.type.match(/^(checkbox|radio)$/i) && element.checked != element.defaultChecked)) {
        element.defaultChecked = element.checked;
      }
    });
  };

  spa.trash = {
      container:[]
    , push : function(junk){ this.container.push(junk); }
    , empty: function(){this.container = []; }
    , pick : function(tIndex){ return ((tIndex)? this.container[tIndex] : this.container); }
  };
  spa.fillData = function (data, context, options) {
    var ready2Fill = ((typeof data) == "object");

    if (context && ((typeof context) == "object")) {
      options = context;
      context = null;
    }
    context = context || "body";

    var fillOptions = {
      dataParams: {},
      dataCache: false,
      keyFormat: "aBc",
      selectPattern: "[name='?']",
      formatterCommon: null,
      formatterOnKeys: null,
      resetElDefault: true,
      resetElDefaultInContext: true,
      keysMap: {}
    };
    $.extend(fillOptions, options);

    if (!ready2Fill) { //make Ajax call to load remote data and apply....
      /*$.ajaxSetup({async: false});*/
      /*wait till this data loads*/
      $.ajax({
        url: data,
        data: fillOptions.dataParams,
        cache: fillOptions.dataCache,
        dataType: "text",
        async: false,
        success: function (result) {
          /*$.ajaxSetup({async: true});*/
          data = spa.toJSON(result);
          ready2Fill = ((typeof data) == "object");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /*$.ajaxSetup({async: true});*/
          spa.console.error("Failed loading data from [" + data + "]. [" + textStatus + ":" + errorThrown + "]");
        }
      });
    }
    if (ready2Fill) {
      var keyFormat = fillOptions.keyFormat;

      keyFormat = (keyFormat.match(/^[a-z]/) != null) ? "aBc" : keyFormat;
      keyFormat = (keyFormat.match(/^[A-Z]/) != null) ? "AbC" : keyFormat;

      var dataKeys = spa.keysDotted(data);
      spa.console.group("fillData");
      spa.console.info(dataKeys);

      _.each(dataKeys, function (dataKeyPath) {
        spa.console.group(">>" + dataKeyPath);
        var dataKey = ""+(dataKeyPath.replace(/[\[\]]/g, "_") || "");
        var dataKeyForFormatterFnSpec = dataKeyPath.replace(/\[[0-9]+\]/g, "");
        var isArrayKey = (/\[[0-9]+\]/).test(dataKeyPath);

        switch (keyFormat) {
          case "_" :
            dataKey = spa.dotToX(dataKey, "_");
            dataKeyForFormatterFnSpec = spa.dotToX(dataKeyForFormatterFnSpec, "_");
            break;
          case "AbC":
            dataKey = spa.dotToTitleCase(dataKey);
            dataKeyForFormatterFnSpec = spa.dotToTitleCase(dataKeyForFormatterFnSpec);
            break;
          default:
            dataKey = spa.dotToCamelCase(dataKey);
            dataKeyForFormatterFnSpec = spa.dotToCamelCase(dataKeyForFormatterFnSpec);
            break;
        }

        var debugInfo = {
          "patternKey": dataKey + (isArrayKey ? (" || " + dataKeyForFormatterFnSpec) : ""),
          "formatterKey": dataKeyForFormatterFnSpec,
          "isArrayChild": isArrayKey
        };
        spa.trash.push(debugInfo);
        spa.console.info(debugInfo);
        spa.trash.empty();

        var elSelector = (fillOptions.selectPattern).replace(/\?/g, dataKey);
        if (fillOptions.keysMap[dataKey] || fillOptions.keysMap[dataKeyForFormatterFnSpec]) {
          fillOptions.keysMap[dataKey] = fillOptions.keysMap[dataKey] || {};
          fillOptions.keysMap[dataKeyForFormatterFnSpec] = fillOptions.keysMap[dataKeyForFormatterFnSpec] || {};
          fillOptions.keysMap[dataKey].pattern = fillOptions.keysMap[dataKey].pattern || fillOptions.keysMap[dataKeyForFormatterFnSpec].pattern;
          if (fillOptions.keysMap[dataKey].pattern) {
            elSelector = (fillOptions.keysMap[dataKey].pattern).replace(/\?/g, dataKey);
          }
          if (fillOptions.keysMap[dataKeyForFormatterFnSpec].formatter) {
            fillOptions.formatterOnKeys = fillOptions.formatterOnKeys || {};
            fillOptions.formatterOnKeys[dataKeyForFormatterFnSpec] = fillOptions.keysMap[dataKeyForFormatterFnSpec].formatter;
          }
        }
        spa.console.info(">> " + elSelector + " found: " + $(elSelector, context).length);
        var dataValue = null;
        if ($(elSelector, context).length > 0) {
          dataValue = spa.find(data, dataKeyPath);
          if ((!fillOptions.formatterOnKeys) && (fillOptions.formatterCommon)) {
            dataValue = fillOptions.formatterCommon(dataValue, dataKeyPath, data);
          }
          if (fillOptions.formatterOnKeys) {
            if (fillOptions.formatterOnKeys[dataKeyForFormatterFnSpec]) {
              dataValue = fillOptions.formatterOnKeys[dataKeyForFormatterFnSpec](dataValue, dataKeyPath, data);
            } else if (fillOptions.formatterCommon) {
              dataValue = fillOptions.formatterCommon(dataValue, dataKeyPath, data);
            }
          }
          spa.console.info({value: dataValue});
        }
        $(elSelector, context).each(function (index, el) {
          spa.console.info(el);
          switch ((el.tagName).toUpperCase()) {
            case "INPUT":
              switch ((el.type).toLowerCase()) {
                case "text":
                case "password":
                case "hidden":
                case "color":
                case "date":
                case "datetime":
                case "datetime-local":
                case "email":
                case "month":
                case "number":
                case "search":
                case "tel":
                case "time":
                case "url":
                case "range":
                case "button":
                case "submit":
                case "reset":
                  $(el).val(dataValue);
                  if (!fillOptions.resetElDefaultInContext && fillOptions.resetElDefault) el.defaultValue = el.value;
                  break;

                case "checkbox":
                case "radio":
                  el.checked = (el.value).equalsIgnoreCase(dataValue);
                  if (!fillOptions.resetElDefaultInContext && fillOptions.resetElDefault) el.defaultChecked = el.checked;
                  break;
              }
              break;

            case "SELECT":
              spa.selectOptionForValue(el, dataValue);
              if (!fillOptions.resetElDefaultInContext && fillOptions.resetElDefault) el.defaultValue = el.value;
              break;

            case "TEXTAREA":
              $(el).val(dataValue);
              if (!fillOptions.resetElDefaultInContext && fillOptions.resetElDefault) el.defaultValue = el.value;
              break;

            default:
              $(el).html(dataValue);
              break;
          }
        });

        spa.console.groupEnd(">>" + dataKeyPath);
      });

      spa.console.groupEnd("fillData");
      if (fillOptions.resetElDefaultInContext) spa.resetElementsDefaultValue(context + " :input");
    }
  };

  spa.toRenderDataStructure = function(saoDataUrl, soParams) {
    var retObj = {}
      , dataCollection = {}
      , itemUrl = {}
      , oParams = {};

    if (soParams){
      oParams = (_.isString(soParams))? spa.queryStringToJson(soParams) : ((_.isObject(soParams))? soParams : {});
    }
    switch(true) {
      case (_.isString(saoDataUrl)) :
        /* 'path/to/data/api' => {dataUrl:'path/to/data/api'}
           'target.data.key|path/to/data/api' => {dataUrl:'path/to/data/api', dataModel:'target.data.key'}
        */
        if (saoDataUrl.contains("\\|")) {
          retObj['dataModel'] = spa.getOnSplit(saoDataUrl, "|", 0);
          saoDataUrl = spa.getOnLastSplit(1);
        }
        retObj['dataUrl'] = saoDataUrl;
        if (!_.isEmpty(oParams)) retObj['dataParams'] = oParams;
        break;
      case (_.isArray(saoDataUrl)) :
        /* ['path/to/json/data/api0', 'path/to/json/data/api1', 'path/to/json/data/api2'] =>
         ==> dataCollection : {
         urls: [
         {name:'data0', url:'path/to/json/data/api0'}
         , {name:'data1', url:'path/to/json/data/api1'}
         , {name:'data2', url:'path/to/json/data/api2'}
         ]
         }

         ['target.data.key0|path/to/json/data/api0', 'target.data.key1|path/to/json/data/api1', 'target.data.key2|path/to/json/data/api2'] =>
         ==> dataCollection : {
         urls: [
         {url:'path/to/json/data/api0', target:'target.data.key0', name:'key0'}
         , {url:'path/to/json/data/api1', target:'target.data.key1', name:'key1'}
         , {url:'path/to/json/data/api2', target:'target.data.key2', name:'key2'}
         ]
         }
         */
        dataCollection = {urls:[]};
        itemUrl = {};
        _.each(saoDataUrl, function(apiUrl, urlIndex){
          itemUrl = {url:apiUrl, params:oParams};
          if (apiUrl.contains("\\|")) {
            itemUrl['target'] = spa.getOnSplit(apiUrl, "|", 0);
            itemUrl['url'] = spa.getOnLastSplit(1);
          }
          dataCollection.urls.push(itemUrl);
        });
        break;
      case (_.isObject(saoDataUrl)) :
        /*
         {dataA:'path/to/json/data/api0', dataB:'path/to/json/data/api1', dataC:'path/to/json/data/api3' }

         ==> dataCollection : {
         urls: [
         {url:'path/to/json/data/api0', name:'dataA'}
         , {url:'path/to/json/data/api1', name:'dataB'}
         , {url:'path/to/json/data/api2', name:'dataC'}
         ]
         }

         {dataA:'target.data.key0|path/to/json/data/api0', dataB:'target.data.key1|path/to/json/data/api1', dataC:'target.data.key3|path/to/json/data/api3' }
         ==> dataCollection : {
         urls: [
         {url:'path/to/json/data/api0', target:'target.data.key0', name:'dataA'}
         , {url:'path/to/json/data/api1', target:'target.data.key1', name:'dataB'}
         , {url:'path/to/json/data/api2', target:'target.data.key2', name:'dataC'}
         ]
         }
         * */
        dataCollection = {urls:[]};
        itemUrl = {};
        _.each(_.keys(saoDataUrl), function(dName, kIndex){
          itemUrl = {name:dName, url:saoDataUrl[dName], params:oParams};
          if (saoDataUrl[dName].contains("\\|")) {
            itemUrl['target'] = spa.getOnSplit(saoDataUrl[dName], "|", 0);
            itemUrl['url'] = spa.getOnLastSplit(1);
          }
          dataCollection.urls.push(itemUrl);
        });
        break;
    }
    if (!_.isEmpty(dataCollection.urls)) {
      retObj['dataCollection'] = dataCollection;
    }
    return retObj;
  };

  /* each spaRender's view and model will be stored in renderHistory */
  spa.viewModels = {};
  spa.renderHistory = {};
  spa.renderHistoryMax = 100;
  spa.defaults = {
    dataTemplateEngine: "handlebars"
  };

  /*
   * spa.render("#containerID")
   *
   * OR
   *
   uOption = {
   data                      : {}    // Data(JSON Object) to be used in templates; for html data-attribute see dataUrl

   ,dataUrl                   : ""    // External Data(JSON) URL | local:dataModelVariableName
   ,dataUrlErrorHandle        : ""    // single javascript function name to run if external data url fails; NOTE: (jqXHR, textStatus, errorThrown) are injected to the function.
   ,dataParams                : {}    // dataUrl Params (NO EQUIVALENT data-attribute)
   ,dataModel                 : ""    // External Data(JSON) "key" for DataObject; default: "data"; may use name-space x.y.z (with the cost of performance)
   ,dataModelType             : ""    // "Backbone" applicable only for local data eg: data or dataUrl:"local:XXXXXX"
   // "Backbone:{classpath:'path-to-backbone-model-class.js', classsuccess:jsFunctionName, classerror:jsFunctionName, defaults:{}, fetchsuccess:jsFunctionName, fetcherror:jsFunctionName}"
   ,dataCache                 : false // External Data(JSON) Cache

   ,dataCollection            : {}    // { urls: [ {
   //              name   : 'string:dataApi'; if no (name or target) auto-keys: data0..dataN
   //            , url    : 'string:path-to-data-api'
   //            , params : object:pay-load
   //            , cache  : boolean:true|false; default:false
   //            , target : 'string:data-key-in-api-result-json'
   //            , success: 'string:functionName'
   //            , error  : 'string:functionName' } ... ]
   //
   //    , nameprefix: 'string: default:data' for xyz0, xyz1, xyz2
   //    , success:fn
   //    , error:fn
   // }

   ,dataTemplatesCollectionUrl: ""    // location of single file containing all the templates; helps to load all templates in single request. use "dataTemplate" to define primary tempate to be used for rendering
   ,dataTemplates             : {}    // Templates to be used for rendering {tmplID:'inline', tmplID:'script', tmplID:'URL'}
   ,dataTemplateEngine        : ""    // handlebars (*default*) | underscore | underscore-as-mustache | mustache | hogan
   ,dataTemplate              : ""    // Primary Template ID ==> content may be inline or <script>
   // dataTemplate = dataTemplates[0]; if dataTemplate is not defined

   ,dataTemplatesCache        : true  // cache of Templates

   ,dataScripts               : {}    // scripts (js) to be loaded along with templates
   ,dataScriptsCache          : true  // cache of dataScripts

   ,dataStyles                : {}    // styles (css) to be loaded along with templates
   ,dataStylesCache           : true  // cache of dataStyles

   ,dataRenderEngine          : ""    // Backbone | hogan
   ,dataRenderCallback        : ""    // single javascript function name to run after render

   ,dataRenderId              : ""    // Render Id, may be used to locate in spa.renderHistory[dataRenderId], auto-generated key if not defined
   ,saveOptions               : false // Save options in render-container element
   };

   spa.render("#containerID", uOption);
   */
  spa.render = function (viewContainderId, uOptions) {
    var retValue = {id: "", view: {}, model: {}, cron: ""};
    var spaAjaxRequestsQue = [];
    var foundViewContainer = spa.isElementExist(viewContainderId);

    //key: RenderEngine
    var spaDefaultTemplateConfig = {
      "backbone": {"engine": "underscore", "template": "x-underscore-template"}
      , "hogan": {"engine": "hogan", "template": "x-hogan-template"}

      , "unknown": {"engine": "unknown", "template": "x-unknown-template"}
    };
    /*spaDefaultTemplateConfig[spaRenderEngineKey].engine
     spaDefaultTemplateConfig[spaRenderEngineKey].template*/

    var noOfArgs = arguments.length;
    var useOptions = (noOfArgs > 1);
    var useParamData = (useOptions && uOptions.hasOwnProperty('data'));
    var dataFound = true;

    var spaRVOptions = {
      data: {}
      , dataUrl: ""
      , dataUrlErrorHandle: ""
      , dataParams: {}
      , dataModel: ""
      , dataModelType: ""
      , dataCache: false

      , dataCollection: {}

      , dataTemplatesCollectionUrl: ""
      , dataTemplates: {}
      , dataTemplateEngine: ""
      , dataTemplate: ""
      , dataTemplatesCache: true

      , dataScripts: {}
      , dataScriptsCache: true

      , dataStyles: {}
      , dataStylesCache: true

      , dataRenderEngine: ""
      , dataRenderCallback: ""

      , dataRenderId: ""
    };

    if (!foundViewContainer) {
      if (!spa.isElementExist("#spaRunTimeHtmlContainer")) {
        $("body").append("<div id='spaRunTimeLoadContainer' style='display:none;'></div>");
      }
      $("#spaRunTimeLoadContainer").append("<div id='" + viewContainderId.replace(/\#/gi, "") + "'></div>")
    }
    if (useOptions) { /* for each user option set/override internal spaRVOptions */
      /* store options in container data properties if saveOptions == true */
      var saveOptions = (uOptions.hasOwnProperty("saveOptions") && uOptions["saveOptions"]);
      for (var key in uOptions) {
        spaRVOptions[key] = uOptions[key];
        if (saveOptions && (!(key === "data" || key === "saveOptions"))) {
          $(viewContainderId).data((""+( ("" + (_.at(""+key,4)||"") ).toLowerCase() )+key.slice(5)), spa.toStr(uOptions[key]));
        }
      }
    }
    /*Render Id*/
    var spaRenderId = ("" + $(viewContainderId).data("renderId")).replace(/undefined/, "");
    if (!spa.isBlank(spaRVOptions.dataRenderId)) {
      spaRenderId = spaRVOptions.dataRenderId;
    }
    retValue.id = (spaRenderId.ifBlank(("spaRender" + (spa.now()) + (spa.rand(1000, 9999)))));

    /* Render Engine */
    var spaRenderEngine = ("" + $(viewContainderId).data("renderEngine")).replace(/undefined/, "");
    if (!spa.isBlank(spaRVOptions.dataRenderEngine)) {
      spaRenderEngine = spaRVOptions.dataRenderEngine;
    }
    spaRenderEngine = (spaRenderEngine.ifBlank("unknown")).toLowerCase();
    var spaRenderEngineKey = spaRenderEngine;
    if (!spaDefaultTemplateConfig.hasOwnProperty(spaRenderEngineKey)) {
      spaRenderEngineKey = "unknown";
      spaRenderEngine += "-unknown";
    }
    var spaTemplateType = spaDefaultTemplateConfig[spaRenderEngineKey].template;

    var spaTemplateEngine = ("" + $(viewContainderId).data("templateEngine")).replace(/undefined/, "");
    if (!spa.isBlank(spaRVOptions.dataTemplateEngine)) {
      spaTemplateEngine = spaRVOptions.dataTemplateEngine;
    }
    if (spa.isBlank(spaTemplateEngine)) //No TemplateEngine specified
    {
      if (spaRenderEngineKey.equalsIgnoreCase("unknown")) //or NO RenderEngine Specified;
      {
        spaTemplateEngine = (spa.defaults.dataTemplateEngine || "handlebars");
      }
      else //set TemplateEngine based on RenderEngine
      {
        spaTemplateEngine = (spaTemplateEngine.ifBlank(spaDefaultTemplateConfig[spaRenderEngineKey].engine)).toLowerCase();
      }
    }
    switch (spaTemplateEngine) {
      case "hogan":
        if (spaRenderEngine == "unknown") {
          spaRenderEngineKey = spaRenderEngine = spaTemplateEngine;
          spaTemplateType = spaDefaultTemplateConfig[spaRenderEngineKey].template;
        }
        break;
    }
    var spaBackboneModelOption = {};
    var spaViewDataModelType = ("" + $(viewContainderId).data("modelType")).replace(/undefined/, "");
    if (!spa.isBlank(spaRVOptions.dataModelType)) {
      spaViewDataModelType = spaRVOptions.dataModelType;
    }
    if (spaViewDataModelType.beginsWith("backbone:", "i")) {
      spaBackboneModelOption = spa.toJSON(spaViewDataModelType.substring(9));
      spaViewDataModelType = "backbone";
      if (spaRenderEngine.equalsIgnoreCase("unknown")) spaRenderEngine = "backbone";
    }
    spaViewDataModelType = (spaViewDataModelType.ifBlank()).toLowerCase();

    /* Load Scripts Begins */
    spa.console.group("spaLoadingViewScripts");
    if (!(useOptions && uOptions.hasOwnProperty('dataScriptsCache'))) /* NOT provided in Render Request */
    { /* Read from view container [data-scripts-cache='{true|false}'] */
      var scriptsCacheInTagData = ("" + $(viewContainderId).data("scriptsCache")).replace(/undefined/, "");
      if (!spa.isBlank(scriptsCacheInTagData)) {
        spaRVOptions.dataScriptsCache = scriptsCacheInTagData.toBoolean();
        spa.console.info("Override [data-scripts-cache] with [data-scripts-cache] option in tag-attribute: " + spaRVOptions.dataScriptsCache);
      }
    }
    else {
      spa.console.info("Override [data-scripts-cache] with user option [dataScriptsCache]: " + spaRVOptions.dataScriptsCache);
    }
    var vScriptsList = ("" + $(viewContainderId).data("scripts")).ifBlank("{}");
    var vScripts = eval("(" + vScriptsList + ")");
    /* Check the option to override */
    if (!$.isEmptyObject(spaRVOptions.dataScripts)) {
      vScripts = spaRVOptions.dataScripts;
    }
    if (vScripts && (!$.isEmptyObject(vScripts))) {
      spa.console.info("External scripts to be loaded [cache:" + (spaRVOptions.dataScriptsCache) + "] along with view container [" + viewContainderId + "] => " + JSON.stringify(vScripts));
      var vScriptsNames = _.keys(vScripts);

      spa.console.group("spaLoadingScripts");
      _.each(vScriptsNames, function (scriptId) {
        spaAjaxRequestsQue = spa.loadScript(scriptId, vScripts[scriptId], spaRVOptions.dataScriptsCache, spaAjaxRequestsQue);
      });
      spa.console.info("External Scripts Loading Status: " + JSON.stringify(spaAjaxRequestsQue));
      spa.console.groupEnd("spaLoadingScripts");
    }
    else {
      spa.console.info("No scripts defined [data-scripts] in view container [" + viewContainderId + "] to load.");
    }
    spa.console.groupEnd("spaLoadingViewScripts");
    /* Load Scripts Ends */

    /*Wait till scripts are loaded before proceed*/
    $.when.apply($, spaAjaxRequestsQue)
      .then(function () {
        spa.console.info("External Scripts Loaded.");
      })
      .fail(function () {
        spa.console.error("External Scripts Loading Failed! Unexpected!? Check the Script Path/Network.");
      });

    /* Load Data */
    spa.console.group("kDataModel");
    var dataModelName = ("" + $(viewContainderId).data("model")).replace(/undefined/, ""), viewDataModelName;
    if (!spa.isBlank(spaRVOptions.dataModel)) {
      dataModelName = spaRVOptions.dataModel;
    }
    var dataModelUrl = ("" + $(viewContainderId).data("url")).replace(/undefined/, ""); //from HTML
    if (!spa.isBlank(spaRVOptions.dataUrl)) {
      dataModelUrl = spaRVOptions.dataUrl;
    }
    var isLocalDataModel = (useParamData || (dataModelUrl.beginsWith("local:", "i")));
    var defaultDataModelName = (dataModelUrl.beginsWith("local:", "i")) ? dataModelUrl.replace(/local:/gi, "") : "data";
    dataModelName = dataModelName.ifBlank(defaultDataModelName);
    viewDataModelName = dataModelName.replace(/\./g, "_");

    var spaTemplateModelData = {};
    if (useParamData) {
      spaTemplateModelData[viewDataModelName] = spaRVOptions.data;
      spa.console.info("Loaded data model [" + dataModelName + "] from argument");
    }
    else {
      if (!(useOptions && uOptions.hasOwnProperty('dataCache'))) /* NOT provided in Render Request */
      { /* Read from view container [data-cache='{true|false}'] */
        var dataCacheInTagData = ("" + $(viewContainderId).data("cache")).replace(/undefined/, "");
        if (!spa.isBlank(dataCacheInTagData)) {
          spaRVOptions.dataCache = dataCacheInTagData.toBoolean();
          spa.console.info("Override [data-cache] with [data-cache] option in tag-attribute: " + spaRVOptions.dataCache);
        }
      }
      else {
        spa.console.info("Override [data-cache] with user option [dataCache]: " + spaRVOptions.dataCache);
      }
      if (spa.isBlank(dataModelUrl)) { /*dataFound = false;*/
        spaTemplateModelData[viewDataModelName] = {};

        //Check dataCollection
        var dataModelCollection = ("" + $(viewContainderId).data("collection")).replace(/undefined/, ""); //from HTML
        if (dataModelCollection) dataModelCollection = spa.toJSON(dataModelCollection); //convert to json if found
        if (!spa.isBlank(spaRVOptions.dataCollection)) //override with javascript
        {
          dataModelCollection = spaRVOptions.dataCollection;
        }
        if (_.isArray(dataModelCollection)) dataModelCollection = {urls: dataModelCollection};

        var dataModelUrls = dataModelCollection['urls'];

        if (spa.isBlank(dataModelUrls)) {
          spa.console.warn("Model Data [" + dataModelName + "] or [data-url] or [data-collection] NOT found! Check the arguments or html markup. Rendering with empty data {}.");
        }
        else { //Processing data-collection


          if (!_.isArray(dataModelUrls)) {
            spa.console.warn("Invalid [data-urls].Check the arguments or html markup. Rendering with empty data {}.");
          }
          else {
            spa.console.info("Processing data-URLs");
            var dataIndexApi = 0, defaultAutoDataNamePrefix = dataModelCollection['nameprefix'] || "data";
            _.each(dataModelUrls, function (dataApi) {
              var defaultApiDataModelName = (defaultAutoDataNamePrefix + dataIndexApi)
                , apiDataModelName = _.has(dataApi, 'name') ? (('' + dataApi.name).replace(/[^a-zA-Z0-9]/gi, '')) : (_.has(dataApi, 'target') ? ('' + dataApi.target) : defaultApiDataModelName)
                , apiDataUrl = _.has(dataApi, 'url') ? dataApi.url : (_.has(dataApi, 'path') ? dataApi.path : '');

              if (apiDataModelName.contains(".")) {
                apiDataModelName = _.last(apiDataModelName.split("."), 1);
              }
              apiDataModelName = apiDataModelName.ifBlank(defaultApiDataModelName);
              spa.console.info('processing data-api for: ' + apiDataModelName);
              spa.console.log(dataApi);

              if (apiDataUrl) {
                spaAjaxRequestsQue.push(
                  $.ajax({
                    url: apiDataUrl,
                    data: _.has(dataApi, 'params') ? dataApi.params : (_.has(dataApi, 'data') ? dataApi.data : {}),
                    cache: _.has(dataApi, 'cache') ? dataApi.cache : spaRVOptions.dataCache,
                    dataType: "text",
                    success: function (result) {
                      var targetApiData
                        , targetDataModelName = _.has(dataApi, 'target') ? ('' + dataApi.target) : ''
                        , oResult = ("" + result).toJSON();

                      if (targetDataModelName.indexOf(".") > 0) {
                        targetApiData = spa.hasKey(oResult, targetDataModelName) ? spa.find(oResult, targetDataModelName) : oResult;
                      }
                      else {
                        targetApiData = oResult.hasOwnProperty(targetDataModelName) ? oResult[targetDataModelName] : oResult;
                      }
                      if (spaTemplateModelData[viewDataModelName][apiDataModelName]) {
                        spaTemplateModelData[viewDataModelName][apiDataModelName] = [spaTemplateModelData[viewDataModelName][apiDataModelName]];
                        spaTemplateModelData[viewDataModelName][apiDataModelName].push(targetApiData);
                      }
                      else {
                        spaTemplateModelData[viewDataModelName][apiDataModelName] = targetApiData;
                      }
                      spa.console.info("Loaded data model [" + apiDataModelName + "] from [" + apiDataUrl + "]");

                      //Call user defined function on api-data success
                      var fnApiDataSuccess = dataApi['success'] || dataApi['onsuccess'] || dataApi['onSuccess'];
                      if (!fnApiDataSuccess) {
                        fnApiDataSuccess = dataModelCollection['success'] || dataModelCollection['onsuccess'] || dataModelCollection['onSuccess']; //use common success
                      }
                      if (fnApiDataSuccess) {
                        if (_.isFunction(fnApiDataSuccess)) {
                          fnApiDataSuccess(oResult, dataApi);
                        }
                        else if (_.isString(fnApiDataSuccess)) {
                          eval("(" + fnApiDataSuccess + "(oResult, dataApi))");
                        }
                      }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                      spa.console.warn("Error processing data-api [" + apiDataUrl + "]");
                      //Call user defined function on api-data URL Error
                      var fnOnApiDataUrlErrorHandle = dataApi['error'] || dataApi['onerror'] || dataApi['onError'];
                      if (!fnOnApiDataUrlErrorHandle) {
                        fnOnApiDataUrlErrorHandle = dataModelCollection['error'] || dataModelCollection['onerror'] || dataModelCollection['onError']; //use common error
                        if ((!fnOnApiDataUrlErrorHandle) && (!spa.isBlank(spaRVOptions.dataUrlErrorHandle))) {
                          fnOnApiDataUrlErrorHandle = spaRVOptions.dataUrlErrorHandle;
                        }
                      }
                      if (fnOnApiDataUrlErrorHandle) {
                        if (_.isFunction(fnOnApiDataUrlErrorHandle)) {
                          fnOnApiDataUrlErrorHandle(jqXHR, textStatus, errorThrown);
                        }
                        else if (_.isString(fnOnApiDataUrlErrorHandle)) {
                          eval("(" + fnOnApiDataUrlErrorHandle + "(jqXHR, textStatus, errorThrown))");
                        }
                      }
                    }
                  })
                );//End of Ajax Que push
              }
              else {
                spa.console.error("data-api-url not found. Please check the arguments or html markup. Skipped this data-api request");
              }
              dataIndexApi++;
            });
          }
        }
      }
      else {
        if (dataModelUrl.beginsWith("local:", "i")) { /*Local DataModel*/
          var localDataModelName = dataModelUrl.replace(/local:/gi, "");
          var localDataModelObj = {};
          if (typeof eval("(" + localDataModelName + ")") != "undefined") { /*localDataModelObj = eval("("+localDataModelName+")");*/
            eval("(localDataModelObj=" + localDataModelName + ")");
          }
          spa.console.info("Using LOCAL Data Model: " + localDataModelName);
          if (spa.isBlank(spaViewDataModelType)) {
            if ((!isLocalDataModel) && (dataModelName.indexOf(".") > 0)) {
              spaTemplateModelData[viewDataModelName] = spa.hasKey(localDataModelObj, dataModelName) ? spa.find(localDataModelObj, dataModelName) : localDataModelObj;
            } else {
              spaTemplateModelData[viewDataModelName] = localDataModelObj.hasOwnProperty(dataModelName) ? localDataModelObj[dataModelName] : localDataModelObj;
            }
          }
          else {
            spa.console.info("Local Data: " + localDataModelName + " not found.");
            /*spaViewDataModelType is Backbone with its Class.js on server */
            if ($.isEmptyObject(localDataModelObj) && !$.isEmptyObject(spaBackboneModelOption)) {
              var bbClassUrl = spaBackboneModelOption['classpath'] || "";
              if (!spa.isBlank(bbClassUrl)) {
                if (bbClassUrl.beginsWith("local:", "i")) {
                  var bbClassLocal = bbClassUrl.substring(6);
                  eval("( localDataModelObj = new " + bbClassLocal + "() )");
                }
                else {
                  spa.console.info("loading Backbone Model Class from: " + (bbClassUrl) + ".");
                  var noop = function () {
                  };
                  var loadBackboneModelClassResult = spa.loadBackboneModelClass(bbClassUrl, {
                    success: spaBackboneModelOption['classsuccess'] || noop,
                    fail: spaBackboneModelOption['classerror'] || noop
                  });
                  localDataModelObj = new loadBackboneModelClassResult.bbclass();
                  if (loadBackboneModelClassResult.success) {
                    if (spaBackboneModelOption.defaults) {
                      localDataModelObj.set(spaBackboneModelOption.defaults);
                    }
                    localDataModelObj.fetch({
                      async: false,
                      cache: false,
                      success: spaBackboneModelOption['fetchsuccess'] || noop,
                      error: spaBackboneModelOption['fetcherror'] || noop
                    });
                  }
                }
                eval("(" + localDataModelName + "=localDataModelObj)");
                spaTemplateModelData[viewDataModelName] = localDataModelObj.toJSON();
              }
              else {
                spa.console.error("Backbone 'classpath' NOT defined. Please check the 'dataModelType' option.");
              }
            }
            else {
              spaTemplateModelData[viewDataModelName] = spaViewDataModelType.equalsIgnoreCase("backbone") ? localDataModelObj.toJSON() : localDataModelObj;
            }
          }
        }
        else { /*External Data Source*/
          spa.console.info("Request Data [" + dataModelName + "] [cache:" + (spaRVOptions.dataCache) + "] from URL =>" + dataModelUrl);
          spaAjaxRequestsQue.push(
            $.ajax({
              url: dataModelUrl,
              data: spaRVOptions.dataParams,
              cache: spaRVOptions.dataCache,
              dataType: "text",
              success: function (result) {
                var oResult = ("" + result).toJSON();
                if (dataModelName.indexOf(".") > 0) {
                  spaTemplateModelData[viewDataModelName] = spa.hasKey(oResult, dataModelName) ? spa.find(oResult, dataModelName) : oResult;
                }
                else {
                  spaTemplateModelData[viewDataModelName] = oResult.hasOwnProperty(dataModelName) ? oResult[dataModelName] : oResult;
                }
                spa.console.info("Loaded data model [" + dataModelName + "] from [" + dataModelUrl + "]");
              },
              error: function (jqXHR, textStatus, errorThrown) {
                //Call user defined function on Data URL Error
                var fnOnDataUrlErrorHandle = ("" + $(viewContainderId).data("urlErrorHandle")).replace(/undefined/, "");
                if (!spa.isBlank(spaRVOptions.dataUrlErrorHandle)) {
                  fnOnDataUrlErrorHandle = "" + spaRVOptions.dataUrlErrorHandle;
                }
                if (!spa.isBlank(fnOnDataUrlErrorHandle)) {
                  eval("(" + fnOnDataUrlErrorHandle + "(jqXHR, textStatus, errorThrown))");
                }
              }
            })
          );
        }
      }
    }
    spa.console.info("End of Data Processing");
    spa.console.log({o: spaTemplateModelData});
    spa.console.groupEnd("kDataModel");

    if (dataFound) { /* Load Templates */
      var vTemplate2RenderInTag = ("" + $(viewContainderId).data("template")).replace(/undefined/, "");
      var vTemplatesList = ("" + $(viewContainderId).data("templates")).ifBlank("{}");
      var vTemplates = eval("(" + vTemplatesList + ")");
      /* Check the option to override */
      if ((!(_.isObject(spaRVOptions.dataTemplates))) && (_.isString(spaRVOptions.dataTemplates))) {
        spaRVOptions.dataTemplates = spa.toJSON(spaRVOptions.dataTemplates);
      }
      if (!$.isEmptyObject(spaRVOptions.dataTemplates)) {
        vTemplates = spaRVOptions.dataTemplates;
        vTemplatesList = "" + (JSON.stringify(vTemplates));
      }
      /* if Template list not provided in data-templates;
       * 1: Check options
       * 2: if not in options check data-template
       * */
      if ((!vTemplates) || ($.isEmptyObject(vTemplates))) {
        var xTemplatesList = "";
        if (spa.isBlank(spaRVOptions.dataTemplate)) {
          if (!spa.isBlank(vTemplate2RenderInTag)) {
            xTemplatesList = "{" + vTemplate2RenderInTag + ":''}";
          }
          else {
            xTemplatesList = "{spaDynTmpl" + (spa.now()) + (spa.rand(1000, 9999)) + ":''}";
          }
        }
        else {
          xTemplatesList = "{" + spaRVOptions.dataTemplate + ":''}";
        }
        vTemplates = eval("(" + xTemplatesList + ")");
      }
      spa.console.group("spaView");

      var dataTemplatesCollectionUrl = ("" + $(viewContainderId).data("templatesCollectionUrl")).replace(/undefined/, "");
      if (!spa.isBlank(spaRVOptions.dataTemplatesCollectionUrl)) {
        dataTemplatesCollectionUrl = spaRVOptions.dataTemplatesCollectionUrl;
      }
      if (!spa.isBlank(dataTemplatesCollectionUrl)) {
        var templateCollectionId = viewContainderId + "_TemplatesCollection";
        spa.loadTemplatesCollection(templateCollectionId, dataTemplatesCollectionUrl);
      }
      if (vTemplates && (!$.isEmptyObject(vTemplates))) {
        spa.console.info("Templates of [" + spaTemplateType + "] to be used in view container [" + viewContainderId + "] => " + JSON.stringify(vTemplates));
        var vTemplateNames = _.keys(vTemplates);

        spa.console.group("spaLoadingTemplates");

        /* Template Cache Begins: if false remove old templates */
        spa.console.group("spaLoadingTemplatesCache");
        if (!(useOptions && uOptions.hasOwnProperty('dataTemplatesCache'))) /* NOT provided in Render Request */
        { /* Read from view container [data-templates-cache='{true|false}'] */
          var templatesCacheInTagData = ("" + $(viewContainderId).data("templatesCache")).replace(/undefined/, "");
          if (!spa.isBlank(templatesCacheInTagData)) {
            spaRVOptions.dataTemplatesCache = templatesCacheInTagData.toBoolean();
            spa.console.info("Override [data-templates-cache] with [data-templates-cache] option in tag-attribute: " + spaRVOptions.dataTemplatesCache);
          }
        }
        else {
          spa.console.info("Override [data-templates-cache] with user option [dataTemplatesCache]: " + spaRVOptions.dataTemplatesCache);
        }
        spa.console.groupEnd("spaLoadingTemplatesCache");

        _.each(vTemplateNames, function (tmplId) {
          spaAjaxRequestsQue = spa.loadTemplate(tmplId, vTemplates[tmplId], spaTemplateType, viewContainderId, spaAjaxRequestsQue, !spaRVOptions.dataTemplatesCache);
        });

        var vTemplate2Render = (vTemplateNames[0].beginsWith("#") ? "" : "#") + vTemplateNames[0];
        if (spa.isBlank(spaRVOptions.dataTemplate)) { /* Check in data-template property if any */
          if (!spa.isBlank(vTemplate2RenderInTag)) {
            vTemplate2Render = ((vTemplate2RenderInTag).beginsWith("#") ? "" : "#") + vTemplate2RenderInTag;
          }
        }
        else { /* Check in Options if any */
          vTemplate2Render = ((spaRVOptions.dataTemplate).beginsWith("#") ? "" : "#") + spaRVOptions.dataTemplate;
        }
        /* Loading Primary Template if needed */
        var vTemplate2RenderName = vTemplate2Render.replace(/#/, "");
        if (vTemplatesList.indexOf(vTemplate2RenderName) < 0) {
          spaAjaxRequestsQue = spa.loadTemplate(vTemplate2RenderName, '', spaTemplateType, viewContainderId, spaAjaxRequestsQue, !spaRVOptions.dataTemplatesCache);
        }
        spa.console.info("External Data/Templates Loading Status: " + JSON.stringify(spaAjaxRequestsQue));
        spa.console.groupEnd("spaLoadingTemplates");

        /* Load Styles Begins */
        spa.console.group("spaLoadingViewStyles");
        if (!(useOptions && uOptions.hasOwnProperty('dataStylesCache'))) /* NOT provided in Render Request */
        { /* Read from view container [data-styles-cache='{true|false}'] */
          var stylesCacheInTagData = ("" + $(viewContainderId).data("stylesCache")).replace(/undefined/, "");
          if (!spa.isBlank(stylesCacheInTagData)) {
            spaRVOptions.dataStylesCache = stylesCacheInTagData.toBoolean();
            spa.console.info("Override [data-styles-cache] with [data-styles-cache] option in tag-attribute: " + spaRVOptions.dataStylesCache);
          }
        }
        else {
          spa.console.info("Override [data-styles-cache] with user option [dataStylesCache]: " + spaRVOptions.dataStylesCache);
        }
        var vStylesList = ("" + $(viewContainderId).data("styles")).ifBlank("{}");
        var vStyles = eval("(" + vStylesList + ")");
        /* Check the option to override */
        if (!$.isEmptyObject(spaRVOptions.dataStyles)) {
          vStyles = spaRVOptions.dataStyles;
        }
        if (vStyles && (!$.isEmptyObject(vStyles))) {
          spa.console.info("External styles to be loaded [cache:" + (spaRVOptions.dataStylesCache) + "] along with view container [" + viewContainderId + "] => " + JSON.stringify(vStyles));
          var vStylesNames = _.keys(vStyles);

          spa.console.group("spaLoadingStyles");
          _.each(vStylesNames, function (styleId) {
            spaAjaxRequestsQue = spa.loadStyle(styleId, vStyles[styleId], spaRVOptions.dataStylesCache, spaAjaxRequestsQue);
          });
          spa.console.info("External Styles Loading Status: " + JSON.stringify(spaAjaxRequestsQue));
          spa.console.groupEnd("spaLoadingStyles");
        }
        else {
          spa.console.info("No styles defined [data-styles] in view container [" + viewContainderId + "] to load.");
        }
        spa.console.groupEnd("spaLoadingViewStyles");
        /* Load Styles Ends */

        /*Scripts were loaded here...*/

        $.when.apply($, spaAjaxRequestsQue)
          .then(function () {

            spa.console.group("spaRender[" + spaRenderEngine + "*" + spaTemplateEngine + "] - spa.renderHistory[" + retValue.id + "]");
            spa.console.info("Rendering " + viewContainderId + " using master template: " + vTemplate2Render);
            $(viewContainderId).html("");
            try {
              retValue.model = spaTemplateModelData[viewDataModelName];
              var spaViewModel = spaTemplateModelData[viewDataModelName], compiledTemplate;
              switch (spaRenderEngine) {
                case "backbone"  :
                  if (!(isLocalDataModel && (!spa.isBlank(spaViewDataModelType)))) {
                    retValue.model = new Backbone.Model(retValue.model);
                    spaViewModel = retValue.model.toJSON();
                  }
                  break;

                default :
                  if (isLocalDataModel && (!spa.isBlank(spaViewDataModelType))) {
                    switch (spaViewDataModelType) {
                      case "backbone" :
                        spaViewModel = retValue.model.toJSON();
                        break;
                    }
                  }
                  break;
              }
              spa.viewModels[retValue.id] = retValue.model;

              var templateContentToBindAndRender = $(vTemplate2Render).html() || "";
              switch (spaTemplateEngine) {
                case "handlebar"  :
                case "handlebars" :
                  compiledTemplate = (Handlebars.compile(templateContentToBindAndRender))(spaViewModel);
                  break;

                case "underscore":
                  compiledTemplate = (_.template(templateContentToBindAndRender))(spaViewModel);
                  break;

                case "underscore-as-mustache" :
                  var tSettings = {
                      interpolate: /\{\{(.+?)\}\}/g  /* {{ title }}    => <strong>pancakes<strong> */
                    , escape: /\{\{\{(.+?)\}\}\}/g   /* {{{ title }}}  => &lt;strong&gt;pancakes&lt;strong&gt; */
                  };
                  compiledTemplate = _.template(templateContentToBindAndRender, spaViewModel, tSettings);
                  break;

                case "mustache" :
                  compiledTemplate = (Mustache.compile(templateContentToBindAndRender))(spaViewModel);
                  break;

                case "hogan" :
                  compiledTemplate = (Hogan.compile(templateContentToBindAndRender)).render(spaViewModel);
                  break;

                default :
                  compiledTemplate = templateContentToBindAndRender;
                  break;
              }
              switch (spaRenderEngine) {
                //Tobe removed
                case "backbone":
                { retValue.view = new (Backbone.View.extend({
                    el: viewContainderId
                    , render: function () {
                      this.$el.html(compiledTemplate);
                      return this;
                    }
                  }));
                  (retValue.view).render();
                }
                  break;

                default : /*others*/
                { retValue.view = compiledTemplate;
                  $(viewContainderId).html(retValue.view);
                }
                  break;
              }
              spa.console.info("Render: SUCCESS");
              var rhKeys = _.keys(spa.renderHistory);
              var rhLen = rhKeys.length;
              if (rhLen > spa.renderHistoryMax) {
                $.each(rhKeys.splice(0, rhLen - (spa.renderHistoryMax)), function (index, key) {
                  delete spa.renderHistory[key];
                });
              }
              retValue.cron = "" + spa.now();
              spa.renderHistory[retValue.id] = retValue;

              /*Reflow Foundation*/
              spa.reflowFoundation(viewContainderId);

              /*init KeyTracking*/
              spa.initKeyTracking();

              /*apply i18n*/
              spa.i18n.apply(viewContainderId);

              /*init spaRoute*/
              spa.initRoutes(viewContainderId);

              /*run callback if any*/
              var _fnCallbackAfterRender = ("" + $(viewContainderId).data("renderCallback")).replace(/undefined/, "");
              if (spaRVOptions.dataRenderCallback) {
                _fnCallbackAfterRender = spaRVOptions.dataRenderCallback;
              }
              spa.console.info("Processing callback: " + _fnCallbackAfterRender);
              if (_fnCallbackAfterRender) {
                var fnCallbackAfterRender = _fnCallbackAfterRender;
                if (_.isString(fnCallbackAfterRender)) {
                  fnCallbackAfterRender = spa.findSafe(window, fnCallbackAfterRender);
                }
                if (fnCallbackAfterRender) {
                  if (_.isFunction(fnCallbackAfterRender)) {
                    fnCallbackAfterRender.call(undefined, retValue);
                    //eval("("+fnCallbackAfterRender+"(retValue))");
                  } else {
                    spa.console.error("CallbackFunction <" + _fnCallbackAfterRender + " = " + fnCallbackAfterRender + "> is NOT a valid FUNCTION.");
                  }
                } else {
                  if (("" + _fnCallbackAfterRender).beginsWith("spa") && (("" + _fnCallbackAfterRender).endsWith("_renderCallback"))) {
                    spa.console.warn("Default Route renderCallback function <" + _fnCallbackAfterRender + "> is NOT defined.");
                  } else {
                    spa.console.error("CallbackFunction <" + _fnCallbackAfterRender + "> is NOT defined.");
                  }
                }
              }
              /*Deep/Child Render*/
              $("[data-render]", viewContainderId).spaRender();
            }
            catch (e) {
              spa.console.error("Error Rendering: " + e.message);
            }
            spa.console.groupEnd("spaRender[" + spaRenderEngine + "*" + spaTemplateEngine + "] - spa.renderHistory[" + retValue.id + "]");
          })
          .fail(function () {
            spa.console.error("External Data/Templates/Styles/Scripts Loading failed! Unexpected!! Check the template Path / Network. Rendering aborted.");
          }).done(spa.runOnceOnRender);
      }
      else {
        spa.console.error("No templates defined [data-templates] in view container [" + viewContainderId + "] to render. Check HTML markup.");
      }
      spa.console.groupEnd("spaView");
    }
    return (retValue);
  };

  spa.hasAutoRoutes = function(routeHash, operator){
    var elSelector = "[data-sparoute-default]"+(routeHash? "[href"+(operator?operator:"")+"='"+routeHash+"']" : "");
    return ($(elSelector).length > 0);
  };
  spa.routeCurLocHashAttemptDelaySec = 3;
  spa.routeCurLocHashAttempt=0;
  spa.routeCurLocHash = function(){
    var curLocHash = spa.getLocHash();
    if (isSpaHashRouteOn && curLocHash && (!curLocHash.equals(spa.routesOptions.defaultPageRoute)) && !spa.hasAutoRoutes(curLocHash)) {
      spa.console.info("Route current url-hash.");
      if (!spa.route(curLocHash)) {
        spa.console.warn("Current url-hash-route <"+curLocHash+"> FAILED and will try after "+spa.routeCurLocHashAttemptDelaySec+"sec.");
        if (spa.routeCurLocHashAttempt < 5) {
          spa.routeCurLocHashAttempt++;
          setTimeout(spa.routeCurLocHash, (spa.routeCurLocHashAttemptDelaySec*1000));
        } else {
          spa.console.error("5 attempts to route current url-hash failed. Aborting further attempts.");
        }
      }
    }
  };

  spa.finallyOnRender = [];
  spa.runOnceOnRenderFunctions = [spa.routeCurLocHash];
  spa.runOnceOnRender = function(){
    spa.console.info("Render Complete.");
    if ((spa.runOnceOnRenderFunctions && !_.isEmpty(spa.runOnceOnRenderFunctions)) || (spa.finallyOnRender && !_.isEmpty(spa.finallyOnRender)) ) {
      if (!spa.runOnceOnRenderFunctions) spa.runOnceOnRenderFunctions = [];
      if (!_.isArray(spa.runOnceOnRenderFunctions)) {
        spa.runOnceOnRenderFunctions = [spa.runOnceOnRenderFunctions];
      }
      if (_.isArray(spa.runOnceOnRenderFunctions)) {
        if (spa.finallyOnRender) {
          if (!_.isArray(spa.finallyOnRender)){ spa.finallyOnRender = [spa.finallyOnRender]; }
          spa.runOnceOnRenderFunctions = spa.runOnceOnRenderFunctions.concat(spa.finallyOnRender);
        }
        _.each(spa.runOnceOnRenderFunctions, function(fn, index){
          if (_.isFunction(fn)) fn();
        });
      }
      spa.finallyOnRender = spa.runOnceOnRenderFunctions = undefined;
    }
  };

  /* Internal wrapper for jQuery.spaRender */
  function __renderView(obj, opt) {
    var retValue;
    var viewContainderId = $(obj).attr("id");
    if (spa.isBlank(viewContainderId)) {
      viewContainderId = "spaViewContainer-" + (spa.now()) + "-" + spa.rand(1000, 9999);
      $(obj).attr("id", viewContainderId);
      spa.console.info("Render NewViewContainerID: " + viewContainderId);
    }
    if ((opt) && (!$.isEmptyObject(opt))) {
      retValue = spa.render("#" + viewContainderId, opt);
    }
    else {
      retValue = spa.render("#" + viewContainderId);
    }
    return retValue;
  }
  spa.reflowFoundation = function(context) {
    if ("Foundation" in window) $(context || document).foundation('reflow');
  };

  /* regex support on jQuery selector
   * http://james.padolsey.com/javascript/regex-selector-for-jquery/
   * */
  $.expr[':'].regex = function (elem, index, match) {
    var matchParams = match[3].split(','),
      validLabels = /^(data|css):/,
      attr = {
        method: matchParams[0].match(validLabels) ? matchParams[0].split(':')[0] : 'attr',
        property: matchParams.shift().replace(validLabels, '')
      },
      regexFlags = 'ig',
      regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
    return regex.test($(elem)[attr.method](attr.property));
  };


  /* Extend to jQuery as
   *
   * $("#viewContainer").spaRender({})
   *
   * OR
   *
   * $.spaRender("#viewContainer", {})
   *
   * */
  $.fn.extend({
    spaRender: function (opt) {
      this.each(function () {
        __renderView(this, opt);
      });
    }
  });
  $.extend({
    spaRender: function (obj, opt) {
      $(obj).spaRender(opt);
    }
  });

  spa.initDataValidation = function () {
    spa.console.log("include validate framework lib (spa-validate.js) to use this feature!");
  };
  spa.doDataValidation = function () {
    spa.console.log("include validate framework lib (spa-validate.js) to use this feature!");
  };

  spa.properties = {
    version: spa.VERSION
  };

  /* spaRoute
   * */
  spa.routes = {};
  spa.routesOptions = {
      useHashRoute: true
    , usePatterns:true
    , defaultPageRoute : ""
    , beforeRoute : ""
    , defaultTemplateExt : ".html"
    , loadDefaultScript:true
    , defaultRouteTargetContainerIdPrefix  : "routeContainer_"
    , defaultRouteTemplateContainerIdPrefix: "template_"
  };

  spa.routePatterns = {
    routes: []
    , register: undefined //Object of pattern and function eg. {name:"memberDetailsView", pattern:"#member/view?:memid", routeoptions:{}}
    , deregister: undefined //input [String | Array] of pattern
  };

  spa.routePatterns.register = function(rPatternOptions, overwrite) {
    //validate and Push {name:"xyz", pattern:"", routeoptions:{}}
    if (rPatternOptions && !_.isEmpty(rPatternOptions)) {
      var pushRoutePattern = function(rOptions, _overwrite) {
        if (_.has(rOptions, "pattern")){
          rOptions["pattern"] = rOptions["pattern"].replace(/\?/g, "\\?");

          if (!_.has(rOptions, "name")){
            rOptions['name'] = rOptions['pattern'].replace(/[^a-z0-9_]/gi, '');
          }
          if (!_.has(rOptions, "routeoptions")) {
            rOptions['routeoptions'] = {};
          }
          if (!_.find(spa.routePatterns.routes, {'pattern':rOptions['pattern']})){ //No Duplicate Pattern
            if (_.find(spa.routePatterns.routes, {'name':rOptions['name']})){ //If find duplicate name
              if (_overwrite) {
                spa.routePatterns.routes.push(rOptions);
              }
            } else {
              spa.routePatterns.routes.push(rOptions);
            }
          }
        }
      };

      if (_.isArray(rPatternOptions)){
        _.each(rPatternOptions, function(rOpt){
          pushRoutePattern(rOpt, overwrite);
        })
      } else if (_.isObject(rPatternOptions)) {
        pushRoutePattern(rPatternOptions, overwrite);
      } else {
        spa.console.error("Invalid RoutePattern Options. Provide Array/Object of RouteOptions");
      }
    } else {
      spa.console.error("Empty RoutePattern Options.");
    }
  };

  spa.routePatterns.deregister = function(rNamesOrPatterns){
    if (rNamesOrPatterns && !_.isEmpty(rNamesOrPatterns)) {
      var removeRoutePattern = function(rNameOrPattern){
        if (rNameOrPattern) {
          var indexOfNameOrPattern = _.findIndex(spa.routePatterns.routes, function(opt){
            return (opt.name == rNameOrPattern || opt.pattern == rNameOrPattern);
          });
          if (indexOfNameOrPattern>=0) {
            _.pullAt(spa.routePatterns.routes, indexOfNameOrPattern);
          } else {
            spa.console.error("Route Pattern Not Found for <"+rNameOrPattern+">");
          }
        }
      };

      if (_.isArray(rNamesOrPatterns)){
        _.each(rNamesOrPatterns, function(rNorP){
          removeRoutePattern(rNorP);
        })
      } else if (_.isString(rNamesOrPatterns)) {
        removeRoutePattern(rNamesOrPatterns);
      } else {
        spa.console.error("Invalid RoutePattern Name/Pattern. Provide Array/Name of RouteNames/Patterns");
      }
    }
  };

  spa.routeName = function(hashRoute){
    var _hashRoute = (hashRoute || spa.urlHash());
    if (_hashRoute.contains("\\?")) {
      _hashRoute = _hashRoute.split("?")[0];
    }
    return (_hashRoute.trimLeft("#")).replace(/[^a-z0-9]/gi,'_');
  };

  spa.routeContainerId = function(hashRoute){
    var routeTargetContainerPrefix = ((spa.routesOptions.defaultRouteTargetContainerIdPrefix).trimLeft("#"));
    return (routeTargetContainerPrefix+spa.routeName(hashRoute));
  };

  spa.routeTemplateId = function(hashRoute){
    var routeTargetContainerPrefix = ((spa.routesOptions.defaultRouteTemplateContainerIdPrefix).trimLeft("#"));
    return (routeTargetContainerPrefix+spa.routeName(hashRoute));
  };

  /*
    spa.routeRender = function(elRouteBase, routeOptions)
    elRouteBase  ==> valid jQuery element identifier
    routeOptions ==>
    { render                                    : false             //Optional; default: true; mention only to stop route
      target                                    : '#targetRenderID' //Optional; default: autoGeneratedHiddenContainer based on routePath
      templates                                 : '' or []          //Optional; default: pathFrom Route with extension; use '.' to load default template
      [ext | tmplext | tmplExt]                 : '.jsp'            //Optional; default: '.html'; html template extension with dot(.)
      [tmplengine | tmplEngine]                 : 'handlebars'      //Optional; default: 'handlebars'
      scripts                                   : '' or [] or false //Optional; default: same as templatePath with extension .js; use '.' to load default script
      [dataurl | dataUrl]                       : ''                //Optional; default: NO-DATA
      [after | callback | callBack]             : '' or function(){} or functionName //Optional: default: spa.routes.<ROUTE-PATH>_renderCallback
      [before | beforeroute | beforeRoute]      : '' or function(){} or functionName //Optional: default: spa.routesOptions.beforeRoute
    }
  */
  spa.routeRender = function(elRouteBase, routeOptions){
    var $elRouteBase = (elRouteBase)? $(elRouteBase) : undefined;

    var tagRouteOptions = ($elRouteBase)? ( (""+$elRouteBase.data("sparoute")) || "") : ("");
    if (   (tagRouteOptions.trim()).equalsIgnoreCase("false")
        || (tagRouteOptions.trim()).equalsIgnoreCase("no")
        || (tagRouteOptions.trim()).equalsIgnoreCase("off")
       ) tagRouteOptions = "quit:true";
    var oTagRouteOptions = (tagRouteOptions)? spa.toJSON(tagRouteOptions) : {};

    //Override with jsRouteOptions
    _.merge(oTagRouteOptions, routeOptions);

    if (oTagRouteOptions.hasOwnProperty("quit") && (oTagRouteOptions['quit'])) {
      return; //abort route
    }

    var routeNameWithPath = "#RouteNotDefinedInHREF";
    if ($elRouteBase) {
      routeNameWithPath = $elRouteBase.attr("href");
    } else if (routeOptions['urlhash']) {
      routeNameWithPath = routeOptions['urlhash']['url'];
    }
    routeNameWithPath = (routeNameWithPath).trimLeft("#");

    var routeParams = "";
    if (routeNameWithPath.contains("\\?")) {
      var _routeParts = routeNameWithPath.split("?");
      routeNameWithPath = _routeParts[0];
      routeParams = _routeParts[1];
    }
    var routeName = oTagRouteOptions['name'] || (spa.routeName(routeNameWithPath));
    if (spa.routes[routeName]) {
      spa.routes[routeName]($elRouteBase, routeParams, oTagRouteOptions);
    } else {
      spa.console.info("Route method <spa.routes."+routeName+"> NOT FOUND. Attempting to route using [data-sparoute] options.");

      var foundRouteTmplExt = (oTagRouteOptions.hasOwnProperty('ext')
      || oTagRouteOptions.hasOwnProperty('tmplext')
      || oTagRouteOptions.hasOwnProperty('tmplExt'));

      var foundRenderTarget = oTagRouteOptions['target'] && spa.isElementExist(oTagRouteOptions['target'])
        , renderTarget      = oTagRouteOptions['target'] || ("#"+spa.routeContainerId(routeName))
        , tmplExt           = (foundRouteTmplExt)? (oTagRouteOptions['ext'] || oTagRouteOptions['tmplext'] || oTagRouteOptions['tmplExt']) : (spa.routesOptions["defaultTemplateExt"]||"")
        , tmplEngine        = oTagRouteOptions['tmplengine'] || oTagRouteOptions['tmplEngine'] || ""
        , defaultTmplPath   = (routeNameWithPath+tmplExt+"?"+routeParams).trimRight("\\?")
        , defaultScriptPath = routeNameWithPath+".js"
        , defaultCallBeforeRoute = "spa.routes."+routeName+"_before"
        , defaultRenderCallback  = "spa.routes."+routeName+"_renderCallback"
        , spaRenderOptions = {
          dataRenderCallback : defaultRenderCallback
        };

      spa.console.log(renderTarget);
      /*Cache Settings*/
      if (oTagRouteOptions.hasOwnProperty("dataCache")) {
        spaRenderOptions['dataCache'] = oTagRouteOptions['dataCache'];
      }
      if (oTagRouteOptions.hasOwnProperty("templatesCache")) {
        spaRenderOptions['dataTemplatesCache'] = oTagRouteOptions['templatesCache'];
      }
      if (oTagRouteOptions.hasOwnProperty("scriptsCache")) {
        spaRenderOptions['dataScriptsCache'] = oTagRouteOptions['scriptsCache'];
      }

      /*Templates*/
      spaRenderOptions['dataTemplates'] = {};
      var tmplID= "__spaRouteTemplate_" + routeName;
      if (!oTagRouteOptions.hasOwnProperty("templates") || (oTagRouteOptions['templates'])) {
        var oTagRouteOptionsTemplates = oTagRouteOptions['templates'];
        var routeTemplateContainerID = "#"+spa.routeTemplateId(routeName);
        switch(true) {
          case (_.isString(oTagRouteOptionsTemplates)) :
            var tmplPath = oTagRouteOptionsTemplates.trim();
            if ((tmplPath).equalsIgnoreCase('.')) {
              tmplPath = defaultTmplPath;
            } else if ((tmplPath).equalsIgnoreCase('#')) {
              tmplPath = routeTemplateContainerID;
            }
            spaRenderOptions.dataTemplates[tmplID] = tmplPath.ifBlank("none");
            break;
          case (_.isArray(oTagRouteOptionsTemplates)) :
            if (_.indexOf(oTagRouteOptionsTemplates, '.')>=0) { //Include default path-template (external)
              spaRenderOptions.dataTemplates[tmplID+"_dot"] = defaultTmplPath;
              _.pull(oTagRouteOptionsTemplates, '.');
            }
            if (_.indexOf(oTagRouteOptionsTemplates, '#')>=0) { //Include route hash-template (internal)
              spaRenderOptions.dataTemplates[tmplID+"_hash"] = routeTemplateContainerID;
              _.pull(oTagRouteOptionsTemplates, '#');
            }
            _.each(oTagRouteOptionsTemplates, function(templateUrl, sIndex){
              spaRenderOptions.dataTemplates[tmplID + '_'+(sIndex+1)] = templateUrl.ifBlank("none");
            });
            break;
          default:
            spaRenderOptions.dataTemplates[tmplID] = defaultTmplPath;
            break;
        }
      } else {
        spa.console.warn("Route without template");
        spaRenderOptions.dataTemplates[tmplID] = "none";
      }
      if (tmplEngine) {
        spaRenderOptions['dataTemplateEngine'] = tmplEngine;
      }
      /*Scripts*/
      if (!oTagRouteOptions.hasOwnProperty("scripts") || (oTagRouteOptions['scripts'])) {
        spaRenderOptions['dataScripts'] = {};
        var scriptID = "__spaRouteScript_" + routeName;
        switch(true) {
          case (_.isString(oTagRouteOptions['scripts'])) :
            spaRenderOptions.dataScripts[scriptID] = (_.indexOf(oTagRouteOptions['scripts'], '.')>=0)? defaultScriptPath : oTagRouteOptions['scripts'];
            break;
          case (_.isArray(oTagRouteOptions['scripts'])) :
            if (_.indexOf(oTagRouteOptions['scripts'], '.')>=0) { //Include default script
              spaRenderOptions.dataScripts[scriptID] = defaultScriptPath;
              _.pull(oTagRouteOptions['scripts'], '.');
            }
            _.each(oTagRouteOptions['scripts'], function(scriptUrl, sIndex){
              spaRenderOptions.dataScripts[scriptID + '_'+(sIndex+1)] = scriptUrl;
            });
            break;
          default:
            if (spa.routesOptions.loadDefaultScript) {
              spaRenderOptions.dataScripts[scriptID] = defaultScriptPath;
            } else {
              spa.console.warn("Script(s) not included. Use <spa.routesOptions.loadDefaultScript = true> to load default script <"+defaultScriptPath+">.");
            }
            break;
        }
        spa.console.log(spaRenderOptions['dataScripts']);
      }
      /*Data and Params*/
      if (oTagRouteOptions['dataUrl'] || oTagRouteOptions['dataurl']) {
        var tagDataUrl = oTagRouteOptions['dataurl'] || oTagRouteOptions['dataUrl'];
        var spaRenderDataUrls = spa.toRenderDataStructure(tagDataUrl, routeParams);
        if (!_.isEmpty(spaRenderDataUrls)) {
          _.merge(spaRenderOptions, spaRenderDataUrls);
        }
      }
      /*Callback*/
      var overrideDefaultCallback = (  oTagRouteOptions.hasOwnProperty('after')
      || oTagRouteOptions.hasOwnProperty('callback')
      || oTagRouteOptions.hasOwnProperty('callBack'));
      if (overrideDefaultCallback || oTagRouteOptions['after'] || oTagRouteOptions['callback'] || oTagRouteOptions['callBack']) {
        spaRenderOptions['dataRenderCallback'] = oTagRouteOptions['after'] || oTagRouteOptions['callback'] || oTagRouteOptions['callBack'];
      }
      /*owverride Options with Target elements property if any*/
      if (foundRenderTarget && !renderTarget.contains("spaRouteContainer_")) {
        //Read spaRender options from target element and override(ie. delete) above options
        var $elTarget = $(oTagRouteOptions['target']);
        if ($elTarget.data('url')) {
          delete spaRenderOptions['dataUrl'];
        }
        if ($elTarget.data('templates')) {
          delete spaRenderOptions['dataTemplates'];
        }
        if ($elTarget.data('scripts')) {
          delete spaRenderOptions['dataScripts'];
        }
        if ($elTarget.data('templateEngine')) {
          delete spaRenderOptions['dataTemplateEngine'];
        }
        if ($elTarget.data('renderCallback')) {
          delete spaRenderOptions['dataRenderCallback'];
        }
      }
      /*before Render function to modify options*/

      spa.console.info("Route Render Options Before preRenderProcess:");
      spa.console.info(spaRenderOptions);
      var beforeRenderOptions = {};
      var fnToRunBefore = oTagRouteOptions['before'] || oTagRouteOptions['beforeroute'] || oTagRouteOptions['beforeRoute'] || spa.routesOptions["beforeRoute"];
      spa.console.info("callBeforeRoute: "+fnToRunBefore);
      if (fnToRunBefore) {
        if (!_.isFunction(fnToRunBefore) && _.isString(fnToRunBefore)) {
          if (fnToRunBefore.equals(defaultCallBeforeRoute)) { //TODO: why?
            //cancel default route-before-function
            defaultCallBeforeRoute = undefined; //TODO: why?
          }
          fnToRunBefore = spa.findSafe(window, fnToRunBefore);
        }
        if (_.isFunction(fnToRunBefore)){
          beforeRenderOptions = fnToRunBefore.call(undefined, {el:$elRouteBase, target:renderTarget, renderOptions:spaRenderOptions, routeOptions:oTagRouteOptions});
          if (_.isObject(beforeRenderOptions)) _.merge(spaRenderOptions, beforeRenderOptions);
        } else {
          spa.console.error("CallBeforeRouteFunction <"+oTagRouteOptions['before']+"> NOT FOUND.");
        }
      }
      if (defaultCallBeforeRoute) {
        fnToRunBefore = spa.findSafe(window, defaultCallBeforeRoute);
        if (fnToRunBefore && _.isFunction(fnToRunBefore)) {
          beforeRenderOptions = fnToRunBefore.call(undefined, {el:$elRouteBase, target:renderTarget, renderOptions:spaRenderOptions, routeOptions:oTagRouteOptions});
          if (_.isObject(beforeRenderOptions)) _.merge(spaRenderOptions, beforeRenderOptions);
        }
      }

      spa.console.info("Route Render Options After preRenderProcess:");
      spa.console.info(spaRenderOptions);
      /*Ready to spaRender*/
      if ((!spaRenderOptions.hasOwnProperty("render") || (spaRenderOptions['render'])) &&
        (!oTagRouteOptions.hasOwnProperty("render") || (oTagRouteOptions['render']))) {
        spa.render(renderTarget, spaRenderOptions);
      }
    }//End of Route

    return true;
  };

  /*
    spa.route(el); //el = HTML element with href=#RoutePath?key=value&key=value
    spa.route(el, routeOptions); //el with Options
    spa.route("#RoutePath?key=value&key=value");
    spa.route("#RoutePath?key=value&key=value", routeOptions); //routePath with Options

    //routeOptions
    { render                                    : false             //Optional; default: true; mention only to stop route
      target                                    : '#targetRenderID' //Optional; default: autoGeneratedHiddenContainer based on routePath
      templates                                 : '' or []          //Optional; default: pathFrom Route with extension; use '.' to load default template
      [ext | tmplext | tmplExt]                 : '.jsp'            //Optional; default: '.html'; html template extension with dot(.)
      [tmplengine | tmplEngine]                 : 'handlebars'      //Optional; default: 'handlebars'
      scripts                                   : '' or [] or false //Optional; default: same as templatePath with extension .js; use '.' to load default script
      [dataurl | dataUrl]                       : ''                //Optional; default: NO-DATA
      [after | callback | callBack]             : '' or function(){} or functionName //Optional: default: spa.routes.<ROUTE-PATH>_renderCallback
      [before | beforeroute | beforeRoute]      : '' or function(){} or functionName //Optional: default: spa.routesOptions.beforeRoute
    }
  */
  spa.route = function(elRouteBase, routeOptions){
    //spa.debugger.on();
    if (_.isString(elRouteBase) && spa.isBlank((""+elRouteBase).trim("#")) ) {
      return false; //BlankHash
    }

    var foundRouteElBase = !_.isString(elRouteBase);
    routeOptions = routeOptions || {};

    if (!foundRouteElBase) { //Find element with given route or create one with same route
      var elWithRoute = $("[data-sparoute][href='"+elRouteBase+"']");
      foundRouteElBase = !_.isEmpty(elWithRoute);
      if (!foundRouteElBase) {
        spa.console.warn("Route source element NOT FOUND for route <"+elRouteBase+">");
        if (spa.routesOptions.usePatterns) {
          spa.console.info("Searching RoutePattern.");
          var rPatternRouteOptions;
          var indexOfNameOrPattern = _.findIndex(spa.routePatterns.routes, function(opt){
            var matchFound=false;
            var _routeMatch = spa.routeMatch(opt.pattern, elRouteBase);
            if (_routeMatch) {
              matchFound = true;
              rPatternRouteOptions = _.merge({}, opt['routeoptions'] || {});
              rPatternRouteOptions['urlhash'] = {pattern:(opt.pattern).replace(/\\\?/g, '?') , url:elRouteBase, urlParams:_routeMatch};
            }
            return matchFound;
          });

          if (indexOfNameOrPattern<0) {
            spa.console.warn("Pattern not found.");
            spa.console.info(spa.routePatterns.routes);
          } else {
            spa.console.info(rPatternRouteOptions);
            spa.routeRender(undefined, rPatternRouteOptions);
          }
        } else {
          spa.console.warn("Pattern match Disabled.");
        }
      } else {
        elRouteBase = elWithRoute.get(0);
      }
    }

    if (!foundRouteElBase) {
      if (routeOptions['forceroute'] || routeOptions['forceRoute']) {
        spa.console.warn("Attempt dynamic route.");
        foundRouteElBase = true;
        elRouteBase = $("<a href='"+elRouteBase+"'></a>").get(0);
      } else {
        spa.console.warn("Exit Route.");
        return false; //exit;
      }
    }
    //spa.debugger.off();
    if (foundRouteElBase){
      return spa.routeRender(elRouteBase, routeOptions);
    }// if foundRouteElBase
  };

  spa.initRoutes = function(routeInitScope, routeInitOptions) {
    if (typeof routeInitScope == "object") {
      routeInitOptions = routeInitScope;
      routeInitScope = routeInitOptions["context"] || routeInitOptions["scope"] || "";
    }
    if (routeInitOptions) {
      spa.console.info("Init routesOptions");
      _.merge(spa.routesOptions, routeInitOptions);

      if (!isSpaHashRouteOn && spa.routesOptions.useHashRoute) spa._initWindowOnHashChange();
      if (isSpaHashRouteOn && !spa.routesOptions.useHashRoute) spa._stopWindowOnHashChange();

      //options without (context or scope)
      if (!(routeInitOptions.hasOwnProperty('context') || routeInitOptions.hasOwnProperty('scope'))) {
        return;
      }
    }

    spa.console.info("Init spaRoutes. Scan for [data-sparoute] in context: <"+(routeInitScope||"body")+">");
    $(routeInitScope||"body").find("[data-sparoute]").each(function(index, el){

      if (!spa.isBlank((($(el).attr("href") || "")+"#").split("#")[1])) {
        $(el).off("click");
        $(el).on("click", function() {
          if (isSpaHashRouteOn) {
            var elHash  = "#"+(((($(el).attr("href") || "")+"#").split("#")[1]).trim("#"));
            var winHash = spa.getLocHash();
            if (elHash.equals(winHash)){
              spa.route(this);
            }
          } else {
            spa.route(this);
          }
        });

        if (el.hasAttribute("data-sparoute-default")) {
          spa.route(el);
        }
      }
    });
  };

  $(document).ready(function(){
    /*onLoad Set spa.debugger on|off using URL param*/
    spa.debug = spa.urlParam('spa.debug') || spa.hashParam('spa.debug') || spa.debug;

    /*Reflow Foundation*/
    spa.reflowFoundation();

    /*Init spaRoutes*/
    spa.initRoutes();

    /*Extending Backbone*/
    spa.extendBackbone();

    /*Key Tracking*/
    spa.initKeyTracking();

    /*Auto Render*/
    spa.console.info("Find and Render [data-render]");
    $("[data-render]").spaRender();
  });

})(this);

spa.console.info("SPAjs loaded.");