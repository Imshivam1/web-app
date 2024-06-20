document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the form
    const interviewForm = document.getElementById('interviewForm');
    interviewForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form data
        const formData = new FormData(interviewForm);

        // Convert form data to JSON
        const interviewData = {};
        formData.forEach((value, key) => {
            interviewData[key] = value;
        });

        // Make POST request to backend
        fetch('/api/interviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(interviewData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Interview added successfully:', data);
            // Optionally, you can redirect the user to another page or display a success message
        })
        .catch(error => {
            console.error('There was a problem adding the interview:', error);
            // Optionally, you can display an error message to the user
        });
    });
});
