// Mobile-First Character Builder JavaScript

$(document).ready(function () {
	// Initialize mobile-first interface
	initializeMobileInterface();
	
	// Initialize character generation (existing functionality)
	initializeCharacterGeneration();
});

function initializeMobileInterface() {
	// Mobile menu toggle
	$('#menu-toggle').click(function() {
		toggleSideMenu();
	});
	
	$('#close-menu').click(function() {
		closeSideMenu();
	});
	
	$('#menu-overlay').click(function() {
		closeSideMenu();
	});
	
	// Export menu toggle
	$('#export-btn').click(function(e) {
		e.stopPropagation();
		toggleExportMenu();
	});
	
	// Close export menu when clicking outside
	$(document).click(function(e) {
		if (!$(e.target).closest('#export-menu, #export-btn').length) {
			closeExportMenu();
		}
	});
	
	// Export menu actions
	$('#export-png').click(() => $('#saveAsPNG').click());
	$('#export-zip-anims').click(() => $('.exportSplitAnimations').click());
	$('#export-zip-items').click(() => $('.exportSplitItemSheets').click());
	$('#export-zip-item-anims').click(() => $('.exportSplitItemAnimations').click());
	$('#export-credits-txt').click(() => $('.generateSheetCreditsTxt').click());
	$('#export-credits-csv').click(() => $('.generateSheetCreditsCsv').click());
	$('#import-clipboard').click(() => $('.importFromClipboard').click());
	$('#import-btn').click(() => $('.importFromClipboard').click());
	
	// Preview button
	$('#preview-btn').click(function() {
		$('#character-preview')[0].scrollIntoView({ behavior: 'smooth' });
	});
	
	// Initialize animation strip
	initializeAnimationStrip();
	
	// Initialize character customization form
	initializeCharacterForm();
}

function toggleSideMenu() {
	const menu = $('#side-menu');
	const overlay = $('#menu-overlay');
	const toggle = $('#menu-toggle');
	
	menu.toggleClass('open');
	overlay.toggleClass('show');
	toggle.attr('aria-expanded', menu.hasClass('open'));
	
	// Prevent body scroll when menu is open
	if (menu.hasClass('open')) {
		$('body').css('overflow', 'hidden');
	} else {
		$('body').css('overflow', '');
	}
}

function closeSideMenu() {
	$('#side-menu').removeClass('open');
	$('#menu-overlay').removeClass('show');
	$('#menu-toggle').attr('aria-expanded', 'false');
	$('body').css('overflow', '');
}

function toggleExportMenu() {
	const menu = $('#export-menu');
	const btn = $('#export-btn');
	
	if (menu.attr('hidden')) {
		menu.removeAttr('hidden');
		btn.attr('aria-expanded', 'true');
	} else {
		menu.attr('hidden', 'true');
		btn.attr('aria-expanded', 'false');
	}
}

function closeExportMenu() {
	$('#export-menu').attr('hidden', 'true');
	$('#export-btn').attr('aria-expanded', 'false');
}

function initializeAnimationStrip() {
	// This will be populated with actual animations from the character generator
	const animations = [
		{ id: 'idle', name: 'Idle', active: true },
		{ id: 'walk', name: 'Walk', active: false },
		{ id: 'jump', name: 'Jump', active: false },
		{ id: 'attack', name: 'Attack', active: false },
		{ id: 'cast', name: 'Cast', active: false },
		{ id: 'hurt', name: 'Hurt', active: false },
		{ id: 'die', name: 'Die', active: false }
	];
	
	const container = $('.animation-buttons');
	container.empty();
	
	animations.forEach(anim => {
		const button = $(`<button class="animation-btn ${anim.active ? 'active' : ''}" data-animation="${anim.id}">${anim.name}</button>`);
		button.click(function() {
			selectAnimation(anim.id);
		});
		container.append(button);
	});
}

