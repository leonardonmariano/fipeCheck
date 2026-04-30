import type { CostBreakdown, UsageProfile, SelectedCar } from "@/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Generates 3–4 personalized insight strings based on the user's cost breakdown.
 * Written in first person Brazilian Portuguese for max impact.
 */
export function generateInsights(
  costs: CostBreakdown,
  usage: UsageProfile,
  car: SelectedCar
): string[] {
  const insights: string[] = [];
  const { total, depreciation, fuel, financing, ipva, insurance } = costs;

  // Insight 1: depreciation vs fuel comparison (most impactful)
  if (depreciation.monthly > fuel.monthly * 1.5) {
    const ratio = (depreciation.monthly / fuel.monthly).toFixed(1);
    insights.push(
      `Você gasta ${formatCurrency(depreciation.monthly)}/mês só em depreciação — ${ratio}x mais que combustível. É o custo que ninguém vê.`
    );
  } else {
    insights.push(
      `Depreciação custa ${formatCurrency(depreciation.monthly)}/mês — quase tanto quanto combustível. Esse dinheiro some sem você perceber.`
    );
  }

  // Insight 2: cost per km (tends to shock people)
  insights.push(
    `Cada quilômetro que você roda custa ${formatCurrency(total.costPerKm)}. Na maioria das vezes, o Uber seria mais barato.`
  );

  // Insight 3: financing burden (only if financing enabled)
  if (financing.enabled && financing.totalInterest > 0) {
    const interestFraction = financing.totalInterest / car.fipeData.value;
    insights.push(
      `Você vai pagar ${formatCurrency(financing.totalInterest)} só em juros ao longo do financiamento — ${(interestFraction * 100).toFixed(0)}% do valor do carro.`
    );
  } else {
    // Annual cost shock
    insights.push(
      `Em um ano, você gasta ${formatCurrency(total.annual)} com esse carro. Em 5 anos, isso dá ${formatCurrency(total.annual * 5)}.`
    );
  }

  // Insight 4: IPVA or insurance highlight
  if (ipva.annual > insurance.annual) {
    insights.push(
      `O IPVA no ${car.fipeData.brand} custa ${formatCurrency(ipva.annual)}/ano no ${usage.state}. Se fosse em SC, você pagaria ${formatCurrency(car.fipeData.value * 0.02)}/ano.`
    );
  } else if (insurance.annual > 0) {
    insights.push(
      `O seguro representa ${((insurance.annual / car.fipeData.value) * 100).toFixed(1)}% do valor do carro por ano — ${formatCurrency(insurance.monthly)}/mês.`
    );
  }

  return insights.slice(0, 4);
}
