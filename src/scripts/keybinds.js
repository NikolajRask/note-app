// CTRL + SHIFT + C for closing all tabs
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyC') {
      event.preventDefault(); // Optional: prevent default behavior
      
      closeAllTabs()
    }
});


// CTRL + P for opening search menu
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.code === 'KeyP') {
      event.preventDefault(); // Prevents the default print dialog
      
      openSearch()
    }
  });

// CTRL + N for creating a new note
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.code === 'KeyN') {
      event.preventDefault(); // Prevents the default print dialog
      
      createNewFile()
    }
});

// CTRL + R for creating a new note //Disable this when developing
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.code === 'KeyR') {
    event.preventDefault(); // Prevents the default print dialog
    
    renameCurrentFile()
  }
});

// Prevent devTools being opened, Disable this when developing
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
    event.preventDefault(); // Optional: prevent default behavior
  }
});