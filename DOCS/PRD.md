# Write the consolidated prompt to a Markdown file for download
content = r"""# Daywin — PRD v0.5 + Instruções de Implementação
**Stack (obrigatório):**
- **Electron (desktop, janela única)** instalado com **Electron Forge** — processo **main** controla DB e RBAC; renderer via **IPC**.
- **React + TypeScript + Tailwind + shadcn/ui** (UI) com **Vite** como bundler.
- **Prisma ORM** (provider **postgresql**) + **PGlite** (Postgres embutido/"psqlite") **via driver adapter** para rodar **100% offline** em arquivo local.
- **Persistência**: arquivo do banco em `app.getPath('userData')/daywin.pglite`.
- **Segurança Electron**: `contextIsolation: true`, renderer **sem Node**.

> Observação: use **Prisma (provider postgresql)** com **adapter para PGlite** no **processo main**. Renderer **não** acessa DB diretamente; apenas via IPC.

---

## Visão
App local-first para **registrar quem trabalhou e quanto deve receber**, com **fechamento configurável**, **RBAC** extensível e **exportações**.  
**Brand:** Daywin — _“Dia trabalhado, pagamento certo.”_

## Escopo (MVP)
1) **Cadastros**: Diaristas, Funções (peso/pontos).  
2) **Lançamentos**: Dias trabalhados (data, horas, **valor da diária**), Bônus, Descontos, **Taxa de serviço** (opcional).  
3) **Regras & Fechamento**: modo de distribuição (pontos×horas | horas | fixo), % da taxa, mínimo de horas, arredondamento; **fechamento** diário/ semanal/ quinzenal (calendário/rolling)/ mensal (calendário/ancorado)/ **custom** → **Prévia** → **Confirmar & Travar** → **Exportar CSV/XLSX** + **Espelhos**.  
4) **RBAC**: papéis/usuários permissões granulares; pronto para criar novos papéis (RH, Financeiro, Auditor etc.).  
5) **Sessão**: login por senha; **logout automático** após **30 min sem atividade**; qualquer atividade reinicia o cronômetro; com atividade, sessão só termina por **logout** ou **fechar o app**.  
6) **Auditoria** + **Backup/Restore** do arquivo do banco.

---

## Modelo de dados (Prisma / Postgres)
Implemente **migrations** Prisma com os modelos abaixo (nomes/colunas fiéis; tipos Postgres em comentários):

- **Funcao** (`funcoes`)  
  - `funcao_id Int @id @default(autoincrement())`  
  - `funcao_nome String`  
  - `peso_pontos Decimal @default("1.00")  // NUMERIC(6,2)`  
  - `ativo Boolean @default(true)`

- **Diarista** (`diaristas`)  
  - `diarista_id Int @id @default(autoincrement())`  
  - `nome_completo String`  
  - `apelido String?` `telefone String?` `email String?`  
  - `funcao_id Int?` → `Funcao? @relation(fields: [funcao_id], references: [funcao_id])`  
  - `pix_tipo String?` `pix_chave String?`  
  - `ativo Boolean @default(true)`

- **DiaTrabalhado** (`dias_trabalhados`)  
  - `lanc_id BigInt @id @default(autoincrement())`  
  - `data DateTime @db.Date`  
  - `diarista_id Int` → `Diarista @relation(fields: [diarista_id], references: [diarista_id])`  
  - `funcao_id Int?` → `Funcao? @relation(fields: [funcao_id], references: [funcao_id])`  
  - `horas_trabalhadas Decimal @default("8.00")  // NUMERIC(6,2)`  
  - `diaria_valor Decimal @default("0.00")      // NUMERIC(12,2)`  
  - `observacoes String?`

- **TaxaServico** (`taxa_servico`)  
  - `taxa_id BigInt @id @default(autoincrement())`  
  - `data DateTime @db.Date`  
  - `referencia String?`  
  - `valor_arrecadado Decimal  // NUMERIC(12,2)`  
  - `observacoes String?`

- **Bonificacao** (`bonificacoes`)  
  - `bonus_id BigInt @id @default(autoincrement())`  
  - `data DateTime @db.Date`  
  - `diarista_id Int` → `Diarista @relation(fields: [diarista_id], references: [diarista_id])`  
  - `valor Decimal          // NUMERIC(12,2)`  
  - `motivo String?`

- **Desconto** (`descontos`)  
  - `desc_id BigInt @id @default(autoincrement())`  
  - `data DateTime @db.Date`  
  - `diarista_id Int` → `Diarista @relation(fields: [diarista_id], references: [diarista_id])`  
  - `valor Decimal          // NUMERIC(12,2)`  
  - `motivo String?`

- **RegrasTaxaServico** (`regras_taxa_servico`) — 1 linha ativa  
  - `regra_id Int @id @default(autoincrement())`  
  - `modo String @default("pontos_funcao")`   // ‘pontos_funcao’ | ‘horas’ | ‘fixo_percentual’  
  - `percentual_para_diaristas Decimal @default("100.00") // NUMERIC(5,2)`  
  - `min_horas_para_eligibilidade Decimal @default("4.00") // NUMERIC(6,2)`  
  - `arredondamento_cinquentavos Boolean @default(false)`

- **Periodo** (`periodos`)  
  - `periodo_id Int @id @default(autoincrement())`  
  - `inicio DateTime @db.Date` `fim DateTime @db.Date`  
  - `status String @default("aberto")` // ‘aberto’ | ‘fechado’  
  - `fechado_em DateTime?` `fechado_por String?` `observacoes String?`  
  - `freq_tipo String` // ‘diario’ | ‘semanal’ | ‘quinzenal’ | ‘mensal’ | ‘custom’  
  - `freq_ancora Json?` `freq_opcao String?`

- **Fechamento** (`fechamentos`)  
  - `fechamento_id BigInt @id @default(autoincrement())`  
  - `periodo_id Int` → `Periodo @relation(fields: [periodo_id], references: [periodo_id])`  
  - `diarista_id Int` → `Diarista @relation(fields: [diarista_id], references: [diarista_id])`  
  - `horas_total Decimal @default("0")` `pontos Decimal @default("0")`  
  - `diarias_total Decimal @default("0")` `bonus_total Decimal @default("0")`  
  - `descontos_total Decimal @default("0")` `cota_taxa Decimal @default("0")`  
  - `total_pagar Decimal @default("0")`  
  - **Índice único**: `(periodo_id, diarista_id)`

- **Auditoria** (`auditoria`)  
  - `audit_id BigInt @id @default(autoincrement())`  
  - `ts DateTime @default(now())`  
  - `usuario String?` `acao String` `entidade String` `entidade_id String?`  
  - `detalhes Json?`

- **Users/Roles/Permissions** (RBAC)  
  - `User(user_id Int @id @default(autoincrement()), name, email?, login @unique, password_hash, active, created_at @default(now()), updated_at @updatedAt)`  
  - `Role(role_id Int @id @default(autoincrement()), role_name @unique, description?)`  
  - `Permission(perm_key String @id, description?)`  
  - `RolePermission(role_id Int, perm_key String, @@id([role_id, perm_key]))`  
  - `UserRole(user_id Int, role_id Int, @@id([user_id, role_id]))`

- **Settings** (`settings`)  
  - `key String @id` `value String`

**Índices por data**: em `dias_trabalhados`, `taxa_servico`, `bonificacoes`, `descontos`.

---

## Regras de negócio (cálculo)
- **Pool taxa** = Σ(`taxa_servico.valor_arrecadado`) no período × `% para diaristas`.
- **Peso padrão** = `pontos_da_funcao × horas_no_período`.
- **Elegível** se `horas_no_período ≥ min_horas`.
- **Cota** = `pool × (peso_individual / Σpesos_eligíveis)`.
- **Total** = `diarias_total + bonus_total + cota_taxa − descontos_total`.
- **Arredondamento**: 2 casas; se **cinquentavos** ativo, arredondar `total` para múltiplos de **R$0,50**.

---

## Sessão (segurança)
- **Login por senha** ao abrir.  
- **Inatividade 30 min** ⇒ **logout automático** (retorna ao login).  
- **Qualquer atividade** (teclado/mouse/foco/navegação/ação) **reinicia** o cronômetro; com atividade recorrente a sessão só termina por **logout** ou **fechar o app**.  
- Auditoria deve registrar: `login`, `logout`, `logout_inatividade`.

**Implementação**: timer no **main**; o **preload** expõe `session.pingActivity()` e o renderer chama em eventos de UI.

---

## RBAC — permissões mínimas
- Cadastros: `diaristas.view|edit|delete`, `funcoes.view|edit|delete`  
- Lançamentos: `dias.view|create|edit|delete`, `bonus.*`, `descontos.*`, `taxa.*`  
- Períodos: `periodos.view|create|close|reopen`  
- Config: `regras.view|edit`, `exports.run`, `backup.restore`, `users.manage`, `audit.view`

**Papéis default**:  
- **Gerente**: todas.  
- **Supervisor**: lançamentos `view/create/edit/delete`, `periodos.view|close`, `exports.run`. Sem `users.manage`, `regras.edit`, `backup.restore`, `periodos.reopen` (por padrão).

---

## IPC (contrato mínimo)
- `auth.login({login, password}) -> {user_id, roles}` | `auth.logout()`  
- `session.pingActivity()`  
- `diaristas.list/create/update/delete`  
- `funcoes.list/create/update/delete`  
- `dias.list/create/update/delete`  
- `bonus.list/create/update/delete`  
- `descontos.list/create/update/delete`  
- `taxa.list/create/update/delete`  
- `regras.get/set`  
- `periodos.list/create/close/reopen`  
- `reports.preview({periodo_id|intervalo}) -> linhas por diarista (horas, pontos, diárias, bônus, descontos, cota, total)`  
- `exports.csv|xlsx({tipo, periodo_id})`  
- `users.list/create/update/disable`  
- `roles.list/create/update/clone`  
- `permissions.list`  
- `audit.list({filtros})`  
- `backup.export()` | `backup.import(filePath)`

> **Checar RBAC no main** antes de executar qualquer handler.

---

## UX (mapa)
- **Dashboard** (período atual): cards (Diárias, Bônus, Descontos, Taxa), Top 5 horas.  
- **Diaristas / Funções** (lista + formulário/edição inline).  
- **Lançamentos**: Dias, Bônus, Descontos, Taxa (grids + “Novo”).  
- **Fechamento**: selecionar/criar período → **Prévia** → **Confirmar & Travar** → exportar CSV/XLSX + **Espelhos**.  
- **Configurações**: frequência + âncoras, regras, arredondamento, **Usuários & Papéis**, **Backup/Restore**, **Política de sessão** (somente leitura).

**shadcn/ui** sugeridos: `Card`, `Table`, `Dialog`, `Form`, `Input`, `Select`, `DatePicker`, `Tabs`, `Toast`, `DropdownMenu`, `Badge`, `Switch`, `Alert`, `Separator`, `Sheet`.

---

## Migrations & Seeds
- Rodar **Prisma migrate** no primeiro boot (ou via “Atualizar banco”).  
- Seeds:  
  - `permissions` completas;  
  - `roles`: Gerente (todas), Supervisor (subset);  
  - Criar **1º usuário admin** no onboarding.

---

## Critérios de aceite
1. Login por senha; **logout automático em 30 min** sem atividade; com atividade, sessão só termina por logout/fechar app.  
2. CRUDs (Diaristas, Funções, Dias, Bônus, Descontos, Taxa) operantes.  
3. **Fechamento** gera snapshots e **trava** período; **sem sobreposição** de fechados.  
4. **Prévia = Fechamento** (valores idênticos; arredondamentos conforme regra).  
5. **Exportações CSV/XLSX** idênticas à tela; **Espelho individual** pronto p/ impressão.  
6. **RBAC** efetivo (bloqueios e mensagens claras).  
7. **Backup/Restore** preserva integridade.

---

## Casos de teste mínimos
- **Sessão**: atividade contínua (sem logout); 30 min idle (logout); minimizar/sleep >30 min (logout ao voltar); auditoria registra `login/logout/logout_inatividade`.  
- **Períodos**: semanal ancorado (seg–dom), quinzenal rolling, mensal ancorado (5→4), custom sem sobreposição.  
- **Taxa**: `%=100`, mínimo 4h; elegíveis vs ineligíveis; arredondamento “cinquentavos”.  
- **RBAC**: Supervisor sem `users.manage` não acessa gestão; `reopen` apenas para quem tem.  
- **Export**: CSV/XLSX batem com a prévia.

---

## Entregáveis
- Projeto **Electron + React** com **shadcn/ui** e **Vite**.  
- **Prisma** configurado (provider `postgresql`) + **adapter PGlite** no **main**; migrations + seeds.  
- **IPC** implementado (contrato acima) + **timer de inatividade (30 min)**.  
- Telas: Dashboard, Cadastros, Lançamentos, Fechamento, Configurações, Usuários & Papéis, Backup.  
- Exportadores CSV/XLSX e Espelho individual.  
- **README** (setup, build, empacotamento Win/macOS/Linux; caminho do DB; backup/restore).

---

### Notas finais para a AI
- **Não usar** chamadas externas. Tudo **local-first**.  
- Priorize **simplicidade**, **tipos fortes** e **tratamento de erro claro** na UI.  
- Padrão visual minimalista: cartões, tabelas limpas, formulários curtos, toasts.  
- Garanta **logs de auditoria** em **todas** as ações relevantes.
"""
path = "/mnt/data/Daywin-PRD-v0.5.md"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
path
