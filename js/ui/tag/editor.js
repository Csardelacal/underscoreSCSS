/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


depend('_scss/ui/tag/editor', ['m3/core/collection'], function (collect) {
	
	var RichEditor = function (tags, onchange) {
		var ctx = this;
		
		this.outer = document.createElement('div');
		this.input = document.createElement('input');
		this.rendered = document.createElement('span');
		this.tags  = tags;
		this.onchange = onchange;
		
		this.outer.appendChild(this.rendered);
		this.outer.appendChild(this.input);
		this.redraw();
		
		this.outer.className = 'tag-editor tag-editor-outer';
		this.input.className = 'tag-editor tag-editor-input';
		this.rendered.className = 'tag-editor tag-editor-rendered';
		
		this.input.addEventListener('keydown', function (e) {
			/*
			 * When the key pressed is a comma, the tag is committed to the list 
			 * of tags.
			 */
			if (ctx.input.value.trim().length !== 0 && (e.key === ',' || e.key === 'Enter' || e.key === 'Tab')) { 
				ctx.tags.push(new Tag(this.value));
				ctx.redraw();
				this.value = '';
				e.preventDefault();
				ctx.onchange();
			}
			
			/*
			 * When the user presses the backspace key and nothing is in the current
			 * tag, we delete the previous tag.
			 */
			if (e.keyCode === 8 && ctx.input.value.length === 0) {
				ctx.tags.pop();
				ctx.redraw();
				ctx.onchange();
			}
		});
		
		this.outer.addEventListener('click', function () {
			ctx.input.focus();
		});
	};
	
	RichEditor.prototype = {
		getOuter : function () { return this.outer; },
		redraw   : function () { 
			var ctx = this;
			
			this.rendered.innerHTML = '';
			this.tags.each(function (e) {
				var span = document.createElement('span');
				var del  = document.createElement('span');
				
				span.appendChild(document.createTextNode(e.content));
				span.className =  'tag-editor tag-editor-tag';
				span.addEventListener('click', function () { ctx.input.value.trim() && ctx.tags.push(new Tag(ctx.input.value)); ctx.remove(e); ctx.input.value = e.content; })
				ctx.rendered.appendChild(span);
				
				span.appendChild(del);
				del.className =  'tag-editor tag-editor-delete';
				del.addEventListener('click', function (ev) { ctx.remove(e); ev.stopPropagation(); });
				
			});
		},
		
		remove: function (element) {
			this.tags = this.tags.filter(function (e) { return element !== e; });
			this.redraw();
			this.onchange();
		},
		
		getTags : function () { return this.tags; },
	};
	
	var Tag = function (content) {
		this.content = content;
		
		/*
		 * Maps the tag to a specific span, so when the user clicks the span, we 
		 * can programtically remove it.
		 */
		this.html = undefined;
	};
	
	Tag.prototype = {
		
	};
	
	var TagEditor = function (element, listener) {
		var ctx = this;
		
		this.element = element;
		this.listener = listener;
		
		this.tags = collect(element.innerHTML.split(',')).filter(function (e) { return e !== ''}).each(function (e) { return new Tag(e.trim()); });
		this.replace = new RichEditor(this.tags, function () { ctx.commit(); });
		
		this.element.style.display = 'none';
		this.element.parentNode.insertBefore(this.replace.getOuter(), this.element)
		
		this.replace.input.placeholder = element.placeholder;
	};
	
	TagEditor.prototype = {
		sync : function () { this.tags = this.replace.getTags(); },
		commit : function () { this.sync(); this.element.innerHTML = this.tags.each(function (e) { return e.content; }).raw().join(','); this.listener(this.tags);  }
	};
	
	return TagEditor;
});
