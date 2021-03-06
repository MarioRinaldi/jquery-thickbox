/*
** Thickbox 4.1 - One Box To Rule Them All.
** https://github.com/Coffeebreakers/jquery-thickbox
** By Mario Felipe Rinaldi
** By Douglas Castilho
**
** Based on thickbox 3.1
** By Cody Lindley (http://www.codylindley.com)
** Copyright (c) 2007 cody lindley
** Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
**
** Change-log
**
** 4.0 - Better way to determine position
** 4.1 - new way to middle modal (waiting) on form submit
**
**/

var tb_pathToImage = "/img/ico/ico_waiting.gif";

/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/

//on page load call tb_init
$(document).ready(function() {
	tb_init('a.thickbox, area.thickbox, input.thickbox');//pass where to apply thickbox
	imgLoader = new Image();// preload image
	imgLoader.src = tb_pathToImage;
});

//add thickbox to href & area elements that have a class of .thickbox
function tb_init(domChunk) {
	$(domChunk).click(function() {
		var t = this.title || this.name || null,
			a = this.href || this.alt,
			g = this.rel || false;
		tb_show(t, a, g, p);
		this.blur();
		return false;
	});
}

//function called when the user clicks on a thickbox link
function tb_show(caption, url, imageGroup, pos) {
	try {
		if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
			$("body", "html").css({height: "100%", width: "100%"});
			$("html").css("overflow", "hidden");
			if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
				$("body").append("<iframe id='TB_HideSelect' src='javascript:false;'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
				$("#TB_overlay").click(tb_remove);
			}
		} else {//all others
			if (document.getElementById("TB_overlay") === null) {
				$("body").append("<div id='TB_overlay'></div><div id='TB_window'></div>");
				$("#TB_overlay").click(tb_remove);
			}
		}

		if (tb_detectMacXFF()) {
			$("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
		} else {
			$("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
		}

		if (caption === null) {
			caption = "";
		}
		//hack
		$("body").append("<div id='TB_load' style='background:url(" + imgLoader.src + ") center center no-repeat;'></div>");//add loader to the page
		$('#TB_load').show();//show loader

		var baseURL;
		if (url.indexOf("?") !== -1) { //ff there is a query string involved
			baseURL = url.substr(0, url.indexOf("?"));
		} else {
			baseURL = url;
		}

		var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/,
			urlType = baseURL.toLowerCase().match(urlString);

		if (urlType === '.jpg' || urlType === '.jpeg' || urlType === '.png' || urlType === '.gif' || urlType === '.bmp') {//code to show images

			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if (imageGroup) {
				TB_TempArray = $("a[@rel=" + imageGroup + "]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
					if (!(TB_TempArray[TB_Counter].href === url)) {
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
						TB_imageCount = "Image " + (TB_Counter + 1) + " of " + (TB_TempArray.length);
					}
				}
			}

			imgPreloader = new Image();
			imgPreloader.onload = function() {
				imgPreloader.onload = null;

				// Resizing large images - orginal by Christian Montoya edited by me.
				var pagesize = tb_getPageSize(),
					x = pagesize[0] - 150,
					y = pagesize[1] - 150,
					imageWidth = imgPreloader.width,
					imageHeight = imgPreloader.height;
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
				$("#TB_window").append("<a href='' id='TB_ImageOff' title='fechar'><img id='TB_Image' src='" + url + "' width='" + imageWidth + "' height='" + imageHeight + "' alt='" + caption + "'/></a>" + "<div id='TB_caption'>" + caption + "<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='fechar'>fechar</a></div>");

				$("#TB_closeWindowButton").click(tb_remove);


				if (!(TB_PrevHTML === "")) {
					goPrev = function () {
						if ($(document).unbind("click", goPrev)) {
							$(document).unbind("click", goPrev);
						}
						$("#TB_window").remove();
						$("body").append("<div id='TB_window'></div>");
						tb_show(TB_PrevCaption, TB_PrevURL, imageGroup);
						return false;
					};
					$("#TB_prev").click(goPrev);
				}

				if (!(TB_NextHTML === "")) {
					goNext = function () {
						$("#TB_window").remove();
						$("body").append("<div id='TB_window'></div>");
						tb_show(TB_NextCaption, TB_NextURL, imageGroup);
						return false;
					};
					$("#TB_next").click(goNext);
				}

				document.onkeydown = function (e) {
					if (e === null) { // ie
						keycode = event.keyCode;
					} else { // mozilla
						keycode = e.which;
					}
					if (keycode === 27) { // close
						tb_remove();
					} else if (keycode === 190) { // display previous image
						if (!(TB_NextHTML === "")) {
							document.onkeydown = "";
							goNext();
						}
					} else if (keycode === 188) { // display next image
						if (!(TB_PrevHTML === "")) {
							document.onkeydown = "";
							goPrev();
						}
					}
				};

				tb_position(pos);
				$("#TB_load").remove();
				$("#TB_ImageOff").click(tb_remove);
				$("#TB_window").css({display:"block"}); //for safari using css instead of show
			};
			imgPreloader.src = url;
		} else {//code to show html
				var queryString = url.replace(/^[^\?]+\??/,'');
				var params = tb_parseQuery( queryString );
				TB_PARAMS = params;

				TB_WIDTH = (params.width * 1) + 30 || 630; //defaults to 630 if no paramaters were added to URL
				TB_HEIGHT = (params.height * 1) + 40 || 440; //defaults to 440 if no paramaters were added to URL
				ajaxContentW = TB_WIDTH - 30;
				ajaxContentH = TB_HEIGHT - 45;

				if (url.indexOf('TB_iframe') !== -1) {// either iframe or ajax window
					urlNoQuery = url.split('&TB_');
					$("#TB_iframeContent").remove();
					if (params.modal !== "true") {//iframe no modal
						$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='fechar'>fechar</a></div></div><iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent'  onload='tb_showIframe()' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;' > </iframe>");
					} else {//iframe modal
						$("#TB_overlay").unbind();
						$("#TB_window").append("<iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;'> </iframe>");
					}
				} else {// not an iframe, ajax
					if ($("#TB_window").css("display") !== "block") {
						if (params.modal !== "true") {//ajax no modal
							$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='fechar'>fechar</a></div></div><div id='TB_ajaxContent' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px'></div>");
						} else {//ajax modal
							$("#TB_overlay").unbind();
							$("#TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");
						}
					} else {//this means the window is already up, we are just loading new content via ajax
						$("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
						$("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
						$("#TB_ajaxContent")[0].scrollTop = 0;
						$("#TB_ajaxWindowTitle").html(caption);
					}
				}

				$("#TB_closeWindowButton").click(tb_remove);

				if (url.indexOf('TB_inline') !== -1) {
					$("#TB_ajaxContent").append($('#' + params.inlineId).children());
					$("#TB_window").unload(function () {
						$('#' + params.inlineId).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
					});

					tb_position(pos);
					$("#TB_load").remove();
					$("#TB_window").css({display:"block"});
				} else if (url.indexOf('TB_iframe') !== -1){
					tb_position(pos);
					if ($.browser.safari) {//safari needs help because it will not fire iframe onload
						$("#TB_load").remove();
						$("#TB_window").css({display:"block"});
					}
				} else {
					$("#TB_ajaxContent").load(url += "&random=" + (new Date().getTime()),function () {//to do a post change this load method
						tb_position(pos);
						$("#TB_load").remove();
						tb_init("#TB_ajaxContent a.thickbox");
						$("#TB_window").css({display:"block"});
					});
				}
		}

			if (!params.modal) {
				document.onkeyup = function(e) {
					if (e === null) { // ie
						keycode = event.keyCode;
					} else { // mozilla
						keycode = e.which;
					}
					if (keycode === 27) { // close
						tb_remove();
					}
				};
			}

	} catch(e) { /*nothing here*/ }
}

//helper functions below
function tb_showIframe() {
	$("#TB_load").remove();
	$("#TB_window").css({display:"block"});
}

function tb_remove(callback) {
	$("#TB_imageOff").unbind("click");
	$("#TB_closeWindowButton").unbind("click");
	$("#TB_window").fadeOut("fast", function() {
		if (jQuery.browser.msie) {
			setTimeout(function() {
				$('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();
			} , 200);
		} else {
			$('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();
		}
	});
	$("#TB_load").remove();

	document.onkeydown = "";
	document.onkeyup = "";
	//hack
	if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
		$("html").css("overflow", "");
	}

	if (typeof callback === "function") {
		callback();
	}
}

function tb_position(p) {
	$("#TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
	if (!(jQuery.browser.msie && jQuery.browser.version < 7)) { // take away IE6
		var space = 10;
		document.domain = "uol.com.br";
		if (parent.length > 0) { // verifica se está dentro de um frame
			// deslocamento do iframe no pai em relação ao topo
			try {
				if (jQuery.browser.msie && jQuery.browser.version <= 8) {
					if (typeof top.window.frames['office-desktop'] === "object") {
						iframeFather = 'office-desktop';
					} else if (typeof top.window.frames['email-bpos'] === "object") {
						iframeFather = 'email-bpos';
					} else if (typeof top.window.frames['cloud-computing'] === "object") {
						iframeFather = 'cloud-computing';
					} else {
						iframeFather = 'iframe-content';
					}

					var parentIframe = parseInt(top.window.frames[iframeFather].screenTop,10) - top.window.screenTop;
				} else {
					if (top.document.getElementById('office-desktop')) {
						iframeFather = 'office-desktop';
					} else if (top.document.getElementById('email-bpos')) {
						iframeFather = 'email-bpos';
					} else if (top.document.getElementById('cloud-computing')) {
						iframeFather = 'cloud-computing';
					} else {
						iframeFather = 'mainContainer';
					}
					var parentIframe = top.document.getElementById(iframeFather).offsetTop;//.offsetTop;
				}
			} catch(e) {
				parentIframe = 250;
			}

			// valor do deslocamento do pai em relação ao topo
			var pos = top.window.pageYOffset || top.document.documentElement.scrollTop || top.document.body.scrollTop;
			pos = pos - parentIframe;

			// área visivel
			var wh = top.window.innerHeight || window.top.document.documentElement.clientHeight;

			// altura do iframe
			var iframeHeight = document.getElementsByTagName("html")[0].offsetHeight;

			// espaço visual a ser deslocado
			if (wh >= TB_HEIGHT) {
				space = parseInt((wh - TB_HEIGHT) / 2 ,10);
			}

			// deslocamento logico dentro do iframe
			if (pos + space > 0 ) {
				pos += space;
			} else {
				pos = 10;
			}

			// posiciona o modal corretamente, caso deslocamento + altura do modal for maior que a área útil do iframe
			if (parent && pos+TB_HEIGHT > iframeHeight) {
				pos = iframeHeight - TB_HEIGHT - 10;
				//parent.scrollTo(0,pos);
			}

			$("#TB_window").css({/*marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px',*/ top:pos +'px'});
		} else {
			$("#TB_window").css({marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px'});
		}
	}
}

function tb_parseQuery (query) {
	var Params = {};
	if (!query) {return Params;} // return empty object
	var Pairs = query.split(/[;&]/);
	for (var i = 0; i < Pairs.length; i++) {
		var KeyVal = Pairs[i].split('=');
		if (! KeyVal || KeyVal.length != 2) {continue;}
		var key = unescape( KeyVal[0] ),
			val = unescape( KeyVal[1] );
		val = val.replace(/\+/g, ' ');
		Params[key] = val;
	}
	return Params;
}

function tb_getPageSize () {
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}

function tb_detectMacXFF () {
	var userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
		return true;
	}
}

function tb_waiting () {
	if (typeof(TB_PARAMS) === "object") {
		$('#'+TB_PARAMS['inlineId']).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
		$('#TB_window').remove();
	} else {
		TB_HEIGHT = 100;
		TB_WIDTH = 500;
	}
	var div_wait_msg = $('<div id="TB_ajaxContent" />').append('<p>Aguarde</p>');
	var div_wait_window = $('<div  id="TB_window" />').append(div_wait_msg);
	$('body').append(div_wait_window);
	$("#TB_window").css({
		'height':TB_HEIGHT+'px'
	});
	$("#TB_ajaxContent").css({
		'background':'url('+tb_pathToImage+') no-repeat 0 0',
		'margin':  parseInt(((TB_HEIGHT - 35) / 2),10) +'px auto 0',
		'width': '110px'
	});
	$("#TB_window p").css({
		'font':'bold 20px arial',
		'color': '#333232',
		'margin-left': '25px',
		'float': 'left'
	});
	$("#TB_window img").css({
		'float': 'left'
	});
	$('#TB_window').show();
	tb_position(null);
}