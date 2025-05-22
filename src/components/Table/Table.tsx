const createCaption = (table: HTMLTableElement) => {
  // Remove any existing captions first
  const existingCaptions = table.getElementsByTagName('caption');
  while (existingCaptions.length > 0) {
    existingCaptions[0].remove();
  }

  const caption = document.createElement('caption');
  caption.textContent = 'Table caption';
  table.insertBefore(caption, table.firstChild);
}; 