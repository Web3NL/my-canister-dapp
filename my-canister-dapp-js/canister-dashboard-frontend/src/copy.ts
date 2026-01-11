// Copy to clipboard functionality for address fields

export function initializeCopyButtons(): void {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', handleCopyClick);
  });
}

async function handleCopyClick(event: Event): Promise<void> {
  const button = event.currentTarget as HTMLButtonElement;
  const targetId = button.dataset.copyTarget;

  if (!targetId) return;

  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const textToCopy = targetElement.textContent?.trim() ?? '';
  if (!textToCopy || textToCopy === 'Loading...') return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    showCopiedFeedback(button);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
  }
}

function showCopiedFeedback(button: HTMLButtonElement): void {
  button.classList.add('copied');

  setTimeout(() => {
    button.classList.remove('copied');
  }, 1500);
}
