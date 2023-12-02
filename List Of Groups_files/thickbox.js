/*
 * Thickbox 3.1 - One Box To Rule Them All.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Patched Version by Jamie Thompson - Fixes IE7 Positioning Issues
 * http://jamazon.co.uk/web/2008/03/17/thickbox-31-ie7-positioning-bug/
*/

var tb_pathToImage = "/images/loader-big.gif";

// fixes the fact that ie7 now reports itself as MSIE 6.0 compatible
//$.browser.msie6 =
//        $.browser.msie
//        && /MSIE 6\.0/i.test(window.navigator.userAgent)
//        && !/MSIE 7\.0/i.test(window.navigator.userAgent)
//		&& !/MSIE 8\.0/i.test(window.navigator.userAgent);


//on page load call tb_init
$(document).ready(function(){
	tb_init('a.thickbox, area.thickbox, input.thickbox');//pass where to apply thickbox
	imgLoader = new Image();// preload image
	imgLoader.src = tb_pathToImage;
	document.dispatchEvent(new CustomEvent('thickbox-loaded', { detail: { }}));
});

//add thickbox to href & area elements that have a class of .thickbox

//var header;

function tb_init(domChunk) {
    $(domChunk).click(function () {
        var t = this.title || this.name || null;
        var a = this.href || this.alt;
        var g = this.rel || false;
        tb_show(t, a, g);
		// !!! MM Addition on 4/2013 - Add this back to new library if update is done. !!!!
        if ($(this).hasClass('thickboxWhite')) { setWhiteThickbox(); }
        this.blur();
        return false;
    }).removeClass('thickbox');
}

