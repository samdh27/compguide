/*------------------------------------*\
    @UTILITIES
\*------------------------------------*/
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? 
    function (obj) {
        return typeof obj;
    } 
    : 
    function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function hasActiveChild(element) {
  return $(element).parent().find('.active').length > 0;
}


var Util = function ($) {
    // eslint-disable-line no-shadow
    var TRANSITION_END = 'transitionend';

    var Util = { // eslint-disable-line no-shadow
        TRANSITION_END: 'mmTransitionEnd',

        triggerTransitionEnd: function triggerTransitionEnd(element) {
            $(element).trigger(TRANSITION_END);
        },
        supportsTransitionEnd: function supportsTransitionEnd() {
            return Boolean(TRANSITION_END);
        }
    };

    function getSpecialTransitionEndEvent() {
        return {
            bindType: TRANSITION_END,
            delegateType: TRANSITION_END,
            handle: function handle(event) {
                if ($(event.target).is(this)) {
                    return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
                }
                return undefined;
            }
        };
    }

    function transitionEndEmulator(duration) {
        var _this = this;

        var called = false;

        $(this).one(Util.TRANSITION_END, function () {
            called = true;
        });

        setTimeout(function () {
            if (!called) {
                Util.triggerTransitionEnd(_this);
            }
        }, duration);

        return this;
    }

    function setTransitionEndSupport() {
        $.fn.mmEmulateTransitionEnd = transitionEndEmulator; // eslint-disable-line no-param-reassign
        // eslint-disable-next-line no-param-reassign
        $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
    }

    setTransitionEndSupport();

    return Util;
}($);

