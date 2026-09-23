const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
const currentYear = document.getElementById('current-year');

if (currentYear) {
  currentYear.textContent = `© ${new Date().getFullYear()} Hacama Investments`;
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

if (contactForm && formNote) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formNote.textContent = 'Please complete all required fields before submitting your enquiry.';
      return;
    }

    const formData = new FormData(contactForm);
    const name = formData.get('name');
    formNote.textContent = `Thanks, ${name}. This preview form is ready to connect to Hacama Investments' official inbox or CRM.`;
    contactForm.reset();
  });
}
