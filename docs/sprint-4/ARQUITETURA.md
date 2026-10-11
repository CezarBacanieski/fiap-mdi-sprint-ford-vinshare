# Arquitetura real

```mermaid
flowchart TD
  UI["Telas Expo Router\napp/"] --> UIComponents["components/ui e charts"]
  UI --> Hooks["Hooks de domínio\nuseAuth, useVehicles, useServices, useRewards"]
  Hooks --> Storage["services/storage.ts\nAsyncStorage"]
  Hooks --> API["services/api.ts\nAxios + TanStack Query"]
  UI --> Notifications["useNotifications"]
  Notifications --> LocalNotifications["services/notifications.ts\nexpo-notifications"]
  API --> FIPE["FIPE pública\nmodelos Ford"]
  API --> ViaCEP["ViaCEP público\nconsulta de CEP"]
  API --> Mock["Concessionárias demonstrativas"]
  Storage --> LocalData["Dados locais: usuário, veículos, serviços, rewards e preferências"]
```

## Fluxo de dados

1. O layout raiz prepara o seed local, carrega fontes e consulta o marcador de onboarding.
2. A tela chama um hook de domínio; o hook lê/grava AsyncStorage e atualiza o estado React.
3. Modelos Ford e concessionárias usam TanStack Query. Somente modelos dependem da FIPE; concessionárias são um catálogo local com atraso simulado.
4. Ao selecionar uma concessionária, a tela consulta ViaCEP para exibir a referência de endereço. A consulta não cria nem confirma agendamento remoto.
5. O agendamento persiste localmente. O lembrete é apenas local e é agendado somente se módulo, dispositivo e permissões permitirem.

## Limites importantes

| Item | Situação real |
| --- | --- |
| Vehicle Health Score e sistemas | valores demonstrativos, não telemetria/diagnóstico real |
| Veículos, serviços, perfil e fidelidade | persistência local em AsyncStorage |
| Concessionárias e disponibilidade | dados demonstrativos, sem agenda corporativa |
| FIPE e ViaCEP | integrações públicas HTTP |
| Notificações | locais; sem push, backend ou garantia no Expo Go Android |
