// Init Left Menu
function initMetisMenu() {
    $("#side-menu").metisMenu({
        hashtag: true
    });
}

// Init Responsivity Left Menu
function initEnlarge() {
    if (window.innerWidth < 1200) {
        $('body').addClass('enlarged');
		var buttonMenuMobile = document.getElementById("button-menu-mobile");
		if (typeof buttonMenuMobile !== 'undefined' && buttonMenuMobile !== null) {
	        buttonMenuMobile.setAttribute("aria-expanded", false);
		}
    } 
    else if (!$("body").hasClass("enlarged--fix")) {
        $('body').removeClass('enlarged');
		var buttonMenuMobile = document.getElementById("button-menu-mobile");
		if (typeof buttonMenuMobile !== 'undefined' && buttonMenuMobile !== null) {
	        buttonMenuMobile.setAttribute("aria-expanded", true);
		}
        
    } else {
		// console.log('> checkpoint {ien.104}');
		var buttonMenuMobile = document.getElementById("button-menu-mobile");
		if (typeof buttonMenuMobile !== 'undefined' && buttonMenuMobile !== null) {
	        buttonMenuMobile.setAttribute("aria-expanded", false);
		}
	}

    var scrollTimeout;
    var throttle = 100

    $(window).on('resize', function () {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function () {
                if (window.innerWidth < 1200) {
                    $('body').addClass('enlarged');
                    toggleAriaExpanded("button-menu-mobile");
                } else if (!$("body").hasClass("enlarged--fix")) {
                    $('body').removeClass('enlarged');
                    toggleAriaExpanded("button-menu-mobile");
                }
                scrollTimeout = null;
            }, throttle);
        }
    });
}

// Init Scrolling Left Menu
function initSlimscrollMenu() {
    //SimpleScrollbar.initEl(document.querySelector('.slimscroll-menu'))
    $('.slimscroll-menu').slimscroll({
        height: 'auto',
        position: 'right',
        size: "10px",
        color: '#9ea5ab',
        railVisible: true,
        alwaysVisible: true,
        disableFadeOut: true,
        wheelStep: 5,
        railColor: '#777777',
    });
}

// Init Collapse Left Menu
function initLeftMenuCollapse() {
	var buttonMenuMobileEpochClick = 0;
    $('.button-menu-mobile').on('click', function (event) {
        event.preventDefault();
		if ((Date.now() - buttonMenuMobileEpochClick) < 1000) {
			// console.log('> ONCLICK already called');
			return;
		}
		buttonMenuMobileEpochClick = Date.now();
		// console.log('> .button-menu-mobile.onClick() begins...');

        if (window.innerWidth < 1200) { 
            $("body").toggleClass("enlarged");
        }
        else if (window.innerWidth > 1200 && $("body").hasClass("enlarged--fix")) {

            if (window.innerWidth > 1200 && window.innerWidth < 1500) {
                // jAlert('Based on the size of your screen, the left menu might take up too much space, and distort the layout of the page. <br> Tip: Use CTRL - on your keyboard to adjust the display of your pages.', 'Hi!');
            }

            $("body").toggleClass("enlarged");
            $("body").toggleClass("enlarged--fix");
            saveSettings("student-menu-enlarged--fix", 0);
        }
        else {
            $("body").toggleClass("enlarged");
            $("body").toggleClass("enlarged--fix");
            saveSettings("student-menu-enlarged--fix", 1);
        }

        toggleAriaExpanded("button-menu-mobile");

        // Keyboard Click - We focus on the first element in the sidebar-menu.
        var doThis = false;
        if (doThis) {
            // Yorick asked to not do this
            if (event.screenX == 0 && event.screenY == 0) {
                document.getElementById("sidebar-menu").getElementsByTagName("a")[0].focus();
            }
        }

		setTimeout(function () {
			$('.button-menu-mobile').focus();
		}, 100);        
		// console.log('> .button-menu-mobile.onClick() ends!');
    });
	$('.button-menu-mobile').on('keyup', function (event) {
		event.preventDefault();
		// console.log('.button-menu-mobile.keyup() begins...');
		// console.log('.button-menu-mobile.keyup() event.which=' + event.which);
		if (event.which === 13 || event.which === 32) {
			// console.log('> ENTER or SPACE pressed...');
			$('.button-menu-mobile').click();
		}
		// console.log('.button-menu-mobile.keyup() ends!');
    });
}



// JS for left side menu
(function ($) {

    'use strict';

    function init() {
        initMetisMenu();
        initSlimscrollMenu();
        initLeftMenuCollapse();
        initEnlarge();
    }

    init();

})(jQuery)

