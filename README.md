Image Cover Container
=====================

This is a small jQuery Plugin which makes all selected images fill/cover their container and respect their aspect ratio. (like the css property background-size: cover;)
It adds CSS transitions to the changes if desired.


Usage
-----

*	The image container has to be positioned relatively or absolutely.
*	The image needs a data attribute containing its aspect ratio.
#	If you want the image to transition the change pass true to the plugin function.

### HTML

	<div>
		<img data-ratio="0.67" src="img.jpg">
	</div>

### JavaScript

	$('img').imageCoverContainer();

