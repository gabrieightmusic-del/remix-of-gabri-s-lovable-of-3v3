

# Importacao Inteligente de Composicoes (BOM) via Planilha OMIE

## Contexto

A planilha exportada do OMIE possui uma estrutura onde cada linha representa um insumo de um produto acabado. O produto acabado se repete em varias linhas consecutivas, e cada linha traz um item/insumo diferente. O importador atual espera colunas especificas ("Codigo Composicao", "Codigo Produto") que nao correspondem ao formato real.

## Colunas relevantes da planilha OMIE

| Coluna | Uso |
|--------|-----|
| Codigo do Produto | Codigo do Produto Acabado (agrupa a composicao) |
| Descricao do Produto | Nome da composicao |
| Codigo do Item | Codigo do insumo/componente |
| Descricao do Item | Nome do insumo |
| Quantidade do Item | Quantidade necessaria |
| Unidade do Item | Unidade de medida do insumo |

## O que sera implementado

### 1. Novo fluxo de importacao com mapeamento de colunas

Substituir o import direto atual por um fluxo multi-etapa (similar ao `ImportDialog` de produtos):

1. **Upload** - Usuario seleciona o arquivo .xlsx/.xls/.csv
2. **Mapeamento** - Sistema auto-detecta as colunas e permite ajuste manual. Campos mapeados:
   - Codigo do Produto Acabado (obrigatorio)
   - Descricao do Produto Acabado (obrigatorio)
   - Codigo do Item/Insumo (obrigatorio)
   - Descricao do Item/Insumo (obrigatorio)
   - Quantidade do Item
   - Unidade do Item
3. **Preview** - Mostra as composicoes agrupadas com contagem de itens, status (nova/atualizar) e itens nao encontrados no cadastro
4. **Importacao** - Executa a criacao/atualizacao das composicoes

### 2. Logica de agrupamento automatico

O interpretador ira:
- Ler todas as linhas da planilha
- Agrupar por "Codigo do Produto Acabado" (todas as linhas com o mesmo codigo formam UMA composicao)
- Para cada grupo, criar uma composicao com:
  - `code` = Codigo do Produto Acabado
  - `name` = Descricao do Produto Acabado
  - `items` = Lista de todos os insumos do grupo

### 3. Tratamento de itens/insumos

Para cada insumo listado na planilha:
- **Se o produto existe no cadastro**: vincula pelo ID, usa dados do cadastro
- **Se o produto NAO existe**: cria o item na composicao com os dados da planilha (codigo, descricao, quantidade, unidade) e marca visualmente como "produto nao cadastrado" no preview

### 4. Tratamento de composicoes duplicadas

- **Se a composicao ja existe no sistema** (mesmo codigo): marcar como "Atualizar" no preview — ao importar, substitui os itens da composicao existente
- **Se e nova**: marcar como "Nova" no preview

### 5. Auto-deteccao de colunas

O sistema tentara identificar automaticamente as colunas usando palavras-chave:
- `codigo.*produto` ou `cod.*acabado` -> Codigo do Produto Acabado
- `descri.*produto` ou `desc.*acabado` -> Descricao do Produto Acabado
- `codigo.*item` ou `cod.*insumo` -> Codigo do Item
- `descri.*item` ou `desc.*insumo` -> Descricao do Item
- `quantidade` ou `qtd` -> Quantidade
- `unidade.*item` ou `un.*item` -> Unidade

---

## Detalhes Tecnicos

### Arquivo modificado

**`src/pages/Composicoes.tsx`**

- Substituir a funcao `handleImport` (linhas 147-211) por um dialog multi-etapa completo
- Criar componente `CompositionImportDialog` inline ou separado, com os seguintes estados:
  - `upload`: selecao de arquivo
  - `mapping`: mapeamento de colunas com auto-deteccao
  - `preview`: tabela agrupada mostrando composicoes detectadas, quantidade de itens, status (nova/atualizar), e itens sem cadastro
  - `done`: resultado final

### Fluxo de dados

```text
Planilha OMIE
  -> Leitura com XLSX.js
  -> Auto-deteccao de colunas
  -> Mapeamento manual (ajustavel)
  -> Agrupamento por Codigo do Produto Acabado
  -> Para cada grupo:
     -> Busca produto no cadastro (por codigo)
     -> Se existe: vincula productId
     -> Se nao existe: usa dados da planilha (sem productId)
  -> Preview com status nova/atualizar
  -> Importacao: addComposition ou updateComposition
```

### Estrutura do preview

A tela de preview mostrara:

| Composicao | Descricao | Itens | Itens sem cadastro | Status |
|------------|-----------|-------|--------------------|--------|
| 0000000554 | Cir - Controlador De Automacao 3V3 | 42 | 3 | Nova |
| 0000000555 | Outro Produto | 15 | 0 | Atualizar |

Com possibilidade de expandir cada composicao para ver os itens individuais.