function selectAnimation(animationId) {
	// Update active state
	$('.animation-btn').removeClass('active');
	$(`.animation-btn[data-animation="${animationId}"]`).addClass('active');
	
	// Update character preview
	updateCharacterPreview(animationId);
}

function updateCharacterPreview(animationId) {
	// This will integrate with the existing character generation system
	console.log('Switching to animation:', animationId);
	// The actual implementation will depend on the existing character generation code
}

function initializeCharacterForm() {
	// Create mobile-friendly character customization form
	const form = $('#customizeChar');
	
	// Character customization groups
	const groups = [
		{
			title: 'Body',
			options: [
				{ type: 'radio', name: 'sex', value: 'male', label: 'Male' },
				{ type: 'radio', name: 'sex', value: 'female', label: 'Female' }
			]
		},
		{
			title: 'Head',
			options: [
				{ type: 'radio', name: 'head', value: 'none', label: 'No Head' },
				{ type: 'radio', name: 'head', value: 'human', label: 'Human' },
				{ type: 'radio', name: 'head', value: 'elf', label: 'Elf' }
			]
		},
		{
			title: 'Clothing',
			options: [
				{ type: 'radio', name: 'shirt', value: 'none', label: 'No Shirt' },
				{ type: 'radio', name: 'shirt', value: 'basic', label: 'Basic Shirt' },
				{ type: 'radio', name: 'shirt', value: 'fancy', label: 'Fancy Shirt' }
			]
		},
		{
			title: 'Weapons',
			options: [
				{ type: 'radio', name: 'weapon', value: 'none', label: 'No Weapon' },
				{ type: 'radio', name: 'weapon', value: 'sword', label: 'Sword' },
				{ type: 'radio', name: 'weapon', value: 'bow', label: 'Bow' }
			]
		}
	];
	
	groups.forEach(group => {
		const groupElement = $(`
			<details class="customization-group" open>
				<summary>${group.title}</summary>
				<div class="group-content">
					<div class="option-list">
						${group.options.map(option => `
							<div class="option-item">
								<input type="${option.type}" name="${option.name}" value="${option.value}" id="${option.name}-${option.value}" ${option.value === 'none' ? 'checked' : ''}>
								<label for="${option.name}-${option.value}">${option.label}</label>
								<div class="option-preview"></div>
							</div>
						`).join('')}
					</div>
				</div>
			</details>
		`);
		
		form.append(groupElement);
	});
	
	// Add event listeners for form changes
	form.on('change', 'input[type="radio"], input[type="checkbox"]', function() {
		updateCharacterPreview();
	});
}

function initializeCharacterGeneration() {
	// This is where the existing character generation logic will be integrated
	// For now, we'll set up the basic structure
	
	// Move existing form elements to hidden form for compatibility
	const existingForm = $('form').first();
	if (existingForm.length && existingForm.attr('id') !== 'customizeChar') {
		existingForm.attr('id', 'hidden-form').hide();
	}
	
	// Initialize the character preview canvas
	const canvas = document.getElementById('previewAnimations');
	if (canvas) {
		const ctx = canvas.getContext('2d');
		// Set up canvas for character rendering
		ctx.fillStyle = '#f8f9fa';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		// Draw placeholder character
		ctx.fillStyle = '#6c757d';
		ctx.font = '12px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Character', canvas.width/2, canvas.height/2 - 6);
		ctx.fillText('Preview', canvas.width/2, canvas.height/2 + 6);
	}
}

// Utility functions for mobile interactions
function isMobile() {
	return window.innerWidth < 768;
}

function isTouchDevice() {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Handle window resize
$(window).resize(function() {
	if (window.innerWidth >= 1024) {
		// Desktop view - show side menu by default
		$('#side-menu').addClass('open');
		$('#menu-overlay').removeClass('show');
	} else {
		// Mobile view - hide side menu by default
		$('#side-menu').removeClass('open');
	}
});

// Initialize on page load
$(document).ready(function() {
	// Set initial state based on screen size
	if (window.innerWidth >= 1024) {
		$('#side-menu').addClass('open');
	}
});