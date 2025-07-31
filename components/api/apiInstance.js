import axios from "axios";
import { getLocalStorage } from "../../utils/getLocalStorage";

const instance = axios.create({
  //baseURL: "http://gateway.twmresearchalert.com",
  baseURL: "http://192.168.1.25:8000/sendmail.php",
});

const apiInstance = (url, method, data = {}, additionalHeaders = {}) => {
  const localStorageData = getLocalStorage(); //  Corrected variable name

  const isFormData = data instanceof FormData;

  const headers = {
    "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    Authorization: localStorageData?.access_token, //  fixed typo: "acces_token" → "access_token"
    ...additionalHeaders,
  };

  return instance({
    url,
    method,
    data,
    headers,
  });
};

export default apiInstance;
