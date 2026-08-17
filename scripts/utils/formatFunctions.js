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
