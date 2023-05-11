import axios from 'axios';
import { SERVER_URL } from '../constants';

const apiService = axios.create( { baseURL: SERVER_URL.API_BASE_URL } )

export async function login ( { username, password } ) {
    if ( !username || !password ) return;

    const credentialsParams = Object.entries({ username, password }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&').toString();
    return get(`${SERVER_URL.login}/?${credentialsParams}`);
}

export function setTokenEntity (token) {
    if(token) window.localStorage.setItem('token', token);
    if(!token) window.localStorage.removeItem('token');
}

export async function verifyTokenEntity () {
    const token = window.localStorage.getItem('token');
    if (!token) return false;

    return get(`${SERVER_URL.verify}/?token=${encodeURIComponent(token)}`);
}

export async function verifyEmailOTP({ email, otp }) {
    if (!email || !otp) return;
    const forgotPasswordParams = Object.entries({ email, otp }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&').toString();
    const { data } = await get(`${SERVER_URL.forgotPassword}?${forgotPasswordParams}`);
    console.log(data);
}

export function rememberCredentials ({ username, password }) {
    if (!username || !password) return;
    window.localStorage.setItem('credentials', JSON.stringify({ username, password, rememberMe: true }));
}

export function removeCredentials () {
    window.localStorage.removeItem('credentials');
}

export function getCredentials () {
    return JSON.parse(window.localStorage.getItem('credentials'));
}

export async function register ({ username, password, email }) {
    if ( !username || !password || !email ) return;

    return post(`${SERVER_URL.register}`, JSON.stringify({ username, password, email }));
}

export async function get (url) {
    try {
        const response = await apiService.get(url);
        return response;
      } catch (error) {
        return error;
      }
}

export async function post (url, data, contentType = 'application/json' ) {
    try {
      const response = await apiService.post(url, data, { headers: { 'Content-Type': contentType } });
      return response;
    } catch (error) {
      return error;
    }
  }