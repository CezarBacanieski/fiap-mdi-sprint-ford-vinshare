<div align="center">

# Ford+

### Seu Ford, sempre em dia.

![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

## Sobre o Projeto

Ford+ e um aplicativo mobile criado para o Challenge 02 da FIAP em parceria com a Ford Brasil: **Boosting VIN Share in South America with Intelligent Solutions**.

VIN Share representa a porcentagem de veiculos Ford que retornam a rede oficial de concessionarias para manutencao e pos-venda. A proposta do Ford+ e fortalecer esse relacionamento com uma experiencia digital util, recorrente e motivadora para proprietarios Ford no Brasil e na America do Sul.

O app centraliza garagem, historico de manutencao, agendamento de servicos, alertas, pontuacao de fidelidade e beneficios. A escolha por mobile aproxima a Ford do momento real de uso do cliente: quando ele recebe um alerta, consulta o historico, agenda uma revisao ou decide voltar para uma concessionaria autorizada.

## Funcionalidades

- 🚗 Dashboard premium com veiculo principal, quilometragem e Vehicle Health Score.
- 🔔 Alertas de manutencao e lembretes locais com Expo Notifications.
- 📋 Historico completo de servicos realizados na rede oficial.
- 📅 Agendamento em 3 etapas com selecao de veiculo, servico, concessionaria, data e horario.
- 🏆 Ford+ Rewards com pontos, niveis, historico e resgate de beneficios.
- 🧰 Breakdown de saude por sistema: motor, freios, pneus, suspensao, ar condicionado e fluidos.
- 🏢 Lista mockada de concessionarias Ford em Sao Paulo com distancia, nota e horarios.
- 🔎 Integracao FIPE para buscar modelos Ford reais.
- 📍 Estrutura ViaCEP para consulta de endereco.
- 💾 Persistencia local com AsyncStorage e dados semeados no primeiro uso.
- 🌙 Tema escuro automotivo com azul Ford, vermelho Ford e componentes reutilizaveis.

## Integrantes do Grupo

- Milton Cezar Bacanieski — RM 555206
- Victorio Bastelli — RM 554723
- Lorenzo Mangini — RM 554901
- Vitor Bebiano — RM 555026

## Como Rodar o Projeto

### Pre-requisitos

- Node.js LTS instalado.
- npm instalado.
- Expo Go no celular ou um emulador iOS/Android configurado.

### Passo a passo

```bash
git clone <url-do-repositorio>
cd fiap-mdi-sprint-ford-vinshare
npm install
npx expo start
```

Depois, escaneie o QR Code com o Expo Go ou pressione `a` para Android e `i` para iOS.

## Demonstracao Visual

<!-- Add screenshots here after running the app -->

Sugestao de capturas: onboarding, dashboard, detalhe do veiculo, agendamento, rewards e perfil.

## Decisoes Tecnicas

**React Native + Expo**: permite entregar uma experiencia iOS e Android com uma unica base de codigo, aproveitando o ecossistema Expo para notificacoes, fontes, splash screen e desenvolvimento rapido.

**Expo Router**: usa roteamento baseado em arquivos, facilita deep linking e organiza naturalmente a navegacao por tabs, detalhes e fluxos como onboarding e agendamento.

**React Query**: centraliza cache, loading e erros das integracoes externas, especialmente FIPE e a lista de concessionarias.

**AsyncStorage**: atende o MVP sem backend, mantendo usuario, veiculos, servicos, recompensas e flags locais persistidos.

**Arquitetura**: o app usa `app/(tabs)` para as cinco areas principais, rotas dedicadas para `vehicle/[id]` e `service/*`, hooks por dominio, camada de `services/` para APIs e armazenamento, componentes visuais reutilizaveis em `components/ui` e graficos em `components/charts`.

## Integracoes Externas

- **FIPE API**: consulta modelos Ford reais em `GET /carros/marcas/26/modelos`.
- **ViaCEP**: estrutura de consulta de CEP para enriquecer enderecos de concessionarias.
- **Expo Notifications**: permissoes e notificacoes locais para lembrete de servico e pontos ganhos.

## Proximos Passos

- Integracao backend com Node.js + PostgreSQL.
- Integracao real com APIs Ford e rede de concessionarias.
- Push notifications via FCM/APNs.
- Autenticacao biometrica.
- Mapa com concessionarias mais proximas.
- Recurso de AR para inspecao assistida do veiculo.

## Contato

profhercules.ramos@fiap.com.br
