import api from "../api/axios";

/* ================= CREATE RETURN ================= */
export const createScaffoldingReturn = async (payload: any) => {
  const { data } = await api.post("/returns/scaffolding", payload);
  return data;
};

/* ================= GET RETURNS ================= */
export const getScaffoldingReturns = async () => {
  const { data } = await api.get("/returns/scaffolding");
  return data;
};

/* ================= DELETE RETURN ================= */
export const deleteScaffoldingReturn = async (id: string) => {
  const { data } = await api.delete(`/returns/scaffolding/${id}`);
  return data;
};

export const getScaffoldingItems = async () => {
  const { data } = await api.get("/items/scaffolding");
  return data;
};

