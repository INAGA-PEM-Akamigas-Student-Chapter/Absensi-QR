/* Konfigurasi Firebase untuk proyek absensi-qr-c7be4.
 *
 * Nilai-nilai ini memang tidak rahasia: setiap aplikasi web Firebase mengirimkannya
 * ke browser pengunjung. Yang melindungi data adalah aturan keamanan Firestore
 * (hanya pengguna yang sudah masuk boleh membaca dan menulis) dan daftar akun di
 * Authentication -- bukan kerahasiaan kunci ini.
 *
 * databaseURL dan measurementId dari console sengaja tidak disertakan karena
 * aplikasi ini tidak memakai Realtime Database maupun Analytics.
 *
 * Sumber: Firebase Console -> Project settings -> General -> Your apps -> Config.
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAEuia4LBdNHv-YPiNYpwvFCT94TTPRjFQ",
  authDomain: "absensi-qr-c7be4.firebaseapp.com",
  projectId: "absensi-qr-c7be4",
  storageBucket: "absensi-qr-c7be4.firebasestorage.app",
  messagingSenderId: "621682440316",
  appId: "1:621682440316:web:057bb6016e9de6816531f9"
};
