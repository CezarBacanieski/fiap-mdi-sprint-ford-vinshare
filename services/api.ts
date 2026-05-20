import axios, { InternalAxiosRequestConfig } from "axios";
import { mockDealerships } from "../constants/mockData";
import { Dealership, FipeModel, FipeModelsResponse, ViaCepAddress } from "../types";

export const fipeApi = axios.create({
  baseURL: "https://parallelum.com.br/fipe/api/v1",
  timeout: 10000,
});

export const viaCepApi = axios.create({
  baseURL: "https://viacep.com.br/ws",
  timeout: 8000,
});

const attachJsonHeaders = (headers: InternalAxiosRequestConfig["headers"]) => {
  headers.set("Accept", "application/json");
  return headers;
};

fipeApi.interceptors.request.use((config) => {
  config.headers = attachJsonHeaders(config.headers);
  return config;
});

viaCepApi.interceptors.request.use((config) => {
  config.headers = attachJsonHeaders(config.headers);
  return config;
});

export const fetchFordModels = async (searchTerm?: string): Promise<FipeModel[]> => {
  const response = await fipeApi.get<FipeModelsResponse>("/carros/marcas/26/modelos");
  const models = response.data.modelos;
  const normalizedTerm = searchTerm?.trim().toLocaleLowerCase("pt-BR") ?? "";

  if (!normalizedTerm) {
    return models.slice(0, 30);
  }

  return models
    .filter((model) => model.nome.toLocaleLowerCase("pt-BR").includes(normalizedTerm))
    .slice(0, 30);
};

export const fetchDealerships = async (): Promise<Dealership[]> => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockDealerships;
};

export const lookupCep = async (cep: string): Promise<ViaCepAddress | null> => {
  const normalizedCep = cep.replace(/\D/g, "");
  if (normalizedCep.length !== 8) {
    return null;
  }

  const response = await viaCepApi.get<ViaCepAddress>(`/${normalizedCep}/json/`);
  return response.data.erro ? null : response.data;
};
