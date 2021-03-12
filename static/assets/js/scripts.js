function copy_link() {
	var copyText = document.getElementById('copy_link');
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
}
function copyBTC(i) {
	var copyText = document.getElementById('copyBTC'+i);
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy");
}
function pasteBTC() {
	let pasteText = document.getElementById('searchBTC');
	navigator.clipboard.readText()
	.then(text => {
		pasteText.value = text;
	})
	.catch(err => {
	alert('Failed to read clipboard contents: '+ err);
	});
}
$(document).ready(function(){
	$("a").on('click', function(event) {
		if (this.hash !== "") {
			var hash = this.hash;
			if($(hash).length) {
				event.preventDefault();
				$('.menu-center').slideUp(300);
				$('html, body').animate({
					scrollTop: $(hash).offset().top
					}, 1000, function(){
					window.location.hash = hash;
				});
				$('#navbarSupportedContent').removeClass("show");
			}
		}
	});
	$('#accordionFAQ .card-header').click(function(){
		if(!$(this).hasClass('selected')) {
			$(this).addClass('selected');
			$(this).siblings().slideDown();
			$(this).find('.panel-icon').html('<i class="fa fa-minus"></i>');
			} else {
			$(this).siblings().slideUp();
			$(this).removeClass('selected');
			$(this).find('.panel-icon').html('<i class="fa fa-plus"></i>');
		}
	});
});