function tb_show(caption, url, imageGroup) {//function called when the user clicks on a thickbox link
    try {
        // IE 6
		if (typeof document.body.style.maxHeight === "undefined") {
			$("body","html").css({height: "100%", width: "100%"});
			$("html").css("overflow","hidden");
			if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
			    $("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay' onclick='tb_remove();'></div><div id='TB_window'></div>");
			}
		}
        // Not IE6
		else {
		    if (document.getElementById("TB_overlay") === null) {
		        $("body").append("<div id='TB_overlay' onclick='tb_remove();'></div><div id='TB_window'></div>");
			}
		}

		if(tb_detectMacXFF()){
			$("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
		}else{
			$("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
		}

		if (caption === null) { caption = ""; }
		$("body").append("<div id='TB_load'><img src='"+imgLoader.src+"' /></div>");//add loader to the page
		$('#TB_load').show();//show loader

	    var baseURL;
	    if(url.indexOf("?")!==-1){ //ff there is a query string involved
		    baseURL = url.substr(0, url.indexOf("?"));
	    }else{
	   	    baseURL = url;
	    }

	    var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
	    var urlType = baseURL.toLowerCase().match(urlString);

		if(urlType == '.jpg' || urlType == '.jpeg' || urlType == '.png' || urlType == '.gif' || urlType == '.bmp'){//code to show images
			var queryString = url.replace(/^[^\?]+\??/,'');
			var params = tb_parseQuery( queryString );
			TB_WIDTH = Math.min(params['width'] || window.innerWidth, window.innerWidth); //Defaults to 100% if no paramaters were added to URL
			TB_HEIGHT = Math.min(params['height'] || window.innerHeight, window.innerHeight); //Defaults to 100% if no paramaters were added to URL
			TB_POSITION = params['position'] || ""
      		TB_onThickboxClose = params['onThickboxClose'] || ""

			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if(imageGroup){
				TB_TempArray = $("a[@rel="+imageGroup+"]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
						if (!(TB_TempArray[TB_Counter].href == url)) {
							if (TB_FoundURL) {
								TB_NextCaption = TB_TempArray[TB_Counter].title;
								TB_NextURL = TB_TempArray[TB_Counter].href;
								TB_NextHTML = "<span id='TB_next'>&nbsp;&nbsp;<a href='#'>Next &gt;</a></span>";
							} else {
								TB_PrevCaption = TB_TempArray[TB_Counter].title;
								TB_PrevURL = TB_TempArray[TB_Counter].href;
								TB_PrevHTML = "<span id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Prev</a></span>";
							}
						} else {
							TB_FoundURL = true;
							TB_imageCount = "Image " + (TB_Counter + 1) +" of "+ (TB_TempArray.length);
						}
				}
			}

			imgPreloader = new Image();
			imgPreloader.onload = function(){
			imgPreloader.onload = null;

			// Resizing large images - orginal by Christian Montoya edited by me.
			var pagesize = tb_getPageSize();
			var x = pagesize[0] - 150;
			var y = pagesize[1] - 150;
			var imageWidth = imgPreloader.width;
			var imageHeight = imgPreloader.height;
			if (imageWidth > x) {
				imageHeight = imageHeight * (x / imageWidth);
				imageWidth = x;
				if (imageHeight > y) {
					imageWidth = imageWidth * (y / imageHeight);
					imageHeight = y;
				}
			} else if (imageHeight > y) {
				imageWidth = imageWidth * (y / imageHeight);
				imageHeight = y;
				if (imageWidth > x) {
					imageHeight = imageHeight * (x / imageWidth);
					imageWidth = x;
				}
			}
			// End Resizing

			TB_WIDTH = imageWidth + 30;
			TB_HEIGHT = imageHeight + 60;
			$("#TB_window").append("<img id='TB_Image' src='"+url+"' width='"+imageWidth+"' height='"+imageHeight+"' alt='"+caption+"'/>" + "<div id='TB_caption'>"+caption+"<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a> or Esc Key</div>");

			$("#TB_closeWindowButton").click(tb_remove);

			if (!(TB_PrevHTML === "")) {
				function goPrev(){
					if($(document).unbind("click",goPrev)){$(document).unbind("click",goPrev);}
					$("#TB_window").remove();
					$("body").append("<div id='TB_window'></div>");
					tb_show(TB_PrevCaption, TB_PrevURL, imageGroup);
					return false;
				}
				$("#TB_prev").click(goPrev);
			}

			if (!(TB_NextHTML === "")) {
				function goNext(){
					$("#TB_window").remove();
					$("body").append("<div id='TB_window'></div>");
					tb_show(TB_NextCaption, TB_NextURL, imageGroup);
					return false;
				}
				$("#TB_next").click(goNext);

			}

			document.onkeydown = function(e){
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				}
				else if(keycode == 190){ // display previous image
					if(!(TB_NextHTML == "")){
						document.onkeydown = "";
						goNext();
					}
				} else if(keycode == 188){ // display next image
					if(!(TB_PrevHTML == "")){
						document.onkeydown = "";
						goPrev();
					}
				}
			};

			tb_position();
			$("#TB_load").remove();
			$("#TB_Image").click(tb_remove);
			$("#TB_window").css({display:"block"}); //for safari using css instead of show
			};

			imgPreloader.src = url;
		}
        // Show HTML
		else {
			var queryString = url.replace(/^[^\?]+\??/,'');
			var params = tb_parseQuery( queryString );
			TB_WIDTH = Math.min(params['width'] || window.innerWidth, window.innerWidth); //Defaults to 100% if no paramaters were added to URL
			TB_HEIGHT = Math.min(params['height'] || window.innerHeight, window.innerHeight); //Defaults to 100% if no paramaters were added to URL
			TB_POSITION = params['position'] || ""
      		TB_onThickboxClose = params['onThickboxClose'] || ""
			ajaxContentW = TB_WIDTH;
			ajaxContentH = TB_HEIGHT;

			if (url.indexOf('TB_iframe') != -1) {// either iframe or ajax window
					urlNoQuery = url.split('TB_');
					$("#TB_iframeContent").remove();
					if(params['modal'] != "true"){ //iframe no modal
						$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='javascript:void()'  id='TB_closeWindowButton' title='Close'>close</a> or Esc Key</div></div><iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW)+"px;height:"+(ajaxContentH)+"px;' > </iframe>");
					}
					// I-Frame & Modal
					else {
					    $("#TB_overlay").unbind();
						$("#TB_window").append("<iframe frameborder='0' hspace='0' src='" + urlNoQuery[0] + "' id='TB_iframeContent' name='TB_iframeContent" + Math.round(Math.random()*1000) + "' onload='tb_showIframe()' style='width:100%;height:100%;'></iframe>");
					}					
			}
			else {// not an iframe, ajax
					console.log("Not Iframe");
					if($("#TB_window").css("display") != "block"){
						if(params['modal'] != "true"){//ajax no modal
						    $("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>" + caption + "</div><div id='TB_closeAjaxWindow'><a href='javascript:void(0);' id='TB_closeWindowButton'>close</a> or Esc Key</div></div><div id='TB_ajaxContent' style='width:" + ajaxContentW + "px;height:" + ajaxContentH + "px'></div>");
						}else{//ajax modal
						$("#TB_overlay").unbind();
						$("#TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");
						}
					}else{//this means the window is already up, we are just loading new content via ajax
						$("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
						$("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
						$("#TB_ajaxContent")[0].scrollTop = 0;
						$("#TB_ajaxWindowTitle").html(caption);
					}
			}

			if (params['refresh'] == "true") {
			    $("#TB_closeWindowButton").click(function (tb_remove) {
			        parent.location.reload(true);
			    });
			}
			else {
			    $("#TB_closeWindowButton").click(tb_remove);
			}

			if (url.indexOf('TB_inline') != -1) {
				$("#TB_ajaxContent").append($('#' + params['inlineId']).children());
				$("#TB_window").unload(function () {
					$('#' + params['inlineId']).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
				});
				tb_position();
				$("#TB_load").remove();
				$("#TB_window").css({display:"block"});
			} else if (url.indexOf('TB_iframe') != -1) {
			    tb_position();
			    // Safari needs help because it will not fire iframe onload
				if ($.browser.safari) {
					$("#TB_load").remove();
					$("#TB_window").css({display:"block"});
				}

			} else {
				$("#TB_ajaxContent").load(url += "&random=" + (new Date().getTime()),function(){//to do a post change this load method
					tb_position();
					$("#TB_load").remove();
					tb_init("#TB_ajaxContent a.thickbox");
					$("#TB_window").css({ display: "block" });
				});
			}
		}

		
		document.onkeyup = function(e){
			if (e == null) { // ie
				keycode = event.keyCode;
			} else { // mozilla
				keycode = e.which;
			}
			if(keycode == 27){ // close
				tb_remove();
			}
		};

        lockKeyboardInsideThickbox();

	} catch(e) {
		//nothing here
	}
}

