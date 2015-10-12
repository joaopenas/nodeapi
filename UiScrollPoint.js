angular.module('ui.scrollpoint', []).directive('uiScrollpoint', ['$window', function ($window) {

    function getWindowScrollTop() {
        if (angular.isDefined($window.pageYOffset)) {
            return $window.pageYOffset;
        } else {
            var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ? document.documentElement : document.body;
            return iebody.scrollTop;
        }
    }
    return {
        require: '^?uiScrollpointTarget',
        link: function (scope, elm, attrs, uiScrollpointTarget) {
            var absolute = true,
                shift = 0,
                fixLimit,
                $target = uiScrollpointTarget && uiScrollpointTarget.$element || angular.element($window);

            if (!attrs.uiScrollpoint) {
                absolute = false;
            } else if (typeof (attrs.uiScrollpoint) === 'string') {
        
                if (attrs.uiScrollpoint.charAt(0) === '-') {
                    absolute = false;
                    shift = -parseFloat(attrs.uiScrollpoint.substr(1));
                } else if (attrs.uiScrollpoint.charAt(0) === '+') {
                    absolute = false;
                    shift = parseFloat(attrs.uiScrollpoint.substr(1));
                }
            }

            fixLimit = absolute ? attrs.uiScrollpoint : elm[0].offsetTop + shift;

            function onScroll() {

                var limit = absolute ? attrs.uiScrollpoint : elm[0].offsetTop + shift;

                var offset = uiScrollpointTarget ? $target[0].scrollTop : getWindowScrollTop();
                if (!elm.hasClass('ui-scrollpoint') && offset > limit) {
						//Pass bootstrap class in attribute ui-scroll-class
                    if (attrs.uiScrollclass && (typeof (attrs.uiScrollpoint) === 'string')) {
                        elm.addClass(attrs.uiScrollclass);
                    } else {
                        elm.addClass('ui-scrollpoint');
                    }
                    fixLimit = limit;
                } else if (elm.hasClass('ui-scrollpoint') && offset < fixLimit) {
                    elm.removeClass('ui-scrollpoint');
                }
                if (elm.hasClass(attrs.uiScrollclass) && offset < fixLimit) {
                    elm.removeClass(attrs.uiScrollclass);
                }
            }

            $target.on('scroll', onScroll);
            onScroll(); // sets the initial state

            // Unbind scroll event handler when directive is removed
            scope.$on('$destroy', function () {
                $target.off('scroll', onScroll);
            });
        }
    };
    }]).directive('uiScrollpointTarget', [function () {
    return {
        controller: ['$element', function ($element) {
            this.$element = $element;
                }]
    };
    }]);