document.getElementById('opinionForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const opinion = document.getElementById('opinion').value;
    var type;
    function displayRadioValue() {
        var ele = document.getElementsByName('type');

        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked)
                type = ele[i].value;
        }
    }
    displayRadioValue()
    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ opinion, type }),
      });
  
      if (response.ok) {
        alert('Your opinion has been submitted!');
        document.getElementById('opinion').value = ''; // Clear the textarea
      } else {
        alert('There was an error submitting your opinion.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  