import { faq } from "./faq.js";

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("quoteForm");
    if (!form) return;

    var submitButton = form.querySelector('button[type="submit"]');
    var logoInput = document.getElementById("logoUpload");
    var fileNameDiv = document.getElementById("selectedFileName");

    function setSubmitting(isSubmitting) {
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.innerText = isSubmitting
        ? "Submitting…"
        : "Submit Quote Request";
    }

    function showMessage(message, isSuccess) {
      var toastElement = document.getElementById("quoteToast");
      var toastBody = document.getElementById("toastMessage");
      var toastHeader = toastElement
        ? toastElement.querySelector(".toast-header")
        : null;

      if (!toastElement || !toastBody) {
        // Fallback to alert if toast not available
        alert(message);
        return;
      }

      // Set toast message (convert \n to <br> for proper line breaks)
      toastBody.innerHTML = message.replace(/\n/g, "<br>");

      // Remove existing background classes from body
      toastBody.classList.remove("bg-success", "bg-danger", "text-white");

      // Add appropriate background color to toast body
      if (isSuccess) {
        toastBody.classList.add("bg-success", "text-white");
        if (toastHeader) {
          toastHeader.classList.remove("bg-danger", "text-white");
          toastHeader.classList.add("bg-success", "text-white");
        }
      } else {
        toastBody.classList.add("bg-danger", "text-white");
        if (toastHeader) {
          toastHeader.classList.remove("bg-success");
          toastHeader.classList.add("bg-danger", "text-white");
        }
      }

      // Show the toast (longer delay for error messages)
      var toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: isSuccess ? 5000 : 8000, // 8 seconds for errors, 5 for success
      });
      toast.show();
    }

    if (logoInput && fileNameDiv) {
      var logoLabel = document.getElementById("logoUploadLabel");

      logoInput.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          fileNameDiv.innerHTML = "<small>Selected: " + file.name + "</small>";
          fileNameDiv.style.color = "#28a745";

          // Update the label styling
          if (logoLabel) {
            logoLabel.innerHTML =
              '<i class="fas fa-check me-2"></i>File Selected';
            logoLabel.classList.remove("btn-primary");
            logoLabel.classList.add("btn-success");
          }
        } else {
          fileNameDiv.innerHTML = "";

          // Reset the label styling
          if (logoLabel) {
            logoLabel.innerHTML =
              '<i class="fas fa-upload me-2"></i>Choose Logo File';
            logoLabel.classList.remove("btn-success");
            logoLabel.classList.add("btn-primary");
          }
        }
      });

      // Optional: Add click handler to the label for better UX
      if (logoLabel) {
        logoLabel.addEventListener("click", function (e) {
          this.style.transform = "scale(0.95)";
          setTimeout(function () {
            logoLabel.style.transform = "scale(1)";
          }, 150);
        });
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setSubmitting(true);

      var formData = new FormData(form);
      if (logoInput && logoInput.files && logoInput.files[0]) {
        formData.set("logoUpload", logoInput.files[0]);
      }

      fetch("/api/submitForm", {
        method: "POST",
        body: formData,
      })
        .then(function (res) {
          var contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            return res.json().then(function (data) {
              return { ok: res.ok, status: res.status, data: data };
            });
          }
          return { ok: res.ok, status: res.status, data: null };
        })
        .then(function (result) {
          if (result.ok) {
            showMessage(
              "✅ Success! Your quote request has been sent. We'll get back to you soon!",
              true
            );
            // Reset the form after successful submission
            setTimeout(function () {
              form.reset();
              if (fileNameDiv) fileNameDiv.innerHTML = "";

              // Reset logo upload button styling
              var logoLabel = document.getElementById("logoUploadLabel");
              if (logoLabel) {
                logoLabel.innerHTML =
                  '<i class="fas fa-upload me-2"></i>Choose Logo File';
                logoLabel.classList.remove("btn-success");
                logoLabel.classList.add("btn-primary");
              }
            }, 500);
          } else {
            var errorMsg = "There was a problem submitting your request.";
            var errorDetails = "";

            if (result.data) {
              errorMsg = result.data.message || result.data.error || errorMsg;

              // Add error code if available
              if (result.status) {
                errorDetails += "\nError Code: " + result.status;
              }

              // Add additional details if available
              if (result.data.details) {
                errorDetails += "\nDetails: " + result.data.details;
              }

              // Add helpful hints based on error type
              if (result.status === 500) {
                errorDetails +=
                  "\n\nPlease check that all required fields are filled out correctly and try again.";
              } else if (result.status === 400) {
                errorDetails += "\n\nPlease verify your form data is valid.";
              }
            }

            showMessage("❌ " + errorMsg + errorDetails, false);
          }
        })
        .catch(function (err) {
          var errorMsg =
            "❌ Network error. Please check your connection and try again.";
          if (err && err.message) {
            errorMsg += "\n\nTechnical Details: " + err.message;
          }
          showMessage(errorMsg, false);
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  });
})();

// Initialize Vercel Speed Insights

// Display FAQ Accordion
document.addEventListener("DOMContentLoaded", function () {
  const faqAccordion = document.getElementById("faqAccordion");
  console.log(faqAccordion);

  if (!faqAccordion) {
    console.error("FAQ element not found");
    return;
  }
  const displayFAQ = function (faq) {
    faqAccordion.textContent = "";
    faq.forEach(function (faqs, i) {
      const show = i === 0 ? "show" : "";
      const expanded = i === 0 ? "true" : "false";
      const html = `
        <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapse${i}">
                <strong>  ${faqs.question}</strong>
              </button>
            </h2>
            <div id="collapse${i}" class="accordion-collapse collapse ${show}">
              <div class="accordion-body">
                <p>${faqs.answer}</p>
              </div>
            </div>
          </div>
        `;
      faqAccordion.insertAdjacentHTML("beforeend", html);
    });
  };
  displayFAQ(faq);
});

const timeLabel = document.querySelector(".time");
const locale = navigator.language;
const currentTime = setInterval(() => {
  const time = new Date();
  timeLabel.textContent = new Intl.DateTimeFormat(
    locale,
    {
      hour: "numeric",
      minute: "numeric",
    },
    1000
  ).format(time);
});

const dateLabel = document.querySelector(".date");
const date = new Date();
dateLabel.textContent = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "short",
  weekday: "long",
  year: "numeric",
}).format(date);

const navLinks = [
  {
    text: "Home",
    link: "./",
  },
  {
    text: "Portfolio",
    link: "./portfolio",
  },
  {
    text: "FAQ",
    link: "./faq",
  },
  {
    text: "Request A Quote",
    link: "./quote",
  },
];

const desktopNav = document.querySelector(".desktop-nav");
const mobileNav = document.querySelector(".mobile-nav");

const displayNav = function (container, array) {
  container.textContent = "";
  array.forEach((arr) => {
    const html = `
          <li class="nav-item">
            <a href="${arr.link}" class="nav-link">${arr.text}</a>
          </li>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
};
displayNav(mobileNav, navLinks);
displayNav(desktopNav, navLinks);
