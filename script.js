import { SpeedInsights } from "@vercel/speed-insights/next"

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
            var toastElement = document.getElementById('quoteToast');
            var toastBody = document.getElementById('toastMessage');
            
            if (!toastElement || !toastBody) {
                // Fallback to alert if toast not available
                alert(message);
                return;
            }
            
            // Set toast message and styling
            toastBody.textContent = message;
            
            // Remove existing background classes
            toastElement.classList.remove('text-bg-success', 'text-bg-danger');
            
            // Add appropriate background color
            if (isSuccess) {
                toastElement.classList.add('text-bg-success');
            } else {
                toastElement.classList.add('text-bg-danger');
            }
            
            // Show the toast
            var toast = new bootstrap.Toast(toastElement, {
                autohide: true,
                delay: 5000
            });
            toast.show();
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
                        showMessage('✅ Success! Your quote request has been sent. We\'ll get back to you soon!', true);
                        // Reset the form after successful submission
                        setTimeout(function () {
                            form.reset();
                            if (fileNameDiv) fileNameDiv.innerHTML = '';
                        }, 500);
                    } else {
                        var msg = (result.data && (result.data.message || result.data.error)) || 'There was a problem submitting your request.';
                        showMessage('❌ ' + msg, false);
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

// Initialize Vercel Speed Insights
SpeedInsights();

