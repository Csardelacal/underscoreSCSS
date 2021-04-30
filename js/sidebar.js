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
	 * Set the sidebar to be the entire height of the document.
	 */
	var container = element.parentNode;
	
	/*
	 * This variable indicates whether the sidebar is being blocked from being
	 * displayed. This is useful for any behavior where the 
	 * 
	 * @type Boolean
	 */
	var blocked   = false;
	
	/*
	 * This flag indicates whether the sidebar should be collapsed. Notice that
	 * it allows the programmer to use the 'collapsed' class to indicate that
	 * the sidebar should also be collapsed for wider devices.
	 * 
	 * @type Boolean
	 */
	var expanded = false;
	
	var hide = function () {
		expanded = false;
		element.parentNode.removeAttribute('data-visible');
	};
	
	var show = function () {
		expanded = true;
		element.parentNode.setAttribute('data-visible', '');
	};
	
	var toggle = function () {
		expanded? hide() : show();
	};
	
	
	
	/*
	 * Create listeners that allow the application to react to events happening 
	 * in the browser.
	 */
	listener(document, {
		click: function(e) { 
			/*
			 * In case the click event has bubbled to the document and is NOT coming
			 * from the toggle button, we will simply ignore it.
			 */
			if (!e.target.classList.contains('toggle-button')) { return; }
			if (blocked) { return; }
			
			toggle();
			
			e.preventDefault();
		}
		
	});
	
	/*
	 * When the container is clicked, the sidebar is hidden from the viewport,
	 * assuming that the user did wish to see whatever was behind it.
	 */
	listener(container, {
		click: hide
	});
	
	/*
	 * If the sidebar is clicked, it will prevent the event from bubbling, since
	 * it would cause the parent element (container) to hide the sidebar as a 
	 * result.
	 */
	listener(element, {
		click: function(e) { e.stopPropagation(); }
	});
	
	return {
		disable : function () { hide(); blocked = true; },
		enable  : function () { blocked = false; }
	};
	
};

export default sidebar;