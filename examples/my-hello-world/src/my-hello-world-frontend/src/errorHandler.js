export function showError(message) {
  const toast = createToast(message, 'error-toast', true);
  document.body.appendChild(toast);
}

export function showWarning(message) {
  const toast = createToast(message, 'warning-toast', false);
  document.body.appendChild(toast);
}

function createToast(message, className, autoClose = true) {
  const toast = document.createElement('div');
  toast.className = className;
  
  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);
  
  // Add close button for warnings
  if (!autoClose) {
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'toast-close-btn';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    toast.appendChild(closeBtn);
  }
  
  // Add click to dismiss for errors only
  if (autoClose) {
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }
  
  return toast;
}