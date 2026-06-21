// Find the button element in the HTML by its id attribute.
const button = document.getElementById('actionButton');

// Find the paragraph where we will display a message.
const message = document.getElementById('message');

// Add a click event listener to the button.
// When the button is clicked, the function inside will run.
button.addEventListener('click', () => {
  // Create a new Date object representing the current date and time.
  const now = new Date();

  // Update the text content of the message paragraph.
  // Template literals use backticks and allow embedding JavaScript expressions.
  message.textContent = `Button clicked at ${now.toLocaleTimeString()}. Happy building!`;
});
