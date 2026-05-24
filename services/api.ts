import axios from "axios";
import { mockDealerships } from "../constants/mockData";
import { AppSecurityError } from "../security/errors";
import { actionRateLimiter } from "../security/rateLimiter";
import { sanitizeCep, sanitizeSearchTerm } from "../security/validation";
import { assertAllowedApiUrl, attachSecurityHeaders } from "../security/network";
import { Dealership, FipeModel, FipeModelsResponse, ViaCepAddress } from "../types";

const FIPE_BASE_URL = "https://parallelum.com.br/fipe/api/v1";
const VIA_CEP_BASE_URL = "https://viacep.com.br/ws";

assertAllowedApiUrl(FIPE_BASE_URL);
assertAllowedApiUrl(VIA_CEP_BASE_URL);

export const fipeApi = axios.create({
  baseURL: FIPE_BASE_URL,
  timeout: 10000,
});

export const viaCepApi = axios.create({
  baseURL: VIA_CEP_BASE_URL,
  timeout: 8000,
});

fipeApi.interceptors.request.use((config) => {
  return attachSecurityHeaders(config);
});

viaCepApi.interceptors.request.use((config) => {
  return attachSecurityHeaders(config);
});

const responseErrorHandler = () => {
  throw new AppSecurityError("External API error", {
    code: "UPSTREAM_ERROR",
    status: 502,
    publicMessage: "Serviço externo indisponível no momento.",
  });
};

fipeApi.interceptors.response.use((response) => response, responseErrorHandler);
viaCepApi.interceptors.response.use((response) => response, responseErrorHandler);

export const fetchFordModels = async (searchTerm?: string): Promise<FipeModel[]> => {
  const limiter = actionRateLimiter.consume("fipe-search");
  if (!limiter.allowed) {
    throw new AppSecurityError("Search rate limited", {
      code: "RATE_LIMITED_SEARCH",
      status: 429,
      publicMessage: "Muitas consultas em sequência. Aguarde alguns segundos.",
    });
  }

  const response = await fipeApi.get<FipeModelsResponse>("/carros/marcas/26/modelos");
  const models = response.data.modelos;
  const normalizedTerm = sanitizeSearchTerm(searchTerm ?? "").toLocaleLowerCase("pt-BR");

  if (!normalizedTerm) {
    return models.slice(0, 30);
  }

  return models
    .filter((model) => model.nome.toLocaleLowerCase("pt-BR").includes(normalizedTerm))
    .slice(0, 30);
};

export const fetchDealerships = async (): Promise<Dealership[]> => {
  const limiter = actionRateLimiter.consume("dealerships-load");
  if (!limiter.allowed) {
    throw new AppSecurityError("Dealership request flood blocked", {
      code: "RATE_LIMITED_DEALERSHIPS",
      status: 429,
      publicMessage: "Muitas consultas de concessionárias. Tente novamente em instantes.",
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockDealerships;
};

export const lookupCep = async (cep: string): Promise<ViaCepAddress | null> => {
  const limiter = actionRateLimiter.consume("cep-lookup");
  if (!limiter.allowed) {
    throw new AppSecurityError("CEP lookup flood blocked", {
      code: "RATE_LIMITED_CEP",
      status: 429,
      publicMessage: "Limite de consultas de CEP temporariamente atingido.",
    });
  }

  let normalizedCep = "";
  try {
    normalizedCep = sanitizeCep(cep);
  } catch {
    return null;
  }

  const response = await viaCepApi.get<ViaCepAddress>(`/${normalizedCep}/json/`);
  return response.data.erro ? null : response.data;
};
