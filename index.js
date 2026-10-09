/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import { enableFreeze } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// Pengingat Jadwal (notifikasi lokal): tap notifikasi cukup membuka app, jadi event di latar
// belakang tidak perlu diproses. Wajib didaftarkan sebelum app terdaftar.
notifee.onBackgroundEvent(async () => {});

// Layar yang tidak terlihat (di bawah stack / tab lain) dibekukan: perubahan data, bahasa, atau
// tema tidak merender ulang semuanya sekaligus; layar dirender ulang saat terlihat lagi.
enableFreeze(true);

AppRegistry.registerComponent(appName, () => App);
