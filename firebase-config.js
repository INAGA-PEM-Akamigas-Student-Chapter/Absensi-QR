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

/* Firebase App Check -- lapisan tambahan (opsional).
 *
 * SITE KEY dan PROVIDER di bawah harus sama persis dengan yang terdaftar di
 * Firebase Console -> App Check -> Apps. Kalau providernya berbeda, server
 * menjawab "App not registered" walaupun aplikasinya sebenarnya sudah terdaftar.
 *
 * Site key memang boleh publik. Yang rahasia adalah secret key, dan itu hanya
 * ditempel di Firebase Console -- tidak pernah masuk ke berkas ini.
 *
 * Selama site key kosong, aplikasi berjalan normal tanpa App Check.
 * PENTING: jangan aktifkan penegakan (Enforce) di Console sebelum halaman diuji
 * dan tokennya terbukti terbit, karena permintaan tanpa token akan ditolak.
 */
window.APPCHECK_SITE_KEY = "6LfVoagtAAAAAHKvPsMuWDK-95EAxEEJRRa2PCI6";
window.APPCHECK_PROVIDER = "enterprise";   // "enterprise" atau "v3"
