document.addEventListener('DOMContentLoaded', () => {
  // Select DOM elements
  const assignBedModal = document.getElementById('assignBedModal');
  const editModal = document.getElementById('editModal');
  const extendStayModal = document.getElementById('extendStayModal');
  const dischargeModal = document.getElementById('dischargeModal');
  const reassignModal = document.getElementById('reassignModal');
  const assignBedPatientIdField = document.getElementById('assignBedPatientId');
  const extendStayPatientIdField = document.getElementById('extendStayPatientId');
  const dischargePatientIdField = document.getElementById('dischargePatientId');
  const reassignPatientIdField = document.getElementById('reassignPatientId')
  const userEditIdField = document.getElementById('userEditId')
  const toggleButton = document.getElementById('toggle-btn');
  const sidebar = document.getElementById('sidebar');

  // Toggle Sidebar
  toggleButton.addEventListener('click', toggleSidebar);

  // Toggle Submenus
  const dropdownButtons = document.querySelectorAll('.dropdown-btn');
  dropdownButtons.forEach(button => {
    button.addEventListener('click', () => toggleSubMenu(button));
  });

  // Function to toggle sidebar open/close
  function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    closeAllSubMenus();
  }

  // Function to toggle submenu visibility
  function toggleSubMenu(button) {
    if (!button.nextElementSibling.classList.contains('show')) {
      closeAllSubMenus();
    }
    button.nextElementSibling.classList.toggle('show');
    button.classList.toggle('rotate');

    if (sidebar.classList.contains('close')) {
      sidebar.classList.toggle('close');
      toggleButton.classList.toggle('rotate');
    }
  }

  // Function to close all submenus
  function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
      ul.classList.remove('show');
      ul.previousElementSibling.classList.remove('rotate');
    });
  }

  // Log modal elements for debugging
  console.log('Assign Bed Modal:', assignBedModal);
  console.log('Extend Stay Modal:', extendStayModal);
  console.log('Discharge Modal:', dischargeModal);

  if (!assignBedModal || !extendStayModal || !dischargeModal || !editModal) {
    console.error('One or more modals are missing from the DOM.');
  }

  // Add event listeners only if the modals exist
  [assignBedModal, extendStayModal, dischargeModal, editModal].forEach(modal => {
    if (!modal) {
      console.warn('Skipping missing modal:', modal);
      return; // Skip this modal if it doesn't exist
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Handle dropdown actions
  document.querySelectorAll('.select-menu-1').forEach(menu => {
    const selectBtn = menu.querySelector('.select-btn');
    const options = menu.querySelectorAll('.option');

    if (!selectBtn || options.length === 0) {
      console.warn('Skipping incomplete dropdown menu:', menu);
      return; // Skip this menu if required elements are missing
    }

    // Toggle dropdown visibility
    selectBtn.addEventListener('click', () => {
      toggleDropdown(selectBtn); // Use the toggleDropdown function
    });

    // Handle option clicks
    options.forEach(option => {
      option.addEventListener('click', () => {

        const selectMenu = option.closest('.select-menu-1');
        const selectedValue = option.getAttribute('data-value');
        const selectedText = option.textContent;

        // Update the visible button text
        console.log('selectMenu:', selectMenu);
        const buttonText = selectMenu.querySelector('.sBtn-text');
        buttonText.textContent = selectedText;

        // Update the hidden input value
        console.log('selectMenu:', selectMenu);
        const hiddenInput = selectMenu.querySelector('input[type="hidden"]');
        hiddenInput.value = selectedValue;

        // Hide the dropdown
        const dropdown = selectMenu.querySelector('.options');
        dropdown.style.display = 'none';

        menu.classList.remove('active'); // Close the dropdown
      });
    });
  });

  // Handle dropdown actions
  document.querySelectorAll('.select-menu-2').forEach(menu => {
    const selectBtn = menu.querySelector('.select-btn');
    const options = menu.querySelectorAll('.option');
    const patientRow = menu.closest('tr');
    const patientId = patientRow.querySelector('input[name="patient_id"]').value;

    if (!selectBtn || options.length === 0) {
      console.warn('Skipping incomplete dropdown menu:', menu);
      return; // Skip this menu if required elements are missing
    }

    // Toggle dropdown visibility
    selectBtn.addEventListener('click', () => {
      toggleDropdown(selectBtn); // Use the toggleDropdown function
    });

    // Handle option clicks
    options.forEach(option => {
      option.addEventListener('click', () => {
        const action = option.getAttribute('data-action');

        if (action === 'assign-bed') {
          assignBedPatientIdField.value = patientId;
          assignBedModal.style.display = 'flex';
        } else if (action === 'extend-stay') {
          extendStayPatientIdField.value = patientId;
          extendStayModal.style.display = 'flex';
        } else if (action === 'discharge') {
          dischargePatientIdField.value = patientId;
          dischargeModal.style.display = 'flex';
        } else if (action === 'reassign') {
          reassignPatientIdField.value = patientId;
          reassignModal.style.display = 'flex';
        }

        menu.classList.remove('active'); // Close the dropdown
      });
    });
  });

    // Handle dropdown actions
  document.querySelectorAll('.select-menu-bed').forEach(menu => {
    const selectBtn = menu.querySelector('.select-btn');
    const options = menu.querySelectorAll('.option');

    if (!selectBtn || options.length === 0) {
      console.warn('Skipping incomplete dropdown menu:', menu);
      return; // Skip this menu if required elements are missing
    }

    // Toggle dropdown visibility
    selectBtn.addEventListener('click', () => {
      toggleDropdown(selectBtn); // Use the toggleDropdown function
    });

    // Handle option clicks
    options.forEach(option => {
      option.addEventListener('click', () => {

        const selectMenu = option.closest('.select-menu-bed');
        const selectedValue = option.getAttribute('data-value');
        const selectedText = option.textContent;

        // Update the visible button text
        console.log('selectMenu:', selectMenu);
        const buttonText = selectMenu.querySelector('.sBtn-text');
        buttonText.textContent = selectedText;

        // Update the hidden input value
        const hiddenInput = selectMenu.querySelector('input[type="hidden"]');
        console.log('selectMenu:', hiddenInput);
        hiddenInput.value = selectedValue;

        // Hide the dropdown
        const dropdown = selectMenu.querySelector('.options');
        dropdown.style.display = 'none';

        menu.classList.remove('active'); // Close the dropdown
      });
    });
  });


  const editButton = document.querySelector("#edit-button")
  if (editButton) {
    editButton.addEventListener('click', () => {
      const userIdInput = document.querySelector('input[name="user_id"]');
      if (userIdInput) {
        const userId = userIdInput.value;
        userEditIdField.value = userId;
        editModal.style.display = 'flex';
      } else {
        console.error('Input element with name="user_id" not found.');
      }
    });
  }

  // Handle option clicks
  document.querySelectorAll('.option-1').forEach(option => {
    option.addEventListener('click', () => {
      const selectMenu = option.closest('.select-menu');
      const selectedValue = option.getAttribute('data-value');
      const selectedText = option.textContent;

      // Update the visible button text
      const buttonText = selectMenu.querySelector('.sBtn-text');
      buttonText.textContent = selectedText;

      // Update the hidden input value
      const hiddenInput = selectMenu.querySelector('input[type="hidden"]');
      hiddenInput.value = selectedValue;

      // Hide the dropdown
      const dropdown = selectMenu.querySelector('.options');
      dropdown.style.display = 'none';
    });
  });

  // Redirect to login page
  const loginBtnLink = document.querySelector("#loginPage");
  if (loginBtnLink) {
    loginBtnLink.addEventListener('click', () => {
      window.location.href = "/auth/login";
    });
  }

  // Redirect to info page
  const patientInfoBtn = document.querySelector("#patientinfobtn");
  if (patientInfoBtn) {
    patientInfoBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default behavior if needed
      const patientId = patientInfoBtn.getAttribute("data-patient-id"); // Get the patient ID
      window.location.href = `/moderator/patient/${patientId}`; // Redirect to the info page
    });
  }

  // Redirect to info page
  const patientReadmissionbtn = document.querySelector("#patientreadmissionbtn");
  if (patientReadmissionbtn) {
    patientReadmissionbtn.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default behavior if needed
      const patientId = patientReadmissionbtn.getAttribute("data-patient-id"); // Get the patient ID
      window.location.href = `/moderator/patient/${patientId}/readmissions`; // Redirect to the info page
    });
  }

  // Toggle password visibility
  const pwShowHide = document.querySelectorAll(".pw_hide");
  if (pwShowHide) {
    pwShowHide.forEach((icon) => {
      icon.addEventListener("click", () => {
        const getPwInput = icon.parentElement.querySelector("input");
        if (getPwInput.type === "password") {
          getPwInput.type = "text";
          icon.classList.replace("uil-lock-eye-slash", "uil-eye");
        } else {
          getPwInput.type = "password";
          icon.classList.replace("uil-eye", "uil-lock-eye-slash");
        }
      });
    });
  }

  // Function to toggle dropdown visibility
  function toggleDropdown(button) {
    const dropdown = button.nextElementSibling; // Get the <ul> options list
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    // Close all other dropdowns
    document.querySelectorAll('.select-menu .options').forEach(menu => {
      if (menu !== dropdown) {
        menu.style.display = 'none';
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function (event) {
    const dropdowns = document.querySelectorAll('.options');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
        dropdown.style.display = 'none';
      }
    });
  });
});