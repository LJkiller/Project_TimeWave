
document.addEventListener("DOMContentLoaded", function () {
    let mediaFileInput = document.querySelector('input[name="media-file"]');
    let mediaLinkInput = document.querySelector('input[name="media-link"]');

    let remainDisabled = true;

    // MediaLink
    mediaFileInput.addEventListener("change", function () {
        if (this.value.trim() !== '') {
            mediaLinkInput.disabled = true;
        } else {
            mediaLinkInput.disabled = false;
        }
    });

    //MediaFile
    mediaLinkInput.addEventListener("input", function () {
        if (this.value.trim() !== '') {
            mediaFileInput.disabled = true;
        } else {
            mediaFileInput.disabled = remainDisabled;
        }
    });
});