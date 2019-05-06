/* 
 * The MIT License
 *
 * Copyright 2018 César de la Cal Bretschneider <cesar@magic3w.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


depend(['m3/ui/sticky', 'm3/animation/animation'], function(sticky, transition) {
	
	/*
	 * This defines a basic rule that prevent the sidebar from being 
	 * shown if the user agent is zoomed in.
	 */
	var blocked = false;
	
	/*
	 * This function makes it rather fast to create listeners for different things
	 * on the same element without having to write the same addEventListener over
	 * and over.
	 * 
	 * @param {HTMLElement} element
	 * @param {Object} listeners
	 * @returns {undefined}
	 */
	var listener = function (element, listeners) {
		for (var i in listeners) {
			if (!listeners.hasOwnProperty(i)) { continue; }
			element.addEventListener(i, listeners[i], false);
		}
	};
	
	var sidebar = function(element) {
		
		var touch  = {
			startX: undefined,
			startY: undefined,
			endX: undefined,
			endY: undefined,
			last: undefined,
			started: undefined,
			
			/*
			 * These are needed for dragging the sidebar open and closed on mobile devices.
			 */
			direction: undefined,
			offset   : undefined,
			
			movementRequired : 100,
			timeout          : 150
		};
		
		/*
		 * Set the sidebar to be the entire height of the document. This expects an
		 * auto-extending parent to be properly functional
		 */
		var container = element.parentNode;
		var content = container.parentNode.querySelector('.content');
		
		/*
		 * 
		 * @type Boolean
		 */
		var mobile   = window.innerWidth < 1160;
		var expanded = !mobile && !container.classList.contains('collapsed');
		
		//container.style.height = container.parentNode.clientHeight + 'px';
		container.style.display = 'inline-block';
		
		container.parentNode.style.width = '100%';
		container.parentNode.style.overflowX = 'hidden';
		container.parentNode.style.whiteSpace = 'nowrap';
		
		element.style.display = 'block';
		element.style.height  = Math.min(window.innerHeight, container.parentNode.clientHeight) + 'px';
		
		if (expanded) {
			container.style.width ='200px';
			content.style.width = 'calc(100% - 200px)';
		} else {
			element.style.transform = 'translate(-200px, 0)';
			container.style.width = '0px';
			content.style.width = '100%';
		}
		
		container.classList.remove('collapsed');
		
		/*
		 * Create listeners that allow the application to react to events happening 
		 * in the browser.
		 */

		listener(document, {
			click: function(e) { 
				var ts = +new Date();
				
				if (touch.started && (ts - touch.started) > touch.timeout) { return; }
				if (!e.target.classList.contains('toggle-button') && !mobile) { return; }
				if (!expanded && !e.target.classList.contains('toggle-button')) { return; }
				
				setTimeout (function () {
					expanded = !expanded;
				}, 400);
				
				
				transition(function (progress) {
					console.log(expanded);
					var width = (!expanded? progress * 200 : 200 - (progress * 200));
					
					if (!mobile) {
						element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
						container.style.width = width + 'px';
						container.parentNode.querySelector('.content').style.width = 'calc(100% - ' + width + 'px)';
					} else {
						element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
						container.style.width = width + 'px';
						container.parentNode.querySelector('.content').style.width = '100%';
						container.parentNode.querySelector('.content').style.opacity = 1 -  width / 300;
					}
				}, 300, 'easeInEaseOut');
				
				console.log('click');
			},
			
			touchstart: function (e) {
				if (blocked) { return; }
				console.log('touchstart');
				var finger = e.touches[0];
				touch.startX = finger.screenX;
				touch.startY = finger.screenY;
				touch.started = +new Date();
				touch.direction = undefined;
				touch.offset    = container.clientWidth;
			},
			
			touchmove : function (e) {
				var finger = e.touches[0];
				var ts = (+new Date());
				
				touch.endX = finger.screenX;
				touch.endY = finger.screenY;
				
				
				if ((ts - touch.started) < touch.timeout) {
					return;
				}
				else {
					touch.direction = touch.direction || (Math.abs(touch.endX - touch.startX) > Math.abs(touch.endY - touch.startY)? 'h' : 'v');
				}
				
				if (touch.direction === 'h') {
					var width = 1 + Math.max(0, Math.min(touch.offset + touch.endX - touch.startX, 200));
					element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
					container.style.width = width + 'px';
					content.style.width = '100%';
					content.style.opacity = 1 -  width / 300;
					e.stopPropagation();
					e.preventDefault();
				}
			},
			
			touchend: function (e) {
				if ((+new Date()) - touch.started < touch.timeout) {
					return;
				}
				
				if (blocked) {
					return;
				}
				
				if (touch.direction !== 'h') {
					return;
				}
				
				//Horizontal swipe
				if (touch.endX - touch.startX > 50) {
					//Left to right swipe
					var start = container.clientWidth;
					expanded = true;
					
					transition(function (progress) {
						var width = start + progress * (200 - start);
						element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
						container.style.width = width + 'px';
						content.style.width = '100%';
						content.style.opacity = 1 -  width / 300;
					}, 300, 'easeInEaseOut');
				}
				else {
					var start = container.clientWidth;
					expanded = false;
					
					//Right to left swipe
					transition(function (progress) {
						var width = (start - (progress * start));
						element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
						container.style.width = width + 'px';
						content.style.width = '100%';
						content.style.opacity = 1 -  width / 300;
					}, 300, 'easeInEaseOut');

				}
				console.log('touchend');
				
				touch.started = undefined;
				
				/*
				 * If the swipe was registered, we prevent the browser from
				 * reacting to it.
				 */
				e.preventDefault();
				e.stopPropagation();
			}
		});

		listener(container, {
			click: sidebar.hide
		});

		listener(element, {
			click: function(e) { e.stopPropagation(); }
		});
		
		var s = sticky.stick(element, container.parentNode, 'top');
		
		if (document.querySelector('.navbar').classList.contains('fixed')) {
			s.clear = document.querySelector('.navbar').clientHeight;
		}
	};
	
	/*
	 * Check if the viewport is zoomed in and prevent the browser from displaying 
	 * the sidebar if zoomed.
	 */
	window.visualViewport && window.visualViewport.addEventListener('resize', function(e) {
		blocked = event.target.scale !== 1;
	});
	
	return sidebar;
});