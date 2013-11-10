/**
 *	
 *	AUTHOR: 		Frank Frick
 *	DATE: 			1.11.2013
 *	VERSION: 		1.0
 *	DESCRIPTION: 	jQuery Plugin which makes all selected images fill their container
 *					and respect their aspect ratio. (like the css property background-size: cover;)
 *	
 *	USAGE: 			The image container has to be positioned relatively or absolutely.
 *					The image needs a data attribute containing its aspect ratio.
 *					If you want the image to transition the change pass true to the plugin function.
 *					$('img').imageCoverContainer();
 *					or
 *					$('img').imageCoverContainer(false);
 *
 * 	STRUCTURE: 		<div>
 *						<img data-ratio="0.67" src="img.jpg">
 *					</div>
 *
 *	CREDITS: 		Algorithm based on: http://nanotux.com/plugins/fullscreenr/index.html
 *
 **/


(function($) {


	$.fn.imageCoverContainer = function(transition) {


		var $imgs 						= $(this);


		if ($imgs.exists()) { // only run if there are images


			// variables
			var $window 					= $(window);
			var transition 					= transition; 
			if (transition === undefined) {
				var transition 				= false; // set parameter default
			}
			var isFirstOnResizeExecution 	= true;


			// initiate
			$imgs.css('position', 'absolute');
			cover();


			// resize event listener
			$window.on('resize', function() {

				// throttle resize event
				if ($window.data('resizeTimeout')) {
					clearTimeout($window.data('resizeTimeout'));
				}
				$window.data('resizeTimeout', setTimeout(onResize, 500));

			});


			// executes on resive event
			function onResize() {

				// console.log('resize event'); // throttle test

				if (transition) {
					if (isFirstOnResizeExecution) {
						isFirstOnResizeExecution = false;
						$imgs.css('transition', 'all .5s ease-in-out');
					}
				}

				cover();

			}


			// the magic
			function cover() {

				$imgs.each(function() {

					var $img 			= $(this);
					var $imgContainer 	= $img.parent();

					var ratio 			= $img.data('ratio');
					var containerWidth 	= $imgContainer.width();
					var containerHeight = $imgContainer.height();

					var newImgWidth;
					var newImgHeight;
					var newImgPositionTop;
					var newImgPositionLeft;

					// scale
					if ((containerHeight / containerWidth) > ratio) {
						newImgWidth 	= (containerHeight / ratio);
						newImgHeight 	= containerHeight;
					}
					else {
						newImgWidth 	= containerWidth;
						newImgHeight 	= (containerWidth * ratio);
					}

					// center
					newImgPositionTop 	= (containerHeight - newImgHeight) / 2;
					newImgPositionLeft	= (containerWidth - newImgWidth) / 2;

					// assign new values
					$img.css(
						{
							width 	: newImgWidth,
							height 	: newImgHeight,
							top 	: newImgPositionTop,
							left 	: newImgPositionLeft
						}
					);

				});

			}


		}


	}


	$.fn.exists = function () {
		return this.length !== 0;
	}


})(jQuery);