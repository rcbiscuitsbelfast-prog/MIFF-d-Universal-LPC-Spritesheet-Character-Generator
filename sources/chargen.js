// Mobile-First Character Builder with Original LPC Integration

// Load the original character generation system
const originalChargenScript = document.createElement('script');
originalChargenScript.src = 'sources/original_chargen.js';
document.head.appendChild(originalChargenScript);

// Wait for original script to load, then initialize mobile interface
originalChargenScript.onload = function() {
	$(document).ready(function () {
		// Initialize mobile-first interface
		initializeMobileInterface();
		
		// Initialize character generation (existing functionality)
		initializeCharacterGeneration();
	});
};

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
	
	// Export menu actions - connect to original functions
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
	// Get animations from the original whichAnim select
	const whichAnim = $('#whichAnim');
	if (whichAnim.length) {
		const container = $('.animation-buttons');
		container.empty();
		
		whichAnim.find('option').each(function() {
			const option = $(this);
			const value = option.val();
			const text = option.text();
			const isSelected = option.prop('selected');
			
			const button = $(`<button class="animation-btn ${isSelected ? 'active' : ''}" data-animation="${value}">${text}</button>`);
			button.click(function() {
				selectAnimation(value);
			});
			container.append(button);
		});
	}
}

function selectAnimation(animationId) {
	// Update active state
	$('.animation-btn').removeClass('active');
	$(`.animation-btn[data-animation="${animationId}"]`).addClass('active');
	
	// Update the original whichAnim select
	$('#whichAnim').val(animationId).trigger('change');
}

function initializeCharacterForm() {
	// Move the original form content to our mobile form
	const originalForm = $('#customizeChar').first();
	if (originalForm.length) {
		// Move all the original form content to our side menu
		$('#customizeChar').html(originalForm.html());
		
		// Hide the original form
		originalForm.hide();
	}
}

function initializeCharacterGeneration() {
	// The original character generation system will handle the rest
	// We just need to ensure our mobile interface works with it
	
	// Update preview when form changes
	$('#customizeChar').on('change', 'input, select', function() {
		// Trigger the original character update
		$(this).trigger('change');
	});
	
	// Handle window resize for responsive behavior
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
	
	// Set initial state based on screen size
	if (window.innerWidth >= 1024) {
		$('#side-menu').addClass('open');
	}
}

// Utility functions for mobile interactions
function isMobile() {
	return window.innerWidth < 768;
}

function isTouchDevice() {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}