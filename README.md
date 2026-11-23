# Meus Atendimentos

App para anotar os atendimentos do dia, somar a semana (terça a sábado) e mandar o resumo ou PDF para a chefe.

React + TypeScript + Vite. Os dados ficam no `localStorage` do aparelho.

## Rodando

```bash
npm install
npm run dev        # desenvolvimento
npm test           # testes das regras de negócio
npm run build      # build de produção em dist/
```

## Arquitetura

```
src/
  domain/      Regras puras (sem React, sem navegador): tipos, datas, dinheiro, somas/agrupamentos. Cobertas por testes.
  services/    Tudo que fala com o "mundo de fora": storage (localStorage), PDF, clipboard.
  state/       Estado global: reducer + contexto. Salva automaticamente via repositório.
  components/  Peças de UI genéricas (Tabs, Toast).
  features/    Uma pasta por tela: week, history, settings.
  styles/      CSS global.
```

Regra de dependência: `features -> state -> services/domain`. O `domain` não importa nada de fora.

Para trocar o armazenamento (ex.: Firebase), implemente `DataRepository` em `services/storage.ts` e passe para `<AppDataProvider repository={...}>`.
