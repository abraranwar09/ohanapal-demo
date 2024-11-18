document.addEventListener('DOMContentLoaded', function() {
    const raspberryPiInput = document.getElementById('raspberry-pi');

    // Load the stored Raspberry Pi URL from local storage
    const storedPiUrl = localStorage.getItem('piUrl');
    if (storedPiUrl) {
        raspberryPiInput.value = storedPiUrl;
    }

    // Save the Raspberry Pi URL to local storage when Enter is pressed
    raspberryPiInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const piUrl = raspberryPiInput.value;
            localStorage.setItem('piUrl', piUrl);
            alert('Raspberry Pi URL saved!');
        }
    });
});
