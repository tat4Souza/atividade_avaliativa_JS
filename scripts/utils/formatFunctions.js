export function formatPrice(price) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCategory(category) {
  return category === "opt1" ? "Funcionário Operacional" : "Gerente";
}

export function formatShift(shift) {
  return shift === "opt1"
    ? "Matutino"
    : shift === "opt2"
      ? "Vespertino"
      : "Noturno";
}

export function formatProductInfo(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return "<p>Nenhum produto registrado.</p>";
  }

  return products
    .map(
      (item) => `
        <div>
          <p><strong>Código:</strong> ${item.id}</p>
          <p><strong>Estoque final:</strong> ${item.totalStock}</p>
          <p><strong>Valor investido:</strong> ${formatPrice(item.totalValue)}</p>
        </div>`,
    )
    .join("");
}

export function formatRoomType(type) {
  return type === "opt1" ? "Standard" : type === "opt2" ? "Luxo" : "Premium";
}

export function formatSeason(sea) {
  return sea === "opt1" ? "Baixa" : sea === "opt2" ? "Alta" : "Feriado";
}

function formatPositionName(pos) {
  const dict = {
    opt1: "Goleiro",
    opt2: "Zagueiro",
    opt3: "Meio-Campo",
    opt4: "Atacante",
  };
  return dict[pos];
}

export function formatPlayers(players) {
  if (!Array.isArray(players) || players.length === 0) {
    return "<p>Nenhum jogador registrado.</p>";
  }

  return players
    .map(
      (p) => `
        <div>
          <p><strong>Nome do Jogador:</strong> ${p.name}</p>
          <p><strong>Carga Semanal Total:</strong> ${p.totalLoad}</p>
          <p><strong>Quantidade de Treinos:</strong> ${p.totalWorkouts}</p>
        </div>`,
    )
    .join("");
}

export function formatLoadExtremes(obj) {
  return `
    <p><strong>Nome:</strong> ${obj.name}</p>
    <p><strong>Posição:</strong> ${formatPositionName(obj.position)}</p>
    <p><strong>Número de treinos:</strong> ${obj.totalWorkouts}</p>
  `;
}

export function formatWorkoutType(obj) {
  return `
    <p><strong>Treino Físico:</strong> ${obj.phisic}</p>
    <p><strong>Treino Técnico:</strong> ${obj.technical}</p>
    <p><strong>Treino Estratégico:</strong> ${obj.strategic}</p>
  `;
}

export function formatPosition(obj) {
  return `
    <p><strong>Goleiro</strong></p>
    <ul>
      <li>Total de treinos: ${obj.goalkeeper.total}</li>
      <li>Carga Média: ${obj.goalkeeper.avg}</li>
    </ul>
    <p><strong>Zagueiro</strong></p>
    <ul>
      <li>Total de treinos: ${obj.defender.total}</li>
      <li>Carga Média: ${obj.defender.avg}</li>
    </ul>
    <p><strong>Meio-Campo </strong></p>
    <ul>
      <li>Total de treinos: ${obj.midfielder.total}</li>
      <li>Carga Média: ${obj.midfielder.avg}</li>
    </ul>
    <p><strong>Atacante</strong></p>
    <ul>
      <li>Total de treinos: ${obj.attacker.total}</li>
      <li>Carga Média: ${obj.attacker.avg}</li>
    </ul>
  `;
}

export function formatPerRegion(obj) {
  return `
    <p><strong>Norte:</strong> ${formatPrice(obj.north)}</p>
    <p><strong>Nordeste:</strong> ${formatPrice(obj.northeast)}</p>
    <p><strong>Sudeste:</strong> ${formatPrice(obj.southeast)}</p>
    <p><strong>Sul:</strong> ${formatPrice(obj.south)}</p>
  `;
}

export function formatSalesPerClient(obj) {
  return `
    <p><strong>Pessoa Física:</strong> ${formatPrice(obj.pf)}</p>
    <p><strong>Pessoa Jurídica:</strong> ${formatPrice(obj.pj)}</p>
  `;
}

export function formatMostSalesSeller(obj) {
  return `
    <p><strong>ID Vendedor:</strong> ${obj.sellerId}</p>
    <p><strong>Valor total vendido:</strong> ${formatPrice(obj.totalValue)}</p>
  `;
}

export function formatMostComissionsSeller(obj) {
  return `
    <p><strong>ID Vendedor:</strong> ${obj.sellerId}</p>
    <p><strong>Comissão total acumulada:</strong> ${formatPrice(obj.totalComission)}</p>
  `;
}
