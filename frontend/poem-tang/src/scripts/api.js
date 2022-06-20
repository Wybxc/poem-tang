import axios from "axios";

const api = axios.create({
  baseURL: "https://api.poem.wybxc.cc",
  timeout: 5000,
});

export default api;
