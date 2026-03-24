import axios from "axios";
export const BASE_URL="https://proconnectlinkedinclone-2.onrender.com"

export const clientServer = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});