# ESPECIFICAÇÃO DE REQUISITOS DO SISTEMA DE GESTÃO DE ESTOQUE

## 1. IDENTIDADE VISUAL E PADRÕES DE INTERFACE

### 1.1 Design System
- **Paleta de cores:** Preto, branco e laranja
- **Conceito visual:** Transmitir seriedade, confiabilidade, precisão e estabilidade
- **Princípio de usabilidade:** Minimizar digitação livre, priorizando campos selecionáveis (dropdowns, autocomplete, checkboxes, radio buttons)
- **Quando permitir digitação:** Apenas em campos de busca inteligente ou quando tecnicamente indispensável
- **Objetivo:** Garantir padronização e integridade dos dados

---

## 2. MÓDULO DE PRODUTOS

### 2.1 Sistema de Múltiplas Quantidades
**Requisito crítico:** Implementar correlação entre três colunas de quantidade:
1. **Estoque Físico** (inventário real)
2. **Quantidade Mínima** (parâmetro de segurança)
3. **Quantidade OMIE** (integração com sistema externo)

**Funcionalidades dependentes:**
- Geração de alertas automáticos baseados em equações configuráveis
- Relatórios comparativos
- Sugestões de inventário
- Regras de reposição

### 2.2 Gestão de Curva ABC
- Permitir **edição manual** da classificação ABC pelo usuário
- Reclassificação individual de produtos conforme critérios operacionais

### 2.3 Visualização Kanban (Módulo Opcional)
- **Implementação:** Módulo adicional sem substituir visualização principal
- **Cenários configuráveis** com status específicos para cada um
- **Sugestão de cenários** (a definir com desenvolvedor):
  - Fluxo de compras (Cotação → Pedido → Recebimento → Conferência)
  - Ciclo de vida (Ativo → Atenção → Crítico → Obsoleto)
  - Status de endereçamento (Não endereçado → Endereçado → Conferido)

---

## 3. MÓDULO DE ARMAZÉM

### 3.1 Sistema de Endereçamento
**Funções principais:**
- Endereçar produtos importados da rotina de produtos
- **Alertas automáticos:**
  - Produtos não endereçados
  - Endereços com capacidade excedida
  - Mesmo produto em múltiplos locais

**Sugestões inteligentes de endereçamento baseadas em:**
- Tipo/categoria do produto
- Padrões de produtos similares já endereçados
- Configurações predefinidas por tipo de endereço (definidas pelo usuário)

### 3.2 Gestão de Estruturas de Armazenagem
**Importação e configuração:**
- Importar estruturas de estoque via planilha/arquivo
- Nomeação e parametrização personalizável
- Aplicar melhores práticas (templates sugeridos)
- Converter configurações em parâmetros de endereços

**Gerenciamento completo:**
- CRUD de estruturas
- Integração com todas as rotinas do sistema
- Configuração 100% customizável pelo usuário

### 3.3 Projeção de Novos Espaços (Função Avançada)
- Ferramenta para **idealizar e projetar** novos layouts de armazém
- Parametrização baseada em:
  - Opções do usuário
  - Sugestões da aplicação (baseadas em dados existentes)
- Apoio à decisão de expansão/reorganização

---

## 4. MÓDULO DE MOVIMENTAÇÕES

### 4.1 Saídas para Produção com Composições
**Quando finalidade = "Produção":**
- Opção de selecionar **composições de equipamentos**
- Tipos de saída:
  - **Parcial** (alguns itens)
  - **Integral** (todos os itens)
  - **Fracionada** (quantidades customizadas)
- Interface: Checkboxes para seleção múltipla de itens

**Rastreabilidade:**
- Vincular movimentação a produção específica
- Permitir continuidade por qualquer colaborador
- Histórico completo de requisições por produção

### 4.2 Rotina de Composições de Equipamentos
**Implementação sugerida:** Módulo separado (melhor organização)

**Funcionalidades:**
- Importação de planilhas de composições
- Cadastro manual de BOM (Bill of Materials)
- Relacionamento direto com movimentações
- Métricas necessárias para:
  - Baixas automáticas
  - Simulação de produção
  - Análise de consumo

---

## 5. GESTÃO DE COLABORADORES

### 5.1 Evolução do Menu de Colaborador (canto superior direito)
**Manter:** Lógica atual (muito elogiada pelo usuário)

**Adicionar:**
- Inclusão de novos colaboradores
- Edição de informações
- Exclusão (com confirmação)
- **Bloqueio com motivos padronizados:**
  - Férias
  - Atestado médico
  - Afastamento
  - Demissão
  - Licença
  - Outros (campo aberto)

**Lógica de permissões:**
- **Analista de Estoque** = único usuário operador
- Todas movimentações vinculadas a colaborador selecionado
- Centralização de controle em um único perfil

---

## 6. MÓDULO DE INVENTÁRIOS

### 6.1 Funcionalidades Principais
- **Sugestões automáticas** de contagens baseadas em:
  - Curva ABC
  - Tempo desde última contagem
  - Divergências históricas
  - Setores críticos

- **Alertas por setor** específico
- **Cronogramas** de inventários rotativos
- **Acompanhamento** de divergências e ajustes

### 6.2 Flexibilidade de Métodos
Permitir escolha entre:
- **Métodos simples:** Contagem rápida, ajuste manual
- **Métodos intermediários:** Contagem cega, dupla conferência
- **Métodos complexos:** Inventário com rastreabilidade completa, análise de causas

---

## 7. MÓDULO DE ALERTAS

### 7.1 Visualização Kanban
**Colunas sugeridas:**
- Novos
- Em análise
- Ação necessária
- Aguardando terceiros
- Resolvidos

**Benefícios:**
- Priorização visual
- Organização por tipo/urgência
- Acompanhamento do ciclo de tratamento
- Produtividade aumentada

---

## 8. SIMULAÇÃO DE PRODUÇÃO

### 8.1 Funcionalidades
- Seleção de **múltiplas composições** simultaneamente
- **Projeção de consumo** de itens em estoque
- **Identificação de riscos:**
  - Faltas de material
  - Estouro de quantidades mínimas
- **Sugestão de pedidos de compra** (exportável para setor de compras)

---

## 9. SUGESTÃO DE CRONOGRAMA DE IMPLEMENTAÇÃO

### FASE 1 - Fundação (Crítico)
1. Identidade visual e padrões de interface
2. Sistema de múltiplas quantidades (Produtos)
3. Endereçamento básico (Armazém)
4. Gestão de colaboradores

### FASE 2 - Core Business (Essencial)
5. Movimentações com composições
6. Importação de estruturas de armazém
7. Módulo de inventários básico
8. Alertas com Kanban

### FASE 3 - Inteligência (Avançado)
9. Sugestões inteligentes de endereçamento
10. Simulação de produção
11. Kanban de produtos
12. Curva ABC editável

### FASE 4 - Otimização (Diferencial)
13. Projeção de estruturas de armazém
14. Inventários avançados (métodos complexos)
15. Refinamento de sugestões inteligentes

---

## 10. OBSERVAÇÕES TÉCNICAS

- Priorizar **integrações** (OMIE é crítico)
- Garantir **rastreabilidade total** das operações
- Implementar **logs de auditoria** em todas movimentações
- Pensar em **escalabilidade** desde o início
- Considerar **exportações** para Excel/PDF nos relatórios

---

**Essa especificação mantém toda a criatividade original e organiza as ideias de forma profissional para facilitar o desenvolvimento técnico.**
