(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var form = document.getElementById('quoteForm');
        if (!form) return;

        var submitButton = form.querySelector('button[type="submit"]');
        var logoInput = document.getElementById('logoUpload');
        var fileNameDiv = document.getElementById('selectedFileName');

        function setSubmitting(isSubmitting) {
            if (!submitButton) return;
            submitButton.disabled = isSubmitting;
            submitButton.innerText = isSubmitting ? 'Submitting…' : 'Submit Quote Request';
        }

        function showMessage(message, isSuccess) {
            var existing = document.getElementById('formStatusMessage');
            if (!existing) {
                existing = document.createElement('div');
                existing.id = 'formStatusMessage';
                existing.className = 'mt-3';
                form.appendChild(existing);
            }
            existing.className = 'mt-3 alert ' + (isSuccess ? 'alert-success' : 'alert-danger');
            existing.textContent = message;
        }

        if (logoInput && fileNameDiv) {
            logoInput.addEventListener('change', function (e) {
                var file = e.target.files && e.target.files[0];
                if (file) {
                    fileNameDiv.innerHTML = '<small>Selected: ' + file.name + '</small>';
                } else {
                    fileNameDiv.innerHTML = '';
                }
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            setSubmitting(true);

            var formData = new FormData(form);
            if (logoInput && logoInput.files && logoInput.files[0]) {
                formData.set('logoUpload', logoInput.files[0]);
            }

            fetch('/api/submitForm', {
                method: 'POST',
                body: formData
            })
                .then(function (res) {
                    var contentType = res.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        return res.json().then(function (data) {
                            return { ok: res.ok, status: res.status, data: data };
                        });
                    }
                    return { ok: res.ok, status: res.status, data: null };
                })
                .then(function (result) {
                    if (result.ok) {
                        showMessage('Thanks! Your request has been sent.', true);
                        setTimeout(function () {
                            window.location.href = '/thank-you.html';
                        }, 800);
                    } else {
                        var msg = (result.data && (result.data.message || result.data.error)) || 'There was a problem submitting your request.';
                        showMessage(msg, false);
                    }
                })
                .catch(function () {
                    showMessage('Network error. Please try again.', false);
                })
                .finally(function () {
                    setSubmitting(false);
                });
        });
    });
})();

