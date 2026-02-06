/**
 * Servicio de Modo Offline
 * Cachea datos en IndexedDB para funcionar sin internet
 */

const DB_NAME = 'ComunicaCentrosDB';
const DB_VERSION = 1;

const STORES = {
  buttons: 'buttons',
  profiles: 'profiles',
  phrases: 'recentPhrases',
  syncQueue: 'syncQueue'
};

class OfflineService {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Inicializar IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Crear object stores
        if (!db.objectStoreNames.contains(STORES.buttons)) {
          db.createObjectStore(STORES.buttons, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.profiles)) {
          db.createObjectStore(STORES.profiles, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.phrases)) {
          db.createObjectStore(STORES.phrases, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          db.createObjectStore(STORES.syncQueue, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Guardar botones en cache
   */
  async saveButtons(buttons) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.buttons], 'readwrite');
      const store = transaction.objectStore(STORES.buttons);

      buttons.forEach(button => {
        store.put(button);
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Obtener botones del cache
   */
  async getButtons() {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.buttons], 'readonly');
      const store = transaction.objectStore(STORES.buttons);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Guardar cambios en cola de sincronización
   */
  async queueChange(change) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.syncQueue], 'readwrite');
      const store = transaction.objectStore(STORES.syncQueue);

      store.add({
        ...change,
        timestamp: Date.now(),
        synced: false
      });

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Obtener cambios pendientes de sincronizar
   */
  async getPendingChanges() {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.syncQueue], 'readonly');
      const store = transaction.objectStore(STORES.syncQueue);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const pending = request.result.filter(item => !item.synced);
        resolve(pending);
      };
    });
  }

  /**
   * Marcar cambio como sincronizado
   */
  async markAsSynced(changeId) {
    if (!this.initialized) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.syncQueue], 'readwrite');
      const store = transaction.objectStore(STORES.syncQueue);
      const request = store.get(changeId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const change = request.result;
        change.synced = true;
        store.put(change);
      };

      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Manejador cuando vuelve la conexión
   */
  async handleOnline() {
    this.isOnline = true;
    console.log('✅ Conexión recuperada - sincronizando cambios...');
    
    const changes = await this.getPendingChanges();
    
    // Aquí iría la lógica para sincronizar cambios con Firestore
    // Por ahora solo notificamos
    window.dispatchEvent(new CustomEvent('sync-required', { detail: changes }));
  }

  /**
   * Manejador cuando se pierde la conexión
   */
  handleOffline() {
    this.isOnline = false;
    console.log('⚠️ Sin conexión - cambios se guardarán localmente');
    window.dispatchEvent(new CustomEvent('offline-mode'));
  }

  /**
   * Verificar si está online
   */
  getConnectionStatus() {
    return this.isOnline;
  }

  /**
   * Limpiar base de datos
   */
  async clear() {
    if (!this.initialized) await this.init();

    for (const storeName of Object.values(STORES)) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();

        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
      });
    }
  }
}

export const offlineService = new OfflineService();
export default OfflineService;
