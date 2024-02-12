
document.addEventListener("DOMContentLoaded", function() {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let maxCheckboxes = 3;

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].required = true;
    }

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', function() {
            let checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');

            if (checkedCheckboxes.length > maxCheckboxes) {
                this.checked = false;
            }

            for (let j = 0; j < checkboxes.length; j++) {
                if (checkboxes[j] !== this 
                    && checkedCheckboxes.length >= maxCheckboxes 
                    && !checkboxes[j].checked) {
                    checkboxes[j].disabled = true;
                } else {
                    checkboxes[j].disabled = false;
                }
            }

            if (checkedCheckboxes.length > 0) {
                for (let j = 0; j < checkboxes.length; j++) {
                    checkboxes[j].removeAttribute('required');
                }
            } else {
                for (let j = 0; j < checkboxes.length; j++) {
                    checkboxes[j].required = true;
                }
            }
        });
    }
});
