import delegate from "delegate";
import parent from "find-parent";

(function () {
	"use strict";
	
	/**
	 * This listener ensures that if a radio is clicked within the confines of a listen-radio-input,
	 * this will receive a predetermined class provided by a data attribute, which allows it to change
	 * appropriately.
	 */
	delegate('input.frm-ctrl[type="radio"]', 'input', function (e) {
		
		/*
		* We must find all the inputs that have the same name as this and are
		* radios themselves.
		*/
		var radios = document.querySelectorAll(`input[type="radio"][name="${e.delegateTarget.name}"]`);
		radios.forEach(function (e) {
			let ancestor = parent.byClassName(e, 'listen-radio-input');
			
			/**
			 * If the radio is not wrapped in an ancestor expecting the change within it, we 
			 * can just skip it.
			 */
			if (!ancestor) { return; }
			
			let remove = ancestor.dataset.radioActive || 'active';
			remove.split(' ').forEach(function (e) { 
				ancestor.classList.remove(e); 
			});
		});
		
		/**
		 * Fetch the parent to th e
		 */
		var box = parent.byClassName(e.delegateTarget, 'listen-radio-input');
		/**
		 * Read the radio-active data from the class list and add it to the 
		 * object.
		 */
		let add = box.dataset.radioActive || 'active';
		add.split(' ').forEach(function (e) { box.classList.add(e); });
	});
}());