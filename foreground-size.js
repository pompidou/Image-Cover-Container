/*!
 *	NAME:			foreground-size.js
 *	AUTHOR:			Frank Frick
 *	CREATED DATE:	20.05.2014
 *	UPDATED DATE:	14.07.2014
 *	VERSION:		0.4
 *	DESCRIPTION:	A small jQuery plugin which resizes an image/element inside
 *					its parent element with CSS background-size or manually via calculation.
 *					It respects the elements aspect ratio. (the latter approach needs
 *					a data attribute on the container with the elements aspect ratio)
 *	DEPENDENCIES:	jQuery 1.11.1
 *	CREDITS:		Calculation algorithm based on: http://nanotux.com/plugins/fullscreenr/index.html
 *	MARKUP:			<div class="example-container" data-ratio="1.78">
 *						<img src="example-image">
 *					</div>
 *	USAGE:			FgSize.create({
 *						elements: $('.example-container')
 *					});
 *	TO DO:			* (Picture element support, srcset support)
 *					* (Calced sizing styles in style tag)
 *					* (Add css transitions on resize)
 */

(function($) {



	'use strict';



	window.FgSize = (function() {
		var defaultSettings = {
			elements:				undefined,
			childSelector:			'img',
			sizing:					'cover', // or 'contain' / 'containX' / 'containY'
			// hasTransition:			false,
			useCssBgSize:			true,
			bgSizeSupported:		('backgroundSize' in document.documentElement.style),
			// useStyleElement:		false,
			addRequiredCssWithJs:	true,
			resizeWait:				100
		};

		var Module = function($el, settings) {
			var s					= settings;
			var $window				= $(window);
			var $container			= $el;
			var $child;
			var ratio;
			var isBgSizingUsed;
			var isTerminated		= false;


			var init = function() {
				findChild();

				if (s.useCssBgSize && $child.get(0).tagName === 'IMG') {
					if (s.bgSizeSupported) {
						attachBg();
					}
					else {
						sizeChild();
					}
				}
				else {
					sizeChild();
				}
			};

			var attachBg = function() {
				var $img = $child;
				var imgSrc = $img.attr('src');
				var backgroundSizeValue;
				isBgSizingUsed = true;

				if (s.addRequiredCssWithJs) {
					$container.css({
						'background-position': 'center center',
						'background-repeat': 'no-repeat'
					});
				}

				switch (s.sizing) {
					case 'contain':
						backgroundSizeValue = s.sizing;
						break;

					case 'containX':
						backgroundSizeValue = '100% auto';
						break;

					case 'containY':
						backgroundSizeValue = 'auto 100%';
						break;

					case 'cover':
						backgroundSizeValue = s.sizing;
						break;

					default:
						throw 'foreground-size.js: Invalid sizing property.';
				}

				$img.css('display', 'none');
				$el.css({
					backgroundImage:	'url(' + imgSrc + ')',
					backgroundSize:		backgroundSizeValue
				});
			};

			var sizeChild = function() {
				var pos;
				isBgSizingUsed = false;
				ratio = $container.data('ratio');

				if (ratio === undefined) {
					console.log('foreground-size.js: Missing data-ratio attribute.');
				}

				if (s.addRequiredCssWithJs) {
					pos = $container.css('position');
					$container.css('overflow', 'hidden');
					if (pos !== 'fixed' && pos !== 'absolute' && pos !== 'relative') {
						$container.css('position', 'relative');
					}
					$child.css({
						'position': 'absolute',
						'max-width': 'none',
						'max-height': 'none'
					});
				}

				calcSize();
				$window.on('resize.fgSize', _.throttle(doOnResize, s.resizeWait));
			};

			// the magic
			var calcSize = function() {
				var containerW	= $container.width();
				var containerH	= $container.height();

				var childW;
				var childH;
				var childTop;
				var childLeft;

				// scale
				var levelWidth = function() {
					childW = containerW;
					childH = containerW / ratio;
				};
				var levelHeight = function() {
					childW = containerH * ratio;
					childH = containerH;
				};

				switch (s.sizing) {
					case 'contain':
						if ((containerW / containerH) < ratio) {
							levelWidth();
						}
						else {
							levelHeight();
						}
						break;

					case 'containX':
						levelWidth();
						break;

					case 'containY':
						levelHeight();
						break;

					case 'cover':
						if ((containerW / containerH) < ratio) {
							levelHeight();
						}
						else {
							levelWidth();
						}
						break;

					default:
						throw 'foreground-size.js: Invalid sizing property.';
				}

				// center
				childTop	= (containerH - childH) / 2;
				childLeft	= (containerW - childW) / 2;

				// assign new values
				$child.css(
					{
						width	: childW,
						height	: childH,
						top		: childTop,
						left	: childLeft
					}
				);
			};

			var doOnResize = function() {
				// Prevent code of being executed after plugin instance is stopped.
				// Because the resize event is delayed an thus acts asynchronously.
				if (!isTerminated) {
					calcSize();
				}
			};

			var findChild = function() {
				$child = $container.find(s.childSelector).first();
			};

			/*!
			 *	if child element is exchanged, this method updates to the new one
			 */
			var updateChild = function() {
				findChild();
				if (isBgSizingUsed) {
					attachBg();
				}
				else {
					$window.off('resize.fgSize');
					sizeChild();
				}
			};

			var terminate = function() {
				isTerminated = true;
				$window.off('resize.fgSize');
				$container.attr('style', '');
				$child.attr('style', '');
			};


			return {
				init: init,
				updateChild: updateChild,
				terminate: terminate
			};
		};

		var create = function(settings) {
			settings = $.extend({}, defaultSettings, settings);
			if (settings.elements !== undefined) {
				settings.elements.each(function() {
					var $el = $(this);
					if (!$el.data('fg-size')) {
						var instance = new Module($el, settings);
						instance.init();
						$el.data('fg-size', instance);
					}
				});
			}
		};

		var update = function($elements) {
			$elements.each(function() {
				var $el = $(this);
				if ($el.data('fg-size')) {
					$el.data('fg-size').updateChild();
				}
			});
		};

		var destroy = function($elements) {
			$elements.each(function() {
				var $el = $(this);
				if ($el.data('fg-size')) {
					$el.data('fg-size').terminate();
					$el.removeData('fg-size');
				}
			});
		};

		return {
			create: create,
			update: update,
			destroy: destroy
		};
	}());



	// HELPHERS
	// -------------------------------------------------------------------------

	var _ = {}; // my underscore.js, source: http://underscorejs.org/
	// A (possibly faster) way to get the current timestamp as an integer.
	_.now = Date.now || function() { return new Date().getTime(); };
	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
	_.throttle = function(func, wait, options) {
		var context, args, result;
		var timeout = null;
		var previous = 0;
		options || (options = {});
		var later = function() {
			previous = options.leading === false ? 0 : _.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};
		return function() {
			var now = _.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};



}(jQuery));