//helper functions below
function tb_showIframe(){
    $("#TB_load").remove();
    $("#TB_window").css({ display: "block" });

    tb_in_animation();
}

function tb_remove() {

    // Javascript function to run on close.
    if (TB_onThickboxClose !== "") {
        parent[TB_onThickboxClose]();
    }

 	$("#TB_imageOff").unbind("click");
 	$("#TB_closeWindowButton").unbind("click");

 	tb_out_animation();

 	$("#TB_window").fadeOut("fast", function () {
 	    $('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();
 	});
	$("#TB_load").remove();
	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html").css({height: "auto", width: "auto"});
		$("html").css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
    unlockKeyboardOnThickboxClose();
	return true;
}

 function tb_remove2() {
  	$("#TB_imageOff").unbind("click");
	$("#TB_overlay").unbind("click");
 	$("#TB_closeWindowButton").unbind("click");
	$("#TB_window").fadeOut("fast",function(){$('#TB_window,#TB_overlay,#TB_HideSelect').remove();});
	$("#TB_window").fadeOut("fast",function(){$('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();});
 	$("#TB_load").remove();
 	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
 		$("body","html").css({height: "auto", width: "auto"});
 		$("html").css("overflow","");
 	}
 	document.onkeydown = "";
	document.onkeyup = "";
 	return false;
 }

 function tb_position() {
    $("#TB_window").css({ marginLeft: '-' + parseInt((TB_WIDTH / 2), 10) + 'px', marginTop: '-' + parseInt((TB_HEIGHT / 2), 10) + 'px', width: TB_WIDTH + 'px', height: TB_HEIGHT + 'px' });

     // Custom Position
    if (TB_POSITION === "right") {
        $("#TB_window").css({ marginLeft: '0', left: 'initial', right: '0', marginRight: '-' + parseInt(TB_WIDTH, 10) + 'px', transition: 'all .3s ease-out' });
    }
    else if (TB_POSITION === "left") {
        $("#TB_window").css({ marginLeft: '-' + parseInt(TB_WIDTH, 10) + 'px', left: '0', transition: 'all .3s ease-out' });
    }
    else if (TB_POSITION === "top") {
        $("#TB_window").css({ marginTop: '-' + parseInt(TB_HEIGHT, 10) + 'px', top: '0', transition: 'all .3s ease-out' });
    }
    else if (TB_POSITION === "bottom") {
        $("#TB_window").css({ marginTop: '0', top: 'initial', bottom: '0', marginBottom: '-' + parseInt(TB_HEIGHT, 10) + 'px', transition: 'all .3s ease-out' });
    }
}

 function tb_in_animation() {
     // Custom Position In Animation
    if (TB_POSITION === "right") {
        window.setTimeout(function () {
            $("#TB_window").css({ marginRight: '0px' });
        }, 100);
    }
    else if (TB_POSITION === "left") {
        window.setTimeout(function () {
            $("#TB_window").css({ marginLeft: '0px' });
        }, 100);
    }
    else if (TB_POSITION === "top") {
        window.setTimeout(function () {
            $("#TB_window").css({ marginTop: '0px' });
        }, 100);
    }
    else if (TB_POSITION === "bottom") {
        window.setTimeout(function () {
            $("#TB_window").css({ marginBottom: '0px' });
        }, 100);
    }

 }

 function tb_out_animation() {
     // Custom Position In Animation
     if (TB_POSITION === "right") {
             $("#TB_window").css({ marginRight: '-' + parseInt(TB_WIDTH, 10) + 'px' });
     }
     else if (TB_POSITION === "left") {
             $("#TB_window").css({ marginLeft: '-' + parseInt(TB_WIDTH, 10) + 'px' });
     }
     else if (TB_POSITION === "top") {
             $("#TB_window").css({ marginTop: '-' + parseInt(TB_HEIGHT, 10) + 'px' });
     }
     else if (TB_POSITION === "bottom") {
             $("#TB_window").css({ marginBottom: '-' + parseInt(TB_HEIGHT, 10) + 'px' });
     }

 }

function tb_parseQuery ( query ) {
   var Params = {};
   if ( ! query ) {return Params;}// return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function tb_getPageSize(){
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}

function tb_detectMacXFF() {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
    return true;
  }
}

function setFocusThickboxIframe() {
	var iframe = $("#TB_iframeContent");
    if (iframe.length > 0) iframe[0].contentWindow.focus();    
}

//Addition escape key function
$('#TB_iframeContent').ready(function(){

    setTimeout(function(){
        $(window).keyup(function(e){
                  if(e.keyCode == 27){
                    $('#TB_closeWindowButton').click();
          }
            });
        }, 50);

});
