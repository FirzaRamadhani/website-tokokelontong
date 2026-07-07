export const addToCart = (product) => {

  const cart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const qty = Math.max(
    1,
    Number(product.qty) || 1
  );

  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {

    existingProduct.qty += qty;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      price: product.promoPrice || product.price,

      imageUrl: product.imageUrl || "",

      category: product.category,

      qty,

    });

  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

};