var MetisMenu = function ($) {
    // eslint-disable-line no-shadow
    var NAME = 'metisMenu';
    var DATA_KEY = 'metisMenu';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';
    var JQUERY_NO_CONFLICT = $.fn[NAME];
    var TRANSITION_DURATION = 350;

    var Default = {
        toggle: true,
        preventDefault: true,
        activeClass: 'active',
        collapseClass: 'collapse',
        collapseInClass: 'in',
        collapsingClass: 'collapsing',
        triggerElement: 'a',
        parentTrigger: 'li',
        subMenu: 'ul',
        hashtag: false,
        url: '',
        ajaxContainerId: ''
    };

    var Event = {
        SHOW: 'show' + EVENT_KEY,
        SHOWN: 'shown' + EVENT_KEY,
        HIDE: 'hide' + EVENT_KEY,
        HIDDEN: 'hidden' + EVENT_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    var MetisMenu = function () {
        // eslint-disable-line no-shadow
        function MetisMenu(element, config) {
            _classCallCheck(this, MetisMenu);

            this.element = element;
            this.config = _extends({}, Default, config);
            this.transitioning = null;

            this.init();
        }

        _createClass(MetisMenu, [{
            key: 'init',
            value: function init() {
                var self = this;
                var conf = this.config;
                var matchingMenuElement = $(self.getActiveLink());

                // First Load
                if (matchingMenuElement != null) {
                    matchingMenuElement.addClass("active");
                    matchingMenuElement.parent().addClass("active"); // add active to li of the current link
                    matchingMenuElement.parent().parent().addClass("in");
                    matchingMenuElement.parent().parent().prev().addClass("active"); // add active class to an anchor
                    matchingMenuElement.parent().parent().parent().addClass("active");
                }

                //Create hashchange binding
                $(window).on('hashchange', function (e, hasActiveChild) {
                    matchingMenuElement = $(self.getActiveLink());

                    if (matchingMenuElement === null || matchingMenuElement.length === 0) {
                        //Menu not found.
                    } else {
                        var isRootElement = !matchingMenuElement.parent().parent().hasClass("nav-second-level");

                        if (isRootElement) {
                            var List = matchingMenuElement.parent("li").siblings("li").children("ul.in");
                            self.hide(List);
                        } else {
                            if (!matchingMenuElement.parent("li").parent("ul").hasClass("in")) {
                                self.show(matchingMenuElement.parent("li").parent("ul"));
                                const transitionSidebarEvent = new CustomEvent('transitionSidebar');
                                document.dispatchEvent(transitionSidebarEvent);
                            } else if (hasActiveChild) {
                                //Hide parent if already shown.
                                self.hide(matchingMenuElement.parent("li").parent("ul"));
                                matchingMenuElement.parent("li").removeClass("active");
                                const transitionSidebarEvent = new CustomEvent('transitionSidebar');
                                document.dispatchEvent(transitionSidebarEvent);
                                return;
                            }
                        }

                        self.deactivateActiveElement();
                        self.activateElement(matchingMenuElement);
                    }
                });

                //
                // adjust aria content of parent menu container
                //
                if (typeof linkElement !== 'undefined' && linkElement !== null) {
                    updateLeftNavigationParentMenuAriaAttributes(linkElement);
                }

            }
        }, {
            key: 'activateElement',
            value: function activateElement(element) {
                element.addClass("active").parent().addClass("active").parent().prev().addClass("active");
                element.parent().parent().parent().addClass("active").parent().parent().addClass("active");
            }
        }, {
            key: 'deactivateActiveElement',
            value: function deactivateActiveElement() {
                var element = $("#sidebar-menu a.axid.active");
                element.removeClass("active").parent().removeClass("active").parent().prev().removeClass("active").parent().removeClass("active");
            }
        }, {
            key: 'getActiveLink',
            value: function getActiveLink() {
                let self = this;
                let potentialMatchingMenuElements = $("#" + self.element.id + " a[href^='" + new URL(location.href).pathname + "']");
                let matchingMenuElements = [];
                Array.from(potentialMatchingMenuElements).forEach(item => { 
                    if ((new URL(location.href).pathname + new URL(location.href).search).indexOf(item.attributes.href.value) >= 0) {
                        matchingMenuElements.push(item);
                    }
                });

                if (matchingMenuElements.length != 0) {
                    return matchingMenuElements.reduce(function (a, b) { return a.getAttribute("href").length > b.getAttribute("href").length ? a : b; });
                }
                else {
                    let defaultMenuElement = $("#side-menu a[href^='" + $("body").attr("data-menu") + "']");
                    if (defaultMenuElement.length != 0) { 
                        return Array.from(defaultMenuElement).reduce(function (a, b) { return $(a).parentsUntil("#" + self.element.id).length >= $(b).parentsUntil("#" + self.element.id).length ? a : b; });
                    }
                    else {
                        return null;
                    }
                }
            }
        }, {
            key: 'show',
            value: function show(element) {
                var _this2 = this;

                if (this.transitioning || $(element).hasClass(this.config.collapsingClass)) {
                    return;
                }
                var elem = $(element);

                var startEvent = $.Event(Event.SHOW);
                elem.trigger(startEvent);

                if (startEvent.isDefaultPrevented()) {
                    return;
                }

                elem.parent(this.config.parentTrigger).addClass(this.config.activeClass);

                if (this.config.toggle) {
                    this.hide(elem.parent(this.config.parentTrigger).siblings().children(this.config.subMenu + '.' + this.config.collapseInClass).attr('aria-expanded', false));
                }

                elem.removeClass(this.config.collapseClass).addClass(this.config.collapsingClass).height(0);

                this.setTransitioning(true);

                var complete = function complete() {
                    // check if disposed
                    if (!_this2.config || !_this2.element) {
                        return;
                    }
                    elem.removeClass(_this2.config.collapsingClass).addClass(_this2.config.collapseClass + ' ' + _this2.config.collapseInClass).height('').attr('aria-expanded', true);

                    _this2.setTransitioning(false);

                    elem.trigger(Event.SHOWN);
                };

                if (!Util.supportsTransitionEnd()) {
                    complete();
                    return;
                }

                elem.height(element[0].scrollHeight).one(Util.TRANSITION_END, complete).mmEmulateTransitionEnd(TRANSITION_DURATION);
            }
        }, {
            key: 'hide',
            value: function hide(element) {
                var _this3 = this;

                if (this.transitioning || !$(element).hasClass(this.config.collapseInClass)) {
                    return;
                }

                var elem = $(element);

                var startEvent = $.Event(Event.HIDE);
                elem.trigger(startEvent);

                if (startEvent.isDefaultPrevented()) {
                    return;
                }

                elem.parent(this.config.parentTrigger).removeClass(this.config.activeClass);
                // eslint-disable-next-line no-unused-expressions
                elem.height(elem.height())[0].offsetHeight;

                elem.addClass(this.config.collapsingClass).removeClass(this.config.collapseClass).removeClass(this.config.collapseInClass);

                this.setTransitioning(true);

                var complete = function complete() {
                    // check if disposed
                    if (!_this3.config || !_this3.element) {
                        return;
                    }
                    if (_this3.transitioning && _this3.config.onTransitionEnd) {
                        _this3.config.onTransitionEnd();
                    }

                    _this3.setTransitioning(false);
                    elem.trigger(Event.HIDDEN);

                    elem.removeClass(_this3.config.collapsingClass).addClass(_this3.config.collapseClass).attr('aria-expanded', false);
                };

                if (!Util.supportsTransitionEnd()) {
                    complete();
                    return;
                }

                if (elem.height() === 0 || elem.css('display') === 'none') {
                    complete();
                } else {
                    elem.height(0).one(Util.TRANSITION_END, complete).mmEmulateTransitionEnd(TRANSITION_DURATION);
                }
            }
        }, {
            key: 'setTransitioning',
            value: function setTransitioning(isTransitioning) {
                this.transitioning = isTransitioning;
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                $.removeData(this.element, DATA_KEY);

                $(this.element).find(this.config.parentTrigger).has(this.config.subMenu).children(this.config.triggerElement).off('click');

                this.transitioning = null;
                this.config = null;
                this.element = null;
            }
        }], [{
            key: 'jQueryInterface',
            value: function jQueryInterface(config) {
                // eslint-disable-next-line func-names
                return this.each(function () {
                    var $this = $(this);
                    var data = $this.data(DATA_KEY);
                    var conf = _extends({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config ? config : {});

                    if (!data && /dispose/.test(config)) {
                        this.dispose();
                    }

                    if (!data) {
                        data = new MetisMenu(this, conf);
                        $this.data(DATA_KEY, data);
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config]();
                    }
                });
            }
        }]);

        return MetisMenu;
    }();
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = MetisMenu.jQueryInterface; // eslint-disable-line no-param-reassign
    $.fn[NAME].Constructor = MetisMenu; // eslint-disable-line no-param-reassign
    $.fn[NAME].noConflict = function () {
        // eslint-disable-line no-param-reassign
        $.fn[NAME] = JQUERY_NO_CONFLICT; // eslint-disable-line no-param-reassign
        return MetisMenu.jQueryInterface;
    };
    return MetisMenu;
}($);

// ----------------------------------------------------------------------------------
// update left menu expandable elements after state change (or after initial load complete)
// - set aria-expanded=true/false depending on state and append message to aria-label when expanded
//   ... This item is currently expanded.
// ----------------------------------------------------------------------------------
function updateLeftNavigationParentMenuAriaAttributes(jqLinkElement) {

    // console.log('updateLeftNavigationParentMenuAriaAttributes() begins...');

    if (typeof jqLinkElement === 'undefined' || jqLinkElement === null) {
        console.error('jqLinkElement is empty');
        return;
    }

    var eZero = $(jqLinkElement).get(0);
    var pZero = jqLinkElement.parent().parent().prev();
    if (typeof pZero !== 'undefined' && pZero !== null) {
        var eParentMenu = $(pZero).get(0);
        if (typeof eParentMenu !== 'undefined' && eParentMenu !== null) {

            var eParentMenuAriaLabel = eParentMenu.getAttribute('aria-label');
            if (typeof eParentMenuAriaLabel === 'undefined' || eParentMenuAriaLabel === null) {
                eParentMenuAriaLabel = '';
            }

            if (eParentMenu.classList.contains('active')) {
                eParentMenu.setAttribute('aria-expanded', 'true');
                var sx = eParentMenuAriaLabel.indexOf('This item is');
                if (sx > 0) {
                    eParentMenuAriaLabel = eParentMenuAriaLabel.substring(0, sx).trim();
                }
                eParentMenuAriaLabel = eParentMenuAriaLabel + ' This item is currently expanded.';
            } else {
                eParentMenu.setAttribute('aria-expanded', 'false');
                eParentMenu.setAttribute('aria-expanded', 'true');
                var sx = eParentMenuAriaLabel.indexOf('This item is');
                if (sx > 0) {
                    eParentMenuAriaLabel = eParentMenuAriaLabel.substring(0, sx).trim();
                }
                eParentMenuAriaLabel = eParentMenuAriaLabel + ' This item is currently collapsed.';
            }

            eParentMenu.setAttribute('aria-label', eParentMenuAriaLabel);
        }
    }
}