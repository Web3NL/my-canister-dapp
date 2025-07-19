export function showError(message) {
  createNotification(message, 'error');
}

export function showWarning(message) {
  createNotification(message, 'warning');
}

export function clearAllNotifications() {
  const notifications = document.querySelectorAll(
    '.error-notification, .warning-notification'
  );
  notifications.forEach(n => n.remove());
}

function createNotification(message, type) {
  // Remove any existing notifications of the same type
  const existing = document.querySelectorAll(`.${type}-notification`);
  existing.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `${type}-notification`;

  const messageSpan = document.createElement('span');
  messageSpan.innerHTML = message;
  notification.appendChild(messageSpan);

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.className = 'notification-close-btn';
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  notification.appendChild(closeBtn);

  document.body.appendChild(notification);
}
