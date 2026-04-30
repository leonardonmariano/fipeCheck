# 🚗 Quanto Custa Esse Trem?

> Calculadora brasileira de **custo real** de se ter um carro — depreciação, combustível, IPVA, seguro, manutenção e mais, tudo com dados reais da tabela FIPE.

---

## Por que isso existe?

A maioria das pessoas acha que ter um carro custa só combustível + IPVA. A realidade é bem mais assustadora. Um carro popular perde em média **12% do valor por ano** só em depreciação — quase ninguém conta isso no custo mensal.

Essa calculadora mostra o **custo total de propriedade** de qualquer carro listado na tabela FIPE, personalizado para o seu estado, perfil de uso e forma de pagamento.

---

## Funcionalidades

- **Busca FIPE em tempo real** — marca → modelo → ano → preço automático
- **Custo total mensal e anual** com animação de contador
- **7 categorias de custo**: depreciação real (via FIPE do ano anterior), combustível, IPVA por estado, seguro estimado por faixa etária, manutenção, financiamento (Tabela Price) e outros
- **Comparativo com investimento** — gráfico de 10 anos mostrando o custo de oportunidade vs CDI
- **Insights automáticos** gerados a partir do seu perfil de uso
- **Comparar até 3 carros** lado a lado com tabela e gráfico de barras
- **Compartilhar resultado** — link com todos os parâmetros codificados na URL
- **Baixar card** — imagem 1200×630 gerada na borda (Edge runtime) pronta para redes sociais
- Suporte a **dark mode**, responsivo para mobile

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS v4 |
| Componentes | shadcn/ui (Base UI) |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Dados | SWR + FIPE API pública |
| Validação | Zod |
| OG Image | @vercel/og (Edge runtime) |
| Taxa Selic | BCB API (série 11, cache 24h) |

---

## Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/leonardonmariano/fipeCheck.git
cd fipeCheck

# Instale as dependências
npm install

# (Opcional) Configure a URL base para metadatas absolutas
echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" > .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NEXT_PUBLIC_BASE_URL` | URL pública do site (usada no sitemap, OG e robots) | `http://localhost:3000` |

---

## Como os custos são calculados

| Custo | Método |
|-------|--------|
| **Depreciação** | `(FIPE atual − FIPE ano anterior) / FIPE atual`, limitado entre 3% e 40%. Fallback de 12% a.a. se o ano anterior não estiver disponível na API. |
| **Combustível** | `(km/mês ÷ consumo) × preço/L` com preços ANP por estado (abr/2025). Flex: usa etanol se preço < 70% da gasolina. |
| **IPVA** | Taxa estadual (0,5% SC … 4% SP/RJ/MG) aplicada ao valor FIPE ÷ 12. |
| **Seguro** | Estimativa por faixa de valor do veículo e idade do motorista (popular/médio/luxo × jovem/padrão/sênior). |
| **Manutenção** | Revisões, filtros, pneus amortizados com base no valor FIPE e km mensal. |
| **Financiamento** | Tabela Price: `PMT = PV × i / (1 − (1+i)^−n)`. |
| **CDI comparativo** | CDI ≈ Selic × 0,97. Projeção de 10 anos com aporte mensal equivalente ao custo do carro. |

---

## Deploy

O projeto está pronto para deploy no [Vercel](https://vercel.com). Basta conectar o repositório e configurar `NEXT_PUBLIC_BASE_URL` com a URL de produção.

---

## Licença

MIT © [Leonardo Mariano](https://github.com/leonardonmariano)
