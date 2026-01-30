self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch (e) { data = { title: 'إشعار', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'إشعار المتجر';
  const options = { body: data.body || data.message || '', data: data, icon: '/favicon.ico' };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then( clientList => {
    if (clientList.length > 0) return clientList[0].focus();
    return clients.openWindow('/');
  }));
});

