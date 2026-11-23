# Meus Atendimentos

App para anotar os atendimentos do dia, somar a semana (terça a sábado) e mandar o resumo ou PDF para a chefe.

React + TypeScript + Vite. Login e banco de dados no Supabase (Postgres). Cada pessoa vê só os próprios dados.

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

## Banco de dados (Supabase)

1. Rode `supabase/schema.sql` no SQL Editor do projeto (cria as tabelas e as regras de segurança).
2. A URL e a chave pública (publishable) ficam em `src/services/supabase.ts`. Para outro projeto, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. No primeiro login, os dados que já estavam no aparelho (localStorage) são enviados para a conta, e uma cópia fica em `atendimentos_v1_backup`.

Para trocar de banco, implemente `DataRepository` (`services/storage.ts`) e passe para `<AppDataProvider repository={...}>`.
