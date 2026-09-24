import { mockDealerships } from "../constants/mockData";
import { fetchDealerships, fetchFordModels, fipeApi, lookupCep, viaCepApi } from "./api";

describe("external API adapters", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("FIPE", () => {
    it("filters Ford models on a successful response", async () => {
      jest.spyOn(fipeApi, "get").mockResolvedValue({
        data: { modelos: [{ codigo: "1", nome: "Ranger" }, { codigo: "2", nome: "Ka" }] },
      });

      await expect(fetchFordModels("rang")).resolves.toEqual([{ codigo: "1", nome: "Ranger" }]);
    });

    it("returns an empty list when the FIPE response has no models", async () => {
      jest.spyOn(fipeApi, "get").mockResolvedValue({ data: { modelos: [] } });

      await expect(fetchFordModels("Ford")).resolves.toEqual([]);
    });

    it("propagates HTTP and network failures from FIPE", async () => {
      const request = jest.spyOn(fipeApi, "get");
      request.mockRejectedValueOnce(new Error("HTTP 500"));
      await expect(fetchFordModels("Ranger")).rejects.toThrow("HTTP 500");

      request.mockRejectedValueOnce(new Error("Network Error"));
      await expect(fetchFordModels("Ranger")).rejects.toThrow("Network Error");
    });

    it("fails loudly for an invalid FIPE payload", async () => {
      jest.spyOn(fipeApi, "get").mockResolvedValue({ data: {} });

      await expect(fetchFordModels("Ranger")).rejects.toThrow();
    });
  });

  describe("ViaCEP", () => {
    it("returns a valid address", async () => {
      jest.spyOn(viaCepApi, "get").mockResolvedValue({
        data: {
          cep: "01001-000",
          logradouro: "Praca da Se",
          complemento: "lado impar",
          bairro: "Se",
          localidade: "Sao Paulo",
          uf: "SP",
        },
      });

      await expect(lookupCep("01001-000")).resolves.toMatchObject({ localidade: "Sao Paulo" });
    });

    it("does not call ViaCEP for an invalid CEP", async () => {
      const request = jest.spyOn(viaCepApi, "get");

      await expect(lookupCep("123")).resolves.toBeNull();
      expect(request).not.toHaveBeenCalled();
    });

    it("returns null for an unknown CEP", async () => {
      jest.spyOn(viaCepApi, "get").mockResolvedValue({ data: { erro: true } });

      await expect(lookupCep("00000000")).resolves.toBeNull();
    });

    it("propagates network errors from ViaCEP", async () => {
      jest.spyOn(viaCepApi, "get").mockRejectedValue(new Error("offline"));

      await expect(lookupCep("01001000")).rejects.toThrow("offline");
    });
  });

  it("returns the locally available dealerships", async () => {
    await expect(fetchDealerships()).resolves.toEqual(mockDealerships);
  });
});
