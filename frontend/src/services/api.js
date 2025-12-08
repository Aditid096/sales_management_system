import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

export async function fetchSales(params) {
  const res = await api.get("/sales", { params });
  return res.data;
}
