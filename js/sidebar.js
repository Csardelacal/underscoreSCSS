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


depend(['m3/ui/sticky', 'm3/animation/animation', 'm3/hid/gestures/gestures'], function(sticky, transition, Gesture) {
	
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
		
		
		/*
		 * Set the sidebar to be the entire height of the document. This expects an
		 * auto-extending parent to be properly functional
		 */
		var container = element.parentNode;
		var wrapper = container.parentNode;
		var content = wrapper.querySelector('.content');
		
		/*
		 * The narrow flag reports to the system whether we determined the system
		 * providing the viewport as a "mobile" device.
		 * 
		 * Please note that while this only determines whether this device is wide
		 * enough to hold a "standard" 960px wide site and the 200px wide sidebar 
		 * without issue.
		 * 
		 * This means that also a PC with a rotated screen, or a small netbook may
		 * be considered mobile by this.
		 * 
		 * @type Boolean
		 */
		var narrow   = window.innerWidth < 1160;
		
		/*
		 * This flag indicates whether the sidebar should be collapsed. Notice that
		 * it allows the programmer to use the 'collapsed' class to indicate that
		 * the sidebar should also be collapsed for wider devices.
		 * 
		 * @type Boolean
		 */
		var expanded = !narrow && !container.classList.contains('collapsed');
		
		/*
		 * The wrapper can be any element containing the sidebar and content structure.
		 * For the sake of convenience I recommend using a single, class-free and
		 * attribute free div that the sidebar can modify.
		 */
		wrapper.style.width = '100%';
		wrapper.style.overflowX = 'hidden';
		wrapper.style.whiteSpace = 'nowrap';
		
		if (expanded) {
			container.style.width ='200px';
			content.style.width = 'calc(100% - 200px)';
		} 
		else {
			element.style.transform = 'translate(-200px, 0)';
			container.style.width = '0px';
			content.style.width = '100%';
		}
		
		container.classList.remove('collapsed');
		
		var redraw = function (from, to) {
			
			transition(function (progress) {
				var width = from + (to - from) * progress;

				element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
				container.style.width = width + 'px';

				if (narrow) {
					wrapper.querySelector('.content').style.width = '100%';
					wrapper.querySelector('.content').style.opacity = 1 -  width / 300;
				} 
				else {
					wrapper.querySelector('.content').style.width = 'calc(100% - ' + width + 'px)';
				}
			}, 300, 'easeInEaseOut');
		};
		
		var hide = function () {
			var start = container.clientWidth;
			expanded = false;
			redraw(start, 0);
		};
		
		var show = function () {
			var start = container.clientWidth;
			expanded = true;
			redraw(start, 200);
		};
		
		var toggle = function () {
			expanded? hide() : show();
		};
		
		
		var g = new Gesture(document, 'swipe');
		var offset = undefined;
		
		g.init(function (meta) { 
			console.log('touchstart');
			offset = container.clientWidth;
		});
		
		g.follow(function (meta, stop) {
			if (meta.direction === 'h') {
				var width = 1 + Math.max(0, Math.min(offset + meta.endX - meta.startX, 200));
				element.style.transform = 'translate(' + (width - 200) + 'px, 0px)';
				container.style.width = width + 'px';
				content.style.width = '100%';
				content.style.opacity = 1 -  width / 300;
				stop();
			};
		});
		
		g.end(function (meta, stop) {

			//Horizontal swipe
			if (meta.direction !== 'h') {
				return;
			}
			
			if (meta.endX - meta.startX > 0) {
				//Left to right swipe
				show();
			}
			else {
				hide();
			}
			console.log('touchend');

			/*
			 * If the swipe was registered, we prevent the browser from
			 * reacting to it.
			 */
			stop();
		});

		/*
		 * Create listeners that allow the application to react to events happening 
		 * in the browser.
		 */
		listener(document, {
			click: function(e) { 
				/*
				 * In case the click event has bubbled to the document and is NOT coming
				 * from the toggle button, we will simply ignore it.
				 * 
				 * The exception to this rule is when the sidebar is being displayed 
				 * on a mobile device and has been expanded, since a press on any area
				 * of the document will cause the sidebar to be collapsed.
				 */
				if (!e.target.classList.contains('toggle-button') && !(narrow && expanded)) { return; }
				
				toggle();
				
				e.preventDefault();
			},
			
		});

		listener(container, {
			click: sidebar.hide
		});

		listener(element, {
			click: function(e) { e.stopPropagation(); }
		});
		
		var s = sticky.stick(element, wrapper, 'top');
		
		if (document.querySelector('.navbar').classList.contains('fixed')) {
			s.clear = document.querySelector('.navbar').clientHeight;
		}
	};
	
	return sidebar;
});