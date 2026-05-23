<div align="center">

# Ford+

### Seu Ford, sempre em dia.

Aplicativo mobile desenvolvido para fortalecer o relacionamento entre clientes Ford e a rede oficial de concessionárias, aumentando retenção, recorrência de serviços e engajamento no pós-venda.

<br/>

![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

# 📖 Sobre o Projeto

O **Ford+** é uma solução mobile desenvolvida para o **Challenge 02 da FIAP em parceria com a Ford Brasil**, dentro do tema:

> **Boosting VIN Share in South America with Intelligent Solutions**

O conceito de **VIN Share** representa a porcentagem de veículos Ford que retornam à rede oficial de concessionárias para manutenção e serviços de pós-venda.

O objetivo do Ford+ é aumentar essa retenção por meio de uma experiência digital moderna, centralizada e recorrente, conectando o cliente à Ford durante toda a jornada de propriedade do veículo.

O aplicativo transforma o pós-venda em uma experiência contínua, oferecendo:

- acompanhamento da saúde do veículo;
- histórico de manutenção;
- agendamento inteligente;
- notificações preventivas;
- programa de fidelidade;
- benefícios exclusivos.

A proposta foi desenhada para aproximar a Ford do momento real de uso do cliente, incentivando o retorno à rede autorizada de maneira prática e estratégica.

---

# ✨ Principais Funcionalidades

## 🚗 Gestão do Veículo

- Dashboard premium com informações do veículo principal;
- Vehicle Health Score (pontuação de saúde do veículo);
- Controle de quilometragem;
- Breakdown de sistemas:
  - motor;
  - freios;
  - pneus;
  - suspensão;
  - ar-condicionado;
  - fluidos.

## 🔔 Experiência Inteligente

- Alertas de manutenção preventiva;
- Notificações locais com Expo Notifications;
- Lembretes de revisão;
- Avisos de benefícios e recompensas.

## 📅 Pós-venda e Serviços

- Histórico completo de serviços realizados;
- Agendamento em múltiplas etapas;
- Seleção de:
  - veículo;
  - serviço;
  - concessionária;
  - data;
  - horário.

## 🏆 Fidelização

- Sistema Ford+ Rewards;
- Acúmulo de pontos;
- Níveis de fidelidade;
- Histórico de recompensas;
- Resgate de benefícios exclusivos.

## 🏢 Rede de Concessionárias

- Lista de concessionárias Ford;
- Distância e avaliação;
- Horários de funcionamento;
- Estrutura preparada para geolocalização futura.

---

# 🛠️ Stack Tecnológica

| Tecnologia | Objetivo |
|---|---|
| React Native | Desenvolvimento mobile cross-platform |
| Expo | Ecossistema e ferramentas de desenvolvimento |
| TypeScript | Tipagem estática e escalabilidade |
| Expo Router | Navegação baseada em arquivos |
| React Query | Gerenciamento de cache e requisições |
| AsyncStorage | Persistência local de dados |
| FIPE API | Consulta de modelos Ford |
| ViaCEP | Estrutura de consulta de endereços |

---

# 🏗️ Arquitetura do Projeto

O projeto foi estruturado com foco em:

- escalabilidade;
- reutilização de componentes;
- separação de responsabilidades;
- facilidade de manutenção.

## Estrutura principal

```bash
app/
 ├── (tabs)/
 ├── vehicle/[id]
 ├── service/*
components/
 ├── ui/
 ├── charts/
hooks/
services/
storage/
````

## Decisões Técnicas

### React Native + Expo

Permite entregar uma experiência consistente para iOS e Android utilizando uma única base de código.

### Expo Router

Organiza a navegação através de rotas baseadas em arquivos, facilitando manutenção e escalabilidade.

### React Query

Centraliza:

* cache;
* loading;
* sincronização;
* tratamento de erros das APIs externas.

### AsyncStorage

Viabiliza persistência local para o MVP sem necessidade de backend dedicado.

---

# 🔌 Integrações Externas

## FIPE API

Consulta de modelos Ford reais:

```http
GET /carros/marcas/26/modelos
```

## ViaCEP

Estrutura de enriquecimento de endereços via CEP.

## Expo Notifications

Sistema de notificações locais para:

* lembretes de manutenção;
* alertas;
* recompensas.

---

# 📱 Demonstração

## 🎥 Vídeo Demonstrativo

Veja o Ford+ em funcionamento:

<a href="https://youtube.com/shorts/XM4Dn7UZGRs?feature=share">
  <img src="https://img.youtube.com/vi/XM4Dn7UZGRs/hqdefault.jpg" width="420" alt="Vídeo demonstrativo do Ford+">
</a>

<br/>

👉 [Assistir demonstração completa](https://youtube.com/shorts/XM4Dn7UZGRs?feature=share)

---

## 🎥 Vídeo Explicativo

Explicando o Ford+ :

<a href="https://youtu.be/nqJf0cdi8Ds?si=pIM6Dl0LUz8Nr8xH">
  <img src="https://img.youtube.com/vi/nqJf0cdi8Ds/hqdefault.jpg" width="420" alt="Vídeo demonstrativo do Ford+">
</a>

<br/>

👉 [Assistir demonstração completa](https://youtu.be/nqJf0cdi8Ds?si=pIM6Dl0LUz8Nr8xH)

# 🖼️ Screenshots do Aplicativo

<div align="center">

| Home                                                                                | Serviços                                                                    | Perfil                                                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203529.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203618.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203719.png" width="220"> |

| Meus Veículos                                                                         | Pontos                                                                           | Agendamento                                                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203555.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203653.png" width="220"> | <img src="assets/prints/Captura%20de%20tela%202026-05-20%20203756.png" width="220"> |

</div>

---

# 🚀 Como Executar o Projeto

## Pré-requisitos

* Node.js LTS
* npm
* Expo Go ou emulador Android/iOS

## Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Acesse a pasta
cd fiap-mdi-sprint-ford-vinshare

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

Depois disso:

* escaneie o QR Code com o Expo Go;
* ou pressione:

  * `a` para Android;
  * `i` para iOS.

---

# 🎯 Objetivo Estratégico

O Ford+ foi concebido para atuar diretamente nos principais fatores que impactam o VIN Share:

* aumento da recorrência de manutenção;
* fortalecimento do relacionamento pós-venda;
* fidelização do cliente;
* incentivo ao retorno à rede oficial;
* criação de recorrência digital.

A proposta combina:

* experiência do usuário;
* estratégia de negócio;
* retenção;
* tecnologia mobile;
* gamificação.

---

# 🔮 Próximos Passos

* Backend com Node.js + PostgreSQL;
* Integração real com APIs Ford;
* Push Notifications via FCM/APNs;
* Autenticação biométrica;
* Geolocalização em tempo real;
* Mapa de concessionárias próximas;
* Sistema de diagnósticos inteligentes;
* Inspeção assistida com realidade aumentada (AR).

---

# 👥 Integrantes

| Nome                    | RM        |
| ----------------------- | --------- |
| Milton Cezar Bacanieski | RM 555206 |
| Victório Bastelli       | RM 554723 |
| Lorenzo Mangini         | RM 554901 |
| Vitor Bebiano           | RM 555026 |

---

# 📩 Contato

**Professor responsável:**
[profhercules.ramos@fiap.com.br](mailto:profhercules.ramos@fiap.com.br)

---

<div align="center">

### Ford+ • FIAP x Ford Brasil Challenge 2026

Tecnologia, experiência e fidelização no pós-venda automotivo.

</div>
```
