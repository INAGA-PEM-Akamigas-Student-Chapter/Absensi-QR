/* Konfigurasi Firebase.
 *
 * Ganti nilai di bawah dengan milik proyek Anda:
 *   Firebase Console -> ikon gerigi -> Project settings -> Your apps -> Web app
 *   -> "SDK setup and configuration" -> Config.  Salin isi objek firebaseConfig.
 *
 * Nilai-nilai ini memang tidak rahasia; Firebase mengandalkan aturan keamanan
 * Firestore dan login pengguna untuk melindungi data, bukan menyembunyikan kunci.
 * Karena itu jangan lupa memasang aturan yang ada di README sebelum dipakai serius.
 *
 * Selama masih berisi "GANTI...", aplikasi tetap berjalan seperti biasa dengan
 * penyimpanan lokal di perangkat masing-masing.
 */
window.FIREBASE_CONFIG = {
  apiKey: "GANTI_apiKey",
  authDomain: "GANTI_projectId.firebaseapp.com",
  projectId: "GANTI_projectId",
  storageBucket: "GANTI_projectId.firebasestorage.app",
  messagingSenderId: "GANTI_messagingSenderId",
  appId: "GANTI_appId"
};
